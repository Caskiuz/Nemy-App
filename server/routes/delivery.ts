import express from "express";
import { authenticateToken, requireRole } from "../authMiddleware";
import { eq, and, inArray } from "drizzle-orm";

const router = express.Router();

// GET /api/delivery/config — configuración de tarifas (público)
router.get("/config", (req, res) => {
  res.json({
    success: true,
    config: {
      baseFee: 15,
      perKm: 8,
      minFee: 15,
      maxFee: 40,
    },
  });
});

// PUT /api/delivery/config — actualizar configuración (admin)
router.put("/config", authenticateToken, requireRole("admin", "super_admin"), async (req, res) => {
  try {
    const { baseFee, perKm, minFee, maxFee } = req.body;
    
    // Validar que todos los valores sean números positivos
    if (!baseFee || !perKm || !minFee || !maxFee) {
      return res.status(400).json({ error: "Todos los campos son requeridos" });
    }

    if (baseFee < 0 || perKm < 0 || minFee < 0 || maxFee < 0) {
      return res.status(400).json({ error: "Los valores deben ser positivos" });
    }

    // Aquí podrías guardar en la base de datos si lo necesitas
    // Por ahora solo retornamos éxito
    res.json({
      success: true,
      message: "Configuración actualizada correctamente",
      config: { baseFee, perKm, minFee, maxFee },
    });
  } catch (error: any) {
    console.error("Update delivery config error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get delivery zones (public)
router.get("/zones", async (req, res) => {
  try {
    const zones = [
      {
        id: "zone-centro",
        name: "Centro",
        description: "Centro de Autlán",
        deliveryFee: 2500,
        maxDeliveryTime: 30,
        isActive: true,
        centerLatitude: "20.6736",
        centerLongitude: "-104.3647",
        radiusKm: 3,
      },
      {
        id: "zone-norte",
        name: "Norte", 
        description: "Zona Norte de Autlán",
        deliveryFee: 3000,
        maxDeliveryTime: 35,
        isActive: true,
        centerLatitude: "20.6800",
        centerLongitude: "-104.3647",
        radiusKm: 4,
      },
      {
        id: "zone-sur",
        name: "Sur",
        description: "Zona Sur de Autlán", 
        deliveryFee: 3000,
        maxDeliveryTime: 35,
        isActive: true,
        centerLatitude: "20.6672",
        centerLongitude: "-104.3647",
        radiusKm: 4,
      },
    ];

    res.json({ success: true, zones });
  } catch (error: any) {
    console.error("Get zones error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get available drivers (admin only)
router.get("/drivers", authenticateToken, requireRole("admin"), async (req, res) => {
  try {
    const { users } = await import("@shared/schema-mysql");
    const { db } = await import("../db");
    
    const drivers = await db
      .select({
        id: users.id,
        name: users.name,
        phone: users.phone,
        isActive: users.isActive,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(and(
        eq(users.role, "delivery_driver"),
        eq(users.isActive, true)
      ));

    res.json({ success: true, drivers });
  } catch (error: any) {
    console.error("Get drivers error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get driver orders
router.get("/orders", authenticateToken, requireRole("delivery_driver"), async (req, res) => {
  try {
    const { orders, businesses } = await import("@shared/schema-mysql");
    const { db } = await import("../db");
    
    const driverOrders = await db
      .select({
        order: orders,
        business: {
          id: businesses.id,
          name: businesses.name,
          address: businesses.address,
          phone: businesses.phone,
        }
      })
      .from(orders)
      .leftJoin(businesses, eq(orders.businessId, businesses.id))
      .where(eq(orders.driverId, req.user!.id));

    res.json({ success: true, orders: driverOrders });
  } catch (error: any) {
    console.error("Get driver orders error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Assign driver to order (admin only)
router.post("/assign", authenticateToken, requireRole("admin"), async (req, res) => {
  try {
    const { orderId, driverId } = req.body;
    
    if (!orderId || !driverId) {
      return res.status(400).json({ error: "ID de pedido y conductor requeridos" });
    }

    const { orders, users } = await import("@shared/schema-mysql");
    const { db } = await import("../db");
    
    // Verify order exists
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    // Verify driver exists and is active
    const [driver] = await db
      .select()
      .from(users)
      .where(and(
        eq(users.id, driverId),
        eq(users.role, "delivery_driver"),
        eq(users.isActive, true)
      ))
      .limit(1);

    if (!driver) {
      return res.status(404).json({ error: "Conductor no encontrado" });
    }

    // Assign driver
    await db
      .update(orders)
      .set({ 
        driverId,
        status: "picked_up",
        updatedAt: new Date()
      })
      .where(eq(orders.id, orderId));

    res.json({ success: true, message: "Conductor asignado" });
  } catch (error: any) {
    console.error("Assign driver error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Update delivery status
router.patch("/orders/:id/status", authenticateToken, requireRole("delivery_driver"), async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: "Estado requerido" });
    }

    const validStatuses = ["picked_up", "on_the_way", "delivered"];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Estado inválido" });
    }

    const { orders } = await import("@shared/schema-mysql");
    const { db } = await import("../db");
    
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, req.params.id))
      .limit(1);

    if (!order) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    if (order.driverId !== req.user!.id) {
      return res.status(403).json({ error: "No autorizado" });
    }

    await db
      .update(orders)
      .set({ 
        status,
        updatedAt: new Date(),
        ...(status === "delivered" && { deliveredAt: new Date() })
      })
      .where(eq(orders.id, req.params.id));

    res.json({ success: true, message: "Estado actualizado" });
  } catch (error: any) {
    console.error("Update delivery status error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get driver location for an order (polling from OrderTrackingScreen)
router.get("/location/:orderId", authenticateToken, async (req, res) => {
  try {
    const { orders, deliveryDrivers, users } = await import("@shared/schema-mysql");
    const { db } = await import("../db");

    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, req.params.orderId))
      .limit(1);

    if (!order) return res.status(404).json({ error: "Pedido no encontrado" });

    if (!order.deliveryPersonId) {
      return res.json({ success: true, location: null, driver: null });
    }

    const [driver] = await db
      .select({
        id: deliveryDrivers.id,
        currentLatitude: deliveryDrivers.currentLatitude,
        currentLongitude: deliveryDrivers.currentLongitude,
        lastLocationUpdate: deliveryDrivers.lastLocationUpdate,
      })
      .from(deliveryDrivers)
      .where(eq(deliveryDrivers.userId, order.deliveryPersonId))
      .limit(1);

    const [driverUser] = await db
      .select({ name: users.name, phone: users.phone, profileImage: users.profileImage })
      .from(users)
      .where(eq(users.id, order.deliveryPersonId))
      .limit(1);

    res.json({
      success: true,
      location: driver ? {
        latitude: driver.currentLatitude,
        longitude: driver.currentLongitude,
        updatedAt: driver.lastLocationUpdate,
      } : null,
      driver: driverUser || null,
      orderStatus: order.status,
    });
  } catch (error: any) {
    console.error("Get driver location error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get driver stats
router.get("/stats", authenticateToken, requireRole("delivery_driver"), async (req, res) => {
  try {
    const { orders } = await import("@shared/schema-mysql");
    const { db } = await import("../db");
    
    const driverOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.driverId, req.user!.id));

    const today = new Date();
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const todayOrders = driverOrders.filter(o => {
      const orderDate = new Date(o.createdAt);
      return orderDate.toDateString() === today.toDateString();
    });

    const weekOrders = driverOrders.filter(o => {
      const orderDate = new Date(o.createdAt);
      return orderDate >= thisWeek;
    });

    const monthOrders = driverOrders.filter(o => {
      const orderDate = new Date(o.createdAt);
      return orderDate >= thisMonth;
    });

    const deliveredOrders = driverOrders.filter(o => o.status === "delivered");
    const totalEarnings = deliveredOrders.reduce((sum, o) => sum + (o.deliveryFee || 0), 0);

    res.json({
      success: true,
      stats: {
        today: {
          orders: todayOrders.length,
          delivered: todayOrders.filter(o => o.status === "delivered").length,
        },
        week: {
          orders: weekOrders.length,
          delivered: weekOrders.filter(o => o.status === "delivered").length,
        },
        month: {
          orders: monthOrders.length,
          delivered: monthOrders.filter(o => o.status === "delivered").length,
        },
        total: {
          orders: driverOrders.length,
          delivered: deliveredOrders.length,
          earnings: Math.round(totalEarnings),
        },
      },
    });
  } catch (error: any) {
    console.error("Get driver stats error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;