USE nemy_db_local;
INSERT INTO system_settings (id, `key`, value, type, category, description, is_public) VALUES 
(UUID(), 'platform_commission_rate', '0.15', 'number', 'commissions', 'Comision de plataforma (15%)', 0),
(UUID(), 'business_commission_rate', '0.70', 'number', 'commissions', 'Comision de negocio (70%)', 0),
(UUID(), 'driver_commission_rate', '0.15', 'number', 'commissions', 'Comision de repartidor (15%)', 0);