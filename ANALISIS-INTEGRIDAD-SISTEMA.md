# 🔒 ANÁLISIS COMPLETO DE INTEGRIDAD DEL SISTEMA NEMY

## 📊 ROLES Y PERMISOS DEL SISTEMA

### 1. CUSTOMER (Cliente)
**Permisos:**
- ✅ Crear pedidos
- ✅ Ver sus propios pedidos
- ✅ Cancelar pedidos (solo en periodo de arrepentimiento 60s)
- ✅ Agregar reseñas
- ✅ Ver negocios y productos
- ❌ NO puede ver pedidos de otros
- ❌ NO puede modificar estados (excepto cancelar)

**Límites Financieros:**
- Monto mínimo pedido: $50.00 MXN
- Monto máximo pedido: $5,000.00 MXN
- Sin acceso a wallets

### 2. BUSINESS_OWNER (Dueño de Negocio)
**Permisos:**
- ✅ Ver pedidos de SUS negocios únicamente
- ✅ Cambiar estados: confirmed, preparing, ready, cancelled
- ✅ Gestionar productos de SUS negocios
- ✅ Ver estadísticas de SUS negocios
- ✅ Acceder a wallet propio
- ✅ Solicitar retiros
- ❌ NO puede ver pedidos de otros negocios
- ❌ NO puede cambiar estados de delivery (picked_up, on_the_way, delivered)

**Límites Financieros:**
- Comisión: 70% del total del pedido
- Retiro mínimo: $100.00 MXN
- Retiro máximo: $50,000.00 MXN por día
- Fondos retenidos: 0 horas (liberación inmediata)

### 3. DELIVERY_DRIVER (Repartidor)
**Permisos:**
- ✅ Ver pedidos disponibles en su zona (10km)
- ✅ Aceptar pedidos disponibles
- ✅ Cambiar estados: picked_up, on_the_way, delivered
- ✅ Ver pedidos asignados a él
- ✅ Acceder a wallet propio
- ✅ Solicitar retiros
- ❌ NO puede ver pedidos de otros repartidores
- ❌ NO puede modificar pedidos no asignados
- ❌ NO puede cambiar estados de negocio (confirmed, preparing, ready)

**Límites Financieros:**
- Comisión: 15% del total del pedido
- Retiro mínimo: $50.00 MXN
- Retiro máximo: $10,000.00 MXN por día
- Fondos: Liberación inmediata al completar entrega

### 4. ADMIN (Administrador)
**Permisos:**
- ✅ Ver todos los pedidos
- ✅ Ver todos los negocios
- ✅ Ver todos los usuarios
- ✅ Cambiar cualquier estado de pedido
- ✅ Gestionar usuarios (activar/desactivar)
- ✅ Ver métricas financieras
- ✅ Aprobar/rechazar retiros
- ❌ NO puede modificar comisiones (solo super_admin)
- ❌ NO puede eliminar transacciones

**Límites:**
- Sin límites de visualización
- Puede override validaciones con confirmación

### 5. SUPER_ADMIN (Super Administrador)
**Permisos:**
- ✅ Todos los permisos de admin
- ✅ Modificar comisiones del sistema
- ✅ Modificar configuración global
- ✅ Acceder a logs de auditoría
- ✅ Eliminar usuarios/negocios
- ✅ Acceso total al sistema

**Límites:**
- Sin límites
- Todas las acciones son auditadas

---

## 💰 SISTEMA FINANCIERO CENTRALIZADO

### FUENTE ÚNICA DE VERDAD: `unifiedFinancialService.ts`

#### Comisiones (INMUTABLES sin super_admin):
```typescript
PLATFORM: 15%  // Comisión NEMY
BUSINESS: 70%  // Ganancia negocio
DRIVER:   15%  // Ganancia repartidor
TOTAL:   100%  // DEBE sumar exactamente 100%
```

#### Validaciones Críticas:
1. **Suma de comisiones = 100%**
   ```typescript
   if (Math.abs(total - 1.0) > 0.001) {
     throw Error("Comisiones deben sumar 100%")
   }
   ```

2. **Total del pedido**
   ```typescript
   total = subtotal + deliveryFee + tax
   platform + business + driver = total
   ```

3. **Balance no negativo**
   ```typescript
   if (newBalance < 0) {
     throw Error("Balance insuficiente")
   }
   ```

4. **Transacciones atómicas**
   - Usa `db.transaction()` para garantizar consistencia
   - Si falla una operación, se revierten todas

---

## 🔴 PROBLEMAS CRÍTICOS ENCONTRADOS

### 1. ❌ Cálculos Financieros Duplicados

**Problema:** Múltiples lugares calculan comisiones
```typescript
// ❌ INCORRECTO - En apiRoutes.ts línea ~3100
const platformCommission = Math.round(totalRevenue * 0.15);
const businessPayouts = Math.round(totalRevenue * 0.70);
const driverPayouts = Math.round(totalRevenue * 0.15);
```

**Solución:** Usar SOLO `financialService`
```typescript
// ✅ CORRECTO
const commissions = await financialService.calculateCommissions(totalRevenue);
```

**Ubicaciones a corregir:**
- `server/apiRoutes.ts` - Líneas 3100, 3500, 4200
- `server/financeService.ts` - Líneas 120, 250
- Cualquier cálculo inline de comisiones

---

### 2. ❌ Validación de Total Inconsistente

**Problema:** No se valida que subtotal + deliveryFee = total
```typescript
// ❌ FALTA VALIDACIÓN
await db.insert(orders).values({
  subtotal: 10000,
  deliveryFee: 2500,
  total: 12500 // ¿Quién valida esto?
});
```

**Solución:** Validar SIEMPRE antes de insertar
```typescript
// ✅ CORRECTO
const calculatedTotal = FinancialCalculator.calculateOrderTotal(
  subtotal, deliveryFee, tax
);

if (calculatedTotal !== total) {
  throw Error("Total inválido");
}
```

---

### 3. ❌ Actualización de Wallet Sin Transacción

**Problema:** Actualizar balance sin registrar transacción
```typescript
// ❌ INCORRECTO
await db.update(wallets)
  .set({ balance: newBalance })
  .where(eq(wallets.userId, userId));
// ¿Dónde está la transacción?
```

**Solución:** Usar método centralizado
```typescript
// ✅ CORRECTO
await financialService.updateWalletBalance(
  userId, amount, type, orderId, description
);
// Actualiza wallet Y crea transacción atómicamente
```

---

### 4. ❌ Comisiones No Validadas en Pedidos

**Problema:** Pedidos sin validar que comisiones suman 100%
```typescript
// ❌ FALTA VALIDACIÓN
await db.update(orders).set({
  platformFee: 1500,
  businessEarnings: 7000,
  deliveryEarnings: 1500,
  // ¿Suman 10000 (total)?
});
```

**Solución:** Validar antes de guardar
```typescript
// ✅ CORRECTO
const commissions = await financialService.calculateCommissions(order.total);
// Garantiza que platform + business + driver = total

await db.update(orders).set({
  platformFee: commissions.platform,
  businessEarnings: commissions.business,
  deliveryEarnings: commissions.driver,
});
```

---

## ✅ CORRECCIONES IMPLEMENTADAS

### 1. Centralizar Cálculos Financieros

**Archivo:** `server/financialIntegrity.ts` (NUEVO)
```typescript
export class FinancialIntegrity {
  // Validar pedido completo
  static async validateOrder(order: Order): Promise<ValidationResult> {
    // 1. Validar total
    const calculatedTotal = order.subtotal + order.deliveryFee;
    if (calculatedTotal !== order.total) {
      return { valid: false, error: "Total inválido" };
    }

    // 2. Validar comisiones si existen
    if (order.platformFee && order.businessEarnings && order.deliveryEarnings) {
      const commissionTotal = order.platformFee + order.businessEarnings + order.deliveryEarnings;
      if (commissionTotal !== order.total) {
        return { valid: false, error: "Comisiones no suman total" };
      }
    }

    return { valid: true };
  }

  // Validar transacción de wallet
  static async validateWalletTransaction(
    userId: string,
    amount: number,
    type: string
  ): Promise<ValidationResult> {
    const [wallet] = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, userId))
      .limit(1);

    if (!wallet) {
      return { valid: false, error: "Wallet no existe" };
    }

    // Validar balance suficiente para retiros
    if (amount < 0 && wallet.balance + amount < 0) {
      return { valid: false, error: "Balance insuficiente" };
    }

    // Validar límites por rol
    const limits = await getWithdrawalLimits(userId);
    if (Math.abs(amount) > limits.maxDaily) {
      return { valid: false, error: `Límite diario excedido: ${limits.maxDaily}` };
    }

    return { valid: true };
  }
}
```

---

### 2. Middleware de Validación Financiera

**Archivo:** `server/financialMiddleware.ts` (NUEVO)
```typescript
export function validateOrderFinancials(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { subtotal, deliveryFee, total } = req.body;

  const calculatedTotal = subtotal + deliveryFee;
  if (calculatedTotal !== total) {
    return res.status(400).json({
      error: "Total inválido",
      expected: calculatedTotal,
      received: total
    });
  }

  next();
}

export function validateCommissionRates(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { platform, business, driver } = req.body;

  const total = platform + business + driver;
  if (Math.abs(total - 1.0) > 0.001) {
    return res.status(400).json({
      error: "Comisiones deben sumar 100%",
      current: `${(total * 100).toFixed(2)}%`
    });
  }

  next();
}
```

---

### 3. Auditoría de Transacciones Financieras

**Todas las operaciones financieras deben ser auditadas:**
```typescript
await db.insert(auditLogs).values({
  userId: req.user.id,
  action: "financial_transaction",
  entityType: "wallet",
  entityId: walletId,
  changes: JSON.stringify({
    type,
    amount,
    balanceBefore,
    balanceAfter,
    orderId
  }),
  ipAddress: req.ip,
  userAgent: req.headers["user-agent"]
});
```

---

## 🔒 REGLAS DE INTEGRIDAD FINANCIERA

### REGLA 1: Un Solo Punto de Cálculo
```typescript
// ✅ SIEMPRE usar financialService
const commissions = await financialService.calculateCommissions(total);

// ❌ NUNCA calcular inline
const platform = total * 0.15; // PROHIBIDO
```

### REGLA 2: Validar Antes de Guardar
```typescript
// ✅ Validar primero
const validation = await FinancialIntegrity.validateOrder(order);
if (!validation.valid) {
  throw Error(validation.error);
}
await db.insert(orders).values(order);
```

### REGLA 3: Transacciones Atómicas
```typescript
// ✅ Usar transacciones
await db.transaction(async (tx) => {
  await tx.update(wallets).set({ balance: newBalance });
  await tx.insert(transactions).values({ ... });
});
```

### REGLA 4: Auditar Todo
```typescript
// ✅ Auditar operaciones críticas
await auditFinancialOperation(userId, action, amount, orderId);
```

### REGLA 5: Validar Límites por Rol
```typescript
// ✅ Verificar límites
const limits = ROLE_LIMITS[user.role];
if (amount > limits.maxWithdrawal) {
  throw Error("Límite excedido");
}
```

---

## 📋 CHECKLIST DE INTEGRIDAD

### Pedidos:
- [ ] Total = subtotal + deliveryFee validado
- [ ] Comisiones suman 100% del total
- [ ] Estados siguen flujo válido
- [ ] Ownership validado antes de modificar
- [ ] Transiciones de estado auditadas

### Wallets:
- [ ] Balance nunca negativo
- [ ] Todas las actualizaciones con transacción
- [ ] Límites de retiro por rol respetados
- [ ] Transacciones atómicas (wallet + transaction)
- [ ] Auditoría de todas las operaciones

### Comisiones:
- [ ] Calculadas con financialService
- [ ] Validadas antes de guardar
- [ ] Suma exacta al total del pedido
- [ ] No hay cálculos inline
- [ ] Cache invalidado al cambiar rates

### Seguridad:
- [ ] Ownership validado en todos los endpoints
- [ ] Roles respetan jerarquía
- [ ] Rate limiting por usuario
- [ ] Auditoría de acciones críticas
- [ ] Validación de estados por rol

---

## 🎯 PRÓXIMOS PASOS

### Prioridad CRÍTICA:
1. ✅ Reemplazar cálculos inline con financialService
2. ✅ Agregar validación de total en creación de pedidos
3. ✅ Implementar FinancialIntegrity.validateOrder()
4. ✅ Auditar todas las transacciones financieras

### Prioridad ALTA:
5. [ ] Tests de integridad financiera
6. [ ] Dashboard de auditoría para super_admin
7. [ ] Alertas de inconsistencias
8. [ ] Reconciliación diaria automática

---

**Estado:** 🔴 REQUIERE CORRECCIONES INMEDIATAS  
**Riesgo:** ALTO - Posible corrupción de datos financieros  
**Tiempo estimado:** 4 horas para correcciones críticas
