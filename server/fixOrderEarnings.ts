// Fix incorrect deliveryEarnings in existing orders
import { db } from "./db.js";
import { orders } from "@shared/schema-mysql";
import { eq, isNull } from "drizzle-orm";

async function fixOrderEarnings() {
  console.log("🔧 Corrigiendo deliveryEarnings en pedidos existentes...\n");

  try {
    // Obtener pedidos con deliveryEarnings NULL o incorrectos
    const allOrders = await db.select().from(orders);
    
    console.log(`📊 Encontrados ${allOrders.length} pedidos\n`);

    let fixed = 0;
    for (const order of allOrders) {
      // Calcular 15% del TOTAL (no del deliveryFee)
      const expectedEarnings = Math.round(order.total * 0.15);
      
      if (order.deliveryEarnings === null || order.deliveryEarnings !== expectedEarnings) {
        console.log(`🔧 Corrigiendo pedido ${order.id.slice(-6)}:`);
        console.log(`   total: $${order.total/100}`);
        console.log(`   deliveryEarnings actual: $${(order.deliveryEarnings || 0)/100}`);
        console.log(`   deliveryEarnings correcto: $${expectedEarnings/100}`);
        
        await db.update(orders)
          .set({ deliveryEarnings: expectedEarnings })
          .where(eq(orders.id, order.id));
        
        fixed++;
      }
    }

    console.log(`\n✅ ${fixed} pedidos corregidos`);
    console.log(`✅ ${allOrders.length - fixed} pedidos ya estaban correctos\n`);

    // Verificar
    const verified = await db.select().from(orders);
    console.log("📊 Verificación final:");
    verified.forEach(order => {
      const expected = Math.round(order.total * 0.15);
      const status = order.deliveryEarnings === expected ? "✅" : "❌";
      console.log(`   ${status} ${order.id.slice(-6)}: total $${order.total/100} → earnings $${(order.deliveryEarnings || 0)/100}`);
    });

    process.exit(0);
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

fixOrderEarnings();
