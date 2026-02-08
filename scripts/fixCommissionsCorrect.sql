-- Script para corregir las comisiones con la lógica CORRECTA
-- NEMY: 15% del total
-- Negocio: 70% del total  
-- Repartidor: 15% del total

UPDATE orders 
SET 
    platform_fee = ROUND(total * 0.15),
    business_earnings = ROUND(total * 0.70),
    delivery_earnings = ROUND(total * 0.15)
WHERE status = 'delivered';

-- Verificar que las comisiones sumen exactamente el total
SELECT 
    id,
    subtotal,
    delivery_fee,
    total,
    platform_fee,
    business_earnings,
    delivery_earnings,
    payment_method,
    (platform_fee + business_earnings + delivery_earnings) as suma_comisiones,
    ((platform_fee + business_earnings + delivery_earnings) = total) as correcto
FROM orders 
WHERE status = 'delivered'
ORDER BY created_at DESC;