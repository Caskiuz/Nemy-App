-- DIAGNÓSTICO DE FONDOS
-- Ejecutar este script para ver qué está pasando

-- 1. Ver pedidos entregados
SELECT 
  id,
  status,
  total,
  deliveryPersonId,
  businessId,
  platformFee,
  businessEarnings,
  deliveryEarnings,
  deliveredAt
FROM orders 
WHERE status = 'delivered'
ORDER BY createdAt DESC
LIMIT 10;

-- 2. Ver wallets existentes
SELECT 
  id,
  userId,
  balance,
  pendingBalance,
  totalEarned,
  totalWithdrawn
FROM wallets;

-- 3. Ver transacciones
SELECT 
  id,
  userId,
  type,
  amount,
  status,
  description,
  orderId,
  createdAt
FROM transactions
ORDER BY createdAt DESC
LIMIT 20;

-- 4. Ver usuarios (para identificar IDs)
SELECT 
  id,
  name,
  phone,
  role
FROM users
WHERE role IN ('delivery_driver', 'business_owner');
