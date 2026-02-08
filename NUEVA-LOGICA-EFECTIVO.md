# Nueva Lógica de Efectivo (Estilo Rappi)

## 🎯 Concepto

El repartidor actúa como intermediario financiero:
- Cobra TODO al cliente
- Paga al negocio el precio base
- Se queda su tarifa de envío
- Resguarda la comisión de NEMY para depositar los viernes

---

## 💰 Ejemplo Numérico

### Producto: $200

```
Cliente paga:
├─ Producto base:        $200
├─ Comisión NEMY (15%):  $30  ← Se agrega al precio
├─ Subtotal:             $230
└─ Envío:                $30
   ═══════════════════════════
   TOTAL:                $260
```

### Flujo del Repartidor

```
Cobra del cliente:       $260
├─ Paga al negocio:      -$200 (precio base)
├─ Se queda (envío):     $30
└─ Resguarda (NEMY):     $30
   ═══════════════════════════
   Debe depositar:       $30 (viernes)
```

---

## 🔄 Cambios en el Sistema

### 1. Cálculo de Precios (Frontend)

```typescript
// Antes (INCORRECTO)
subtotal = productos.reduce((sum, p) => sum + p.price * p.qty, 0)
deliveryFee = 30
total = subtotal + deliveryFee

// Después (CORRECTO)
productosBase = productos.reduce((sum, p) => sum + p.price * p.qty, 0)
nemyCommission = Math.round(productosBase * 0.15)  // 15% markup
subtotal = productosBase + nemyCommission
deliveryFee = 30
total = subtotal + deliveryFee
```

### 2. Distribución en Efectivo (Backend)

```typescript
// cashSettlementService.ts

const productosBase = order.subtotal / 1.15  // Quitar el 15% markup
const nemyCommission = order.subtotal - productosBase

// Repartidor cobra
const totalCobrado = order.total  // $260

// Repartidor paga al negocio
const pagoNegocio = productosBase  // $200

// Repartidor se queda
const driverKeeps = order.deliveryFee  // $30

// Repartidor debe depositar
const debeDepositar = nemyCommission  // $30
```

### 3. Transacciones

```typescript
// Efectivo cobrado
{
  type: "cash_collected",
  amount: order.total,  // $260
  description: "Efectivo cobrado del cliente"
}

// Pago al negocio (deuda)
{
  type: "cash_debt_business",
  amount: productosBase,  // $200
  description: "Debes pagar al negocio"
}

// Ganancia del repartidor
{
  type: "delivery_income",
  amount: order.deliveryFee,  // $30
  description: "Tu ganancia por entrega"
}

// Comisión NEMY (deuda)
{
  type: "cash_debt_nemy",
  amount: nemyCommission,  // $30
  description: "Debes depositar a NEMY (viernes)"
}
```

---

## 📊 Wallet del Repartidor

```
Balance:                 $30  (su ganancia)
Cash Owed (Negocio):     $200 (debe entregar al negocio)
Cash Owed (NEMY):        $30  (debe depositar viernes)
═══════════════════════════════
Disponible para retirar: $30  (después de pagar todo)
```

---

## 🏪 Wallet del Negocio

```
Pending Balance:         $200 (esperando pago del repartidor)
```

---

## ⚠️ Consideraciones

1. **Repartidor necesita capital inicial**: Debe tener dinero para pagar al negocio antes de cobrar al cliente

2. **Liquidación semanal**: Los viernes se liquida la deuda con NEMY

3. **Bloqueo por falta de pago**: Si no deposita el viernes, se bloquea el lunes

4. **Negocio recibe efectivo**: El repartidor entrega el dinero directamente al negocio

---

## 🔧 Archivos a Modificar

1. `cashSettlementService.ts` - Nueva lógica de distribución
2. `CartScreen.tsx` - Agregar 15% markup al subtotal
3. `CheckoutScreen.tsx` - Mostrar desglose correcto
4. `DeliveryEarningsScreen.tsx` - Mostrar deudas separadas (negocio + NEMY)
5. `commissionService.ts` - Actualizar cálculos

---

**Hecho con ❤️ para NEMY**
