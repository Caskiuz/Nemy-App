-- Dar balance a Carlos Restaurante para testing
-- Simular ganancias de pedidos entregados

-- Actualizar wallet de Carlos
UPDATE wallets 
SET 
    balance = 25000,
    total_earned = 25000,
    updated_at = NOW()
WHERE user_id = 'business-owner-1';

-- Crear transacciones de ejemplo
INSERT INTO transactions (
    user_id,
    order_id,
    type,
    amount,
    balance_before,
    balance_after,
    description,
    status,
    created_at
) VALUES 
(
    'business-owner-1',
    'test-order-1',
    'income',
    15000,
    0,
    15000,
    'Ganancias de pedido #test001',
    'completed',
    NOW()
),
(
    'business-owner-1',
    'test-order-2', 
    'income',
    10000,
    15000,
    25000,
    'Ganancias de pedido #test002',
    'completed',
    NOW()
);

-- Verificar resultado
SELECT 
    w.balance,
    w.total_earned,
    u.name,
    u.phone
FROM wallets w 
JOIN users u ON w.user_id = u.id 
WHERE w.user_id = 'business-owner-1';