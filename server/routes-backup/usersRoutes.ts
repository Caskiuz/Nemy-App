import express from "express";
import { authenticateToken, requirePhoneVerified, auditAction } from "../authMiddleware";
import { eq, desc } from "drizzle-orm";

const router = express.Router();

// Get current user profile
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const { users } = await import("@shared/schema-mysql");
    const { db } = await import("../db");

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
});

// Update user profile
router.put("/profile", authenticateToken, requirePhoneVerified, auditAction("update_profile", "user"), async (req, res) => {
  try {
    const { users } = await import("@shared/schema-mysql");
    const { db } = await import("../db");

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
});

// Update user by ID
router.put("/:id", authenticateToken, requirePhoneVerified, auditAction("update_user", "user"), async (req, res) => {
  try {
    const { users } = await import("@shared/schema-mysql");
    const { db } = await import("../db");

    const userId = req.params.id;
    
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
});

// Upload profile image
router.post("/profile-image", authenticateToken, requirePhoneVerified, async (req, res) => {
  try {
    const { users } = await import("@shared/schema-mysql");
    const { db } = await import("../db");
    const fs = await import("fs");
    const path = await import("path");

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

    const filename = `${req.user!.id}_${Date.now()}.${extension}`;
    const uploadDir = path.join(__dirname, "..", "uploads", "profiles");
    const filepath = path.join(uploadDir, filename);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Delete old profile image if exists
    const [currentUser] = await db
      .select({ profileImage: users.profileImage })
      .from(users)
      .where(eq(users.id, req.user!.id));

    if (currentUser?.profileImage) {
      const oldFilename = currentUser.profileImage.split("?")[0].split("/").pop();
      if (oldFilename) {
        const oldPath = path.join(uploadDir, oldFilename);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
    }

    fs.writeFileSync(filepath, buffer);

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
});

// Delete profile image
router.delete("/profile-image", authenticateToken, requirePhoneVerified, async (req, res) => {
  try {
    const { users } = await import("@shared/schema-mysql");
    const { db } = await import("../db");
    const fs = await import("fs");
    const path = await import("path");

    const [currentUser] = await db
      .select({ profileImage: users.profileImage })
      .from(users)
      .where(eq(users.id, req.user!.id));

    if (currentUser?.profileImage) {
      const filename = currentUser.profileImage.split("/").pop();
      if (filename) {
        const filepath = path.join(__dirname, "..", "uploads", "profiles", filename);
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
});

// Get user addresses
router.get("/:userId/addresses", authenticateToken, async (req, res) => {
  try {
    const { addresses } = await import("@shared/schema-mysql");
    const { db } = await import("../db");

    const userId = req.params.userId;
    
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
});

// Add new address
router.post("/:userId/addresses", authenticateToken, async (req, res) => {
  try {
    const { addresses } = await import("@shared/schema-mysql");
    const { db } = await import("../db");

    const userId = req.params.userId;
    
    if (!req.user || (String(req.user.id) !== userId && req.user.role !== 'admin')) {
      return res.status(403).json({ error: "No tienes permiso para agregar direcciones" });
    }

    const { label, street, city, state, zipCode, isDefault, latitude, longitude } = req.body;

    // If this is the default, unset other defaults
    if (isDefault) {
      await db
        .update(addresses)
        .set({ isDefault: false })
        .where(eq(addresses.userId, userId));
    }

    await db
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
      });

    const [newAddress] = await db
      .select()
      .from(addresses)
      .where(eq(addresses.userId, userId))
      .orderBy(desc(addresses.createdAt))
      .limit(1);

    res.json({ success: true, addressId: newAddress.id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;