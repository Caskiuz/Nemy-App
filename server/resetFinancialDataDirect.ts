import mysql from 'mysql2/promise';

async function resetFinancialData() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '137920',
    database: 'nemy_db_local'
  });

  console.log("🔄 Reiniciando datos financieros y pedidos...\n");

  try {
    console.log("📦 Eliminando pedidos...");
    await connection.execute('DELETE FROM orders');
    console.log("   ✅ Pedidos eliminados");

    console.log("💳 Eliminando pagos...");
    await connection.execute('DELETE FROM payments');
    console.log("   ✅ Pagos eliminados");

    console.log("💰 Eliminando transacciones...");
    await connection.execute('DELETE FROM transactions');
    console.log("   ✅ Transacciones eliminadas");

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

    console.log("🏦 Eliminando retiros...");
    await connection.execute('DELETE FROM withdrawals');
    console.log("   ✅ Retiros eliminados");

    console.log("⭐ Eliminando reseñas...");
    await connection.execute('DELETE FROM reviews');
    console.log("   ✅ Reseñas eliminadas");

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

resetFinancialData()
  .then(() => {
    console.log("\n✅ Proceso completado exitosamente");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Error fatal:", error);
    process.exit(1);
  });
