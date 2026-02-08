// Test rápido de Stripe
import Stripe from 'stripe';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })
  : null;

async function testStripe() {
  console.log('🧪 Probando configuración de Stripe...\n');

  if (!stripe) {
    console.log('❌ STRIPE_SECRET_KEY no configurada');
    process.exit(1);
  }

  try {
    // Test 1: Obtener información de la cuenta
    console.log('1️⃣ Obteniendo información de cuenta...');
    const account = await stripe.accounts.retrieve();
    console.log('✅ Cuenta Stripe conectada:');
    console.log(`   - ID: ${account.id}`);
    console.log(`   - Email: ${account.email || 'N/A'}`);
    console.log(`   - País: ${account.country}`);
    console.log(`   - Moneda: ${account.default_currency?.toUpperCase()}`);
    console.log('');

    // Test 2: Verificar balance
    console.log('2️⃣ Verificando balance...');
    const balance = await stripe.balance.retrieve();
    console.log('✅ Balance disponible:');
    balance.available.forEach(b => {
      console.log(`   - ${(b.amount / 100).toFixed(2)} ${b.currency.toUpperCase()}`);
    });
    console.log('');

    // Test 3: Listar últimos 3 pagos
    console.log('3️⃣ Últimos pagos...');
    const charges = await stripe.charges.list({ limit: 3 });
    if (charges.data.length === 0) {
      console.log('   ℹ️  No hay pagos aún');
    } else {
      charges.data.forEach(charge => {
        console.log(`   - ${(charge.amount / 100).toFixed(2)} ${charge.currency.toUpperCase()} - ${charge.status}`);
      });
    }
    console.log('');

    console.log('🎉 ¡Stripe configurado correctamente!');
    console.log('✅ Sistema de retiros listo para usar');
    
  } catch (error: any) {
    console.error('❌ Error al conectar con Stripe:');
    console.error(`   ${error.message}`);
    process.exit(1);
  }
}

testStripe();
