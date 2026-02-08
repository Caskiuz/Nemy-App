const axios = require('axios');

async function testWalletEndpoint() {
  try {
    // Probar con cada business owner
    const businessOwners = [
      { id: 'bcf15003-0001-11f1-a5c3-1866da2fd9d2', name: 'Tacos Owner' },
      { id: 'bcf50359-0001-11f1-a5c3-1866da2fd9d2', name: 'Pizza Owner' },
      { id: 'bcf632c5-0001-11f1-a5c3-1866da2fd9d2', name: 'Sushi Owner' }
    ];

    for (const owner of businessOwners) {
      console.log(`\n🧪 Testing wallet for ${owner.name} (${owner.id})`);
      
      // Test endpoint sin auth
      try {
        const response = await axios.get(`http://localhost:5000/api/test-wallet/${owner.id}`);
        console.log(`  ✅ Balance: $${response.data.balancePesos} (${response.data.wallet?.balance} centavos)`);
        console.log(`  📊 Total earned: ${response.data.wallet?.total_earned || 0} centavos`);
      } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
      }
    }

    // Test login y wallet con auth
    console.log('\n🔐 Testing with authentication...');
    
    // Login como business owner
    const loginResponse = await axios.post('http://localhost:5000/api/auth/dev-login', {
      userId: 'bcf632c5-0001-11f1-a5c3-1866da2fd9d2' // Sushi Owner
    });
    
    if (loginResponse.data.success) {
      console.log('✅ Login successful');
      const token = loginResponse.data.token;
      
      // Test wallet balance con auth
      const walletResponse = await axios.get('http://localhost:5000/api/wallet/balance', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('💰 Wallet response:', walletResponse.data);
      console.log(`💵 Balance: $${walletResponse.data.balance / 100}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testWalletEndpoint();