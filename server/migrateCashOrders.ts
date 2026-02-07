// Migración: Registrar liquidaciones de pedidos en efectivo antiguos
import { db } from "./db";
import { orders, wallets, transactions } from "@shared/schema-mysql";
import { eq, and } from "drizzle-orm";

async function migrateCashOrders() {
  console.log("🔄 Migrando pedidos en efectivo antiguos...");

  // Obtener todos los pedidos en efectivo entregados sin liquidación registrada
  const cashOrders = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.paymentMethod, "cash"),
        eq(orders.status, "delivered"),
        eq(orders.cashCollected, false) // No tienen liquidación registrada
      )
    );

  console.log(`📦 Encontrados ${cashOrders.length} pedidos en efectivo sin liquidar`);

  let migrated = 0;
  let errors = 0;

  for (const order of cashOrders) {
    try {
      if (!order.deliveryPersonId) {
        console.log(`⚠️  Pedido ${order.id} sin repartidor asignado, saltando...`);
        continue;
      }

      // Calcular comisiones
      const businessShare = Math.round(order.subtotal * 0.70);
      const platformShare = Math.round(order.subtotal * 0.15);
      const driverEarnings = order.deliveryFee;
      const totalOwed = businessShare + platformShare;

      // Actualizar orden
      await db.update(orders)
        .set({
          cashCollected: true,
          platformFee: platformShare,
          businessEarnings: businessShare,
          deliveryEarnings: driverEarnings,
        })
        .where(eq(orders.id, order.id));

      // Actualizar wallet del repartidor
      const [driverWallet] = await db
        .select()
        .from(wallets)
        .where(eq(wallets.userId, order.deliveryPersonId))
        .limit(1);

      if (driverWallet) {
        await db.update(wallets)
          .set({
            cashOwed: driverWallet.cashOwed + totalOwed,
            balance: driverWallet.balance + driverEarnings,
            totalEarned: driverWallet.totalEarned + driverEarnings,
          })
          .where(eq(wallets.userId, order.deliveryPersonId));
      } else {
        // Crear wallet si no existe
        await db.insert(wallets).values({
          userId: order.deliveryPersonId,
          cashOwed: totalOwed,
          balance: driverEarnings,
          pendingBalance: 0,
          totalEarned: driverEarnings,
          totalWithdrawn: 0,
        });
      }

      // Registrar transacciones
      await db.insert(transactions).values([
        {
          userId: order.deliveryPersonId,
          orderId: order.id,
          type: "delivery_payment",
          amount: driverEarnings,
          status: "completed",
          description: `Entrega de pedido #${order.id.slice(-6)} (efectivo - migrado)`,
        },
        {
          userId: order.deliveryPersonId,
          orderId: order.id,
          type: "cash_owed",
          amount: -totalOwed,
          status: "pending",
          description: `Efectivo a liquidar - Pedido #${order.id.slice(-6)} (migrado)`,
          metadata: JSON.stringify({
            businessShare,
            platformShare,
            businessId: order.businessId,
            migrated: true,
          }),
        },
      ]);

      migrated++;
      console.log(`✅ Pedido ${order.id.slice(-6)} migrado - Repartidor debe $${(totalOwed / 100).toFixed(2)}`);
    } catch (error) {
      errors++;
      console.error(`❌ Error migrando pedido ${order.id}:`, error);
    }
  }

  console.log(`\n📊 Resumen de migración:`);
  console.log(`   ✅ Migrados: ${migrated}`);
  console.log(`   ❌ Errores: ${errors}`);
  console.log(`   📦 Total: ${cashOrders.length}`);

  // Mostrar resumen por repartidor
  const walletSummary = await db
    .select()
    .from(wallets)
    .where(eq(wallets.cashOwed, 0));

  console.log(`\n💰 Repartidores con deuda de efectivo:`);
  const walletsWithDebt = await db.select().from(wallets);
  for (const w of walletsWithDebt) {
    if (w.cashOwed > 0) {
      console.log(`   🚗 ${w.userId}: Debe $${(w.cashOwed / 100).toFixed(2)}`);
    }
  }
}

// Ejecutar migración
migrateCashOrders()
  .then(() => {
    console.log("\n✅ Migración completada");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Error en migración:", error);
    process.exit(1);
  });
