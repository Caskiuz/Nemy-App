-- Script para recalcular todas las comisiones con la nueva lógica
-- NEMY: 15% del total, Negocio: 100% del subtotal, Repartidor: 100% del delivery_fee

UPDATE orders 
SET 
    platform_fee = ROUND(total * 0.15),
    business_earnings = subtotal,
    delivery_earnings = delivery_fee
WHERE status = 'delivered';

-- Verificar resultados
SELECT 
    id,
    subtotal,
    delivery_fee,
    total,
    platform_fee,
    business_earnings,
    delivery_earnings,
    payment_method,
    status,
    -- Verificaciones
    (platform_fee + business_earnings + delivery_earnings) as suma_comisiones,
    ((platform_fee + business_earnings + delivery_earnings) = total) as comisiones_correctas
FROM orders 
WHERE status = 'delivered'
ORDER BY created_at DESC;