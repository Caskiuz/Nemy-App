import { db } from "./db";
import { businesses } from "@shared/schema-mysql";
import { eq } from "drizzle-orm";

export class BusinessHoursService {
  // Check if business should be open based on current time
  static async isBusinessOpen(businessId: string): Promise<boolean> {
    const [business] = await db
      .select()
      .from(businesses)
      .where(eq(businesses.id, businessId))
      .limit(1);

    if (!business || !business.openingHours) return true;

    try {
      const hours = JSON.parse(business.openingHours);
      const now = new Date();
      const dayOfWeek = now.getDay();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTimeInMinutes = currentHour * 60 + currentMinute;

      const todayHours = hours[dayOfWeek];
      if (!todayHours || !todayHours.isOpen) return false;

      // Parse open and close times
      const [openHour, openMinute] = todayHours.openTime.split(':').map(Number);
      const [closeHour, closeMinute] = todayHours.closeTime.split(':').map(Number);
      const openTimeInMinutes = openHour * 60 + openMinute;
      const closeTimeInMinutes = closeHour * 60 + closeMinute;

      return currentTimeInMinutes >= openTimeInMinutes && currentTimeInMinutes <= closeTimeInMinutes;
    } catch {
      return true;
    }
  }

  // Update all businesses based on their schedules
  static async updateAllBusinessStatuses(): Promise<void> {
    const allBusinesses = await db.select().from(businesses);

    for (const business of allBusinesses) {
      if (!business.openingHours) continue;

      const shouldBeOpen = await this.isBusinessOpen(business.id);
      
      if (business.isOpen !== shouldBeOpen) {
        await db
          .update(businesses)
          .set({ isOpen: shouldBeOpen })
          .where(eq(businesses.id, business.id));
        
        console.log(`📍 ${business.name}: ${shouldBeOpen ? 'ABIERTO' : 'CERRADO'}`);
      }
    }
  }
}
