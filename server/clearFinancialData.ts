import { config } from "dotenv";

// Load environment variables BEFORE importing db
config();

import { db } from "./db";
import { sql } from "drizzle-orm";

async function clearAllFinancialData() {
  console.log("🗑️ Iniciando limpieza de datos financieros...");
  
  try {
    // Limpiar transacciones
    await db.execute(sql`DELETE FROM transactions`);
    console.log("✅ Transacciones eliminadas");
    
    // Resetear wallets
    await db.execute(sql`UPDATE wallets SET balance = 0, cash_owed = 0`);
    console.log("✅ Wallets reseteadas");
    
    // Limpiar liquidaciones semanales
    await db.execute(sql`DELETE FROM weekly_settlements`);
    console.log("✅ Liquidaciones semanales eliminadas");
    
    // Limpiar transferencias Stripe
    await db.execute(sql`DELETE FROM stripe_transfers`);
    console.log("✅ Transferencias Stripe eliminadas");
    
    // Resetear earnings en orders
    await db.execute(sql`UPDATE orders SET delivery_earnings = 0, business_earnings = 0`);
    console.log("✅ Ganancias en órdenes reseteadas");
    
    // Limpiar audit logs financieros
    await db.execute(sql`DELETE FROM audit_logs WHERE action IN ('weekly_close', 'monday_block', 'payment_processed', 'commission_calculated')`);
    console.log("✅ Logs de auditoría financieros eliminados");
    
    console.log("🎉 Todos los datos financieros han sido eliminados exitosamente");
    
  } catch (error) {
    console.error("❌ Error al limpiar datos financieros:", error);
  }
}

clearAllFinancialData().then(() => process.exit(0));