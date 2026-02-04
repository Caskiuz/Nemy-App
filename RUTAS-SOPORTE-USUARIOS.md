# RUTAS DE SOPORTE PARA USUARIOS

## Agrega estas rutas en `server/apiRoutes.ts` ANTES de `export default router;`

```typescript
// ============================================
// USER SUPPORT ROUTES (Crear tickets y chat)
// ============================================

// Get user's support tickets
router.get("/support/tickets", authenticateToken, async (req, res) => {
  try {
    const { supportChats } = await import("@shared/schema-mysql");
    const { db } = await import("./db");
    const { eq, desc } = await import("drizzle-orm");

    const tickets = await db
      .select()
      .from(supportChats)
      .where(eq(supportChats.userId, req.user!.id))
      .orderBy(desc(supportChats.createdAt));

    res.json({ success: true, tickets });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create support ticket
router.post("/support/tickets", authenticateToken, async (req, res) => {
  try {
    const { supportChats, supportMessages } = await import("@shared/schema-mysql");
    const { db } = await import("./db");
    const { v4: uuidv4 } = await import("uuid");

    const { subject, message, priority } = req.body;

    const ticketId = uuidv4();

    await db.insert(supportChats).values({
      id: ticketId,
      userId: req.user!.id,
      subject: subject || "Consulta de soporte",
      status: "open",
      priority: priority || "medium",
      category: "general",
    });

    await db.insert(supportMessages).values({
      id: uuidv4(),
      chatId: ticketId,
      userId: req.user!.id,
      message,
      isBot: false,
      isAdmin: false,
    });

    res.json({ success: true, ticketId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Support chat with AI
router.post("/support/chat", authenticateToken, async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY) {
      return res.json({
        response: "Lo siento, el servicio de chat está temporalmente no disponible. Por favor crea un ticket de soporte y nuestro equipo te ayudará pronto.",
      });
    }

    // Try Gemini first
    if (process.env.GEMINI_API_KEY) {
      try {
        const { GoogleGenerativeAI } = await import("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

        const prompt = `Eres un asistente de soporte para NEMY, una plataforma de delivery en Autlán, Jalisco, México.
Responde de manera amable, profesional y concisa en español.

Usuario: ${message}

Asistente:`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return res.json({ success: true, response: response.text() });
      } catch (geminiError) {
        console.error("Gemini error:", geminiError);
      }
    }

    // Fallback to OpenAI
    if (process.env.OPENAI_API_KEY) {
      const OpenAI = await import("openai");
      const openai = new OpenAI.default({ apiKey: process.env.OPENAI_API_KEY });

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Eres un asistente de soporte para NEMY, una plataforma de delivery en Autlán, Jalisco, México. Responde de manera amable, profesional y concisa en español.",
          },
          ...(history || []),
          { role: "user", content: message },
        ],
      });

      return res.json({
        success: true,
        response: completion.choices[0].message.content,
      });
    }

    res.json({
      response: "Lo siento, no pude procesar tu mensaje. Por favor intenta de nuevo o crea un ticket de soporte.",
    });
  } catch (error: any) {
    console.error("Support chat error:", error);
    res.status(500).json({ error: error.message });
  }
});
```

## IMPORTANTE:

1. Estas rutas permiten a los USUARIOS crear tickets desde la app
2. El chat con IA funciona con Gemini o OpenAI
3. Los tickets creados por usuarios aparecerán en el panel de admin
4. Después de agregar estas rutas, REINICIA el servidor

## Para probar:

1. Abre la app como usuario (no admin)
2. Ve a la pantalla de Soporte
3. Crea un nuevo ticket
4. El ticket aparecerá en el panel de admin en la pestaña "Soporte"
