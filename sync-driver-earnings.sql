-- Sincronizar ganancias de drivers
-- Este script actualiza los wallets y crea transacciones para pedidos completados

USE nemy_db_local;

-- 1. Actualizar wallets de drivers con ganancias de pedidos entregados
UPDATE wallets w
INNER JOIN (
    SELECT 
        o.delivery_person_id,
        SUM(ROUND(o.total * 0.15)) as total_earnings
    FROM orders o
    WHERE o.status = 'delivered'
    AND o.delivery_person_id IS NOT NULL
    AND NOT EXISTS (
        SELECT 1 FROM transactions t 
        WHERE t.order_id = o.id 
        AND t.user_id = o.delivery_person_id
        AND t.type = 'delivery_payment'
    )
    GROUP BY o.delivery_person_id
) earnings ON w.user_id = earnings.delivery_person_id
SET 
    w.balance = w.balance + earnings.total_earnings,
    w.total_earned = w.total_earned + earnings.total_earnings;

-- 2. Crear transacciones para pedidos sin transacción
INSERT INTO transactions (user_id, order_id, type, amount, status, description, created_at)
SELECT 
    o.delivery_person_id,
    o.id,
    'delivery_payment',
    ROUND(o.total * 0.15),
    'completed',
    CONCAT('Entrega de pedido #', SUBSTRING(o.id, -6)),
    NOW()
FROM orders o
WHERE o.status = 'delivered'
AND o.delivery_person_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM transactions t 
    WHERE t.order_id = o.id 
    AND t.user_id = o.delivery_person_id
    AND t.type = 'delivery_payment'
);

-- 3. Actualizar pedidos con comisiones
UPDATE orders o
SET 
    o.delivery_earnings = ROUND(o.total * 0.15),
    o.platform_fee = ROUND(o.total * 0.15),
    o.business_earnings = ROUND(o.total * 0.70)
WHERE o.status = 'delivered'
AND o.delivery_person_id IS NOT NULL
AND (o.delivery_earnings IS NULL OR o.delivery_earnings = 0);

-- Mostrar resultados
SELECT 
    'Wallets actualizados' as accion,
    COUNT(*) as cantidad
FROM wallets w
WHERE EXISTS (
    SELECT 1 FROM orders o 
    WHERE o.delivery_person_id = w.user_id 
    AND o.status = 'delivered'
)
UNION ALL
SELECT 
    'Transacciones creadas',
    COUNT(*)
FROM transactions
WHERE type = 'delivery_payment'
UNION ALL
SELECT 
    'Pedidos actualizados',
    COUNT(*)
FROM orders
WHERE status = 'delivered'
AND delivery_earnings > 0;
