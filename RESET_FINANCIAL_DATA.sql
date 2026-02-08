-- RESET COMPLETO DE DATOS FINANCIEROS
-- Ejecutar en MySQL para limpiar TODO

SET FOREIGN_KEY_CHECKS = 0;

-- Eliminar TODOS los pedidos
DELETE FROM orders;

-- Eliminar TODOS los pagos
DELETE FROM payments;

-- Eliminar TODAS las transacciones
DELETE FROM transactions;

-- Eliminar TODOS los retiros
DELETE FROM withdrawals;

-- Eliminar TODAS las reseñas
DELETE FROM reviews;

-- RESETEAR wallets a CERO
UPDATE wallets SET 
    balance = 0,
    pending_balance = 0,
    cash_owed = 0,
    total_earned = 0,
    total_withdrawn = 0,
    updated_at = NOW();

-- RESETEAR ratings de negocios
UPDATE businesses SET 
    rating = 0,
    total_ratings = 0,
    updated_at = NOW();

SET FOREIGN_KEY_CHECKS = 1;

-- Verificar que todo esté limpio
SELECT 'PEDIDOS' as tabla, COUNT(*) as registros FROM orders
UNION ALL
SELECT 'PAGOS' as tabla, COUNT(*) as registros FROM payments
UNION ALL
SELECT 'TRANSACCIONES' as tabla, COUNT(*) as registros FROM transactions
UNION ALL
SELECT 'RETIROS' as tabla, COUNT(*) as registros FROM withdrawals
UNION ALL
SELECT 'RESEÑAS' as tabla, COUNT(*) as registros FROM reviews;

-- Verificar wallets
SELECT userId, balance, total_earned FROM wallets;