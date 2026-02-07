import { db } from "./db";
import { sql } from "drizzle-orm";

export class WeeklySettlementService {
  /**
   * Cierra la semana y crea liquidaciones para todos los drivers con deuda
   * Se ejecuta cada viernes a las 11:59 PM
   */
  static async closeWeek() {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - 7);
    
    const weekEnd = new Date(today);
    
    // Obtener todos los drivers con cash_owed > 0
    const driversWithDebt = await db.execute(sql`
      SELECT user_id, cash_owed 
      FROM wallets 
      WHERE cash_owed > 0
    `);
    
    for (const driver of driversWithDebt.rows as any[]) {
      // Crear liquidación semanal
      await db.execute(sql`
        INSERT INTO weekly_settlements 
        (id, driver_id, week_start, week_end, amount_owed, status, created_at)
        VALUES (UUID(), ${driver.user_id}, ${weekStart.toISOString().split('T')[0]}, 
                ${weekEnd.toISOString().split('T')[0]}, ${driver.cash_owed}, 'pending', NOW())
      `);
    }
    
    console.log(`✅ Semana cerrada. ${driversWithDebt.rows.length} liquidaciones creadas.`);
    return { success: true, count: driversWithDebt.rows.length };
  }
  
  /**
   * Bloquea drivers que no pagaron en 48 horas
   * Se ejecuta cada lunes a las 12:00 AM
   */
  static async blockUnpaidDrivers() {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    
    // Obtener liquidaciones pendientes de hace más de 48 horas
    const unpaidSettlements = await db.execute(sql`
      SELECT DISTINCT driver_id 
      FROM weekly_settlements 
      WHERE status = 'pending' 
      AND created_at < ${twoDaysAgo.toISOString()}
    `);
    
    for (const settlement of unpaidSettlements.rows as any[]) {
      // Bloquear driver
      await db.execute(sql`
        UPDATE users 
        SET is_active = 0 
        WHERE id = ${settlement.driver_id}
      `);
      
      await db.execute(sql`
        UPDATE delivery_drivers 
        SET is_available = 0 
        WHERE user_id = ${settlement.driver_id}
      `);
    }
    
    console.log(`🚫 ${unpaidSettlements.rows.length} drivers bloqueados por falta de pago.`);
    return { success: true, blocked: unpaidSettlements.rows.length };
  }
  
  /**
   * Obtener liquidación pendiente del driver
   */
  static async getDriverPendingSettlement(driverId: string) {
    const result = await db.execute(sql`
      SELECT * FROM weekly_settlements 
      WHERE driver_id = ${driverId} 
      AND status IN ('pending', 'submitted')
      ORDER BY created_at DESC 
      LIMIT 1
    `);
    
    return result.rows[0] || null;
  }
  
  /**
   * Driver sube comprobante de pago
   */
  static async submitPaymentProof(settlementId: string, proofUrl: string) {
    await db.execute(sql`
      UPDATE weekly_settlements 
      SET status = 'submitted', 
          payment_proof_url = ${proofUrl},
          submitted_at = NOW()
      WHERE id = ${settlementId}
    `);
    
    return { success: true };
  }
  
  /**
   * Admin aprueba liquidación
   */
  static async approveSettlement(settlementId: string, adminId: string) {
    // Obtener la liquidación
    const result = await db.execute(sql`
      SELECT driver_id, amount_owed 
      FROM weekly_settlements 
      WHERE id = ${settlementId}
    `);
    
    const settlement = result.rows[0] as any;
    
    if (!settlement) {
      throw new Error("Liquidación no encontrada");
    }
    
    // Marcar como aprobada
    await db.execute(sql`
      UPDATE weekly_settlements 
      SET status = 'approved', 
          approved_at = NOW(),
          approved_by = ${adminId}
      WHERE id = ${settlementId}
    `);
    
    // Reducir deuda del driver
    await db.execute(sql`
      UPDATE wallets 
      SET cash_owed = GREATEST(0, cash_owed - ${settlement.amount_owed})
      WHERE user_id = ${settlement.driver_id}
    `);
    
    // Desbloquear driver si estaba bloqueado
    await db.execute(sql`
      UPDATE users 
      SET is_active = 1 
      WHERE id = ${settlement.driver_id}
    `);
    
    return { success: true };
  }
  
  /**
   * Admin rechaza liquidación
   */
  static async rejectSettlement(settlementId: string, adminId: string, notes: string) {
    await db.execute(sql`
      UPDATE weekly_settlements 
      SET status = 'rejected', 
          approved_by = ${adminId},
          notes = ${notes},
          approved_at = NOW()
      WHERE id = ${settlementId}
    `);
    
    return { success: true };
  }
  
  /**
   * Obtener todas las liquidaciones pendientes (Admin)
   */
  static async getAllPendingSettlements() {
    const result = await db.execute(sql`
      SELECT ws.*, u.name as driver_name, u.phone as driver_phone
      FROM weekly_settlements ws
      JOIN users u ON ws.driver_id = u.id
      WHERE ws.status IN ('pending', 'submitted')
      ORDER BY ws.created_at DESC
    `);
    
    return result.rows;
  }
}
