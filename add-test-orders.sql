-- Agregar pedidos de prueba en status "ready" para que el repartidor los acepte
-- Necesitas ganar $19 más para llegar a $100 (tienes $81)
-- Con 15% de comisión, necesitas entregar pedidos por $127 total
-- Voy a crear 2 pedidos de $65 cada uno = $130 total → $19.50 de ganancia

INSERT INTO orders (
  id,
  user_id,
  business_id,
  business_name,
  business_image,
  items,
  status,
  subtotal,
  delivery_fee,
  total,
  payment_method,
  delivery_address,
  notes,
  created_at
) VALUES
-- Pedido 1: $65.00
(
  UUID(),
  '323bc96b-0066-11f1-a5c3-1866da2fd9d2',
  'bcf15003-0001-11f1-a5c3-1866da2fd9d2',
  'Tacos El Güero',
  'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400',
  '[{"id":"prod-1","name":"Tacos de Asada","price":5000,"quantity":1},{"id":"prod-2","name":"Quesadilla","price":4000,"quantity":1}]',
  'ready',
  5500,
  1000,
  6500,
  'card',
  '{"street":"Calle Juárez 123","city":"Autlán","state":"Jalisco","zipCode":"48900","coordinates":{"latitude":19.7717,"longitude":-104.3659}}',
  'Sin cebolla por favor',
  NOW()
),
-- Pedido 2: $65.00
(
  UUID(),
  '323bc96b-0066-11f1-a5c3-1866da2fd9d2',
  'bcf3a84a-0001-11f1-a5c3-1866da2fd9d2',
  'Burger House',
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
  '[{"id":"prod-3","name":"Hamburguesa Clásica","price":5500,"quantity":1},{"id":"prod-4","name":"Papas Fritas","price":3000,"quantity":1}]',
  'ready',
  5500,
  1000,
  6500,
  'card',
  '{"street":"Av. Revolución 456","city":"Autlán","state":"Jalisco","zipCode":"48900","coordinates":{"latitude":19.7720,"longitude":-104.3650}}',
  'Extra salsa',
  NOW()
);
