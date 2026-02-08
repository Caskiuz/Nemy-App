-- Reconstruir transacciones CORRECTAS para pedidos en efectivo

-- PEDIDOS CON TARJETA: Se acredita delivery fee y se descuenta comisión
-- Pedido 1: order-delivered-1 (tarjeta)
INSERT INTO transactions (user_id, order_id, type, amount, status, description, created_at) VALUES
('driver-1', 'order-delivered-1', 'income', 2175, 'completed', 'Tarifa de entrega (Tarjeta) - Pedido #ered-1', '2026-02-01 22:43:56'),
('driver-1', 'order-delivered-1', 'platform_fee', -2175, 'completed', 'Comisión de plataforma - Pedido #ered-1', '2026-02-01 22:43:56');

-- Pedido 3: order-in-progress-1 (tarjeta)
INSERT INTO transactions (user_id, order_id, type, amount, status, description, created_at) VALUES
('driver-1', 'order-in-progress-1', 'income', 2850, 'completed', 'Tarifa de entrega (Tarjeta) - Pedido #ress-1', '2026-02-05 05:45:31'),
('driver-1', 'order-in-progress-1', 'platform_fee', -2850, 'completed', 'Comisión de plataforma - Pedido #ress-1', '2026-02-05 05:45:31');

-- Pedido 4: test-order-1 (tarjeta)
INSERT INTO transactions (user_id, order_id, type, amount, status, description, created_at) VALUES
('driver-1', 'test-order-1', 'income', 2250, 'completed', 'Tarifa de entrega (Tarjeta) - Pedido #rder-1', '2026-02-05 06:05:42'),
('driver-1', 'test-order-1', 'platform_fee', -2250, 'completed', 'Comisión de plataforma - Pedido #rder-1', '2026-02-05 06:05:42');

-- Pedido 5: de78dc57 (tarjeta)
INSERT INTO transactions (user_id, order_id, type, amount, status, description, created_at) VALUES
('driver-1', 'de78dc57-026a-11f1-adf2-1866da2fd9d2', 'income', 975, 'completed', 'Tarifa de entrega (Tarjeta) - Pedido #2fd9d2', '2026-02-06 20:13:34'),
('driver-1', 'de78dc57-026a-11f1-adf2-1866da2fd9d2', 'platform_fee', -975, 'completed', 'Comisión de plataforma - Pedido #2fd9d2', '2026-02-06 20:13:34');

-- Pedido 6: de789f66 (tarjeta)
INSERT INTO transactions (user_id, order_id, type, amount, status, description, created_at) VALUES
('driver-1', 'de789f66-026a-11f1-adf2-1866da2fd9d2', 'income', 975, 'completed', 'Tarifa de entrega (Tarjeta) - Pedido #2fd9d2', '2026-02-06 20:16:09'),
('driver-1', 'de789f66-026a-11f1-adf2-1866da2fd9d2', 'platform_fee', -975, 'completed', 'Comisión de plataforma - Pedido #2fd9d2', '2026-02-06 20:16:09');

-- PEDIDOS EN EFECTIVO: Solo se descuenta comisión, NO se acredita nada
-- Pedido 2: 9b07681b (efectivo) - subtotal $30, plataforma 15% = $4.50
INSERT INTO transactions (user_id, order_id, type, amount, status, description, created_at) VALUES
('driver-1', '9b07681b-0038-11f1-a5c3-1866da2fd9d2', 'platform_fee', -450, 'completed', 'Comisión de plataforma - Pedido #2fd9d2', '2026-02-05 05:40:18'),
('driver-1', '9b07681b-0038-11f1-a5c3-1866da2fd9d2', 'cash_settlement', 0, 'completed', 'Liquidación al negocio: $21.00 - Pedido #2fd9d2', '2026-02-06 18:51:25');

-- Pedido 7: 85b49190 (efectivo) - subtotal $95, plataforma 15% = $14.25
INSERT INTO transactions (user_id, order_id, type, amount, status, description, created_at) VALUES
('driver-1', '85b49190-0009-11f1-a5c3-1866da2fd9d2', 'platform_fee', -1425, 'completed', 'Comisión de plataforma - Pedido #2fd9d2', '2026-02-06 20:21:07'),
('driver-1', '85b49190-0009-11f1-a5c3-1866da2fd9d2', 'cash_settlement', 0, 'completed', 'Liquidación al negocio: $66.50 - Pedido #2fd9d2', '2026-02-06 18:51:22');

-- Pedido 8: 5cc34654 (efectivo) - subtotal $150, plataforma 15% = $22.50
INSERT INTO transactions (user_id, order_id, type, amount, status, description, created_at) VALUES
('driver-1', '5cc34654-02f0-11f1-a2c4-1866da2fd9d2', 'platform_fee', -2250, 'completed', 'Comisión de plataforma - Pedido #2fd9d2', '2026-02-06 20:41:12'),
('driver-1', '5cc34654-02f0-11f1-a2c4-1866da2fd9d2', 'cash_settlement', 0, 'completed', 'Liquidación al negocio: $105.00 - Pedido #2fd9d2', '2026-02-06 18:51:18');

-- Pedido 9: e4aa3c3d (efectivo) - subtotal $95, plataforma 15% = $14.25
INSERT INTO transactions (user_id, order_id, type, amount, status, description, created_at) VALUES
('driver-1', 'e4aa3c3d-0009-11f1-a5c3-1866da2fd9d2', 'platform_fee', -1425, 'completed', 'Comisión de plataforma - Pedido #2fd9d2', '2026-02-06 20:44:36'),
('driver-1', 'e4aa3c3d-0009-11f1-a5c3-1866da2fd9d2', 'cash_settlement', 0, 'completed', 'Liquidación al negocio: $66.50 - Pedido #2fd9d2', '2026-02-06 20:44:36');

-- Pedido 10: b9337282 (efectivo) - subtotal $95, plataforma 15% = $14.25
INSERT INTO transactions (user_id, order_id, type, amount, status, description, created_at) VALUES
('driver-1', 'b9337282-0009-11f1-a5c3-1866da2fd9d2', 'platform_fee', -1425, 'completed', 'Comisión de plataforma - Pedido #2fd9d2', '2026-02-06 20:47:16'),
('driver-1', 'b9337282-0009-11f1-a5c3-1866da2fd9d2', 'cash_settlement', 0, 'completed', 'Liquidación al negocio: $66.50 - Pedido #2fd9d2', '2026-02-06 20:47:16');

-- Pedido 11: a21aad8b (efectivo) - subtotal $250, plataforma 15% = $37.50
INSERT INTO transactions (user_id, order_id, type, amount, status, description, created_at) VALUES
('driver-1', 'a21aad8b-02f0-11f1-a2c4-1866da2fd9d2', 'platform_fee', -3750, 'completed', 'Comisión de plataforma - Pedido #2fd9d2', '2026-02-06 20:48:59'),
('driver-1', 'a21aad8b-02f0-11f1-a2c4-1866da2fd9d2', 'cash_settlement', 0, 'completed', 'Liquidación al negocio: $175.00 - Pedido #2fd9d2', '2026-02-06 20:48:59');

-- Actualizar wallet
UPDATE wallets SET 
  balance = (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE user_id = 'driver-1'),
  cash_owed = 0,
  total_earned = (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE user_id = 'driver-1' AND amount > 0)
WHERE user_id = 'driver-1';
