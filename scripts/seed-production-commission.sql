-- PRODUCTION SEED (SAFE, NON-DESTRUCTIVE)
-- WARNING: This inserts demo data into the live database.
-- Uses INSERT IGNORE to avoid overwriting existing rows.

-- Users
INSERT IGNORE INTO users (id, name, phone, email, role, phone_verified, email_verified, is_active)
VALUES
  ('seed-prod-admin', 'Seed Admin', '+521000000001', 'seed.admin@nemy.app', 'admin', 1, 1, 1),
  ('seed-prod-owner', 'Seed Owner', '+521000000002', 'seed.owner@nemy.app', 'business_owner', 1, 1, 1),
  ('seed-prod-driver', 'Seed Driver', '+521000000003', 'seed.driver@nemy.app', 'delivery_driver', 1, 1, 1),
  ('seed-prod-customer', 'Seed Customer', '+521000000004', 'seed.customer@nemy.app', 'customer', 1, 1, 1);

-- Business
INSERT IGNORE INTO businesses (
  id,
  owner_id,
  name,
  description,
  type,
  address,
  phone,
  email,
  latitude,
  longitude,
  delivery_fee,
  min_order,
  is_active
) VALUES (
  'seed-prod-biz-1',
  'seed-prod-owner',
  'Seed Tacos',
  'Seed business for commission validation',
  'restaurant',
  'Calle Seed 123, Autlan',
  '+521000000002',
  'seed.owner@nemy.app',
  '19.7717',
  '-104.3606',
  2000,
  8000,
  1
);

-- Products
INSERT IGNORE INTO products (id, business_id, name, description, price, category, is_available)
VALUES
  ('seed-prod-item-1', 'seed-prod-biz-1', 'Seed Taco', 'Seed product', 10000, 'Tacos', 1),
  ('seed-prod-item-2', 'seed-prod-biz-1', 'Seed Soda', 'Seed drink', 2000, 'Bebidas', 1);

-- Driver profile
INSERT IGNORE INTO delivery_drivers (id, user_id, vehicle_type, vehicle_plate, is_available)
VALUES
  ('seed-prod-driver-profile', 'seed-prod-driver', 'motorcycle', 'SEED-001', 1);

-- Wallets
INSERT IGNORE INTO wallets (id, user_id, balance, pending_balance, cash_owed, total_earned, total_withdrawn)
VALUES
  ('seed-prod-wallet-owner', 'seed-prod-owner', 0, 0, 0, 0, 0),
  ('seed-prod-wallet-driver', 'seed-prod-driver', 0, 0, 0, 0, 0);

-- Order with new commission logic
-- subtotal=10000, nemy_commission=1500, delivery_fee=2000, total=13500
INSERT IGNORE INTO orders (
  id,
  user_id,
  business_id,
  business_name,
  business_image,
  items,
  status,
  subtotal,
  productos_base,
  nemy_commission,
  delivery_fee,
    total,
  payment_method,
  delivery_address,
  delivery_latitude,
  delivery_longitude,
  created_at
) VALUES (
  'seed-prod-order-1',
  'seed-prod-customer',
  'seed-prod-biz-1',
  'Seed Tacos',
  NULL,
  '[{"name":"Seed Taco","quantity":1,"price":10000}]',
  'pending',
  10000,
  10000,
  1500,
  2000,
    13500,
  'card',
  'Calle Seed 456, Autlan',
  '19.7719',
  '-104.3609',
  NOW()
);

-- Quick verification
SELECT id, subtotal, productos_base, nemy_commission, delivery_fee, total
FROM orders
WHERE id = 'seed-prod-order-1';
