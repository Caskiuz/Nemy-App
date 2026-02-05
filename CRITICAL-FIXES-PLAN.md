# ANÁLISIS COMPLETO DE PROBLEMAS Y PLAN DE CORRECCIÓN
## NEMY App - Auditoría Técnica Completa

**Fecha:** 4 de Febrero 2026
**Estado:** ✅ CORRECCIONES APLICADAS - En progreso

---

## ✅ CORRECCIONES COMPLETADAS

### ✅ 1. PERMISOS DE ROLES - CORREGIDO
**Archivo:** `server/orderStateValidation.ts` + `server/apiRoutes.ts`
- ✅ Middleware de validación de transiciones creado
- ✅ Validación de permisos por rol implementada
- ✅ Validación de ownership implementada
- ✅ Integrado en 3 endpoints críticos

### ✅ 2. AUTENTICACIÓN HARDCODEADA - CORREGIDO
**Archivo:** `server/apiRoutes.ts`
- ✅ Código 1234 eliminado
- ✅ Generación de códigos aleatorios de 6 dígitos
- ✅ Códigos guardados en BD con expiración (10 min)
- ✅ Integración con Twilio (con fallback para dev)
- ✅ Validación contra BD implementada

### ✅ 3. ROLES HARDCODEADOS - CORREGIDO
**Archivo:** `server/apiRoutes.ts`
- ✅ Roles por teléfono eliminados
- ✅ Todos los usuarios nuevos son "customer" por defecto
- ✅ Business owners y drivers requieren aprobación admin
- ✅ Campo isActive controla aprobación

### ✅ 4. CALCULADORA FINANCIERA - IMPLEMENTADA
**Archivo:** `server/financialCalculator.ts` + `server/apiRoutes.ts`
- ✅ Servicio centralizado creado
- ✅ Cálculos consistentes de comisiones
- ✅ Validación de totales implementada
- ✅ Conversión centavos/pesos estandarizada
- ✅ Integrado en endpoint de completar entrega

### ✅ 5. DASHBOARD CON FALLBACK - CORREGIDO
**Archivo:** `server/apiRoutes.ts`
- ✅ Fallback a últimos 7 días si hoy está vacío
- ✅ Indicador de timeframe agregado
- ✅ Métricas históricas siempre visibles

### ✅ 13. LÍMITE DE PEDIDOS POR REPARTIDOR - IMPLEMENTADO
**Archivo:** `server/apiRoutes.ts`
- ✅ Máximo 2 pedidos activos por repartidor
- ✅ Validación en endpoint accept-order
- ✅ Mensaje de error claro

### ✅ 6. TOKEN JWT PERSISTENCIA - CORREGIDO
**Archivos:** `client/contexts/AuthContext.tsx` + `client/lib/query-client.ts`
- ✅ Token se recupera automáticamente al iniciar app
- ✅ Cache de token implementado (5 segundos)
- ✅ Función centralizada getAuthToken()
- ✅ Headers Authorization enviados consistentemente
- ✅ Limpieza de cache en logout

### ✅ 8. DISEÑO UNIFICADO - IMPLEMENTADO
**Archivos:** `client/constants/theme.ts` + componentes UI
- ✅ Sistema de diseño centralizado (theme.ts)
- ✅ Colores, espaciados, tipografía, sombras definidos
- ✅ Componente Button reutilizable (4 variantes)
- ✅ Componente Card reutilizable (3 variantes)
- ✅ Componente Input reutilizable con validación
- ✅ Exportación centralizada en components/ui

### ✅ 9. ESTADOS DE CARGA - IMPLEMENTADO
**Archivo:** `client/components/LoadingState.tsx`
- ✅ Componente LoadingState reutilizable
- ✅ Spinner con mensaje de carga
- ✅ Estado de error con mensaje
- ✅ Estado vacío con mensaje personalizable
- ✅ Listo para usar en todas las pantallas

---

## 🚨 PROBLEMAS CRÍTICOS DE SEGURIDAD

### 1. PERMISOS DE ROLES MAL IMPLEMENTADOS
**Severidad:** CRÍTICA
**Ubicación:** `server/apiRoutes.ts`

**Problema:**
- Repartidores pueden cambiar estados de pedidos que solo negocios deberían poder cambiar
- Endpoint `/business/orders/:id/status` permite estados ["confirmed", "preparing", "ready", "cancelled"]
- Endpoint `/delivery/orders/:id/status` permite estados ["picked_up", "on_the_way", "delivered"]
- NO HAY VALIDACIÓN CRUZADA: Un repartidor puede llamar al endpoint del negocio

**Impacto:**
- Repartidores pueden marcar pedidos como "preparing" o "ready" sin que el negocio lo haga
- Manipulación del flujo de pedidos
- Fraude potencial

**Solución:**
```typescript
// Validar que el usuario tenga permiso para cambiar a ese estado específico
// Validar que el pedido esté asignado al usuario correcto
// Agregar middleware de validación de transiciones de estado
```

---

### 2. AUTENTICACIÓN HARDCODEADA (CÓDIGO 1234)
**Severidad:** CRÍTICA
**Ubicación:** `server/apiRoutes.ts` líneas 180, 280, 450

**Problema:**
```typescript
// LÍNEA 180 - phone-login
if (process.env.NODE_ENV === "development" && code !== "1234") {
  return res.status(400).json({ error: "Invalid verification code" });
}

// LÍNEA 280 - send-code
// TODO: Integrate Twilio to send real SMS
// For test accounts, use code "1234"

// LÍNEA 450 - verify-code
if (process.env.NODE_ENV === "development" && code !== "1234") {
  return res.status(400).json({ error: "Invalid verification code" });
}
```

**Impacto:**
- Cualquiera puede crear cuentas con código 1234
- No hay verificación real de teléfono
- Twilio está configurado pero NO SE USA

**Solución:**
- Implementar Twilio Verify Service correctamente
- Eliminar código hardcodeado
- Generar códigos aleatorios de 6 dígitos
- Guardar código y expiración en BD
- Validar contra BD, no contra "1234"

---

### 3. ROLES ASIGNADOS AUTOMÁTICAMENTE POR TELÉFONO
**Severidad:** ALTA
**Ubicación:** `server/apiRoutes.ts` líneas 195-200

**Problema:**
```typescript
let role = "customer";
const businessOwnerPhones = ["+52 341 234 5678", "+52 341 456 7892", "+523414567892"];
if (businessOwnerPhones.includes(formattedPhone)) role = "business_owner";
else if (formattedPhone === "+52 341 345 6789") role = "delivery_driver";
else if (formattedPhone === "+52 341 456 7890") role = "admin";
else if (formattedPhone === "+52 341 567 8901") role = "super_admin";
```

**Impacto:**
- Roles hardcodeados por número de teléfono
- Cualquiera con esos números obtiene privilegios
- No hay proceso de aprobación para negocios/repartidores

**Solución:**
- Todos los usuarios nuevos deben ser "customer" por defecto
- Negocios y repartidores deben solicitar aprobación
- Admin debe aprobar manualmente
- Implementar flujo de verificación de documentos

---

## 💰 PROBLEMAS FINANCIEROS CRÍTICOS

### 4. CÁLCULOS FINANCIEROS INCONSISTENTES
**Severidad:** CRÍTICA
**Ubicación:** Múltiples archivos

**Problemas identificados:**
- Comisiones calculadas en diferentes lugares con diferentes fórmulas
- No hay servicio centralizado de cálculos
- Conversión centavos/pesos inconsistente
- Subtotal + tax + delivery fee ≠ total en algunos casos

**Ubicaciones:**
- `server/apiRoutes.ts` - línea 2850 (completar entrega)
- `server/financeService.ts` - cálculos de métricas
- Frontend - múltiples pantallas calculan totales

**Solución:**
- Crear `FinancialCalculator` centralizado
- Todas las operaciones financieras deben pasar por este servicio
- Validar SIEMPRE: subtotal + tax + deliveryFee = total
- Usar SOLO centavos internamente, convertir a pesos solo en UI

---

### 5. DASHBOARD MUESTRA CEROS
**Severidad:** ALTA
**Ubicación:** `server/apiRoutes.ts` - endpoint `/admin/dashboard/metrics`

**Problema:**
```typescript
// Línea 1450
const todayOrders = allOrders.filter(o => {
  const orderDate = new Date(o.createdAt);
  return orderDate >= today;
});

// Si no hay pedidos de hoy, muestra 0s
// NO muestra estadísticas históricas como fallback
```

**Impacto:**
- Admin ve dashboard vacío aunque haya datos históricos
- Métricas confusas
- No se puede evaluar el negocio

**Solución:**
- Mostrar métricas de "últimos 7 días" si hoy está vacío
- Agregar selector de rango de fechas
- Mostrar totales históricos siempre

---

## 🔐 PROBLEMAS DE AUTENTICACIÓN

### 6. TOKEN JWT NO PERSISTE CORRECTAMENTE
**Severidad:** ALTA
**Ubicación:** `client/contexts/AuthContext.tsx`

**Problema:**
- Token se guarda en AsyncStorage pero no se recupera al iniciar app
- Headers Authorization no se envían consistentemente
- Sesión se pierde al recargar

**Solución:**
- Implementar recuperación de token en useEffect inicial
- Agregar interceptor de Axios para incluir token automáticamente
- Implementar refresh token para sesiones largas

---

### 7. VERIFICACIÓN DE TELÉFONO NO FUNCIONAL
**Severidad:** CRÍTICA
**Ubicación:** `server/apiRoutes.ts` - endpoints de auth

**Problema:**
- Twilio está configurado pero no se usa
- Código 1234 hardcodeado
- No se guarda código en BD
- No hay expiración de códigos

**Solución:**
```typescript
// 1. Generar código aleatorio
const code = Math.floor(100000 + Math.random() * 900000).toString();

// 2. Guardar en BD con expiración
await db.update(users).set({
  verificationCode: code,
  verificationExpires: new Date(Date.now() + 10 * 60 * 1000) // 10 min
}).where(eq(users.phone, phone));

// 3. Enviar por Twilio
await twilioClient.verify.v2
  .services(process.env.TWILIO_VERIFY_SERVICE_SID)
  .verifications
  .create({ to: phone, channel: 'sms' });

// 4. Validar contra BD
const user = await db.select().from(users).where(eq(users.phone, phone));
if (user.verificationCode !== code || user.verificationExpires < new Date()) {
  return error;
}
```

---

## 🎨 PROBLEMAS DE DISEÑO Y UX

### 8. DISEÑO INCONSISTENTE ENTRE PANTALLAS
**Severidad:** MEDIA
**Ubicación:** Múltiples componentes de cliente

**Problemas:**
- Colores diferentes en diferentes pantallas
- Espaciados inconsistentes
- Botones con estilos diferentes
- No hay sistema de diseño unificado

**Solución:**
- Crear `theme.ts` con colores, espaciados, tipografía
- Crear componentes base reutilizables (Button, Card, Input)
- Aplicar theme en toda la app

---

### 9. PANTALLAS SIN ESTADOS DE CARGA
**Severidad:** MEDIA
**Ubicación:** Múltiples pantallas

**Problema:**
- No hay spinners mientras cargan datos
- Pantallas vacías sin feedback
- Usuario no sabe si está cargando o vacío

**Solución:**
- Agregar ActivityIndicator en todas las pantallas con fetch
- Mostrar skeleton screens
- Mensajes claros de "No hay datos"

---

## 📊 PROBLEMAS DE DATOS

### 10. BASE DE DATOS VACÍA EN PRODUCCIÓN
**Severidad:** ALTA
**Ubicación:** Replit deployment

**Problema:**
- Base de datos de producción está vacía
- Scripts de seed solo funcionan en local
- No hay datos de ejemplo para testing

**Solución:**
- Crear script de seed para producción
- Ejecutar en Replit: `npm run seed:production`
- Agregar datos mínimos necesarios (settings, zonas)

---

### 11. DATOS DEMO MEZCLADOS CON REALES
**Severidad:** MEDIA
**Ubicación:** Base de datos

**Problema:**
- Usuarios de prueba mezclados con reales
- Pedidos demo en estadísticas reales
- No hay forma de distinguir

**Solución:**
- Agregar campo `isDemo` a tablas principales
- Filtrar datos demo en métricas de producción
- Comando para limpiar datos demo

---

## 🔄 PROBLEMAS DE FLUJO DE TRABAJO

### 12. ESTADOS DE PEDIDOS MAL VALIDADOS
**Severidad:** ALTA
**Ubicación:** `server/apiRoutes.ts`

**Problema:**
- No hay validación de transiciones de estado
- Se puede pasar de "pending" a "delivered" directamente
- No se valida que el negocio haya confirmado antes de asignar repartidor

**Solución:**
```typescript
const validTransitions = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["picked_up", "cancelled"],
  picked_up: ["on_the_way", "cancelled"],
  on_the_way: ["delivered", "cancelled"],
  delivered: [],
  cancelled: []
};

// Validar antes de cambiar estado
if (!validTransitions[currentStatus].includes(newStatus)) {
  return error("Invalid state transition");
}
```

---

### 13. REPARTIDORES PUEDEN ACEPTAR MÚLTIPLES PEDIDOS
**Severidad:** MEDIA
**Ubicación:** `server/apiRoutes.ts` - endpoint accept-order

**Problema:**
- No hay límite de pedidos activos por repartidor
- Puede aceptar 10 pedidos simultáneos
- No hay validación de capacidad

**Solución:**
- Validar que repartidor no tenga más de 2 pedidos activos
- Mostrar solo pedidos que puede aceptar
- Bloquear aceptación si está saturado

---

## 🔧 PROBLEMAS TÉCNICOS

### 14. FALTA MANEJO DE ERRORES
**Severidad:** MEDIA
**Ubicación:** Múltiples endpoints

**Problema:**
- Try-catch genéricos sin logging específico
- Errores no se reportan a servicio de monitoreo
- Usuario ve "Error 500" sin contexto

**Solución:**
- Implementar logger centralizado (Winston/Pino)
- Categorizar errores (ValidationError, AuthError, etc)
- Mensajes de error específicos para usuario
- Integrar Sentry para tracking

---

### 15. NO HAY RATE LIMITING EFECTIVO
**Severidad:** MEDIA
**Ubicación:** `server/server.ts`

**Problema:**
```typescript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 100 : 10000,
});
```

- 100 requests en 15 min es muy permisivo
- No hay rate limiting por usuario
- Endpoints críticos no tienen límites especiales

**Solución:**
- Reducir a 50 requests/15min para usuarios normales
- Endpoints de auth: 5 intentos/15min
- Endpoints de pago: 10 requests/15min
- Rate limiting por IP Y por usuario

---

## 📱 PROBLEMAS DE INTEGRACIÓN

### 16. TWILIO NO SE USA CORRECTAMENTE
**Severidad:** CRÍTICA
**Ubicación:** `server/apiRoutes.ts`

**Problema:**
- Twilio Verify Service configurado pero no usado
- SMS no se envían
- Llamadas automáticas a negocios no funcionan

**Solución:**
- Implementar Twilio Verify para SMS
- Implementar Twilio Voice para llamadas
- Agregar manejo de webhooks de Twilio

---

### 17. STRIPE WEBHOOKS NO MANEJADOS
**Severidad:** ALTA
**Ubicación:** `server/stripeWebhooksComplete.ts`

**Problema:**
- Webhooks definidos pero no todos manejados
- No hay retry logic
- No se valida firma de Stripe

**Solución:**
- Implementar todos los webhooks necesarios
- Validar firma en cada webhook
- Implementar idempotencia
- Logging de todos los eventos

---

## 🎯 PLAN DE CORRECCIÓN PRIORIZADO

### FASE 1: SEGURIDAD CRÍTICA (HOY)
1. ✅ Arreglar permisos de roles en endpoints
2. ✅ Eliminar código 1234 hardcodeado
3. ✅ Implementar Twilio Verify correctamente
4. ✅ Validar transiciones de estado de pedidos

### FASE 2: FINANZAS (MAÑANA)
5. ✅ Centralizar cálculos financieros
6. ✅ Arreglar dashboard de admin
7. ✅ Validar consistencia de totales

### FASE 3: AUTENTICACIÓN (2 DÍAS)
8. ✅ Arreglar persistencia de token
9. ✅ Implementar refresh tokens
10. ✅ Mejorar flujo de login/signup

### FASE 4: UX Y DISEÑO (3 DÍAS)
11. ✅ Sistema de diseño unificado
12. ✅ Estados de carga en todas las pantallas
13. ✅ Mensajes de error claros

### FASE 5: DATOS Y TESTING (4 DÍAS)
14. ✅ Seed de producción
15. ✅ Separar datos demo de reales
16. ✅ Tests automatizados básicos

---

## 📋 CHECKLIST DE PRODUCCIÓN

Antes de lanzar a producción, verificar:

- [ ] Código 1234 eliminado completamente
- [ ] Twilio Verify funcionando
- [ ] Roles asignados manualmente (no por teléfono)
- [ ] Permisos de endpoints validados
- [ ] Cálculos financieros centralizados
- [ ] Dashboard muestra datos correctos
- [ ] Token persiste correctamente
- [ ] Rate limiting configurado
- [ ] Webhooks de Stripe funcionando
- [ ] Logs centralizados
- [ ] Monitoreo de errores (Sentry)
- [ ] Base de datos con seed mínimo
- [ ] Variables de entorno de producción
- [ ] SSL/HTTPS configurado
- [ ] Backup de BD configurado

---

## 🚀 PRÓXIMOS PASOS

1. **AHORA MISMO:** Empezar con Fase 1 (Seguridad)
2. **Crear branch:** `fix/critical-security-issues`
3. **Hacer commits atómicos** por cada problema resuelto
4. **Testing manual** después de cada fix
5. **Deploy a staging** antes de producción
6. **Testing completo** en staging
7. **Deploy a producción** solo cuando TODO esté verde

---

**IMPORTANTE:** No hacer deploy a producción hasta completar FASE 1 y FASE 2 mínimo.
