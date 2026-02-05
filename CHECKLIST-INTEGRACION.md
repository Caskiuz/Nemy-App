# ✅ CHECKLIST DE INTEGRACIÓN - DÍA 2

## 🎯 Objetivo
Integrar los middleware de validación en las rutas existentes del sistema.

---

## 📋 Tareas (Estimado: 2 horas)

### Paso 1: Importar Middleware (5 min)

En `server/apiRoutes.ts`, agregar al inicio:

```typescript
import {
  validateBusinessOwnership,
  validateOrderBusinessOwnership,
  validateDriverOrderOwnership,
  validateCustomerOrderOwnership,
} from "./validateOwnership";

import { getAvailableOrdersForDriver } from "./zoneFiltering";
```

---

### Paso 2: Business Endpoints (30 min)

#### 2.1 Actualizar Status de Pedido
```typescript
// Buscar: router.put("/business/orders/:id/status"
// Agregar después de requireRole:
validateOrderBusinessOwnership,
```

#### 2.2 Ver Pedidos del Negocio
```typescript
// Buscar: router.get("/business/:businessId/orders"
// Agregar después de requireRole:
validateBusinessOwnership,
```

#### 2.3 Actualizar Configuración del Negocio
```typescript
// Buscar: router.put("/business/:businessId/settings"
// Agregar después de requireRole:
validateBusinessOwnership,
```

#### 2.4 Gestionar Productos
```typescript
// Buscar: router.post("/business/:businessId/products"
// Agregar después de requireRole:
validateBusinessOwnership,
```

**Checklist:**
- [ ] `/business/orders/:id/status` - PUT
- [ ] `/business/:businessId/orders` - GET
- [ ] `/business/:businessId/settings` - PUT
- [ ] `/business/:businessId/products` - POST, PUT, DELETE

---

### Paso 3: Delivery Endpoints (30 min)

#### 3.1 Actualizar Status de Entrega
```typescript
// Buscar: router.put("/delivery/orders/:id/status"
// Agregar después de requireRole:
validateDriverOrderOwnership,
```

#### 3.2 Aceptar Pedido
```typescript
// Buscar: router.post("/delivery/accept-order/:id"
// NOTA: No agregar validación aquí (pedido aún no asignado)
```

#### 3.3 Completar Entrega
```typescript
// Buscar: router.post("/delivery/complete/:id"
// Agregar después de requireRole:
validateDriverOrderOwnership,
```

#### 3.4 Pedidos Disponibles (REEMPLAZAR)
```typescript
// Buscar: router.get("/delivery/available-orders"
// REEMPLAZAR el contenido con:

router.get("/delivery/available-orders",
  authenticateToken,
  requireRole("delivery_driver"),
  async (req, res) => {
    try {
      const result = await getAvailableOrdersForDriver(req.user!.id);
      res.json(result);
    } catch (error) {
      console.error("Error getting available orders:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to get available orders" 
      });
    }
  }
);
```

**Checklist:**
- [ ] `/delivery/orders/:id/status` - PUT
- [ ] `/delivery/complete/:id` - POST
- [ ] `/delivery/available-orders` - GET (REEMPLAZADO)
- [ ] `/delivery/orders/:id` - GET

---

### Paso 4: Customer Endpoints (20 min)

#### 4.1 Ver Pedido Individual
```typescript
// Buscar: router.get("/orders/:id"
// Agregar después de authenticateToken:
validateCustomerOrderOwnership,
```

#### 4.2 Cancelar Pedido
```typescript
// Buscar: router.post("/orders/:id/cancel"
// Agregar después de authenticateToken:
validateCustomerOrderOwnership,
```

**Checklist:**
- [ ] `/orders/:id` - GET
- [ ] `/orders/:id/cancel` - POST
- [ ] `/orders/:id/review` - POST

---

### Paso 5: Testing Manual (30 min)

#### Test 1: Business Owner
```bash
# Intentar modificar pedido de otro negocio
curl -X PUT http://localhost:5000/api/business/orders/ORDER_ID/status \
  -H "Authorization: Bearer BUSINESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "confirmed"}'

# Esperado: 403 Forbidden
```

#### Test 2: Repartidor
```bash
# Intentar modificar pedido no asignado
curl -X PUT http://localhost:5000/api/delivery/orders/ORDER_ID/status \
  -H "Authorization: Bearer DRIVER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "picked_up"}'

# Esperado: 403 Forbidden
```

#### Test 3: Cliente
```bash
# Intentar ver pedido de otro cliente
curl -X GET http://localhost:5000/api/orders/OTHER_ORDER_ID \
  -H "Authorization: Bearer CUSTOMER_TOKEN"

# Esperado: 403 Forbidden
```

#### Test 4: Pedidos por Zona
```bash
# Ver pedidos disponibles (solo en zona de 10km)
curl -X GET http://localhost:5000/api/delivery/available-orders \
  -H "Authorization: Bearer DRIVER_TOKEN"

# Esperado: Solo pedidos cercanos, ordenados por distancia
```

**Checklist:**
- [ ] Business owner no puede modificar pedidos ajenos
- [ ] Repartidor no puede modificar pedidos no asignados
- [ ] Cliente no puede ver pedidos ajenos
- [ ] Repartidores solo ven pedidos en su zona
- [ ] Admin puede acceder a todo

---

### Paso 6: Verificación de Logs (10 min)

Revisar que los logs muestren:
- ✅ Intentos de acceso no autorizado
- ✅ Validaciones exitosas
- ✅ Errores con contexto suficiente

```bash
# Ver logs del servidor
tail -f logs/server.log

# Buscar errores de validación
findstr /i "403" logs/server.log
findstr /i "ownership" logs/server.log
```

**Checklist:**
- [ ] Logs muestran intentos de acceso no autorizado
- [ ] Logs incluyen userId y recurso intentado
- [ ] No hay información sensible en logs

---

## 🚨 Problemas Comunes

### Error: "Cannot read property 'id' of undefined"
**Causa:** `req.user` no está definido  
**Solución:** Verificar que `authenticateToken` está antes del middleware

### Error: "Business not found"
**Causa:** ID de negocio incorrecto en params  
**Solución:** Verificar que el endpoint usa `:businessId` o `:id` correctamente

### Error: "Driver location not available"
**Causa:** Repartidor no ha actualizado su ubicación  
**Solución:** Agregar endpoint para actualizar ubicación del repartidor

---

## 📊 Métricas de Éxito

Al finalizar, deberías tener:
- ✅ 0 referencias a `orders.driverId` o `orders.customerId`
- ✅ Todos los endpoints de business con validación
- ✅ Todos los endpoints de delivery con validación
- ✅ Todos los endpoints de customer con validación
- ✅ Pedidos filtrados por zona geográfica
- ✅ Tests manuales pasando

---

## 🎯 Siguiente Paso

Después de completar esta integración:
- **Día 3:** Validación de transiciones de estado
- **Día 4:** Periodo de arrepentimiento (60s)
- **Día 5:** Tests automatizados

---

**Tiempo estimado:** 2 horas  
**Prioridad:** 🔴 CRÍTICA  
**Bloqueadores:** Ninguno
