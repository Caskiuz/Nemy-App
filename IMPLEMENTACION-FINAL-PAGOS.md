# 🚀 Implementación Final - Sistema Seguro de Pagos

## ✅ ARCHIVOS CREADOS

1. ✅ `server/cashSecurityService.ts` - Servicio de seguridad de efectivo
2. ✅ `server/securePaymentIntegration.ts` - Endpoints y middleware
3. ✅ `server/cashSecurityCron.ts` - Cron jobs automáticos
4. ✅ `.env.local` - Variables de entorno actualizadas

## 🔧 PASO 1: Integrar Validación en apiRoutes.ts

Busca el endpoint `POST /delivery/accept-order/:id` (línea ~3329) y agrega la validación:

```typescript
// ANTES (línea 3321)
router.post(
  "/delivery/accept-order/:id",
  authenticateToken,
  async (req, res) => {
    try {
      const { orders } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq } = await import("drizzle-orm");

      console.log(`✅ POST /delivery/accept-order/${req.params.id} - Driver: ${req.user!.id}`);

      // Get the order
      const [order] = await db
        .select()
        .from(orders)
        .where(eq(orders.id, req.params.id))
        .limit(1);

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      if (order.deliveryPersonId) {
        return res.status(400).json({ error: "Order already assigned" });
      }

      // ⬇️ AGREGAR AQUÍ LA VALIDACIÓN DE EFECTIVO ⬇️
```

**AGREGAR DESPUÉS DE LA LÍNEA `if (order.deliveryPersonId) {...}`:**

```typescript
      // ✅ NUEVA VALIDACIÓN: Verificar si puede aceptar efectivo
      if (order.paymentMethod === 'cash') {
        const { cashSecurityService } = await import('./cashSecurityService');
        const canAccept = await cashSecurityService.canAcceptCashOrder(req.user!.id);
        
        if (!canAccept.allowed) {
          return res.status(403).json({ 
            error: canAccept.reason,
            code: 'CASH_LIMIT_EXCEEDED',
            action: 'LIQUIDATE_CASH'
          });
        }
      }

      // Assign driver and update status
      await db
        .update(orders)
        .set({
          deliveryPersonId: req.user!.id,
          status: "picked_up",
          assignedAt: new Date()
        })
        .where(eq(orders.id, req.params.id));
```

## 🔧 PASO 2: Verificar Integración en server.ts

Ya está integrado ✅:
- Rutas de seguridad de pagos
- Cron job de efectivo

## 📱 PASO 3: Actualizar Frontend (Cliente React Native)

### A) Crear Hook para Estado de Efectivo

Crea `client/hooks/useCashStatus.ts`:

```typescript
import { useState, useEffect } from 'react';
import { API_URL } from '../constants/api';
import { useAuth } from '../contexts/AuthContext';

export function useCashStatus() {
  const { token, user } = useAuth();
  const [cashStatus, setCashStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'delivery_driver') {
      fetchCashStatus();
    }
  }, [user]);

  const fetchCashStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/driver/cash-status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setCashStatus(data);
      }
    } catch (error) {
      console.error('Error fetching cash status:', error);
    } finally {
      setLoading(false);
    }
  };

  return { cashStatus, loading, refresh: fetchCashStatus };
}
```

### B) Actualizar WalletScreen (Driver)

En `client/screens/WalletScreen.tsx`, agrega alertas de efectivo:

```typescript
import { useCashStatus } from '../hooks/useCashStatus';

export default function WalletScreen() {
  const { cashStatus } = useCashStatus();

  return (
    <ScrollView>
      {/* Alerta de Efectivo Pendiente */}
      {cashStatus?.cashOwed > 0 && (
        <View style={styles.alertContainer}>
          {cashStatus.daysRemaining <= 2 ? (
            <View style={[styles.alert, styles.alertDanger]}>
              <Text style={styles.alertTitle}>⚠️ URGENTE</Text>
              <Text style={styles.alertText}>
                Tienes {cashStatus.daysRemaining} días para liquidar 
                ${cashStatus.cashOwed.toFixed(2)} o tu cuenta será bloqueada
              </Text>
            </View>
          ) : cashStatus.daysRemaining <= 5 ? (
            <View style={[styles.alert, styles.alertWarning]}>
              <Text style={styles.alertTitle}>⚠️ Recordatorio</Text>
              <Text style={styles.alertText}>
                Recuerda liquidar ${cashStatus.cashOwed.toFixed(2)} en efectivo
              </Text>
            </View>
          ) : (
            <View style={[styles.alert, styles.alertInfo]}>
              <Text style={styles.alertText}>
                Efectivo pendiente: ${cashStatus.cashOwed.toFixed(2)}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Resto del wallet... */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  alertContainer: {
    padding: 16,
  },
  alert: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  alertDanger: {
    backgroundColor: '#fee',
    borderColor: '#f00',
    borderWidth: 2,
  },
  alertWarning: {
    backgroundColor: '#ffc',
    borderColor: '#fa0',
    borderWidth: 1,
  },
  alertInfo: {
    backgroundColor: '#eef',
    borderColor: '#00f',
    borderWidth: 1,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  alertText: {
    fontSize: 14,
  },
});
```

### C) Actualizar Aceptar Pedido

En `client/screens/DriverAvailableOrdersScreen.tsx`:

```typescript
const acceptOrder = async (orderId: string) => {
  try {
    const response = await fetch(`${API_URL}/delivery/accept-order/${orderId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.code === 'CASH_LIMIT_EXCEEDED') {
        Alert.alert(
          'Límite de Efectivo Alcanzado',
          data.error,
          [
            { 
              text: 'Ver Wallet', 
              onPress: () => navigation.navigate('Wallet') 
            },
            { text: 'OK' }
          ]
        );
      } else {
        Alert.alert('Error', data.error);
      }
      return;
    }

    Alert.alert('Éxito', 'Pedido aceptado');
    navigation.navigate('MyDeliveries');
  } catch (error: any) {
    Alert.alert('Error', error.message);
  }
};
```

## 📊 PASO 4: Panel de Admin

En `client/screens/AdminDashboardScreen.tsx`, agrega estadísticas de efectivo:

```typescript
const [cashStats, setCashStats] = useState<any>(null);

useEffect(() => {
  fetchCashStats();
}, []);

const fetchCashStats = async () => {
  try {
    const response = await fetch(`${API_URL}/admin/cash-stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json();
    if (data.success) {
      setCashStats(data.stats);
    }
  } catch (error) {
    console.error('Error fetching cash stats:', error);
  }
};

// En el render:
{cashStats && (
  <View style={styles.statsCard}>
    <Text style={styles.statsTitle}>💵 Efectivo Pendiente</Text>
    <Text style={styles.statsValue}>
      ${cashStats.totalCashOwed.toFixed(2)}
    </Text>
    <Text style={styles.statsDetail}>
      {cashStats.driversWithDebt} drivers con deuda
    </Text>
    {cashStats.overdueDrivers > 0 && (
      <Text style={[styles.statsDetail, styles.danger]}>
        ⚠️ {cashStats.overdueDrivers} drivers vencidos
      </Text>
    )}
  </View>
)}
```

## 🧪 PASO 5: Testing

### A) Probar Límite de Efectivo

```bash
# 1. Crear pedido en efectivo
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer $DRIVER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "businessId": "...",
    "items": [...],
    "paymentMethod": "cash",
    "total": 10000
  }'

# 2. Completar pedido (cashOwed aumenta)
curl -X POST http://localhost:5000/api/delivery/complete-order/ORDER_ID \
  -H "Authorization: Bearer $DRIVER_TOKEN"

# 3. Verificar estado de efectivo
curl http://localhost:5000/api/driver/cash-status \
  -H "Authorization: Bearer $DRIVER_TOKEN"

# 4. Intentar aceptar otro pedido en efectivo (debería fallar si excede límite)
curl -X POST http://localhost:5000/api/delivery/accept-order/ORDER_ID \
  -H "Authorization: Bearer $DRIVER_TOKEN"
```

### B) Probar Cron Job Manual

```bash
curl -X POST http://localhost:5000/api/admin/check-cash-debts \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### C) Ver Estadísticas

```bash
curl http://localhost:5000/api/admin/cash-stats \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

## 📋 CHECKLIST FINAL

- [ ] Integrar validación en `apiRoutes.ts` (línea ~3340)
- [ ] Verificar que `server.ts` tiene el cron job
- [ ] Crear hook `useCashStatus.ts` en frontend
- [ ] Actualizar `WalletScreen.tsx` con alertas
- [ ] Actualizar `DriverAvailableOrdersScreen.tsx` con manejo de errores
- [ ] Agregar estadísticas en `AdminDashboardScreen.tsx`
- [ ] Probar flujo completo con pedidos en efectivo
- [ ] Verificar cron job ejecutándose
- [ ] Documentar para el equipo

## 🚀 COMANDOS RÁPIDOS

```bash
# Iniciar servidor con logs
npm run server:demo

# Ver logs de cron jobs
tail -f logs/jobs-out-0.log

# Probar endpoint de efectivo
curl http://localhost:5000/api/driver/cash-status \
  -H "Authorization: Bearer $TOKEN"

# Ejecutar revisión manual
curl -X POST http://localhost:5000/api/admin/check-cash-debts \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

## 📚 DOCUMENTACIÓN ADICIONAL

- [SECURE-PAYMENT-SYSTEM.md](./SECURE-PAYMENT-SYSTEM.md) - Documentación completa
- [COMO_FUNCIONA_PAGOS.md](./COMO_FUNCIONA_PAGOS.md) - Flujo de pagos
- [FINANCIAL-AUDIT-SYSTEM.md](./FINANCIAL-AUDIT-SYSTEM.md) - Sistema de auditoría

## ✅ PRÓXIMOS PASOS

1. **Stripe Connect** (Recomendado para producción)
   - Eliminar wallets de DB
   - Pagos directos a cuentas bancarias
   - Split payments automáticos

2. **Mejoras de Efectivo**
   - Integración con OXXO Pay
   - Puntos de liquidación físicos
   - Validación fotográfica

3. **Notificaciones**
   - SMS con Twilio
   - Push notifications
   - Emails de recordatorio

---

**Sistema implementado: Enero 2026**
**Nivel de seguridad: Producción**
**Modelo: Uber/Rappi**
