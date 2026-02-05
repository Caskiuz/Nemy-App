import { Router } from "express";
import { db } from "./db";
import { wallets, transactions } from "@shared/schema-mysql";
import { eq, desc } from "drizzle-orm";
import { authenticateToken } from "./authMiddleware";

const router = Router();

// Get wallet balance
router.get("/balance", authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    console.log('💰 GET /wallet/balance - userId:', userId);

    const [wallet] = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, userId))
      .limit(1);

    console.log('💰 Wallet found:', wallet);

    if (!wallet) {
      console.log('⚠️ No wallet found, creating new one');
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

      return res.json({
        success: true,
        wallet: {
          id: newWallet.id,
          balance: 0,
          pendingBalance: 0,
          availableBalance: 0,
          totalEarned: 0,
          totalWithdrawn: 0,
        },
      });
    }

    const result = {
      success: true,
      wallet: {
        id: wallet.id,
        balance: wallet.balance,
        pendingBalance: wallet.pendingBalance,
        availableBalance: wallet.balance - wallet.pendingBalance,
        totalEarned: wallet.totalEarned,
        totalWithdrawn: wallet.totalWithdrawn,
      },
    };

    console.log('✅ Returning wallet:', result);
    res.json(result);
  } catch (error: any) {
    console.error('❌ Error in GET /wallet/balance:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get wallet transactions
router.get("/transactions", authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    console.log('💳 GET /wallet/transactions - userId:', userId);

    const userTransactions = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt))
      .limit(50);

    console.log('✅ Found transactions:', userTransactions.length);

    res.json({
      success: true,
      transactions: userTransactions,
    });
  } catch (error: any) {
    console.error('❌ Error in GET /wallet/transactions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
