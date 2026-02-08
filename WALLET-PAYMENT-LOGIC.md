# Sistema de Pagos y Retiros - NEMY

## 🔄 LÓGICA ACTUAL CORRECTA

### Modelo de Comisiones (NUEVO - 2026)

```
Productos base: $80
Comisión NEMY (15% sobre productos): $12
Delivery Fee: $25
─────────────────────────
TOTAL CLIENTE: $117

Distribución al entregar:
├─ Negocio: $80 (100% de sus productos)
├─ Repartidor: $25 (100% del delivery fee)  
├─ Plataforma NEMY: $12 (15% sobre productos solamente)
└─ TOTAL: $117 ✓
```

### Flujo de Dinero

1. **Cliente realiza pedido**
   - Productos: $80
   - Markup NEMY (15%): $12
   - Delivery: $25
   - **Total a pagar: $117**
   - Pago con tarjeta → Stripe captura $117
   - Pago en efectivo → Repartidor cobra $117

2. **Cuando el pedido se marca como "delivered"**
   ```typescript
   // CÁLCULO CORRECTO:
   const productosBase = (order.total - order.deliveryFee) / 1.15;
   const nemyCommission = (order.total - order.deliveryFee) - productosBase;
   
   // Distribución:
   - Negocio: productosBase ($80)
   - Repartidor: order.deliveryFee ($25)
   - Plataforma: nemyCommission ($12)
   
   // Se actualizan las wallets:
   - businessWallet.balance += productosBase
   - driverWallet.balance += deliveryFee
   - platformWallet (no existe, NEMY se queda con su 15%)
   ```

3. **Retiro de fondos** (withdrawalService.ts)
   - Negocio/Repartidor solicita retiro desde su wallet
   - Mínimo: $100 MXN
   - Se valida: `availableBalance = balance - cashOwed`
   - Si tiene efectivo pendiente, debe liquidarlo primero
   - En producción: Se transfiere vía Stripe Connect
   - En desarrollo: Se marca como completado automáticamente

### Lógica Actual en unifiedFinancialService.ts

**LÍNEAS 70-109 - CÁLCULO CORRECTO:**
```typescript
async calculateCommissions(
  totalAmount: number,
  deliveryFee: number = 0
): Promise<{
  platform: number;
  business: number;
  driver: number;
  total: number;
}> {
  // Driver gets 100% of delivery fee
  const driverAmount = deliveryFee;
  
  // Platform gets 15% of PRODUCTS (total - delivery)
  const productsWithMarkup = totalAmount - deliveryFee;
  const productBase = Math.round(productsWithMarkup / 1.15);
  const platformAmount = productsWithMarkup - productBase;
  
  // Business gets product base price
  const businessAmount = productBase;

  return {
    platform: platformAmount,  // $12 (15% de $80)
    business: businessAmount,  // $80 (productos base)
    driver: driverAmount,      // $25 (delivery completo)
    total: totalAmount         // $117
  };
}
```

**PROBLEMA:** En apiRoutes.ts línea 5267 NO se pasa `deliveryFee`, entonces asume 0 y calcula mal.

---

## ✅ LÓGICA IDEAL (Rappi/Uber)

### Modelo de Stripe Connect

```
┌─────────────┐
│   Cliente   │
│  Paga $100  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│         Stripe Platform             │
│  (NEMY captura el pago completo)    │
└──────┬──────────────────┬───────────┘
       │                  │
       │ Transfer         │ Transfer
       │ $70              │ $15
       ▼                  ▼
┌─────────────┐    ┌──────────────┐
│  Negocio    │    │  Repartidor  │
│ Stripe      │    │  Stripe      │
│ Connect     │    │  Connect     │
└─────────────┘    └──────────────┘
```

### Flujo Recomendado

#### 1. **Pago con Tarjeta**
```typescript
// Cliente paga
stripe.paymentIntents.create({
  amount: 10000, // $100 MXN
  application_fee_amount: 1500, // 15% plataforma
  transfer_data: {
    destination: negocio_stripe_account_id,
    amount: 7000 // 70% al negocio
  }
})

// Después de entrega, transferir al repartidor
stripe.transfers.create({
  amount: 1500, // 15% repartidor
  destination: repartidor_stripe_account_id
})
```

**Ventajas:**
- ✅ Dinero va directo a cada parte
- ✅ No hay wallets intermedias
- ✅ No hay problema de liquidación
- ✅ Retiros instantáneos (Stripe maneja todo)

#### 2. **Pago en Efectivo**
```typescript
// Al marcar como entregado:
1. Repartidor confirma que recibió $100 en efectivo
2. Sistema registra:
   - cashOwed (repartidor): $85 (debe a plataforma)
   - cashPending (negocio): $70 (esperando efectivo)
   - platformCashPending: $15

3. Repartidor debe liquidar:
   - Opción A: Transferir $85 a cuenta de NEMY
   - Opción B: Descontar de futuras ganancias con tarjeta
   - Opción C: Depositar en punto físico

4. Una vez liquidado:
   - Transferir $70 al negocio vía Stripe
   - Liberar $15 del repartidor
```

---

## 🔧 IMPLEMENTACIÓN RECOMENDADA

### Fase 1: Stripe Connect (Tarjeta)

```typescript
// 1. Onboarding de negocios y repartidores
POST /api/stripe/connect/onboard
{
  userId: "business_id",
  type: "express" // Cuenta Express de Stripe
}

// 2. Crear pedido con split payment
POST /api/orders
{
  // ... datos del pedido
  paymentMethod: "card"
}

// Backend:
const paymentIntent = await stripe.paymentIntents.create({
  amount: total,
  currency: "mxn",
  application_fee_amount: platformFee,
  transfer_data: {
    destination: businessStripeAccountId,
    amount: businessEarnings
  },
  metadata: {
    orderId: order.id,
    businessId: order.businessId
  }
})

// 3. Al entregar, transferir al repartidor
PUT /api/orders/:id/status { status: "delivered" }

// Backend:
await stripe.transfers.create({
  amount: deliveryEarnings,
  currency: "mxn",
  destination: driverStripeAccountId,
  metadata: {
    orderId: order.id,
    driverId: order.deliveryPersonId
  }
})
```

### Fase 2: Manejo de Efectivo

```typescript
// 1. Al entregar pedido en efectivo
PUT /api/orders/:id/complete-cash-delivery
{
  cashReceived: 10000, // $100 MXN
  changeGiven: 0
}

// Backend:
await db.transaction(async (tx) => {
  // Marcar orden como entregada
  await tx.update(orders)
    .set({ 
      status: "delivered",
      cashReceived: 10000,
      deliveredAt: new Date()
    })
    .where(eq(orders.id, orderId))

  // Registrar deuda del repartidor
  await tx.update(wallets)
    .set({ 
      cashOwed: wallet.cashOwed + (businessEarnings + platformFee)
    })
    .where(eq(wallets.userId, driverId))

  // Registrar efectivo pendiente del negocio
  await tx.update(wallets)
    .set({ 
      cashPending: wallet.cashPending + businessEarnings
    })
    .where(eq(wallets.userId, businessId))
})

// 2. Repartidor liquida efectivo
POST /api/wallet/settle-cash
{
  amount: 8500, // $85 MXN
  method: "bank_transfer" | "stripe_payment" | "physical_deposit"
}

// Backend:
// Opción A: Pago con tarjeta del repartidor
const payment = await stripe.paymentIntents.create({
  amount: 8500,
  customer: driverStripeCustomerId,
  payment_method: driverPaymentMethodId,
  confirm: true
})

// Opción B: Descontar de futuras ganancias
// (automático al procesar siguiente pedido con tarjeta)

// Una vez confirmado el pago:
await db.transaction(async (tx) => {
  // Reducir deuda del repartidor
  await tx.update(wallets)
    .set({ cashOwed: 0 })
    .where(eq(wallets.userId, driverId))

  // Transferir al negocio vía Stripe
  await stripe.transfers.create({
    amount: 7000,
    destination: businessStripeAccountId
  })

  // Plataforma se queda con su 15%
})
```

### Fase 3: Panel de Retiros

```typescript
// Negocio/Repartidor ve su wallet
GET /api/wallet/balance

Response:
{
  balance: 50000, // $500 MXN en Stripe Connect
  cashOwed: 0, // Efectivo que debe liquidar
  cashPending: 0, // Efectivo esperando liquidación
  availableForWithdrawal: 50000,
  pendingTransfers: [],
  stripeAccountStatus: "active",
  payoutsEnabled: true
}

// Solicitar retiro (ya no es necesario, Stripe lo maneja)
// Pero si quieren control manual:
POST /api/wallet/payout
{
  amount: 50000
}

// Backend:
await stripe.payouts.create({
  amount: 50000,
  currency: "mxn"
}, {
  stripeAccount: userStripeAccountId
})
```

---

## 📊 COMPARACIÓN

| Aspecto | Actual | Ideal (Rappi/Uber) |
|---------|--------|-------------------|
| **Tarjeta** | Wallet intermedia | Stripe Connect directo |
| **Efectivo** | Complejo, cashOwed | Sistema de liquidación |
| **Retiros** | Manual, mínimo $100 | Automático o bajo demanda |
| **Tiempo** | Hasta que soliciten | Instantáneo (Stripe) |
| **Comisiones** | Calculadas en backend | Split automático |
| **Seguridad** | Wallets en DB | Stripe maneja todo |

---

## 🚀 MIGRACIÓN

### Paso 1: Implementar Stripe Connect
1. Crear endpoint de onboarding
2. Migrar negocios/repartidores existentes
3. Validar cuentas activas

### Paso 2: Actualizar flujo de pedidos
1. Modificar creación de PaymentIntent
2. Implementar transfers automáticos
3. Mantener wallets solo para efectivo

### Paso 3: Sistema de liquidación
1. Panel para repartidores con efectivo pendiente
2. Opciones de pago (tarjeta, transferencia, físico)
3. Automatizar descuentos de futuras ganancias

### Paso 4: Deprecar wallets antiguas
1. Liquidar saldos existentes
2. Migrar a Stripe Connect
3. Mantener solo para tracking de efectivo

---

## 💡 RECOMENDACIÓN FINAL

**Para producción real:**
1. ✅ **Usar Stripe Connect para TODO (tarjeta)** - Implementado
2. ✅ **Wallets solo para tracking de efectivo** - Ya funciona
3. ✅ **Sistema de liquidación automático** - cashSettlementService.ts
4. ✅ **Retiros con mínimo $50 MXN** - withdrawalService.ts

### 🎯 Sistema Implementado (Híbrido)

```typescript
// 1. Repartidor/Negocio solicita retiro desde app
POST /api/withdrawals/request
{
  userId: "user_123",
  amount: 5000, // $50 MXN mínimo
  method: "stripe" | "bank_transfer",
  bankAccount: { // Solo si method = bank_transfer
    clabe: "012345678901234567", // 18 dígitos
    bankName: "BBVA",
    accountHolder: "Juan Pérez"
  }
}

// 2. Si método = "stripe" (Recomendado)
// - Automático vía Stripe Connect
// - Llega en 1-2 días hábiles
// - Sin intervención manual

// 3. Si método = "bank_transfer" (SPEI)
// - Admin ve solicitud en panel
// - Procesa transferencia manualmente
// - Marca como completada
```

### 📱 UI Recomendada para Retiros

**Pantalla de Wallet:**
```
┌─────────────────────────────┐
│  💰 Tu Saldo                │
│  $100.00 MXN                │
│                             │
│  Efectivo pendiente: $0.00  │
│  Disponible: $100.00        │
│                             │
│  [Retirar Fondos]           │
└─────────────────────────────┘
```

**Modal de Retiro:**
```
┌─────────────────────────────┐
│  Retirar Fondos             │
│                             │
│  Monto: $______             │
│  Mínimo: $50.00             │
│  Máximo: $100.00            │
│                             │
│  Método de retiro:          │
│  ○ Stripe (1-2 días) ⚡     │
│  ○ Transferencia (3-5 días) │
│                             │
│  [Continuar]                │
└─────────────────────────────┘
```

**Si elige Transferencia:**
```
┌─────────────────────────────┐
│  Datos Bancarios            │
│                             │
│  CLABE: ________________    │
│  (18 dígitos)               │
│                             │
│  Banco: [Seleccionar ▼]     │
│                             │
│  Titular: _______________   │
│                             │
│  ⚠️ Verifica que los datos  │
│  sean correctos             │
│                             │
│  [Solicitar Retiro]         │
└─────────────────────────────┘
```

### 🔧 Integración en apiRoutes.ts

```typescript
// Agregar en server/apiRoutes.ts
import withdrawalRoutes from './withdrawalRoutes';

app.use('/api/withdrawals', withdrawalRoutes);
```

### 📊 Panel Admin para Retiros

```
┌─────────────────────────────────────────────────┐
│  Retiros Pendientes                             │
├─────────────────────────────────────────────────┤
│  Usuario      Monto    Método    Fecha          │
│  Juan Pérez   $50.00   SPEI      2026-01-15    │
│  CLABE: 012345678901234567                      │
│  Banco: BBVA                                    │
│  [Aprobar] [Rechazar]                           │
├─────────────────────────────────────────────────┤
│  María López  $100.00  Stripe    2026-01-15    │
│  ✅ Procesado automáticamente                   │
└─────────────────────────────────────────────────┘
```

### ✅ Ventajas del Sistema Híbrido

1. **Stripe Connect (Automático)**
   - ✅ Sin intervención manual
   - ✅ Rápido (1-2 días)
   - ✅ Seguro (Stripe maneja todo)
   - ✅ Tracking automático

2. **Transferencia Bancaria (Manual)**
   - ✅ Opción para quien no tiene Stripe
   - ✅ Usa CLABE (estándar México)
   - ✅ Admin tiene control
   - ✅ Flexible

3. **Validaciones**
   - ✅ Mínimo $50 MXN
   - ✅ No puede retirar si tiene cashOwed > 0
   - ✅ Solo puede retirar balance disponible
   - ✅ Historial completo

### 🚀 Próximos Pasos

1. **Aplicar schema a DB:**
   ```bash
   npm run db:push
   ```

2. **Agregar rutas en apiRoutes.ts:**
   ```typescript
   import withdrawalRoutes from './withdrawalRoutes';
   app.use('/api/withdrawals', withdrawalRoutes);
   ```

3. **Crear pantalla de retiros en app:**
   - `client/screens/WithdrawalScreen.tsx`
   - Formulario con monto y método
   - Validación de mínimo $50
   - Historial de retiros

4. **Panel admin:**
   - Lista de retiros pendientes
   - Botón aprobar/rechazar
   - Filtros por estado

---

**Hecho con ❤️ en Autlán, Jalisco, México** Stripe

**Beneficios:**
- ✅ Menos código que mantener
- ✅ Más seguro (Stripe maneja el dinero)
- ✅ Cumplimiento PCI automático
- ✅ Experiencia como Rappi/Uber
- ✅ Sin problemas de liquidación
