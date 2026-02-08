# Ejemplos Prácticos - Sistema de Auditoría Financiera

## 🎯 Casos de Uso Reales

### 1. Auditoría Diaria Automática

```typescript
// server/jobs/dailyAudit.ts
import { financialAuditService } from "../financialAuditService";
import { sendSlackNotification } from "../notifications";

export async function runDailyAudit() {
  console.log("🔍 Ejecutando auditoría financiera diaria...");
  
  const report = await financialAuditService.runFullAudit();
  
  // Log del resultado
  console.log(`✅ Auditoría completada: ${report.passed}/${report.totalChecks} checks pasados`);
  
  // Enviar notificación si hay problemas
  if (report.systemHealth !== "healthy") {
    await sendSlackNotification({
      channel: "#finance-alerts",
      severity: report.systemHealth === "critical" ? "error" : "warning",
      title: `🚨 Auditoría Financiera: ${report.systemHealth.toUpperCase()}`,
      message: `${report.failed} checks fallidos, ${report.warnings} advertencias`,
      details: report.results.filter(r => !r.passed)
    });
  }
  
  return report;
}

// Programar ejecución diaria a las 3 AM
import cron from "node-cron";
cron.schedule("0 3 * * *", runDailyAudit);
```

---

### 2. Validación Antes de Cambiar Comisiones

```typescript
// server/routes/adminRoutes.ts
router.put("/admin/commission-rates", 
  authenticateToken,
  requireRole("super_admin"),
  async (req, res) => {
    try {
      const { platform, business, driver } = req.body;
      
      // PASO 1: Validar que sumen 100%
      const total = platform + business + driver;
      if (Math.abs(total - 1.0) > 0.001) {
        return res.status(400).json({
          error: `Las comisiones deben sumar 100%. Actual: ${(total * 100).toFixed(2)}%`
        });
      }
      
      // PASO 2: Ejecutar auditoría ANTES del cambio
      console.log("🔍 Ejecutando auditoría pre-cambio...");
      const preAudit = await financialAuditService.runFullAudit();
      
      if (preAudit.systemHealth !== "healthy") {
        return res.status(400).json({
          error: "No se pueden cambiar comisiones con el sistema en estado no saludable",
          audit: preAudit
        });
      }
      
      // PASO 3: Aplicar cambios
      await updateCommissionRates({ platform, business, driver });
      
      // PASO 4: Ejecutar auditoría DESPUÉS del cambio
      console.log("🔍 Ejecutando auditoría post-cambio...");
      const postAudit = await financialAuditService.runFullAudit();
      
      if (postAudit.systemHealth !== "healthy") {
        // ROLLBACK automático
        await rollbackCommissionRates();
        return res.status(500).json({
          error: "Cambio revertido: auditoría post-cambio falló",
          audit: postAudit
        });
      }
      
      res.json({
        success: true,
        message: "Comisiones actualizadas y validadas",
        preAudit: preAudit.systemHealth,
        postAudit: postAudit.systemHealth
      });
      
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);
```

---

### 3. Dashboard de Salud Financiera en Tiempo Real

```typescript
// server/routes/adminDashboard.ts
router.get("/admin/financial-health", 
  authenticateToken,
  requireRole("admin", "super_admin"),
  async (req, res) => {
    try {
      // Ejecutar auditoría
      const report = await financialAuditService.runFullAudit();
      
      // Calcular score de salud (0-100)
      const healthScore = (report.passed / report.totalChecks) * 100;
      
      // Obtener historial de auditorías (últimas 24 horas)
      const history = await getAuditHistory(24);
      
      // Calcular tendencia
      const trend = calculateTrend(history);
      
      res.json({
        current: {
          status: report.systemHealth,
          score: healthScore,
          timestamp: report.timestamp,
          checks: {
            total: report.totalChecks,
            passed: report.passed,
            failed: report.failed,
            warnings: report.warnings
          }
        },
        trend: {
          direction: trend.direction, // "improving", "stable", "declining"
          change: trend.change, // +5%, -2%, etc.
        },
        issues: report.results
          .filter(r => !r.passed)
          .map(r => ({
            rule: r.rule,
            severity: r.severity,
            details: r.details,
            affected: r.affectedEntities?.length || 0
          })),
        history: history.map(h => ({
          timestamp: h.timestamp,
          score: h.score,
          status: h.status
        }))
      });
      
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);
```

---

### 4. Alerta Automática en Slack/Discord

```typescript
// server/notifications/financialAlerts.ts
import { WebClient } from "@slack/web-api";

const slack = new WebClient(process.env.SLACK_TOKEN);

export async function sendFinancialAlert(report: FullAuditReport) {
  if (report.systemHealth === "healthy") {
    return; // No enviar alerta si todo está bien
  }
  
  const emoji = report.systemHealth === "critical" ? "🚨" : "⚠️";
  const color = report.systemHealth === "critical" ? "danger" : "warning";
  
  const failures = report.results.filter(r => !r.passed);
  
  await slack.chat.postMessage({
    channel: "#finance-alerts",
    text: `${emoji} Auditoría Financiera: ${report.systemHealth.toUpperCase()}`,
    attachments: [
      {
        color: color,
        title: "Resumen de Auditoría",
        fields: [
          {
            title: "Estado",
            value: report.systemHealth.toUpperCase(),
            short: true
          },
          {
            title: "Checks Fallidos",
            value: `${report.failed}/${report.totalChecks}`,
            short: true
          },
          {
            title: "Timestamp",
            value: report.timestamp.toLocaleString(),
            short: false
          }
        ]
      },
      ...failures.map(failure => ({
        color: failure.severity === "critical" ? "danger" : "warning",
        title: `❌ ${failure.rule}`,
        text: failure.details,
        fields: failure.affectedEntities ? [
          {
            title: "Entidades Afectadas",
            value: failure.affectedEntities.slice(0, 5).join("\n"),
            short: false
          }
        ] : []
      }))
    ]
  });
}

// Uso en el job diario
export async function runDailyAuditWithAlerts() {
  const report = await financialAuditService.runFullAudit();
  
  if (report.systemHealth !== "healthy") {
    await sendFinancialAlert(report);
  }
  
  return report;
}
```

---

### 5. Endpoint de Reparación Automática

```typescript
// server/routes/adminRoutes.ts
router.post("/admin/repair-financial-issues",
  authenticateToken,
  requireRole("super_admin"),
  async (req, res) => {
    try {
      console.log("🔧 Iniciando reparación automática...");
      
      // PASO 1: Auditoría inicial
      const initialAudit = await financialAuditService.runFullAudit();
      
      if (initialAudit.systemHealth === "healthy") {
        return res.json({
          success: true,
          message: "No hay problemas que reparar",
          audit: initialAudit
        });
      }
      
      const repairs: string[] = [];
      
      // PASO 2: Reparar totales de pedidos
      const orderIssues = initialAudit.results.find(
        r => r.rule === "Order Totals Match Calculation" && !r.passed
      );
      
      if (orderIssues) {
        console.log("🔧 Reparando totales de pedidos...");
        await repairOrderTotals();
        repairs.push("Order totals recalculated");
      }
      
      // PASO 3: Reparar balances de wallets
      const walletIssues = initialAudit.results.find(
        r => r.rule === "Wallet Balances Match Transaction History" && !r.passed
      );
      
      if (walletIssues) {
        console.log("🔧 Reparando balances de wallets...");
        await repairWalletBalances();
        repairs.push("Wallet balances synchronized");
      }
      
      // PASO 4: Auditoría final
      console.log("🔍 Ejecutando auditoría post-reparación...");
      const finalAudit = await financialAuditService.runFullAudit();
      
      res.json({
        success: true,
        message: "Reparación completada",
        repairs,
        before: {
          status: initialAudit.systemHealth,
          failed: initialAudit.failed
        },
        after: {
          status: finalAudit.systemHealth,
          failed: finalAudit.failed
        },
        audit: finalAudit
      });
      
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

async function repairOrderTotals() {
  const { orders } = await import("@shared/schema-mysql");
  const { db } = await import("./db");
  
  const allOrders = await db.select().from(orders);
  
  for (const order of allOrders) {
    const tax = Math.round(order.subtotal * 0.08);
    const correctTotal = order.subtotal + order.deliveryFee + tax;
    
    if (order.total !== correctTotal) {
      await db.update(orders)
        .set({ total: correctTotal, tax })
        .where(eq(orders.id, order.id));
    }
  }
}

async function repairWalletBalances() {
  const { wallets, transactions } = await import("@shared/schema-mysql");
  const { db } = await import("./db");
  const { eq } = await import("drizzle-orm");
  
  const allWallets = await db.select().from(wallets);
  
  for (const wallet of allWallets) {
    const txs = await db.select()
      .from(transactions)
      .where(eq(transactions.walletId, wallet.id));
    
    const correctBalance = txs.reduce((sum, tx) => sum + tx.amount, 0);
    
    if (wallet.balance !== correctBalance) {
      await db.update(wallets)
        .set({ balance: correctBalance })
        .where(eq(wallets.id, wallet.id));
    }
  }
}
```

---

### 6. Integración con Datadog/New Relic

```typescript
// server/monitoring/financialMetrics.ts
import { StatsD } from "node-statsd";

const statsd = new StatsD({
  host: process.env.STATSD_HOST,
  port: 8125
});

export async function reportFinancialMetrics() {
  const report = await financialAuditService.runFullAudit();
  
  // Enviar métricas a Datadog
  statsd.gauge("nemy.financial.health_score", 
    (report.passed / report.totalChecks) * 100
  );
  
  statsd.gauge("nemy.financial.checks_passed", report.passed);
  statsd.gauge("nemy.financial.checks_failed", report.failed);
  statsd.gauge("nemy.financial.warnings", report.warnings);
  
  // Enviar evento si hay problemas
  if (report.systemHealth !== "healthy") {
    statsd.event(
      "Financial Audit Failed",
      `${report.failed} checks failed`,
      {
        alert_type: report.systemHealth === "critical" ? "error" : "warning",
        tags: [`status:${report.systemHealth}`]
      }
    );
  }
}

// Ejecutar cada 5 minutos
setInterval(reportFinancialMetrics, 5 * 60 * 1000);
```

---

## 🎯 Mejores Prácticas

### ✅ DO (Hacer)
- Ejecutar auditoría ANTES de cambios críticos
- Configurar alertas automáticas
- Revisar logs de auditoría regularmente
- Documentar todas las reparaciones
- Mantener historial de auditorías

### ❌ DON'T (No Hacer)
- Ignorar advertencias
- Hacer cambios sin auditoría previa
- Desactivar alertas en producción
- Modificar datos sin validación
- Ejecutar reparaciones sin backup

---

**Implementado con ❤️ para NEMY**
