import express from "express";
import { authenticateToken, requireRole, auditAction } from "../authMiddleware";
import { 
  validateOrderFinancials, 
  validateOrderCompletion 
} from "../financialMiddleware";
import {
  validateDriverOrderOwnership,
  validateCustomerOrderOwnership,
} from "../validateOwnership";
import { calculateDistance, calculateDeliveryFee, estimateDeliveryTime } from "../utils/distance";
import { getDeliveryConfig } from "../services/deliveryConfigService";

const router = express.Router();

// Calculate delivery fee based on distance
router.post("/calculate-delivery", authenticateToken, async (req, res) => {
  try {
    const { businessLat, businessLng, deliveryLat, deliveryLng } = req.body;
    
    if (!businessLat || !businessLng || !deliveryLat || !deliveryLng) {
      return res.status(400).json({ error: "Missing coordinates" });
    }

    const distance = calculateDistance(businessLat, businessLng, deliveryLat, deliveryLng);
    const deliveryFee = calculateDeliveryFee(distance);
    const estimatedTime = estimateDeliveryTime(distance);

    res.json({
      success: true,
      distance: Math.round(distance * 100) / 100,
      deliveryFee,
      estimatedTime,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create order
router.post("/", authenticateToken, validateOrderFinancials, async (req, res) => {
  try {
    const { orders, businesses, addresses } = await import("@shared/schema-mysql");
    const { db } = await import("../db");
    const { eq, desc } = await import("drizzle-orm");

    // Calculate dynamic delivery fee if coordinates provided
    let deliveryFee = req.body.deliveryFee;
    let estimatedDeliveryTime = req.body.estimatedDeliveryTime;

    if (req.body.deliveryAddressId && req.body.businessId) {
      const [business] = await db.select().from(businesses).where(eq(businesses.id, req.body.businessId)).limit(1);
      const [address] = await db.select().from(addresses).where(eq(addresses.id, req.body.deliveryAddressId)).limit(1);

      if (business && address && business.latitude && business.longitude && address.latitude && address.longitude) {
        const distance = calculateDistance(
          business.latitude,
          business.longitude,
          address.latitude,
          address.longitude
        );
        deliveryFee = calculateDeliveryFee(distance);
        estimatedDeliveryTime = estimateDeliveryTime(distance, business.prepTime || 20);
      }
    }

    const productosBase = req.body.productosBase ?? req.body.subtotal;
    const nemyCommission = req.body.nemyCommission ?? Math.round(productosBase * 0.15);
    const couponDiscount = req.body.couponDiscount || 0;
    const calculatedTotal = productosBase + nemyCommission + deliveryFee - couponDiscount;

    const orderData = {
      userId: req.user!.id,
      businessId: req.body.businessId,
      businessName: req.body.businessName,
      businessImage: req.body.businessImage,
      items: req.body.items,
      status: req.body.status || "pending",
      subtotal: productosBase,
      productosBase,
      nemyCommission,
      deliveryFee,
      total: calculatedTotal,
      paymentMethod: req.body.paymentMethod,
      deliveryAddress: req.body.deliveryAddress,
      notes: req.body.notes,
      substitutionPreference: req.body.substitutionPreference,
      itemSubstitutionPreferences: req.body.itemSubstitutionPreferences,
      cashPaymentAmount: req.body.cashPaymentAmount,
      cashChangeAmount: req.body.cashChangeAmount,
      estimatedDeliveryTime,
    };

    await db.insert(orders).values(orderData);
    
    const createdOrder = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, req.user!.id))
      .orderBy(desc(orders.createdAt))
      .limit(1);
    
    const orderId = createdOrder[0].id;
    res.json({ 
      success: true, 
      id: orderId, 
      orderId, 
      order: { id: orderId },
      deliveryFee,
      estimatedDeliveryTime,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get user orders
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { orders } = await import("@shared/schema-mysql");
    const { db } = await import("../db");
    const { eq } = await import("drizzle-orm");

    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, req.user!.id));
    
    res.json({ success: true, orders: userOrders });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get order by ID
router.get("/:id", authenticateToken, validateCustomerOrderOwnership, async (req, res) => {
  try {
    const { orders } = await import("@shared/schema-mysql");
    const { db } = await import("../db");
    const { eq } = await import("drizzle-orm");

    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, req.params.id))
      .limit(1);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({ success: true, order });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Assign driver automatically
router.post("/:id/assign-driver", authenticateToken, async (req, res) => {
  try {
    const { orders, users } = await import("@shared/schema-mysql");
    const { db } = await import("../db");
    const { eq, and } = await import("drizzle-orm");

    const availableDrivers = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.role, "delivery_driver"),
          eq(users.isActive, 1)
        )
      )
      .limit(10);

    if (availableDrivers.length === 0) {
      return res.json({ success: false, message: "No hay repartidores disponibles" });
    }

    const driver = availableDrivers[0];

    await db
      .update(orders)
      .set({
        deliveryPersonId: driver.id,
        status: "picked_up",
      })
      .where(eq(orders.id, req.params.id));

    res.json({
      success: true,
      driver: {
        id: driver.id,
        name: driver.name,
        phone: driver.phone,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel order during regret period
router.post("/:id/cancel-regret", authenticateToken, validateCustomerOrderOwnership, async (req, res) => {
  try {
    const { orders } = await import("@shared/schema-mysql");
    const { db } = await import("../db");
    const { eq } = await import("drizzle-orm");

    const [order] = await db.select().from(orders).where(eq(orders.id, req.params.id)).limit(1);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.status !== "pending") {
      return res.status(400).json({ error: "Solo se pueden cancelar pedidos pendientes" });
    }

    await db.update(orders).set({ status: "cancelled" }).where(eq(orders.id, req.params.id));

    res.json({ success: true, message: "Pedido cancelado" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Confirm order after regret period
router.post("/:id/confirm", authenticateToken, validateCustomerOrderOwnership, async (req, res) => {
  try {
    const { orders } = await import("@shared/schema-mysql");
    const { db } = await import("../db");
    const { eq } = await import("drizzle-orm");

    const [order] = await db.select().from(orders).where(eq(orders.id, req.params.id)).limit(1);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    await db.update(orders).set({ status: "confirmed" }).where(eq(orders.id, req.params.id));

    res.json({ success: true, message: "Pedido confirmado" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Complete delivery and release funds
router.post(
  "/:id/complete-delivery",
  authenticateToken,
  requireRole("delivery_driver"),
  validateDriverOrderOwnership,
  validateOrderCompletion,
  async (req, res) => {
    try {
      const { orders, wallets, transactions } = await import("@shared/schema-mysql");
      const { db } = await import("../db");
      const { eq } = await import("drizzle-orm");

      const [order] = await db
        .select()
        .from(orders)
        .where(eq(orders.id, req.params.id))
        .limit(1);

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      // Mark as delivered
      await db
        .update(orders)
        .set({ status: "delivered", deliveredAt: new Date() })
        .where(eq(orders.id, req.params.id));

      // Calculate commissions using centralized service
      const { financialService } = await import("../unifiedFinancialService");
      const commissions = await financialService.calculateCommissions(
        order.total,
        order.deliveryFee,
        order.productosBase || order.subtotal,
        order.nemyCommission || undefined
      );

      // Update order with commission breakdown
      await db
        .update(orders)
        .set({
          platformFee: commissions.platform,
          businessEarnings: commissions.business,
          deliveryEarnings: commissions.driver,
        })
        .where(eq(orders.id, req.params.id));

      // Update business wallet
      const [businessWallet] = await db
        .select()
        .from(wallets)
        .where(eq(wallets.userId, order.businessId))
        .limit(1);

      if (businessWallet) {
        await db
          .update(wallets)
          .set({ 
            balance: businessWallet.balance + commissions.business,
            totalEarned: businessWallet.totalEarned + commissions.business,
          })
          .where(eq(wallets.userId, order.businessId));
      } else {
        await db.insert(wallets).values({
          userId: order.businessId,
          balance: commissions.business,
          pendingBalance: 0,
          totalEarned: commissions.business,
          totalWithdrawn: 0,
        });
      }

      // Update driver wallet
      const [driverWallet] = await db
        .select()
        .from(wallets)
        .where(eq(wallets.userId, order.deliveryPersonId))
        .limit(1);

      if (driverWallet) {
        await db
          .update(wallets)
          .set({ 
            balance: driverWallet.balance + commissions.driver,
            totalEarned: driverWallet.totalEarned + commissions.driver,
          })
          .where(eq(wallets.userId, order.deliveryPersonId));
      } else {
        await db.insert(wallets).values({
          userId: order.deliveryPersonId,
          balance: commissions.driver,
          pendingBalance: 0,
          totalEarned: commissions.driver,
          totalWithdrawn: 0,
        });
      }

      // Create transaction records
      await db.insert(transactions).values([
        {
          userId: order.businessId,
          type: "order_payment",
          amount: commissions.business,
          status: "completed",
          description: `Pago por pedido #${order.id.slice(-6)}`,
          orderId: order.id,
        },
        {
          userId: order.deliveryPersonId,
          type: "delivery_payment",
          amount: commissions.driver,
          status: "completed",
          description: `Entrega de pedido #${order.id.slice(-6)}`,
          orderId: order.id,
        },
      ]);

      res.json({
        success: true,
        message: "Pedido completado y fondos liberados",
        distribution: {
          platform: commissions.platform / 100,
          business: commissions.business / 100,
          driver: commissions.driver / 100,
        },
      });
    } catch (error: any) {
      console.error("Complete delivery error:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
