-- Recalcular comisiones con nueva lógica: Negocio 100% subtotal, Driver 100% delivery, NEMY 15% subtotal

-- Actualizar pedidos con tarjeta (recalcular con nueva lógica)
UPDATE orders 
SET 
  business_earnings = subtotal,
  delivery_earnings = delivery_fee,
  platform_fee = ROUND(subtotal * 0.15)
WHERE payment_method = 'card' AND status = 'delivered';

-- Actualizar pedidos de efectivo (calcular comisiones)
UPDATE orders 
SET 
  business_earnings = subtotal,
  delivery_earnings = delivery_fee,
  platform_fee = ROUND(subtotal * 0.15)
WHERE payment_method = 'cash' AND status = 'delivered';

-- Recalcular wallets de negocios
UPDATE wallets w
JOIN (
  SELECT 
    business_id,
    SUM(business_earnings) as total_business_earnings
  FROM orders 
  WHERE business_id IN (SELECT id FROM businesses WHERE owner_id = 'business-owner-1')
    AND status = 'delivered'
    AND payment_method = 'card'
  GROUP BY business_id
) o ON w.user_id = o.business_id
SET 
  w.balance = o.total_business_earnings,
  w.total_earned = o.total_business_earnings;

-- Recalcular wallet del repartidor
UPDATE wallets w
JOIN (
  SELECT 
    delivery_person_id,
    SUM(delivery_earnings) as total_delivery_earnings
  FROM orders 
  WHERE delivery_person_id IS NOT NULL
    AND status = 'delivered'
    AND payment_method = 'card'
  GROUP BY delivery_person_id
) o ON w.user_id = o.delivery_person_id
SET 
  w.balance = w.balance - w.cash_owed + o.total_delivery_earnings,
  w.total_earned = o.total_delivery_earnings;

-- Verificar resultados
SELECT 'PEDIDOS RECALCULADOS' as resultado;
SELECT id, subtotal, business_earnings, delivery_earnings, platform_fee, payment_method 
FROM orders 
WHERE business_id IN (SELECT id FROM businesses WHERE owner_id = 'business-owner-1') 
  AND status = 'delivered' 
ORDER BY created_at DESC;

SELECT 'WALLETS ACTUALIZADOS' as resultado;
SELECT user_id, balance, total_earned, cash_owed 
FROM wallets 
WHERE user_id IN (SELECT id FROM businesses WHERE owner_id = 'business-owner-1') 
   OR user_id = 'driver-1';