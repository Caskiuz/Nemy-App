import { db } from "./db";
import { orders } from "@shared/schema-mysql";
import { eq } from "drizzle-orm";
import { calculateAndDistributeCommissions } from "./commissionService";

async function fixDeliveredOrder() {
  const deliveredOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.status, "delivered"));

  console.log(`Found ${deliveredOrders.length} delivered orders`);

  for (const order of deliveredOrders) {
    if (order.paymentMethod === "card") {
      console.log(`\nProcessing order ${order.id}...`);
      try {
        await calculateAndDistributeCommissions(order.id);
        console.log(`✅ Commissions distributed for order ${order.id}`);
      } catch (error) {
        console.error(`❌ Error processing order ${order.id}:`, error);
      }
    }
  }

  console.log("\n✅ Done!");
  process.exit(0);
}

fixDeliveredOrder();
