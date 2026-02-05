# 💰 FLUJO DE FONDOS - SISTEMA NEMY

## 🔄 CÓMO FUNCIONA EL SISTEMA DE PAGOS

### 1. CUANDO SE CREA UN PEDIDO
```
Cliente realiza pedido → Status: "pending"
Total: $100.00 (ejemplo)
- Subtotal: $75.00
- Delivery Fee: $25.00
```
**Fondos:** NO se liberan aún

---

### 2. CUANDO EL NEGOCIO CONFIRMA
```
Negocio acepta → Status: "confirmed"
```
**Fondos:** NO se liberan aún

---

### 3. CUANDO EL REPARTIDOR ENTREGA
```
Repartidor marca como entregado → Status: "delivered"
```
**Fondos:** SE LIBERAN AUTOMÁTICAMENTE

#### Distribución Automática:
```typescript
Total del pedido: $100.00

Comisiones calculadas:
- Platform (15%): $15.00 → Wallet NEMY
- Business (70%): $70.00 → Wallet del Negocio
- Driver (15%):   $15.00 → Wallet del Repartidor
```

---

## 📊 EJEMPLO REAL

### Pedido #123456
- **Total:** $100.00
- **Status:** delivered
- **Entregado:** 2025-01-15

### Distribución:
1. **Negocio (La Taquería):**
   - Recibe: $70.00
   - Wallet balance: $70.00
   - Puede retirar inmediatamente

2. **Repartidor (Juan):**
   - Recibe: $15.00
   - Wallet balance: $15.00
   - Puede retirar inmediatamente

3. **Plataforma NEMY:**
   - Recibe: $15.00
   - Comisión de plataforma

---

## 🔍 POR QUÉ NO VES TUS FONDOS

### Problema Identificado:
Los pedidos entregados NO estaban liberando fondos automáticamente.

### Causa:
El endpoint `/orders/:id/complete-delivery` tenía un error:
- Usaba `FinancialCalculator.calculateCommissions()` (síncrono)
- Debía usar `financialService.calculateCommissions()` (asíncrono)

### Solución:
✅ **Corregido** - Ahora usa el servicio centralizado correcto

---

## 🛠️ CÓMO SINCRONIZAR FONDOS PENDIENTES

Si ya entregaste pedidos y no ves los fondos:

### Opción 1: Script Automático
```bash
# Ejecutar en Windows
sync-wallets.bat
```

Este script:
1. Calcula comisiones de pedidos entregados
2. Crea wallets si no existen
3. Libera fondos a wallets
4. Crea transacciones de registro

### Opción 2: Manual (SQL)
```sql
-- Ver pedidos entregados sin fondos liberados
SELECT 
  o.id,
  o.total,
  o.status,
  o.businessEarnings,
  o.deliveryEarnings,
  w.balance as wallet_balance
FROM orders o
LEFT JOIN wallets w ON w.userId = o.deliveryPersonId
WHERE o.status = 'delivered'
  AND o.deliveryPersonId = 'TU_USER_ID';
```

---

## 📈 VERIFICAR TUS GANANCIAS

### Como Repartidor:
```sql
-- Ver tus ganancias totales
SELECT 
  COUNT(*) as pedidos_entregados,
  SUM(deliveryEarnings) as total_ganado,
  (SELECT balance FROM wallets WHERE userId = 'TU_USER_ID') as balance_actual
FROM orders
WHERE deliveryPersonId = 'TU_USER_ID'
  AND status = 'delivered';
```

### Como Negocio:
```sql
-- Ver tus ganancias totales
SELECT 
  COUNT(*) as pedidos_completados,
  SUM(businessEarnings) as total_ganado,
  (SELECT balance FROM wallets WHERE userId = 'TU_USER_ID') as balance_actual
FROM orders
WHERE businessId = 'TU_BUSINESS_ID'
  AND status = 'delivered';
```

---

## 🎯 FLUJO CORRECTO (DESPUÉS DE LA CORRECCIÓN)

### 1. Repartidor marca como entregado
```
POST /orders/:id/complete-delivery
```

### 2. Sistema automáticamente:
```typescript
// 1. Cambiar status
order.status = "delivered"
order.deliveredAt = new Date()

// 2. Calcular comisiones
const commissions = await financialService.calculateCommissions(order.total)
// commissions = { platform: 1500, business: 7000, driver: 1500 }

// 3. Actualizar wallet del negocio
businessWallet.balance += commissions.business

// 4. Actualizar wallet del repartidor
driverWallet.balance += commissions.driver

// 5. Crear transacciones de registro
transactions.insert([
  { userId: businessId, type: "order_payment", amount: 7000 },
  { userId: driverId, type: "delivery_payment", amount: 1500 }
])
```

### 3. Fondos disponibles inmediatamente
```
Negocio puede retirar: $70.00
Repartidor puede retirar: $15.00
```

---

## ⚠️ IMPORTANTE

### Fondos se liberan SOLO cuando:
- ✅ Status = "delivered"
- ✅ Pedido tiene deliveryPersonId asignado
- ✅ Endpoint `/complete-delivery` es llamado

### Fondos NO se liberan si:
- ❌ Status = "pending", "confirmed", "preparing", "ready"
- ❌ Status = "cancelled"
- ❌ Pedido sin repartidor asignado

---

## 🔧 SOLUCIÓN PARA PEDIDOS ANTIGUOS

Si tienes pedidos entregados antes de la corrección:

### Paso 1: Ejecutar sincronización
```bash
sync-wallets.bat
```

### Paso 2: Verificar en la app
- Ir a Wallet
- Ver balance actualizado
- Verificar transacciones

### Paso 3: Retirar fondos
- Monto mínimo: $50.00 (repartidores) o $100.00 (negocios)
- Retiro instantáneo en desarrollo
- Retiro en 1-3 días en producción (Stripe)

---

## 📞 SOPORTE

Si después de ejecutar `sync-wallets.bat` aún no ves tus fondos:

1. Verifica que los pedidos estén en status "delivered"
2. Verifica que tengas deliveryPersonId asignado
3. Ejecuta las queries de verificación
4. Contacta al administrador con tu userId

---

**Última actualización:** 2025-01-XX  
**Estado:** ✅ CORREGIDO Y FUNCIONAL
