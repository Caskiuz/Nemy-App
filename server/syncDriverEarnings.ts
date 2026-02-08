import { config } from 'dotenv';
import { resolve } from 'path';

// Cargar variables de entorno
config({ path: resolve(__dirname, '../.env.local') });

import { db } from './db';
import { orders, wallets, transactions } from '../shared/schema-mysql';
import { eq, and } from 'drizzle-orm';

async function syncDriverEarnings() {
  console.log('🔄 Sincronizando ganancias de drivers...');

  // Obtener todos los pedidos entregados
  const deliveredOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.status, 'delivered'));

  console.log(`📦 Encontrados ${deliveredOrders.length} pedidos entregados`);

  for (const order of deliveredOrders) {
    if (!order.deliveryPersonId) {
      console.log(`⚠️  Pedido ${order.id} sin driver asignado`);
      continue;
    }

    // Verificar si ya tiene ganancias registradas
    const existingTx = await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.orderId, order.id),
          eq(transactions.userId, order.deliveryPersonId),
          eq(transactions.type, 'delivery_payment')
        )
      )
      .limit(1);

    if (existingTx.length > 0) {
      console.log(`✅ Pedido ${order.id.slice(-6)} ya procesado`);
      continue;
    }

    // Calcular comisión del driver (15% del total)
    const driverEarnings = Math.round(order.total * 0.15);

    // Actualizar o crear wallet
    const [wallet] = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, order.deliveryPersonId))
      .limit(1);

    if (wallet) {
      await db
        .update(wallets)
        .set({
          balance: wallet.balance + driverEarnings,
          totalEarned: wallet.totalEarned + driverEarnings,
        })
        .where(eq(wallets.userId, order.deliveryPersonId));
    } else {
      await db.insert(wallets).values({
        userId: order.deliveryPersonId,
        balance: driverEarnings,
        pendingBalance: 0,
        totalEarned: driverEarnings,
        totalWithdrawn: 0,
        cashOwed: 0,
      });
    }

    // Crear transacción
    await db.insert(transactions).values({
      userId: order.deliveryPersonId,
      orderId: order.id,
      type: 'delivery_payment',
      amount: driverEarnings,
      status: 'completed',
      description: `Entrega de pedido #${order.id.slice(-6)}`,
    });

    // Actualizar orden con ganancias
    await db
      .update(orders)
      .set({
        deliveryEarnings: driverEarnings,
        platformFee: Math.round(order.total * 0.15),
        businessEarnings: Math.round(order.total * 0.70),
      })
      .where(eq(orders.id, order.id));

    console.log(`✅ Pedido ${order.id.slice(-6)}: +$${(driverEarnings / 100).toFixed(2)} para driver`);
  }

  console.log('✅ Sincronización completada');
}

syncDriverEarnings()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
