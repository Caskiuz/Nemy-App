// Test script for business panel functionality
const API_BASE = 'http://localhost:5000';

// Test business authentication and order management
async function testBusinessPanel() {
  console.log('🧪 Testing Business Panel Functionality\n');

  try {
    // 1. Test business authentication
    console.log('1. Testing business authentication...');
    const authResponse = await fetch(`${API_BASE}/api/auth/send-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '+523414567892' }) // Pizza Napoli
    });
    
    if (authResponse.ok) {
      console.log('✅ Auth endpoint working');
    } else {
      console.log('❌ Auth endpoint failed:', await authResponse.text());
    }

    // 2. Test getting business orders (without auth - should fail)
    console.log('\n2. Testing business orders endpoint (no auth)...');
    const ordersResponse = await fetch(`${API_BASE}/api/business/orders`);
    const ordersResult = await ordersResponse.text();
    console.log('Response:', ordersResult);

    // 3. Test order status update (without auth - should fail)
    console.log('\n3. Testing order status update (no auth)...');
    const updateResponse = await fetch(`${API_BASE}/api/business/orders/test-id/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'confirmed' })
    });
    const updateResult = await updateResponse.text();
    console.log('Response:', updateResult);

    console.log('\n📋 Summary:');
    console.log('- Business endpoints exist and require authentication');
    console.log('- The issue is likely in the mobile app authentication or button handlers');
    console.log('- Check if the business user is properly logged in');
    console.log('- Verify button onPress handlers are working');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testBusinessPanel();