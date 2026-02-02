// Cash Payment Service with Change Calculation
import { db } from "./db";
import { orders, payments, cashPayments } from "@shared/schema-mysql";
import { eq } from "drizzle-orm";

interface CashPaymentParams {
  orderId: string;
  customerId: string;
  cashReceived: number;
  orderTotal: number;
}

interface CashPaymentResult {
  success: boolean;
  change?: number;
  error?: string;
}

export async function processCashPayment(
  params: CashPaymentParams,
): Promise<CashPaymentResult> {
  try {
    const { orderId, customerId, cashReceived, orderTotal } = params;

    // Validate cash amount
    if (cashReceived < orderTotal) {
      return {
        success: false,
        error: `Efectivo insuficiente. Se requieren $${orderTotal}, recibido $${cashReceived}`,
      };
    }

    const change = cashReceived - orderTotal;

    // Create payment record
    const [payment] = await db
      .insert(payments)
      .values({
        orderId,
        customerId,
        amount: orderTotal,
        currency: "MXN",
        status: "succeeded",
        paymentMethod: "cash",
        processedAt: new Date(),
        createdAt: new Date(),
      })
      .returning();

    // Create cash payment details
    await db.insert(cashPayments).values({
      paymentId: payment.id,
      orderId,
      cashReceived,
      orderTotal,
      change,
      status: "pending_delivery",
      createdAt: new Date(),
    });

    // Update order status
    await db
      .update(orders)
      .set({
        status: "paid",
        paymentMethod: "cash",
        paidAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));

    return {
      success: true,
      change,
    };
  } catch (error: any) {
    console.error("Process cash payment error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function confirmCashDelivery(orderId: string, driverId: string) {
  try {
    // Update cash payment status
    await db
      .update(cashPayments)
      .set({
        status: "delivered",
        deliveredAt: new Date(),
        deliveredBy: driverId,
        updatedAt: new Date(),
      })
      .where(eq(cashPayments.orderId, orderId));

    // Update order status
    await db
      .update(orders)
      .set({
        status: "delivered",
        deliveredAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));

    // Process commission distribution for cash payments
    await processCashCommissions(orderId);

    return {
      success: true,
      message: "Cash delivery confirmed",
    };
  } catch (error: any) {
    console.error("Confirm cash delivery error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

async function processCashCommissions(orderId: string) {
  try {
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order) return;

    // Get commission rates
    const { getCommissionRates } = await import("./systemSettingsService");
    const rates = await getCommissionRates();

    const platformAmount = order.total * rates.platform;
    const businessAmount = order.total * rates.business;
    const driverAmount = order.total * rates.driver;

    // Update wallets (same as card payments)
    const { updateWallet } = await import("./paymentService");

    // Business gets their commission
    await updateWallet(
      order.businessId,
      businessAmount,
      "cash_commission",
      orderId,
    );

    // Driver gets their commission
    if (order.driverId) {
      await updateWallet(
        order.driverId,
        driverAmount,
        "cash_delivery_fee",
        orderId,
      );
    }

    console.log(`💰 Cash commissions processed for order ${orderId}`);
  } catch (error) {
    console.error("Process cash commissions error:", error);
  }
}

export async function getCashPaymentDetails(orderId: string) {
  try {
    const [cashPayment] = await db
      .select()
      .from(cashPayments)
      .where(eq(cashPayments.orderId, orderId))
      .limit(1);

    if (!cashPayment) {
      return {
        success: false,
        error: "Cash payment not found",
      };
    }

    return {
      success: true,
      payment: cashPayment,
    };
  } catch (error: any) {
    console.error("Get cash payment details error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function calculateChange(
  orderTotal: number,
  cashReceived: number,
) {
  if (cashReceived < orderTotal) {
    return {
      success: false,
      error: "Efectivo insuficiente",
      shortage: orderTotal - cashReceived,
    };
  }

  const change = cashReceived - orderTotal;

  // Calculate optimal change breakdown (Mexican denominations)
  const denominations = [500, 200, 100, 50, 20, 10, 5, 2, 1, 0.5];
  const changeBreakdown: { [key: string]: number } = {};
  let remainingChange = change;

  for (const denom of denominations) {
    if (remainingChange >= denom) {
      const count = Math.floor(remainingChange / denom);
      changeBreakdown[`$${denom}`] = count;
      remainingChange =
        Math.round((remainingChange - count * denom) * 100) / 100;
    }
  }

  return {
    success: true,
    change,
    breakdown: changeBreakdown,
    message: change === 0 ? "Pago exacto" : `Cambio: $${change}`,
  };
}
