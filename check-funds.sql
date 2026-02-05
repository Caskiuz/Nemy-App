-- ============================================
-- DIAGNÓSTICO DE FONDOS Y WALLETS
-- ============================================

USE nemy_db_local;

-- 1. Ver todos los pedidos
SELECT '=== RESUMEN DE PEDIDOS ===' as '';
SELECT 
    status,
    COUNT(*) as cantidad,
    SUM(total) / 100 as total_pesos
FROM orders
GROUP BY status;

-- 2. Pedidos entregados
SELECT '' as '';
SELECT '=== PEDIDOS ENTREGADOS ===' as '';
SELECT 
    o.id,
    SUBSTRING(o.id, -8) as id_corto,
    o.total / 100 as total_pesos,
    o.businessEarnings / 100 as ganancia_negocio,
    o.deliveryEarnings / 100 as ganancia_repartidor,
    o.platformFee / 100 as comision_plataforma,
    u.name as cliente,
    o.deliveryPersonId,
    o.deliveredAt
FROM orders o
LEFT JOIN users u ON u.id = o.userId
WHERE o.status = 'delivered'
ORDER BY o.deliveredAt DESC;

-- 3. Pedidos sin comisiones calculadas
SELECT '' as '';
SELECT '=== PEDIDOS SIN COMISIONES (PROBLEMA) ===' as '';
SELECT 
    o.id,
    SUBSTRING(o.id, -8) as id_corto,
    o.total / 100 as total_pesos,
    o.businessId,
    o.deliveryPersonId,
    o.deliveredAt
FROM orders o
WHERE o.status = 'delivered'
  AND o.businessEarnings IS NULL;

-- 4. Ver wallets existentes
SELECT '' as '';
SELECT '=== WALLETS EXISTENTES ===' as '';
SELECT 
    u.name,
    u.role,
    u.phone,
    w.balance / 100 as balance_pesos,
    w.totalEarned / 100 as total_ganado_pesos,
    w.totalWithdrawn / 100 as total_retirado_pesos
FROM wallets w
INNER JOIN users u ON u.id = w.userId
ORDER BY w.balance DESC;

-- 5. Usuarios sin wallet
SELECT '' as '';
SELECT '=== USUARIOS SIN WALLET ===' as '';
SELECT 
    u.id,
    u.name,
    u.role,
    u.phone
FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM wallets w WHERE w.userId = u.id
)
AND u.role IN ('business', 'driver');

-- 6. Transacciones recientes
SELECT '' as '';
SELECT '=== TRANSACCIONES RECIENTES ===' as '';
SELECT 
    t.id,
    SUBSTRING(t.id, -8) as id_corto,
    u.name as usuario,
    t.type,
    t.amount / 100 as monto_pesos,
    t.description,
    t.createdAt
FROM transactions t
INNER JOIN users u ON u.id = t.userId
ORDER BY t.createdAt DESC
LIMIT 20;

-- 7. Ganancias esperadas vs reales por repartidor
SELECT '' as '';
SELECT '=== REPARTIDORES - GANANCIAS ESPERADAS VS REALES ===' as '';
SELECT 
    u.name as repartidor,
    u.phone,
    COUNT(o.id) as entregas,
    SUM(o.deliveryEarnings) / 100 as ganancia_esperada_pesos,
    COALESCE(w.balance / 100, 0) as balance_actual_pesos,
    CASE 
        WHEN w.balance IS NULL THEN 'SIN WALLET'
        WHEN SUM(o.deliveryEarnings) > COALESCE(w.balance, 0) THEN 'FALTA DINERO'
        ELSE 'OK'
    END as estado
FROM orders o
INNER JOIN users u ON u.id = o.deliveryPersonId
LEFT JOIN wallets w ON w.userId = o.deliveryPersonId
WHERE o.status = 'delivered'
  AND o.deliveryPersonId IS NOT NULL
GROUP BY u.id, u.name, u.phone, w.balance;

-- 8. Ganancias esperadas vs reales por negocio
SELECT '' as '';
SELECT '=== NEGOCIOS - GANANCIAS ESPERADAS VS REALES ===' as '';
SELECT 
    b.name as negocio,
    COUNT(o.id) as pedidos,
    SUM(o.businessEarnings) / 100 as ganancia_esperada_pesos,
    COALESCE(w.balance / 100, 0) as balance_actual_pesos,
    CASE 
        WHEN w.balance IS NULL THEN 'SIN WALLET'
        WHEN SUM(o.businessEarnings) > COALESCE(w.balance, 0) THEN 'FALTA DINERO'
        ELSE 'OK'
    END as estado
FROM orders o
INNER JOIN businesses b ON b.id = o.businessId
LEFT JOIN wallets w ON w.userId = o.businessId
WHERE o.status = 'delivered'
GROUP BY b.id, b.name, w.balance;

SELECT '' as '';
SELECT '=== FIN DEL DIAGNÓSTICO ===' as '';
