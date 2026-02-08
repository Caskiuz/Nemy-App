// Direct test of getAvailableOrdersForDriver
async function testDirectly() {
  const { getAvailableOrdersForDriver } = require('./server/zoneFiltering');
  
  console.log('Testing with driver-1...');
  const result = await getAvailableOrdersForDriver('driver-1');
  
  console.log('\nResult:', JSON.stringify(result, null, 2));
  console.log('\nOrders count:', result.orders?.length || 0);
}

testDirectly().catch(console.error);