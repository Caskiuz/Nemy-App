-- Verificar si existe la tabla delivery_zones
SHOW TABLES LIKE 'delivery_zones';

-- Ver estructura de la tabla
DESCRIBE delivery_zones;

-- Ver datos existentes
SELECT * FROM delivery_zones;

-- Ver negocios y sus ubicaciones para crear zonas basadas en datos reales
SELECT 
    id,
    name,
    address,
    latitude,
    longitude,
    deliveryFee,
    maxDeliveryRadiusKm,
    isActive
FROM businesses 
WHERE isActive = 1;

-- Ver pedidos y sus direcciones de entrega
SELECT 
    id,
    businessId,
    businessName,
    deliveryAddress,
    deliveryLatitude,
    deliveryLongitude,
    deliveryFee,
    createdAt
FROM orders 
ORDER BY createdAt DESC 
LIMIT 20;