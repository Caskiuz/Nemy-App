import cron from "node-cron";
import { WeeklySettlementService } from "./weeklySettlementService";

export class WeeklySettlementCron {
  /**
   * Iniciar todos los cron jobs
   */
  static start() {
    // Viernes a las 11:59 PM - Cerrar semana
    cron.schedule("59 23 * * 5", async () => {
      console.log("🕐 Ejecutando cierre de semana...");
      try {
        const result = await WeeklySettlementService.closeWeek();
        console.log(`✅ Semana cerrada: ${result.count} liquidaciones creadas`);
      } catch (error) {
        console.error("❌ Error al cerrar semana:", error);
      }
    });

    // Lunes a las 12:00 AM - Bloquear drivers sin pago
    cron.schedule("0 0 * * 1", async () => {
      console.log("🕐 Ejecutando bloqueo de drivers...");
      try {
        const result = await WeeklySettlementService.blockUnpaidDrivers();
        console.log(`🚫 ${result.blocked} drivers bloqueados`);
      } catch (error) {
        console.error("❌ Error al bloquear drivers:", error);
      }
    });

    console.log("⏰ Cron jobs de liquidación semanal iniciados:");
    console.log("   - Viernes 11:59 PM: Cierre de semana");
    console.log("   - Lunes 12:00 AM: Bloqueo de drivers sin pago");
  }
}
