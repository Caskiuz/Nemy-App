const https = require('https');

const BACKEND_URL = 'https://nemy-app.replit.app';

// Token de prueba - reemplazar con un token real de repartidor
const DRIVER_TOKEN = 'TU_TOKEN_AQUI';

console.log('========================================');
console.log('  Test: /api/delivery/my-orders');
console.log('========================================\n');

const options = {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${DRIVER_TOKEN}`,
    'Content-Type': 'application/json'
  }
};

const req = https.request(`${BACKEND_URL}/api/delivery/my-orders`, options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Response:`, data);
    
    if (res.statusCode === 200) {
      const json = JSON.parse(data);
      console.log(`\n✅ Endpoint funciona!`);
      console.log(`Pedidos encontrados: ${json.orders?.length || 0}`);
    } else {
      console.log(`\n❌ Error: ${res.statusCode}`);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error de conexión:', error.message);
});

req.end();

console.log('\n📝 Nota: Necesitas un token válido de repartidor');
console.log('Para obtenerlo:');
console.log('1. Login como repartidor en la app');
console.log('2. El token se guarda en AsyncStorage');
console.log('3. O usa: POST /api/auth/phone-login con número de repartidor\n');
