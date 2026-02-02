import { db } from './db';
import { scheduledOrders, orders, users, businesses } from '../shared/schema-mysql';
import { eq, and, lte, gte } from 'drizzle-orm';
import { sendSMS } from './smsService';

interface ScheduledOrderData {
  userId: number;
  businessId: number;
  items: any[];
  scheduledFor: Date;
  deliveryAddress: string;
  deliveryLatitude: number;
  deliveryLongitude: number;
  paymentMethod: 'card' | 'cash';
  notes?: string;
}

export async function createScheduledOrder(
  data: ScheduledOrderData
): Promise<number> {
  const now = new Date();
  const scheduledTime = new Date(data.scheduledFor);

  // Validar que la fecha sea futura
  if (scheduledTime <= now) {
    throw new Error('La fecha programada debe ser futura');
  }

  // Validar que sea al menos 1 hora en el futuro
  const minTime = new Date(now.getTime() + 60 * 60 * 1000);
  if (scheduledTime < minTime) {
    throw new Error('Los pedidos deben programarse con al menos 1 hora de anticipación');
  }

  // Validar que no sea más de 7 días en el futuro
  const maxTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  if (scheduledTime > maxTime) {
    throw new Error('Los pedidos no pueden programarse con más de 7 días de anticipación');
  }

  const [scheduled] = await db
    .insert(scheduledOrders)
    .values({
      userId: data.userId,
      businessId: data.businessId,
      items: JSON.stringify(data.items),
      scheduledFor: scheduledTime,
      deliveryAddress: data.deliveryAddress,
      deliveryLatitude: data.deliveryLatitude,
      deliveryLongitude: data.deliveryLongitude,
      paymentMethod: data.paymentMethod,
      notes: data.notes,
      status: 'pending',
      createdAt: now,
    })
    .returning();

  return scheduled.id;
}

export async function processScheduledOrders(): Promise<void> {
  const now = new Date();
  const processingWindow = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutos

  // Obtener pedidos que deben procesarse
  const pendingOrders = await db
    .select()
    .from(scheduledOrders)
    .where(
      and(
        eq(scheduledOrders.status, 'pending'),
        lte(scheduledOrders.scheduledFor, processingWindow)
      )
    );

  for (const scheduled of pendingOrders) {
    try {
      // Verificar que el negocio esté abierto
      const [business] = await db
        .select()
        .from(businesses)
        .where(eq(businesses.id, scheduled.businessId))
        .limit(1);

      if (!business || !business.isOpen) {
        await markScheduledOrderFailed(
          scheduled.id,
          'El negocio no está disponible'
        );
        continue;
      }

      // Crear el pedido real
      const items = JSON.parse(scheduled.items);
      const total = items.reduce((sum: number, item: any) => 
        sum + (item.price * item.quantity), 0
      );

      const [order] = await db
        .insert(orders)
        .values({
          userId: scheduled.userId,
          businessId: scheduled.businessId,
          items: scheduled.items,
          total,
          deliveryAddress: scheduled.deliveryAddress,
          deliveryLatitude: scheduled.deliveryLatitude,
          deliveryLongitude: scheduled.deliveryLongitude,
          paymentMethod: scheduled.paymentMethod,
          notes: scheduled.notes,
          status: 'pending',
          createdAt: now,
        })
        .returning();

      // Marcar como procesado
      await db
        .update(scheduledOrders)
        .set({ 
          status: 'processed',
          orderId: order.id,
        })
        .where(eq(scheduledOrders.id, scheduled.id));

      // Notificar al usuario
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, scheduled.userId))
        .limit(1);

      if (user?.phone) {
        await sendSMS(
          user.phone,
          `¡Tu pedido programado ha sido creado! Pedido #${order.id} de ${business.name}. Síguelo en la app. 🚀`
        );
      }

    } catch (error) {
      console.error(`Error processing scheduled order ${scheduled.id}:`, error);
      await markScheduledOrderFailed(
        scheduled.id,
        'Error al procesar el pedido'
      );
    }
  }
}

async function markScheduledOrderFailed(
  scheduledOrderId: number,
  reason: string
): Promise<void> {
  await db
    .update(scheduledOrders)
    .set({ 
      status: 'failed',
      notes: reason,
    })
    .where(eq(scheduledOrders.id, scheduledOrderId));

  // Notificar al usuario
  const [scheduled] = await db
    .select()
    .from(scheduledOrders)
    .where(eq(scheduledOrders.id, scheduledOrderId))
    .limit(1);

  if (scheduled) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, scheduled.userId))
      .limit(1);

    if (user?.phone) {
      await sendSMS(
        user.phone,
        `Tu pedido programado no pudo ser procesado: ${reason}. Por favor intenta de nuevo. 😔`
      );
    }
  }
}

export async function sendScheduledOrderReminders(): Promise<void> {
  const now = new Date();
  const reminderWindow = new Date(now.getTime() + 60 * 60 * 1000); // 1 hora

  const upcomingOrders = await db
    .select()
    .from(scheduledOrders)
    .where(
      and(
        eq(scheduledOrders.status, 'pending'),
        gte(scheduledOrders.scheduledFor, now),
        lte(scheduledOrders.scheduledFor, reminderWindow)
      )
    );

  for (const scheduled of upcomingOrders) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, scheduled.userId))
      .limit(1);

    const [business] = await db
      .select()
      .from(businesses)
      .where(eq(businesses.id, scheduled.businessId))
      .limit(1);

    if (user?.phone && business) {
      const timeUntil = Math.round(
        (scheduled.scheduledFor.getTime() - now.getTime()) / (1000 * 60)
      );

      await sendSMS(
        user.phone,
        `Recordatorio: Tu pedido de ${business.name} será procesado en ${timeUntil} minutos. 🕐`
      );
    }
  }
}

export async function cancelScheduledOrder(
  scheduledOrderId: number,
  userId: number
): Promise<void> {
  const [scheduled] = await db
    .select()
    .from(scheduledOrders)
    .where(
      and(
        eq(scheduledOrders.id, scheduledOrderId),
        eq(scheduledOrders.userId, userId)
      )
    )
    .limit(1);

  if (!scheduled) {
    throw new Error('Pedido programado no encontrado');
  }

  if (scheduled.status !== 'pending') {
    throw new Error('Solo se pueden cancelar pedidos pendientes');
  }

  await db
    .update(scheduledOrders)
    .set({ status: 'cancelled' })
    .where(eq(scheduledOrders.id, scheduledOrderId));
}

export async function getUserScheduledOrders(userId: number) {
  return db
    .select()
    .from(scheduledOrders)
    .where(
      and(
        eq(scheduledOrders.userId, userId),
        eq(scheduledOrders.status, 'pending')
      )
    );
}

// Ejecutar cada 5 minutos
setInterval(() => {
  processScheduledOrders().catch(console.error);
}, 5 * 60 * 1000);

// Enviar recordatorios cada 15 minutos
setInterval(() => {
  sendScheduledOrderReminders().catch(console.error);
}, 15 * 60 * 1000);
