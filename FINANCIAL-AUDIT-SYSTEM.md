# Sistema de Auditoría Financiera - NEMY

## 🔒 Blindaje Económico Nivel Bancario

El sistema de auditoría financiera de NEMY valida **6 reglas críticas** de consistencia económica para garantizar que el dinero nunca se pierda ni se duplique.

---

## 📊 Reglas de Auditoría

### 1. **Comisiones Suman 100%**
```
Platform + Business + Driver = 100%
```
- **Qué valida**: Las tasas de comisión configuradas suman exactamente 100%
- **Por qué es crítico**: Si suman más de 100%, se crea dinero de la nada. Si suman menos, se pierde dinero
- **Ejemplo válido**: 15% + 70% + 15% = 100% ✅
- **Ejemplo inválido**: 15% + 70% + 20% = 105% ❌

### 2. **Total Pedido = Subtotal + DeliveryFee + Tax**
```
order.total === order.subtotal + order.deliveryFee + order.tax
```
- **Qué valida**: El total del pedido coincide con la suma de sus componentes
- **Por qué es crítico**: Evita cobrar de más o de menos al cliente
- **Ejemplo válido**: $100 + $25 + $8 = $133 ✅
- **Ejemplo inválido**: $100 + $25 + $8 = $140 ❌

### 3. **Comisiones Distribuidas = Total Pedido**
```
platformFee + businessEarnings + deliveryEarnings === order.total
```
- **Qué valida**: Las comisiones distribuidas suman exactamente el total del pedido
- **Por qué es crítico**: Garantiza que todo el dinero se distribuye correctamente
- **Ejemplo válido**: $20 + $93 + $20 = $133 ✅
- **Ejemplo inválido**: $20 + $93 + $20 = $135 ❌

### 4. **Balance Wallet = Suma Transacciones**
```
wallet.balance === SUM(transactions.amount)
```
- **Qué valida**: El balance de la wallet coincide con la suma de todas sus transacciones
- **Por qué es crítico**: Evita que aparezca o desaparezca dinero de las wallets
- **Ejemplo válido**: Balance $500 = $200 + $150 + $150 ✅
- **Ejemplo inválido**: Balance $600 ≠ $200 + $150 + $150 ❌

### 5. **Cadena de Transacciones Consistente**
```
transaction.balanceAfter === transaction.balanceBefore + transaction.amount
```
- **Qué valida**: Cada transacción tiene balances before/after correctos
- **Por qué es crítico**: Garantiza la integridad del historial contable
- **Ejemplo válido**: $100 (before) + $50 = $150 (after) ✅
- **Ejemplo inválido**: $100 (before) + $50 = $160 (after) ❌

### 6. **Pagos Stripe = Totales de Pedidos**
```
payment.amount === order.total
```
- **Qué valida**: Los pagos en Stripe coinciden con los totales de pedidos
- **Por qué es crítico**: Evita discrepancias entre lo cobrado y lo registrado
- **Ejemplo válido**: Payment $133 = Order $133 ✅
- **Ejemplo inválido**: Payment $133 ≠ Order $140 ❌

---

## 🚀 Endpoints de Auditoría

### **GET /api/audit/full**
Ejecuta auditoría completa de las 6 reglas.

**Requiere**: Admin o Super Admin

**Respuesta**:
```json
{
  "timestamp": "2025-01-15T10:30:00Z",
  "totalChecks": 6,
  "passed": 6,
  "failed": 0,
  "warnings": 0,
  "systemHealth": "healthy",
  "results": [
    {
      "passed": true,
      "rule": "Commission Rates Sum to 100%",
      "details": "✓ Rates valid: Platform 15.0% + Business 70.0% + Driver 15.0% = 100%",
      "severity": "info"
    },
    ...
  ]
}
```

### **GET /api/audit/commission-rates**
Verifica solo las tasas de comisión.

### **GET /api/audit/order-totals**
Verifica solo los totales de pedidos.

### **GET /api/audit/wallet-balances**
Verifica solo los balances de wallets.

---

## 🎯 Uso Recomendado

### **Auditoría Diaria Automática**
```bash
# Ejecutar cada día a las 3 AM
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  https://api.nemy.com/api/audit/full
```

### **Auditoría Antes de Cambios Críticos**
Antes de:
- Cambiar tasas de comisión
- Migrar base de datos
- Actualizar sistema de pagos
- Procesar retiros masivos

### **Auditoría Después de Incidentes**
Después de:
- Errores en producción
- Quejas de usuarios sobre pagos
- Actualizaciones del sistema
- Mantenimiento de base de datos

---

## 🔧 Integración con Monitoreo

### **Alertas Automáticas**
```typescript
// Ejemplo de integración con sistema de alertas
const report = await financialAuditService.runFullAudit();

if (report.systemHealth === "critical") {
  await sendSlackAlert({
    channel: "#finance-alerts",
    message: `🚨 CRITICAL: ${report.failed} financial checks failed!`,
    details: report.results.filter(r => !r.passed)
  });
}
```

### **Dashboard de Salud Financiera**
```typescript
// Endpoint para dashboard en tiempo real
router.get("/admin/financial-health", async (req, res) => {
  const report = await financialAuditService.runFullAudit();
  
  res.json({
    status: report.systemHealth,
    score: (report.passed / report.totalChecks) * 100,
    lastCheck: report.timestamp,
    issues: report.results.filter(r => !r.passed)
  });
});
```

---

## 📈 Métricas de Salud

### **Healthy (Saludable)**
- ✅ Todas las reglas pasan
- ✅ 0 errores críticos
- ✅ 0 advertencias

### **Warning (Advertencia)**
- ⚠️ Algunas reglas fallan con severidad "warning"
- ⚠️ 0 errores críticos
- ⚠️ Requiere revisión pero no es urgente

### **Critical (Crítico)**
- 🚨 Una o más reglas fallan con severidad "critical"
- 🚨 Requiere acción inmediata
- 🚨 Sistema financiero comprometido

---

## 🛡️ Garantías del Sistema

Con este sistema de auditoría, NEMY garantiza:

1. **Conservación del Dinero**: Nunca se crea ni se destruye dinero
2. **Trazabilidad Total**: Cada centavo tiene un historial completo
3. **Consistencia Matemática**: Todas las operaciones cuadran perfectamente
4. **Detección Temprana**: Los errores se detectan antes de afectar usuarios
5. **Confianza Bancaria**: Nivel de seguridad comparable a instituciones financieras

---

## 🔍 Ejemplo de Uso

```typescript
// En el código del servidor
import { financialAuditService } from "./financialAuditService";

// Ejecutar auditoría completa
const report = await financialAuditService.runFullAudit();

console.log(`Sistema: ${report.systemHealth}`);
console.log(`Checks pasados: ${report.passed}/${report.totalChecks}`);

// Revisar resultados
report.results.forEach(result => {
  if (!result.passed) {
    console.error(`❌ ${result.rule}: ${result.details}`);
    if (result.affectedEntities) {
      console.error(`   Afectados: ${result.affectedEntities.join(", ")}`);
    }
  }
});
```

---

## 📝 Notas Importantes

1. **Solo Admin**: Todos los endpoints requieren rol de admin o super_admin
2. **Performance**: La auditoría completa puede tardar varios segundos en bases de datos grandes
3. **Logs**: Todos los resultados se registran en audit_logs
4. **Frecuencia**: Recomendado ejecutar al menos 1 vez al día
5. **Alertas**: Configurar notificaciones para fallos críticos

---

**Hecho con ❤️ y matemáticas precisas para NEMY**
