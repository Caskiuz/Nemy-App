# 💳 GUÍA: Retiros Reales con Stripe Connect

## 🎯 OBJETIVO
Permitir que drivers y negocios retiren dinero REAL a sus cuentas bancarias vía Stripe.

## 📋 REQUISITOS

1. **Cuenta de Stripe** (ya la tienes)
2. **Stripe Connect habilitado**
3. **Cuentas conectadas** para cada driver/negocio

## 🔧 CONFIGURACIÓN

### 1. Habilitar Stripe Connect

Ve a: https://dashboard.stripe.com/settings/connect

1. Click en "Get started with Connect"
2. Selecciona "Platform or marketplace"
3. Completa el formulario de tu plataforma (NEMY)
4. Copia el **Client ID** que te dan

### 2. Agregar Client ID al .env.local

```env
STRIPE_CONNECT_CLIENT_ID=ca_xxxxxxxxxxxxx
```

### 3. Crear Cuenta Conectada (Driver/Negocio)

Cada driver/negocio debe:

1. Ir a su perfil en la app
2. Click en "Conectar cuenta bancaria"
3. Completar el formulario de Stripe (datos bancarios)
4. Stripe verifica la cuenta (1-2 días)

## 🚀 FLUJO DE RETIRO

```
Driver solicita retiro de $100
  ↓
Sistema verifica saldo disponible
  ↓
Stripe transfiere $100 a cuenta bancaria del driver
  ↓
Driver recibe dinero en 1-2 días hábiles
  ↓
✅ Retiro completado
```

## 💰 COSTOS

- **Stripe Connect**: 0.25% por transferencia
- **Retiro de $100**: Costo = $0.25
- **Driver recibe**: $99.75

## 🔐 SEGURIDAD

- ✅ Stripe maneja toda la verificación bancaria
- ✅ Cumplimiento PCI automático
- ✅ Protección contra fraude
- ✅ Reversión de cargos

## 📱 IMPLEMENTACIÓN EN LA APP

### Endpoint: Crear Cuenta Conectada

```bash
POST /api/connect/create
Authorization: Bearer {token}

{
  "email": "driver@example.com",
  "businessName": "Pedro Repartidor" # opcional
}

Response:
{
  "success": true,
  "accountId": "acct_xxxxx",
  "onboardingUrl": "https://connect.stripe.com/setup/..."
}
```

### Endpoint: Solicitar Retiro

```bash
POST /api/wallet/withdraw
Authorization: Bearer {token}

{
  "amount": 10000, # $100 en centavos
  "method": "stripe_connect"
}

Response:
{
  "success": true,
  "withdrawalId": "wd_xxxxx",
  "amount": 10000,
  "fee": 25,
  "netAmount": 9975,
  "estimatedArrival": "2026-02-09"
}
```

## 🧪 TESTING (Modo Test)

Para probar sin dinero real:

1. Usa tu **Test API Key**: `sk_test_...`
2. Datos bancarios de prueba:
   - Routing: 110000000
   - Account: 000123456789
3. Stripe simula el retiro instantáneamente

## 🎯 ALTERNATIVA RÁPIDA: Retiros Manuales

Si no quieres configurar Stripe Connect ahora:

### Opción 1: Transferencia Bancaria Manual

```sql
-- Marcar retiro como pendiente
INSERT INTO withdrawals (user_id, amount, method, status)
VALUES ('driver-1', 10000, 'bank_transfer', 'pending');

-- Admin procesa manualmente
-- Hace transferencia bancaria
-- Marca como completado
UPDATE withdrawals SET status = 'completed' WHERE id = 'xxx';
```

### Opción 2: OXXO/Efectivo

```sql
-- Driver va a OXXO
-- Deposita efectivo
-- Admin marca como completado
UPDATE withdrawals SET status = 'completed', method = 'oxxo' WHERE id = 'xxx';
```

## 📊 DASHBOARD ADMIN

Ver retiros pendientes:

```bash
GET /api/admin/withdrawals
Authorization: Bearer {admin_token}

Response:
{
  "withdrawals": [
    {
      "id": "wd_1",
      "userId": "driver-1",
      "userName": "Pedro Repartidor",
      "amount": 10000,
      "method": "stripe_connect",
      "status": "pending",
      "createdAt": "2026-02-07T20:00:00Z"
    }
  ]
}
```

Aprobar retiro:

```bash
PUT /api/admin/withdrawals/{id}
Authorization: Bearer {admin_token}

{
  "status": "completed"
}
```

## ✅ CHECKLIST

- [ ] Habilitar Stripe Connect en dashboard
- [ ] Agregar STRIPE_CONNECT_CLIENT_ID a .env
- [ ] Crear cuenta conectada para driver de prueba
- [ ] Probar retiro en modo test
- [ ] Verificar que el dinero llegue a la cuenta
- [ ] Activar modo live

## 🆘 SOPORTE

Si tienes problemas:
1. Verifica que Stripe Connect esté habilitado
2. Revisa los logs de Stripe Dashboard
3. Contacta a soporte de Stripe: https://support.stripe.com

---

**¿Quieres que configure Stripe Connect ahora o prefieres retiros manuales por ahora?**
