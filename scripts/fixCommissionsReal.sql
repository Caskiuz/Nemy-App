-- Script para corregir las comisiones con la lógica REAL del sistema
-- NEMY: 15% del subtotal
-- Negocio: 100% del subtotal  
-- Repartidor: 100% del delivery_fee

UPDATE orders 
SET 
    platform_fee = ROUND((total - delivery_fee) * 0.15),
    business_earnings = (total - delivery_fee),
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
    (platform_fee + business_earnings + delivery_earnings) as suma_comisiones
FROM orders 
WHERE status = 'delivered'
ORDER BY created_at DESC;