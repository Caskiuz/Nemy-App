// Script to sync funds for delivered orders that haven't been processed
import { db } from "../server/db";
import { orders, wallets, transactions } from "@shared/schema-mysql";
import { eq, and, isNull } from "drizzle-orm";
import { financialService } from "../server/unifiedFinancialService";

async function syncDeliveredOrders() {
  console.log("🔍 Buscando pedidos entregados sin fondos liberados...\n");

  // Find delivered orders without commissions calculated
  const deliveredOrders = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.status, "delivered"),
        isNull(orders.businessEarnings)
      )
    );

  console.log(`📦 Encontrados ${deliveredOrders.length} pedidos sin procesar\n`);

  if (deliveredOrders.length === 0) {
    console.log("✅ Todos los pedidos ya tienen fondos liberados");
    return;
  }

  let successCount = 0;
  let errorCount = 0;

  for (const order of deliveredOrders) {
    try {
      console.log(`\n📝 Procesando pedido: ${order.id}`);
      console.log(`   Total: $${(order.total / 100).toFixed(2)}`);
      console.log(`   Negocio: ${order.businessId}`);
      console.log(`   Repartidor: ${order.deliveryPersonId || "Sin asignar"}`);

      // Calculate commissions
      const commissions = await financialService.calculateCommissions(order.total);

      console.log(`   💰 Comisiones calculadas:`);
      console.log(`      - Plataforma: $${(commissions.platform / 100).toFixed(2)}`);
      console.log(`      - Negocio: $${(commissions.business / 100).toFixed(2)}`);
      console.log(`      - Repartidor: $${(commissions.driver / 100).toFixed(2)}`);

      // Update order with commissions
      await db
        .update(orders)
        .set({
          platformFee: commissions.platform,
          businessEarnings: commissions.business,
          deliveryEarnings: commissions.driver,
        })
        .where(eq(orders.id, order.id));

      // Update business wallet
      await financialService.updateWalletBalance(
        order.businessId,
        commissions.business,
        "order_payment",
        order.id,
        `Ganancias del pedido #${order.id.slice(-6)}`
      );
      console.log(`   ✅ Wallet del negocio actualizado`);

      // Update driver wallet if assigned
      if (order.deliveryPersonId) {
        await financialService.updateWalletBalance(
          order.deliveryPersonId,
          commissions.driver,
          "delivery_payment",
          order.id,
          `Pago por entrega #${order.id.slice(-6)}`
        );
        console.log(`   ✅ Wallet del repartidor actualizado`);
      }

      successCount++;
      console.log(`   ✅ Pedido procesado exitosamente`);
    } catch (error) {
      errorCount++;
      console.error(`   ❌ Error procesando pedido ${order.id}:`, error);
    }
  }

  console.log(`\n\n📊 RESUMEN:`);
  console.log(`   ✅ Exitosos: ${successCount}`);
  console.log(`   ❌ Errores: ${errorCount}`);
  console.log(`   📦 Total: ${deliveredOrders.length}`);

  // Show wallet balances
  console.log(`\n\n💰 BALANCES DE WALLETS:`);
  const allWallets = await db.select().from(wallets);
  
  for (const wallet of allWallets) {
    if (wallet.balance > 0) {
      console.log(`   Usuario ${wallet.userId}: $${(wallet.balance / 100).toFixed(2)}`);
    }
  }
}

// Run the script
syncDeliveredOrders()
  .then(() => {
    console.log("\n✅ Sincronización completada");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Error en sincronización:", error);
    process.exit(1);
  });
