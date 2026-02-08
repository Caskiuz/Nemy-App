import express from "express";
import { authenticateToken, requireRole, auditAction } from "../authMiddleware";

const router = express.Router();

// Get wallet balance
router.get("/balance", authenticateToken, async (req, res) => {
  try {
    const { wallets } = await import("@shared/schema-mysql");
    const { db } = await import("../db");
    const { eq } = await import("drizzle-orm");
    const { cashSettlementService } = await import("../cashSettlementService");

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
          cashOwed: 0,
          cashPending: 0,
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
          cashOwed: 0,
          cashPending: 0,
          availableBalance: 0,
          totalEarned: 0,
          totalWithdrawn: 0,
          pendingCashOrders: [],
        },
      });
    }

    // Obtener deuda detallada si es repartidor
    let pendingCashOrders = [];
    if (req.user!.role === "delivery_driver" && wallet.cashOwed > 0) {
      const debtInfo = await cashSettlementService.getDriverDebt(req.user!.id);
      pendingCashOrders = debtInfo.pendingOrders;
    }

    res.json({
      success: true,
      wallet: {
        id: wallet.id,
        balance: wallet.balance,
        pendingBalance: wallet.pendingBalance,
        cashOwed: wallet.cashOwed || 0,
        cashPending: wallet.cashPending || 0,
        availableBalance: wallet.balance - (wallet.cashOwed || 0),
        totalEarned: wallet.totalEarned,
        totalWithdrawn: wallet.totalWithdrawn,
        pendingCashOrders,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get wallet transactions
router.get("/transactions", authenticateToken, async (req, res) => {
  try {
    const { transactions } = await import("@shared/schema-mysql");
    const { db } = await import("../db");
    const { eq, desc } = await import("drizzle-orm");

    const walletTransactions = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, req.user!.id))
      .orderBy(desc(transactions.createdAt))
      .limit(50);

    res.json({ success: true, transactions: walletTransactions });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Request withdrawal
router.post(
  "/withdraw",
  authenticateToken,
  auditAction("request_withdrawal", "withdrawal"),
  async (req, res) => {
    try {
      const { financialService } = await import("../unifiedFinancialService");
      
      // Validar permisos usando servicio centralizado
      const canWithdraw = await financialService.canUserWithdraw(req.user!.id, req.user!.role);
      if (!canWithdraw.allowed) {
        return res.status(403).json({ error: canWithdraw.reason });
      }

      const { requestWithdrawal } = await import("../withdrawalService");
      
      const result = await requestWithdrawal({
        userId: req.user!.id,
        amount: req.body.amount,
        method: req.body.method,
        bankAccount: req.body.bankAccount,
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
