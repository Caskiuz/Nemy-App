// Cash Settlement Service - Liquidación de efectivo estilo Uber Eats
import { db } from "./db";
import { orders, wallets, transactions } from "@shared/schema-mysql";
import { eq, and, sql } from "drizzle-orm";

export class CashSettlementService {
  /**
   * Cuando el repartidor marca como entregado un pedido en efectivo
   * NUEVA LÓGICA RAPPI:
   * - Cobra TODO del cliente
   * - Paga al negocio el precio base del producto
   * - Se queda la tarifa de envío
   * - Resguarda comisión NEMY (15% del producto) para depositar viernes
   */
  static async recordCashCollection(orderId: string, driverId: string) {
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    
    if (!order || order.paymentMethod !== "cash") {
      throw new Error("Order is not cash payment");
    }

    // Cliente paga: total completo
    const totalCobrado = order.total;
    
    // Usar campos de contabilidad si existen, sino calcular
    const productosBase = order.productosBase || Math.round(order.subtotal / 1.15);
    const nemyCommission = order.nemyCommission || (order.subtotal - productosBase);
    
    // Repartidor se queda: tarifa de envío
    const driverKeeps = order.deliveryFee;
    
    // Repartidor debe pagar al negocio: precio base
    const debeAlNegocio = productosBase;
    
    // Repartidor debe depositar a NEMY: comisión 15%
    const debeANemy = nemyCommission;

    // Actualizar orden
    await db.update(orders)
      .set({
        cashCollected: 1,
        platformFee: nemyCommission,
        businessEarnings: productosBase,
        deliveryEarnings: driverKeeps,
        deliveredAt: new Date(),
      })
      .where(eq(orders.id, orderId));

    // Actualizar wallet del repartidor
    const [driverWallet] = await db.select().from(wallets).where(eq(wallets.userId, driverId)).limit(1);
    
    if (driverWallet) {
      await db.update(wallets)
        .set({
          cashOwed: driverWallet.cashOwed + debeANemy, // Solo debe a NEMY
          balance: driverWallet.balance + driverKeeps, // Su ganancia
          totalEarned: driverWallet.totalEarned + driverKeeps,
        })
        .where(eq(wallets.userId, driverId));
    } else {
      await db.insert(wallets).values({
        userId: driverId,
        cashOwed: debeANemy,
        balance: driverKeeps,
        pendingBalance: 0,
        totalEarned: driverKeeps,
        totalWithdrawn: 0,
      });
    }

    // Crear transacciones para transparencia
    await db.insert(transactions).values([
      {
        userId: driverId,
        orderId: orderId,
        type: "cash_collected",
        amount: totalCobrado,
        status: "completed",
        description: `Efectivo cobrado - Pedido #${orderId.slice(-6)} ($${(totalCobrado/100).toFixed(2)})`,
      },
      {
        userId: driverId,
        orderId: orderId,
        type: "delivery_income",
        amount: driverKeeps,
        status: "completed",
        description: `Tu ganancia por entrega - Pedido #${orderId.slice(-6)}`,
      },
      {
        userId: driverId,
        orderId: orderId,
        type: "cash_debt_business",
        amount: debeAlNegocio,
        status: "pending",
        description: `Debes pagar al negocio - Pedido #${orderId.slice(-6)} ($${(debeAlNegocio/100).toFixed(2)})`,
      },
      {
        userId: driverId,
        orderId: orderId,
        type: "cash_debt_nemy",
        amount: debeANemy,
        status: "pending",
        description: `Debes depositar a NEMY (viernes) - Pedido #${orderId.slice(-6)} ($${(debeANemy/100).toFixed(2)})`,
      },
    ]);

    return {
      totalCobrado,
      driverKeeps,
      debeAlNegocio,
      debeANemy,
      productosBase,
      nemyCommission,
    };
  }

  /**
   * Liquidar efectivo - driver deposita lo que debe
   */
  static async settleCash(driverId: string, amount: number, method: "auto" | "manual" = "auto") {
    const [driverWallet] = await db.select().from(wallets).where(eq(wallets.userId, driverId)).limit(1);
    
    if (!driverWallet || driverWallet.cashOwed <= 0) {
      throw new Error("No cash to settle");
    }

    const amountToSettle = Math.min(amount, driverWallet.cashOwed);

    // Reducir deuda y aumentar balance digital
    await db.update(wallets)
      .set({
        cashOwed: driverWallet.cashOwed - amountToSettle,
        balance: driverWallet.balance + amountToSettle, // Ahora tiene crédito digital
      })
      .where(eq(wallets.userId, driverId));

    // Registrar liquidación
    await db.insert(transactions).values({
      userId: driverId,
      type: "cash_settlement",
      amount: amountToSettle,
      status: "completed",
      description: `Depósito de efectivo - ${method === "auto" ? "Automático" : "Manual"}`,
    });

    return {
      settled: amountToSettle,
      remaining: driverWallet.cashOwed - amountToSettle,
    };
  }

  /**
   * Obtener resumen de efectivo pendiente de liquidar
   */
  static async getDriverCashSummary(driverId: string) {
    const [driverWallet] = await db.select().from(wallets).where(eq(wallets.userId, driverId)).limit(1);
    
    // Pedidos en efectivo pendientes de liquidar
    const pendingOrders = await db.select()
      .from(orders)
      .where(
        and(
          eq(orders.deliveryPersonId, driverId),
          eq(orders.paymentMethod, "cash"),
          eq(orders.cashCollected, true),
          eq(orders.cashSettled, false)
        )
      );

    return {
      totalOwed: driverWallet?.cashOwed || 0,
      availableBalance: driverWallet?.balance || 0,
      canWithdraw: (driverWallet?.balance || 0) - (driverWallet?.cashOwed || 0),
      pendingOrders: pendingOrders.length,
      orders: pendingOrders.map(o => ({
        id: o.id,
        total: o.total,
        businessShare: o.businessEarnings || 0,
        platformShare: o.platformFee || 0,
        deliveredAt: o.deliveredAt,
      })),
    };
  }

  /**
   * Obtener resumen para el negocio - cuánto le deben los repartidores
   */
  static async getBusinessCashSummary(businessId: string) {
    // Pedidos en efectivo entregados pero no liquidados
    const pendingOrders = await db.select()
      .from(orders)
      .where(
        and(
          eq(orders.businessId, businessId),
          eq(orders.paymentMethod, "cash"),
          eq(orders.status, "delivered"),
          eq(orders.cashSettled, false)
        )
      );

    const totalPending = pendingOrders.reduce((sum, o) => sum + (o.businessEarnings || 0), 0);

    return {
      totalPending,
      pendingOrders: pendingOrders.length,
      orders: pendingOrders.map(o => ({
        id: o.id,
        total: o.total,
        yourShare: o.businessEarnings || 0,
        driverName: "Repartidor", // TODO: join con users
        deliveredAt: o.deliveredAt,
        status: o.cashSettled ? "Liquidado" : "Pendiente",
      })),
    };
  }
}
