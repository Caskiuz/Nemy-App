-- Crear pedido de prueba para testing de entrega
INSERT INTO orders (
    id,
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
    delivery_latitude,
    delivery_longitude,
    delivery_person_id,
    created_at,
    updated_at,
    picked_up_at
) VALUES (
    'test-delivery-001',
    'customer-1',
    'business-owner-1',
    'Carlos Restaurante',
    '[{"name": "Tacos al Pastor", "quantity": 3, "price": 2500}]',
    'picked_up',
    7500,
    2500,
    10000,
    'cash',
    'Calle Hidalgo 123, Centro, Autlán',
    '20.6736',
    '-104.3647',
    'driver-1',
    NOW(),
    NOW(),
    NOW()
);

-- Verificar que se creó
SELECT id, status, business_name, delivery_person_id, total FROM orders WHERE id = 'test-delivery-001';