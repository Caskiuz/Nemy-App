-- Inicializar tasas de comisión en system_settings
INSERT INTO system_settings (id, `key`, value, type, category, description, isPublic) VALUES
(UUID(), 'platform_commission_rate', '0.15', 'number', 'commissions', 'Comisión de plataforma (15%)', FALSE),
(UUID(), 'business_commission_rate', '0.70', 'number', 'commissions', 'Comisión de negocio (70%)', FALSE),
(UUID(), 'driver_commission_rate', '0.15', 'number', 'commissions', 'Comisión de repartidor (15%)', FALSE)
ON DUPLICATE KEY UPDATE 
value = VALUES(value),
updatedAt = CURRENT_TIMESTAMP;