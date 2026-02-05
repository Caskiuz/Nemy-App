-- Crear tabla delivery_zones si no existe
CREATE TABLE IF NOT EXISTS delivery_zones (
  id VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
  name TEXT NOT NULL,
  description TEXT,
  delivery_fee INT NOT NULL,
  max_delivery_time INT DEFAULT 45,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  coordinates TEXT,
  center_latitude TEXT,
  center_longitude TEXT,
  radius_km INT DEFAULT 5,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insertar zonas de entrega por defecto para Autlán
INSERT IGNORE INTO delivery_zones (id, name, description, delivery_fee, max_delivery_time, center_latitude, center_longitude, radius_km) VALUES
('zone-centro', 'Centro', 'Centro de Autlán', 2500, 30, '20.6736', '-104.3647', 3),
('zone-norte', 'Norte', 'Zona Norte de Autlán', 3000, 35, '20.6800', '-104.3647', 4),
('zone-sur', 'Sur', 'Zona Sur de Autlán', 3000, 35, '20.6672', '-104.3647', 4),
('zone-este', 'Este', 'Zona Este de Autlán', 3500, 40, '20.6736', '-104.3500', 5),
('zone-oeste', 'Oeste', 'Zona Oeste de Autlán', 3500, 40, '20.6736', '-104.3800', 5);