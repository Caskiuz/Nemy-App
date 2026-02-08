const mysql = require('mysql2/promise');

async function testEndpointLogic() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '137920',
    database: 'nemy_db_local'
  });

  try {
    // Simulate getAvailableOrdersForDriver logic
    const driverId = 'driver-1';
    
    // 1. Get driver location
    const [driverData] = await connection.execute(
      'SELECT current_latitude, current_longitude FROM delivery_drivers WHERE user_id = ?',
      [driverId]
    );
    
    if (driverData.length === 0) {
      console.log('❌ Driver not found');
      return;
    }
    
    const driver = driverData[0];
    console.log('✅ Driver location:', driver.current_latitude, driver.current_longitude);
    
    // 2. Get available orders
    const [orders] = await connection.execute(`
      SELECT id, business_id, status, delivery_person_id, total 
      FROM orders 
      WHERE status IN ('ready', 'confirmed', 'preparing')
    `);
    
    console.log(`\n📦 Found ${orders.length} orders with ready/confirmed/preparing status`);
    
    // 3. Filter orders without driver
    const availableOrders = orders.filter(o => !o.delivery_person_id);
    console.log(`📦 ${availableOrders.length} orders without driver assigned`);
    
    // 4. Check businesses
    for (const order of availableOrders) {
      const [business] = await connection.execute(
        'SELECT id, name, latitude, longitude FROM businesses WHERE id = ?',
        [order.business_id]
      );
      
      if (business.length > 0) {
        const b = business[0];
        console.log(`  - Order ${order.id.slice(-6)}: ${b.name} at (${b.latitude}, ${b.longitude})`);
      } else {
        console.log(`  - Order ${order.id.slice(-6)}: ❌ Business not found`);
      }
    }
    
  } finally {
    await connection.end();
  }
}

testEndpointLogic();