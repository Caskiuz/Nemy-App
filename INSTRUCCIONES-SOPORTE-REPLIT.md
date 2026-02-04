# Instrucciones para agregar rutas de soporte en Replit

## Si las rutas NO existen en el archivo apiRoutes.ts de Replit:

Agrega este código al final del archivo `server/apiRoutes.ts`, ANTES de la línea `export default router;`:

```typescript
// ============================================
// SUPPORT ROUTES (ADMIN)
// ============================================

// Get support tickets
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
  "/admin/support/tickets/:id/messages",
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
  "/admin/support/tickets/:id/messages",
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
  "/admin/support/tickets/:id",
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
```

## PASO 3: Reiniciar el servidor en Replit

1. En la consola de Replit, presiona `Ctrl+C` para detener el servidor
2. Ejecuta: `npm run server:dev` o el comando que uses para iniciar el servidor
3. Espera a que el servidor inicie completamente
4. Prueba la aplicación nuevamente

## PASO 4: Verificar que el servidor está usando las rutas

Verifica que en `server/server.ts` existe esta línea:

```typescript
app.use('/api', apiRoutes);
```

## PASO 5: Si aún no funciona

Si después de reiniciar sigue sin funcionar, verifica:

1. Que el archivo `server/apiRoutes.ts` se guardó correctamente
2. Que no hay errores de sintaxis en el código agregado
3. Que el servidor se reinició completamente (no solo recargó)
4. Revisa los logs del servidor en Replit para ver si hay errores

## Notas importantes:

- Las rutas YA DEBERÍAN EXISTIR en tu código local
- Solo necesitas agregarlas en Replit si no están ahí
- Después de agregar las rutas, SIEMPRE reinicia el servidor
- El error 404 desaparecerá una vez que las rutas estén registradas y el servidor reiniciado
