import { db } from "./db";
import { orders, wallets, transactions, users } from "@shared/schema-mysql";
import { eq } from "drizzle-orm";
import { logger } from "./logger";
import { AppError } from "./errors";

interface CommissionRates {
  platform: number;
  business: number;
  delivery: number;
}

const DEFAULT_RATES: CommissionRates = {
  platform: 0.15, // 15%
  business: 0.7, // 70%
  delivery: 0.15, // 15%
};

export async function calculateAndDistributeCommissions(
  orderId: string,
): Promise<void> {
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!order) {
    throw new AppError(404, `Order ${orderId} not found`);
  }

  if (order.status !== "delivered") {
    throw new AppError(400, `Order ${orderId} is not delivered yet`);
  }

  if (order.platformFee && order.businessEarnings && order.deliveryEarnings) {
    logger.warn("Commissions already calculated", { orderId });
    return;
  }

  const { systemSettings } = await import("@shared/schema-mysql");
  const settings = await db
    .select()
    .from(systemSettings)
    .where(eq(systemSettings.category, "commissions"));

  const rates: CommissionRates = {
    platform: parseFloat(
      settings.find((s) => s.key === "platform_commission")?.value ||
        String(DEFAULT_RATES.platform),
    ),
    business: parseFloat(
      settings.find((s) => s.key === "business_commission")?.value ||
        String(DEFAULT_RATES.business),
    ),
    delivery: parseFloat(
      settings.find((s) => s.key === "delivery_commission")?.value ||
        String(DEFAULT_RATES.delivery),
    ),
  };

  const totalAmount = order.total;
  const platformFee = Math.round(totalAmount * rates.platform);
  const businessEarnings = Math.round(totalAmount * rates.business);
  const deliveryEarnings = Math.round(totalAmount * rates.delivery);

  await db
    .update(orders)
    .set({
      platformFee,
      businessEarnings,
      deliveryEarnings,
    })
    .where(eq(orders.id, orderId));

  await distributeToWallets(order, businessEarnings, deliveryEarnings);

  logger.payment("Commissions calculated and distributed", {
    orderId,
    total: totalAmount,
    platformFee,
    businessEarnings,
    deliveryEarnings,
  });
}

async function distributeToWallets(
  order: typeof orders.$inferSelect,
  businessEarnings: number,
  deliveryEarnings: number,
): Promise<void> {
  const [businessUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, order.businessId))
    .limit(1);
  if (!businessUser) {
    logger.error("Business user not found", { businessId: order.businessId });
    return;
  }

  let [businessWallet] = await db
    .select()
    .from(wallets)
    .where(eq(wallets.userId, businessUser.id))
    .limit(1);
  if (!businessWallet) {
    await db.insert(wallets).values({
      userId: businessUser.id,
      balance: 0,
      pendingBalance: 0,
      totalEarned: 0,
      totalWithdrawn: 0,
    });
    [businessWallet] = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, businessUser.id))
      .limit(1);
  }
  if (!businessWallet) return;

  await db
    .update(wallets)
    .set({
      pendingBalance: businessWallet.pendingBalance + businessEarnings,
      totalEarned: businessWallet.totalEarned + businessEarnings,
    })
    .where(eq(wallets.id, businessWallet.id));

  await db.insert(transactions).values({
    walletId: businessWallet.id,
    orderId: order.id,
    type: "income",
    amount: businessEarnings,
    balanceBefore: businessWallet.balance,
    balanceAfter: businessWallet.balance,
    description: `Earnings from order #${order.id.slice(-6)}`,
    status: "pending",
  });

  if (order.deliveryPersonId) {
    let [driverWallet] = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, order.deliveryPersonId))
      .limit(1);
    if (!driverWallet) {
      await db.insert(wallets).values({
        userId: order.deliveryPersonId,
        balance: 0,
        pendingBalance: 0,
        totalEarned: 0,
        totalWithdrawn: 0,
      });
      [driverWallet] = await db
        .select()
        .from(wallets)
        .where(eq(wallets.userId, order.deliveryPersonId))
        .limit(1);
    }
    if (!driverWallet) return;

    await db
      .update(wallets)
      .set({
        balance: driverWallet.balance + deliveryEarnings,
        totalEarned: driverWallet.totalEarned + deliveryEarnings,
      })
      .where(eq(wallets.id, driverWallet.id));

    await db.insert(transactions).values({
      walletId: driverWallet.id,
      orderId: order.id,
      type: "income",
      amount: deliveryEarnings,
      balanceBefore: driverWallet.balance,
      balanceAfter: driverWallet.balance + deliveryEarnings,
      description: `Delivery fee for order #${order.id.slice(-6)}`,
      status: "completed",
    });
  }
}

export async function releasePendingFunds(orderId: string): Promise<void> {
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);
  if (!order || !order.businessEarnings) return;

  const [businessUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, order.businessId))
    .limit(1);
  if (!businessUser) return;

  const [wallet] = await db
    .select()
    .from(wallets)
    .where(eq(wallets.userId, businessUser.id))
    .limit(1);
  if (!wallet) return;

  const amountToRelease = order.businessEarnings;

  await db
    .update(wallets)
    .set({
      balance: wallet.balance + amountToRelease,
      pendingBalance: wallet.pendingBalance - amountToRelease,
    })
    .where(eq(wallets.id, wallet.id));

  await db
    .update(transactions)
    .set({
      status: "completed",
      balanceAfter: wallet.balance + amountToRelease,
    })
    .where(eq(transactions.orderId, orderId));

  logger.payment("Funds released", {
    orderId,
    amount: amountToRelease,
    walletId: wallet.id,
  });
}
