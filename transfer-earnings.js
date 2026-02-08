const mysql = require('mysql2/promise');

async function transferEarnings() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '137920',
    database: 'nemy_db_local'
  });

  try {
    // Obtener pedidos entregados con comisiones calculadas
    const [orders] = await connection.execute(`
      SELECT id, business_id, delivery_person_id, total, delivery_fee, 
             platform_fee, business_earnings, delivery_earnings
      FROM orders 
      WHERE status = 'delivered' 
      AND platform_fee IS NOT NULL 
      AND business_earnings IS NOT NULL
    `);

    console.log(`Found ${orders.length} delivered orders with calculated commissions`);

    for (const order of orders) {
      console.log(`\nProcessing order ${order.id}...`);
      console.log(`  Business earnings: $${order.business_earnings/100}`);
      console.log(`  Delivery earnings: $${order.delivery_earnings/100}`);
      
      // Verificar si ya existe transacción para este pedido
      const [existingTx] = await connection.execute(`
        SELECT id FROM transactions WHERE order_id = ? AND type = 'income'
      `, [order.id]);

      if (existingTx.length > 0) {
        console.log(`  ⚠️  Transaction already exists, skipping...`);
        continue;
      }

      // Crear wallet si no existe para el negocio
      await connection.execute(`
        INSERT IGNORE INTO wallets (id, user_id, balance, total_earned, pending_balance, cash_owed, total_withdrawn, created_at) 
        VALUES (UUID(), ?, 0, 0, 0, 0, 0, NOW())
      `, [order.business_id]);

      // Actualizar balance del negocio
      await connection.execute(`
        UPDATE wallets 
        SET balance = balance + ?, total_earned = total_earned + ?, updated_at = NOW()
        WHERE user_id = ?
      `, [order.business_earnings, order.business_earnings, order.business_id]);

      // Crear transacción para el negocio
      await connection.execute(`
        INSERT INTO transactions (id, user_id, order_id, type, amount, description, status, created_at, updated_at)
        VALUES (UUID(), ?, ?, 'income', ?, ?, 'completed', NOW(), NOW())
      `, [
        order.business_id, 
        order.id, 
        order.business_earnings, 
        `Ganancia del pedido #${order.id.slice(-6)}`
      ]);

      console.log(`  ✅ Business wallet updated`);

      // Si hay repartidor, actualizar su wallet también
      if (order.delivery_person_id) {
        await connection.execute(`
          INSERT IGNORE INTO wallets (id, user_id, balance, total_earned, pending_balance, cash_owed, total_withdrawn, created_at) 
          VALUES (UUID(), ?, 0, 0, 0, 0, 0, NOW())
        `, [order.delivery_person_id]);

        await connection.execute(`
          UPDATE wallets 
          SET balance = balance + ?, total_earned = total_earned + ?, updated_at = NOW()
          WHERE user_id = ?
        `, [order.delivery_earnings, order.delivery_earnings, order.delivery_person_id]);

        await connection.execute(`
          INSERT INTO transactions (id, user_id, order_id, type, amount, description, status, created_at, updated_at)
          VALUES (UUID(), ?, ?, 'income', ?, ?, 'completed', NOW(), NOW())
        `, [
          order.delivery_person_id, 
          order.id, 
          order.delivery_earnings, 
          `Comisión de entrega - Pedido #${order.id.slice(-6)}`
        ]);

        console.log(`  ✅ Driver wallet updated`);
      }
    }

    console.log('\n🎉 All earnings transferred to wallets!');
    
    // Mostrar resumen de wallets
    const [wallets] = await connection.execute(`
      SELECT user_id, balance, total_earned FROM wallets WHERE balance > 0
    `);
    
    console.log('\n💰 Wallet Summary:');
    for (const wallet of wallets) {
      console.log(`  ${wallet.user_id}: $${wallet.balance/100} (earned: $${wallet.total_earned/100})`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

transferEarnings();