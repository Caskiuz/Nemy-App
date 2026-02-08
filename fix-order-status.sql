-- Fix order status for business panel
-- This script changes "accepted" status to "pending" so business owners can see action buttons

USE nemy_db_local;

-- Show current status distribution
SELECT 'Current order status distribution:' as info;
SELECT status, COUNT(*) as count FROM orders GROUP BY status ORDER BY count DESC;

-- Update "accepted" status to "pending"
UPDATE orders 
SET status = 'pending' 
WHERE status = 'accepted';

-- Show updated status distribution
SELECT 'Updated order status distribution:' as info;
SELECT status, COUNT(*) as count FROM orders GROUP BY status ORDER BY count DESC;

-- Show orders that need business action
SELECT 'Orders waiting for business action:' as info;
SELECT id, business_id, status, total/100 as total_pesos, created_at 
FROM orders 
WHERE status IN ('pending', 'confirmed', 'preparing') 
ORDER BY created_at DESC;

SELECT '✅ Order status fixed! Business owners can now see action buttons.' as message;