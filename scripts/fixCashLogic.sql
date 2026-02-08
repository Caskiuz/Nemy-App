-- CORRECCIÓN: La lógica correcta para efectivo debería ser:
-- El driver cobra el total ($175) y debe depositar lo que no es suyo

-- Corregir el pedido de prueba
UPDATE orders 
SET 
    -- LÓGICA CORRECTA: El driver se queda con delivery_fee, deposita el resto
    platform_fee = ROUND(subtotal * 0.15),  -- 15% del subtotal = $22.50
    business_earnings = subtotal,            -- 100% del subtotal = $150.00
    delivery_earnings = delivery_fee         -- 100% del delivery_fee = $25.00
WHERE id = 'cash-test-001';

-- Pero para efectivo, el cálculo de deuda es diferente:
-- Driver cobra: $175.00 (total)
-- Driver se queda: $25.00 (delivery_fee)  
-- Driver debe depositar: $150.00 (para el negocio) + $22.50 (para NEMY) = $172.50

-- Actualizar la deuda correcta
UPDATE transactions 
SET amount = 15000  -- Solo lo del negocio por ahora, NEMY cobrará su parte después
WHERE user_id = 'driver-1' AND type = 'cash_debt' AND order_id = 'cash-test-001';

-- Verificar la corrección
SELECT 
    'CORRECCIÓN APLICADA' as test_phase,
    total,
    platform_fee,
    business_earnings, 
    delivery_earnings,
    (platform_fee + business_earnings + delivery_earnings) as suma_comisiones,
    'PROBLEMA: Suma > Total' as issue
FROM orders WHERE id = 'cash-test-001';

-- La lógica correcta debería ser:
-- Para EFECTIVO: Driver cobra todo, deposita lo que no es suyo
-- Para TARJETA: Se distribuye automáticamente según porcentajes

SELECT 'LÓGICA CORRECTA PARA EFECTIVO' as explanation;
SELECT 
    'Driver cobra del cliente' as accion,
    17500 as monto,
    'Total del pedido' as descripcion
UNION ALL
SELECT 
    'Driver se queda',
    2500,
    'Su comisión (delivery_fee)'
UNION ALL  
SELECT 
    'Driver debe depositar',
    15000,
    'Para el negocio (subtotal - platform_fee ya incluida)'
UNION ALL
SELECT 
    'NEMY cobra después',
    2250,
    'Su comisión del negocio (15% del subtotal)';