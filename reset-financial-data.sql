-- Reset Financial Data - SQL Script
-- Mantiene usuarios, negocios y productos
-- Elimina pedidos, pagos, transacciones

-- Desactivar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Eliminar pedidos
DELETE FROM orders;

-- 2. Eliminar pagos
DELETE FROM payments;

-- 3. Eliminar transacciones
DELETE FROM transactions;

-- 4. Resetear wallets a $0
UPDATE wallets 
SET balance = 0, 
    pendingBalance = 0, 
    cashOwed = 0,
    totalEarned = 0, 
    totalWithdrawn = 0,
    updatedAt = NOW();

-- 5. Eliminar retiros
DELETE FROM withdrawals;

-- 6. Eliminar reseñas
DELETE FROM reviews;

-- 7. Resetear ratings de negocios
UPDATE businesses 
SET rating = 0, 
    totalRatings = 0,
    updatedAt = NOW();

-- Reactivar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Mostrar resumen
SELECT 'REINICIO COMPLETADO' as status;
SELECT COUNT(*) as pedidos_restantes FROM orders;
SELECT COUNT(*) as pagos_restantes FROM payments;
SELECT COUNT(*) as transacciones_restantes FROM transactions;
SELECT COUNT(*) as usuarios_mantenidos FROM users;
SELECT COUNT(*) as negocios_mantenidos FROM businesses;
SELECT COUNT(*) as productos_mantenidos FROM products;
SELECT userId, balance, totalEarned FROM wallets LIMIT 5;
