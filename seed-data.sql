-- Seed data for NEMY database
USE nemy_db_local;

-- Clear existing data
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM products;
DELETE FROM delivery_drivers;
DELETE FROM businesses;
DELETE FROM wallets;
DELETE FROM users;

-- Insert test users with specific phone numbers for testing
INSERT INTO users (id, phone, name, email, role, phoneVerified, isActive, createdAt) VALUES
('user1', '+52 341 123 4567', 'Juan Pérez', 'juan@customer.com', 'customer', 1, 1, '2024-01-15 10:00:00'),
('user2', '+52 341 234 5678', 'María González', 'maria@tacoselguero.com', 'business_owner', 1, 1, '2024-01-10 09:00:00'),
('user3', '+52 341 345 6789', 'Carlos Ramírez', 'carlos@driver.com', 'delivery_driver', 1, 1, '2024-01-12 11:00:00'),
('user4', '+52 341 456 7890', 'Ana López', 'ana@admin.com', 'admin', 1, 1, '2024-01-01 08:00:00'),
('user5', '+52 341 567 8901', 'Roberto Silva', 'roberto@superadmin.com', 'super_admin', 1, 1, '2024-01-01 08:00:00'),
('user6', '+52 341 111 1111', 'Sofia Morales', 'sofia@customer.com', 'customer', 1, 1, '2024-01-20 14:00:00'),
('user7', '+52 341 222 2222', 'Diego Herrera', 'diego@pizzanapoli.com', 'business_owner', 1, 1, '2024-01-08 10:30:00'),
('user8', '+52 341 333 3333', 'Elena Vázquez', 'elena@driver.com', 'delivery_driver', 1, 1, '2024-01-14 16:00:00');

-- Insert test businesses
INSERT INTO businesses (id, name, description, type, address, phone, email, latitude, longitude, isActive, deliveryFee, minOrderAmount, ownerId, createdAt) VALUES
('bus1', 'Tacos El Güero', 'Los mejores tacos de Autlán', 'restaurant', 'Av. Hidalgo 123, Autlán', '+523171234567', 'tacos@elguero.com', '19.7717', '-104.3606', 1, 2500, 8000, 'user2', '2024-01-10 09:30:00'),
('bus2', 'Pizza Napoli', 'Auténtica pizza italiana', 'restaurant', 'Calle Morelos 456, Autlán', '+523171234568', 'info@pizzanapoli.com', '19.7720', '-104.3610', 1, 3000, 12000, 'user7', '2024-01-08 11:00:00'),
('bus3', 'Café Central', 'Café y postres artesanales', 'restaurant', 'Plaza Principal 789, Autlán', '+523171234569', 'hola@cafecentral.com', '19.7715', '-104.3608', 1, 1500, 5000, 'user2', '2024-01-10 12:00:00'),
('bus4', 'Mercado San Juan', 'Frutas y verduras frescas', 'market', 'Mercado Municipal, Autlán', '+523171234570', 'mercado@sanjuan.com', '19.7712', '-104.3605', 1, 2000, 3000, 'user7', '2024-01-08 13:00:00'),
('bus5', 'Sushi Zen', 'Sushi fresco y delicioso', 'restaurant', 'Av. Constitución 321, Autlán', '+523171234571', 'info@sushizen.com', '19.7725', '-104.3615', 0, 3500, 15000, 'user2', '2024-01-10 14:00:00');

-- Insert test products
INSERT INTO products (id, businessId, name, description, price, category, image, isAvailable, isWeightBased, weightUnit, pricePerUnit, createdAt) VALUES
('prod1', 'bus1', 'Tacos de Carnitas', 'Deliciosos tacos de carnitas con cebolla y cilantro', 1500, 'Tacos', '', 1, 0, NULL, NULL, '2024-01-10 10:00:00'),
('prod2', 'bus1', 'Quesadilla de Queso', 'Quesadilla grande con queso Oaxaca', 2500, 'Quesadillas', '', 1, 0, NULL, NULL, '2024-01-10 10:15:00'),
('prod3', 'bus1', 'Torta Ahogada', 'Torta tradicional tapatía', 4500, 'Tortas', '', 1, 0, NULL, NULL, '2024-01-10 10:30:00'),
('prod4', 'bus2', 'Pizza Margherita', 'Pizza clásica con tomate, mozzarella y albahaca', 18000, 'Pizza', '', 1, 0, NULL, NULL, '2024-01-08 11:30:00'),
('prod5', 'bus2', 'Pizza Pepperoni', 'Pizza con pepperoni y queso mozzarella', 22000, 'Pizza', '', 1, 0, NULL, NULL, '2024-01-08 11:45:00'),
('prod6', 'bus2', 'Lasagna', 'Lasagna casera con carne y queso', 16000, 'Pasta', '', 1, 0, NULL, NULL, '2024-01-08 12:00:00'),
('prod7', 'bus3', 'Cappuccino', 'Café cappuccino con leche espumada', 4500, 'Bebidas', '', 1, 0, NULL, NULL, '2024-01-10 12:30:00'),
('prod8', 'bus3', 'Cheesecake', 'Pastel de queso con frutos rojos', 6500, 'Postres', '', 1, 0, NULL, NULL, '2024-01-10 12:45:00'),
('prod9', 'bus3', 'Sandwich Club', 'Sandwich con pollo, tocino y vegetales', 8500, 'Sandwiches', '', 1, 0, NULL, NULL, '2024-01-10 13:00:00'),
('prod10', 'bus4', 'Manzanas', 'Manzanas rojas frescas', 3500, 'Frutas', '', 1, 1, 'kg', 3500, '2024-01-08 13:30:00'),
('prod11', 'bus4', 'Tomates', 'Tomates frescos para ensalada', 2800, 'Verduras', '', 1, 1, 'kg', 2800, '2024-01-08 13:45:00'),
('prod12', 'bus4', 'Aguacates', 'Aguacates Hass maduros', 8000, 'Frutas', '', 1, 1, 'kg', 8000, '2024-01-08 14:00:00'),
('prod13', 'bus5', 'Sushi Roll California', 'Roll con cangrejo, aguacate y pepino', 12000, 'Sushi', '', 0, 0, NULL, NULL, '2024-01-10 14:30:00'),
('prod14', 'bus5', 'Sashimi Salmón', 'Sashimi fresco de salmón', 15000, 'Sashimi', '', 0, 0, NULL, NULL, '2024-01-10 14:45:00');

-- Insert delivery drivers
INSERT INTO delivery_drivers (id, userId, vehicleType, licenseNumber, isAvailable, currentLatitude, currentLongitude, rating, totalDeliveries, createdAt) VALUES
('driver1', 'user3', 'motorcycle', 'ABC123', 1, '19.7718', '-104.3607', 4.8, 45, '2024-01-12 11:30:00'),
('driver2', 'user8', 'bicycle', 'XYZ789', 1, '19.7720', '-104.3610', 4.6, 32, '2024-01-14 16:30:00');

-- Insert test orders with realistic data
INSERT INTO orders (id, customerId, businessId, driverId, status, total, subtotal, deliveryFee, tax, paymentMethod, deliveryAddress, deliveryLatitude, deliveryLongitude, specialInstructions, createdAt, updatedAt) VALUES
('ord1', 'user1', 'bus1', 'user3', 'delivered', 7000, 6000, 2500, 500, 'card', 'Calle Juárez 456, Autlán', '19.7722', '-104.3612', 'Tocar el timbre', '2024-01-25 12:00:00', '2024-01-25 12:45:00'),
('ord2', 'user6', 'bus2', 'user8', 'delivered', 25000, 22000, 3000, 0, 'cash', 'Av. Revolución 789, Autlán', '19.7710', '-104.3600', '', '2024-01-25 13:30:00', '2024-01-25 14:15:00'),
('ord3', 'user1', 'bus3', NULL, 'pending', 13000, 11500, 1500, 0, 'card', 'Calle Hidalgo 123, Autlán', '19.7725', '-104.3615', 'Sin cebolla', '2024-01-26 10:15:00', '2024-01-26 10:15:00'),
('ord4', 'user6', 'bus1', 'user3', 'on_the_way', 9500, 7000, 2500, 0, 'card', 'Plaza Central 321, Autlán', '19.7715', '-104.3608', '', '2024-01-26 11:00:00', '2024-01-26 11:30:00'),
('ord5', 'user1', 'bus2', NULL, 'confirmed', 20000, 18000, 3000, 0, 'cash', 'Calle Morelos 654, Autlán', '19.7718', '-104.3605', 'Extra queso', '2024-01-26 12:00:00', '2024-01-26 12:05:00'),
('ord6', 'user6', 'bus4', 'user8', 'preparing', 8500, 6500, 2000, 0, 'card', 'Av. Independencia 987, Autlán', '19.7712', '-104.3620', '', '2024-01-26 12:30:00', '2024-01-26 12:35:00'),
('ord7', 'user1', 'bus1', 'user3', 'delivered', 6000, 4500, 2500, 0, 'card', 'Calle Zaragoza 147, Autlán', '19.7720', '-104.3610', '', '2024-01-24 14:00:00', '2024-01-24 14:40:00'),
('ord8', 'user6', 'bus3', 'user8', 'delivered', 15000, 13500, 1500, 0, 'cash', 'Av. Juárez 258, Autlán', '19.7714', '-104.3607', '', '2024-01-24 16:30:00', '2024-01-24 17:10:00'),
('ord9', 'user1', 'bus2', NULL, 'cancelled', 24000, 22000, 3000, 0, 'card', 'Calle Allende 369, Autlán', '19.7716', '-104.3612', '', '2024-01-23 19:00:00', '2024-01-23 19:15:00'),
('ord10', 'user6', 'bus1', 'user3', 'delivered', 8000, 6500, 2500, 0, 'cash', 'Plaza Hidalgo 741, Autlán', '19.7719', '-104.3609', '', '2024-01-23 20:15:00', '2024-01-23 20:55:00');

-- Insert order items
INSERT INTO order_items (id, orderId, productId, quantity, price, specialInstructions) VALUES
('item1', 'ord1', 'prod1', 2, 1500, ''),
('item2', 'ord1', 'prod2', 1, 2500, ''),
('item3', 'ord2', 'prod4', 1, 18000, ''),
('item4', 'ord2', 'prod5', 1, 22000, ''),
('item5', 'ord3', 'prod7', 2, 4500, ''),
('item6', 'ord3', 'prod8', 1, 6500, ''),
('item7', 'ord4', 'prod1', 3, 1500, ''),
('item8', 'ord4', 'prod3', 1, 4500, ''),
('item9', 'ord5', 'prod4', 1, 18000, ''),
('item10', 'ord6', 'prod10', 2, 3500, ''),
('item11', 'ord6', 'prod11', 1, 2800, ''),
('item12', 'ord7', 'prod1', 3, 1500, ''),
('item13', 'ord8', 'prod7', 1, 4500, ''),
('item14', 'ord8', 'prod8', 1, 6500, ''),
('item15', 'ord8', 'prod9', 1, 8500, ''),
('item16', 'ord9', 'prod4', 1, 18000, ''),
('item17', 'ord9', 'prod6', 1, 16000, ''),
('item18', 'ord10', 'prod1', 2, 1500, ''),
('item19', 'ord10', 'prod2', 1, 2500, '');

-- Insert wallets for users
INSERT INTO wallets (id, userId, balance, pendingBalance, totalEarnings, createdAt) VALUES
('wallet1', 'user1', 0, 0, 0, '2024-01-15 10:00:00'),
('wallet2', 'user2', 45000, 5000, 85000, '2024-01-10 09:00:00'),
('wallet3', 'user3', 12000, 2000, 28000, '2024-01-12 11:00:00'),
('wallet4', 'user6', 0, 0, 0, '2024-01-20 14:00:00'),
('wallet5', 'user7', 38000, 8000, 72000, '2024-01-08 10:30:00'),
('wallet6', 'user8', 8500, 1500, 18500, '2024-01-14 16:00:00');

SELECT 'Demo data loaded successfully!' as message;
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_businesses FROM businesses;
SELECT COUNT(*) as total_products FROM products;
SELECT COUNT(*) as total_orders FROM orders;
SELECT SUM(total) as total_revenue FROM orders WHERE status = 'delivered';