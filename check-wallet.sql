-- Verificar wallet del driver
SELECT 
    w.user_id,
    u.name,
    w.balance / 100 as balance_pesos,
    w.total_earned / 100 as total_earned_pesos,
    w.cash_owed / 100 as cash_owed_pesos,
    (SELECT COUNT(*) FROM transactions t WHERE t.user_id = w.user_id) as num_transactions
FROM wallets w
JOIN users u ON u.id = w.user_id
WHERE u.role = 'delivery_driver';
