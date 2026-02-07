// Test Financial Audit System
import { financialAuditService } from "./financialAuditService.ts";

async function testAuditSystem() {
  console.log("🔍 Iniciando prueba del sistema de auditoría financiera...\n");

  try {
    // Test 1: Verificar tasas de comisión
    console.log("📊 Test 1: Verificando tasas de comisión...");
    const ratesResult = await financialAuditService.auditCommissionRates();
    console.log(`   ${ratesResult.passed ? "✅" : "❌"} ${ratesResult.details}`);
    console.log();

    // Test 2: Verificar totales de pedidos
    console.log("📊 Test 2: Verificando totales de pedidos...");
    const totalsResult = await financialAuditService.auditOrderTotals();
    console.log(`   ${totalsResult.passed ? "✅" : "❌"} ${totalsResult.details}`);
    if (totalsResult.affectedEntities && totalsResult.affectedEntities.length > 0) {
      console.log(`   Pedidos con errores: ${totalsResult.affectedEntities.slice(0, 3).join(", ")}`);
    }
    console.log();

    // Test 3: Verificar distribución de comisiones
    console.log("📊 Test 3: Verificando distribución de comisiones...");
    const distributionResult = await financialAuditService.auditCommissionDistribution();
    console.log(`   ${distributionResult.passed ? "✅" : "❌"} ${distributionResult.details}`);
    console.log();

    // Test 4: Verificar balances de wallets
    console.log("📊 Test 4: Verificando balances de wallets...");
    const walletsResult = await financialAuditService.auditWalletBalances();
    console.log(`   ${walletsResult.passed ? "✅" : "❌"} ${walletsResult.details}`);
    console.log();

    // Test 5: Verificar cadena de transacciones
    console.log("📊 Test 5: Verificando cadena de transacciones...");
    const chainResult = await financialAuditService.auditTransactionChain();
    console.log(`   ${chainResult.passed ? "✅" : "❌"} ${chainResult.details}`);
    console.log();

    // Test 6: Verificar pagos Stripe
    console.log("📊 Test 6: Verificando pagos Stripe...");
    const paymentsResult = await financialAuditService.auditStripePayments();
    console.log(`   ${paymentsResult.passed ? "✅" : "❌"} ${paymentsResult.details}`);
    console.log();

    // Auditoría completa
    console.log("🔍 Ejecutando auditoría completa...\n");
    const fullReport = await financialAuditService.runFullAudit();

    console.log("=" .repeat(60));
    console.log("📋 REPORTE DE AUDITORÍA FINANCIERA");
    console.log("=" .repeat(60));
    console.log(`Fecha: ${fullReport.timestamp.toLocaleString()}`);
    console.log(`Total de checks: ${fullReport.totalChecks}`);
    console.log(`Pasados: ${fullReport.passed} ✅`);
    console.log(`Fallidos: ${fullReport.failed} ❌`);
    console.log(`Advertencias: ${fullReport.warnings} ⚠️`);
    console.log(`Estado del sistema: ${fullReport.systemHealth.toUpperCase()}`);
    console.log("=" .repeat(60));

    // Mostrar detalles de fallos
    const failures = fullReport.results.filter(r => !r.passed);
    if (failures.length > 0) {
      console.log("\n🚨 PROBLEMAS DETECTADOS:\n");
      failures.forEach((failure, index) => {
        console.log(`${index + 1}. ${failure.rule}`);
        console.log(`   Severidad: ${failure.severity}`);
        console.log(`   Detalles: ${failure.details}`);
        if (failure.affectedEntities && failure.affectedEntities.length > 0) {
          console.log(`   Afectados: ${failure.affectedEntities.slice(0, 5).join(", ")}`);
        }
        console.log();
      });
    } else {
      console.log("\n✅ ¡SISTEMA FINANCIERO SALUDABLE!");
      console.log("   Todas las validaciones pasaron correctamente.");
    }

    console.log("\n" + "=" .repeat(60));
    console.log("🎯 Prueba completada exitosamente");
    console.log("=" .repeat(60));

  } catch (error: any) {
    console.error("\n❌ Error durante la prueba:", error.message);
    console.error(error.stack);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  testAuditSystem()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Error fatal:", error);
      process.exit(1);
    });
}

export { testAuditSystem };
