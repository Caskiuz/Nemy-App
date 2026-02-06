// API Routes - Modular Structure
import express from "express";
import authRoutes from "./routes/authRoutes";
import adminRoutes from "./routes/adminRoutes";
import walletRoutes from "./routes/walletRoutes";
import orderRoutes from "./routes/orderRoutes";
import businessRoutes from "./routes/businessRoutes";
import {
  authenticateToken,
  requireRole,
  requireMinRole,
  requireOwnership,
  auditAction,
  rateLimitPerUser,
  requirePhoneVerified,
} from "./authMiddleware";

const router = express.Router();

// Health check
router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Auth routes
router.use("/auth", authRoutes);

// Admin routes
router.use("/admin", adminRoutes);

// Wallet routes
router.use("/wallet", walletRoutes);

// Order routes
router.use("/orders", orderRoutes);

// Business routes
router.use("/business", businessRoutes);

// User profile
router.get("/user/profile", authenticateToken, async (req, res) => {
  try {
    const { users } = await import("@shared/schema-mysql");
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");

    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        role: users.role,
        emailVerified: users.emailVerified,
        phoneVerified: users.phoneVerified,
        profileImage: users.profileImage,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, req.user!.id))
      .limit(1);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all businesses (public)
router.get("/businesses", async (req, res) => {
  try {
    const { businesses } = await import("@shared/schema-mysql");
    const { db } = await import("./db");
    
    const allBusinesses = await db.select().from(businesses);
    
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.json({ success: true, businesses: allBusinesses });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Featured businesses
router.get("/businesses/featured", async (req, res) => {
  try {
    const { businesses } = await import("@shared/schema-mysql");
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");
    
    const featuredBusinesses = await db
      .select()
      .from(businesses)
      .where(eq(businesses.isFeatured, 1))
      .limit(10);
    
    res.json({ success: true, businesses: featuredBusinesses });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get business by ID
router.get("/businesses/:id", async (req, res) => {
  try {
    const { businesses, products } = await import("@shared/schema-mysql");
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");
    
    const business = await db
      .select()
      .from(businesses)
      .where(eq(businesses.id, req.params.id))
      .limit(1);
      
    if (!business[0]) {
      return res.status(404).json({ error: "Business not found" });
    }
    
    const businessProducts = await db
      .select()
      .from(products)
      .where(eq(products.businessId, req.params.id));
    
    res.json({ 
      success: true, 
      business: {
        ...business[0],
        products: businessProducts
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});





// Delivery routes
router.get("/delivery/available-orders", authenticateToken, requireRole("delivery_driver"), async (req, res) => {
  try {
    const { orders, businesses } = await import("@shared/schema-mysql");
    const { db } = await import("./db");
    const { eq, or, desc, inArray, isNull } = await import("drizzle-orm");

    const allReadyOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.status, "ready"))
      .orderBy(desc(orders.createdAt));

    const availableOrders = allReadyOrders.filter(
      order => !order.deliveryPersonId || order.deliveryPersonId === null
    );

    const businessIds = [...new Set(availableOrders.map(o => o.businessId).filter(Boolean))];
    let businessMap: Record<string, any> = {};
    
    if (businessIds.length > 0) {
      const businessList = await db
        .select()
        .from(businesses)
        .where(inArray(businesses.id, businessIds as string[]));
      
      businessMap = businessList.reduce((acc, b) => {
        acc[b.id] = b;
        return acc;
      }, {} as Record<string, any>);
    }

    const enrichedOrders = availableOrders.map(order => ({
      ...order,
      businessName: businessMap[order.businessId!]?.name || "Negocio",
      businessAddress: businessMap[order.businessId!]?.address || "",
    }));

    res.json({ success: true, orders: enrichedOrders });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get driver's orders
router.get("/delivery/my-orders", authenticateToken, requireRole("delivery_driver"), async (req, res) => {
  try {
    const { orders } = await import("@shared/schema-mysql");
    const { db } = await import("./db");
    const { eq, inArray } = await import("drizzle-orm");

    const myOrders = await db
      .select()
      .from(orders)
      .where(
        eq(orders.deliveryPersonId, req.user!.id)
      );

    res.json({ success: true, orders: myOrders });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Accept order
router.post("/delivery/accept/:orderId", authenticateToken, requireRole("delivery_driver"), async (req, res) => {
  try {
    const { orders, deliveryDrivers } = await import("@shared/schema-mysql");
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");

    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, req.params.orderId))
      .limit(1);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.deliveryPersonId) {
      return res.status(400).json({ error: "Order already assigned" });
    }

    if (order.status !== "ready") {
      return res.status(400).json({ error: "Order not ready for pickup" });
    }

    await db
      .update(orders)
      .set({
        deliveryPersonId: req.user!.id,
        assignedAt: new Date(),
      })
      .where(eq(orders.id, req.params.orderId));

    res.json({ success: true, message: "Pedido aceptado" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Mark as picked up
router.post("/delivery/pickup/:orderId", authenticateToken, requireRole("delivery_driver"), async (req, res) => {
  try {
    const { orders } = await import("@shared/schema-mysql");
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");

    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, req.params.orderId))
      .limit(1);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.deliveryPersonId !== req.user!.id) {
      return res.status(403).json({ error: "Not your order" });
    }

    await db
      .update(orders)
      .set({ status: "picked_up" })
      .where(eq(orders.id, req.params.orderId));

    res.json({ success: true, message: "Pedido recogido" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update order status
router.put("/delivery/orders/:orderId/status", authenticateToken, requireRole("delivery_driver"), async (req, res) => {
  try {
    const { orders } = await import("@shared/schema-mysql");
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");
    const { status } = req.body;

    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, req.params.orderId))
      .limit(1);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.deliveryPersonId !== req.user!.id) {
      return res.status(403).json({ error: "Not your order" });
    }

    await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, req.params.orderId));

    res.json({ success: true, message: `Estado actualizado a ${status}` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Mark as delivered
router.post("/delivery/deliver/:orderId", authenticateToken, requireRole("delivery_driver"), async (req, res) => {
  try {
    const { orders, deliveryDrivers } = await import("@shared/schema-mysql");
    const { db } = await import("./db");
    const { eq, sql } = await import("drizzle-orm");

    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, req.params.orderId))
      .limit(1);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.deliveryPersonId !== req.user!.id) {
      return res.status(403).json({ error: "Not your order" });
    }

    if (order.status !== "on_the_way" && order.status !== "in_transit" && order.status !== "picked_up") {
      return res.status(400).json({ error: "Order must be picked up or on the way first" });
    }

    // Get current location for delivery confirmation
    let currentLocation = null;
    try {
      if (req.body.latitude && req.body.longitude) {
        currentLocation = {
          latitude: req.body.latitude,
          longitude: req.body.longitude
        };
      }
    } catch (locationError) {
      console.log('No location provided for delivery');
    }

    // Mark as delivered
    await db
      .update(orders)
      .set({
        status: "delivered",
        deliveredAt: new Date(),
        deliveryLatitude: currentLocation?.latitude?.toString() || null,
        deliveryLongitude: currentLocation?.longitude?.toString() || null,
      })
      .where(eq(orders.id, req.params.orderId));

    // Calculate and distribute commissions
    console.log('Starting commission distribution for order:', order.id, 'total:', order.total);
    
    try {
      const { financialService } = await import("./unifiedFinancialService");
      const commissions = await financialService.calculateCommissions(order.total);
      
      console.log('Commission breakdown:', commissions);

      // Update business wallet
      await financialService.updateWalletBalance(
        order.businessId,
        commissions.business,
        "order_payment",
        order.id,
        `Pago por pedido #${order.id.slice(-6)}`
      );
      console.log('Business wallet updated:', order.businessId, '+', commissions.business);

      // Update driver wallet
      await financialService.updateWalletBalance(
        req.user!.id,
        commissions.driver,
        "delivery_payment",
        order.id,
        `Pago por entrega #${order.id.slice(-6)}`
      );
      console.log('Driver wallet updated:', req.user!.id, '+', commissions.driver);
      
      console.log('✅ Commission distribution completed successfully');
      
    } catch (commissionError) {
      console.error('❌ Commission distribution failed:', commissionError);
      // Continue - delivery is still marked as completed
    }

    // Increment driver's delivery count
    await db
      .update(deliveryDrivers)
      .set({ 
        totalDeliveries: sql`total_deliveries + 1`,
        isAvailable: true 
      })
      .where(eq(deliveryDrivers.userId, req.user!.id));

    res.json({ success: true, message: "Pedido entregado exitosamente" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update driver location (unified endpoint)
router.post("/delivery/location", authenticateToken, requireRole("delivery_driver"), async (req, res) => {
  try {
    const { deliveryDrivers } = await import("@shared/schema-mysql");
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");

    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: "Latitude and longitude required" });
    }

    await db
      .update(deliveryDrivers)
      .set({
        currentLatitude: latitude.toString(),
        currentLongitude: longitude.toString(),
        lastLocationUpdate: new Date(),
      })
      .where(eq(deliveryDrivers.userId, req.user!.id));

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get current location (for web geolocation)
router.get("/delivery/location", authenticateToken, requireRole("delivery_driver"), async (req, res) => {
  try {
    const { deliveryDrivers } = await import("@shared/schema-mysql");
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");

    const [driver] = await db
      .select()
      .from(deliveryDrivers)
      .where(eq(deliveryDrivers.userId, req.user!.id))
      .limit(1);

    res.json({
      success: true,
      location: {
        latitude: driver?.currentLatitude || null,
        longitude: driver?.currentLongitude || null,
        lastUpdate: driver?.lastLocationUpdate || null
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle online status
router.post("/delivery/toggle-online", authenticateToken, requireRole("delivery_driver"), async (req, res) => {
  try {
    const { deliveryDrivers } = await import("@shared/schema-mysql");
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");

    const { isOnline } = req.body;

    await db
      .update(deliveryDrivers)
      .set({
        isAvailable: isOnline,
        lastLocationUpdate: new Date(),
      })
      .where(eq(deliveryDrivers.userId, req.user!.id));

    res.json({ success: true, isOnline });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get driver stats
router.get("/delivery/stats", authenticateToken, requireRole("delivery_driver"), async (req, res) => {
  try {
    const { orders, deliveryDrivers, wallets, reviews } = await import("@shared/schema-mysql");
    const { db } = await import("./db");
    const { eq, avg, count } = await import("drizzle-orm");

    const [driver] = await db
      .select()
      .from(deliveryDrivers)
      .where(eq(deliveryDrivers.userId, req.user!.id))
      .limit(1);

    const [wallet] = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, req.user!.id))
      .limit(1);

    const myOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.deliveryPersonId, req.user!.id));

    const deliveredOrders = myOrders.filter(o => o.status === "delivered");
    
    // Calculate earnings (15% of order total)
    const totalEarnings = deliveredOrders.reduce((sum, o) => sum + (o.total * 0.15), 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = deliveredOrders.filter(o => {
      const orderDate = new Date(o.createdAt);
      return orderDate >= today;
    });
    
    const todayEarnings = todayOrders.reduce((sum, o) => sum + (o.total * 0.15), 0);
    
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);
    const weekOrders = deliveredOrders.filter(o => {
      const orderDate = new Date(o.createdAt);
      return orderDate >= thisWeek;
    });
    
    const weekEarnings = weekOrders.reduce((sum, o) => sum + (o.total * 0.15), 0);

    // Calculate average delivery time
    const ordersWithTimes = deliveredOrders.filter(o => o.assignedAt && o.deliveredAt);
    const avgDeliveryTime = ordersWithTimes.length > 0 
      ? ordersWithTimes.reduce((sum, o) => {
          const assigned = new Date(o.assignedAt!).getTime();
          const delivered = new Date(o.deliveredAt!).getTime();
          return sum + (delivered - assigned);
        }, 0) / ordersWithTimes.length / (1000 * 60) // Convert to minutes
      : 0;

    // Get driver rating from reviews
    const driverReviews = await db
      .select({ rating: reviews.rating })
      .from(reviews)
      .innerJoin(orders, eq(reviews.orderId, orders.id))
      .where(eq(orders.deliveryPersonId, req.user!.id));
    
    const avgRating = driverReviews.length > 0
      ? driverReviews.reduce((sum, r) => sum + r.rating, 0) / driverReviews.length
      : 0;

    res.json({
      success: true,
      stats: {
        totalDeliveries: deliveredOrders.length,
        todayDeliveries: todayOrders.length,
        weekDeliveries: weekOrders.length,
        balance: wallet?.balance || 0,
        todayEarnings: Math.round(todayEarnings * 100) / 100,
        weekEarnings: Math.round(weekEarnings * 100) / 100,
        totalEarnings: Math.round(totalEarnings * 100) / 100,
        rating: Math.round(avgRating * 10) / 10,
        avgDeliveryTime: Math.round(avgDeliveryTime),
        isAvailable: driver?.isAvailable || false,
        completionRate: deliveredOrders.length > 0 ? 100 : 0
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get driver status
router.get("/delivery/status", authenticateToken, requireRole("delivery_driver"), async (req, res) => {
  try {
    const { deliveryDrivers } = await import("@shared/schema-mysql");
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");

    const [driver] = await db
      .select()
      .from(deliveryDrivers)
      .where(eq(deliveryDrivers.userId, req.user!.id))
      .limit(1);

    res.json({
      success: true,
      isOnline: driver?.isAvailable || false,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle driver status (different route name)
router.post("/delivery/toggle-status", authenticateToken, requireRole("delivery_driver"), async (req, res) => {
  try {
    const { deliveryDrivers } = await import("@shared/schema-mysql");
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");

    const { isOnline } = req.body;

    await db
      .update(deliveryDrivers)
      .set({
        isAvailable: isOnline,
        lastLocationUpdate: new Date(),
      })
      .where(eq(deliveryDrivers.userId, req.user!.id));

    res.json({ success: true, isOnline });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get driver location for order tracking (for customers)
router.get("/orders/:orderId/driver-location", authenticateToken, async (req, res) => {
  try {
    const { orders, deliveryDrivers } = await import("@shared/schema-mysql");
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");

    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, req.params.orderId))
      .limit(1);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Only order owner can see driver location
    if (order.userId !== req.user!.id) {
      return res.status(403).json({ error: "Not your order" });
    }

    if (!order.deliveryPersonId) {
      return res.json({ success: true, location: null, message: "No driver assigned" });
    }

    const [driver] = await db
      .select()
      .from(deliveryDrivers)
      .where(eq(deliveryDrivers.userId, order.deliveryPersonId))
      .limit(1);

    if (!driver || !driver.currentLatitude || !driver.currentLongitude) {
      return res.json({ success: true, location: null, message: "Driver location not available" });
    }

    res.json({
      success: true,
      location: {
        latitude: parseFloat(driver.currentLatitude),
        longitude: parseFloat(driver.currentLongitude),
        lastUpdate: driver.lastLocationUpdate
      },
      orderStatus: order.status
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get delivery person location by ID (for order tracking)
router.get("/delivery/location/:deliveryPersonId", async (req, res) => {
  try {
    const { deliveryDrivers } = await import("@shared/schema-mysql");
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");

    const [driver] = await db
      .select()
      .from(deliveryDrivers)
      .where(eq(deliveryDrivers.userId, req.params.deliveryPersonId))
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// FAVORITES ROUTES MOVED TO favoritesRoutes.ts
// Get user favorites
// router.get("/favorites/:userId", authenticateToken, async (req, res) => {
//   try {
//     const { favorites } = await import("@shared/schema-mysql");
//     const { db } = await import("./db");
//     const { eq } = await import("drizzle-orm");

//     const userFavorites = await db
//       .select()
//       .from(favorites)
//       .where(eq(favorites.userId, req.params.userId));

//     res.json({ success: true, favorites: userFavorites });
//   } catch (error: any) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Add to favorites
// router.post("/favorites", authenticateToken, async (req, res) => {
//   try {
//     const { favorites } = await import("@shared/schema-mysql");
//     const { db } = await import("./db");
//     const { businessId } = req.body;

//     await db.insert(favorites).values({
//       userId: req.user!.id,
//       businessId,
//     });

//     res.json({ success: true, message: "Agregado a favoritos" });
//   } catch (error: any) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Remove from favorites
// router.delete("/favorites/:businessId", authenticateToken, async (req, res) => {
//   try {
//     const { favorites } = await import("@shared/schema-mysql");
//     const { db } = await import("./db");
//     const { eq, and } = await import("drizzle-orm");

//     await db
//       .delete(favorites)
//       .where(
//         and(
//           eq(favorites.userId, req.user!.id),
//           eq(favorites.businessId, req.params.businessId)
//         )
//       );

//     res.json({ success: true, message: "Eliminado de favoritos" });
//   } catch (error: any) {
//     res.status(500).json({ error: error.message });
//   }
// });

// Reviews endpoint
router.post("/reviews", authenticateToken, async (req, res) => {
  try {
    const { createReview } = await import("./reviewService");
    const { orderId, businessId, deliveryPersonId, businessRating, deliveryRating, comment } = req.body;
    
    const results = [];
    
    // Create business review if provided
    if (businessRating && businessRating > 0) {
      const businessReview = await createReview({
        orderId,
        userId: req.user!.id,
        businessId,
        rating: businessRating,
        comment,
        type: "business"
      });
      results.push(businessReview);
    }
    
    // Create delivery review if provided
    if (deliveryRating && deliveryRating > 0 && deliveryPersonId) {
      const deliveryReview = await createReview({
        orderId,
        userId: req.user!.id,
        driverId: deliveryPersonId,
        rating: deliveryRating,
        comment,
        type: "driver"
      });
      results.push(deliveryReview);
    }
    
    const hasError = results.some(r => !r.success);
    if (hasError) {
      const error = results.find(r => !r.success)?.error;
      return res.status(400).json({ success: false, error });
    }
    
    res.json({ success: true, message: "Reseñas enviadas correctamente" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
export default router;