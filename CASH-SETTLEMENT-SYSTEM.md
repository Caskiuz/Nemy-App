# Sistema de Liquidación de Efectivo - NEMY

## 🚨 PROBLEMA ACTUAL

**Cuando un pedido se paga en efectivo:**

```
Cliente paga $117 en efectivo al repartidor
├─ Repartidor recibe: $117 físicos
├─ Sistema registra en wallets:
│   ├─ businessWallet.balance += $80
│   ├─ driverWallet.balance += $25
│   └─ plataforma se queda con $12
└─ PROBLEMA: Repartidor tiene $117 pero solo le corresponden $25
```

**Actualmente NO existe lógica para:**
- ❌ Registrar que el repartidor debe $92 ($80 + $12)
- ❌ Bloquear retiros hasta liquidar
- ❌ Proceso de liquidación
- ❌ Transferir dinero al negocio una vez liquidado

---

## ✅ SOLUCIÓN: Sistema de Liquidación

### Flujo Completo

#### 1. Al entregar pedido en efectivo

```typescript
// PUT /api/orders/:id/complete-delivery
// Cuando paymentMethod === "cash"

await db.transaction(async (tx) => {
  // Marcar orden como entregada
  await tx.update(orders)
    .set({ 
      status: "delivered",
      deliveredAt: new Date()
    })
    .where(eq(orders.id, orderId));

  // Calcular distribución
  const commissions = await financialService.calculateCommissions(
    order.total,
    order.deliveryFee
  );

  // CRÍTICO: Registrar deuda del repartidor
  const [driverWallet] = await tx
    .select()
    .from(wallets)
    .where(eq(wallets.userId, order.deliveryPersonId))
    .limit(1);

  await tx.update(wallets)
    .set({
      balance: driverWallet.balance + commissions.driver, // +$25
      cashOwed: driverWallet.cashOwed + commissions.business + commissions.platform, // +$92
      updatedAt: new Date()
    })
    .where(eq(wallets.userId, order.deliveryPersonId));

  // Registrar efectivo pendiente del negocio
  const [businessWallet] = await tx
    .select()
    .from(wallets)
    .where(eq(wallets.userId, order.businessId))
    .limit(1);

  await tx.update(wallets)
    .set({
      balance: businessWallet.balance, // NO se incrementa aún
      cashPending: businessWallet.cashPending + commissions.business, // +$80
      updatedAt: new Date()
    })
    .where(eq(wallets.userId, order.businessId));

  // Crear transacciones de tracking
  await tx.insert(transactions).values([
    {
      userId: order.deliveryPersonId,
      orderId: order.id,
      type: "cash_delivery_earned",
      amount: commissions.driver,
      description: `Delivery en efectivo - Pedido #${order.id.slice(-6)}`,
      status: "completed"
    },
    {
      userId: order.deliveryPersonId,
      orderId: order.id,
      type: "cash_debt",
      amount: -(commissions.business + commissions.platform),
      description: `Efectivo a liquidar - Pedido #${order.id.slice(-6)}`,
      status: "pending"
    }
  ]);
});
```

#### 2. Repartidor intenta retirar

```typescript
// POST /api/wallet/withdraw
// withdrawalService.ts líneas 56-90

const [wallet] = await db
  .select()
  .from(wallets)
  .where(eq(wallets.userId, userId))
  .limit(1);

// Calcular balance disponible
const availableBalance = wallet.balance - (wallet.cashOwed || 0);

if (availableBalance < requestedAmount) {
  return {
    success: false,
    error: wallet.cashOwed > 0 
      ? `Debes liquidar $${(wallet.cashOwed / 100).toFixed(2)} en efectivo antes de retirar`
      : "Saldo insuficiente"
  };
}
```

#### 3. Repartidor liquida efectivo

**Opción A: Descuento automático de futuras ganancias con tarjeta**

```typescript
// Al completar un pedido con TARJETA
// PUT /api/orders/:id/complete-delivery
// Cuando paymentMethod === "card"

await db.transaction(async (tx) => {
  const commissions = await financialService.calculateCommissions(
    order.total,
    order.deliveryFee
  );

  const [driverWallet] = await tx
    .select()
    .from(wallets)
    .where(eq(wallets.userId, order.deliveryPersonId))
    .limit(1);

  // Si tiene deuda de efectivo, descontar automáticamente
  let driverEarnings = commissions.driver;
  let debtPayment = 0;

  if (driverWallet.cashOwed > 0) {
    debtPayment = Math.min(driverEarnings, driverWallet.cashOwed);
    driverEarnings -= debtPayment;

    await tx.update(wallets)
      .set({
        balance: driverWallet.balance + driverEarnings,
        cashOwed: driverWallet.cashOwed - debtPayment,
        updatedAt: new Date()
      })
      .where(eq(wallets.userId, order.deliveryPersonId));

    // Registrar pago de deuda
    await tx.insert(transactions).values({
      userId: order.deliveryPersonId,
      orderId: order.id,
      type: "cash_debt_payment",
      amount: -debtPayment,
      description: `Descuento automático de deuda - Pedido #${order.id.slice(-6)}`,
      status: "completed"
    });

    // Si pagó deuda, liberar fondos al negocio
    if (debtPayment > 0) {
      await settleCashToBusinesses(tx, order.deliveryPersonId, debtPayment);
    }
  }
});
```

**Opción B: Pago manual con tarjeta**

```typescript
// POST /api/wallet/settle-cash
router.post("/settle-cash", authenticateToken, async (req, res) => {
  const { amount, paymentMethodId } = req.body;

  try {
    const [wallet] = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, req.user!.id))
      .limit(1);

    if (wallet.cashOwed === 0) {
      return res.json({ success: false, error: "No tienes deuda pendiente" });
    }

    if (amount > wallet.cashOwed) {
      return res.json({ success: false, error: "Monto mayor a la deuda" });
    }

    // Cobrar con Stripe
    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
    const payment = await stripe.paymentIntents.create({
      amount: amount,
      currency: "mxn",
      customer: wallet.stripeCustomerId,
      payment_method: paymentMethodId,
      confirm: true,
      description: `Liquidación de efectivo - ${req.user!.name}`,
      metadata: {
        userId: req.user!.id,
        type: "cash_settlement"
      }
    });

    if (payment.status === "succeeded") {
      await db.transaction(async (tx) => {
        // Reducir deuda
        await tx.update(wallets)
          .set({
            cashOwed: wallet.cashOwed - amount,
            updatedAt: new Date()
          })
          .where(eq(wallets.userId, req.user!.id));

        // Registrar transacción
        await tx.insert(transactions).values({
          userId: req.user!.id,
          type: "cash_debt_payment",
          amount: -amount,
          description: `Pago de deuda en efectivo vía tarjeta`,
          status: "completed",
          stripePaymentIntentId: payment.id
        });

        // Liberar fondos a negocios
        await settleCashToBusinesses(tx, req.user!.id, amount);
      });

      res.json({ success: true, message: "Deuda liquidada exitosamente" });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
```

**Opción C: Depósito en punto físico**

```typescript
// POST /api/admin/cash-deposits
// Solo admin puede registrar depósitos físicos

router.post("/cash-deposits", authenticateToken, requireRole("admin"), async (req, res) => {
  const { driverId, amount, receiptNumber } = req.body;

  await db.transaction(async (tx) => {
    const [wallet] = await tx
      .select()
      .from(wallets)
      .where(eq(wallets.userId, driverId))
      .limit(1);

    if (amount > wallet.cashOwed) {
      throw new Error("Monto mayor a la deuda");
    }

    // Reducir deuda
    await tx.update(wallets)
      .set({
        cashOwed: wallet.cashOwed - amount,
        updatedAt: new Date()
      })
      .where(eq(wallets.userId, driverId));

    // Registrar depósito
    await tx.insert(transactions).values({
      userId: driverId,
      type: "cash_debt_payment",
      amount: -amount,
      description: `Depósito físico - Recibo #${receiptNumber}`,
      status: "completed",
      metadata: JSON.stringify({ receiptNumber, adminId: req.user!.id })
    });

    // Liberar fondos a negocios
    await settleCashToBusinesses(tx, driverId, amount);
  });

  res.json({ success: true });
});
```

#### 4. Liberar fondos al negocio

```typescript
// Helper function
async function settleCashToBusinesses(tx: any, driverId: string, amount: number) {
  // Obtener pedidos en efectivo pendientes de liquidar
  const { orders } = await import("@shared/schema-mysql");
  
  const cashOrders = await tx
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.deliveryPersonId, driverId),
        eq(orders.paymentMethod, "cash"),
        eq(orders.status, "delivered"),
        eq(orders.cashSettled, false) // Nuevo campo
      )
    )
    .orderBy(orders.deliveredAt);

  let remainingAmount = amount;

  for (const order of cashOrders) {
    if (remainingAmount <= 0) break;

    const commissions = await financialService.calculateCommissions(
      order.total,
      order.deliveryFee
    );

    const orderDebt = commissions.business + commissions.platform;

    if (remainingAmount >= orderDebt) {
      // Liquidar orden completa
      const [businessWallet] = await tx
        .select()
        .from(wallets)
        .where(eq(wallets.userId, order.businessId))
        .limit(1);

      await tx.update(wallets)
        .set({
          balance: businessWallet.balance + commissions.business,
          cashPending: businessWallet.cashPending - commissions.business,
          updatedAt: new Date()
        })
        .where(eq(wallets.userId, order.businessId));

      // Marcar orden como liquidada
      await tx.update(orders)
        .set({ cashSettled: true })
        .where(eq(orders.id, order.id));

      // Registrar transacción al negocio
      await tx.insert(transactions).values({
        userId: order.businessId,
        orderId: order.id,
        type: "cash_settlement",
        amount: commissions.business,
        description: `Efectivo liquidado - Pedido #${order.id.slice(-6)}`,
        status: "completed"
      });

      remainingAmount -= orderDebt;
    }
  }
}
```

---

## 📱 UI/UX para Repartidor

### Panel de Wallet

```typescript
// GET /api/wallet/balance
{
  balance: 25000, // $250 (ganancias disponibles)
  cashOwed: 18400, // $184 (debe liquidar)
  availableForWithdrawal: 6600, // $66 (puede retirar)
  totalEarned: 50000,
  pendingCashOrders: [
    {
      orderId: "abc123",
      amount: 9200, // $92
      deliveredAt: "2026-01-15T10:30:00Z",
      businessName: "Tacos El Güero"
    },
    {
      orderId: "def456",
      amount: 9200,
      deliveredAt: "2026-01-15T14:20:00Z",
      businessName: "Pizza Napoli"
    }
  ]
}
```

### Opciones de Liquidación

```
┌─────────────────────────────────────┐
│  💰 Deuda Pendiente: $184.00        │
├─────────────────────────────────────┤
│                                     │
│  ⚡ Descuento Automático            │
│  Se descontará de tus próximas      │
│  entregas con tarjeta               │
│  [✓ Activado]                       │
│                                     │
│  💳 Pagar Ahora con Tarjeta         │
│  Liquida tu deuda inmediatamente    │
│  [Pagar $184.00]                    │
│                                     │
│  🏢 Depositar en Oficina            │
│  Lleva el efectivo a:               │
│  📍 Av. Principal #123, Autlán      │
│  🕐 Lun-Vie 9am-6pm                 │
│                                     │
└─────────────────────────────────────┘
```

---

## 🔒 Garantías del Sistema

### 1. Bloqueo de Retiros
```typescript
if (wallet.cashOwed > 0) {
  availableBalance = wallet.balance - wallet.cashOwed;
  // No puede retirar hasta liquidar
}
```

### 2. Descuento Automático
```typescript
// En cada pedido con tarjeta
if (driverWallet.cashOwed > 0) {
  const deduction = Math.min(earnings, cashOwed);
  earnings -= deduction;
  cashOwed -= deduction;
}
```

### 3. Auditoría
```typescript
// Todas las transacciones quedan registradas
- cash_delivery_earned: +$25
- cash_debt: -$92
- cash_debt_payment: +$92
- cash_settlement: Transferido al negocio
```

### 4. Alertas
```typescript
// Si deuda > $500 o > 7 días
- Notificación push al repartidor
- Email de recordatorio
- Bloqueo de nuevas asignaciones (opcional)
```

---

## 🚀 Implementación Recomendada

**Prioridad Alta:**
1. ✅ Agregar campo `cashOwed` a wallets (ya existe)
2. ✅ Agregar campo `cashPending` a wallets (ya existe)
3. ❌ Agregar campo `cashSettled` a orders
4. ❌ Implementar lógica al entregar efectivo
5. ❌ Implementar descuento automático
6. ❌ Implementar pago manual con tarjeta
7. ❌ Panel UI para repartidor

**Prioridad Media:**
8. ❌ Depósito en punto físico (admin)
9. ❌ Alertas y notificaciones
10. ❌ Reportes de liquidación

**Prioridad Baja:**
11. ❌ Bloqueo automático si deuda > X
12. ❌ Historial detallado de liquidaciones
