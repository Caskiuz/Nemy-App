-- ============================================
-- SCRIPT DE SINCRONIZACIÓN DE FONDOS
-- Libera fondos de pedidos entregados
-- ============================================

USE nemy_db_local;

-- 1. Ver pedidos entregados sin comisiones
SELECT '=== PEDIDOS SIN PROCESAR ===' as info;

SELECT 
    id,
    total / 100 as total_pesos,
    status,
    business_id,
    delivery_person_id,
    delivered_at,
    business_earnings,
    delivery_earnings_amount
FROM orders
WHERE status = 'delivered'
  AND business_earnings IS NULL;

-- 2. Calcular y actualizar comisiones para pedidos entregados
SELECT '=== ACTUALIZANDO COMISIONES ===' as info;

UPDATE orders
SET 
    platform_fee = FLOOR(total * 0.15),
    business_earnings = total - FLOOR(total * 0.15) - FLOOR(total * 0.15),
    delivery_earnings_amount = FLOOR(total * 0.15)
WHERE status = 'delivered'
  AND business_earnings IS NULL;

-- 3. Crear wallets si no existen para negocios
INSERT INTO wallets (userId, balance, pendingBalance, totalEarned, totalWithdrawn)
SELECT DISTINCT 
    business_id,
    0,
    0,
    0,
    0
FROM orders
WHERE status = 'delivered'
  AND NOT EXISTS (
    SELECT 1 FROM wallets w WHERE w.userId = orders.business_id
  );

-- 4. Crear wallets si no existen para repartidores
INSERT INTO wallets (userId, balance, pendingBalance, totalEarned, totalWithdrawn)
SELECT DISTINCT 
    delivery_person_id,
    0,
    0,
    0,
    0
FROM orders
WHERE status = 'delivered'
  AND delivery_person_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM wallets w WHERE w.userId = orders.delivery_person_id
  );

-- 5. Actualizar balance de wallets de negocios
UPDATE wallets w
INNER JOIN (
    SELECT 
        business_id,
        SUM(business_earnings) as total_earnings
    FROM orders
    WHERE status = 'delivered'
      AND business_earnings IS NOT NULL
    GROUP BY business_id
) earnings ON w.userId = earnings.business_id
SET 
    w.balance = COALESCE(earnings.total_earnings, 0),
    w.totalEarned = COALESCE(earnings.total_earnings, 0);

-- 6. Actualizar balance de wallets de repartidores
UPDATE wallets w
INNER JOIN (
    SELECT 
        delivery_person_id,
        SUM(delivery_earnings_amount) as total_earnings
    FROM orders
    WHERE status = 'delivered'
      AND delivery_person_id IS NOT NULL
      AND delivery_earnings_amount IS NOT NULL
    GROUP BY delivery_person_id
) earnings ON w.userId = earnings.delivery_person_id
SET 
    w.balance = COALESCE(earnings.total_earnings, 0),
    w.totalEarned = COALESCE(earnings.total_earnings, 0);

-- 7. Crear transacciones para negocios (si no existen)
INSERT INTO transactions (walletId, userId, orderId, type, amount, description, status, createdAt)
SELECT 
    w.id,
    o.business_id,
    o.id,
    'order_payment',
    o.business_earnings,
    CONCAT('Ganancias del pedido #', SUBSTRING(o.id, -6)),
    'completed',
    NOW()
FROM orders o
INNER JOIN wallets w ON w.userId = o.business_id
WHERE o.status = 'delivered'
  AND o.business_earnings IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM transactions t 
    WHERE t.orderId = o.id 
      AND t.userId = o.business_id
      AND t.type = 'order_payment'
  );

-- 8. Crear transacciones para repartidores (si no existen)
INSERT INTO transactions (walletId, userId, orderId, type, amount, description, status, createdAt)
SELECT 
    w.id,
    o.delivery_person_id,
    o.id,
    'delivery_payment',
    o.delivery_earnings_amount,
    CONCAT('Pago por entrega #', SUBSTRING(o.id, -6)),
    'completed',
    NOW()
FROM orders o
INNER JOIN wallets w ON w.userId = o.delivery_person_id
WHERE o.status = 'delivered'
  AND o.delivery_person_id IS NOT NULL
  AND o.delivery_earnings_amount IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM transactions t 
    WHERE t.orderId = o.id 
      AND t.userId = o.delivery_person_id
      AND t.type = 'delivery_payment'
  );

-- 9. Verificar resultados
SELECT '=== RESULTADOS ===' as info;

-- Wallets actualizados
SELECT 
    u.name,
    u.role,
    w.balance / 100 as balance_pesos,
    w.totalEarned / 100 as total_ganado_pesos,
    (SELECT COUNT(*) FROM transactions t WHERE t.userId = w.userId) as num_transacciones
FROM wallets w
INNER JOIN users u ON u.id = w.userId
WHERE w.balance > 0
ORDER BY w.balance DESC;

-- Pedidos procesados
SELECT 
    COUNT(*) as total_pedidos_entregados,
    SUM(CASE WHEN business_earnings IS NOT NULL THEN 1 ELSE 0 END) as con_comisiones,
    SUM(CASE WHEN business_earnings IS NULL THEN 1 ELSE 0 END) as sin_comisiones
FROM orders
WHERE status = 'delivered';

SELECT '=== SINCRONIZACIÓN COMPLETADA ===' as info;
