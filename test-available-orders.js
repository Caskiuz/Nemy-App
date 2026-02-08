// Test script to debug available orders
const mysql = require('mysql2/promise');

async function testAvailableOrders() {
  console.log('🔍 Testing available orders logic...\n');

  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '137920',
    database: 'nemy_db_local'
  });

  try {
    // 1. Check ready orders without driver
    console.log('1. Checking ready orders without driver:');
    const [readyOrders] = await connection.execute(`
      SELECT id, status, delivery_person_id, business_id 
      FROM orders 
      WHERE status = 'ready' AND delivery_person_id IS NULL
    `);
    console.log(`Found ${readyOrders.length} ready orders without driver:`);
    readyOrders.forEach(order => {
      console.log(`  - Order ${order.id.slice(-6)}: ${order.status}, business: ${order.business_id.slice(-6)}`);
    });

    // 2. Check delivery drivers
    console.log('\n2. Checking delivery drivers:');
    const [drivers] = await connection.execute(`
      SELECT user_id, current_latitude, current_longitude, is_available 
      FROM delivery_drivers
    `);
    console.log(`Found ${drivers.length} delivery drivers:`);
    drivers.forEach(driver => {
      console.log(`  - Driver ${driver.user_id}: available=${driver.is_available}, location=(${driver.current_latitude}, ${driver.current_longitude})`);
    });

    // 3. Check businesses for ready orders
    console.log('\n3. Checking businesses for ready orders:');
    if (readyOrders.length > 0) {
      const businessIds = readyOrders.map(o => `'${o.business_id}'`).join(',');
      const [businesses] = await connection.execute(`
        SELECT id, name, latitude, longitude 
        FROM businesses 
        WHERE id IN (${businessIds})
      `);
      console.log(`Found ${businesses.length} businesses:`);
      businesses.forEach(business => {
        console.log(`  - Business ${business.name}: location=(${business.latitude}, ${business.longitude})`);
      });
    }

    // 4. Simulate the getAvailableOrdersForDriver logic
    console.log('\n4. Simulating getAvailableOrdersForDriver logic:');
    const testDriverId = 'test-driver-1';
    
    const [driverData] = await connection.execute(`
      SELECT current_latitude, current_longitude 
      FROM delivery_drivers 
      WHERE user_id = ?
    `, [testDriverId]);

    if (driverData.length === 0) {
      console.log(`❌ Driver ${testDriverId} not found in delivery_drivers table`);
    } else {
      const driver = driverData[0];
      console.log(`✅ Driver ${testDriverId} found: location=(${driver.current_latitude}, ${driver.current_longitude})`);
      
      if (!driver.current_latitude || !driver.current_longitude) {
        console.log('⚠️ Driver has no location, would return all available orders');
        console.log(`Available orders count: ${readyOrders.length}`);
      } else {
        console.log('✅ Driver has location, would filter by distance');
        console.log(`Available orders count: ${readyOrders.length}`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

testAvailableOrders();