import express from "express";

const router = express.Router();

// Phone login
router.post("/phone-login", async (req, res) => {
  try {
    const { phone, code } = req.body;
    
    if (!phone || !code) {
      return res.status(400).json({ error: "Phone and code are required" });
    }

    const { users } = await import("@shared/schema-mysql");
    const { db } = await import("../db");
    const { eq, or, like } = await import("drizzle-orm");
    const jwt = await import("jsonwebtoken");

    const phoneDigits = phone.replace(/[^\d]/g, '');
    const normalizedPhone = phoneDigits.startsWith('52') ? `+${phoneDigits}` : 
                           phoneDigits.length === 10 ? `+52${phoneDigits}` :
                           phone.startsWith('+') ? phone : `+52${phoneDigits}`;

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
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    if (!user[0].verificationCode || user[0].verificationCode !== code) {
      const testPhones = ["+52 341 234 5678", "+52 341 456 7892", "+523414567892"];
      const isTestPhone = testPhones.some(testPhone => {
        const testDigits = testPhone.replace(/[^\d]/g, '');
        return phoneDigits.slice(-10) === testDigits.slice(-10);
      });
      
      if (process.env.NODE_ENV === "development" && code === "1234" && isTestPhone) {
        console.log("✅ Using 1234 fallback for test phone");
      } else {
        return res.status(400).json({ error: "Código inválido" });
      }
    }

    if (user[0].verificationExpires && new Date() > new Date(user[0].verificationExpires)) {
      return res.status(400).json({ error: "Código expirado" });
    }

    await db
      .update(users)
      .set({ 
        verificationCode: null, 
        verificationExpires: null,
        phoneVerified: true 
      })
      .where(eq(users.id, user[0].id));

    const token = jwt.default.sign(
      { id: user[0].id, phone: user[0].phone, role: user[0].role },
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

// Send code
router.post("/send-code", async (req, res) => {
  try {
    const { phone } = req.body;
    
    if (!phone) {
      return res.status(400).json({ error: "Phone required" });
    }

    const { users } = await import("@shared/schema-mysql");
    const { db } = await import("../db");
    const { eq, or, like } = await import("drizzle-orm");

    const phoneDigits = phone.replace(/[^\d]/g, '');
    const normalizedPhone = phoneDigits.startsWith('52') ? `+${phoneDigits}` : `+52${phoneDigits}`;

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
        message: "Usuario no encontrado"
      });
    }

    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db
      .update(users)
      .set({ 
        verificationCode: code,
        verificationExpires: expiresAt 
      })
      .where(eq(users.id, user[0].id));

    if (process.env.TWILIO_ACCOUNT_SID) {
      try {
        const twilio = await import("twilio");
        const client = twilio.default(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        await client.messages.create({
          body: `Tu código NEMY: ${code}`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: normalizedPhone
        });
      } catch (twilioError) {
        console.error("Twilio error:", twilioError);
      }
    } else {
      console.log(`[DEV] Código para ${normalizedPhone}: ${code}`);
    }

    res.json({ 
      success: true, 
      message: "Código enviado",
      ...(process.env.NODE_ENV === "development" && { devCode: code })
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Signup
router.post("/phone-signup", async (req, res) => {
  try {
    const { phone, name, role } = req.body;
    
    if (!phone || !name) {
      return res.status(400).json({ error: "Teléfono y nombre requeridos" });
    }

    const { users } = await import("@shared/schema-mysql");
    const { db } = await import("../db");
    const { eq, or, like } = await import("drizzle-orm");

    const normalizedPhone = phone.replace(/[\s-()]/g, '');
    const phoneDigits = normalizedPhone.replace(/[^\d]/g, '');

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
        error: "Número ya registrado",
        userExists: true
      });
    }

    const validRoles = ['customer', 'business_owner', 'delivery_driver'];
    const userRole = validRoles.includes(role) ? role : 'customer';
    const requiresApproval = ['business_owner', 'delivery_driver'].includes(userRole);

    await db
      .insert(users)
      .values({
        phone: normalizedPhone,
        name: name,
        role: userRole,
        phoneVerified: false,
        isActive: !requiresApproval,
      });

    res.json({ 
      success: true, 
      requiresVerification: true,
      requiresApproval,
      message: requiresApproval ? "Registro exitoso. Espera aprobación." : "Registro exitoso."
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;