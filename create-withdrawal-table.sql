-- Script SQL para crear tabla de retiros
-- Ejecutar en MySQL Workbench o línea de comandos

USE nemy_db_local;

-- Crear tabla withdrawal_requests
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(255) NOT NULL,
  wallet_id VARCHAR(255) NOT NULL,
  amount INT NOT NULL,
  method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  bank_clabe VARCHAR(18),
  bank_name TEXT,
  account_holder TEXT,
  stripe_payout_id TEXT,
  approved_by VARCHAR(255),
  error_message TEXT,
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status(50))
);

-- Verificar que se creó correctamente
SELECT COUNT(*) as total_withdrawals FROM withdrawal_requests;

-- Mostrar estructura de la tabla
DESCRIBE withdrawal_requests;
