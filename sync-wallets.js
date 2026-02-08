const mysql = require('mysql2/promise');

async function syncWallets() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '137920',
    database: 'nemy_db_local'
  });

  try {
    // Obtener todos los usuarios con transacciones
    const [users] = await connection.execute(`
      SELECT DISTINCT user_id FROM transactions WHERE status = 'completed'
    `);

    console.log(`Found ${users.length} users with transactions`);

    for (const user of users) {
      console.log(`\nSyncing wallet for user ${user.user_id}...`);
      
      // Calcular balance total basado en transacciones
      const [balanceResult] = await connection.execute(`
        SELECT 
          COALESCE(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0) as total_earned,
          COALESCE(SUM(amount), 0) as current_balance
        FROM transactions 
        WHERE user_id = ? AND status = 'completed'
      `, [user.user_id]);

      const totalEarned = balanceResult[0].total_earned;
      const currentBalance = balanceResult[0].current_balance;

      console.log(`  Calculated balance: $${currentBalance/100}`);
      console.log(`  Total earned: $${totalEarned/100}`);

      // Crear wallet si no existe
      await connection.execute(`
        INSERT IGNORE INTO wallets (id, user_id, balance, total_earned, pending_balance, cash_owed, total_withdrawn, created_at) 
        VALUES (UUID(), ?, 0, 0, 0, 0, 0, NOW())
      `, [user.user_id]);

      // Actualizar wallet con valores calculados
      await connection.execute(`
        UPDATE wallets 
        SET 
          balance = ?, 
          total_earned = ?,
          updated_at = NOW()
        WHERE user_id = ?
      `, [currentBalance, totalEarned, user.user_id]);

      console.log(`  ✅ Wallet synchronized`);
    }

    console.log('\n🎉 All wallets synchronized!');
    
    // Mostrar resumen final
    const [wallets] = await connection.execute(`
      SELECT w.user_id, w.balance, w.total_earned, u.name, u.role
      FROM wallets w
      LEFT JOIN users u ON w.user_id = u.id
      WHERE w.balance > 0
      ORDER BY w.balance DESC
    `);
    
    console.log('\n💰 Final Wallet Summary:');
    for (const wallet of wallets) {
      console.log(`  ${wallet.name || wallet.user_id} (${wallet.role}): $${wallet.balance/100} (earned: $${wallet.total_earned/100})`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

syncWallets();