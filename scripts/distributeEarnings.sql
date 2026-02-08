-- Script para crear transacciones faltantes de business owners
-- Basado en los pedidos entregados con business_earnings calculadas

INSERT INTO transactions (
    wallet_id,
    user_id,
    order_id,
    type,
    amount,
    balance_before,
    balance_after,
    description,
    status,
    created_at
)
SELECT 
    w.id as wallet_id,
    o.business_id as user_id,
    o.id as order_id,
    CASE 
        WHEN o.payment_method = 'cash' THEN 'cash_income'
        ELSE 'income'
    END as type,
    o.business_earnings as amount,
    w.balance as balance_before,
    w.balance + o.business_earnings as balance_after,
    CONCAT('Earnings from order #', RIGHT(o.id, 6)) as description,
    'completed' as status,
    o.updated_at as created_at
FROM orders o
JOIN wallets w ON w.user_id = o.business_id
WHERE o.status = 'delivered' 
    AND o.business_earnings > 0
    AND NOT EXISTS (
        SELECT 1 FROM transactions t 
        WHERE t.order_id = o.id 
        AND t.user_id = o.business_id 
        AND t.type IN ('income', 'cash_income')
    );

-- Actualizar balances de wallets
UPDATE wallets w
SET 
    balance = (
        SELECT COALESCE(SUM(t.amount), 0)
        FROM transactions t
        WHERE t.user_id = w.user_id 
        AND t.status = 'completed'
        AND t.type IN ('income', 'cash_income')
    ),
    total_earned = (
        SELECT COALESCE(SUM(t.amount), 0)
        FROM transactions t
        WHERE t.user_id = w.user_id 
        AND t.status = 'completed'
        AND t.type IN ('income', 'cash_income')
        AND t.amount > 0
    )
WHERE w.user_id IN (
    SELECT DISTINCT o.business_id 
    FROM orders o 
    WHERE o.status = 'delivered' 
    AND o.business_earnings > 0
);