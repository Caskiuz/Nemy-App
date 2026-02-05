import express from "express";
import { authenticateToken, requireRole, auditAction } from "../authMiddleware";

const router = express.Router();

// Get wallet balance
router.get("/balance", authenticateToken, async (req, res) => {
  try {
    const { wallets } = await import("@shared/schema-mysql");
    const { db } = await import("../db");
    const { eq } = await import("drizzle-orm");

    const [wallet] = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, req.user!.id))
      .limit(1);

    if (!wallet) {
      const [newWallet] = await db
        .insert(wallets)
        .values({
          userId: req.user!.id,
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

    res.json({
      success: true,
      wallet: {
        id: wallet.id,
        balance: wallet.balance,
        pendingBalance: wallet.pendingBalance,
        availableBalance: wallet.balance - wallet.pendingBalance,
        totalEarned: wallet.totalEarned,
        totalWithdrawn: wallet.totalWithdrawn,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get wallet transactions
router.get("/transactions", authenticateToken, async (req, res) => {
  try {
    const { walletTransactions } = await import("@shared/schema-mysql");
    const { db } = await import("../db");
    const { eq, desc } = await import("drizzle-orm");

    const transactions = await db
      .select()
      .from(walletTransactions)
      .where(eq(walletTransactions.userId, req.user!.id))
      .orderBy(desc(walletTransactions.createdAt))
      .limit(50);

    res.json({ success: true, transactions });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Request withdrawal
router.post(
  "/withdraw",
  authenticateToken,
  requireRole("business_owner", "delivery_driver"),
  auditAction("request_withdrawal", "withdrawal"),
  async (req, res) => {
    try {
      const { requestWithdrawal } = await import("../withdrawalService");
      
      const result = await requestWithdrawal({
        userId: req.user!.id,
        amount: req.body.amount,
        method: req.body.method,
      });

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Get withdrawal history
router.get("/withdrawals", authenticateToken, async (req, res) => {
  try {
    const { getWithdrawalHistory } = await import("../withdrawalService");
    const result = await getWithdrawalHistory(req.user!.id);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel withdrawal
router.post(
  "/withdrawals/:id/cancel",
  authenticateToken,
  auditAction("cancel_withdrawal", "withdrawal"),
  async (req, res) => {
    try {
      const { cancelWithdrawal } = await import("../withdrawalService");
      const result = await cancelWithdrawal(req.params.id, req.user!.id);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
