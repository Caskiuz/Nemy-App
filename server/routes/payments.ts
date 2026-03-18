import express from "express";
import { authenticateToken } from "../authMiddleware";
import { eq } from "drizzle-orm";

const router = express.Router();

// Create payment intent
router.post("/create-intent", authenticateToken, async (req, res) => {
  try {
    const { amount, orderId } = req.body;
    
    if (!amount || !orderId) {
      return res.status(400).json({ error: "Monto y ID de pedido requeridos" });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(503).json({ error: "Stripe no configurado" });
    }

    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-06-20",
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Amount in centavos
      currency: "mxn",
      metadata: {
        orderId,
        userId: req.user!.id,
      },
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error("Create payment intent error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Confirm payment
router.post("/confirm", authenticateToken, async (req, res) => {
  try {
    const { paymentIntentId, orderId } = req.body;
    
    if (!paymentIntentId || !orderId) {
      return res.status(400).json({ error: "Datos de pago incompletos" });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(503).json({ error: "Stripe no configurado" });
    }

    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-06-20",
    });

    // Retrieve payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({ error: "Pago no completado" });
    }

    // Update order payment status
    const { orders, payments } = await import("@shared/schema-mysql");
    const { db } = await import("../db");
    
    // Create payment record
    const paymentRecord = {
      id: crypto.randomUUID(),
      orderId,
      userId: req.user!.id,
      amount: paymentIntent.amount,
      method: "card",
      status: "completed",
      stripePaymentIntentId: paymentIntentId,
      createdAt: new Date(),
    };

    await db.insert(payments).values(paymentRecord);

    // Update order status
    await db
      .update(orders)
      .set({ 
        status: "confirmed",
        paymentStatus: "paid",
        updatedAt: new Date()
      })
      .where(eq(orders.id, orderId));

    res.json({ 
      success: true, 
      message: "Pago confirmado",
      payment: paymentRecord
    });
  } catch (error: any) {
    console.error("Confirm payment error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ── Helpers ──────────────────────────────────────────────────────────────────
async function getOrCreateStripeCustomer(userId: string) {
  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });
  const { users } = await import("@shared/schema-mysql");
  const { db } = await import("../db");

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) throw new Error("Usuario no encontrado");

  if (user.stripeCustomerId) return { stripe, customerId: user.stripeCustomerId };

  const customer = await stripe.customers.create({
    name: user.name,
    phone: user.phone ?? undefined,
    metadata: { userId },
  });

  await db.update(users).set({ stripeCustomerId: customer.id, updatedAt: new Date() }).where(eq(users.id, userId));
  return { stripe, customerId: customer.id };
}

// GET /payments/cards — list saved cards
router.get("/cards", authenticateToken, async (req, res) => {
  try {
    // Si Stripe no está configurado, retornar array vacío
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('placeholder') || process.env.STRIPE_SECRET_KEY.length < 50) {
      return res.json({ success: true, cards: [] });
    }
    
    const { stripe, customerId } = await getOrCreateStripeCustomer(req.user!.id);
    const pms = await stripe.paymentMethods.list({ customer: customerId, type: "card" });
    const customer = await stripe.customers.retrieve(customerId) as any;
    const defaultPmId = customer.invoice_settings?.default_payment_method;
    const cards = pms.data.map((pm) => ({
      id: pm.id,
      brand: pm.card!.brand,
      last4: pm.card!.last4,
      expMonth: pm.card!.exp_month,
      expYear: pm.card!.exp_year,
      isDefault: pm.id === defaultPmId,
    }));
    res.json({ success: true, cards });
  } catch (error: any) {
    console.error('Error loading cards:', error.message);
    // En caso de error, retornar array vacío en lugar de error 500
    res.json({ success: true, cards: [] });
  }
});

// POST /payments/cards/setup-intent — get SetupIntent clientSecret to add a card
router.post("/cards/setup-intent", authenticateToken, async (req, res) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) return res.status(503).json({ error: "Stripe no configurado" });
    const { stripe, customerId } = await getOrCreateStripeCustomer(req.user!.id);
    const si = await stripe.setupIntents.create({ customer: customerId, payment_method_types: ["card"] });
    res.json({ success: true, clientSecret: si.client_secret });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /payments/cards/:pmId — remove a saved card
router.delete("/cards/:pmId", authenticateToken, async (req, res) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) return res.status(503).json({ error: "Stripe no configurado" });
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });
    await stripe.paymentMethods.detach(req.params.pmId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /payments/cards/:pmId/default — set default card
router.put("/cards/:pmId/default", authenticateToken, async (req, res) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) return res.status(503).json({ error: "Stripe no configurado" });
    const { stripe, customerId } = await getOrCreateStripeCustomer(req.user!.id);
    await stripe.customers.update(customerId, { invoice_settings: { default_payment_method: req.params.pmId } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /payments/methods — legacy (kept for checkout compatibility)
router.get("/methods", authenticateToken, async (req, res) => {
  res.json({ success: true, methods: [
    { id: "cash", name: "Efectivo", type: "cash", isDefault: true, isActive: true },
    { id: "card", name: "Tarjeta", type: "card", isDefault: false, isActive: !!process.env.STRIPE_SECRET_KEY },
  ]});
});

// Get payment history
router.get("/history", authenticateToken, async (req, res) => {
  try {
    const { payments, orders } = await import("@shared/schema-mysql");
    const { db } = await import("../db");
    
    const userPayments = await db
      .select({
        payment: payments,
        order: {
          id: orders.id,
          total: orders.total,
          status: orders.status,
        }
      })
      .from(payments)
      .leftJoin(orders, eq(payments.orderId, orders.id))
      .where(eq(payments.customerId, req.user!.id));

    res.json({ success: true, payments: userPayments });
  } catch (error: any) {
    console.error("Get payment history error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Stripe webhook
router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      return res.status(503).json({ error: "Stripe no configurado" });
    }

    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-06-20",
    });

    const sig = req.headers["stripe-signature"] as string;
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        console.log("Payment succeeded:", paymentIntent.id);
        
        // Update payment status in database
        const { payments } = await import("@shared/schema-mysql");
        const { db } = await import("../db");
        
        await db
          .update(payments)
          .set({ 
            status: "completed",
            updatedAt: new Date()
          })
          .where(eq(payments.stripePaymentIntentId, paymentIntent.id));
        
        break;
      
      case "payment_intent.payment_failed":
        const failedPayment = event.data.object;
        console.log("Payment failed:", failedPayment.id);
        
        // Update payment status to failed
        const { payments: paymentsTable } = await import("@shared/schema-mysql");
        const { db: database } = await import("../db");
        
        await database
          .update(paymentsTable)
          .set({ 
            status: "failed",
            updatedAt: new Date()
          })
          .where(eq(paymentsTable.stripePaymentIntentId, failedPayment.id));
        
        break;
      
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;