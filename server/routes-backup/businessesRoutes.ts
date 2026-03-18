import express from "express";
import { authenticateToken, requireRole } from "../authMiddleware";
import { eq, inArray, desc, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

// Get all businesses (public)
router.get("/", async (req, res) => {
  try {
    const { businesses } = await import("@shared/schema-mysql");
    const { db } = await import("../db");
    
    console.log('📍 GET /api/businesses called');
    
    const rows = await db
      .select()
      .from(businesses)
      .where(eq(businesses.isActive, 1));

    const uniqueBusinesses = Array.from(new Map(rows.map(b => [b.id, b])).values());
    console.log('✅ Found active businesses (unique):', uniqueBusinesses.length);
    
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.json({ success: true, businesses: uniqueBusinesses });
  } catch (error: any) {
    console.error('❌ Error in /api/businesses:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get business by ID
router.get("/:id", async (req, res) => {
  try {
    const { businesses, products } = await import("@shared/schema-mysql");
    const { db } = await import("../db");
    
    const business = await db
      .select()
      .from(businesses)
      .where(eq(businesses.id, req.params.id))
      .limit(1);
    
    if (!business[0]) {
      return res.status(404).json({ error: "Business not found" });
    }
    
    if (!business[0].isActive) {
      return res.status(404).json({ error: "Business not found" });
    }
    
    const businessProducts = await db
      .select()
      .from(products)
      .where(eq(products.businessId, req.params.id));

    const availableProducts = businessProducts.filter((p: any) => {
      if (p.isAvailable === 0 || p.isAvailable === false) {
        return false;
      }
      return true;
    });
    
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.json({ 
      success: true, 
      business: {
        ...business[0],
        products: availableProducts
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get my businesses (owner)
router.get("/owner/my-businesses", authenticateToken, requireRole("business_owner"), async (req, res) => {
  try {
    const { businesses, orders } = await import("@shared/schema-mysql");
    const { db } = await import("../db");

    const ownerBusinesses = await db
      .select()
      .from(businesses)
      .where(eq(businesses.ownerId, req.user!.id));

    const businessIds = ownerBusinesses.map(b => b.id);
    
    let allOrders: any[] = [];
    if (businessIds.length > 0) {
      allOrders = await db
        .select()
        .from(orders)
        .where(inArray(orders.businessId, businessIds));
    }

    const businessesWithStats = ownerBusinesses.map(business => {
      const businessOrders = allOrders.filter(o => o.businessId === business.id);
      const today = new Date();
      const todayOrders = businessOrders.filter(o => {
        const orderDate = new Date(o.createdAt);
        return orderDate.toDateString() === today.toDateString();
      });
      const todayRevenue = todayOrders
        .filter(o => o.status === "delivered")
        .reduce((sum, o) => sum + (o.subtotal || 0), 0);
      const pendingOrders = businessOrders.filter(o => 
        ["pending", "confirmed", "preparing"].includes(o.status)
      );

      return {
        ...business,
        stats: {
          pendingOrders: pendingOrders.length,
          todayOrders: todayOrders.length,
          todayRevenue: todayRevenue,
          totalOrders: businessOrders.length,
        },
      };
    });

    res.json({ success: true, businesses: businessesWithStats });
  } catch (error: any) {
    console.error("Error loading businesses:", error);
    res.status(500).json({ error: error.message });
  }
});

// Create business
router.post("/create", authenticateToken, requireRole("business_owner"), async (req, res) => {
  try {
    const { businesses } = await import("@shared/schema-mysql");
    const { db } = await import("../db");

    const { name, description, type, image, address, phone, categories } = req.body;

    if (!name) {
      return res.status(400).json({ error: "El nombre del negocio es requerido" });
    }

    const newBusiness = {
      id: uuidv4(),
      ownerId: req.user!.id,
      name,
      description: description || null,
      type: type || "restaurant",
      image: image || null,
      address: address || null,
      phone: phone || null,
      categories: categories || null,
      isActive: true,
      isOpen: false,
      rating: 0,
      totalRatings: 0,
      deliveryTime: "30-45 min",
      deliveryFee: 2500,
      minOrder: 5000,
    };

    await db.insert(businesses).values(newBusiness);

    res.json({ success: true, business: newBusiness });
  } catch (error: any) {
    console.error("Error creating business:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get business dashboard (specific route for frontend compatibility)
router.get("/dashboard", authenticateToken, requireRole("business_owner"), async (req, res) => {
  try {
    const { businessId } = req.query;
    const { businesses, orders } = await import("@shared/schema-mysql");
    const { db } = await import("../db");

    let business;
    if (businessId) {
      business = await db
        .select()
        .from(businesses)
        .where(and(
          eq(businesses.id, businessId as string),
          eq(businesses.ownerId, req.user!.id)
        ))
        .limit(1);
    } else {
      business = await db
        .select()
        .from(businesses)
        .where(eq(businesses.ownerId, req.user!.id))
        .limit(1);
    }

    if (!business[0]) {
      return res.status(404).json({ error: "Business not found" });
    }

    console.log(`🏪 Dashboard for business: ${business[0].name} (${business[0].id})`);

    const businessOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.businessId, business[0].id))
      .orderBy(desc(orders.createdAt));

    console.log(`📦 Found ${businessOrders.length} orders for this business`);

    const pendingOrders = businessOrders.filter(o => o.status === "pending");
    const todayOrders = businessOrders.filter(o => {
      const today = new Date();
      const orderDate = new Date(o.createdAt);
      return orderDate.toDateString() === today.toDateString();
    });

    const todayRevenue = todayOrders
      .filter(o => o.status === "delivered")
      .reduce((sum, o) => sum + (o.subtotal || 0), 0);

    res.json({
      success: true,
      dashboard: {
        business: business[0],
        isOpen: business[0].isOpen || false,
        pendingOrders: pendingOrders.length,
        todayOrders: todayOrders.length,
        todayRevenue: Math.round(todayRevenue),
        totalOrders: businessOrders.length,
        recentOrders: businessOrders.slice(0, 10),
      },
    });
  } catch (error: any) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get business stats
router.get("/stats", authenticateToken, requireRole("business_owner"), async (req, res) => {
  try {
    const { businessId } = req.query;
    const { businesses, orders } = await import("@shared/schema-mysql");
    const { db } = await import("../db");

    let business;
    if (businessId) {
      business = await db
        .select()
        .from(businesses)
        .where(and(
          eq(businesses.id, businessId as string),
          eq(businesses.ownerId, req.user!.id)
        ))
        .limit(1);
    } else {
      business = await db
        .select()
        .from(businesses)
        .where(eq(businesses.ownerId, req.user!.id))
        .limit(1);
    }

    if (!business[0]) {
      return res.status(404).json({ error: "Business not found" });
    }

    const businessOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.businessId, business[0].id));

    const today = new Date();
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const todayOrders = businessOrders.filter(o => {
      const orderDate = new Date(o.createdAt);
      return orderDate.toDateString() === today.toDateString();
    });

    const weekOrders = businessOrders.filter(o => {
      const orderDate = new Date(o.createdAt);
      return orderDate >= thisWeek;
    });

    const monthOrders = businessOrders.filter(o => {
      const orderDate = new Date(o.createdAt);
      return orderDate >= thisMonth;
    });

    const todayRevenue = todayOrders
      .filter(o => o.status === "delivered")
      .reduce((sum, o) => sum + (o.subtotal || 0), 0);

    const weekRevenue = weekOrders
      .filter(o => o.status === "delivered")
      .reduce((sum, o) => sum + (o.subtotal || 0), 0);

    const monthRevenue = monthOrders
      .filter(o => o.status === "delivered")
      .reduce((sum, o) => sum + (o.subtotal || 0), 0);

    res.json({
      success: true,
      stats: {
        today: {
          orders: todayOrders.length,
          revenue: Math.round(todayRevenue),
        },
        week: {
          orders: weekOrders.length,
          revenue: Math.round(weekRevenue),
        },
        month: {
          orders: monthOrders.length,
          revenue: Math.round(monthRevenue),
        },
        total: {
          orders: businessOrders.length,
          revenue: Math.round(businessOrders
            .filter(o => o.status === "delivered")
            .reduce((sum, o) => sum + (o.subtotal || 0), 0)),
        },
      },
    });
  } catch (error: any) {
    console.error('Stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get business limits
router.get("/limits", authenticateToken, requireRole("business_owner"), async (req, res) => {
  try {
    // Return default limits for now
    res.json({
      success: true,
      limits: {
        maxProducts: 100,
        maxCategories: 20,
        maxImages: 10,
        maxOrdersPerHour: 50,
        maxDeliveryRadius: 10, // km
        minOrderAmount: 5000, // centavos
        maxOrderAmount: 100000, // centavos
      },
    });
  } catch (error: any) {
    console.error('Limits error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update business
router.put("/:id", authenticateToken, requireRole("business_owner"), async (req, res) => {
  try {
    const { businesses } = await import("@shared/schema-mysql");
    const { db } = await import("../db");

    const business = await db
      .select()
      .from(businesses)
      .where(and(
        eq(businesses.id, req.params.id),
        eq(businesses.ownerId, req.user!.id)
      ))
      .limit(1);

    if (!business[0]) {
      return res.status(404).json({ error: "Negocio no encontrado" });
    }

    const allowedFields = ["name", "description", "type", "image", "address", "phone", 
                          "categories", "isOpen", "deliveryTime", "deliveryFee", "minOrder"];
    const updates: any = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    await db
      .update(businesses)
      .set(updates)
      .where(eq(businesses.id, req.params.id));

    res.json({ success: true, message: "Negocio actualizado" });
  } catch (error: any) {
    console.error("Error updating business:", error);
    res.status(500).json({ error: error.message });
  }
});

// Delete business
router.delete("/:id", authenticateToken, requireRole("business_owner"), async (req, res) => {
  try {
    const { businesses, orders } = await import("@shared/schema-mysql");
    const { db } = await import("../db");

    const business = await db
      .select()
      .from(businesses)
      .where(and(
        eq(businesses.id, req.params.id),
        eq(businesses.ownerId, req.user!.id)
      ))
      .limit(1);

    if (!business[0]) {
      return res.status(404).json({ error: "Negocio no encontrado" });
    }

    const activeOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.businessId, req.params.id));

    const hasActiveOrders = activeOrders.some(o => 
      ["pending", "confirmed", "preparing", "ready", "picked_up", "on_the_way"].includes(o.status)
    );

    if (hasActiveOrders) {
      return res.status(400).json({ 
        error: "No se puede eliminar un negocio con pedidos activos" 
      });
    }

    await db.delete(businesses).where(eq(businesses.id, req.params.id));

    res.json({ success: true, message: "Negocio eliminado" });
  } catch (error: any) {
    console.error("Error deleting business:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
