-- NEMY Demo Data - Simplified Version
USE nemy_db_local;

-- Usuarios
INSERT INTO users (id, phone, name, email, role, phone_verified) VALUES
('user_cliente_1', '+523171234567', 'María González', 'maria@example.com', 'customer', 1),
('user_business_1', '+523171111111', 'Roberto Tacos', 'roberto@tacos.com', 'business_owner', 1),
('user_driver_1', '+523172222221', 'Carlos Rápido', 'carlos@delivery.com', 'delivery_driver', 1);

-- Negocios
INSERT INTO businesses (id, name, description, category, address, phone, email, latitude, longitude, isActive, isFeatured, rating, totalRatings, imageUrl, ownerId) VALUES
('business_tacos_1', 'Tacos El Güero', 'Los mejores tacos al pastor de Autlán', 'Tacos', 'Av. Hidalgo 123, Centro, Autlán', '+523171111111', 'tacos@example.com', 19.77080000, -104.36360000, 1, 1, 4.80, 156, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400', 'user_business_1');

-- Productos
INSERT INTO products (id, businessId, name, description, price, category, imageUrl, isActive, available) VALUES
('prod_taco_1', 'business_tacos_1', 'Tacos al Pastor', '3 tacos con piña, cilantro y cebolla', 45.00, 'Tacos', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400', 1, 1),
('prod_taco_2', 'business_tacos_1', 'Tacos de Asada', '3 tacos de carne asada premium', 50.00, 'Tacos', 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400', 1, 1);

-- Repartidor
INSERT INTO delivery_drivers (id, userId, vehicleType, licenseNumber, isAvailable, currentLatitude, currentLongitude, totalDeliveries, rating, strikes) VALUES
('driver_1', 'user_driver_1', 'motorcycle', 'ABC-123', 1, 19.77000000, -104.36400000, 245, 4.80, 0);

-- Wallets
INSERT INTO wallets (id, userId, balance, pendingBalance) VALUES
('wallet_business_1', 'user_business_1', 4500.00, 1250.00),
('wallet_driver_1', 'user_driver_1', 125.00, 32.00);

-- Pedido activo
INSERT INTO orders (id, customerId, businessId, items, deliveryAddress, paymentMethod, total, status) VALUES
('order_active_1', 'user_cliente_1', 'business_tacos_1', 
'[{"id":"item_1","productId":"prod_taco_1","quantity":2,"price":45.00}]',
'{"street":"Calle Allende 234","city":"Autlán","state":"Jalisco","zipCode":"48900","latitude":19.7750,"longitude":-104.3680}',
'card', 115.00, 'preparing');

SELECT '✅ Datos básicos insertados' AS Status;
SELECT COUNT(*) AS Usuarios FROM users;
SELECT COUNT(*) AS Negocios FROM businesses;
SELECT COUNT(*) AS Productos FROM products;
SELECT COUNT(*) AS Pedidos FROM orders;
