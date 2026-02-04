import express from "express";
import { authenticateToken, requireRole } from "./authMiddleware";

const router = express.Router();

// Helper function for AI responses
async function generateAIResponse(message: string, history: any[]): Promise<string> {
  try {
    // Check if we have API key
    const apiKey = process.env.AI_INTEGRATIONS_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Fallback response without AI
      return `Gracias por tu mensaje. Estoy aquí para ayudarte con NEMY.

¿Necesitas ayuda con:
• Realizar un pedido
• Seguimiento de entregas
• Información de negocios
• Problemas con pagos
• Otra consulta

Por favor, describe tu consulta y te ayudaré.`;
    }

    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const NEMY_CONTEXT = `
Eres un asistente de soporte para NEMY, una plataforma de delivery en Autlán, Jalisco, México.

INFORMACIÓN CLAVE:
- NEMY significa "vivir" en náhuatl
- Conectamos negocios locales, clientes y repartidores
- Comisiones: 15% plataforma, 70% negocio, 15% repartidor
- Pagos con tarjeta (Stripe) o efectivo
- Autenticación solo por teléfono con SMS
- Zona de cobertura: Autlán y alrededores

Responde de manera amigable, profesional y concisa en español.
`;

    const chatMessages = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: chatMessages,
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7,
      },
      systemInstruction: NEMY_CONTEXT,
    });

    const result = await chat.sendMessage(message);
    return result.response.text() || "Lo siento, no pude procesar tu mensaje.";
  } catch (error) {
    console.error('AI Error:', error);
    return "Lo siento, estoy teniendo problemas técnicos. Por favor intenta de nuevo.";
  }
}

// ============================================
// USER SUPPORT ROUTES
// ============================================

// Get user's own tickets
router.get(
  "/tickets/:userId",
  authenticateToken,
  async (req, res) => {
    try {
      const { supportChats } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq, desc } = await import("drizzle-orm");

      const tickets = await db
        .select()
        .from(supportChats)
        .where(eq(supportChats.userId, req.params.userId))
        .orderBy(desc(supportChats.createdAt));

      res.json({ success: true, tickets });
    } catch (error: any) {
      console.error("Error fetching user tickets:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

// AI Chat endpoint (for real-time support)
router.post(
  "/chat",
  authenticateToken,
  async (req, res) => {
    try {
      const { message, history } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      // Generate AI response using Gemini
      const response = await generateAIResponse(message, history || []);
      
      res.json({ success: true, response });
    } catch (error: any) {
      console.error("AI chat error:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Create new support chat/ticket
router.post(
  "/create-ticket",
  authenticateToken,
  async (req, res) => {
    try {
      const { supportChats, supportMessages } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { v4: uuidv4 } = await import("uuid");

      const { message, subject, category } = req.body;
      const chatId = uuidv4();

      // Create chat
      await db.insert(supportChats).values({
        id: chatId,
        userId: req.user!.id,
        subject: subject || "Consulta de soporte",
        category: category || "general",
        status: "open",
        priority: "medium",
      });

      // Create first message
      await db.insert(supportMessages).values({
        id: uuidv4(),
        chatId,
        userId: req.user!.id,
        message,
        isBot: false,
        isAdmin: false,
      });

      res.json({ success: true, chatId });
    } catch (error: any) {
      console.error("Error creating support chat:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

// ============================================
// ADMIN SUPPORT ROUTES
// ============================================

// Get all support tickets
router.get(
  "/tickets",
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
            .select({ id: users.id, name: users.name, email: users.email, phone: users.phone })
            .from(users)
            .where(eq(users.id, ticket.userId))
            .limit(1);

          return {
            id: ticket.id,
            userId: ticket.userId,
            userName: user?.name || "Usuario",
            userEmail: user?.email || "",
            subject: ticket.subject || "Sin asunto",
            status: ticket.status || "open",
            priority: ticket.priority || "medium",
            category: ticket.category || "general",
            createdAt: ticket.createdAt,
            updatedAt: ticket.updatedAt,
            lastMessageAt: ticket.updatedAt,
            messageCount: 0,
          };
        })
      );

      res.json({ success: true, tickets: enrichedTickets });
    } catch (error: any) {
      console.error("Error fetching tickets:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Get messages for a ticket
router.get(
  "/tickets/:id/messages",
  authenticateToken,
  requireRole("admin", "super_admin"),
  async (req, res) => {
    try {
      const { supportMessages } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq } = await import("drizzle-orm");

      const messages = await db
        .select()
        .from(supportMessages)
        .where(eq(supportMessages.chatId, req.params.id))
        .orderBy(supportMessages.createdAt);

      res.json({ success: true, messages });
    } catch (error: any) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Send message to ticket
router.post(
  "/tickets/:id/messages",
  authenticateToken,
  requireRole("admin", "super_admin"),
  async (req, res) => {
    try {
      const { supportMessages } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { v4: uuidv4 } = await import("uuid");

      const { message } = req.body;

      const newMessage = {
        id: uuidv4(),
        chatId: req.params.id,
        userId: req.user!.id,
        message,
        isBot: false,
        isAdmin: true,
      };

      await db.insert(supportMessages).values(newMessage);

      res.json({ success: true, message: newMessage });
    } catch (error: any) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Update ticket status
router.put(
  "/tickets/:id",
  authenticateToken,
  requireRole("admin", "super_admin"),
  async (req, res) => {
    try {
      const { supportChats } = await import("@shared/schema-mysql");
      const { db } = await import("./db");
      const { eq } = await import("drizzle-orm");

      const { status, priority } = req.body;

      await db
        .update(supportChats)
        .set({ 
          ...(status && { status }),
          ...(priority && { priority }),
          updatedAt: new Date() 
        })
        .where(eq(supportChats.id, req.params.id));

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error updating ticket:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
