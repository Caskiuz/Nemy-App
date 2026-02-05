import { db } from "./db";
import { orders } from "@shared/schema-mysql";
import { eq } from "drizzle-orm";
import { logger } from "./logger";
import { AppError } from "./errors";
import { financialService } from "./unifiedFinancialService";

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

  // Use unified financial service for consistent calculations
  const commissions = await financialService.calculateCommissions(order.total);

  await db
    .update(orders)
    .set({
      platformFee: commissions.platform,
      businessEarnings: commissions.business,
      deliveryEarnings: commissions.driver,
    })
    .where(eq(orders.id, orderId));

  await distributeToWallets(order, commissions.business, commissions.driver);

  logger.payment("Commissions calculated and distributed", {
    orderId,
    total: order.total,
    platformFee: commissions.platform,
    businessEarnings: commissions.business,
    deliveryEarnings: commissions.driver,
  });
}

async function distributeToWallets(
  order: typeof orders.$inferSelect,
  businessEarnings: number,
  deliveryEarnings: number,
): Promise<void> {
  try {
    // Update business wallet (pending balance)
    await financialService.updateWalletBalance(
      order.businessId,
      businessEarnings,
      "income",
      order.id,
      `Earnings from order #${order.id.slice(-6)} (pending)`
    );

    // Update driver wallet (immediate balance) if assigned
    if (order.deliveryPersonId) {
      await financialService.updateWalletBalance(
        order.deliveryPersonId,
        deliveryEarnings,
        "income",
        order.id,
        `Delivery fee for order #${order.id.slice(-6)}`
      );
    }
  } catch (error) {
    logger.error("Error distributing to wallets", { orderId: order.id, error });
    throw error;
  }
}

export async function releasePendingFunds(orderId: string): Promise<void> {
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);
  
  if (!order || !order.businessEarnings) return;

  // Funds are already released immediately in the new system
  logger.payment("Funds released immediately", {
    orderId,
    amount: order.businessEarnings,
  });
}
