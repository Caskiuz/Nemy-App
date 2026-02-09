-- Limpieza total de pedidos y historiales financieros
-- Elimina todos los pedidos, transacciones y wallets, pero deja usuarios y cuentas creadas

DELETE FROM orders;
DELETE FROM transactions;
UPDATE wallets SET balance=0, pending_balance=0, cash_owed=0, total_earned=0, total_withdrawn=0;

-- Opcional: Eliminar pagos
DELETE FROM payments;

-- Opcional: Eliminar logs financieros
DELETE FROM financial_logs;

-- Mantiene usuarios, negocios, productos y cuentas intactos.