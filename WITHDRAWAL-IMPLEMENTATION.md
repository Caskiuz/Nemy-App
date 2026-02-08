# Sistema de Retiros - Implementación Completa

## ✅ Archivos Creados

### Backend

1. **server/withdrawalService.ts**
   - Servicio completo de retiros
   - Validación de mínimo $50 MXN
   - Dos métodos: Stripe (automático) y Transferencia bancaria (manual)
   - Validación de cashOwed
   - Historial de retiros

2. **server/withdrawalRoutes.ts**
   - `POST /api/withdrawals/request` - Solicitar retiro
   - `GET /api/withdrawals/history/:userId` - Ver historial
   - `GET /api/withdrawals/admin/pending` - Admin: ver pendientes
   - `POST /api/withdrawals/admin/approve/:id` - Admin: aprobar

### Frontend

3. **client/screens/WithdrawalScreen.tsx**
   - Card de saldo disponible
   - Formulario de retiro con validaciones
   - Selector de método (Stripe/Transferencia)
   - Formulario de datos bancarios (CLABE 18 dígitos)
   - Historial de retiros con estados

### Schema

4. **shared/schema-mysql.ts**
   - Nueva tabla `withdrawalRequests` con campos:
     - userId, walletId, amount
     - method (stripe, bank_transfer)
     - status (pending, completed, failed, cancelled)
     - bankClabe, bankName, accountHolder
     - stripePayoutId, approvedBy
     - requestedAt, completedAt

## 📝 Archivos Modificados

1. **server/apiRoutes.ts**
   - Agregada importación de withdrawalRoutes
   - Ruta `/api/withdrawals` integrada

2. **client/navigation/BusinessTabNavigator.tsx**
   - Reemplazado CashSettlement con WithdrawalScreen
   - Tab "Retiros" con ícono dollar-sign

3. **client/navigation/DriverTabNavigator.tsx**
   - Reemplazado DeliveryEarningsScreen con WithdrawalScreen
   - Tab "Retiros" con ícono dollar-sign

4. **WALLET-PAYMENT-LOGIC.md**
   - Actualizado con sistema implementado
   - Documentación completa del flujo

## 🎯 Características Implementadas

### Validaciones
- ✅ Mínimo $50 MXN
- ✅ Máximo = saldo disponible
- ✅ No puede retirar si tiene cashOwed > 0
- ✅ CLABE debe tener 18 dígitos
- ✅ Datos bancarios completos para transferencia

### Métodos de Retiro

**1. Stripe (Automático)**
- Procesamiento inmediato
- Llega en 1-2 días hábiles
- Sin intervención manual
- Requiere Stripe Connect configurado

**2. Transferencia Bancaria (Manual)**
- Solicitud enviada a admin
- Admin procesa vía SPEI
- Llega en 3-5 días hábiles
- Requiere CLABE + datos bancarios

### UI/UX
- ✅ Card de saldo con efectivo pendiente
- ✅ Formulario intuitivo
- ✅ Botones de método con estados activos
- ✅ Historial con estados (Completado, Pendiente, Fallido)
- ✅ Alertas de éxito/error
- ✅ Loading states

## 🚀 Próximos Pasos

### 1. Aplicar Schema a Base de Datos
```bash
npm run db:push
```

### 2. Probar el Flujo

**Como Negocio:**
1. Iniciar sesión como business_owner
2. Ir a tab "Retiros"
3. Ver saldo disponible
4. Ingresar monto ($50 mínimo)
5. Elegir método (Stripe o Transferencia)
6. Si es transferencia, llenar CLABE + datos
7. Solicitar retiro
8. Ver historial

**Como Repartidor:**
1. Iniciar sesión como delivery_driver
2. Ir a tab "Retiros"
3. Mismo flujo que negocio

**Como Admin:**
1. Ver retiros pendientes: `GET /api/withdrawals/admin/pending`
2. Aprobar retiro: `POST /api/withdrawals/admin/approve/:id`

### 3. Configurar Stripe Connect (Opcional)

Para retiros automáticos vía Stripe:

```typescript
// 1. Crear cuenta Stripe Connect
POST /api/connect/create
{
  userId: "user_id",
  accountType: "business" | "driver",
  email: "user@email.com"
}

// 2. Usuario completa onboarding en Stripe
// 3. Sistema valida cuenta activa
// 4. Retiros automáticos habilitados
```

## 📊 Flujo Completo

```
┌─────────────────────────────────────────────────────────┐
│                    Usuario (Negocio/Repartidor)         │
│                                                          │
│  1. Ve saldo: $100.00 disponible                       │
│  2. Solicita retiro: $50.00                            │
│  3. Elige método: Stripe o Transferencia               │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                    Backend (withdrawalService)           │
│                                                          │
│  1. Valida mínimo $50                                   │
│  2. Valida saldo disponible                             │
│  3. Valida cashOwed = 0                                 │
│  4. Crea withdrawalRequest                              │
└─────────────────────┬───────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
        ▼                           ▼
┌──────────────────┐      ┌──────────────────┐
│  Método: Stripe  │      │ Método: Transfer │
│                  │      │                  │
│  1. Stripe Payout│      │  1. Status: pending
│  2. Automático   │      │  2. Admin aprueba│
│  3. 1-2 días     │      │  3. SPEI manual  │
│  4. Status:      │      │  4. 3-5 días     │
│     completed    │      │  5. Status:      │
│                  │      │     completed    │
└──────────────────┘      └──────────────────┘
```

## 🔐 Seguridad

- ✅ Autenticación requerida (JWT token)
- ✅ Validación de ownership (solo su wallet)
- ✅ Rate limiting (5 solicitudes por usuario)
- ✅ Audit logs de todas las acciones
- ✅ Validación de datos bancarios
- ✅ Estados de transacción

## 📱 Pantallas

### Pantalla de Retiros
```
┌─────────────────────────────────────┐
│  💰 Tu Saldo                        │
│  $100.00 MXN                        │
│  Efectivo pendiente: $0.00          │
│                                     │
│  [Retirar Fondos]                   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Solicitar Retiro                   │
│                                     │
│  Monto: $______                     │
│  Mínimo: $50.00                     │
│  Máximo: $100.00                    │
│                                     │
│  Método de retiro:                  │
│  ⚡ Stripe (1-2 días)               │
│  🏦 Transferencia (3-5 días)        │
│                                     │
│  [Continuar]                        │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Historial de Retiros               │
│                                     │
│  $50.00 MXN - Stripe                │
│  ✅ Completado - 15/01/2026         │
│                                     │
│  $75.00 MXN - Transferencia         │
│  ⏳ Pendiente - 14/01/2026          │
└─────────────────────────────────────┘
```

## 🎨 Estilos

- Card verde para saldo disponible
- Botones con estados activos (verde)
- Estados de historial con colores:
  - ✅ Completado: Verde (#4CAF50)
  - ⏳ Pendiente: Naranja (#FF9800)
  - ❌ Fallido: Rojo (#f44336)

## 🐛 Troubleshooting

### Error: "Wallet no encontrada"
- Verificar que el usuario tenga wallet creada
- Ejecutar: `npm run db:push` para crear tablas

### Error: "Saldo insuficiente"
- Verificar que balance > cashOwed
- Verificar que amount <= availableBalance

### Error: "CLABE debe tener 18 dígitos"
- Validar formato de CLABE interbancaria
- Solo números, sin espacios ni guiones

### Error: "No tienes cuenta Stripe Connect"
- Usuario debe completar onboarding de Stripe
- Usar método "Transferencia" mientras tanto

## 📚 Referencias

- [Stripe Payouts API](https://stripe.com/docs/payouts)
- [Stripe Connect](https://stripe.com/docs/connect)
- [CLABE Interbancaria](https://www.banxico.org.mx/sistemas-de-pago/clabe.html)

---

**Implementado con ❤️ para NEMY**
**Fecha: Enero 2026**
