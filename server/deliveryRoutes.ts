import { Router } from "express";
import { db } from "./db";
import { deliveryDrivers, users, orders, wallets } from "@shared/schema-mysql";
import { eq, and, or, inArray, sql } from "drizzle-orm";
import { authenticateToken } from "./authMiddleware";
import {
  asyncHandler,
  ValidationError,
  NotFoundError,
  AuthorizationError,
} from "./errors";
import { logger } from "./logger";

const router = Router();

router.post(
  "/register",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { userId, vehicleType, vehiclePlate } = req.body;

    if (!vehicleType || !vehiclePlate) {
      throw new ValidationError("Vehicle type and plate are required");
    }

    if (!["bike", "motorcycle", "car"].includes(vehicleType)) {
      throw new ValidationError("Invalid vehicle type");
    }

    const [existing] = await db
      .select()
      .from(deliveryDrivers)
      .where(eq(deliveryDrivers.userId, userId))
      .limit(1);
    if (existing) {
      throw new ValidationError("Driver already registered");
    }

    await db
      .insert(deliveryDrivers)
      .values({
        userId,
        vehicleType,
        vehiclePlate: vehiclePlate.toUpperCase(),
        isAvailable: false,
        totalDeliveries: 0,
        rating: 0,
        totalRatings: 0,
        strikes: 0,
        isBlocked: false,
      });

    const [driver] = await db
      .select()
      .from(deliveryDrivers)
      .where(eq(deliveryDrivers.userId, userId))
      .limit(1);

    await db.insert(wallets).values({
      userId,
      balance: 0,
      pendingBalance: 0,
      totalEarned: 0,
      totalWithdrawn: 0,
    });

    logger.delivery("Driver registered", { userId, driverId: driver.id });

    res.json({ driver, message: "Registration pending admin approval" });
  }),
);

router.post(
  "/location",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { deliveryPersonId, latitude, longitude, isOnline } = req.body;

    if (!latitude || !longitude) {
      throw new ValidationError("Latitude and longitude required");
    }

    await db
      .update(deliveryDrivers)
      .set({
        currentLatitude: latitude.toString(),
        currentLongitude: longitude.toString(),
        lastLocationUpdate: new Date(),
        isAvailable: isOnline,
      })
      .where(eq(deliveryDrivers.userId, deliveryPersonId));

    res.json({ success: true });
  }),
);

router.post(
  "/toggle-online",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { deliveryPersonId, isOnline } = req.body;

    await db
      .update(deliveryDrivers)
      .set({
        isAvailable: isOnline,
        lastLocationUpdate: new Date(),
      })
      .where(eq(deliveryDrivers.userId, deliveryPersonId));

    logger.delivery(`Driver ${isOnline ? "online" : "offline"}`, {
      userId: deliveryPersonId,
    });

    res.json({ success: true, isOnline });
  }),
);

router.get(
  "/orders",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = (req as any).user.id;

    const myOrders = await db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.deliveryPersonId, userId),
          inArray(orders.status, ["ready", "picked_up", "delivered"]),
        ),
      );

    const availableOrders = await db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.status, "ready"),
          eq(orders.deliveryPersonId, null as any),
        ),
      )
      .limit(10);

    res.json({ orders: myOrders, availableOrders });
  }),
);

router.post(
  "/accept/:orderId",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const userId = (req as any).user.id;

    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);
    if (!order) {
      throw new NotFoundError("Order");
    }

    if (order.deliveryPersonId) {
      throw new ValidationError("Order already assigned");
    }

    if (order.status !== "ready") {
      throw new ValidationError("Order not ready for pickup");
    }

    const [driver] = await db
      .select()
      .from(deliveryDrivers)
      .where(eq(deliveryDrivers.userId, userId))
      .limit(1);
    if (!driver || !driver.isAvailable) {
      throw new AuthorizationError("Driver not available");
    }

    await db
      .update(orders)
      .set({
        deliveryPersonId: userId,
        status: "ready",
      })
      .where(eq(orders.id, orderId));

    logger.delivery("Order accepted", { orderId, driverId: userId });

    res.json({ success: true, order });
  }),
);

// Mark order as picked up
router.post(
  "/pickup/:orderId",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const userId = (req as any).user.id;

    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order) {
      throw new NotFoundError("Order");
    }

    if (order.deliveryPersonId !== userId) {
      throw new AuthorizationError("Not your order");
    }

    if (order.status !== "ready" && order.status !== "assigned") {
      throw new ValidationError("Order not ready for pickup");
    }

    await db
      .update(orders)
      .set({ status: "picked_up" })
      .where(eq(orders.id, orderId));

    logger.delivery("Order picked up", { orderId, driverId: userId });

    res.json({ success: true });
  }),
);

// Update order status (for on_the_way, in_transit, etc.)
router.put(
  "/orders/:orderId/status",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;
    const userId = (req as any).user.id;

    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order) {
      throw new NotFoundError("Order");
    }

    if (order.deliveryPersonId !== userId) {
      throw new AuthorizationError("Not your order");
    }

    await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, orderId));

    logger.delivery(`Order status updated to ${status}`, { orderId, driverId: userId });

    res.json({ success: true });
  }),
);

// Mark order as delivered - triggers commission distribution
router.post(
  "/deliver/:orderId",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const userId = (req as any).user.id;
    const { latitude, longitude } = req.body;

    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order) {
      throw new NotFoundError("Order");
    }

    if (order.deliveryPersonId !== userId) {
      throw new AuthorizationError("Not your order");
    }

    if (order.status !== "picked_up" && order.status !== "on_the_way" && order.status !== "in_transit") {
      throw new ValidationError("Order must be picked up or on the way first");
    }

    // Mark as delivered
    await db
      .update(orders)
      .set({
        status: "delivered",
        deliveredAt: new Date(),
        deliveryLatitude: latitude?.toString(),
        deliveryLongitude: longitude?.toString(),
      })
      .where(eq(orders.id, orderId));

    // Calculate and distribute commissions
    const { calculateAndDistributeCommissions } = await import("./commissionService");
    await calculateAndDistributeCommissions(orderId);

    // Increment driver's delivery count
    await db
      .update(deliveryDrivers)
      .set({ 
        totalDeliveries: sql`total_deliveries + 1`,
        isAvailable: true 
      })
      .where(eq(deliveryDrivers.userId, userId));

    // Send notification to customer
    const { notifyOrderStatusChange } = await import("./pushNotificationService");
    await notifyOrderStatusChange(orderId, order.userId, "delivered");

    logger.delivery("Order delivered", { orderId, driverId: userId });

    res.json({ success: true, message: "Pedido entregado exitosamente" });
  }),
);

router.get(
  "/location/:orderId",
  asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);
    if (!order || !order.deliveryPersonId) {
      return res.json({ location: null });
    }

    const [driver] = await db
      .select()
      .from(deliveryDrivers)
      .where(eq(deliveryDrivers.userId, order.deliveryPersonId))
      .limit(1);
    if (!driver || !driver.currentLatitude || !driver.currentLongitude) {
      return res.json({ location: null });
    }

    res.json({
      location: {
        latitude: driver.currentLatitude,
        longitude: driver.currentLongitude,
        lastUpdate: driver.lastLocationUpdate,
      },
    });
  }),
);

// Get delivery person location by deliveryPersonId
router.get(
  "/location/driver/:deliveryPersonId",
  asyncHandler(async (req, res) => {
    const { deliveryPersonId } = req.params;

    const [driver] = await db
      .select()
      .from(deliveryDrivers)
      .where(eq(deliveryDrivers.userId, deliveryPersonId))
      .limit(1);
    
    if (!driver || !driver.currentLatitude || !driver.currentLongitude) {
      return res.json({ location: null });
    }

    res.json({
      location: {
        latitude: parseFloat(driver.currentLatitude),
        longitude: parseFloat(driver.currentLongitude),
        lastUpdate: driver.lastLocationUpdate,
      },
    });
  }),
);

export default router;
