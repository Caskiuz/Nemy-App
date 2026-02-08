// Endpoint temporal para arreglar pedidos
router.post("/admin/fix-available-orders", async (req, res) => {
  try {
    const { orders } = await import("@shared/schema-mysql");
    const { db } = await import("./db");
    const { eq, and, isNull } = await import("drizzle-orm");

    // Poner algunos pedidos como "ready" sin repartidor
    await db
      .update(orders)
      .set({ 
        status: "ready",
        deliveryPersonId: null,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(orders.status, "picked_up"),
          eq(orders.deliveryPersonId, "driver-1")
        )
      );

    // Verificar cuántos pedidos disponibles hay ahora
    const availableOrders = await db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.status, "ready"),
          isNull(orders.deliveryPersonId)
        )
      );

    res.json({ 
      success: true, 
      message: "Pedidos arreglados",
      availableCount: availableOrders.length,
      orders: availableOrders
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});