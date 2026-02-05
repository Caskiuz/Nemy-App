// Unified Financial Service - Single Source of Truth for All Financial Operations
import { db } from "./db";
import { systemSettings, wallets, transactions } from "@shared/schema-mysql";
import { eq } from "drizzle-orm";

interface CommissionRates {
  platform: number;
  business: number;
  driver: number;
}

export class UnifiedFinancialService {
  private static instance: UnifiedFinancialService;
  private cachedRates: CommissionRates | null = null;
  private cacheExpiry: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  static getInstance(): UnifiedFinancialService {
    if (!UnifiedFinancialService.instance) {
      UnifiedFinancialService.instance = new UnifiedFinancialService();
    }
    return UnifiedFinancialService.instance;
  }

  // Get commission rates with caching and validation
  async getCommissionRates(): Promise<CommissionRates> {
    const now = Date.now();
    
    if (this.cachedRates && now < this.cacheExpiry) {
      return this.cachedRates;
    }

    try {
      const settings = await db
        .select()
        .from(systemSettings)
        .where(eq(systemSettings.category, "commissions"));

      const platformRate = parseFloat(
        settings.find(s => s.key === "platform_commission_rate")?.value || "0.15"
      );
      const businessRate = parseFloat(
        settings.find(s => s.key === "business_commission_rate")?.value || "0.70"
      );
      const driverRate = parseFloat(
        settings.find(s => s.key === "driver_commission_rate")?.value || "0.15"
      );

      // CRITICAL: Validate rates sum to 1.0 (100%)
      const total = platformRate + businessRate + driverRate;
      if (Math.abs(total - 1.0) > 0.001) {
        throw new Error(`Commission rates must sum to 100%. Current: ${(total * 100).toFixed(2)}%`);
      }

      this.cachedRates = {
        platform: platformRate,
        business: businessRate,
        driver: driverRate,
      };
      this.cacheExpiry = now + this.CACHE_DURATION;

      return this.cachedRates;
    } catch (error) {
      console.error("Error getting commission rates:", error);
      throw error;
    }
  }

  // Calculate commissions with precision handling
  async calculateCommissions(totalAmount: number): Promise<{
    platform: number;
    business: number;
    driver: number;
    total: number;
  }> {
    const rates = await this.getCommissionRates();
    
    // Calculate with precision to avoid rounding errors
    const platformAmount = Math.floor(totalAmount * rates.platform);
    const driverAmount = Math.floor(totalAmount * rates.driver);
    const businessAmount = totalAmount - platformAmount - driverAmount;

    // Validate total matches
    const calculatedTotal = platformAmount + businessAmount + driverAmount;
    if (calculatedTotal !== totalAmount) {
      throw new Error(`Commission calculation error: ${calculatedTotal} !== ${totalAmount}`);
    }

    return {
      platform: platformAmount,
      business: businessAmount,
      driver: driverAmount,
      total: calculatedTotal,
    };
  }

  // Atomic wallet update with validation
  async updateWalletBalance(
    userId: string,
    amount: number,
    type: string,
    orderId?: string,
    description?: string
  ): Promise<void> {
    return await db.transaction(async (tx) => {
      // First, verify user exists
      const { users } = await import("@shared/schema-mysql");
      const [user] = await tx
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      // Get or create wallet
      let [wallet] = await tx
        .select()
        .from(wallets)
        .where(eq(wallets.userId, userId))
        .limit(1);

      if (!wallet) {
        // Create wallet if it doesn't exist
        await tx.insert(wallets).values({
          userId,
          balance: 0,
          pendingBalance: 0,
          totalEarned: 0,
          totalWithdrawn: 0,
        });
        
        [wallet] = await tx
          .select()
          .from(wallets)
          .where(eq(wallets.userId, userId))
          .limit(1);
      }

      if (!wallet) {
        throw new Error(`Failed to create wallet for user ${userId}`);
      }

      const newBalance = wallet.balance + amount;
      
      // Validate balance won't go negative
      if (newBalance < 0) {
        throw new Error(`Insufficient balance. Current: ${wallet.balance}, Requested: ${amount}`);
      }

      // Update wallet
      await tx
        .update(wallets)
        .set({
          balance: newBalance,
          totalEarned: amount > 0 ? wallet.totalEarned + amount : wallet.totalEarned,
          updatedAt: new Date(),
        })
        .where(eq(wallets.userId, userId));

      // Record transaction
      await tx.insert(transactions).values({
        walletId: wallet.id,
        userId,
        orderId,
        type,
        amount,
        balanceBefore: wallet.balance,
        balanceAfter: newBalance,
        description: description || `${type} transaction`,
        status: "completed",
        createdAt: new Date(),
      });
    });
  }

  // Validate order total calculation
  validateOrderTotal(subtotal: number, deliveryFee: number, tax: number, total: number): boolean {
    const calculatedTotal = subtotal + deliveryFee + tax;
    return calculatedTotal === total;
  }

  // Convert between pesos and centavos safely
  pesosTocentavos(pesos: number): number {
    return Math.round(pesos * 100);
  }

  centavosToPesos(centavos: number): number {
    return Math.round(centavos) / 100;
  }

  // Clear cache (for testing or admin updates)
  clearCache(): void {
    this.cachedRates = null;
    this.cacheExpiry = 0;
  }
}

// Export singleton instance
export const financialService = UnifiedFinancialService.getInstance();