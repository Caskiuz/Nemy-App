-- Quick fix for admin panel data
USE nemy_db_local;

-- Insert demo users if they don't exist
INSERT IGNORE INTO users (id, phone, name, email, role, phoneVerified, isActive, createdAt) VALUES
('user1', '+52 341 123 4567', 'Juan Pérez', 'juan@customer.com', 'customer', 1, 1, NOW()),
('user2', '+52 341 234 5678', 'María González', 'maria@tacoselguero.com', 'business_owner', 1, 1, NOW()),
('user3', '+52 341 345 6789', 'Carlos Ramírez', 'carlos@driver.com', 'delivery_driver', 1, 1, NOW()),
('user4', '+52 341 456 7890', 'Ana López', 'ana@admin.com', 'admin', 1, 1, NOW()),
('user5', '+52 341 567 8901', 'Roberto Silva', 'roberto@superadmin.com', 'super_admin', 1, 1, NOW());

-- Insert demo businesses if they don't exist
INSERT IGNORE INTO businesses (id, name, description, type, address, phone, email, latitude, longitude, isActive, deliveryFee, minOrderAmount, ownerId, createdAt) VALUES
('bus1', 'Tacos El Güero', 'Los mejores tacos de Autlán', 'restaurant', 'Av. Hidalgo 123, Autlán', '+523171234567', 'tacos@elguero.com', '19.7717', '-104.3606', 1, 2500, 8000, 'user2', NOW()),
('bus2', 'Pizza Napoli', 'Auténtica pizza italiana', 'restaurant', 'Calle Morelos 456, Autlán', '+523171234568', 'info@pizzanapoli.com', '19.7720', '-104.3610', 1, 3000, 12000, 'user2', NOW());

-- Insert demo orders if they don't exist
INSERT IGNORE INTO orders (id, customerId, businessId, driverId, status, total, subtotal, deliveryFee, tax, paymentMethod, deliveryAddress, deliveryLatitude, deliveryLongitude, createdAt, updatedAt) VALUES
('ord1', 'user1', 'bus1', 'user3', 'delivered', 7000, 6000, 2500, 500, 'card', 'Calle Juárez 456, Autlán', '19.7722', '-104.3612', NOW(), NOW()),
('ord2', 'user1', 'bus2', 'user3', 'delivered', 25000, 22000, 3000, 0, 'cash', 'Av. Revolución 789, Autlán', '19.7710', '-104.3600', NOW(), NOW()),
('ord3', 'user1', 'bus1', NULL, 'pending', 13000, 11500, 1500, 0, 'card', 'Calle Hidalgo 123, Autlán', '19.7725', '-104.3615', NOW(), NOW());

-- Insert demo wallets if they don't exist
INSERT IGNORE INTO wallets (id, userId, balance, pendingBalance, totalEarnings, createdAt) VALUES
('wallet1', 'user1', 0, 0, 0, NOW()),
('wallet2', 'user2', 45000, 5000, 85000, NOW()),
('wallet3', 'user3', 12000, 2000, 28000, NOW());

-- Show results
SELECT 'Admin data fixed!' as message;
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_businesses FROM businesses;
SELECT COUNT(*) as total_orders FROM orders;
SELECT ROUND(SUM(total)/100, 2) as total_revenue_pesos FROM orders WHERE status = 'delivered';