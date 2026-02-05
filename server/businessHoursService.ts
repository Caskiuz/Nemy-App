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
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      const todayHours = hours[dayOfWeek];
      if (!todayHours || !todayHours.isOpen) return false;

      return currentTime >= todayHours.openTime && currentTime <= todayHours.closeTime;
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
