import { db } from "./db";
import { orders } from "@shared/schema-mysql";
import { eq } from "drizzle-orm";

async function test() {
  const allOrders = await db.select().from(orders).where(eq(orders.status, "delivered"));
  
  console.log("\n📊 PEDIDOS ENTREGADOS:");
  for (const o of allOrders) {
    console.log(`\nPedido: ${o.id}`);
    console.log(`  Total: ${o.total} centavos ($${(o.total / 100).toFixed(2)})`);
    console.log(`  Delivery Fee: ${o.deliveryFee} centavos ($${((o.deliveryFee || 0) / 100).toFixed(2)})`);
    console.log(`  Subtotal: ${o.subtotal} centavos ($${((o.subtotal || 0) / 100).toFixed(2)})`);
    
    const subtotalWithMarkup = o.total - (o.deliveryFee || 0);
    const productBase = Math.round(subtotalWithMarkup / 1.15);
    
    console.log(`  Subtotal con markup: ${subtotalWithMarkup} centavos ($${(subtotalWithMarkup / 100).toFixed(2)})`);
    console.log(`  Productos base (85%): ${productBase} centavos ($${(productBase / 100).toFixed(2)})`);
  }
  
  process.exit(0);
}

test();
