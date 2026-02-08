// Reset Financial Data - FIXED VERSION
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Create direct connection with explicit credentials
const connectionConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '137920',
  database: process.env.DB_NAME || 'nemy_db_local',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

console.log('🔧 Configuración de conexión:', {
  host: connectionConfig.host,
  port: connectionConfig.port,
  user: connectionConfig.user,
  database: connectionConfig.database,
  hasPassword: !!connectionConfig.password
});

const connection = mysql.createPool(connectionConfig);
const db = drizzle(connection);

async function resetFinancialData() {
  console.log("🔄 Reiniciando datos financieros y pedidos...\n");

  try {
    // Test connection first
    console.log("🔍 Probando conexión...");
    await connection.execute('SELECT 1');
    console.log("   ✅ Conexión exitosa");

    // 1. Eliminar pedidos
    console.log("📦 Eliminando pedidos...");
    await connection.execute('DELETE FROM orders');
    console.log("   ✅ Pedidos eliminados");

    // 2. Eliminar pagos
    console.log("💳 Eliminando pagos...");
    await connection.execute('DELETE FROM payments');
    console.log("   ✅ Pagos eliminados");

    // 3. Eliminar transacciones
    console.log("💰 Eliminando transacciones...");
    await connection.execute('DELETE FROM transactions');
    console.log("   ✅ Transacciones eliminadas");

    // 4. Resetear wallets
    console.log("👛 Reseteando wallets...");
    await connection.execute(`
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
    await connection.execute('DELETE FROM withdrawals');
    console.log("   ✅ Retiros eliminados");

    // 6. Eliminar reseñas
    console.log("⭐ Eliminando reseñas...");
    await connection.execute('DELETE FROM reviews');
    console.log("   ✅ Reseñas eliminadas");

    // 7. Resetear ratings de negocios
    console.log("📊 Reseteando ratings de negocios...");
    await connection.execute(`
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
  } finally {
    await connection.end();
  }
}

// Ejecutar
resetFinancialData()
  .then(() => {
    console.log("\n✅ Proceso completado exitosamente");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Error fatal:", error);
    process.exit(1);
  });