// Reset Financial Data - Mantiene usuarios, negocios y productos
import * as dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

import { db } from "./db";
import { 
  orders, 
  payments, 
  wallets, 
  transactions, 
  withdrawals,
  reviews 
} from "../shared/schema-mysql";
import { sql } from "drizzle-orm";

async function resetFinancialData() {
  console.log("🔄 Reiniciando datos financieros y pedidos...\n");

  try {
    // 1. Eliminar pedidos y datos relacionados
    console.log("📦 Eliminando pedidos...");
    await db.delete(orders);
    console.log("   ✅ Pedidos eliminados");

    // 2. Eliminar pagos
    console.log("💳 Eliminando pagos...");
    await db.delete(payments);
    console.log("   ✅ Pagos eliminados");

    // 3. Eliminar transacciones
    console.log("💰 Eliminando transacciones...");
    await db.delete(transactions);
    console.log("   ✅ Transacciones eliminadas");

    // 4. Resetear wallets (poner en 0 pero mantener la estructura)
    console.log("👛 Reseteando wallets...");
    await db.execute(sql`
      UPDATE wallets 
      SET balance = 0, 
          pending_balance = 0, 
          cash_owed = 0,
          total_earned = 0, 
          total_withdrawn = 0,
          updated_at = NOW()
    `);
    console.log("   ✅ Wallets reseteados a $0");

    // 5. Eliminar retiros
    console.log("🏦 Eliminando retiros...");
    await db.delete(withdrawals);
    console.log("   ✅ Retiros eliminados");

    // 6. Eliminar reseñas
    console.log("⭐ Eliminando reseñas...");
    await db.delete(reviews);
    console.log("   ✅ Reseñas eliminadas");

    // 7. Resetear ratings de negocios
    console.log("📊 Reseteando ratings de negocios...");
    await db.execute(sql`
      UPDATE businesses 
      SET rating = 0, 
          total_ratings = 0,
          updated_at = NOW()
    `);
    console.log("   ✅ Ratings reseteados");

    console.log("\n" + "=".repeat(60));
    console.log("✅ REINICIO COMPLETADO");
    console.log("=".repeat(60));
    console.log("\n📋 Estado actual:");
    console.log("   ✅ Usuarios: MANTENIDOS");
    console.log("   ✅ Negocios: MANTENIDOS");
    console.log("   ✅ Productos: MANTENIDOS");
    console.log("   ✅ Direcciones: MANTENIDAS");
    console.log("   ❌ Pedidos: ELIMINADOS");
    console.log("   ❌ Pagos: ELIMINADOS");
    console.log("   ❌ Transacciones: ELIMINADAS");
    console.log("   🔄 Wallets: RESETEADOS A $0");
    console.log("   ❌ Retiros: ELIMINADOS");
    console.log("   ❌ Reseñas: ELIMINADAS");
    console.log("\n🎯 Sistema listo para primeros pedidos y entregas");
    console.log("=".repeat(60));

  } catch (error: any) {
    console.error("\n❌ Error durante el reinicio:", error.message);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  resetFinancialData()
    .then(() => {
      console.log("\n✅ Proceso completado exitosamente");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Error fatal:", error);
      process.exit(1);
    });
}

export { resetFinancialData };
