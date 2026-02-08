const axios = require('axios');

async function loginCorrect() {
  try {
    console.log('🔐 Logging in as Carlos Restaurante (business@nemy.com)');
    
    const loginResponse = await axios.post('http://localhost:5000/api/auth/dev-email-login', {
      email: 'business@nemy.com',
      password: 'password'
    });
    
    if (loginResponse.data.success) {
      console.log('✅ Login successful as:', loginResponse.data.user.name);
      console.log('👤 Role:', loginResponse.data.user.role);
      
      const token = loginResponse.data.token;
      
      // Test wallet
      const walletResponse = await axios.get('http://localhost:5000/api/wallet/balance', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('\n💰 WALLET:');
      console.log('Balance: $' + (walletResponse.data.balance / 100));
      console.log('Available: $' + (walletResponse.data.availableForWithdrawal / 100));
      
      console.log('\n🎯 TOKEN PARA TU APP:');
      console.log(token);
      
    } else {
      console.log('❌ Login failed');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

loginCorrect();