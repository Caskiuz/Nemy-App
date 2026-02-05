-- Script para sincronizar fondos de pedidos entregados
-- Ejecutar este script para liberar fondos de pedidos que ya fueron entregados

-- 1. Calcular comisiones para pedidos entregados sin comisiones
UPDATE orders 
SET 
  platformFee = FLOOR(total * 0.15),
  businessEarnings = total - FLOOR(total * 0.15) - FLOOR(total * 0.15),
  deliveryEarnings = FLOOR(total * 0.15)
WHERE status = 'delivered' 
  AND (platformFee IS NULL OR businessEarnings IS NULL OR deliveryEarnings IS NULL);

-- 2. Crear wallets para usuarios que no tienen
INSERT INTO wallets (userId, balance, pendingBalance, totalEarned, totalWithdrawn)
SELECT DISTINCT 
  o.businessId as userId,
  0 as balance,
  0 as pendingBalance,
  0 as totalEarned,
  0 as totalWithdrawn
FROM orders o
LEFT JOIN wallets w ON w.userId = o.businessId
WHERE w.id IS NULL AND o.status = 'delivered';

INSERT INTO wallets (userId, balance, pendingBalance, totalEarned, totalWithdrawn)
SELECT DISTINCT 
  o.deliveryPersonId as userId,
  0 as balance,
  0 as pendingBalance,
  0 as totalEarned,
  0 as totalWithdrawn
FROM orders o
LEFT JOIN wallets w ON w.userId = o.deliveryPersonId
WHERE w.id IS NULL AND o.status = 'delivered' AND o.deliveryPersonId IS NOT NULL;

-- 3. Actualizar balances de wallets con ganancias de pedidos entregados
-- Para negocios
UPDATE wallets w
SET balance = balance + (
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

-- Para repartidores
UPDATE wallets w
SET balance = balance + (
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

-- 4. Crear transacciones para pedidos entregados sin transacciones
-- Para negocios
INSERT INTO transactions (userId, orderId, type, amount, status, description, balanceBefore, balanceAfter)
SELECT 
  o.businessId as userId,
  o.id as orderId,
  'order_payment' as type,
  o.businessEarnings as amount,
  'completed' as status,
  CONCAT('Pago por pedido #', SUBSTRING(o.id, -6)) as description,
  0 as balanceBefore,
  o.businessEarnings as balanceAfter
FROM orders o
WHERE o.status = 'delivered'
  AND o.businessEarnings IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM transactions t 
    WHERE t.orderId = o.id 
      AND t.userId = o.businessId 
      AND t.type = 'order_payment'
  );

-- Para repartidores
INSERT INTO transactions (userId, orderId, type, amount, status, description, balanceBefore, balanceAfter)
SELECT 
  o.deliveryPersonId as userId,
  o.id as orderId,
  'delivery_payment' as type,
  o.deliveryEarnings as amount,
  'completed' as status,
  CONCAT('Entrega de pedido #', SUBSTRING(o.id, -6)) as description,
  0 as balanceBefore,
  o.deliveryEarnings as balanceAfter
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

-- 5. Verificar resultados
SELECT 
  'Pedidos entregados' as tipo,
  COUNT(*) as cantidad,
  SUM(total) as total_monto
FROM orders 
WHERE status = 'delivered';

SELECT 
  'Wallets con balance' as tipo,
  COUNT(*) as cantidad,
  SUM(balance) as total_balance
FROM wallets 
WHERE balance > 0;

SELECT 
  'Transacciones completadas' as tipo,
  COUNT(*) as cantidad,
  SUM(amount) as total_monto
FROM transactions 
WHERE status = 'completed';
