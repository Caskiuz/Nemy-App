# 🔍 ANÁLISIS COMPLETO DEL FLUJO Y ROLES - SISTEMA NEMY

**Fecha:** 2025-01-XX  
**Analista:** Amazon Q  
**Alcance:** Revisión completa de flujos, roles y lógica del sistema

---

## 📊 RESUMEN EJECUTIVO

### ✅ Aspectos Positivos
- Sistema de roles bien definido (customer, business_owner, delivery_driver, admin, super_admin)
- Validación de transiciones de estado implementada
- Middleware de autenticación robusto
- Sistema de comisiones centralizado
- Auditoría de acciones críticas

### ⚠️ PROBLEMAS CRÍTICOS ENCONTRADOS

#### 🔴 **CRÍTICO 1: Inconsistencia en Nombres de Campos**
**Ubicación:** `schema-mysql.ts` vs `apiRoutes.ts`

**Problema:**
```typescript
// Schema define:
orders.deliveryPersonId  // ✅ Correcto

// Pero en código se usa:
orders.driverId          // ❌ NO EXISTE
orders.customerId        // ❌ NO EXISTE (debe ser userId)
```

**Impacto:** 
- Queries fallan silenciosamente
- Métricas de repartidores incorrectas
- Asignación de pedidos puede fallar

**Solución:**
```typescript
// Reemplazar TODAS las referencias:
orders.driverId → orders.deliveryPersonId
orders.customerId → orders.userId
```

---

#### 🔴 **CRÍTICO 2: Roles Excediendo Capacidades**

**Problema:** Repartidores pueden ver pedidos de otros repartidores

**Ubicación:** `apiRoutes.ts` línea ~2850
```typescript
// ❌ INSEGURO - No valida ownership
router.get("/delivery/orders", authenticateToken, async (req, res) => {
  const driverOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.deliveryPersonId, req.user!.id)); // ✅ Correcto
    
  const availableOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.status, "ready")); // ❌ Muestra TODOS los pedidos
});
```

**Solución:**
```typescript
// Filtrar pedidos disponibles por zona del repartidor
const availableOrders = allReadyOrders.filter(
  order => !order.deliveryPersonId && isInDriverZone(order, driver)
);
```

---

#### 🔴 **CRÍTICO 3: Business Owner Puede Modificar Pedidos de Otros Negocios**

**Ubicación:** `apiRoutes.ts` línea ~2650
```typescript
router.put("/business/orders/:id/status", 
  authenticateToken,
  requireRole("business_owner"),
  async (req, res) => {
    // ❌ FALTA: Verificar que el pedido pertenece al negocio del owner
    const ownerBusinesses = await db
      .select({ id: businesses.id })
      .from(businesses)
      .where(eq(businesses.ownerId, req.user!.id));
    
    // ✅ Valida ownership DESPUÉS de obtener el pedido
    if (!businessIds.includes(order[0].businessId)) {
      return res.status(403).json({ error: "Order does not belong to your business" });
    }
});
```

**Riesgo:** Un business owner malicioso podría:
- Cancelar pedidos de competidores
- Cambiar estados de pedidos ajenos
- Ver información confidencial

---

#### 🟡 **MEDIO 1: Flujo de Estados Inconsistente**

**Problema:** Estados de pedidos no siguen el flujo definido

**Estados Definidos:**
```typescript
pending → confirmed → preparing → ready → picked_up → on_the_way → delivered
```

**Pero en código:**
```typescript
// apiRoutes.ts línea ~2800
router.post("/delivery/accept-order/:id", async (req, res) => {
  await db.update(orders).set({
    deliveryPersonId: req.user!.id,
    status: "picked_up", // ❌ Salta de "ready" a "picked_up" sin validación
  });
});
```

**Solución:** Usar `validateStateTransition()` en TODOS los cambios de estado

---

#### 🟡 **MEDIO 2: Sistema de Comisiones Duplicado**

**Problema:** Lógica de comisiones en múltiples lugares

**Ubicaciones:**
1. `commissionService.ts` - Cálculo de comisiones
2. `paymentService.ts` - Distribución de pagos
3. `financeService.ts` - Métricas financieras
4. `apiRoutes.ts` - Cálculos inline (línea ~3200)

**Riesgo:**
- Inconsistencias en porcentajes (15% vs 0.15)
- Cálculos duplicados pueden divergir
- Difícil mantener cambios

**Solución:** Centralizar en `unifiedFinancialService.ts` (ya existe pero no se usa consistentemente)

---

## 🔄 ANÁLISIS DE FLUJO COMPLETO

### 1️⃣ **FLUJO DE PEDIDO (Cliente → Entrega)**

#### ✅ Flujo Correcto:
```
1. Cliente crea pedido → status: "pending"
2. Sistema valida pago
3. Negocio confirma → status: "confirmed"
4. Negocio prepara → status: "preparing"
5. Pedido listo → status: "ready"
6. Repartidor acepta → status: "picked_up"
7. Repartidor en camino → status: "on_the_way"
8. Entregado → status: "delivered"
9. Fondos liberados → Comisiones distribuidas
```

#### ❌ Problemas Encontrados:

**A. Periodo de Arrepentimiento (60 segundos)**
```typescript
// ❌ NO IMPLEMENTADO en frontend
regretPeriodEndsAt: timestamp("regret_period_ends_at")
```
**Impacto:** Cliente no puede cancelar en 60s como se prometió

**B. Llamada Automática al Negocio**
```typescript
// ❌ Parcialmente implementado
callAttempted: boolean("call_attempted")
callAttemptedAt: timestamp("call_attempted_at")
```
**Impacto:** Sistema no llama automáticamente si negocio no responde

**C. Asignación Automática de Repartidor**
```typescript
// ✅ Implementado en driverAssignment.ts
export async function autoAssignDriver(orderId: string)
```
**Estado:** Funcional pero no se llama automáticamente

---

### 2️⃣ **FLUJO DE PAGOS**

#### ✅ Arquitectura Correcta:
```
1. Cliente paga con Stripe → PaymentIntent
2. Fondos retenidos por plataforma
3. Al entregar → Distribución:
   - 15% Plataforma
   - 70% Negocio (pendiente 1 hora anti-fraude)
   - 15% Repartidor (inmediato)
```

#### ❌ Problemas:

**A. Pago en Efectivo No Validado**
```typescript
// Schema tiene campos:
cashPaymentAmount: int("cash_payment_amount")
cashChangeAmount: int("cash_change_amount")

// ❌ Pero no hay validación de que el repartidor recibió el efectivo
```

**B. Reembolsos Sin Implementar**
```typescript
refundAmount: int("refund_amount")
refundStatus: text("refund_status")

// ❌ No hay endpoint para procesar reembolsos
```

---

### 3️⃣ **FLUJO DE ROLES Y PERMISOS**

#### ✅ Roles Definidos Correctamente:

| Rol | Puede Ver | Puede Modificar |
|-----|-----------|-----------------|
| **customer** | Sus pedidos | Cancelar (60s) |
| **business_owner** | Pedidos de sus negocios | Confirmar, preparar, ready |
| **delivery_driver** | Pedidos asignados | picked_up, on_the_way, delivered |
| **admin** | Todo | Todo |

#### ❌ Violaciones Encontradas:

**A. Business Owner - Exceso de Permisos**
```typescript
// ❌ Puede ver TODOS los negocios
router.get("/businesses", async (req, res) => {
  const allBusinesses = await db.select().from(businesses);
  // No filtra por ownerId
});
```

**B. Delivery Driver - Falta Validación de Zona**
```typescript
// ❌ Puede aceptar pedidos fuera de su zona
router.post("/delivery/accept-order/:id", async (req, res) => {
  // No valida si el pedido está en zona del repartidor
});
```

**C. Admin - Puede Cambiar Roles Sin Restricción**
```typescript
// ⚠️ Admin puede hacer a cualquiera super_admin
router.put("/admin/users/:id/role", 
  requireRole("admin", "super_admin"),
  // ❌ Debería requerir solo super_admin para crear admins
);
```

---

## 🛡️ ANÁLISIS DE SEGURIDAD

### ✅ Implementado Correctamente:
- JWT con expiración
- Rate limiting por usuario
- Auditoría de acciones críticas
- Validación de teléfono verificado
- Hashing de contraseñas (bcrypt)

### ❌ Vulnerabilidades:

#### 1. **SQL Injection Potencial**
```typescript
// ⚠️ Uso de sql`` sin sanitización
await db.execute(sql`
  INSERT INTO delivery_zones (id, name) VALUES
  (${zoneId}, ${name})  // ❌ Si name viene de usuario sin validar
`);
```

#### 2. **IDOR (Insecure Direct Object Reference)**
```typescript
// ❌ No valida ownership antes de actualizar
router.put("/users/:id", authenticateToken, async (req, res) => {
  // Valida DESPUÉS de obtener datos
  if (String(req.user!.id) !== userId && req.user!.role !== 'admin') {
    return res.status(403).json({ error: "No tienes permiso" });
  }
});
```

#### 3. **Exposición de Información Sensible**
```typescript
// ❌ Devuelve datos sensibles en errores
catch (error: any) {
  res.status(500).json({ error: error.message }); // Puede exponer stack traces
}
```

---

## 📋 RECOMENDACIONES PRIORITARIAS

### 🔴 **URGENTE (Implementar YA)**

1. **Corregir Nombres de Campos**
   ```bash
   # Buscar y reemplazar en todo el proyecto:
   orders.driverId → orders.deliveryPersonId
   orders.customerId → orders.userId
   ```

2. **Validar Ownership en TODOS los Endpoints**
   ```typescript
   // Agregar middleware:
   export function validateBusinessOwnership(req, res, next) {
     const { businessId } = req.params;
     const ownerId = req.user.id;
     // Validar que businessId pertenece a ownerId
   }
   ```

3. **Implementar Periodo de Arrepentimiento**
   ```typescript
   // En frontend: Mostrar countdown de 60s
   // En backend: Validar que no pasaron 60s antes de confirmar
   ```

### 🟡 **IMPORTANTE (Esta Semana)**

4. **Centralizar Cálculos Financieros**
   - Usar solo `unifiedFinancialService.ts`
   - Eliminar cálculos inline

5. **Implementar Zonas de Entrega**
   - Validar que repartidor está en zona
   - Filtrar pedidos disponibles por zona

6. **Agregar Validación de Estados**
   - Usar `validateStateTransition()` en TODOS los cambios
   - Registrar intentos de transiciones inválidas

### 🟢 **MEJORAS (Este Mes)**

7. **Sistema de Reembolsos**
8. **Validación de Pago en Efectivo**
9. **Llamadas Automáticas a Negocios**
10. **Dashboard de Métricas en Tiempo Real**

---

## 🧪 CASOS DE PRUEBA RECOMENDADOS

### Test 1: Validación de Roles
```typescript
// ❌ Debe fallar:
- Business Owner intenta modificar pedido de otro negocio
- Repartidor intenta ver pedidos de otro repartidor
- Cliente intenta cancelar después de 60s

// ✅ Debe pasar:
- Admin puede modificar cualquier pedido
- Business Owner puede ver solo sus negocios
- Repartidor solo ve pedidos en su zona
```

### Test 2: Flujo de Estados
```typescript
// ❌ Debe fallar:
- Cambiar de "pending" a "delivered" directamente
- Repartidor cambia estado sin estar asignado
- Negocio cambia a "picked_up" (solo repartidor)

// ✅ Debe pasar:
- Flujo completo: pending → confirmed → ... → delivered
- Cancelación en cualquier estado antes de "picked_up"
```

### Test 3: Comisiones
```typescript
// Validar que:
- Total = Subtotal + DeliveryFee
- Plataforma = Total * 0.15
- Negocio = Total * 0.70
- Repartidor = Total * 0.15
- Suma = Total (sin pérdidas por redondeo)
```

---

## 📈 MÉTRICAS DE CALIDAD

| Aspecto | Estado | Calificación |
|---------|--------|--------------|
| Arquitectura | ✅ Buena | 8/10 |
| Seguridad | ⚠️ Mejorable | 6/10 |
| Validaciones | ❌ Insuficiente | 4/10 |
| Consistencia | ⚠️ Problemas | 5/10 |
| Documentación | ✅ Buena | 7/10 |
| **TOTAL** | **⚠️ REQUIERE MEJORAS** | **6/10** |

---

## 🎯 CONCLUSIÓN

El sistema NEMY tiene una **arquitectura sólida** y **roles bien definidos**, pero presenta **problemas críticos de validación y consistencia** que deben corregirse antes de producción.

### Prioridades:
1. ✅ Corregir nombres de campos (1 día)
2. ✅ Validar ownership en endpoints (2 días)
3. ✅ Implementar periodo de arrepentimiento (1 día)
4. ✅ Centralizar cálculos financieros (2 días)
5. ✅ Agregar tests de roles y permisos (3 días)

**Tiempo estimado para correcciones críticas:** 1-2 semanas

---

**Generado por:** Amazon Q Code Review  
**Última actualización:** 2025-01-XX
