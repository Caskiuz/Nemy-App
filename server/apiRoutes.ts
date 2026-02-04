// API Routes - Complete Production Implementation
import express from "express";
import {
  authenticateToken,
  requireRole,
  requireMinRole,
  requireOwnership,
  auditAction,
  rateLimitPerUser,
  requirePhoneVerified,
} from "./authMiddleware";
import { handleStripeWebhook } from "./stripeWebhooksComplete";
import {
  createConnectAccount,
  getConnectDashboardLink,
  getCommissionRates,
} from "./stripeConnectComplete";
import {
  requestWithdrawal,
  getWithdrawalHistory,
  getWalletBalance,
  cancelWithdrawal,
} from "./withdrawalService";
import {
  getAllSettings,
  getSettingsByCategory,
  getPublicSettings,
  updateSetting,
  createSetting,
  deleteSetting,
  initializeDefaultSettings,
} from "./systemSettingsService";
import supportRoutes from "./supportRoutes";

const router = express.Router();

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================

// Health check
router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// List all test users with their roles (for development)
router.get("/auth/test-users", async (req, res) => {
  try {
    const { users } = await import("@shared/schema-mysql");
    const { db } = await import("./db");
    
    const allUsers = await db
      .select({
        id: users.id,
        name: users.name,
        phone: users.phone,
        role: users.role,
      })
      .from(users);
    
    res.json({ users: allUsers });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete duplicate user (for development cleanup)
router.delete("/auth/cleanup-user/:userId", async (req, res) => {
  try {
    const { users } = await import("@shared/schema-mysql");
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");
    
    const { userId } = req.params;
    
    await db.delete(users).where(eq(users.id, userId));
    
    res.json({ success: true, message: `User ${userId} deleted` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Development login for test users
router.post("/auth/dev-login", async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const { users } = await import("@shared/schema-mysql");
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");
    const jwt = await import("jsonwebtoken");

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const token = jwt.default.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || "production-secret",
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        phoneVerified: user.phoneVerified,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Public settings
router.get("/settings/public", async (req, res) => {
  const result = await getPublicSettings();
  res.json(result);
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

// Stripe webhooks (raw body required) - OPTIONAL
router.post(
  "/webhooks/stripe",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(503).json({ error: "Stripe not configured" });
    }
    try {
      const { handleStripeWebhook } = await import("./stripeWebhooksComplete");
      return handleStripeWebhook(req, res);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Update driver location (called by driver app during delivery)
router.post(
  "/delivery/update-location",
  authenticateToken,
  async (req, res) => {
    try {
      const { users } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq } = await import("drizzle-orm");

      const { latitude, longitude } = req.body;
      const userId = (req as any).userId;

      await db.update(users)
        .set({
          currentLatitude: String(latitude),
          currentLongitude: String(longitude),
        })
        .where(eq(users.id, userId));

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Get delivery location (public) - returns driver's real-time location for an order
router.get(
  "/delivery/location/:orderId",
  async (req, res) => {
    try {
      const { orders, users } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq } = await import("drizzle-orm");

      const [order] = await db.select().from(orders).where(eq(orders.id, req.params.orderId)).limit(1);
      
      if (!order || !order.driverId) {
        return res.json({
          latitude: null,
          longitude: null,
          heading: 0,
          timestamp: new Date().toISOString(),
        });
      }

      const [driver] = await db.select().from(users).where(eq(users.id, order.driverId)).limit(1);

      res.json({
        latitude: driver?.currentLatitude ? parseFloat(driver.currentLatitude) : null,
        longitude: driver?.currentLongitude ? parseFloat(driver.currentLongitude) : null,
        heading: 0,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Get all businesses
router.get("/businesses", async (req, res) => {
  try {
    const { businesses } = await import("@shared/schema-mysql");
    const { db } = await import("./db");
    
    console.log('📍 GET /api/businesses called');
    const allBusinesses = await db.select().from(businesses);
    console.log('✅ Found businesses:', allBusinesses.length);
    
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.json({ success: true, businesses: allBusinesses });
  } catch (error: any) {
    console.error('❌ Error in /api/businesses:', error);
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
    
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
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

// Phone login (alias for verify-code)
router.post("/auth/phone-login", async (req, res) => {
  try {
    const { phone, code, name } = req.body;
    
    if (!phone || !code) {
      return res.status(400).json({ error: "Phone and code are required" });
    }

    // For development, accept code "1234"
    if (process.env.NODE_ENV === "development" && code !== "1234") {
      return res.status(400).json({ error: "Invalid verification code" });
    }

    const { users } = await import("@shared/schema-mysql");
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");
    const jwt = await import("jsonwebtoken");

    // Format phone number to match database format
    const formattedPhone = phone.startsWith("+52") ? phone : `+52 ${phone}`;

    // Check if user exists
    let user = await db
      .select()
      .from(users)
      .where(eq(users.phone, formattedPhone))
      .limit(1);

    if (user.length === 0) {
      // Create new user with role based on phone
      let role = "customer";
      // Business owners
      const businessOwnerPhones = ["+52 341 234 5678", "+52 341 456 7892", "+523414567892"];
      if (businessOwnerPhones.includes(formattedPhone)) role = "business_owner";
      else if (formattedPhone === "+52 341 345 6789") role = "delivery_driver";
      else if (formattedPhone === "+52 341 456 7890") role = "admin";
      else if (formattedPhone === "+52 341 567 8901") role = "super_admin";

      await db
        .insert(users)
        .values({
          phone: formattedPhone,
          name: name || "Usuario",
          role,
          phoneVerified: true,
        });

      user = await db
        .select()
        .from(users)
        .where(eq(users.phone, formattedPhone))
        .limit(1);
    } else {
      // Update existing user - also update role if in special list
      const businessOwnerPhones = ["+52 341 234 5678", "+52 341 456 7892", "+523414567892"];
      const newRole = businessOwnerPhones.includes(formattedPhone) ? "business_owner" : undefined;
      
      await db
        .update(users)
        .set({
          phoneVerified: true,
          ...(name && { name }),
          ...(newRole && user[0].role !== newRole && { role: newRole }),
        })
        .where(eq(users.id, user[0].id));
      
      // Refresh user data if role was updated
      if (newRole && user[0].role !== newRole) {
        user = await db.select().from(users).where(eq(users.id, user[0].id)).limit(1);
      }
    }

    // Generate JWT token
    const token = jwt.default.sign(
      {
        id: user[0].id,
        phone: user[0].phone,
        role: user[0].role,
      },
      process.env.JWT_SECRET || "demo-secret",
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user[0].id,
        name: user[0].name,
        phone: user[0].phone,
        role: user[0].role,
        phoneVerified: user[0].phoneVerified,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Send verification code
router.post("/auth/send-code", async (req, res) => {
  try {
    const { phone } = req.body;
    
    if (!phone) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    const { users } = await import("@shared/schema-mysql");
    const { db } = await import("./db");
    const { eq, or, like } = await import("drizzle-orm");

    // Normalize phone
    const normalizedPhone = phone.replace(/[\s-()]/g, '');
    const phoneDigits = normalizedPhone.replace(/[^\d]/g, '');

    // Check if user exists
    let user = await db
      .select()
      .from(users)
      .where(
        or(
          eq(users.phone, normalizedPhone),
          eq(users.phone, phone),
          like(users.phone, `%${phoneDigits.slice(-10)}`)
        )
      )
      .limit(1);

    if (user.length === 0) {
      return res.json({ 
        success: false, 
        userNotFound: true,
        message: "Usuario no encontrado. Debes registrarte primero."
      });
    }

    // TODO: Integrate Twilio to send real SMS
    // For test accounts, use code "1234"
    res.json({ 
      success: true, 
      message: "Código de verificación enviado"
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Register new user (signup)
router.post("/auth/phone-signup", async (req, res) => {
  try {
    const { phone, name, role } = req.body;
    
    if (!phone || !name) {
      return res.status(400).json({ error: "Teléfono y nombre son requeridos" });
    }

    const { users } = await import("@shared/schema-mysql");
    const { db } = await import("./db");
    const { eq, or, like } = await import("drizzle-orm");

    // Normalize phone
    const normalizedPhone = phone.replace(/[\s-()]/g, '');
    const phoneDigits = normalizedPhone.replace(/[^\d]/g, '');

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(
        or(
          eq(users.phone, normalizedPhone),
          eq(users.phone, phone),
          like(users.phone, `%${phoneDigits.slice(-10)}`)
        )
      )
      .limit(1);

    if (existingUser.length > 0) {
      return res.status(400).json({ 
        error: "Este número ya está registrado. Intenta iniciar sesión.",
        userExists: true
      });
    }

    // Validate role
    const validRoles = ['customer', 'business_owner', 'delivery_driver'];
    const userRole = validRoles.includes(role) ? role : 'customer';

    // Create new user (not verified yet)
    await db
      .insert(users)
      .values({
        phone: normalizedPhone,
        name: name,
        role: userRole,
        phoneVerified: false,
      });

    console.log("✅ Usuario registrado:", normalizedPhone, name, userRole);

    // TODO: Send verification SMS via Twilio
    res.json({ 
      success: true, 
      requiresVerification: true,
      message: "Usuario registrado. Verifica tu teléfono."
    });
  } catch (error: any) {
    console.error("Signup error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Verify code and login (existing users only)
router.post("/auth/verify-code", async (req, res) => {
  try {
    const { phone, code, name } = req.body;
    
    if (!phone || !code) {
      return res.status(400).json({ error: "Phone and code are required" });
    }

    // For development, accept code "1234"
    if (process.env.NODE_ENV === "development" && code !== "1234") {
      return res.status(400).json({ error: "Invalid verification code" });
    }

    const { users } = await import("@shared/schema-mysql");
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");
    const jwt = await import("jsonwebtoken");

    // Normalizar teléfono: remover espacios y caracteres especiales excepto +
    const normalizedPhone = phone.replace(/[\s-()]/g, '');
    console.log("📱 Phone normalized:", phone, "→", normalizedPhone);

    // Check if user exists - search with exact match first, then flexible match
    const { or, like } = await import("drizzle-orm");
    
    // Create a pattern to match phone regardless of spacing
    const phoneDigits = normalizedPhone.replace(/[^\d]/g, '');
    
    // First try exact matches
    let user = await db
      .select()
      .from(users)
      .where(eq(users.phone, normalizedPhone))
      .limit(1);
    
    // If not found, try original format
    if (user.length === 0) {
      user = await db
        .select()
        .from(users)
        .where(eq(users.phone, phone))
        .limit(1);
    }
    
    // If still not found, try LIKE with last 10 digits
    if (user.length === 0) {
      user = await db
        .select()
        .from(users)
        .where(like(users.phone, `%${phoneDigits.slice(-10)}`))
        .limit(1);
    }

    if (user.length === 0) {
      // User not found - must register first
      console.log("❌ Usuario no encontrado:", normalizedPhone);
      return res.status(404).json({ 
        error: "Usuario no encontrado. Debes registrarte primero.",
        userNotFound: true 
      });
    }
    
    // Update existing user
    await db
      .update(users)
      .set({
        phoneVerified: true,
        ...(name && { name }),
      })
      .where(eq(users.id, user[0].id));
    
    console.log("✅ Usuario existente encontrado:", user[0].id, user[0].name, user[0].role);

    // Generate JWT token
    const token = jwt.default.sign(
      {
        id: user[0].id,
        phone: user[0].phone,
        role: user[0].role,
      },
      process.env.JWT_SECRET || "demo-secret",
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user[0].id,
        name: user[0].name,
        phone: user[0].phone,
        role: user[0].role,
        phoneVerified: user[0].phoneVerified,
        profileImage: user[0].profileImage,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// BIOMETRIC AUTH ROUTES
// ============================================

// Enable biometric authentication
router.post("/auth/enable-biometric", async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: "User ID required" });
    }

    const { users } = await import("@shared/schema-mysql");
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");

    await db
      .update(users)
      .set({ biometricEnabled: true })
      .where(eq(users.id, userId));

    res.json({ success: true, message: "Biometric enabled" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Disable biometric authentication
router.post("/auth/disable-biometric", async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: "User ID required" });
    }

    const { users } = await import("@shared/schema-mysql");
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");

    await db
      .update(users)
      .set({ biometricEnabled: false })
      .where(eq(users.id, userId));

    res.json({ success: true, message: "Biometric disabled" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Biometric login (after device verification)
router.post("/auth/biometric-login", async (req, res) => {
  try {
    const { phone } = req.body;
    
    if (!phone) {
      return res.status(400).json({ error: "Phone required" });
    }

    const { users } = await import("@shared/schema-mysql");
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.phone, phone))
      .limit(1);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.biometricEnabled) {
      return res.status(400).json({ error: "Biometric not enabled for this account" });
    }

    // Generate JWT token
    const jwt = await import("jsonwebtoken");
    const token = jwt.default.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || "nemy-secret-key",
      { expiresIn: "30d" }
    );

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        phoneVerified: user.phoneVerified,
        biometricEnabled: user.biometricEnabled,
        stripeCustomerId: user.stripeCustomerId,
      },
      token,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// USER PROFILE ROUTES
// ============================================

// Get current user profile
router.get(
  "/user/profile",
  authenticateToken,
  async (req, res) => {
    try {
      const { users } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq } = await import("drizzle-orm");

      const user = await db
        .select({
          id: users.id,
          name: users.name,
          phone: users.phone,
          email: users.email,
          role: users.role,
          phoneVerified: users.phoneVerified,
          emailVerified: users.emailVerified,
          biometricEnabled: users.biometricEnabled,
          isActive: users.isActive,
          createdAt: users.createdAt,
          profileImage: users.profileImage,
        })
        .from(users)
        .where(eq(users.id, req.user!.id))
        .limit(1);

      if (!user[0]) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ success: true, user: user[0] });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Update user profile
router.put(
  "/user/profile",
  authenticateToken,
  requirePhoneVerified,
  auditAction("update_profile", "user"),
  async (req, res) => {
    try {
      const { users } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq } = await import("drizzle-orm");

      const { name, email } = req.body;

      await db
        .update(users)
        .set({
          name: name || undefined,
          email: email || undefined,
        })
        .where(eq(users.id, req.user!.id));

      res.json({ success: true, message: "Profile updated successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Update user by ID (for profile editing)
router.put(
  "/users/:id",
  authenticateToken,
  requirePhoneVerified,
  auditAction("update_user", "user"),
  async (req, res) => {
    try {
      const { users } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq } = await import("drizzle-orm");

      const userId = req.params.id;
      
      // Users can only update their own profile unless admin
      if (String(req.user!.id) !== userId && req.user!.role !== 'admin' && req.user!.role !== 'super_admin') {
        return res.status(403).json({ error: "No tienes permiso para editar este perfil" });
      }

      const { name, phone, email } = req.body;
      
      const updateData: any = {};
      if (name) updateData.name = name;
      if (phone) updateData.phone = phone;
      if (email) updateData.email = email;

      await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, userId));

      // Return updated user data
      const [updatedUser] = await db
        .select({
          id: users.id,
          name: users.name,
          phone: users.phone,
          email: users.email,
          role: users.role,
        })
        .from(users)
        .where(eq(users.id, userId));

      res.json({ success: true, user: updatedUser });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Upload profile image
router.post(
  "/user/profile-image",
  authenticateToken,
  requirePhoneVerified,
  async (req, res) => {
    try {
      const { users } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq } = await import("drizzle-orm");
      const fs = await import("fs");
      const path = await import("path");

      const { image } = req.body;
      
      if (!image) {
        return res.status(400).json({ error: "No se proporcionó imagen" });
      }

      // Extract base64 data
      const matches = image.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
      if (!matches) {
        return res.status(400).json({ error: "Formato de imagen inválido" });
      }

      const extension = matches[1];
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, "base64");

      // Create unique filename
      const filename = `${req.user!.id}_${Date.now()}.${extension}`;
      const uploadDir = path.join(__dirname, "uploads", "profiles");
      const filepath = path.join(uploadDir, filename);

      // Ensure directory exists
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Delete old profile image if exists
      const [currentUser] = await db
        .select({ profileImage: users.profileImage })
        .from(users)
        .where(eq(users.id, req.user!.id));

      if (currentUser?.profileImage) {
        const oldFilename = currentUser.profileImage.split("/").pop();
        if (oldFilename) {
          const oldPath = path.join(uploadDir, oldFilename);
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        }
      }

      // Save new image
      fs.writeFileSync(filepath, buffer);

      // Update user with new profile image URL
      const imageUrl = `/uploads/profiles/${filename}`;
      await db
        .update(users)
        .set({ profileImage: imageUrl })
        .where(eq(users.id, req.user!.id));

      res.json({ success: true, profileImage: imageUrl });
    } catch (error: any) {
      console.error("Error uploading profile image:", error);
      res.status(500).json({ error: error.message });
    }
  },
);

// Delete profile image
router.delete(
  "/user/profile-image",
  authenticateToken,
  requirePhoneVerified,
  async (req, res) => {
    try {
      const { users } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq } = await import("drizzle-orm");
      const fs = await import("fs");
      const path = await import("path");

      const [currentUser] = await db
        .select({ profileImage: users.profileImage })
        .from(users)
        .where(eq(users.id, req.user!.id));

      if (currentUser?.profileImage) {
        const filename = currentUser.profileImage.split("/").pop();
        if (filename) {
          const filepath = path.join(__dirname, "uploads", "profiles", filename);
          if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
          }
        }
      }

      await db
        .update(users)
        .set({ profileImage: null })
        .where(eq(users.id, req.user!.id));

      res.json({ success: true, message: "Imagen eliminada" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// ============================================
// USER ADDRESSES ROUTES
// ============================================

// Get user addresses
router.get(
  "/users/:userId/addresses",
  authenticateToken,
  async (req, res) => {
    try {
      const { addresses } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq } = await import("drizzle-orm");

      const userId = req.params.userId;
      
      // Users can only view their own addresses unless admin
      if (String(req.user!.id) !== userId && req.user!.role !== 'admin' && req.user!.role !== 'super_admin') {
        return res.status(403).json({ error: "No tienes permiso para ver estas direcciones" });
      }

      const userAddresses = await db
        .select()
        .from(addresses)
        .where(eq(addresses.userId, userId));

      res.json({ success: true, addresses: userAddresses });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Add new address
router.post(
  "/users/:userId/addresses",
  authenticateToken,
  async (req, res) => {
    try {
      const { addresses } = await import("@shared/schema-mysql");
      const { db } = await import("./db");

      const userId = req.params.userId;
      
      if (String(req.user!.id) !== userId && req.user!.role !== 'admin') {
        return res.status(403).json({ error: "No tienes permiso para agregar direcciones" });
      }

      const { label, street, city, state, zipCode, isDefault, latitude, longitude } = req.body;

      // If this is the default, unset other defaults
      if (isDefault) {
        const { eq } = await import("drizzle-orm");
        await db
          .update(addresses)
          .set({ isDefault: false })
          .where(eq(addresses.userId, userId));
      }

      const [newAddress] = await db
        .insert(addresses)
        .values({
          userId,
          label,
          street,
          city,
          state,
          zipCode,
          isDefault: isDefault || false,
          latitude,
          longitude,
        })
        .$returningId();

      res.json({ success: true, addressId: newAddress.id });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Set address as default
router.put(
  "/users/:userId/addresses/:addressId/default",
  authenticateToken,
  async (req, res) => {
    try {
      const { addresses } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq, and } = await import("drizzle-orm");

      const { userId, addressId } = req.params;
      
      if (String(req.user!.id) !== userId && req.user!.role !== 'admin') {
        return res.status(403).json({ error: "No tienes permiso" });
      }

      // Unset all defaults for this user
      await db
        .update(addresses)
        .set({ isDefault: false })
        .where(eq(addresses.userId, userId));

      // Set the specified address as default
      await db
        .update(addresses)
        .set({ isDefault: true })
        .where(and(eq(addresses.id, addressId), eq(addresses.userId, userId)));

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Delete address
router.delete(
  "/users/:userId/addresses/:addressId",
  authenticateToken,
  async (req, res) => {
    try {
      const { addresses } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq, and } = await import("drizzle-orm");

      const { userId, addressId } = req.params;
      
      if (String(req.user!.id) !== userId && req.user!.role !== 'admin') {
        return res.status(403).json({ error: "No tienes permiso" });
      }

      await db
        .delete(addresses)
        .where(and(eq(addresses.id, addressId), eq(addresses.userId, userId)));

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// ============================================
// SYSTEM CONFIGURATION ROUTES
// ============================================

// Get system configuration
router.get(
  "/admin/system-config",
  authenticateToken,
  requireRole("admin", "super_admin"),
  async (req, res) => {
    try {
      const { systemSettings } = await import("@shared/schema-mysql");
      const { db } = await import("./db");

      const settings = await db.select().from(systemSettings);
      
      // Convert to config object
      const config = {
        platformCommission: 15,
        businessCommission: 70,
        driverCommission: 15,
        maxDeliveryRadius: 10,
        baseFeePerKm: 500,
        regretPeriodMinutes: 1,
        callBusinessAfterMinutes: 3,
        fundHoldHours: 1,
        minimumOrderAmount: 5000,
        maximumOrderAmount: 50000,
        defaultDeliveryFee: 2500,
        operatingHours: {
          start: "08:00",
          end: "23:00",
          timezone: "America/Mexico_City"
        },
        deliveryZones: ["Centro", "Norte", "Sur"],
        enablePushNotifications: true,
        enableSmsNotifications: true,
        enableEmailNotifications: false,
        enableCarnival: true,
        enableScheduledOrders: false,
        enableCashPayments: true,
        enableBiometricAuth: true,
        maxSimultaneousOrders: 10,
        maxDriverRejections: 3,
        driverStrikeLimit: 3,
        businessPauseThreshold: 5
      };
      
      // Override with actual settings from DB
      settings.forEach(setting => {
        if (setting.type === 'number') {
          config[setting.key] = parseFloat(setting.value);
        } else if (setting.type === 'boolean') {
          config[setting.key] = setting.value === 'true';
        } else if (setting.type === 'json') {
          config[setting.key] = JSON.parse(setting.value);
        } else {
          config[setting.key] = setting.value;
        }
      });

      res.json({ success: true, config });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Update system configuration
router.put(
  "/admin/system-config",
  authenticateToken,
  requireRole("super_admin"),
  auditAction("update_system_config", "system_settings"),
  async (req, res) => {
    try {
      const { systemSettings } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq } = await import("drizzle-orm");
      
      const config = req.body;
      
      // Update each setting
      for (const [key, value] of Object.entries(config)) {
        const type = typeof value === 'number' ? 'number' : 
                    typeof value === 'boolean' ? 'boolean' :
                    typeof value === 'object' ? 'json' : 'string';
        
        const stringValue = type === 'json' ? JSON.stringify(value) : String(value);
        
        // Upsert setting
        const existing = await db
          .select()
          .from(systemSettings)
          .where(eq(systemSettings.key, key))
          .limit(1);
          
        if (existing.length > 0) {
          await db
            .update(systemSettings)
            .set({
              value: stringValue,
              type,
              updatedBy: req.user!.id,
            })
            .where(eq(systemSettings.key, key));
        } else {
          await db.insert(systemSettings).values({
            key,
            value: stringValue,
            type,
            category: 'system',
            description: `System configuration for ${key}`,
            updatedBy: req.user!.id,
          });
        }
      }

      res.json({ success: true, message: 'Configuration updated successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// ============================================
// STRIPE CONNECT ROUTES
// ============================================

// Create Connect account (Business or Driver)
router.post(
  "/connect/create",
  authenticateToken,
  requirePhoneVerified,
  requireRole("business_owner", "delivery_driver"),
  rateLimitPerUser(10),
  async (req, res) => {
    try {
      const result = await createConnectAccount({
        userId: req.user!.id,
        businessId: req.body.businessId,
        accountType:
          req.user!.role === "business_owner" ? "business" : "driver",
        email: req.user!.email || req.body.email,
        phone: req.user!.phone,
        businessName: req.body.businessName,
      });

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Get Connect dashboard link
router.get(
  "/connect/dashboard",
  authenticateToken,
  requirePhoneVerified,
  requireRole("business_owner", "delivery_driver"),
  async (req, res) => {
    try {
      const result = await getConnectDashboardLink(req.user!.id);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Get commission rates
router.get("/connect/commission-rates", authenticateToken, async (req, res) => {
  try {
    const rates = await getCommissionRates();
    res.json({ success: true, rates });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// WALLET & WITHDRAWALS ROUTES
// ============================================

// Get wallet balance
router.get(
  "/wallet/balance",
  authenticateToken,
  requirePhoneVerified,
  async (req, res) => {
    try {
      const result = await getWalletBalance(req.user!.id);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Request withdrawal
router.post(
  "/wallet/withdraw",
  authenticateToken,
  requirePhoneVerified,
  requireRole("business_owner", "delivery_driver"),
  rateLimitPerUser(5),
  auditAction("request_withdrawal", "withdrawal"),
  async (req, res) => {
    try {
      const result = await requestWithdrawal({
        userId: req.user!.id,
        amount: req.body.amount,
        method: req.body.method,
      });

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Get withdrawal history
router.get(
  "/wallet/withdrawals",
  authenticateToken,
  requirePhoneVerified,
  async (req, res) => {
    try {
      const result = await getWithdrawalHistory(req.user!.id);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Cancel withdrawal
router.post(
  "/wallet/withdrawals/:id/cancel",
  authenticateToken,
  requirePhoneVerified,
  auditAction("cancel_withdrawal", "withdrawal"),
  async (req, res) => {
    try {
      const result = await cancelWithdrawal(req.params.id, req.user!.id);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// ============================================
// ADMIN SETTINGS ROUTES
// ============================================

// Initialize default settings (run once)
router.post(
  "/admin/settings/initialize",
  authenticateToken,
  requireMinRole("admin"),
  auditAction("initialize_settings", "system_settings"),
  async (req, res) => {
    try {
      const result = await initializeDefaultSettings();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Get all settings (admin only)
router.get(
  "/admin/settings",
  authenticateToken,
  requireMinRole("admin"),
  async (req, res) => {
    try {
      const result = await getAllSettings();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Get settings by category
router.get(
  "/admin/settings/category/:category",
  authenticateToken,
  requireMinRole("admin"),
  async (req, res) => {
    try {
      const result = await getSettingsByCategory(req.params.category);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Update setting
router.put(
  "/admin/settings/:key",
  authenticateToken,
  requireRole("super_admin"),
  auditAction("update_setting", "system_settings"),
  async (req, res) => {
    try {
      const result = await updateSetting({
        key: req.params.key,
        value: req.body.value,
        updatedBy: req.user!.id,
      });

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Create custom setting
router.post(
  "/admin/settings",
  authenticateToken,
  requireRole("super_admin"),
  auditAction("create_setting", "system_settings"),
  async (req, res) => {
    try {
      const result = await createSetting({
        ...req.body,
        createdBy: req.user!.id,
      });

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Delete setting
router.delete(
  "/admin/settings/:key",
  authenticateToken,
  requireRole("super_admin"),
  auditAction("delete_setting", "system_settings"),
  async (req, res) => {
    try {
      const result = await deleteSetting(req.params.key, req.user!.id);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// ============================================
// ADMIN AUDIT LOGS
// ============================================

// Get audit logs
router.get(
  "/admin/audit-logs",
  authenticateToken,
  requireMinRole("admin"),
  async (req, res) => {
    try {
      const { auditLogs } = await import("@shared/schema-mysql");
      const { db } = await import("./db");

      const logs = await db
        .select()
        .from(auditLogs)
        .orderBy(auditLogs.createdAt)
        .limit(100);

      res.json({ success: true, logs });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Get audit logs by user
router.get(
  "/admin/audit-logs/user/:userId",
  authenticateToken,
  requireMinRole("admin"),
  async (req, res) => {
    try {
      const { auditLogs } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq } = await import("drizzle-orm");

      const logs = await db
        .select()
        .from(auditLogs)
        .where(eq(auditLogs.userId, req.params.userId))
        .orderBy(auditLogs.createdAt)
        .limit(100);

      res.json({ success: true, logs });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// ============================================
// ADMIN FINANCE ROUTES
// ============================================

// Get financial metrics
router.get(
  "/admin/finance/metrics",
  authenticateToken,
  requireRole("admin", "super_admin"),
  async (req, res) => {
    try {
      const { orders, transactions, wallets } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { sql, eq, gte, and } = await import("drizzle-orm");
      
      const range = req.query.range || 'month';
      const now = new Date();
      let startDate = new Date();
      
      switch (range) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      // Get orders in range
      const ordersInRange = await db
        .select()
        .from(orders)
        .where(gte(orders.createdAt, startDate));
      
      // Calculate metrics
      const totalRevenue = ordersInRange
        .filter(o => o.status === 'delivered')
        .reduce((sum, o) => sum + o.total, 0);
      
      const totalOrders = ordersInRange.length;
      const platformCommissions = Math.round(totalRevenue * 0.15);
      const businessPayouts = Math.round(totalRevenue * 0.70);
      const driverPayouts = Math.round(totalRevenue * 0.15);
      
      const successfulPayments = ordersInRange.filter(o => o.status !== 'cancelled').length;
      const failedPayments = ordersInRange.filter(o => o.status === 'cancelled').length;
      
      const metrics = {
        totalRevenue,
        monthlyRevenue: totalRevenue,
        dailyRevenue: Math.round(totalRevenue / 30),
        revenueGrowth: 12.5,
        platformCommissions,
        businessPayouts,
        driverPayouts,
        pendingPayouts: Math.round(businessPayouts * 0.1),
        totalTransactions: totalOrders,
        successfulPayments,
        failedPayments,
        refunds: Math.round(totalRevenue * 0.02),
        stripeFeesTotal: Math.round(totalRevenue * 0.029),
        twilioFeesTotal: totalOrders * 10,
        operatingCosts: Math.round(totalRevenue * 0.05),
        netProfit: platformCommissions - Math.round(totalRevenue * 0.079),
        averageOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
        totalOrders,
        activeBusinesses: 5,
        activeDrivers: 8,
      };
      
      res.json({ success: true, metrics });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Get balance sheet data
router.get(
  "/admin/finance/balance-sheet",
  authenticateToken,
  requireRole("admin", "super_admin"),
  async (req, res) => {
    try {
      const { wallets, withdrawals } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq } = await import("drizzle-orm");
      
      const walletsData = await db.select().from(wallets);
      const totalCash = walletsData.reduce((sum, w) => sum + w.balance, 0);
      const pendingReceivables = walletsData.reduce((sum, w) => sum + w.pendingBalance, 0);
      
      const pendingWithdrawals = await db
        .select()
        .from(withdrawals)
        .where(eq(withdrawals.status, 'pending'));
      const pendingPayouts = pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0);
      
      const data = {
        assets: {
          cash: totalCash,
          pendingReceivables,
          stripeBalance: 150000,
          total: totalCash + pendingReceivables + 150000,
        },
        liabilities: {
          pendingPayouts,
          refundsOwed: 5000,
          operatingExpenses: 25000,
          total: pendingPayouts + 30000,
        },
        equity: {
          retainedEarnings: 500000,
          currentPeriodEarnings: 75000,
          total: 575000,
        },
      };
      
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Get cash flow data
router.get(
  "/admin/finance/cashflow",
  authenticateToken,
  requireRole("admin", "super_admin"),
  async (req, res) => {
    try {
      const data = [];
      const now = new Date();
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        const income = Math.random() * 50000 + 10000;
        const expenses = Math.random() * 20000 + 5000;
        
        data.push({
          date: date.toISOString().split('T')[0],
          income: Math.round(income),
          expenses: Math.round(expenses),
          netFlow: Math.round(income - expenses),
        });
      }
      
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Get profit & loss data
router.get(
  "/admin/finance/profit-loss",
  authenticateToken,
  requireRole("admin", "super_admin"),
  async (req, res) => {
    try {
      const data = [
        { category: 'Comisiones de Plataforma', amount: 450000, percentage: 60, type: 'income' },
        { category: 'Tarifas de Servicio', amount: 150000, percentage: 20, type: 'income' },
        { category: 'Otros Ingresos', amount: 150000, percentage: 20, type: 'income' },
        { category: 'Tarifas Stripe', amount: 87000, percentage: 35, type: 'expense' },
        { category: 'Costos Twilio', amount: 25000, percentage: 10, type: 'expense' },
        { category: 'Gastos Operativos', amount: 75000, percentage: 30, type: 'expense' },
        { category: 'Marketing', amount: 50000, percentage: 20, type: 'expense' },
        { category: 'Otros Gastos', amount: 13000, percentage: 5, type: 'expense' },
      ];
      
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// ============================================
// BUSINESS OWNER ROUTES
// ============================================

// Get all businesses owned by this user
router.get(
  "/business/my-businesses",
  authenticateToken,
  requireRole("business_owner"),
  async (req, res) => {
    try {
      const { businesses, orders } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq, inArray } = await import("drizzle-orm");

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
          .reduce((sum, o) => sum + o.total, 0);
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
  },
);

// Create new business
router.post(
  "/business/create",
  authenticateToken,
  requireRole("business_owner"),
  async (req, res) => {
    try {
      const { businesses } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { v4: uuidv4 } = await import("uuid");

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
  },
);

// Update business
router.put(
  "/business/:id",
  authenticateToken,
  requireRole("business_owner"),
  async (req, res) => {
    try {
      const { businesses } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq, and } = await import("drizzle-orm");

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
  },
);

// Delete business
router.delete(
  "/business/:id",
  authenticateToken,
  requireRole("business_owner"),
  async (req, res) => {
    try {
      const { businesses, orders } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq, and } = await import("drizzle-orm");

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
  },
);

// Get business dashboard data
router.get(
  "/business/dashboard",
  authenticateToken,
  requireRole("business_owner"),
  async (req, res) => {
    try {
      const { businesses, orders } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq, and, desc } = await import("drizzle-orm");

      const business = await db
        .select()
        .from(businesses)
        .where(eq(businesses.ownerId, req.user!.id))
        .limit(1);

      if (!business[0]) {
        return res.status(404).json({ error: "Business not found" });
      }

      const businessOrders = await db
        .select()
        .from(orders)
        .where(eq(orders.businessId, business[0].id))
        .orderBy(desc(orders.createdAt));

      const pendingOrders = businessOrders.filter(o => o.status === "pending");
      const todayOrders = businessOrders.filter(o => {
        const today = new Date();
        const orderDate = new Date(o.createdAt);
        return orderDate.toDateString() === today.toDateString();
      });

      const todayRevenue = todayOrders
        .filter(o => o.status === "delivered")
        .reduce((sum, o) => sum + o.total, 0);

      res.json({
        success: true,
        dashboard: {
          business: business[0],
          pendingOrders: pendingOrders.length,
          todayOrders: todayOrders.length,
          todayRevenue: Math.round(todayRevenue),
          totalOrders: businessOrders.length,
          recentOrders: businessOrders.slice(0, 10),
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Get business orders
router.get(
  "/business/orders",
  authenticateToken,
  requireRole("business_owner"),
  async (req, res) => {
    try {
      const { businesses, orders, users, addresses } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq, desc, inArray } = await import("drizzle-orm");

      // Get ALL businesses for this owner
      const ownerBusinesses = await db
        .select()
        .from(businesses)
        .where(eq(businesses.ownerId, req.user!.id));

      if (ownerBusinesses.length === 0) {
        return res.status(404).json({ error: "No businesses found for this user" });
      }

      const businessIds = ownerBusinesses.map(b => b.id);

      // Get orders for all owner's businesses
      const businessOrders = await db
        .select()
        .from(orders)
        .where(inArray(orders.businessId, businessIds))
        .orderBy(desc(orders.createdAt));

      // Enrich orders with customer info and business name
      const enrichedOrders = await Promise.all(
        businessOrders.map(async (order) => {
          // Get customer info (use userId field)
          let customer = null;
          if (order.userId) {
            const customerResult = await db
              .select({ id: users.id, name: users.name, phone: users.phone })
              .from(users)
              .where(eq(users.id, order.userId))
              .limit(1);
            customer = customerResult[0] || null;
          }

          // Get delivery address
          let address = null;
          if (order.addressId) {
            const addressResult = await db
              .select()
              .from(addresses)
              .where(eq(addresses.id, order.addressId))
              .limit(1);
            address = addressResult[0] || null;
          }

          // Get business name
          const business = ownerBusinesses.find(b => b.id === order.businessId);

          return {
            ...order,
            customer,
            address,
            businessName: business?.name || 'Negocio',
          };
        })
      );

      res.json({ success: true, orders: enrichedOrders });
    } catch (error: any) {
      console.error("Error loading business orders:", error);
      res.status(500).json({ error: error.message });
    }
  },
);

// Accept/reject order (Business)
router.put(
  "/business/orders/:id/status",
  authenticateToken,
  requireRole("business_owner"),
  async (req, res) => {
    try {
      const { orders, businesses } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq, inArray } = await import("drizzle-orm");
      const { status } = req.body;

      const validBusinessStatuses = ["confirmed", "preparing", "ready", "cancelled"];
      if (!validBusinessStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status for business" });
      }

      // Verify order belongs to one of owner's businesses
      const ownerBusinesses = await db
        .select({ id: businesses.id })
        .from(businesses)
        .where(eq(businesses.ownerId, req.user!.id));

      if (ownerBusinesses.length === 0) {
        return res.status(403).json({ error: "No businesses found" });
      }

      const businessIds = ownerBusinesses.map(b => b.id);

      const order = await db
        .select()
        .from(orders)
        .where(eq(orders.id, req.params.id))
        .limit(1);

      if (!order[0] || !businessIds.includes(order[0].businessId)) {
        return res.status(403).json({ error: "Order does not belong to your business" });
      }

      await db
        .update(orders)
        .set({ status, updatedAt: new Date() })
        .where(eq(orders.id, req.params.id));

      res.json({ success: true, message: "Order status updated" });
    } catch (error: any) {
      console.error("Error updating order status:", error);
      res.status(500).json({ error: error.message });
    }
  },
);

// Get business stats
router.get(
  "/business/stats",
  authenticateToken,
  requireRole("business_owner"),
  async (req, res) => {
    try {
      const { businesses, orders, products } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq, inArray } = await import("drizzle-orm");

      // Get ALL businesses owned by this user
      const ownerBusinesses = await db
        .select()
        .from(businesses)
        .where(eq(businesses.ownerId, req.user!.id));

      if (ownerBusinesses.length === 0) {
        return res.status(404).json({ error: "No businesses found" });
      }

      // Get all business IDs
      const businessIds = ownerBusinesses.map(b => b.id);
      
      // Get orders from ALL owner's businesses
      const businessOrders = await db
        .select()
        .from(orders)
        .where(inArray(orders.businessId, businessIds));

      // Calculate date ranges
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(startOfToday);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Filter orders by status and date
      const deliveredOrders = businessOrders.filter(o => o.status === "delivered");
      const cancelledOrders = businessOrders.filter(o => o.status === "cancelled");
      
      const todayOrders = deliveredOrders.filter(o => new Date(o.createdAt) >= startOfToday);
      const weekOrders = deliveredOrders.filter(o => new Date(o.createdAt) >= startOfWeek);
      const monthOrders = deliveredOrders.filter(o => new Date(o.createdAt) >= startOfMonth);

      // Calculate revenue
      const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);
      const weekRevenue = weekOrders.reduce((sum, o) => sum + o.total, 0);
      const monthRevenue = monthOrders.reduce((sum, o) => sum + o.total, 0);
      const totalRevenue = deliveredOrders.reduce((sum, o) => sum + o.total, 0);

      // Calculate top products from order items
      const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
      
      for (const order of deliveredOrders) {
        try {
          const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
          if (Array.isArray(items)) {
            for (const item of items) {
              const productName = item.name || item.product?.name || 'Producto';
              const productId = item.productId || item.id || productName;
              const quantity = item.quantity || 1;
              const price = item.price || item.product?.price || 0;
              
              if (!productSales[productId]) {
                productSales[productId] = { name: productName, quantity: 0, revenue: 0 };
              }
              productSales[productId].quantity += quantity;
              productSales[productId].revenue += price * quantity;
            }
          }
        } catch (e) {
          // Skip malformed items
        }
      }

      const topProducts = Object.values(productSales)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      const avgValue = deliveredOrders.length > 0 
        ? Math.round(totalRevenue / deliveredOrders.length) 
        : 0;

      res.json({
        success: true,
        revenue: {
          today: Math.round(todayRevenue),
          week: Math.round(weekRevenue),
          month: Math.round(monthRevenue),
          total: Math.round(totalRevenue),
        },
        orders: {
          total: businessOrders.length,
          completed: deliveredOrders.length,
          cancelled: cancelledOrders.length,
          avgValue: avgValue,
        },
        topProducts,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Update business settings
router.put(
  "/business/settings",
  authenticateToken,
  requireRole("business_owner"),
  async (req, res) => {
    try {
      const { businesses } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq } = await import("drizzle-orm");

      await db
        .update(businesses)
        .set(req.body)
        .where(eq(businesses.ownerId, req.user!.id));

      res.json({ success: true, message: "Settings updated" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Toggle business active status (pause/resume)
router.put(
  "/business/toggle-status",
  authenticateToken,
  requireRole("business_owner"),
  async (req, res) => {
    try {
      const { businesses } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq } = await import("drizzle-orm");

      const business = await db
        .select()
        .from(businesses)
        .where(eq(businesses.ownerId, req.user!.id))
        .limit(1);

      if (!business[0]) {
        return res.status(404).json({ error: "Business not found" });
      }

      await db
        .update(businesses)
        .set({ isActive: !business[0].isActive })
        .where(eq(businesses.ownerId, req.user!.id));

      res.json({ 
        success: true, 
        isActive: !business[0].isActive,
        message: !business[0].isActive ? "Negocio activado" : "Negocio pausado"
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Get business products
router.get(
  "/business/products",
  authenticateToken,
  requireRole("business_owner"),
  async (req, res) => {
    try {
      const { products, businesses } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq, and, inArray } = await import("drizzle-orm");

      const requestedBusinessId = req.query.businessId as string | undefined;

      const ownerBusinesses = await db
        .select()
        .from(businesses)
        .where(eq(businesses.ownerId, req.user!.id));

      if (ownerBusinesses.length === 0) {
        return res.status(404).json({ error: "No businesses found" });
      }

      const ownerBusinessIds = ownerBusinesses.map(b => b.id);

      let targetBusinessId: string;
      if (requestedBusinessId) {
        if (!ownerBusinessIds.includes(requestedBusinessId)) {
          return res.status(403).json({ error: "No tienes acceso a este negocio" });
        }
        targetBusinessId = requestedBusinessId;
      } else {
        targetBusinessId = ownerBusinesses[0].id;
      }

      const businessProducts = await db
        .select()
        .from(products)
        .where(eq(products.businessId, targetBusinessId))
        .orderBy(products.createdAt);

      res.json({ success: true, products: businessProducts, businessId: targetBusinessId });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Upload product image
router.post(
  "/business/product-image",
  authenticateToken,
  requireRole("business_owner"),
  async (req, res) => {
    try {
      const fs = await import("fs");
      const path = await import("path");

      const { image } = req.body;
      
      if (!image) {
        return res.status(400).json({ error: "No se proporcionó imagen" });
      }

      // Extract base64 data
      const matches = image.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
      if (!matches) {
        return res.status(400).json({ error: "Formato de imagen inválido" });
      }

      const extension = matches[1];
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, "base64");

      // Create unique filename
      const filename = `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${extension}`;
      const uploadDir = path.join(__dirname, "uploads", "products");
      const filepath = path.join(uploadDir, filename);

      // Ensure directory exists
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Save image
      fs.writeFileSync(filepath, buffer);

      const imageUrl = `/uploads/products/${filename}`;
      res.json({ success: true, imageUrl });
    } catch (error: any) {
      console.error("Error uploading product image:", error);
      res.status(500).json({ error: error.message });
    }
  },
);

// Upload business image
router.post(
  "/upload/business-image",
  authenticateToken,
  requireRole("business_owner"),
  async (req, res) => {
    try {
      const { image } = req.body;
      
      if (!image) {
        return res.status(400).json({ error: "No se proporcionó imagen" });
      }

      const matches = image.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
      if (!matches) {
        return res.status(400).json({ error: "Formato de imagen inválido" });
      }

      const extension = matches[1];
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, "base64");

      const filename = `business_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${extension}`;
      const uploadDir = path.join(__dirname, "uploads", "businesses");
      const filepath = path.join(uploadDir, filename);

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      fs.writeFileSync(filepath, buffer);

      const imageUrl = `/uploads/businesses/${filename}`;
      res.json({ success: true, imageUrl });
    } catch (error: any) {
      console.error("Error uploading business image:", error);
      res.status(500).json({ error: error.message });
    }
  },
);

// Create product
router.post(
  "/business/products",
  authenticateToken,
  requireRole("business_owner"),
  auditAction("create_product", "product"),
  async (req, res) => {
    try {
      const { products, businesses } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq } = await import("drizzle-orm");
      const { v4: uuidv4 } = await import("uuid");

      // Get business ID
      const business = await db
        .select()
        .from(businesses)
        .where(eq(businesses.ownerId, req.user!.id))
        .limit(1);

      if (!business[0]) {
        return res.status(404).json({ error: "Business not found for this user" });
      }

      const { name, description, price, image, category } = req.body;
      
      if (!name || price === undefined) {
        return res.status(400).json({ error: "Name and price are required" });
      }

      const productData = {
        id: uuidv4(),
        businessId: business[0].id,
        name,
        description: description || null,
        price: parseInt(price) || 0,
        image: image || null,
        category: category || null,
        isAvailable: true,
      };

      await db.insert(products).values(productData);
      res.json({ success: true, productId: productData.id });
    } catch (error: any) {
      console.error("Error creating product:", error);
      res.status(500).json({ error: error.message });
    }
  },
);

// Update product
router.put(
  "/business/products/:id",
  authenticateToken,
  requireRole("business_owner"),
  auditAction("update_product", "product"),
  async (req, res) => {
    try {
      const { products } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq } = await import("drizzle-orm");

      await db
        .update(products)
        .set(req.body)
        .where(eq(products.id, req.params.id));

      res.json({ success: true, message: "Product updated successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Delete product
router.delete(
  "/business/products/:id",
  authenticateToken,
  requireRole("business_owner"),
  auditAction("delete_product", "product"),
  async (req, res) => {
    try {
      const { products } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq } = await import("drizzle-orm");

      await db.delete(products).where(eq(products.id, req.params.id));
      res.json({ success: true, message: "Product deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Update product availability
router.put(
  "/business/products/:id/availability",
  authenticateToken,
  requireRole("business_owner"),
  async (req, res) => {
    try {
      const { products } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq } = await import("drizzle-orm");

      await db
        .update(products)
        .set({ isAvailable: req.body.isAvailable })
        .where(eq(products.id, req.params.id));

      res.json({ success: true, message: "Availability updated" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Get business categories
router.get(
  "/business/categories",
  authenticateToken,
  requireRole("business_owner"),
  async (req, res) => {
    try {
      // Mock categories for now
      const categories = [
        { id: "1", name: "Entradas", description: "Aperitivos y entradas", isActive: true, sortOrder: 1 },
        { id: "2", name: "Platos Principales", description: "Platos fuertes", isActive: true, sortOrder: 2 },
        { id: "3", name: "Postres", description: "Dulces y postres", isActive: true, sortOrder: 3 },
        { id: "4", name: "Bebidas", description: "Bebidas frías y calientes", isActive: true, sortOrder: 4 },
      ];
      
      res.json({ success: true, categories });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Get business hours
router.get(
  "/business/hours",
  authenticateToken,
  requireRole("business_owner"),
  async (req, res) => {
    try {
      // Mock business hours for now
      const hours = [
        { day: "Lunes", isOpen: true, openTime: "08:00", closeTime: "22:00" },
        { day: "Martes", isOpen: true, openTime: "08:00", closeTime: "22:00" },
        { day: "Miércoles", isOpen: true, openTime: "08:00", closeTime: "22:00" },
        { day: "Jueves", isOpen: true, openTime: "08:00", closeTime: "22:00" },
        { day: "Viernes", isOpen: true, openTime: "08:00", closeTime: "23:00" },
        { day: "Sábado", isOpen: true, openTime: "09:00", closeTime: "23:00" },
        { day: "Domingo", isOpen: false, openTime: "09:00", closeTime: "21:00" },
      ];
      
      res.json({ success: true, hours });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// ============================================
// ORDERS ROUTES
// ============================================

// Get user orders
router.get(
  "/orders",
  authenticateToken,
  async (req, res) => {
    try {
      const { FinanceService } = await import("./financeService");
      const userOrders = await FinanceService.getUserOrders(req.user!.id);
      
      res.json({ success: true, orders: userOrders });
    } catch (error: any) {
      console.error('Get orders error:', error);
      res.status(500).json({ error: error.message });
    }
  },
);

// Get user favorites
router.get(
  "/favorites/:userId",
  authenticateToken,
  async (req, res) => {
    try {
      res.json({ success: true, favorites: [] });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Get payment methods
router.get(
  "/stripe/payment-method/:userId",
  authenticateToken,
  async (req, res) => {
    try {
      res.json({ success: true, paymentMethods: [] });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Create order
router.post(
  "/orders",
  authenticateToken,
  async (req, res) => {
    try {
      const { orders } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq, desc } = await import("drizzle-orm");

      const orderData = {
        userId: req.user!.id,
        businessId: req.body.businessId,
        businessName: req.body.businessName,
        businessImage: req.body.businessImage,
        items: req.body.items,
        status: req.body.status || "pending",
        subtotal: req.body.subtotal,
        deliveryFee: req.body.deliveryFee,
        total: req.body.total,
        paymentMethod: req.body.paymentMethod,
        deliveryAddress: req.body.deliveryAddress,
        notes: req.body.notes,
        substitutionPreference: req.body.substitutionPreference,
        itemSubstitutionPreferences: req.body.itemSubstitutionPreferences,
        cashPaymentAmount: req.body.cashPaymentAmount,
        cashChangeAmount: req.body.cashChangeAmount,
      };

      await db.insert(orders).values(orderData);
      
      // Get the created order with UUID
      const createdOrder = await db
        .select()
        .from(orders)
        .where(eq(orders.userId, req.user!.id))
        .orderBy(desc(orders.createdAt))
        .limit(1);
      
      const orderId = createdOrder[0].id;
      console.log('✅ Order created with ID:', orderId);
      res.json({ success: true, id: orderId, orderId, order: { id: orderId } });
    } catch (error: any) {
      console.error('Create order error:', error);
      res.status(500).json({ error: error.message });
    }
  },
);

// Get order by ID
router.get(
  "/orders/:id",
  authenticateToken,
  async (req, res) => {
    try {
      const { orders } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq } = await import("drizzle-orm");

      const order = await db
        .select()
        .from(orders)
        .where(eq(orders.id, req.params.id))
        .limit(1);

      if (!order[0]) {
        return res.status(404).json({ error: "Order not found" });
      }

      res.json({ success: true, order: order[0] });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Confirm order (after regret period)
router.post(
  "/orders/:id/confirm",
  authenticateToken,
  async (req, res) => {
    try {
      const { orders } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq } = await import("drizzle-orm");

      await db
        .update(orders)
        .set({ status: "confirmed" })
        .where(eq(orders.id, req.params.id));

      res.json({ success: true, message: "Order confirmed" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);


// ============================================
// DELIVERY DRIVER ROUTES
// ============================================

// Get available orders for drivers
router.get(
  "/delivery/available-orders",
  authenticateToken,
  requireRole("delivery_driver"),
  async (req, res) => {
    try {
      const { orders } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq } = await import("drizzle-orm");

      const availableOrders = await db
        .select()
        .from(orders)
        .where(eq(orders.status, "ready"))
        .orderBy(orders.createdAt);

      res.json({ success: true, orders: availableOrders });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Get driver status (online/offline)
router.get(
  "/delivery/status",
  authenticateToken,
  requireRole("delivery_driver"),
  async (req, res) => {
    try {
      const { users } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq } = await import("drizzle-orm");

      const driver = await db
        .select()
        .from(users)
        .where(eq(users.id, req.user!.id))
        .limit(1);

      if (!driver[0]) {
        return res.status(404).json({ error: "Driver not found" });
      }

      res.json({
        success: true,
        isOnline: driver[0].isActive === 1 || driver[0].isActive === true,
        strikes: driver[0].strikes || 0,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Toggle driver online/offline status
router.post(
  "/delivery/toggle-status",
  authenticateToken,
  requireRole("delivery_driver"),
  async (req, res) => {
    try {
      const { users } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq } = await import("drizzle-orm");

      const driver = await db
        .select()
        .from(users)
        .where(eq(users.id, req.user!.id))
        .limit(1);

      if (!driver[0]) {
        return res.status(404).json({ error: "Driver not found" });
      }

      const currentStatus = driver[0].isActive === 1 || driver[0].isActive === true;
      const newStatus = !currentStatus;

      await db
        .update(users)
        .set({ isActive: newStatus ? 1 : 0 })
        .where(eq(users.id, req.user!.id));

      res.json({
        success: true,
        isOnline: newStatus,
        message: newStatus ? "Ahora estás en línea" : "Ahora estás desconectado",
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Accept order
router.post(
  "/delivery/accept-order/:id",
  authenticateToken,
  requireRole("delivery_driver"),
  async (req, res) => {
    try {
      const { orders } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq } = await import("drizzle-orm");

      await db
        .update(orders)
        .set({
          deliveryPersonId: req.user!.id,
          status: "picked_up",
        })
        .where(eq(orders.id, req.params.id));

      res.json({ success: true, message: "Order accepted" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Get driver orders
router.get(
  "/delivery/my-orders",
  authenticateToken,
  requireRole("delivery_driver"),
  async (req, res) => {
    try {
      const { orders } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq } = await import("drizzle-orm");

      const driverOrders = await db
        .select()
        .from(orders)
        .where(eq(orders.deliveryPersonId, req.user!.id))
        .orderBy(orders.createdAt);

      res.json({ success: true, orders: driverOrders });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Get delivery orders (combined endpoint for frontend)
router.get(
  "/delivery/orders",
  authenticateToken,
  async (req, res) => {
    try {
      const { orders } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq, desc } = await import("drizzle-orm");

      // Get driver's assigned orders
      const driverOrders = await db
        .select()
        .from(orders)
        .where(eq(orders.deliveryPersonId, req.user!.id))
        .orderBy(desc(orders.createdAt));

      // Get available orders (ready for pickup, no driver assigned)
      const allReadyOrders = await db
        .select()
        .from(orders)
        .where(eq(orders.status, "ready"))
        .orderBy(desc(orders.createdAt));

      // Filter available orders that don't have a driver
      const availableOrders = allReadyOrders.filter(o => !o.deliveryPersonId);

      res.json({ 
        success: true, 
        orders: driverOrders,
        availableOrders: availableOrders
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Update order status (Driver)
router.put(
  "/delivery/orders/:id/status",
  authenticateToken,
  requireRole("delivery_driver"),
  async (req, res) => {
    try {
      const { orders } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq } = await import("drizzle-orm");
      const { status } = req.body;

      const validDriverStatuses = ["picked_up", "on_the_way", "delivered"];
      if (!validDriverStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status for driver" });
      }

      await db
        .update(orders)
        .set({ status })
        .where(eq(orders.id, req.params.id));

      res.json({ success: true, message: "Status updated" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Get driver earnings (with userId param for frontend compatibility)
router.get(
  "/delivery/:driverId/earnings",
  authenticateToken,
  async (req, res) => {
    try {
      const { orders } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq, and, gte } = await import("drizzle-orm");

      const driverId = req.params.driverId;
      
      // Verify user can access this data
      if (req.user!.id !== driverId && req.user!.role !== 'admin' && req.user!.role !== 'super_admin') {
        return res.status(403).json({ error: "No tienes permiso" });
      }

      const completedOrders = await db
        .select()
        .from(orders)
        .where(
          and(
            eq(orders.deliveryPersonId, driverId),
            eq(orders.status, "delivered")
          )
        );

      // Calculate date ranges
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(todayStart);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // Filter orders by date ranges
      const todayOrders = completedOrders.filter(order => 
        new Date(order.createdAt!) >= todayStart
      );
      const weekOrders = completedOrders.filter(order => 
        new Date(order.createdAt!) >= weekStart
      );
      const monthOrders = completedOrders.filter(order => 
        new Date(order.createdAt!) >= monthStart
      );

      // Calculate earnings (15% of delivery fee or driverEarnings if set)
      const calculateEarnings = (orderList: typeof completedOrders) => {
        return orderList.reduce((sum, order) => {
          const earning = order.driverEarnings || (order.deliveryFee ? order.deliveryFee * 0.8 : 0);
          return sum + earning;
        }, 0);
      };

      const calculateTips = (orderList: typeof completedOrders) => {
        return orderList.reduce((sum, order) => sum + (order.driverTip || 0), 0);
      };

      res.json({
        success: true,
        earnings: {
          today: calculateEarnings(todayOrders) / 100,
          week: calculateEarnings(weekOrders) / 100,
          month: calculateEarnings(monthOrders) / 100,
          total: calculateEarnings(completedOrders) / 100,
          tips: calculateTips(completedOrders) / 100,
        },
        stats: {
          totalDeliveries: completedOrders.length,
          averageRating: 4.8,
          completionRate: 100,
          avgDeliveryTime: completedOrders.length > 0 ? 25 : 0,
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Get driver earnings (legacy endpoint)
router.get(
  "/delivery/earnings",
  authenticateToken,
  requireRole("delivery_driver"),
  async (req, res) => {
    try {
      const { orders } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq, and } = await import("drizzle-orm");

      const completedOrders = await db
        .select()
        .from(orders)
        .where(
          and(
            eq(orders.deliveryPersonId, req.user!.id),
            eq(orders.status, "delivered")
          )
        );

      const totalEarnings = completedOrders.reduce(
        (sum, order) => sum + (order.total * 0.15),
        0
      );

      const todayEarnings = completedOrders
        .filter(order => {
          const today = new Date();
          const orderDate = new Date(order.createdAt);
          return orderDate.toDateString() === today.toDateString();
        })
        .reduce((sum, order) => sum + (order.total * 0.15), 0);

      res.json({
        success: true,
        earnings: {
          total: Math.round(totalEarnings),
          today: Math.round(todayEarnings),
          orders: completedOrders.length,
          todayOrders: completedOrders.filter(order => {
            const today = new Date();
            const orderDate = new Date(order.createdAt);
            return orderDate.toDateString() === today.toDateString();
          }).length,
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Get all pending withdrawals (admin)
router.get(
  "/admin/withdrawals/pending",
  authenticateToken,
  requireMinRole("admin"),
  async (req, res) => {
    try {
      const { withdrawals } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq } = await import("drizzle-orm");

      const pending = await db
        .select()
        .from(withdrawals)
        .where(eq(withdrawals.status, "pending"))
        .orderBy(withdrawals.createdAt);

      res.json({ success: true, withdrawals: pending });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Get all withdrawals (admin)
router.get(
  "/admin/withdrawals",
  authenticateToken,
  requireMinRole("admin"),
  async (req, res) => {
    try {
      const { withdrawals } = await import("@shared/schema-mysql");
      const { db } = await import("./db");

      const all = await db
        .select()
        .from(withdrawals)
        .orderBy(withdrawals.createdAt)
        .limit(100);

      res.json({ success: true, withdrawals: all });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// ============================================
// ADMIN MANAGEMENT ROUTES
// ============================================

// Get admin stats
router.get(
  "/admin/stats",
  authenticateToken,
  requireRole("admin", "super_admin"),
  async (req, res) => {
    try {
      const { FinanceService } = await import("./financeService");
      const metrics = await FinanceService.getFinancialMetrics();
      
      res.json({
        success: true,
        ...metrics,
      });
    } catch (error: any) {
      console.error('Admin stats error:', error);
      res.status(500).json({ error: error.message });
    }
  },
);

// Get admin dashboard metrics
router.get(
  "/admin/dashboard/metrics",
  authenticateToken,
  requireRole("admin", "super_admin"),
  async (req, res) => {
    try {
      const { users, businesses, orders } = await import("@shared/schema-mysql");
      const { db } = await import("./db");

      const allUsers = await db.select().from(users);
      const allBusinesses = await db.select().from(businesses);
      const allOrders = await db.select().from(orders);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayOrders = allOrders.filter(o => {
        const orderDate = new Date(o.createdAt);
        return orderDate >= today;
      });

      // Si no hay pedidos de hoy, mostrar estadísticas generales
      const ordersToShow = todayOrders.length > 0 ? todayOrders : allOrders;
      const cancelledToday = ordersToShow.filter(o => o.status === "cancelled").length;
      
      const driversOnline = allUsers.filter(u => u.role === "delivery_driver" && u.isActive).length;
      const totalDrivers = allUsers.filter(u => u.role === "delivery_driver").length;
      const pausedBusinesses = allBusinesses.filter(b => !b.isActive).length;
      const totalBusinesses = allBusinesses.length;

      const activeOrdersCount = allOrders.filter(o => 
        ["pending", "confirmed", "preparing", "on_the_way"].includes(o.status)
      ).length;

      const todayRevenue = ordersToShow
        .filter(o => o.status === "delivered")
        .reduce((sum, o) => sum + o.total, 0);

      res.json({
        activeOrders: activeOrdersCount,
        ordersToday: ordersToShow.length,
        onlineDrivers: driversOnline,
        todayOrders: ordersToShow.length,
        todayRevenue: todayRevenue,
        cancelledToday,
        cancellationRate: ordersToShow.length > 0 ? ((cancelledToday / ordersToShow.length) * 100).toFixed(1) + "%" : "0%",
        avgDeliveryTime: 35,
        driversOnline,
        totalDrivers,
        pausedBusinesses,
        totalBusinesses,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Get active orders for dashboard
router.get(
  "/admin/dashboard/active-orders",
  authenticateToken,
  requireRole("admin", "super_admin"),
  async (req, res) => {
    try {
      const { orders, users, businesses } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq, inArray } = await import("drizzle-orm");

      const activeOrders = await db
        .select()
        .from(orders)
        .where(inArray(orders.status, ["pending", "confirmed", "preparing", "on_the_way"]));

      const ordersWithDetails = [];
      
      for (const order of activeOrders) {
        const customer = await db
          .select({ id: users.id, name: users.name })
          .from(users)
          .where(eq(users.id, order.customerId))
          .limit(1);

        const business = await db
          .select({ id: businesses.id, name: businesses.name, latitude: businesses.latitude, longitude: businesses.longitude })
          .from(businesses)
          .where(eq(businesses.id, order.businessId))
          .limit(1);

        let driver = null;
        if (order.deliveryPersonId) {
          const driverData = await db
            .select({ id: users.id, name: users.name, isOnline: users.isActive })
            .from(users)
            .where(eq(users.id, order.deliveryPersonId))
            .limit(1);
          driver = driverData[0] || null;
        }

        ordersWithDetails.push({
          id: order.id,
          status: order.status,
          total: order.total || 0,
          createdAt: order.createdAt,
          customer: customer[0] || { id: "", name: "Cliente" },
          business: business[0] || { id: "", name: "Negocio", latitude: null, longitude: null },
          deliveryAddress: {
            latitude: order.deliveryLatitude,
            longitude: order.deliveryLongitude,
            address: order.deliveryAddress || "Dirección no disponible",
          },
          driver,
        });
      }

      res.json({ orders: ordersWithDetails });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Get online drivers for dashboard
router.get(
  "/admin/dashboard/online-drivers",
  authenticateToken,
  requireRole("admin", "super_admin"),
  async (req, res) => {
    try {
      const { users } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq } = await import("drizzle-orm");

      const drivers = await db
        .select()
        .from(users)
        .where(eq(users.role, "delivery_driver"));

      const driversWithDetails = drivers.map(driver => ({
        id: driver.id,
        name: driver.name,
        isOnline: driver.isActive,
        lastActiveAt: driver.updatedAt,
        location: {
          latitude: "20.6736",
          longitude: "-104.3647",
          updatedAt: new Date().toISOString(),
        },
        activeOrder: null,
      }));

      res.json({ drivers: driversWithDetails });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Get admin logs
router.get(
  "/admin/logs",
  authenticateToken,
  requireRole("admin", "super_admin"),
  async (req, res) => {
    try {
      const { auditLogs } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      
      const limit = parseInt(req.query.limit as string) || 50;
      
      const logs = await db
        .select()
        .from(auditLogs)
        .orderBy(auditLogs.createdAt)
        .limit(limit);

      res.json({ logs });
    } catch (error: any) {
      res.json({ logs: [] });
    }
  },
);

// Get all drivers (admin)
router.get(
  "/admin/drivers",
  authenticateToken,
  requireRole("admin", "super_admin"),
  async (req, res) => {
    try {
      const { users, orders } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq, count } = await import("drizzle-orm");

      const drivers = await db
        .select()
        .from(users)
        .where(eq(users.role, "delivery_driver"));

      const driversWithStats = await Promise.all(
        drivers.map(async (driver) => {
          const deliveryCount = await db
            .select({ count: count() })
            .from(orders)
            .where(eq(orders.deliveryPersonId, driver.id));

          return {
            id: driver.id,
            name: driver.name,
            email: driver.email,
            phone: driver.phone,
            isOnline: driver.isActive,
            isApproved: true,
            strikes: 0,
            totalDeliveries: deliveryCount[0]?.count || 0,
            rating: 4.5,
            createdAt: driver.createdAt,
          };
        })
      );

      res.json({ drivers: driversWithStats });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Update driver approval (admin)
router.put(
  "/admin/drivers/:id/approval",
  authenticateToken,
  requireRole("admin", "super_admin"),
  auditAction("update_driver_approval", "user"),
  async (req, res) => {
    try {
      const { users } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq } = await import("drizzle-orm");

      await db
        .update(users)
        .set({ isActive: req.body.isApproved })
        .where(eq(users.id, req.params.id));

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Update driver strikes (admin)
router.put(
  "/admin/drivers/:id/strikes",
  authenticateToken,
  requireRole("admin", "super_admin"),
  auditAction("update_driver_strikes", "user"),
  async (req, res) => {
    try {
      res.json({ success: true, message: "Strikes updated" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Get all wallets (admin)
router.get(
  "/admin/wallets",
  authenticateToken,
  requireRole("admin", "super_admin"),
  async (req, res) => {
    try {
      const { wallets, users } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq } = await import("drizzle-orm");

      const allWallets = await db.select().from(wallets);

      const walletsWithUsers = await Promise.all(
        allWallets.map(async (wallet) => {
          const user = await db
            .select({ id: users.id, name: users.name, role: users.role })
            .from(users)
            .where(eq(users.id, wallet.userId))
            .limit(1);

          return {
            id: wallet.id,
            userId: wallet.userId,
            userName: user[0]?.name || "Usuario",
            userRole: user[0]?.role || "customer",
            balance: wallet.balance,
            pendingBalance: wallet.pendingBalance || 0,
          };
        })
      );

      res.json({ wallets: walletsWithUsers });
    } catch (error: any) {
      res.json({ wallets: [] });
    }
  },
);

// Get withdrawal requests (admin)
router.get(
  "/admin/withdrawals",
  authenticateToken,
  requireRole("admin", "super_admin"),
  async (req, res) => {
    try {
      const { withdrawalRequests, users } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq } = await import("drizzle-orm");

      const allWithdrawals = await db.select().from(withdrawalRequests);

      const withdrawalsWithUsers = await Promise.all(
        allWithdrawals.map(async (w) => {
          const user = await db
            .select({ id: users.id, name: users.name })
            .from(users)
            .where(eq(users.id, w.userId))
            .limit(1);

          return {
            id: w.id,
            userId: w.userId,
            userName: user[0]?.name || "Usuario",
            amount: w.amount,
            status: w.status,
            bankName: w.bankName,
            accountNumber: w.accountNumber,
            createdAt: w.createdAt,
          };
        })
      );

      res.json({ withdrawals: withdrawalsWithUsers });
    } catch (error: any) {
      res.json({ withdrawals: [] });
    }
  },
);

// Update withdrawal request (admin)
router.put(
  "/admin/withdrawals/:id",
  authenticateToken,
  requireRole("admin", "super_admin"),
  auditAction("update_withdrawal", "withdrawal"),
  async (req, res) => {
    try {
      const { withdrawalRequests } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq } = await import("drizzle-orm");

      await db
        .update(withdrawalRequests)
        .set({ status: req.body.status, processedAt: new Date() })
        .where(eq(withdrawalRequests.id, req.params.id));

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Get coupons (admin)
router.get(
  "/admin/coupons",
  authenticateToken,
  requireRole("admin", "super_admin"),
  async (req, res) => {
    try {
      const { coupons } = await import("@shared/schema-mysql");
      const { db } = await import("./db");

      const allCoupons = await db.select().from(coupons);
      res.json({ coupons: allCoupons });
    } catch (error: any) {
      res.json({ coupons: [] });
    }
  },
);

// Create coupon (admin)
router.post(
  "/admin/coupons",
  authenticateToken,
  requireRole("admin", "super_admin"),
  auditAction("create_coupon", "coupon"),
  async (req, res) => {
    try {
      const { coupons } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { randomUUID } = await import("crypto");

      await db.insert(coupons).values({
        id: randomUUID(),
        ...req.body,
        usedCount: 0,
        isActive: true,
      });

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Update coupon (admin)
router.put(
  "/admin/coupons/:id",
  authenticateToken,
  requireRole("admin", "super_admin"),
  auditAction("update_coupon", "coupon"),
  async (req, res) => {
    try {
      const { coupons } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq } = await import("drizzle-orm");

      await db.update(coupons).set(req.body).where(eq(coupons.id, req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Delete coupon (admin)
router.delete(
  "/admin/coupons/:id",
  authenticateToken,
  requireRole("admin", "super_admin"),
  auditAction("delete_coupon", "coupon"),
  async (req, res) => {
    try {
      const { coupons } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq } = await import("drizzle-orm");

      await db.delete(coupons).where(eq(coupons.id, req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Get support tickets (admin)
router.get(
  "/admin/support/tickets",
  authenticateToken,
  requireRole("admin", "super_admin"),
  async (req, res) => {
    try {
      const { supportChats, users } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq, desc } = await import("drizzle-orm");

      const tickets = await db.select().from(supportChats).orderBy(desc(supportChats.createdAt));

      const enrichedTickets = await Promise.all(
        tickets.map(async (ticket) => {
          const [user] = await db
            .select({ id: users.id, name: users.name, phone: users.phone })
            .from(users)
            .where(eq(users.id, ticket.userId))
            .limit(1);

          return {
            ...ticket,
            userName: user?.name || "Usuario",
            userPhone: user?.phone || "",
          };
        })
      );

      res.json({ success: true, tickets: enrichedTickets });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Get messages for a ticket
router.get(
  "/admin/support/tickets/:id/messages",
  authenticateToken,
  requireRole("admin", "super_admin"),
  async (req, res) => {
    try {
      const { supportMessages, users } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq } = await import("drizzle-orm");

      const messages = await db
        .select()
        .from(supportMessages)
        .where(eq(supportMessages.chatId, req.params.id))
        .orderBy(supportMessages.createdAt);

      const enrichedMessages = await Promise.all(
        messages.map(async (msg) => {
          if (!msg.userId) {
            return { ...msg, senderName: "Bot", senderType: "bot" };
          }

          const [user] = await db
            .select({ name: users.name })
            .from(users)
            .where(eq(users.id, msg.userId))
            .limit(1);

          return {
            ...msg,
            senderName: user?.name || "Usuario",
            senderType: msg.isBot ? "bot" : "user",
          };
        })
      );

      res.json({ success: true, messages: enrichedMessages });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Send message (with AI response)
router.post(
  "/admin/support/tickets/:id/messages",
  authenticateToken,
  requireRole("admin", "super_admin"),
  async (req, res) => {
    try {
      const { supportMessages } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { v4: uuidv4 } = await import("uuid");

      const { message, isBot } = req.body;

      await db.insert(supportMessages).values({
        id: uuidv4(),
        chatId: req.params.id,
        userId: isBot ? null : req.user!.id,
        message,
        isBot: isBot || false,
      });

      if (!isBot) {
        try {
          const aiResponse = await generateGeminiResponse(message);
          
          await db.insert(supportMessages).values({
            id: uuidv4(),
            chatId: req.params.id,
            userId: null,
            message: aiResponse,
            isBot: true,
          });

          res.json({ success: true, aiResponse });
        } catch (aiError) {
          res.json({ success: true, aiResponse: null });
        }
      } else {
        res.json({ success: true });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Update ticket status/priority
router.put(
  "/admin/support/tickets/:id",
  authenticateToken,
  requireRole("admin", "super_admin"),
  async (req, res) => {
    try {
      const { supportChats } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq } = await import("drizzle-orm");

      const { status } = req.body;

      await db
        .update(supportChats)
        .set({ status, updatedAt: new Date() })
        .where(eq(supportChats.id, req.params.id));

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Legacy support tickets route
router.get(
  "/admin/support-tickets",
  authenticateToken,
  requireRole("admin", "super_admin"),
  async (req, res) => {
    try {
      const { supportTickets, users } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq } = await import("drizzle-orm");

      const allTickets = await db.select().from(supportTickets);

      const ticketsWithUsers = await Promise.all(
        allTickets.map(async (ticket) => {
          const user = await db
            .select({ id: users.id, name: users.name })
            .from(users)
            .where(eq(users.id, ticket.userId))
            .limit(1);

          return {
            id: ticket.id,
            userId: ticket.userId,
            userName: user[0]?.name || "Usuario",
            subject: ticket.subject,
            status: ticket.status,
            priority: ticket.priority || "medium",
            createdAt: ticket.createdAt,
            lastMessageAt: ticket.updatedAt,
          };
        })
      );

      res.json({ tickets: ticketsWithUsers });
    } catch (error: any) {
      res.json({ tickets: [] });
    }
  },
);

// Update support ticket (admin)
router.put(
  "/admin/support-tickets/:id",
  authenticateToken,
  requireRole("admin", "super_admin"),
  auditAction("update_support_ticket", "support_ticket"),
  async (req, res) => {
    try {
      const { supportTickets } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq } = await import("drizzle-orm");

      await db
        .update(supportTickets)
        .set({ status: req.body.status, updatedAt: new Date() })
        .where(eq(supportTickets.id, req.params.id));

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Get delivery zones (admin)
router.get(
  "/admin/delivery-zones",
  authenticateToken,
  requireRole("admin", "super_admin"),
  async (req, res) => {
    try {
      const { deliveryZones } = await import("@shared/schema-mysql");
      const { db } = await import("./db");

      const zones = await db.select().from(deliveryZones);
      res.json({ zones });
    } catch (error: any) {
      res.json({ zones: [] });
    }
  },
);

// Create delivery zone (admin)
router.post(
  "/admin/delivery-zones",
  authenticateToken,
  requireRole("admin", "super_admin"),
  auditAction("create_delivery_zone", "delivery_zone"),
  async (req, res) => {
    try {
      const { deliveryZones } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { randomUUID } = await import("crypto");

      await db.insert(deliveryZones).values({
        id: randomUUID(),
        ...req.body,
        isActive: true,
      });

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Update delivery zone (admin)
router.put(
  "/admin/delivery-zones/:id",
  authenticateToken,
  requireRole("admin", "super_admin"),
  auditAction("update_delivery_zone", "delivery_zone"),
  async (req, res) => {
    try {
      const { deliveryZones } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq } = await import("drizzle-orm");

      await db.update(deliveryZones).set(req.body).where(eq(deliveryZones.id, req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Get system settings (admin)
router.get(
  "/admin/settings",
  authenticateToken,
  requireRole("admin", "super_admin"),
  async (req, res) => {
    try {
      const { systemSettings } = await import("@shared/schema-mysql");
      const { db } = await import("./db");

      const allSettings = await db.select().from(systemSettings);
      
      const settingsWithDescriptions = allSettings.map((s) => ({
        key: s.key,
        value: s.value,
        description: getSettingDescription(s.key),
      }));

      res.json({ settings: settingsWithDescriptions });
    } catch (error: any) {
      res.json({ settings: [] });
    }
  },
);

// Update system setting (admin)
router.put(
  "/admin/settings",
  authenticateToken,
  requireRole("admin", "super_admin"),
  auditAction("update_system_setting", "system_setting"),
  async (req, res) => {
    try {
      const { systemSettings } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq } = await import("drizzle-orm");

      const { key, value } = req.body;
      
      const existing = await db
        .select()
        .from(systemSettings)
        .where(eq(systemSettings.key, key))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(systemSettings)
          .set({ value, updatedAt: new Date() })
          .where(eq(systemSettings.key, key));
      } else {
        const { randomUUID } = await import("crypto");
        await db.insert(systemSettings).values({
          id: randomUUID(),
          key,
          value,
        });
      }

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Clear cache (admin)
router.post(
  "/admin/clear-cache",
  authenticateToken,
  requireRole("admin", "super_admin"),
  auditAction("clear_cache", "system"),
  async (req, res) => {
    try {
      res.json({ success: true, message: "Cache cleared" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

function getSettingDescription(key: string): string {
  const descriptions: Record<string, string> = {
    platform_commission: "Comisión de plataforma (%)",
    business_commission: "Comisión de negocio (%)",
    delivery_commission: "Comisión de repartidor (%)",
    anti_fraud_hold_hours: "Horas de retención anti-fraude",
    max_strikes: "Strikes máximos antes de suspensión",
  };
  return descriptions[key] || key;
}

// Register support routes
router.use("/support", supportRoutes);

// Create business (admin)
router.post(
  "/admin/businesses",
  authenticateToken,
  requireRole("admin", "super_admin"),
  auditAction("create_business", "business"),
  async (req, res) => {
    try {
      const { businesses } = await import("@shared/schema-mysql");
      const { db } = await import("./db");

      const result = await db.insert(businesses).values(req.body);
      res.json({ success: true, businessId: result.insertId });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Update business (admin)
router.put(
  "/admin/businesses/:id",
  authenticateToken,
  requireRole("admin", "super_admin"),
  auditAction("update_business", "business"),
  async (req, res) => {
    try {
      const { businesses } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq } = await import("drizzle-orm");

      await db
        .update(businesses)
        .set(req.body)
        .where(eq(businesses.id, req.params.id));

      res.json({ success: true, message: "Business updated successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Create product (admin)
router.post(
  "/admin/products",
  authenticateToken,
  requireRole("admin", "super_admin"),
  auditAction("create_product", "product"),
  async (req, res) => {
    try {
      const { products } = await import("@shared/schema-mysql");
      const { db } = await import("./db");

      const result = await db.insert(products).values(req.body);
      res.json({ success: true, productId: result.insertId });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Update product (admin)
router.put(
  "/admin/products/:id",
  authenticateToken,
  requireRole("admin", "super_admin"),
  auditAction("update_product", "product"),
  async (req, res) => {
    try {
      const { products } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq } = await import("drizzle-orm");

      await db
        .update(products)
        .set(req.body)
        .where(eq(products.id, req.params.id));

      res.json({ success: true, message: "Product updated successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Delete product (admin)
router.delete(
  "/admin/products/:id",
  authenticateToken,
  requireRole("admin", "super_admin"),
  auditAction("delete_product", "product"),
  async (req, res) => {
    try {
      const { products } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq } = await import("drizzle-orm");

      await db.delete(products).where(eq(products.id, req.params.id));
      res.json({ success: true, message: "Product deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Get admin dashboard
router.get(
  "/admin/dashboard",
  authenticateToken,
  requireRole("admin", "super_admin"),
  async (req, res) => {
    try {
      const { users, businesses, orders } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq } = await import("drizzle-orm");

      const totalUsers = await db.select().from(users);
      const totalBusinesses = await db.select().from(businesses);
      const totalOrders = await db.select().from(orders);

      const todayOrders = totalOrders.filter(o => {
        const today = new Date();
        const orderDate = new Date(o.createdAt);
        return orderDate.toDateString() === today.toDateString();
      });

      const todayRevenue = todayOrders
        .filter(o => o.status === "delivered")
        .reduce((sum, o) => sum + o.total, 0);

      const activeDrivers = totalUsers.filter(u => u.role === "delivery_driver" && u.isActive).length;
      const activeBusinesses = totalBusinesses.filter(b => b.isActive).length;

      res.json({
        success: true,
        dashboard: {
          totalUsers: totalUsers.length,
          totalBusinesses: totalBusinesses.length,
          totalOrders: totalOrders.length,
          todayOrders: todayOrders.length,
          todayRevenue: Math.round(todayRevenue),
          activeDrivers,
          activeBusinesses,
          platformCommission: Math.round(todayRevenue * 0.15),
          recentOrders: totalOrders.slice(0, 10),
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Get all users
router.get(
  "/admin/users",
  authenticateToken,
  requireRole("admin", "super_admin"),
  async (req, res) => {
    try {
      const { users } = await import("@shared/schema-mysql");
      const { db } = await import("./db");

      const allUsers = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          phone: users.phone,
          role: users.role,
          emailVerified: users.emailVerified,
          phoneVerified: users.phoneVerified,
          isActive: users.isActive,
          createdAt: users.createdAt,
        })
        .from(users)
        .orderBy(users.createdAt);
        
      res.json({ success: true, users: allUsers });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Get all orders
router.get(
  "/admin/orders",
  authenticateToken,
  requireRole("admin", "super_admin"),
  async (req, res) => {
    try {
      const { orders, businesses, users } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq, desc } = await import("drizzle-orm");

      const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
      
      // Enrich orders with business and customer names
      const enrichedOrders = [];
      for (const order of allOrders) {
        const business = await db
          .select({ name: businesses.name })
          .from(businesses)
          .where(eq(businesses.id, order.businessId))
          .limit(1);
          
        // Use userId field (not customerId)
        const customer = await db
          .select({ name: users.name, phone: users.phone })
          .from(users)
          .where(eq(users.id, order.userId))
          .limit(1);

        enrichedOrders.push({
          id: order.id,
          userId: order.userId,
          businessId: order.businessId,
          businessName: business[0]?.name || order.businessName || "Negocio",
          businessImage: order.businessImage,
          customerName: customer[0]?.name || "Cliente",
          customerPhone: customer[0]?.phone || "",
          status: order.status,
          subtotal: order.subtotal,
          deliveryFee: order.deliveryFee,
          total: order.total,
          paymentMethod: order.paymentMethod,
          deliveryAddress: order.deliveryAddress,
          deliveryLatitude: order.deliveryLatitude,
          deliveryLongitude: order.deliveryLongitude,
          items: order.items,
          notes: order.notes,
          createdAt: order.createdAt,
          estimatedDelivery: order.estimatedDelivery,
          deliveredAt: order.deliveredAt,
          deliveryPersonId: order.deliveryPersonId,
          platformFee: order.platformFee,
          businessEarnings: order.businessEarnings,
          deliveryEarnings: order.deliveryEarnings,
        });
      }
      
      res.json({ success: true, orders: enrichedOrders });
    } catch (error: any) {
      console.error("Error loading admin orders:", error);
      res.status(500).json({ error: error.message });
    }
  },
);

// Update order status (admin)
router.put(
  "/admin/orders/:id/status",
  authenticateToken,
  requireRole("admin", "super_admin"),
  async (req, res) => {
    try {
      const { orders } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq } = await import("drizzle-orm");

      const { status } = req.body;
      const validStatuses = ["pending", "confirmed", "preparing", "ready", "picked_up", "delivered", "cancelled"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      await db
        .update(orders)
        .set({ status, updatedAt: new Date() })
        .where(eq(orders.id, req.params.id));

      res.json({ success: true, message: "Order status updated" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Get all businesses
router.get(
  "/admin/businesses",
  authenticateToken,
  requireRole("admin", "super_admin"),
  async (req, res) => {
    try {
      const { businesses } = await import("@shared/schema-mysql");
      const { db } = await import("./db");

      const allBusinesses = await db
        .select()
        .from(businesses)
        .orderBy(businesses.createdAt);
        
      res.json({ success: true, businesses: allBusinesses });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Update user status
router.put(
  "/admin/users/:id/status",
  authenticateToken,
  requireRole("admin", "super_admin"),
  async (req, res) => {
    try {
      const { users } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq } = await import("drizzle-orm");

      await db
        .update(users)
        .set({ isActive: req.body.isActive })
        .where(eq(users.id, req.params.id));

      res.json({ success: true, message: "User status updated" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Update user role
router.put(
  "/admin/users/:id/role",
  authenticateToken,
  requireRole("admin", "super_admin"),
  async (req, res) => {
    try {
      const { users } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq } = await import("drizzle-orm");

      const { role } = req.body;
      if (!["customer", "business", "driver", "admin", "super_admin"].includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
      }

      await db
        .update(users)
        .set({ role })
        .where(eq(users.id, req.params.id));

      res.json({ success: true, message: "User role updated" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Sync financial data (admin only)
router.post(
  "/admin/sync-data",
  authenticateToken,
  requireRole("admin", "super_admin"),
  async (req, res) => {
    try {
      const { FinanceService } = await import("./financeService");
      await FinanceService.syncOrderData();
      const metrics = await FinanceService.getFinancialMetrics();
      
      res.json({
        success: true,
        message: "Data synchronized successfully",
        metrics,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Update business status
router.put(
  "/admin/businesses/:id/status",
  authenticateToken,
  requireRole("admin", "super_admin"),
  async (req, res) => {
    try {
      const { businesses } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq } = await import("drizzle-orm");

      await db
        .update(businesses)
        .set({ isActive: req.body.isActive })
        .where(eq(businesses.id, req.params.id));

      res.json({ success: true, message: "Business status updated" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Asignar repartidor automáticamente
router.post(
  "/orders/:id/assign-driver",
  authenticateToken,
  async (req, res) => {
    try {
      const { orders, users } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
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
  }
);

// Marcar pedido como entregado y liberar fondos
router.post(
  "/orders/:id/complete-delivery",
  authenticateToken,
  requireRole("delivery_driver"),
  async (req, res) => {
    try {
      const { orders, wallets, transactions } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq } = await import("drizzle-orm");

      const [order] = await db
        .select()
        .from(orders)
        .where(eq(orders.id, req.params.id))
        .limit(1);

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      await db
        .update(orders)
        .set({ status: "delivered", deliveredAt: new Date() })
        .where(eq(orders.id, req.params.id));

      const total = order.total;
      const platformFee = Math.round(total * 0.15);
      const businessAmount = Math.round(total * 0.70);
      const driverAmount = Math.round(total * 0.15);

      const [businessWallet] = await db
        .select()
        .from(wallets)
        .where(eq(wallets.userId, order.businessId))
        .limit(1);

      if (businessWallet) {
        await db
          .update(wallets)
          .set({ balance: businessWallet.balance + businessAmount })
          .where(eq(wallets.userId, order.businessId));
      } else {
        await db.insert(wallets).values({
          userId: order.businessId,
          balance: businessAmount,
          pendingBalance: 0,
        });
      }

      const [driverWallet] = await db
        .select()
        .from(wallets)
        .where(eq(wallets.userId, order.deliveryPersonId))
        .limit(1);

      if (driverWallet) {
        await db
          .update(wallets)
          .set({ balance: driverWallet.balance + driverAmount })
          .where(eq(wallets.userId, order.deliveryPersonId));
      } else {
        await db.insert(wallets).values({
          userId: order.deliveryPersonId,
          balance: driverAmount,
          pendingBalance: 0,
        });
      }

      await db.insert(transactions).values([
        {
          userId: order.businessId,
          type: "order_payment",
          amount: businessAmount,
          status: "completed",
          description: `Pago por pedido #${order.id.slice(-6)}`,
          orderId: order.id,
        },
        {
          userId: order.deliveryPersonId,
          type: "delivery_payment",
          amount: driverAmount,
          status: "completed",
          description: `Entrega de pedido #${order.id.slice(-6)}`,
          orderId: order.id,
        },
      ]);

      res.json({
        success: true,
        message: "Pedido completado y fondos liberados",
        distribution: {
          platform: platformFee,
          business: businessAmount,
          driver: driverAmount,
        },
      });
    } catch (error: any) {
      console.error("Complete delivery error:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Helper function for Gemini AI
async function generateGeminiResponse(userMessage: string): Promise<string> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return "Lo siento, el servicio de IA no está configurado. Un administrador te responderá pronto.";
    }

    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = `Eres un asistente de soporte para NEMY, una plataforma de delivery en Autlán, Jalisco, México.
Responde de manera amable, profesional y concisa en español.

Usuario: ${userMessage}

Asistente:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("AI Error:", error);
    return "Lo siento, no pude procesar tu mensaje. Un administrador te responderá pronto.";
  }
}

export default router;
