-- Limpiar datos existentes
DELETE FROM orders;
DELETE FROM products;
DELETE FROM businesses;
DELETE FROM wallets;
DELETE FROM users WHERE role != 'admin' AND role != 'super_admin';

-- Insertar usuarios
INSERT INTO users (id, phone, name, role, created_at) VALUES
('customer-1', '+523414567890', 'Juan Pérez', 'customer', NOW()),
('customer-2', '+523414567891', 'María García', 'customer', NOW()),
('business-owner-1', '+523414567892', 'Carlos Restaurante', 'business_owner', NOW()),
('business-owner-2', '+523414567893', 'Ana Mercado', 'business_owner', NOW()),
('driver-1', '+523414567894', 'Pedro Repartidor', 'delivery_driver', NOW());

-- Insertar negocios
INSERT INTO businesses (id, owner_id, name, description, type, categories, image, cover_image, rating, delivery_fee, min_order, delivery_time, is_open, created_at) VALUES
('business-1', 'business-owner-1', 'Tacos El Güero', 'Los mejores tacos de Autlán', 'restaurant', 'tacos,mexicana', 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47', 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47', 480, 2500, 5000, '20-30 min', 1, NOW()),
('business-2', 'business-owner-2', 'Super Mercado Central', 'Frutas, verduras y más', 'market', 'mercado,abarrotes', 'https://images.unsplash.com/photo-1542838132-92c53300491e', 'https://images.unsplash.com/photo-1542838132-92c53300491e', 450, 3000, 10000, '30-45 min', 1, NOW());

-- Insertar productos
INSERT INTO products (id, business_id, name, description, price, category, image, is_available, created_at) VALUES
('prod-1', 'business-1', 'Tacos de Asada', '3 tacos con carne asada', 6000, 'tacos', 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47', 1, NOW()),
('prod-2', 'business-1', 'Tacos de Pastor', '3 tacos al pastor', 5500, 'tacos', 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47', 1, NOW()),
('prod-3', 'business-2', 'Aguacate', 'Aguacate fresco por kg', 8000, 'frutas', 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578', 1, NOW());

-- Insertar wallets
INSERT INTO wallets (id, user_id, balance, created_at) VALUES
('wallet-customer-1', 'customer-1', 0, NOW()),
('wallet-business-1', 'business-owner-1', 42000, NOW()),
('wallet-driver-1', 'driver-1', 9000, NOW());

-- Insertar pedido entregado
INSERT INTO orders (
  id, user_id, business_id, business_name, business_image, items, 
  status, subtotal, delivery_fee, total, payment_method, 
  delivery_address, delivery_person_id, created_at, delivered_at,
  platform_fee, business_earnings, delivery_earnings_amount
) VALUES (
  'order-delivered-1',
  'customer-1',
  'business-1',
  'Tacos El Güero',
  'https://images.unsplash.com/photo-1565299585323-38d6b0865b47',
  '[{"id":"prod-1","name":"Tacos de Asada","price":6000,"quantity":2}]',
  'delivered',
  12000,
  2500,
  14500,
  'card',
  '{"street":"Calle Principal 123","city":"Autlán","state":"Jalisco","zipCode":"48900","lat":19.7667,"lng":-104.3667}',
  'driver-1',
  DATE_SUB(NOW(), INTERVAL 2 HOUR),
  DATE_SUB(NOW(), INTERVAL 1 HOUR),
  2175,
  10150,
  2175
);

-- Insertar pedido en curso
INSERT INTO orders (
  id, user_id, business_id, business_name, business_image, items, 
  status, subtotal, delivery_fee, total, payment_method, 
  delivery_address, delivery_person_id, created_at,
  platform_fee, business_earnings, delivery_earnings_amount
) VALUES (
  'order-in-progress-1',
  'customer-2',
  'business-1',
  'Tacos El Güero',
  'https://images.unsplash.com/photo-1565299585323-38d6b0865b47',
  '[{"id":"prod-2","name":"Tacos de Pastor","price":5500,"quantity":3}]',
  'in_transit',
  16500,
  2500,
  19000,
  'card',
  '{"street":"Avenida Juárez 456","city":"Autlán","state":"Jalisco","zipCode":"48900","lat":19.7667,"lng":-104.3667}',
  'driver-1',
  DATE_SUB(NOW(), INTERVAL 30 MINUTE),
  2850,
  13300,
  2850
);
