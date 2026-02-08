-- Crear pedidos de efectivo listos para repartidor
-- Ejecutar: mysql -u root -p137920 nemy_db_local < createCashOrders.sql

INSERT INTO orders (
  user_id, 
  business_id, 
  business_name, 
  items, 
  status, 
  subtotal, 
  delivery_fee, 
  total, 
  payment_method, 
  delivery_address,
  business_response_at,
  confirmed_to_business_at
) VALUES 
('customer1', 'business1', 'Tacos El Güero', '[{"name":"Tacos de Pastor","quantity":3,"price":1500}]', 'ready', 4500, 2500, 7000, 'cash', 'Calle Hidalgo 123, Autlán', NOW(), NOW()),
('customer2', 'business2', 'Pizza Napoli', '[{"name":"Pizza Hawaiana","quantity":1,"price":18000}]', 'ready', 18000, 3000, 21000, 'cash', 'Av. Revolución 456, Autlán', NOW(), NOW()),
('customer3', 'business1', 'Tacos El Güero', '[{"name":"Quesadillas","quantity":2,"price":2000},{"name":"Refresco","quantity":1,"price":1500}]', 'ready', 5500, 2500, 8000, 'cash', 'Colonia Centro 789, Autlán', NOW(), NOW()),
('customer4', 'business3', 'Farmacia San José', '[{"name":"Paracetamol","quantity":1,"price":3500}]', 'ready', 3500, 2000, 5500, 'cash', 'Calle Morelos 321, Autlán', NOW(), NOW()),
('customer5', 'business2', 'Pizza Napoli', '[{"name":"Pizza Pepperoni","quantity":1,"price":16000},{"name":"Coca Cola","quantity":2,"price":3000}]', 'ready', 19000, 3000, 22000, 'cash', 'Fraccionamiento Las Flores 654, Autlán', NOW(), NOW());

-- Verificar pedidos creados
SELECT id, business_name, total, payment_method, status FROM orders WHERE payment_method = 'cash' AND status = 'ready' ORDER BY created_at DESC LIMIT 10;