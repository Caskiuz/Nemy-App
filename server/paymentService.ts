// Real Payment Processing Service
import Stripe from "stripe";
import { db } from "./db";
import {
  orders,
  payments,
  wallets,
  walletTransactions,
  businesses,
  drivers,
} from "@shared/schema-mysql";
import { eq, and } from "drizzle-orm";
import { getCommissionRates } from "./systemSettingsService";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

interface CreatePaymentIntentParams {
  orderId: string;
  amount: number;
  customerId: string;
  businessId: string;
  driverId?: string;
  paymentMethod?: string;
}

interface ProcessPaymentParams {
  paymentIntentId: string;
  orderId: string;
}

export async function createPaymentIntent(params: CreatePaymentIntentParams) {
  try {
    const { orderId, amount, customerId, businessId, driverId, paymentMethod } =
      params;

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "mxn",
      payment_method: paymentMethod,
      confirmation_method: "manual",
      confirm: paymentMethod ? true : false,
      metadata: {
        orderId,
        customerId,
        businessId,
        driverId: driverId || "",
        type: "order_payment",
      },
    });

    // Save payment record
    await db.insert(payments).values({
      id: paymentIntent.id,
      orderId,
      customerId,
      businessId,
      driverId,
      amount,
      currency: "MXN",
      status: paymentIntent.status,
      paymentMethod: paymentMethod || "card",
      stripePaymentIntentId: paymentIntent.id,
      createdAt: new Date(),
    });

    return {
      success: true,
      paymentIntent: {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        status: paymentIntent.status,
      },
    };
  } catch (error: any) {
    console.error("Create PaymentIntent error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function confirmPaymentIntent(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);

    // Update payment status
    await db
      .update(payments)
      .set({
        status: paymentIntent.status,
        updatedAt: new Date(),
      })
      .where(eq(payments.stripePaymentIntentId, paymentIntentId));

    return {
      success: true,
      status: paymentIntent.status,
    };
  } catch (error: any) {
    console.error("Confirm PaymentIntent error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function processSuccessfulPayment(paymentIntentId: string) {
  try {
    // Get payment details
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.stripePaymentIntentId, paymentIntentId))
      .limit(1);

    if (!payment) {
      throw new Error("Payment not found");
    }

    // Get commission rates
    const rates = await getCommissionRates();

    const platformAmount = payment.amount * rates.platform;
    const businessAmount = payment.amount * rates.business;
    const driverAmount = payment.amount * rates.driver;

    // Update business wallet
    await updateWallet(
      payment.businessId,
      businessAmount,
      "commission",
      payment.orderId,
    );

    // Update driver wallet (if assigned)
    if (payment.driverId) {
      await updateWallet(
        payment.driverId,
        driverAmount,
        "delivery_fee",
        payment.orderId,
      );
    }

    // Update order status
    await db
      .update(orders)
      .set({
        status: "paid",
        paidAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(orders.id, payment.orderId));

    // Update payment status
    await db
      .update(payments)
      .set({
        status: "succeeded",
        processedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(payments.id, payment.id));

    return {
      success: true,
      distribution: {
        platform: platformAmount,
        business: businessAmount,
        driver: driverAmount,
      },
    };
  } catch (error: any) {
    console.error("Process successful payment error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

async function updateWallet(
  userId: string,
  amount: number,
  type: string,
  orderId: string,
) {
  // Get or create wallet
  let [wallet] = await db
    .select()
    .from(wallets)
    .where(eq(wallets.userId, userId))
    .limit(1);

  if (!wallet) {
    [wallet] = await db
      .insert(wallets)
      .values({
        userId,
        balance: 0,
        pendingBalance: 0,
        totalEarnings: 0,
        createdAt: new Date(),
      })
      .returning();
  }

  // Update wallet balance
  await db
    .update(wallets)
    .set({
      balance: wallet.balance + amount,
      totalEarnings: wallet.totalEarnings + amount,
      updatedAt: new Date(),
    })
    .where(eq(wallets.userId, userId));

  // Create transaction record
  await db.insert(walletTransactions).values({
    walletId: wallet.id,
    userId,
    amount,
    type,
    status: "completed",
    description: `${type} for order ${orderId}`,
    orderId,
    createdAt: new Date(),
  });
}

export async function createSetupIntent(customerId: string) {
  try {
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ["card"],
      usage: "off_session",
    });

    return {
      success: true,
      setupIntent: {
        id: setupIntent.id,
        clientSecret: setupIntent.client_secret,
      },
    };
  } catch (error: any) {
    console.error("Create SetupIntent error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function processDeliveredOrder(orderId: string) {
  try {
    // Get order details
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order) {
      throw new Error("Order not found");
    }

    // Release held funds immediately (FUND_HOLD_DURATION_HOURS=0)
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.orderId, orderId))
      .limit(1);

    if (payment && payment.status === "succeeded") {
      // Funds already distributed, just update order
      await db
        .update(orders)
        .set({
          status: "delivered",
          deliveredAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(orders.id, orderId));

      return {
        success: true,
        message: "Order marked as delivered, funds already distributed",
      };
    }

    return {
      success: false,
      error: "Payment not found or not succeeded",
    };
  } catch (error: any) {
    console.error("Process delivered order error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}
