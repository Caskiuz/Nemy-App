// Withdrawals Service - Complete Implementation
import Stripe from "stripe";
import { db } from "./db";
import {
  withdrawals,
  wallets,
  transactions,
  stripeConnectAccounts,
  systemSettings,
} from "@shared/schema-mysql";
import { eq, and } from "drizzle-orm";
import { financialService } from "./unifiedFinancialService";

// Lazy-loaded Stripe instance
let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("Stripe is not configured. Please add STRIPE_SECRET_KEY.");
    }
    stripeInstance = new Stripe(key, {
      apiVersion: "2024-12-18.acacia",
    });
  }
  return stripeInstance;
}

const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return (getStripe() as any)[prop];
  }
});

// Get minimum withdrawal amount from settings
async function getMinWithdrawalAmount(): Promise<number> {
  try {
    const [setting] = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, "min_withdrawal_amount"))
      .limit(1);

    return setting ? parseInt(setting.value) : 10000; // Default: $100 MXN
  } catch (error) {
    return 10000;
  }
}

// Request withdrawal
export async function requestWithdrawal(params: {
  userId: string;
  amount: number;
  method?: string;
}) {
  try {
    // Validate minimum amount
    const minAmount = await getMinWithdrawalAmount();
    if (params.amount < minAmount) {
      return {
        success: false,
        error: `Monto mínimo de retiro: $${minAmount / 100} MXN`,
      };
    }

    // Get wallet
    const [wallet] = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, params.userId))
      .limit(1);

    if (!wallet) {
      return {
        success: false,
        error: "Wallet no encontrada",
      };
    }

    // Check available balance
    if (wallet.balance < params.amount) {
      return {
        success: false,
        error: "Saldo insuficiente",
      };
    }

    // In development, skip Stripe Connect requirement
    const isDevelopment = process.env.NODE_ENV === "development" || !process.env.STRIPE_SECRET_KEY;
    
    if (!isDevelopment) {
      // Get Stripe Connect account (only in production)
      const [connectAccount] = await db
        .select()
        .from(stripeConnectAccounts)
        .where(eq(stripeConnectAccounts.userId, params.userId))
        .limit(1);

      if (!connectAccount) {
        return {
          success: false,
          error: "Cuenta de Stripe no configurada. Completa tu onboarding primero.",
        };
      }

      if (!connectAccount.payoutsEnabled) {
        return {
          success: false,
          error: "Pagos no habilitados. Completa la verificación de tu cuenta.",
        };
      }
    }

    // Create withdrawal record and update wallet atomically
    return await db.transaction(async (tx) => {
      const [withdrawal] = await tx
        .insert(withdrawals)
        .values({
          walletId: wallet.id,
          userId: params.userId,
          amount: params.amount,
          status: isDevelopment ? "completed" : "pending",
          method: params.method || "stripe",
        })
        .$returningId();

      // Update wallet balance
      await tx
        .update(wallets)
        .set({
          balance: wallet.balance - params.amount,
          totalWithdrawn: wallet.totalWithdrawn + params.amount,
          updatedAt: new Date(),
        })
        .where(eq(wallets.userId, params.userId));

      // Record transaction
      await tx.insert(transactions).values({
        walletId: wallet.id,
        userId: params.userId,
        type: "withdrawal",
        amount: -params.amount,
        balanceBefore: wallet.balance,
        balanceAfter: wallet.balance - params.amount,
        description: `Retiro de fondos`,
        status: "completed",
      });

      // Process withdrawal if not in development
      if (!isDevelopment) {
        await processWithdrawal(withdrawal.id);
      }

      return {
        success: true,
        withdrawalId: withdrawal.id,
        amount: params.amount,
        message: isDevelopment ? "Retiro procesado (modo desarrollo)" : "Retiro solicitado",
      };
    });
  } catch (error: any) {
    console.error("Error requesting withdrawal:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Process withdrawal (transfer to Stripe Connect account)
export async function processWithdrawal(withdrawalId: string) {
  try {
    const [withdrawal] = await db
      .select()
      .from(withdrawals)
      .where(eq(withdrawals.id, withdrawalId))
      .limit(1);

    if (!withdrawal) {
      throw new Error("Withdrawal not found");
    }

    if (withdrawal.status !== "pending") {
      return { success: false, error: "Withdrawal already processed" };
    }

    // Get connect account
    const [connectAccount] = await db
      .select()
      .from(stripeConnectAccounts)
      .where(eq(stripeConnectAccounts.userId, withdrawal.userId))
      .limit(1);

    if (!connectAccount) {
      throw new Error("Connect account not found");
    }

    // Update status to processing
    await db
      .update(withdrawals)
      .set({ status: "processing" })
      .where(eq(withdrawals.id, withdrawalId));

    // Create transfer to connected account
    const transfer = await stripe.transfers.create({
      amount: withdrawal.amount,
      currency: "mxn",
      destination: connectAccount.stripeAccountId,
      description: `Retiro de fondos - ${withdrawalId}`,
      metadata: {
        withdrawalId: withdrawalId,
        userId: withdrawal.userId,
      },
    });

    // Update withdrawal with transfer info
    await db
      .update(withdrawals)
      .set({
        status: "completed",
        stripeTransferId: transfer.id,
        processedAt: new Date(),
      })
      .where(eq(withdrawals.id, withdrawalId));

    // Update wallet
    const [wallet] = await db
      .select()
      .from(wallets)
      .where(eq(wallets.id, withdrawal.walletId))
      .limit(1);

    if (wallet) {
      await db
        .update(wallets)
        .set({
          pendingBalance: wallet.pendingBalance - withdrawal.amount,
          totalWithdrawn: wallet.totalWithdrawn + withdrawal.amount,
          updatedAt: new Date(),
        })
        .where(eq(wallets.id, wallet.id));

      // Update transaction status
      await db
        .update(transactions)
        .set({ status: "completed" })
        .where(
          and(
            eq(transactions.walletId, wallet.id),
            eq(transactions.type, "withdrawal"),
          ),
        );
    }

    return {
      success: true,
      transferId: transfer.id,
    };
  } catch (error: any) {
    console.error("Error processing withdrawal:", error);

    // Mark as failed
    await db
      .update(withdrawals)
      .set({
        status: "failed",
        failureReason: error.message,
      })
      .where(eq(withdrawals.id, withdrawalId));

    // Refund to wallet
    const [withdrawal] = await db
      .select()
      .from(withdrawals)
      .where(eq(withdrawals.id, withdrawalId))
      .limit(1);

    if (withdrawal) {
      const [wallet] = await db
        .select()
        .from(wallets)
        .where(eq(wallets.id, withdrawal.walletId))
        .limit(1);

      if (wallet) {
        await db
          .update(wallets)
          .set({
            balance: wallet.balance + withdrawal.amount,
            pendingBalance: wallet.pendingBalance - withdrawal.amount,
            updatedAt: new Date(),
          })
          .where(eq(wallets.id, wallet.id));
      }
    }

    return {
      success: false,
      error: error.message,
    };
  }
}

// Get withdrawal history
export async function getWithdrawalHistory(userId: string) {
  try {
    const history = await db
      .select()
      .from(withdrawals)
      .where(eq(withdrawals.userId, userId))
      .orderBy(withdrawals.createdAt);

    return {
      success: true,
      withdrawals: history,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

// Get wallet balance
export async function getWalletBalance(userId: string) {
  try {
    console.log('💰 getWalletBalance called for userId:', userId);
    
    const [wallet] = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, userId))
      .limit(1);

    console.log('💰 Wallet found:', wallet);

    if (!wallet) {
      console.log('⚠️ No wallet found, creating new one');
      // Create wallet if doesn't exist
      const [newWallet] = await db
        .insert(wallets)
        .values({
          userId,
          balance: 0,
          pendingBalance: 0,
          totalEarned: 0,
          totalWithdrawn: 0,
        })
        .$returningId();

      return {
        success: true,
        wallet: {
          id: newWallet.id,
          balance: 0,
          pendingBalance: 0,
          availableBalance: 0,
          totalEarned: 0,
          totalWithdrawn: 0,
        },
      };
    }

    const result = {
      success: true,
      wallet: {
        ...wallet,
        availableBalance: wallet.balance - wallet.pendingBalance,
      },
    };
    
    console.log('✅ Returning wallet data:', result);
    return result;
  } catch (error: any) {
    console.error('❌ Error in getWalletBalance:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Cancel pending withdrawal
export async function cancelWithdrawal(withdrawalId: string, userId: string) {
  try {
    const [withdrawal] = await db
      .select()
      .from(withdrawals)
      .where(
        and(eq(withdrawals.id, withdrawalId), eq(withdrawals.userId, userId)),
      )
      .limit(1);

    if (!withdrawal) {
      return { success: false, error: "Withdrawal not found" };
    }

    if (withdrawal.status !== "pending") {
      return { success: false, error: "Cannot cancel processed withdrawal" };
    }

    // Update status
    await db
      .update(withdrawals)
      .set({ status: "cancelled" })
      .where(eq(withdrawals.id, withdrawalId));

    // Refund to wallet
    const [wallet] = await db
      .select()
      .from(wallets)
      .where(eq(wallets.id, withdrawal.walletId))
      .limit(1);

    if (wallet) {
      await db
        .update(wallets)
        .set({
          balance: wallet.balance + withdrawal.amount,
          pendingBalance: wallet.pendingBalance - withdrawal.amount,
          updatedAt: new Date(),
        })
        .where(eq(wallets.id, wallet.id));
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
