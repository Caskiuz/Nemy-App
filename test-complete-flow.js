const axios = require('axios');
const mysql = require('mysql2/promise');

const BASE_URL = 'http://localhost:5000/api';
const DB_CONFIG = {
  host: 'localhost',
  user: 'root',
  password: '', // Cambiar si tienes contraseña
  database: 'nemy_db_local'
};

// Colores para consola
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function resetDatabase() {
  log('\n🔄 RESETEANDO BASE DE DATOS...', 'yellow');
  
  const connection = await mysql.createConnection(DB_CONFIG);
  
  await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
  await connection.execute('DELETE FROM orders');
  await connection.execute('DELETE FROM payments');
  await connection.execute('DELETE FROM transactions');
  await connection.execute('DELETE FROM withdrawals');
  await connection.execute('DELETE FROM reviews');
  await connection.execute(`
    UPDATE wallets SET 
      balance = 0,
      pending_balance = 0,
      cash_owed = 0,
      total_earned = 0,
      total_withdrawn = 0,
      updated_at = NOW()
  `);
  await connection.execute(`
    UPDATE businesses SET 
      rating = 0,
      total_ratings = 0,
      updated_at = NOW()
  `);
  await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
  
  await connection.end();
  log('✅ Base de datos reseteada', 'green');
}

async function createTestOrder() {
  log('\n📦 CREANDO PEDIDO DE PRUEBA...', 'yellow');
  
  const orderData = {
    customerId: 1, // Cliente demo
    businessId: 1, // Negocio demo
    deliveryDriverId: 3, // Repartidor demo
    items: [
      { productId: 1, quantity: 2, price: 15.99 },
      { productId: 2, quantity: 1, price: 8.50 }
    ],
    subtotal: 40.48,
    deliveryFee: 5.00,
    tax: 3.64,
    total: 49.12,
    paymentMethod: 'card',
    deliveryAddress: 'Calle Demo 123, Autlán',
    customerNotes: 'Prueba automatizada'
  };

  try {
    const response = await axios.post(`${BASE_URL}/orders`, orderData);
    log(`✅ Pedido creado: ID ${response.data.orderId}`, 'green');
    return response.data.orderId;
  } catch (error) {
    log(`❌ Error creando pedido: ${error.message}`, 'red');
    throw error;
  }
}

async function processPayment(orderId) {
  log('\n💳 PROCESANDO PAGO...', 'yellow');
  
  try {
    const response = await axios.post(`${BASE_URL}/payments/process`, {
      orderId,
      paymentMethodId: 'pm_card_visa', // Token de prueba Stripe
      amount: 4912 // $49.12 en centavos
    });
    
    log(`✅ Pago procesado: ${response.data.paymentIntentId}`, 'green');
    return response.data.paymentIntentId;
  } catch (error) {
    log(`❌ Error procesando pago: ${error.message}`, 'red');
    throw error;
  }
}

async function updateOrderStatus(orderId, status) {
  log(`\n📋 ACTUALIZANDO ESTADO A: ${status}`, 'yellow');
  
  try {
    await axios.patch(`${BASE_URL}/orders/${orderId}/status`, { status });
    log(`✅ Estado actualizado a: ${status}`, 'green');
  } catch (error) {
    log(`❌ Error actualizando estado: ${error.message}`, 'red');
    throw error;
  }
}

async function checkWallets() {
  log('\n💰 VERIFICANDO WALLETS...', 'yellow');
  
  const connection = await mysql.createConnection(DB_CONFIG);
  
  const [wallets] = await connection.execute(`
    SELECT 
      w.userId,
      u.name,
      u.role,
      w.balance,
      w.pending_balance,
      w.total_earned
    FROM wallets w
    JOIN users u ON w.userId = u.id
    WHERE w.balance > 0 OR w.pending_balance > 0 OR w.total_earned > 0
  `);
  
  wallets.forEach(wallet => {
    log(`👤 ${wallet.name} (${wallet.role}):`, 'blue');
    log(`   Balance: $${wallet.balance}`, 'green');
    log(`   Pendiente: $${wallet.pending_balance}`, 'yellow');
    log(`   Total ganado: $${wallet.total_earned}`, 'blue');
  });
  
  await connection.end();
}

async function checkTransactions() {
  log('\n📊 VERIFICANDO TRANSACCIONES...', 'yellow');
  
  const connection = await mysql.createConnection(DB_CONFIG);
  
  const [transactions] = await connection.execute(`
    SELECT 
      t.id,
      t.type,
      t.amount,
      t.description,
      u.name as user_name
    FROM transactions t
    JOIN users u ON t.userId = u.id
    ORDER BY t.created_at DESC
  `);
  
  transactions.forEach(tx => {
    log(`💸 ${tx.user_name}: ${tx.type} - $${tx.amount} (${tx.description})`, 'blue');
  });
  
  await connection.end();
}

async function runFinancialAudit() {
  log('\n🔍 EJECUTANDO AUDITORÍA FINANCIERA...', 'yellow');
  
  try {
    const response = await axios.get(`${BASE_URL}/audit/quick`);
    const audit = response.data;
    
    log('\n📋 RESULTADOS DE AUDITORÍA:', 'bold');
    
    audit.checks.forEach(check => {
      const status = check.passed ? '✅' : '❌';
      const color = check.passed ? 'green' : 'red';
      log(`${status} ${check.rule}`, color);
      if (check.details) {
        log(`   ${check.details}`, 'blue');
      }
    });
    
    log(`\n🎯 RESULTADO GENERAL: ${audit.overall_status}`, 
         audit.overall_status === 'PASSED' ? 'green' : 'red');
    
  } catch (error) {
    log(`❌ Error en auditoría: ${error.message}`, 'red');
  }
}

async function runCompleteTest() {
  try {
    log('🚀 INICIANDO PRUEBA COMPLETA DEL FLUJO DE NEMY', 'bold');
    log('=' .repeat(50), 'blue');
    
    // 1. Reset
    await resetDatabase();
    
    // 2. Crear pedido
    const orderId = await createTestOrder();
    
    // 3. Procesar pago
    await processPayment(orderId);
    
    // 4. Simular flujo completo
    await updateOrderStatus(orderId, 'confirmed');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await updateOrderStatus(orderId, 'preparing');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await updateOrderStatus(orderId, 'ready');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await updateOrderStatus(orderId, 'picked_up');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await updateOrderStatus(orderId, 'delivered');
    
    // 5. Verificar resultados
    await checkWallets();
    await checkTransactions();
    await runFinancialAudit();
    
    log('\n🎉 PRUEBA COMPLETA FINALIZADA', 'green');
    log('=' .repeat(50), 'blue');
    
  } catch (error) {
    log(`\n💥 ERROR EN LA PRUEBA: ${error.message}`, 'red');
    console.error(error);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runCompleteTest();
}

module.exports = { runCompleteTest };