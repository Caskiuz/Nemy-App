const mysql = require('mysql2/promise');

async function processAllDeliveredOrders() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '137920',
    database: 'nemy_db_local'
  });

  try {
    // Obtener todos los pedidos entregados
    const [orders] = await connection.execute(`
      SELECT id, business_id, delivery_person_id, total, delivery_fee, status
      FROM orders 
      WHERE status = 'delivered'
    `);

    console.log(`Found ${orders.length} delivered orders to process`);

    for (const order of orders) {
      console.log(`\nProcessing order ${order.id}...`);
      
      // Calcular ganancias
      const deliveryFee = order.delivery_fee || 0;
      const productsWithMarkup = order.total - deliveryFee;
      const businessEarnings = Math.round(productsWithMarkup / 1.15);
      const platformFee = productsWithMarkup - businessEarnings;
      const driverEarnings = deliveryFee;

      console.log(`  Business: $${businessEarnings/100}, Driver: $${driverEarnings/100}, Platform: $${platformFee/100}`);

      // Actualizar pedido con comisiones
      await connection.execute(`
        UPDATE orders 
        SET platform_fee = ?, business_earnings = ?, delivery_earnings = ?
        WHERE id = ?
      `, [platformFee, businessEarnings, driverEarnings, order.id]);

      // Crear/actualizar wallet del negocio
      await connection.execute(`
        INSERT INTO wallets (id, user_id, balance, total_earned, pending_balance, cash_owed, total_withdrawn, created_at)
        VALUES (UUID(), ?, ?, ?, 0, 0, 0, NOW())
        ON DUPLICATE KEY UPDATE 
        balance = balance + ?, 
        total_earned = total_earned + ?,
        updated_at = NOW()
      `, [order.business_id, businessEarnings, businessEarnings, businessEarnings, businessEarnings]);

      // Crear/actualizar wallet del repartidor si existe
      if (order.delivery_person_id) {
        await connection.execute(`
          INSERT INTO wallets (id, user_id, balance, total_earned, pending_balance, cash_owed, total_withdrawn, created_at)
          VALUES (UUID(), ?, ?, ?, 0, 0, 0, NOW())
          ON DUPLICATE KEY UPDATE 
          balance = balance + ?, 
          total_earned = total_earned + ?,
          updated_at = NOW()
        `, [order.delivery_person_id, driverEarnings, driverEarnings, driverEarnings, driverEarnings]);
      }

      // Crear transacciones
      await connection.execute(`
        INSERT IGNORE INTO transactions (id, user_id, order_id, type, amount, description, status, created_at)
        VALUES (UUID(), ?, ?, 'income', ?, ?, 'completed', NOW())
      `, [order.business_id, order.id, businessEarnings, `Ganancia del pedido #${order.id.slice(-6)}`]);

      if (order.delivery_person_id) {
        await connection.execute(`
          INSERT IGNORE INTO transactions (id, user_id, order_id, type, amount, description, status, created_at)
          VALUES (UUID(), ?, ?, 'income', ?, ?, 'completed', NOW())
        `, [order.delivery_person_id, order.id, driverEarnings, `Comisión de entrega - Pedido #${order.id.slice(-6)}`]);
      }

      console.log(`  ✅ Processed`);
    }

    // Mostrar resumen final
    const [wallets] = await connection.execute(`
      SELECT w.user_id, w.balance, w.total_earned, u.name, u.role
      FROM wallets w
      JOIN users u ON w.user_id = u.id
      WHERE w.balance > 0
      ORDER BY w.balance DESC
    `);

    console.log('\n💰 FINAL WALLET BALANCES:');
    for (const wallet of wallets) {
      console.log(`  ${wallet.name} (${wallet.role}): $${wallet.balance/100} (earned: $${wallet.total_earned/100})`);
    }

    console.log('\n🎉 All delivered orders processed!');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

processAllDeliveredOrders();