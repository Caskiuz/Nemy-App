-- Test seed data (idempotent)

-- Weekly settlements tables (ensure they exist for tests)
CREATE TABLE IF NOT EXISTS weekly_settlements (
  id varchar(255) PRIMARY KEY,
  driver_id varchar(255) NOT NULL,
  week_start date,
  week_end date,
  amount_owed int NOT NULL DEFAULT 0,
  status varchar(50) NOT NULL DEFAULT 'pending',
  deadline datetime,
  payment_proof_url text,
  submitted_at datetime,
  approved_at datetime,
  approved_by varchar(255),
  notes text,
  created_at datetime DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS platform_bank_account (
  id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  bank_name text,
  account_holder text,
  clabe varchar(50),
  account_number varchar(50),
  notes text,
  is_active tinyint(1) DEFAULT 0
);

-- Users
INSERT INTO users (id, name, email, phone, role, email_verified, phone_verified, is_active, is_online, created_at)
VALUES
  ('test-customer', 'Cliente Test', 'customer@test.com', '+523121234567', 'customer', 1, 1, 1, 0, NOW()),
  ('test-owner', 'Dueno Test', 'owner@test.com', '+523121234568', 'business_owner', 1, 1, 1, 0, NOW()),
  ('test-driver', 'Repartidor Test', 'driver@test.com', '+523121234569', 'delivery_driver', 1, 1, 1, 0, NOW()),
  ('test-admin', 'Admin Test', 'admin@test.com', '+523121234570', 'admin', 1, 1, 1, 0, NOW())
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  email = VALUES(email),
  phone = VALUES(phone),
  role = VALUES(role),
  email_verified = VALUES(email_verified),
  phone_verified = VALUES(phone_verified),
  is_active = VALUES(is_active),
  is_online = VALUES(is_online);

-- Businesses
INSERT INTO businesses (id, owner_id, name, description, type, address, phone, email, is_active, is_open, latitude, longitude, created_at, updated_at)
VALUES
  ('test-biz-1', 'test-owner', 'Tacos Test', 'Tacos de prueba', 'restaurant', 'Centro 123', '+523121234571', 'tacos@test.com', 1, 1, '20.6736', '-104.3647', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  owner_id = VALUES(owner_id),
  name = VALUES(name),
  description = VALUES(description),
  type = VALUES(type),
  address = VALUES(address),
  phone = VALUES(phone),
  email = VALUES(email),
  is_active = VALUES(is_active),
  is_open = VALUES(is_open),
  latitude = VALUES(latitude),
  longitude = VALUES(longitude),
  updated_at = NOW();

-- Orders
INSERT INTO orders (id, user_id, business_id, business_name, status, subtotal, delivery_fee, total, payment_method, delivery_address, items, delivery_person_id, cash_collected, cash_settled, created_at, updated_at)
VALUES
  ('order-pending-card', 'test-customer', 'test-biz-1', 'Tacos Test', 'pending', 15000, 2000, 17000, 'card', 'Calle Principal 123', '[]', NULL, 0, 0, NOW(), NOW()),
  ('order-business-pending', 'test-customer', 'test-biz-1', 'Tacos Test', 'pending', 12000, 2000, 14000, 'card', 'Av. Revolucion 456', '[]', NULL, 0, 0, NOW(), NOW()),
  ('order-delivered-cash', 'test-customer', 'test-biz-1', 'Tacos Test', 'delivered', 10000, 2000, 12000, 'cash', 'Col. Centro 789', '[]', 'test-driver', 1, 0, DATE_SUB(NOW(), INTERVAL 1 DAY), NOW())
ON DUPLICATE KEY UPDATE
  user_id = VALUES(user_id),
  business_id = VALUES(business_id),
  business_name = VALUES(business_name),
  status = VALUES(status),
  subtotal = VALUES(subtotal),
  delivery_fee = VALUES(delivery_fee),
  total = VALUES(total),
  payment_method = VALUES(payment_method),
  delivery_address = VALUES(delivery_address),
  items = VALUES(items),
  delivery_person_id = VALUES(delivery_person_id),
  cash_collected = VALUES(cash_collected),
  cash_settled = VALUES(cash_settled),
  updated_at = NOW();

-- Wallets
INSERT INTO wallets (id, user_id, balance, pending_balance, cash_owed, total_earned, total_withdrawn, created_at, updated_at)
VALUES
  ('wallet-customer', 'test-customer', 0, 0, 0, 0, 0, NOW(), NOW()),
  ('wallet-owner', 'test-owner', 0, 0, 0, 0, 0, NOW(), NOW()),
  ('wallet-driver', 'test-driver', 0, 0, 5000, 0, 0, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  balance = VALUES(balance),
  pending_balance = VALUES(pending_balance),
  cash_owed = VALUES(cash_owed),
  total_earned = VALUES(total_earned),
  total_withdrawn = VALUES(total_withdrawn),
  updated_at = NOW();

-- Delivery drivers
INSERT INTO delivery_drivers (id, user_id, vehicle_type, is_available, created_at)
VALUES
  ('driver-profile', 'test-driver', 'motorcycle', 1, NOW())
ON DUPLICATE KEY UPDATE
  vehicle_type = VALUES(vehicle_type),
  is_available = VALUES(is_available);
