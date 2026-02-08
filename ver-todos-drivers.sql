-- Ver TODOS los usuarios y sus wallets
SELECT 
    u.id,
    u.name,
    u.role,
    COALESCE(w.balance / 100, 0) as balance_pesos,
    COALESCE(w.total_earned / 100, 0) as earned_pesos,
    (SELECT COUNT(*) FROM orders o WHERE o.delivery_person_id = u.id AND o.status = 'delivered') as pedidos_entregados
FROM users u
LEFT JOIN wallets w ON w.user_id = u.id
WHERE u.role = 'delivery_driver'
ORDER BY u.name;
