const axios = require('axios');

async function emergencyLogin() {
  try {
    console.log('🚨 EMERGENCY LOGIN - Logging in as Sushi Owner with $246.65');
    
    // Login de emergencia
    const loginResponse = await axios.post('http://localhost:5000/api/emergency-login');
    
    if (loginResponse.data.success) {
      console.log('✅ Emergency login successful');
      console.log('👤 User:', loginResponse.data.user.name);
      console.log('💰 Expected balance: $246.65');
      
      const token = loginResponse.data.token;
      
      // Test wallet balance
      const walletResponse = await axios.get('http://localhost:5000/api/wallet/balance', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('\n💰 WALLET RESPONSE:');
      console.log('Balance:', walletResponse.data.balance, 'centavos = $' + (walletResponse.data.balance / 100));
      console.log('Available for withdrawal:', walletResponse.data.availableForWithdrawal, 'centavos = $' + (walletResponse.data.availableForWithdrawal / 100));
      
      console.log('\n🎯 USE THIS TOKEN IN YOUR APP:');
      console.log(token);
      
    } else {
      console.log('❌ Emergency login failed');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

emergencyLogin();