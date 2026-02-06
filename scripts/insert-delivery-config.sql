-- Configuración de tarifas de delivery (INSERT o UPDATE)
INSERT INTO system_settings (`key`, value, type, category, description) VALUES
('delivery_base_fee', '15', 'number', 'delivery', 'Tarifa base de envío en MXN'),
('delivery_per_km', '8', 'number', 'delivery', 'Costo por kilómetro en MXN'),
('delivery_min_fee', '15', 'number', 'delivery', 'Tarifa mínima de envío en MXN'),
('delivery_max_fee', '40', 'number', 'delivery', 'Tarifa máxima de envío en MXN'),
('delivery_speed_km_per_min', '0.5', 'number', 'delivery', 'Velocidad promedio en km/min (~30 km/h)'),
('delivery_default_prep_time', '20', 'number', 'delivery', 'Tiempo de preparación por defecto en minutos')
ON DUPLICATE KEY UPDATE value=VALUES(value), description=VALUES(description);
