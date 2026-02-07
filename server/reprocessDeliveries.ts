// Reprocesar entregas para crear transacciones correctas
import { db } from "./db.js";
import { orders, wallets, transactions } from "@shared/schema-mysql";
import { eq, and } from "drizzle-orm";

async function reprocessDeliveries() {
  console.log("🔄 Reprocesando entregas...\n");

  try {
    // Obtener pedidos entregados del driver-1
    const deliveredOrders = await db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.deliveryPersonId, "driver-1"),
          eq(orders.status, "delivered")
        )
      );

    console.log(`📦 Encontrados ${deliveredOrders.length} pedidos entregados\n`);

    let totalEarnings = 0;
    let totalCashOwed = 0;

    for (const order of deliveredOrders) {
      const driverEarnings = order.deliveryEarnings || Math.round(order.total * 0.15);
      
      console.log(`\n📦 Pedido #${order.id.slice(-6)}:`);
      console.log(`   Total: $${order.total / 100}`);
      console.log(`   Método: ${order.paymentMethod}`);
      console.log(`   Comisión driver: $${driverEarnings / 100}`);

      if (order.paymentMethod === "cash") {
        // EFECTIVO: Driver cobra todo, se queda con 15%, debe depositar 85%
        const mustDeposit = order.total - driverEarnings;
        
        console.log(`   💵 Cobró en efectivo: $${order.total / 100}`);
        console.log(`   ✅ Se queda: $${driverEarnings / 100}`);
        console.log(`   🏦 Debe depositar: $${mustDeposit / 100}`);

        // Crear transacciones
        await db.insert(transactions).values([
          {
            userId: "driver-1",
            orderId: order.id,
            type: "cash_income",
            amount: driverEarnings,
            status: "completed",
            description: `Comisión de entrega - Pedido #${order.id.slice(-6)} (efectivo cobrado)`,
            createdAt: order.deliveredAt || new Date(),
          },
          {
            userId: "driver-1",
            orderId: order.id,
            type: "cash_debt",
            amount: mustDeposit,
            status: "completed",
            description: `Deuda por pedido #${order.id.slice(-6)} en efectivo`,
            createdAt: order.deliveredAt || new Date(),
          },
        ]);

        totalEarnings += driverEarnings;
        totalCashOwed += mustDeposit;
      } else {
        // TARJETA: Solo acreditar comisión
        console.log(`   💳 Pago con tarjeta`);
        console.log(`   ✅ Comisión: $${driverEarnings / 100}`);

        await db.insert(transactions).values({
          userId: "driver-1",
          orderId: order.id,
          type: "income",
          amount: driverEarnings,
          status: "completed",
          description: `Comisión de entrega - Pedido #${order.id.slice(-6)}`,
          createdAt: order.deliveredAt || new Date(),
        });

        totalEarnings += driverEarnings;
      }
    }

    // Actualizar wallet
    await db
      .update(wallets)
      .set({
        balance: totalEarnings,
        cashOwed: totalCashOwed,
        totalEarned: totalEarnings,
      })
      .where(eq(wallets.userId, "driver-1"));

    console.log(`\n\n✅ RESUMEN FINAL:`);
    console.log(`   💰 Total ganado: $${totalEarnings / 100}`);
    console.log(`   🏦 Deuda en efectivo: $${totalCashOwed / 100}`);
    console.log(`   ✅ Disponible para retirar: $${(totalEarnings - totalCashOwed) / 100}`);

    process.exit(0);
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

reprocessDeliveries();
