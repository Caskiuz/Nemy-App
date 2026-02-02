import { db, rawDb } from "./db";
import { orders, deliveryDrivers } from "@shared/schema-mysql";
import { eq, and, sql } from "drizzle-orm";
import { logger } from "./logger";

interface DriverScore {
  driverId: string;
  distance: number;
  rating: number;
  completedOrders: number;
  score: number;
}

export async function assignBestDriver(orderId: string, businessLat: number, businessLng: number) {
  try {
    const [availableDrivers] = await rawDb.execute(
      "SELECT id, latitude, longitude, rating, completedOrders FROM delivery_drivers WHERE isAvailable = 1 AND strikes < 3"
    );

    if (!availableDrivers || availableDrivers.length === 0) {
      return { success: false, error: "No drivers available" };
    }

    const scored: DriverScore[] = availableDrivers.map((driver: any) => {
      const distance = calculateDistance(businessLat, businessLng, parseFloat(driver.latitude), parseFloat(driver.longitude));
      const distanceScore = Math.max(0, 100 - distance * 10);
      const ratingScore = (driver.rating || 4.0) * 20;
      const experienceScore = Math.min(driver.completedOrders || 0, 50);
      
      return {
        driverId: driver.id,
        distance,
        rating: driver.rating,
        completedOrders: driver.completedOrders,
        score: distanceScore * 0.5 + ratingScore * 0.3 + experienceScore * 0.2
      };
    });

    scored.sort((a, b) => b.score - a.score);
    const bestDriver = scored[0];

    await db.update(orders).set({ 
      deliveryPersonId: bestDriver.driverId,
      status: "assigned"
    }).where(eq(orders.id, orderId));

    logger.info("Driver assigned", { orderId, driverId: bestDriver.driverId, score: bestDriver.score });
    return { success: true, driverId: bestDriver.driverId, distance: bestDriver.distance };
  } catch (error: any) {
    logger.error("Assignment failed", error);
    return { success: false, error: error.message };
  }
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

export async function handleMultipleOrders(driverId: string) {
  const [activeOrders] = await rawDb.execute(
    "SELECT id FROM orders WHERE deliveryPersonId = ? AND status IN ('assigned','picked_up') ORDER BY createdAt",
    [driverId]
  );
  
  return { success: true, activeOrders: activeOrders.length, orders: activeOrders };
}
