-- TEST COMPLETO DEL SISTEMA DE EFECTIVO
-- Simula el flujo completo: pedido en efectivo -> entrega -> deuda -> liquidación

-- 1. LIMPIAR DATOS PREVIOS DEL DRIVER
DELETE FROM transactions WHERE user_id = 'driver-1';
UPDATE wallets SET balance = 0, cash_owed = 0, total_earned = 0 WHERE user_id = 'driver-1';

-- 2. CREAR PEDIDO EN EFECTIVO
INSERT INTO orders (
    id,
    user_id,
    business_id,
    business_name,
    items,
    status,
    subtotal,
    delivery_fee,
    total,
    payment_method,
    delivery_address,
    delivery_latitude,
    delivery_longitude,
    delivery_person_id,
    created_at,
    updated_at,
    picked_up_at
) VALUES (
    'cash-test-001',
    'customer-1',
    'business-owner-1',
    'Carlos Restaurante',
    '[{"name": "Pizza Margherita", "quantity": 1, "price": 15000}]',
    'picked_up',
    15000,
    2500,
    17500,
    'cash',
    'Av. Revolución 456, Centro, Autlán',
    '20.6750',
    '-104.3650',
    'driver-1',
    NOW(),
    NOW(),
    NOW()
);

-- 3. VERIFICAR ESTADO INICIAL
SELECT 'ESTADO INICIAL' as test_phase;
SELECT 
    'Driver Wallet' as item,
    balance,
    cash_owed,
    total_earned
FROM wallets WHERE user_id = 'driver-1';

SELECT 
    'Pedido Creado' as item,
    id,
    status,
    total,
    payment_method
FROM orders WHERE id = 'cash-test-001';

-- 4. SIMULAR ENTREGA (esto debería crear deuda)
-- Actualizar pedido como entregado
UPDATE orders 
SET 
    status = 'delivered',
    delivered_at = NOW(),
    -- Calcular comisiones según nueva lógica
    platform_fee = ROUND(subtotal * 0.15),  -- 15% del subtotal
    business_earnings = subtotal,            -- 100% del subtotal  
    delivery_earnings = delivery_fee         -- 100% del delivery_fee
WHERE id = 'cash-test-001';

-- Simular el registro de deuda de efectivo
-- El driver debe depositar: platform_fee + business_earnings = total - delivery_earnings
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
-- Ganancia del driver (lo que se queda)
(
    'driver-1',
    'cash-test-001',
    'cash_income',
    2500,  -- delivery_fee completo
    0,
    2500,
    'Comisión de entrega - Pedido #001 (efectivo)',
    'completed',
    NOW()
),
-- Deuda de efectivo (lo que debe depositar)
(
    'driver-1',
    'cash-test-001',
    'cash_debt',
    15000,  -- platform_fee + business_earnings = 2250 + 15000 = 17250, pero simplificamos a business_earnings
    0,
    15000,
    'Efectivo a liquidar - Pedido #001',
    'pending',
    NOW()
);

-- Actualizar wallet del driver
UPDATE wallets 
SET 
    balance = 2500,           -- Su comisión
    cash_owed = 15000,        -- Lo que debe depositar
    total_earned = 2500,
    updated_at = NOW()
WHERE user_id = 'driver-1';

-- 5. VERIFICAR ESTADO DESPUÉS DE ENTREGA
SELECT 'DESPUÉS DE ENTREGA' as test_phase;
SELECT 
    'Driver Wallet' as item,
    balance,
    cash_owed,
    total_earned,
    (balance - cash_owed) as available_for_withdrawal
FROM wallets WHERE user_id = 'driver-1';

SELECT 
    'Transacciones Driver' as item,
    type,
    amount,
    description,
    status
FROM transactions WHERE user_id = 'driver-1' ORDER BY created_at;

-- 6. SIMULAR LIQUIDACIÓN DE EFECTIVO
-- El driver deposita el efectivo que debe
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
) VALUES (
    'driver-1',
    'cash-test-001',
    'cash_settlement',
    -15000,  -- Negativo porque es un pago/depósito
    2500,
    2500,    -- Balance no cambia, pero cash_owed sí
    'Liquidación de efectivo - Pedido #001',
    'completed',
    NOW()
);

-- Actualizar deuda a 0
UPDATE wallets 
SET 
    cash_owed = 0,
    updated_at = NOW()
WHERE user_id = 'driver-1';

-- Marcar transacción de deuda como completada
UPDATE transactions 
SET status = 'completed'
WHERE user_id = 'driver-1' AND type = 'cash_debt' AND order_id = 'cash-test-001';

-- 7. VERIFICAR ESTADO FINAL
SELECT 'DESPUÉS DE LIQUIDACIÓN' as test_phase;
SELECT 
    'Driver Wallet Final' as item,
    balance,
    cash_owed,
    total_earned,
    (balance - cash_owed) as available_for_withdrawal
FROM wallets WHERE user_id = 'driver-1';

SELECT 
    'Todas las Transacciones' as item,
    type,
    amount,
    description,
    status
FROM transactions WHERE user_id = 'driver-1' ORDER BY created_at;

-- 8. VERIFICAR INTEGRIDAD
SELECT 'VERIFICACIÓN DE INTEGRIDAD' as test_phase;
SELECT 
    'Pedido Final' as item,
    status,
    total,
    platform_fee,
    business_earnings,
    delivery_earnings,
    (platform_fee + business_earnings + delivery_earnings) as suma_comisiones,
    ((platform_fee + business_earnings + delivery_earnings) = total) as comisiones_correctas
FROM orders WHERE id = 'cash-test-001';

-- Resumen del test
SELECT 'RESUMEN DEL TEST' as test_phase;
SELECT 
    'El driver debería tener:' as descripcion,
    '$25.00 en balance (su comisión)' as valor_esperado,
    '$0 en deuda' as deuda_esperada,
    '$25.00 disponible para retiro' as retiro_disponible;