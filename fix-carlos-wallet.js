const mysql = require('mysql2/promise');

async function fixCarlosWallet() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '137920',
    database: 'nemy_db_local'
  });

  try {
    // Verificar si Carlos tiene wallet
    const [wallets] = await connection.execute(`
      SELECT * FROM wallets WHERE user_id = 'business-owner-1'
    `);

    console.log('Carlos wallet:', wallets.length > 0 ? wallets[0] : 'NO WALLET');

    // Calcular ganancias reales de Carlos
    const [orders] = await connection.execute(`
      SELECT id, total, delivery_fee, status 
      FROM orders 
      WHERE business_id = 'business-1' AND status = 'delivered'
    `);

    let totalEarnings = 0;
    for (const order of orders) {
      const subtotalWithMarkup = order.total - (order.delivery_fee || 0);
      const productBase = Math.round(subtotalWithMarkup / 1.15);
      totalEarnings += productBase;
    }

    console.log(`Carlos should have: $${totalEarnings/100} (${totalEarnings} centavos)`);

    // Crear o actualizar wallet
    if (wallets.length === 0) {
      await connection.execute(`
        INSERT INTO wallets (id, user_id, balance, total_earned, pending_balance, cash_owed, total_withdrawn, created_at)
        VALUES (UUID(), 'business-owner-1', ?, ?, 0, 0, 0, NOW())
      `, [totalEarnings, totalEarnings]);
      console.log('✅ Wallet created for Carlos');
    } else {
      await connection.execute(`
        UPDATE wallets 
        SET balance = ?, total_earned = ?, updated_at = NOW()
        WHERE user_id = 'business-owner-1'
      `, [totalEarnings, totalEarnings]);
      console.log('✅ Wallet updated for Carlos');
    }

    // Crear transacciones
    for (const order of orders) {
      const subtotalWithMarkup = order.total - (order.delivery_fee || 0);
      const productBase = Math.round(subtotalWithMarkup / 1.15);
      
      await connection.execute(`
        INSERT IGNORE INTO transactions (id, user_id, order_id, type, amount, description, status, created_at)
        VALUES (UUID(), 'business-owner-1', ?, 'income', ?, ?, 'completed', NOW())
      `, [order.id, productBase, `Ganancia del pedido #${order.id.slice(-6)}`]);
    }

    console.log('✅ Transactions created');

    // Verificar resultado final
    const [finalWallet] = await connection.execute(`
      SELECT balance, total_earned FROM wallets WHERE user_id = 'business-owner-1'
    `);

    console.log(`🎉 FINAL: Carlos has $${finalWallet[0].balance/100} available`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

fixCarlosWallet();