import { config } from "dotenv";
import mysql from "mysql2/promise";

config();

async function clearAllFinancialData() {
  console.log("🗑️ Iniciando limpieza de datos financieros...");
  
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '137920',
    database: 'nemy_db'
  });

  try {
    await connection.execute("DELETE FROM transactions");
    console.log("✅ Transacciones eliminadas");
    
    await connection.execute("UPDATE wallets SET balance = 0, cashOwed = 0, pendingBalance = 0, totalEarned = 0, totalWithdrawn = 0");
    console.log("✅ Wallets reseteadas");
    
    await connection.execute("DELETE FROM weekly_settlements");
    console.log("✅ Liquidaciones semanales eliminadas");
    
    await connection.execute("DELETE FROM stripe_transfers");
    console.log("✅ Transferencias Stripe eliminadas");
    
    await connection.execute("UPDATE orders SET delivery_earnings = 0, business_earnings = 0");
    console.log("✅ Ganancias en órdenes reseteadas");
    
    await connection.execute("DELETE FROM audit_logs WHERE action IN ('weekly_close', 'monday_block', 'payment_processed', 'commission_calculated')");
    console.log("✅ Logs de auditoría financieros eliminados");
    
    console.log("🎉 Todos los datos financieros han sido eliminados exitosamente");
    
  } catch (error) {
    console.error("❌ Error al limpiar datos financieros:", error);
  } finally {
    await connection.end();
  }
}

clearAllFinancialData().then(() => process.exit(0));
