const mysql = require('mysql2/promise');

async function fixAvailableOrders() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root', 
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'nemy_db_local'
  });

  try {
    console.log('🔧 Arreglando pedidos disponibles...');
    
    // Actualizar algunos pedidos para que estén disponibles
    const [result] = await connection.execute(`
      UPDATE orders 
      SET status = 'ready', deliveryPersonId = NULL, updatedAt = NOW()
      WHERE status IN ('picked_up', 'on_the_way') 
      AND deliveryPersonId = 'driver-1'
      LIMIT 3
    `);
    
    console.log(`✅ ${result.affectedRows} pedidos actualizados`);
    
    // Verificar pedidos disponibles
    const [available] = await connection.execute(`
      SELECT id, businessName, status, total, deliveryPersonId, createdAt
      FROM orders 
      WHERE status = 'ready' AND deliveryPersonId IS NULL
      ORDER BY createdAt DESC
      LIMIT 5
    `);
    
    console.log('📦 Pedidos disponibles ahora:');
    available.forEach(order => {
      console.log(`- ${order.id}: ${order.businessName} - $${order.total/100} - ${order.status}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await connection.end();
  }
}

fixAvailableOrders();