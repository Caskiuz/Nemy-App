/**
 * Calcula la distancia entre dos coordenadas GPS usando la fórmula de Haversine
 * @returns Distancia en kilómetros
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (deg: number) => deg * (Math.PI / 180);

/**
 * Calcula el delivery fee basado en la distancia
 */
export const calculateDeliveryFee = (distance: number): number => {
  const BASE_FEE = 20; // $20 MXN base
  const PER_KM = 5;    // $5 MXN por km
  const MAX_FEE = 50;  // Máximo $50 MXN
  
  const fee = BASE_FEE + (distance * PER_KM);
  return Math.min(fee, MAX_FEE);
};

/**
 * Estima el tiempo de entrega basado en distancia
 * @returns Tiempo en minutos
 */
export const estimateDeliveryTime = (distance: number, prepTime: number = 20): number => {
  const SPEED_KM_PER_MIN = 0.5; // ~30 km/h promedio en ciudad
  const travelTime = distance / SPEED_KM_PER_MIN;
  return Math.ceil(prepTime + travelTime);
};
