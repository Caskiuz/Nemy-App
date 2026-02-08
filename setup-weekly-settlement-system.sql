-- Tablas adicionales para el sistema de liquidaciones mejorado

-- Tabla para liquidaciones semanales
CREATE TABLE IF NOT EXISTS weekly_settlements (
  id VARCHAR(36) PRIMARY KEY,
  driver_id VARCHAR(36) NOT NULL,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  amount_owed INT NOT NULL DEFAULT 0,
  status ENUM('pending', 'submitted', 'approved', 'rejected', 'overdue') DEFAULT 'pending',
  payment_proof_url TEXT,
  submitted_at TIMESTAMP NULL,
  approved_at TIMESTAMP NULL,
  approved_by VARCHAR(36) NULL,
  deadline TIMESTAMP NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_driver_status (driver_id, status),
  INDEX idx_deadline (deadline),
  FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabla para cuenta bancaria de la plataforma
CREATE TABLE IF NOT EXISTS platform_bank_account (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bank_name VARCHAR(100) NOT NULL,
  account_holder VARCHAR(200) NOT NULL,
  clabe VARCHAR(18) NOT NULL,
  account_number VARCHAR(50),
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla para transferencias Stripe semanales
CREATE TABLE IF NOT EXISTS stripe_weekly_transfers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  driver_id VARCHAR(36) NOT NULL,
  stripe_account_id VARCHAR(100) NOT NULL,
  stripe_transfer_id VARCHAR(100) NOT NULL,
  amount INT NOT NULL,
  orders_count INT DEFAULT 0,
  week_start DATE NOT NULL,
  status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_driver_week (driver_id, week_start),
  INDEX idx_stripe_transfer (stripe_transfer_id),
  FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabla para errores de transferencias Stripe
CREATE TABLE IF NOT EXISTS stripe_transfer_errors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  driver_id VARCHAR(36) NOT NULL,
  amount INT NOT NULL,
  error_message TEXT,
  retry_count INT DEFAULT 0,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabla para resumen de transferencias semanales
CREATE TABLE IF NOT EXISTS weekly_transfer_summary (
  id INT AUTO_INCREMENT PRIMARY KEY,
  week_start DATE NOT NULL,
  drivers_processed INT DEFAULT 0,
  transfers_successful INT DEFAULT 0,
  total_amount INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_week (week_start)
);

-- Agregar campos faltantes a tablas existentes
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS blocked_reason TEXT,
ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMP NULL;

ALTER TABLE delivery_drivers 
ADD COLUMN IF NOT EXISTS blocked_reason TEXT;

ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS metadata JSON;

-- Insertar cuenta bancaria de ejemplo (reemplazar con datos reales)
INSERT IGNORE INTO platform_bank_account 
(bank_name, account_holder, clabe, account_number, notes, is_active) 
VALUES 
('BBVA México', 'NEMY DELIVERY SA DE CV', '012345678901234567', '0123456789', 'Cuenta principal para liquidaciones', TRUE);

-- Índices adicionales para optimización
CREATE INDEX IF NOT EXISTS idx_orders_cash_settlement ON orders(payment_method, status, cash_settled, delivered_at);
CREATE INDEX IF NOT EXISTS idx_wallets_cash_owed ON wallets(cash_owed, user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_audit ON transactions(type, status, created_at);