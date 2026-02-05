-- SOLUCIÓN RÁPIDA - Liberar fondos
USE nemy_db_local;

-- 1. Actualizar comisiones de pedidos sin procesar
UPDATE orders
SET 
    platform_fee = FLOOR(total * 0.15),
    business_earnings = total - FLOOR(total * 0.15) - FLOOR(total * 0.15),
    delivery_earnings_amount = FLOOR(total * 0.15)
WHERE status = 'delivered' AND business_earnings IS NULL;

-- 2. Crear wallet para driver-1 si no existe
INSERT IGNORE INTO wallets (user_id, balance, pending_balance, total_earned, total_withdrawn)
VALUES ('driver-1', 0, 0, 0, 0);

-- 3. Actualizar balance del repartidor con TODAS sus ganancias
UPDATE wallets 
SET 
    balance = (SELECT COALESCE(SUM(delivery_earnings_amount), 0) FROM orders WHERE delivery_person_id = 'driver-1' AND status = 'delivered'),
    total_earned = (SELECT COALESCE(SUM(delivery_earnings_amount), 0) FROM orders WHERE delivery_person_id = 'driver-1' AND status = 'delivered')
WHERE user_id = 'driver-1';

-- 4. Ver resultado
SELECT 
    'RESULTADO:' as '',
    balance / 100 as balance_pesos,
    total_earned / 100 as total_ganado_pesos
FROM wallets 
WHERE user_id = 'driver-1';
