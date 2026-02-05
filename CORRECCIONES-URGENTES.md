# 🔧 CORRECCIONES URGENTES - SISTEMA NEMY

## 🔴 CRÍTICO 1: Corregir Nombres de Campos

### Problema
El schema define `deliveryPersonId` y `userId`, pero el código usa `driverId` y `customerId` que NO EXISTEN.

### Archivos Afectados
- `server/apiRoutes.ts`
- `server/financeService.ts`
- `server/driverAssignment.ts`

### Correcciones Necesarias

#### 1. En `server/apiRoutes.ts`

**Línea ~2850 - Get delivery orders:**
```typescript
// ❌ ANTES:
const [order] = await db.select().from(orders).where(eq(orders.id, req.params.orderId)).limit(1);
if (!order || !order.driverId) {  // ❌ driverId no existe
  return res.json({ latitude: null, longitude: null });
}
const [driver] = await db.select().from(users).where(eq(users.id, order.driverId)).limit(1);

// ✅ DESPUÉS:
const [order] = await db.select().from(orders).where(eq(orders.id, req.params.orderId)).limit(1);
if (!order || !order.deliveryPersonId) {  // ✅ Correcto
  return res.json({ latitude: null, longitude: null });
}
const [driver] = await db.select().from(users).where(eq(users.id, order.deliveryPersonId)).limit(1);
```

**Línea ~3100 - Admin dashboard active orders:**
```typescript
// ❌ ANTES:
const customer = await db
  .select({ id: users.id, name: users.name })
  .from(users)
  .where(eq(users.id, order.customerId))  // ❌ customerId no existe
  .limit(1);

// ✅ DESPUÉS:
const customer = await db
  .select({ id: users.id, name: users.name })
  .from(users)
  .where(eq(users.id, order.userId))  // ✅ Correcto
  .limit(1);
```

**Línea ~3500 - Complete delivery:**
```typescript
// ❌ ANTES:
await db.insert(transactions).values([
  {
    userId: order.businessId,
    type: "order_payment",
    amount: commissions.business,
    orderId: order.id,
  },
  {
    userId: order.deliveryPersonId,  // ✅ Este está correcto
    type: "delivery_payment",
    amount: commissions.driver,
    orderId: order.id,
  },
]);
```

#### 2. En `server/financeService.ts`

**Línea ~120 - Get driver metrics:**
```typescript
// ❌ ANTES:
const driverOrders = await db
  .select()
  .from(orders)
  .where(eq(orders.driverId, driverId));  // ❌ driverId no existe

// ✅ DESPUÉS:
const driverOrders = await db
  .select()
  .from(orders)
  .where(eq(orders.deliveryPersonId, driverId));  // ✅ Correcto
```

---

## 🔴 CRÍTICO 2: Validar Ownership en Business Endpoints

### Problema
Business owners pueden modificar pedidos de otros negocios.

### Corrección en `server/apiRoutes.ts`

**Línea ~2650 - Update order status (Business):**
```typescript
// ❌ ANTES:
router.put("/business/orders/:id/status",
  authenticateToken,
  requireRole("business_owner"),
  async (req, res) => {
    const { status } = req.body;
    
    // Obtiene el pedido
    const order = await db
      .select()
      .from(orders)
      .where(eq(orders.id, req.params.id))
      .limit(1);

    if (!order[0]) {
      return res.status(404).json({ error: "Order not found" });
    }

    // ❌ FALTA: Validar que el pedido pertenece a un negocio del owner
    
    await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, req.params.id));
});

// ✅ DESPUÉS:
router.put("/business/orders/:id/status",
  authenticateToken,
  requireRole("business_owner"),
  async (req, res) => {
    const { status } = req.body;
    
    // ✅ PRIMERO: Verificar que el negocio pertenece al owner
    const ownerBusinesses = await db
      .select({ id: businesses.id })
      .from(businesses)
      .where(eq(businesses.ownerId, req.user!.id));

    if (ownerBusinesses.length === 0) {
      return res.status(403).json({ error: "No businesses found" });
    }

    const businessIds = ownerBusinesses.map(b => b.id);

    // ✅ SEGUNDO: Obtener el pedido
    const order = await db
      .select()
      .from(orders)
      .where(eq(orders.id, req.params.id))
      .limit(1);

    if (!order[0]) {
      return res.status(404).json({ error: "Order not found" });
    }

    // ✅ TERCERO: Validar ownership
    if (!businessIds.includes(order[0].businessId)) {
      return res.status(403).json({ 
        error: "Order does not belong to your business" 
      });
    }

    // ✅ CUARTO: Validar transición de estado
    const { validateStateTransition, validateRoleCanChangeToState } = 
      await import("./orderStateValidation");
    
    const roleValidation = validateRoleCanChangeToState("business_owner", status);
    if (!roleValidation.valid) {
      return res.status(403).json({ error: roleValidation.error });
    }

    const transitionValidation = validateStateTransition(order[0].status, status);
    if (!transitionValidation.valid) {
      return res.status(400).json({ error: transitionValidation.error });
    }

    // ✅ QUINTO: Actualizar
    await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, req.params.id));

    res.json({ success: true, message: "Order status updated" });
});
```

---

## 🔴 CRÍTICO 3: Validar Ownership en Driver Endpoints

### Problema
Repartidores pueden modificar pedidos no asignados a ellos.

### Corrección en `server/apiRoutes.ts`

**Línea ~2900 - Update order status (Driver):**
```typescript
// ❌ ANTES:
router.put("/delivery/orders/:id/status",
  authenticateToken,
  async (req, res) => {
    const { status } = req.body;

    // Obtiene el pedido
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, req.params.id))
      .limit(1);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // ❌ FALTA: Validar que el pedido está asignado a este repartidor
    
    await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, req.params.id));
});

// ✅ DESPUÉS:
router.put("/delivery/orders/:id/status",
  authenticateToken,
  requireRole("delivery_driver"),
  async (req, res) => {
    const { status } = req.body;

    // ✅ PRIMERO: Obtener el pedido
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, req.params.id))
      .limit(1);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // ✅ SEGUNDO: Validar ownership
    if (order.deliveryPersonId !== req.user!.id) {
      return res.status(403).json({ 
        error: "This order is not assigned to you" 
      });
    }

    // ✅ TERCERO: Validar transición de estado
    const { validateStateTransition, validateRoleCanChangeToState } = 
      await import("./orderStateValidation");
    
    const roleValidation = validateRoleCanChangeToState("delivery_driver", status);
    if (!roleValidation.valid) {
      return res.status(403).json({ error: roleValidation.error });
    }

    const transitionValidation = validateStateTransition(order.status, status);
    if (!transitionValidation.valid) {
      return res.status(400).json({ error: transitionValidation.error });
    }

    // ✅ CUARTO: Actualizar
    await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, req.params.id));

    res.json({ success: true, message: "Status updated" });
});
```

---

## 🟡 MEDIO 1: Filtrar Pedidos Disponibles por Zona

### Problema
Repartidores ven TODOS los pedidos disponibles, incluso fuera de su zona.

### Corrección en `server/apiRoutes.ts`

**Línea ~2800 - Get available orders:**
```typescript
// ❌ ANTES:
router.get("/delivery/available-orders",
  authenticateToken,
  async (req, res) => {
    const availableOrders = await db
      .select()
      .from(orders)
      .where(
        or(
          eq(orders.status, "confirmed"),
          eq(orders.status, "ready"),
          eq(orders.status, "preparing")
        )
      );

    // ❌ Devuelve TODOS los pedidos sin filtrar por zona
    const unassignedOrders = availableOrders.filter(
      order => !order.deliveryPersonId
    );

    res.json({ success: true, orders: unassignedOrders });
});

// ✅ DESPUÉS:
router.get("/delivery/available-orders",
  authenticateToken,
  requireRole("delivery_driver"),
  async (req, res) => {
    // ✅ PRIMERO: Obtener ubicación del repartidor
    const [driver] = await db
      .select({
        latitude: deliveryDrivers.currentLatitude,
        longitude: deliveryDrivers.currentLongitude,
      })
      .from(deliveryDrivers)
      .where(eq(deliveryDrivers.userId, req.user!.id))
      .limit(1);

    if (!driver?.latitude || !driver?.longitude) {
      return res.json({ 
        success: false, 
        error: "Driver location not available",
        orders: [] 
      });
    }

    const driverLat = parseFloat(driver.latitude);
    const driverLng = parseFloat(driver.longitude);

    // ✅ SEGUNDO: Obtener pedidos disponibles
    const availableOrders = await db
      .select()
      .from(orders)
      .where(
        or(
          eq(orders.status, "confirmed"),
          eq(orders.status, "ready"),
          eq(orders.status, "preparing")
        )
      );

    // ✅ TERCERO: Filtrar por zona (radio de 10km)
    const MAX_DISTANCE_KM = 10;
    const ordersInZone = [];

    for (const order of availableOrders) {
      // Skip si ya tiene repartidor
      if (order.deliveryPersonId) continue;

      // Obtener ubicación del negocio
      const [business] = await db
        .select({
          latitude: businesses.latitude,
          longitude: businesses.longitude,
        })
        .from(businesses)
        .where(eq(businesses.id, order.businessId))
        .limit(1);

      if (!business?.latitude || !business?.longitude) continue;

      const businessLat = parseFloat(business.latitude);
      const businessLng = parseFloat(business.longitude);

      // Calcular distancia
      const distance = calculateDistance(
        driverLat, driverLng, 
        businessLat, businessLng
      );

      if (distance <= MAX_DISTANCE_KM) {
        ordersInZone.push({
          ...order,
          distance: Math.round(distance * 100) / 100, // 2 decimales
          estimatedPickupTime: Math.ceil(distance * 3), // 3 min por km
        });
      }
    }

    // ✅ CUARTO: Ordenar por distancia (más cercano primero)
    ordersInZone.sort((a, b) => a.distance - b.distance);

    res.json({ 
      success: true, 
      orders: ordersInZone,
      driverLocation: { latitude: driverLat, longitude: driverLng }
    });
});

// ✅ Función helper para calcular distancia
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
```

---

## 🟡 MEDIO 2: Centralizar Cálculos de Comisiones

### Problema
Cálculos de comisiones duplicados en múltiples archivos.

### Solución: Usar SOLO `unifiedFinancialService.ts`

**En `server/apiRoutes.ts` - Reemplazar cálculos inline:**
```typescript
// ❌ ANTES:
const platformCommission = Math.round(totalRevenue * 0.15);
const businessPayouts = Math.round(totalRevenue * 0.70);
const driverPayouts = Math.round(totalRevenue * 0.15);

// ✅ DESPUÉS:
const { financialService } = await import("./unifiedFinancialService");
const commissions = await financialService.calculateCommissions(totalRevenue);
// commissions = { platform: 15%, business: 70%, driver: 15% }
```

**En `server/commissionService.ts` - Usar servicio unificado:**
```typescript
// ❌ ANTES:
const rates = await financialService.getCommissionRates();
const platformAmount = payment.amount * rates.platform;
const businessAmount = payment.amount * rates.business;
const driverAmount = payment.amount * rates.driver;

// ✅ DESPUÉS:
const { financialService } = await import("./unifiedFinancialService");
const commissions = await financialService.calculateCommissions(payment.amount);
```

---

## 📝 CHECKLIST DE IMPLEMENTACIÓN

### Día 1: Correcciones Críticas
- [ ] Buscar y reemplazar `orders.driverId` → `orders.deliveryPersonId`
- [ ] Buscar y reemplazar `orders.customerId` → `orders.userId`
- [ ] Probar que queries funcionan correctamente
- [ ] Validar ownership en `/business/orders/:id/status`
- [ ] Validar ownership en `/delivery/orders/:id/status`

### Día 2: Validaciones de Estado
- [ ] Agregar `validateStateTransition()` en todos los cambios de estado
- [ ] Agregar `validateRoleCanChangeToState()` en todos los endpoints
- [ ] Probar transiciones inválidas (deben fallar)

### Día 3: Filtrado por Zona
- [ ] Implementar filtrado de pedidos por zona para repartidores
- [ ] Agregar función `calculateDistance()`
- [ ] Probar que solo se muestran pedidos cercanos

### Día 4: Centralización Financiera
- [ ] Reemplazar cálculos inline con `financialService`
- [ ] Eliminar código duplicado
- [ ] Validar que comisiones son consistentes

### Día 5: Testing
- [ ] Test: Business owner no puede modificar pedidos ajenos
- [ ] Test: Repartidor no puede modificar pedidos no asignados
- [ ] Test: Transiciones de estado inválidas fallan
- [ ] Test: Comisiones suman 100%

---

## 🚀 COMANDOS ÚTILES

### Buscar y Reemplazar
```bash
# En Windows (PowerShell):
Get-ChildItem -Path "server" -Filter "*.ts" -Recurse | 
  ForEach-Object {
    (Get-Content $_.FullName) -replace 'orders\.driverId', 'orders.deliveryPersonId' | 
    Set-Content $_.FullName
  }

# Verificar cambios:
git diff server/
```

### Probar Endpoints
```bash
# Test: Business owner intenta modificar pedido ajeno
curl -X PUT http://localhost:5000/api/business/orders/ORDER_ID/status \
  -H "Authorization: Bearer BUSINESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "confirmed"}'
# Debe devolver 403 Forbidden

# Test: Repartidor intenta modificar pedido no asignado
curl -X PUT http://localhost:5000/api/delivery/orders/ORDER_ID/status \
  -H "Authorization: Bearer DRIVER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "picked_up"}'
# Debe devolver 403 Forbidden
```

---

**Última actualización:** 2025-01-XX  
**Prioridad:** 🔴 CRÍTICA - Implementar antes de producción
