-- LIBERAR FONDOS INMEDIATAMENTE
-- Password: 137920

-- 1. Ver pedidos entregados
SELECT 
  id,
  status,
  total,
  deliveryPersonId,
  businessId,
  deliveryEarnings,
  businessEarnings
FROM orders 
WHERE status = 'delivered';

-- 2. Calcular comisiones para pedidos sin ellas
UPDATE orders 
SET 
  platformFee = FLOOR(total * 0.15),
  businessEarnings = total - FLOOR(total * 0.15) - FLOOR(total * 0.15),
  deliveryEarnings = FLOOR(total * 0.15)
WHERE status = 'delivered' 
  AND (platformFee IS NULL OR businessEarnings IS NULL);

-- 3. Crear wallets para repartidores
INSERT INTO wallets (userId, balance, pendingBalance, totalEarned, totalWithdrawn)
SELECT DISTINCT 
  o.deliveryPersonId,
  COALESCE(SUM(o.deliveryEarnings), 0),
  0,
  COALESCE(SUM(o.deliveryEarnings), 0),
  0
FROM orders o
WHERE o.status = 'delivered' 
  AND o.deliveryPersonId IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM wallets w WHERE w.userId = o.deliveryPersonId)
GROUP BY o.deliveryPersonId;

-- 4. Actualizar wallets existentes de repartidores
UPDATE wallets w
SET 
  balance = balance + (
    SELECT COALESCE(SUM(o.deliveryEarnings), 0)
    FROM orders o
    WHERE o.deliveryPersonId = w.userId 
      AND o.status = 'delivered'
      AND o.deliveryEarnings IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM transactions t 
        WHERE t.orderId = o.id 
          AND t.userId = w.userId 
          AND t.type = 'delivery_payment'
      )
  ),
  totalEarned = totalEarned + (
    SELECT COALESCE(SUM(o.deliveryEarnings), 0)
    FROM orders o
    WHERE o.deliveryPersonId = w.userId 
      AND o.status = 'delivered'
      AND o.deliveryEarnings IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM transactions t 
        WHERE t.orderId = o.id 
          AND t.userId = w.userId 
          AND t.type = 'delivery_payment'
      )
  )
WHERE EXISTS (
  SELECT 1 FROM orders o
  WHERE o.deliveryPersonId = w.userId 
    AND o.status = 'delivered'
    AND o.deliveryEarnings IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM transactions t 
      WHERE t.orderId = o.id 
        AND t.userId = w.userId 
        AND t.type = 'delivery_payment'
    )
);

-- 5. Crear wallets para negocios
INSERT INTO wallets (userId, balance, pendingBalance, totalEarned, totalWithdrawn)
SELECT DISTINCT 
  o.businessId,
  COALESCE(SUM(o.businessEarnings), 0),
  0,
  COALESCE(SUM(o.businessEarnings), 0),
  0
FROM orders o
WHERE o.status = 'delivered' 
  AND o.businessEarnings IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM wallets w WHERE w.userId = o.businessId)
GROUP BY o.businessId;

-- 6. Actualizar wallets existentes de negocios
UPDATE wallets w
SET 
  balance = balance + (
    SELECT COALESCE(SUM(o.businessEarnings), 0)
    FROM orders o
    WHERE o.businessId = w.userId 
      AND o.status = 'delivered'
      AND o.businessEarnings IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM transactions t 
        WHERE t.orderId = o.id 
          AND t.userId = w.userId 
          AND t.type = 'order_payment'
      )
  ),
  totalEarned = totalEarned + (
    SELECT COALESCE(SUM(o.businessEarnings), 0)
    FROM orders o
    WHERE o.businessId = w.userId 
      AND o.status = 'delivered'
      AND o.businessEarnings IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM transactions t 
        WHERE t.orderId = o.id 
          AND t.userId = w.userId 
          AND t.type = 'order_payment'
      )
  )
WHERE EXISTS (
  SELECT 1 FROM orders o
  WHERE o.businessId = w.userId 
    AND o.status = 'delivered'
    AND o.businessEarnings IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM transactions t 
      WHERE t.orderId = o.id 
        AND t.userId = w.userId 
        AND t.type = 'order_payment'
    )
);

-- 7. Crear transacciones de registro
INSERT INTO transactions (userId, orderId, type, amount, status, description)
SELECT 
  o.deliveryPersonId,
  o.id,
  'delivery_payment',
  o.deliveryEarnings,
  'completed',
  CONCAT('Entrega de pedido #', SUBSTRING(o.id, -6))
FROM orders o
WHERE o.status = 'delivered'
  AND o.deliveryPersonId IS NOT NULL
  AND o.deliveryEarnings IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM transactions t 
    WHERE t.orderId = o.id 
      AND t.userId = o.deliveryPersonId 
      AND t.type = 'delivery_payment'
  );

INSERT INTO transactions (userId, orderId, type, amount, status, description)
SELECT 
  o.businessId,
  o.id,
  'order_payment',
  o.businessEarnings,
  'completed',
  CONCAT('Pago por pedido #', SUBSTRING(o.id, -6))
FROM orders o
WHERE o.status = 'delivered'
  AND o.businessEarnings IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM transactions t 
    WHERE t.orderId = o.id 
      AND t.userId = o.businessId 
      AND t.type = 'order_payment'
  );

-- 8. VERIFICAR RESULTADOS
SELECT 'WALLETS' as tabla, COUNT(*) as registros, SUM(balance) as total_balance FROM wallets;
SELECT 'TRANSACCIONES' as tabla, COUNT(*) as registros, SUM(amount) as total_monto FROM transactions WHERE status = 'completed';
SELECT 'PEDIDOS ENTREGADOS' as tabla, COUNT(*) as registros, SUM(total) as total_monto FROM orders WHERE status = 'delivered';

-- 9. Ver wallets con balance
SELECT 
  w.userId,
  u.name,
  u.role,
  w.balance,
  w.totalEarned
FROM wallets w
JOIN users u ON u.id = w.userId
WHERE w.balance > 0
ORDER BY w.balance DESC;
