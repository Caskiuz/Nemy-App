-- Crear usuarios de prueba
INSERT INTO users (id, name, email, phone, role, phoneVerified, isActive, createdAt, updatedAt) VALUES
('user1', 'Juan Pérez', 'juan@test.com', '+523121234567', 'customer', true, true, NOW(), NOW()),
('user2', 'María García', 'maria@test.com', '+523121234568', 'customer', true, true, NOW(), NOW()),
('user3', 'Carlos López', 'carlos@test.com', '+523121234569', 'delivery_driver', true, true, NOW(), NOW()),
('user4', 'Ana Martínez', 'ana@test.com', '+523121234570', 'business', true, true, NOW(), NOW()),
('admin1', 'Admin NEMY', 'admin@nemy.com', '+523121234571', 'admin', true, true, NOW(), NOW());

-- Crear negocios de prueba
INSERT INTO businesses (id, name, description, category, address, latitude, longitude, phone, email, isActive, createdAt, updatedAt) VALUES
('biz1', 'Tacos El Güero', 'Los mejores tacos de Autlán', 'Comida Mexicana', 'Centro de Autlán', 20.6736, -104.3647, '+523121234572', 'tacos@test.com', true, NOW(), NOW()),
('biz2', 'Pizza Roma', 'Pizzas artesanales', 'Pizzas', 'Col. Centro', 20.6740, -104.3650, '+523121234573', 'pizza@test.com', true, NOW(), NOW());

-- Crear pedidos de prueba
INSERT INTO orders (id, userId, businessId, businessName, status, subtotal, deliveryFee, total, paymentMethod, deliveryAddress, items, createdAt, updatedAt) VALUES
('order1', 'user1', 'biz1', 'Tacos El Güero', 'pending', 15000, 2000, 17000, 'card', 'Calle Principal 123', '[]', NOW(), NOW()),
('order2', 'user2', 'biz2', 'Pizza Roma', 'confirmed', 25000, 2000, 27000, 'cash', 'Av. Revolución 456', '[]', NOW(), NOW()),
('order3', 'user1', 'biz1', 'Tacos El Güero', 'delivered', 12000, 2000, 14000, 'card', 'Col. Centro 789', '[]', DATE_SUB(NOW(), INTERVAL 1 DAY), NOW());