-- Limpiar todos los datos financieros
SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM orders;
DELETE FROM payments;
DELETE FROM transactions;
DELETE FROM withdrawals;
DELETE FROM reviews;

UPDATE wallets SET 
  balance = 0, 
  pending_balance = 0, 
  cash_owed = 0,
  total_earned = 0, 
  total_withdrawn = 0;

UPDATE businesses SET 
  rating = 0, 
  total_ratings = 0;

SET FOREIGN_KEY_CHECKS = 1;

SELECT 'DATOS LIMPIADOS CORRECTAMENTE' as resultado;