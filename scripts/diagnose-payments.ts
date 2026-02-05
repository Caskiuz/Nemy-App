// Diagnostic script to check orders and wallet status
import { db } from "../server/db";
import { orders, wallets, users, transactions } from "@shared/schema-mysql";
import { eq } from "drizzle-orm";

async function diagnose() {
  console.log("🔍 DIAGNÓSTICO DEL SISTEMA DE PAGOS\n");
  console.log("=" .repeat(60));

  // 1. Check all orders
  console.log("\n📦 PEDIDOS EN EL SISTEMA:");
  const allOrders = await db.select().from(orders);
  
  const ordersByStatus = allOrders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log(`   Total de pedidos: ${allOrders.length}`);
  Object.entries(ordersByStatus).forEach(([status, count]) => {
    console.log(`   - ${status}: ${count}`);
  });

  // 2. Check delivered orders
  console.log("\n✅ PEDIDOS ENTREGADOS:");
  const deliveredOrders = allOrders.filter(o => o.status === "delivered");
  console.log(`   Total entregados: ${deliveredOrders.length}`);
  
  const withCommissions = deliveredOrders.filter(o => o.businessEarnings);
  const withoutCommissions = deliveredOrders.filter(o => !o.businessEarnings);
  
  console.log(`   - Con comisiones calculadas: ${withCommissions.length}`);
  console.log(`   - Sin comisiones calculadas: ${withoutCommissions.length} ⚠️`);

  if (withoutCommissions.length > 0) {
    console.log("\n   ⚠️ Pedidos sin procesar:");
    for (const order of withoutCommissions) {
      console.log(`      - ID: ${order.id.slice(-8)}`);
      console.log(`        Total: $${(order.total / 100).toFixed(2)}`);
      console.log(`        Repartidor: ${order.deliveryPersonId || "Sin asignar"}`);
      console.log(`        Entregado: ${order.deliveredAt || "N/A"}`);
    }
  }

  // 3. Check wallets
  console.log("\n💰 WALLETS:");
  const allWallets = await db.select().from(wallets);
  console.log(`   Total de wallets: ${allWallets.length}`);

  for (const wallet of allWallets) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, wallet.userId))
      .limit(1);

    console.log(`\n   Usuario: ${user?.name || wallet.userId}`);
    console.log(`   - Rol: ${user?.role || "N/A"}`);
    console.log(`   - Balance: $${(wallet.balance / 100).toFixed(2)}`);
    console.log(`   - Total ganado: $${(wallet.totalEarned / 100).toFixed(2)}`);
    console.log(`   - Total retirado: $${(wallet.totalWithdrawn / 100).toFixed(2)}`);

    // Check transactions for this wallet
    const walletTransactions = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, wallet.userId));
    
    console.log(`   - Transacciones: ${walletTransactions.length}`);
    
    if (walletTransactions.length > 0) {
      const income = walletTransactions
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);
      const expenses = walletTransactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
      console.log(`     - Ingresos: $${(income / 100).toFixed(2)}`);
      console.log(`     - Egresos: $${(expenses / 100).toFixed(2)}`);
    }
  }

  // 4. Check for drivers with delivered orders but no wallet
  console.log("\n🚗 REPARTIDORES:");
  const driversWithOrders = [...new Set(
    deliveredOrders
      .filter(o => o.deliveryPersonId)
      .map(o => o.deliveryPersonId!)
  )];

  console.log(`   Repartidores con entregas: ${driversWithOrders.length}`);

  for (const driverId of driversWithOrders) {
    const [driver] = await db
      .select()
      .from(users)
      .where(eq(users.id, driverId))
      .limit(1);

    const [wallet] = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, driverId))
      .limit(1);

    const driverOrders = deliveredOrders.filter(o => o.deliveryPersonId === driverId);
    const totalEarnings = driverOrders.reduce((sum, o) => sum + (o.deliveryEarnings || 0), 0);

    console.log(`\n   ${driver?.name || driverId}:`);
    console.log(`   - Entregas: ${driverOrders.length}`);
    console.log(`   - Ganancias esperadas: $${(totalEarnings / 100).toFixed(2)}`);
    console.log(`   - Wallet balance: $${wallet ? (wallet.balance / 100).toFixed(2) : "Sin wallet ⚠️"}`);
    
    if (totalEarnings > 0 && (!wallet || wallet.balance === 0)) {
      console.log(`   ⚠️ PROBLEMA: Tiene ganancias pero wallet en $0.00`);
    }
  }

  // 5. Summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 RESUMEN:");
  
  if (withoutCommissions.length > 0) {
    console.log(`\n⚠️ ACCIÓN REQUERIDA:`);
    console.log(`   Hay ${withoutCommissions.length} pedidos entregados sin fondos liberados.`);
    console.log(`   Ejecuta: sync-wallets.bat`);
  } else {
    console.log(`\n✅ Todos los pedidos entregados tienen fondos liberados.`);
  }

  const walletsWithZeroBalance = allWallets.filter(w => w.balance === 0 && w.totalEarned > 0);
  if (walletsWithZeroBalance.length > 0) {
    console.log(`\n⚠️ ${walletsWithZeroBalance.length} wallets con ganancias pero balance en $0`);
  }

  console.log("\n" + "=".repeat(60));
}

diagnose()
  .then(() => {
    console.log("\n✅ Diagnóstico completado\n");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Error en diagnóstico:", error);
    process.exit(1);
  });
