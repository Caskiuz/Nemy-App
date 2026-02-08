-- Crear pedidos LISTOS para que aparezcan como disponibles
INSERT INTO orders (
  id, userId, businessId, businessName, businessImage, items, status, 
  subtotal, deliveryFee, total, paymentMethod, deliveryAddress, 
  deliveryPersonId, notes, createdAt
) VALUES 
(
  'available-order-1', 
  'customer-1', 
  'business-1', 
  'Tacos El Güero',
  'https://images.unsplash.com/photo-1565299585323-38d6b0865b47',
  '[{"id":"prod-1","name":"Tacos de Asada","price":6000,"quantity":2}]',
  'ready',
  12000,
  2500,
  14500,
  'card',
  '{"street":"Calle Principal 123","city":"Autlán","state":"Jalisco"}',
  NULL,
  'Sin cebolla',
  NOW()
),
(
  'available-order-2', 
  'customer-2', 
  'business-2', 
  'Burger House',
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
  '[{"id":"prod-3","name":"Hamburguesa Clásica","price":8000,"quantity":1}]',
  'ready',
  8000,
  2500,
  10500,
  'cash',
  '{"street":"Av. Juárez 456","city":"Autlán","state":"Jalisco"}',
  NULL,
  'Extra queso',
  NOW()
),
(
  'available-order-3', 
  'customer-1', 
  'business-1', 
  'Pizza Express',
  'https://images.unsplash.com/photo-1513104890138-7c749659a591',
  '[{"id":"prod-5","name":"Pizza Hawaiana","price":15000,"quantity":1}]',
  'ready',
  15000,
  3000,
  18000,
  'card',
  '{"street":"Calle Morelos 789","city":"Autlán","state":"Jalisco"}',
  NULL,
  'Bien cocida',
  NOW()
);