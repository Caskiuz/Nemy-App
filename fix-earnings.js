const mysql = require('mysql2/promise');

async function fixEarnings() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '137920',
    database: 'nemy_db_local'
  });

  try {
    // Obtener pedidos entregados sin comisiones calculadas
    const [orders] = await connection.execute(`
      SELECT id, business_id, delivery_person_id, total, delivery_fee, payment_method
      FROM orders 
      WHERE status = 'delivered' 
      AND (platform_fee IS NULL OR business_earnings IS NULL)
    `);

    console.log(`Found ${orders.length} delivered orders without commissions`);

    for (const order of orders) {
      console.log(`\nProcessing order ${order.id}...`);
      
      // Calcular comisiones
      const deliveryFee = order.delivery_fee || 0;
      const productsWithMarkup = order.total - deliveryFee;
      const productBase = Math.round(productsWithMarkup / 1.15);
      const platformFee = productsWithMarkup - productBase;
      
      console.log(`  Total: $${order.total/100} | Delivery: $${deliveryFee/100}`);
      console.log(`  Business gets: $${productBase/100} | Platform gets: $${platformFee/100}`);
      
      // Actualizar pedido con comisiones
      await connection.execute(`
        UPDATE orders 
        SET platform_fee = ?, business_earnings = ?, delivery_earnings = ?
        WHERE id = ?
      `, [platformFee, productBase, deliveryFee, order.id]);

      // Crear wallet si no existe para el negocio
      await connection.execute(`
        INSERT IGNORE INTO wallets (id, user_id, balance, total_earned) 
        VALUES (UUID(), ?, 0, 0)
      `, [order.business_id]);

      // Actualizar balance del negocio
      await connection.execute(`
        UPDATE wallets 
        SET balance = balance + ?, total_earned = total_earned + ?
        WHERE user_id = ?
      `, [productBase, productBase, order.business_id]);

      // Crear transacción para el negocio
      await connection.execute(`
        INSERT INTO transactions (id, user_id, order_id, type, amount, description, status, created_at)
        VALUES (UUID(), ?, ?, 'income', ?, ?, 'completed', NOW())
      `, [
        order.business_id, 
        order.id, 
        productBase, 
        `Ganancia del pedido #${order.id.slice(-6)}`
      ]);

      // Si hay repartidor, actualizar su wallet también
      if (order.delivery_person_id) {
        await connection.execute(`
          INSERT IGNORE INTO wallets (id, user_id, balance, total_earned) 
          VALUES (UUID(), ?, 0, 0)
        `, [order.delivery_person_id]);

        await connection.execute(`
          UPDATE wallets 
          SET balance = balance + ?, total_earned = total_earned + ?
          WHERE user_id = ?
        `, [deliveryFee, deliveryFee, order.delivery_person_id]);

        await connection.execute(`
          INSERT INTO transactions (id, user_id, order_id, type, amount, description, status, created_at)
          VALUES (UUID(), ?, ?, 'income', ?, ?, 'completed', NOW())
        `, [
          order.delivery_person_id, 
          order.id, 
          deliveryFee, 
          `Comisión de entrega - Pedido #${order.id.slice(-6)}`
        ]);
      }

      console.log(`  ✅ Commissions distributed`);
    }

    console.log('\n🎉 All earnings fixed!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

fixEarnings();