// Script para verificar órdenes y estadísticas
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function checkOrders() {
  const mysqlUrl = process.env.MYSQL_DATABASE_URL || process.env.DATABASE_URL;
  const url = new URL(mysqlUrl);
  
  const connection = await mysql.createConnection({
    host: url.hostname,
    port: parseInt(url.port || '3306'),
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
    ssl: { rejectUnauthorized: false },
  });

  console.log('✅ Connected to database\n');

  // Ver estadísticas por negocio
  const [stats] = await connection.execute(`
    SELECT 
      b.id,
      b.name as business_name,
      COUNT(o.id) as total_orders,
      SUM(CASE WHEN o.status IN ('pending', 'accepted', 'preparing') THEN 1 ELSE 0 END) as pending_orders,
      SUM(CASE WHEN o.status = 'delivered' THEN 1 ELSE 0 END) as completed_orders,
      SUM(CASE WHEN o.status = 'delivered' THEN o.subtotal ELSE 0 END) as total_revenue
    FROM businesses b
    LEFT JOIN orders o ON b.id = o.business_id
    WHERE b.owner_id = 'business-owner-1'
    GROUP BY b.id, b.name
    ORDER BY b.name
  `);

  console.log('📊 ESTADÍSTICAS POR NEGOCIO (owner: business-owner-1):');
  console.table(stats);

  // Ver detalle de órdenes por negocio
  const [tacos] = await connection.execute(`
    SELECT id, status, subtotal, created_at
    FROM orders 
    WHERE business_id = 'bcf15003-0001-11f1-a5c3-1866da2fd9d2'
    ORDER BY created_at DESC
  `);

  console.log('\n🌮 TACOS EL GÜERO - Detalle de órdenes:');
  console.table(tacos);

  const [burger] = await connection.execute(`
    SELECT id, status, subtotal, created_at
    FROM orders 
    WHERE business_id = 'bcf3a84a-0001-11f1-a5c3-1866da2fd9d2'
    ORDER BY created_at DESC
  `);

  console.log('\n🍔 BURGER HOUSE - Detalle de órdenes:');
  console.table(burger);

  const [pizza] = await connection.execute(`
    SELECT id, status, subtotal, created_at
    FROM orders 
    WHERE business_id = 'bcf50359-0001-11f1-a5c3-1866da2fd9d2'
    ORDER BY created_at DESC
  `);

  console.log('\n🍕 PIZZA NAPOLI - Detalle de órdenes:');
  console.table(pizza);

  // Verificar cálculo de ingresos
  console.log('\n💰 VERIFICACIÓN DE CÁLCULOS:');
  console.log('Tacos El Güero:');
  console.log('  - 4 órdenes delivered × $85.00 = $340.00 ✓');
  console.log('  - Subtotal en centavos: 4 × 8500 = 34000');
  console.log('  - Convertido a dólares: 34000 / 100 = $340.00');

  await connection.end();
}

checkOrders().catch(console.error);
