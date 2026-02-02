-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: nemy_db_local
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `addresses`
--

DROP TABLE IF EXISTS `addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `addresses` (
  `id` varchar(255) NOT NULL DEFAULT (uuid()),
  `user_id` varchar(255) NOT NULL,
  `label` text NOT NULL,
  `street` text NOT NULL,
  `city` text NOT NULL,
  `state` text NOT NULL,
  `zip_code` text,
  `is_default` tinyint(1) NOT NULL DEFAULT '0',
  `latitude` text,
  `longitude` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `addresses`
--

LOCK TABLES `addresses` WRITE;
/*!40000 ALTER TABLE `addresses` DISABLE KEYS */;
/*!40000 ALTER TABLE `addresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` varchar(255) NOT NULL DEFAULT (uuid()),
  `user_id` varchar(255) NOT NULL,
  `action` text NOT NULL,
  `entity_type` text NOT NULL,
  `entity_id` varchar(255) DEFAULT NULL,
  `changes` text,
  `ip_address` text,
  `user_agent` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `businesses`
--

DROP TABLE IF EXISTS `businesses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `businesses` (
  `id` varchar(255) NOT NULL DEFAULT (uuid()),
  `owner_id` varchar(255) DEFAULT NULL,
  `name` text NOT NULL,
  `description` text,
  `type` text NOT NULL DEFAULT (_utf8mb4'restaurant'),
  `image` text,
  `cover_image` text,
  `address` text,
  `phone` text,
  `email` text,
  `rating` int DEFAULT '0',
  `total_ratings` int DEFAULT '0',
  `delivery_time` text DEFAULT (_utf8mb4'30-45 min'),
  `delivery_fee` int DEFAULT '2500',
  `min_order` int DEFAULT '5000',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `is_open` tinyint(1) NOT NULL DEFAULT '1',
  `opening_hours` text,
  `categories` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `latitude` text,
  `longitude` text,
  `max_delivery_radius_km` int DEFAULT '10',
  `base_fee_per_km` int DEFAULT '500',
  `verification_status` text DEFAULT (_utf8mb4'pending'),
  `verification_documents` text,
  `max_simultaneous_orders` int DEFAULT '10',
  `is_paused` tinyint(1) NOT NULL DEFAULT '0',
  `pause_reason` text,
  `paused_at` timestamp NULL DEFAULT NULL,
  `paused_until` timestamp NULL DEFAULT NULL,
  `auto_resume_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `is_featured` tinyint(1) NOT NULL DEFAULT '0',
  `featured_order` int DEFAULT '0',
  `is_slammed` tinyint(1) NOT NULL DEFAULT '0',
  `slammed_extra_minutes` int DEFAULT '20',
  `slammed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `businesses`
--

LOCK TABLES `businesses` WRITE;
/*!40000 ALTER TABLE `businesses` DISABLE KEYS */;
INSERT INTO `businesses` VALUES ('bcf15003-0001-11f1-a5c3-1866da2fd9d2','business-owner-1','Tacos El Güero','Los mejores tacos de Autlán','restaurant','https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400',NULL,'Av. Revolución 123, Centro, Autlán','+52 317 123 4567',NULL,0,0,'30-45 min',2500,5000,1,1,NULL,'tacos,mexicana,antojitos','2026-02-02 06:38:09','20.0736','-104.3647',10,500,'pending',NULL,10,0,NULL,NULL,NULL,1,0,0,0,20,NULL),('bcf3a84a-0001-11f1-a5c3-1866da2fd9d2','business-owner-1','Burger House','Hamburguesas artesanales','restaurant','https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',NULL,'Calle Hidalgo 456, Autlán','+52 317 234 5678',NULL,0,0,'30-45 min',3000,8000,1,1,NULL,'burgers,hamburguesas,americana','2026-02-02 06:38:09','20.0740','-104.3650',10,500,'pending',NULL,10,0,NULL,NULL,NULL,1,0,0,0,20,NULL),('bcf50359-0001-11f1-a5c3-1866da2fd9d2','business-owner-1','Pizza Napoli','Auténtica pizza italiana','restaurant','https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',NULL,'Av. Juárez 789, Autlán','+52 317 345 6789',NULL,0,0,'30-45 min',3500,12000,1,1,NULL,'pizza,italiana,pastas','2026-02-02 06:38:09','20.0745','-104.3655',10,500,'pending',NULL,10,0,NULL,NULL,NULL,1,0,0,0,20,NULL),('bcf632c5-0001-11f1-a5c3-1866da2fd9d2',NULL,'Sushi Zen','Sushi fresco y delicioso','restaurant','https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400',NULL,'Calle Morelos 321, Autlán','+52 317 456 7890',NULL,0,0,'30-45 min',4000,15000,1,1,NULL,'sushi,japonesa','2026-02-02 06:38:09','20.0750','-104.3660',10,500,'pending',NULL,10,0,NULL,NULL,NULL,1,0,0,0,20,NULL),('bcf8255f-0001-11f1-a5c3-1866da2fd9d2',NULL,'Pollo Loco','Pollo asado y rostizado','restaurant','https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400',NULL,'Av. Independencia 654, Autlán','+52 317 567 8901',NULL,0,0,'30-45 min',2500,7000,1,1,NULL,'pollo,alitas','2026-02-02 06:38:09','20.0755','-104.3665',10,500,'pending',NULL,10,0,NULL,NULL,NULL,1,0,0,0,20,NULL),('bcf96573-0001-11f1-a5c3-1866da2fd9d2',NULL,'Mariscos El Puerto','Mariscos frescos del pacífico','restaurant','https://images.unsplash.com/photo-1559737558-2f5a35f4523f?w=400',NULL,'Calle Zaragoza 987, Autlán','+52 317 678 9012',NULL,0,0,'30-45 min',3500,10000,1,1,NULL,'mariscos,pescado','2026-02-02 06:38:09','20.0760','-104.3670',10,500,'pending',NULL,10,0,NULL,NULL,NULL,1,0,0,0,20,NULL),('business-1','business-owner-1','Tacos El G├╝ero','Los mejores tacos de Autl├ín','restaurant','https://images.unsplash.com/photo-1565299585323-38d6b0865b47','https://images.unsplash.com/photo-1565299585323-38d6b0865b47',NULL,NULL,NULL,480,0,'20-30 min',2500,5000,1,1,NULL,'tacos,mexicana','2026-02-02 03:43:56',NULL,NULL,10,500,'pending',NULL,10,0,NULL,NULL,NULL,1,0,0,0,20,NULL),('business-2','business-owner-2','Super Mercado Central','Frutas, verduras y m├ís','market','https://images.unsplash.com/photo-1542838132-92c53300491e','https://images.unsplash.com/photo-1542838132-92c53300491e',NULL,NULL,NULL,450,0,'30-45 min',3000,10000,1,1,NULL,'mercado,abarrotes','2026-02-02 03:43:56',NULL,NULL,10,500,'pending',NULL,10,0,NULL,NULL,NULL,1,0,0,0,20,NULL);
/*!40000 ALTER TABLE `businesses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `delivery_drivers`
--

DROP TABLE IF EXISTS `delivery_drivers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `delivery_drivers` (
  `id` varchar(255) NOT NULL DEFAULT (uuid()),
  `user_id` varchar(255) NOT NULL,
  `vehicle_type` text NOT NULL,
  `vehicle_plate` text,
  `is_available` tinyint(1) NOT NULL DEFAULT '0',
  `current_latitude` text,
  `current_longitude` text,
  `last_location_update` timestamp NULL DEFAULT NULL,
  `total_deliveries` int NOT NULL DEFAULT '0',
  `rating` int DEFAULT '0',
  `total_ratings` int DEFAULT '0',
  `strikes` int NOT NULL DEFAULT '0',
  `is_blocked` tinyint(1) NOT NULL DEFAULT '0',
  `blocked_reason` text,
  `blocked_until` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `delivery_drivers_user_id_unique` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `delivery_drivers`
--

LOCK TABLES `delivery_drivers` WRITE;
/*!40000 ALTER TABLE `delivery_drivers` DISABLE KEYS */;
/*!40000 ALTER TABLE `delivery_drivers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` varchar(255) NOT NULL DEFAULT (uuid()),
  `user_id` varchar(255) NOT NULL,
  `business_id` text NOT NULL,
  `business_name` text NOT NULL,
  `business_image` text,
  `items` text NOT NULL,
  `status` text NOT NULL DEFAULT (_utf8mb4'pending'),
  `subtotal` int NOT NULL,
  `delivery_fee` int NOT NULL,
  `total` int NOT NULL,
  `payment_method` text NOT NULL,
  `payment_intent_id` text,
  `delivery_address` text NOT NULL,
  `delivery_person_id` text,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `estimated_delivery` timestamp NULL DEFAULT NULL,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `cancelled_by` varchar(255) DEFAULT NULL,
  `cancellation_reason` text,
  `refund_amount` int DEFAULT NULL,
  `refund_status` text,
  `platform_fee` int DEFAULT NULL,
  `business_earnings` int DEFAULT NULL,
  `delivery_earnings_amount` int DEFAULT NULL,
  `distance_km` int DEFAULT NULL,
  `delivered_at` timestamp NULL DEFAULT NULL,
  `delivery_latitude` text,
  `delivery_longitude` text,
  `substitution_preference` text DEFAULT (_utf8mb4'refund'),
  `item_substitution_preferences` text,
  `cash_payment_amount` int DEFAULT NULL,
  `cash_change_amount` int DEFAULT NULL,
  `regret_period_ends_at` timestamp NULL DEFAULT NULL,
  `confirmed_to_business_at` timestamp NULL DEFAULT NULL,
  `call_attempted` tinyint(1) DEFAULT '0',
  `call_attempted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES ('85b49190-0009-11f1-a5c3-1866da2fd9d2','ef47afae-0007-11f1-a5c3-1866da2fd9d2','bcf3a84a-0001-11f1-a5c3-1866da2fd9d2','Burger House','','[{\"id\":\"1770017621159\",\"product\":{\"id\":\"70f7abfe-0001-11f1-a5c3-1866da2fd9d2\",\"name\":\"Burger Clásica\",\"description\":\"Hamburguesa con queso, lechuga y tomate\",\"price\":95,\"image\":\"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400\",\"category\":\"Burgers\",\"isAvailable\":true,\"available\":true,\"businessId\":\"bcf3a84a-0001-11f1-a5c3-1866da2fd9d2\"},\"quantity\":1}]','pending',9500,0,9500,'cash',NULL,'Calle Reforma 456, Autlán de Navarro',NULL,NULL,'2026-02-02 07:33:52',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'refund',NULL,9500,0,NULL,NULL,0,NULL),('9b07681b-0038-11f1-a5c3-1866da2fd9d2','ef47afae-0007-11f1-a5c3-1866da2fd9d2','bcf15003-0001-11f1-a5c3-1866da2fd9d2','Tacos El Güero',NULL,'[{\"id\":\"1\",\"quantity\":2,\"product\":{\"id\":\"1\",\"name\":\"Tacos al Pastor\",\"price\":15}}]','picked_up',3000,2500,5500,'cash',NULL,'Calle Principal 123','driver-1',NULL,'2026-02-02 13:10:54',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'refund',NULL,NULL,NULL,NULL,NULL,0,NULL),('b9337282-0009-11f1-a5c3-1866da2fd9d2','ef47afae-0007-11f1-a5c3-1866da2fd9d2','bcf3a84a-0001-11f1-a5c3-1866da2fd9d2','Burger House','','[{\"id\":\"1770017709168\",\"product\":{\"id\":\"70f7abfe-0001-11f1-a5c3-1866da2fd9d2\",\"name\":\"Burger Clásica\",\"description\":\"Hamburguesa con queso, lechuga y tomate\",\"price\":95,\"image\":\"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400\",\"category\":\"Burgers\",\"isAvailable\":true,\"available\":true,\"businessId\":\"bcf3a84a-0001-11f1-a5c3-1866da2fd9d2\"},\"quantity\":1}]','pending_confirmation',9500,0,9500,'cash',NULL,'Calle Reforma 456, Autlán de Navarro',NULL,NULL,'2026-02-02 07:35:18',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'refund',NULL,9500,0,NULL,NULL,0,NULL),('e4aa3c3d-0009-11f1-a5c3-1866da2fd9d2','ef47afae-0007-11f1-a5c3-1866da2fd9d2','bcf3a84a-0001-11f1-a5c3-1866da2fd9d2','Burger House','','[{\"id\":\"1770017781458\",\"product\":{\"id\":\"70f7abfe-0001-11f1-a5c3-1866da2fd9d2\",\"name\":\"Burger Clásica\",\"description\":\"Hamburguesa con queso, lechuga y tomate\",\"price\":95,\"image\":\"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400\",\"category\":\"Burgers\",\"isAvailable\":true,\"available\":true,\"businessId\":\"bcf3a84a-0001-11f1-a5c3-1866da2fd9d2\"},\"quantity\":1}]','pending_confirmation',9500,0,9500,'cash',NULL,'Calle Reforma 456, Autlán de Navarro',NULL,NULL,'2026-02-02 07:36:31',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'refund',NULL,9500,0,NULL,NULL,0,NULL),('order-delivered-1','customer-1','business-1','Tacos El G├╝ero','https://images.unsplash.com/photo-1565299585323-38d6b0865b47','[{\"id\":\"prod-1\",\"name\":\"Tacos de Asada\",\"price\":6000,\"quantity\":2}]','delivered',12000,2500,14500,'card',NULL,'{\"street\":\"Calle Principal 123\",\"city\":\"Autl├ín\",\"state\":\"Jalisco\",\"zipCode\":\"48900\",\"lat\":19.7667,\"lng\":-104.3667}','driver-1',NULL,'2026-02-02 01:43:56',NULL,NULL,NULL,NULL,NULL,NULL,2175,10150,2175,NULL,'2026-02-02 02:43:56',NULL,NULL,'refund',NULL,NULL,NULL,NULL,NULL,0,NULL),('order-in-progress-1','customer-2','business-1','Tacos El G├╝ero','https://images.unsplash.com/photo-1565299585323-38d6b0865b47','[{\"id\":\"prod-2\",\"name\":\"Tacos de Pastor\",\"price\":5500,\"quantity\":3}]','in_transit',16500,2500,19000,'card',NULL,'{\"street\":\"Avenida Ju├írez 456\",\"city\":\"Autl├ín\",\"state\":\"Jalisco\",\"zipCode\":\"48900\",\"lat\":19.7667,\"lng\":-104.3667}','driver-1',NULL,'2026-02-02 03:13:56',NULL,NULL,NULL,NULL,NULL,NULL,2850,13300,2850,NULL,NULL,NULL,NULL,'refund',NULL,NULL,NULL,NULL,NULL,0,NULL),('test-order-1','customer-1','business-2','Super Mercado Central',NULL,'[{\"productId\":\"prod-1\",\"quantity\":2}]','pending',12500,2500,15000,'card',NULL,'{\"street\":\"Calle Test 123\"}',NULL,NULL,'2026-02-02 19:03:39',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'refund',NULL,NULL,NULL,NULL,NULL,0,NULL);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` varchar(255) NOT NULL DEFAULT (uuid()),
  `business_id` varchar(255) NOT NULL,
  `name` text NOT NULL,
  `description` text,
  `price` int NOT NULL,
  `image` text,
  `category` text,
  `is_available` tinyint(1) NOT NULL DEFAULT '1',
  `is_86` tinyint(1) NOT NULL DEFAULT '0',
  `sold_by_weight` tinyint(1) NOT NULL DEFAULT '0',
  `weight_unit` text DEFAULT (_utf8mb4'kg'),
  `stock` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES ('70df6fa3-0001-11f1-a5c3-1866da2fd9d2','bcf15003-0001-11f1-a5c3-1866da2fd9d2','Tacos de Birria (3 pzas)','Tacos de birria con consomé',8500,'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=400','Tacos',1,0,0,'kg',NULL,'2026-02-02 06:36:01','2026-02-02 18:49:46'),('70e592e1-0001-11f1-a5c3-1866da2fd9d2','bcf15003-0001-11f1-a5c3-1866da2fd9d2','Tacos de Asada (3 pzas)','Tacos de carne asada',7500,'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400','Tacos',1,0,0,'kg',NULL,'2026-02-02 06:36:01','2026-02-02 07:27:09'),('70e594e6-0001-11f1-a5c3-1866da2fd9d2','bcf15003-0001-11f1-a5c3-1866da2fd9d2','Tacos al Pastor (3 pzas)','Tacos al pastor con piña',7000,'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400','Tacos',1,0,0,'kg',NULL,'2026-02-02 06:36:01','2026-02-02 07:27:09'),('70e595da-0001-11f1-a5c3-1866da2fd9d2','bcf15003-0001-11f1-a5c3-1866da2fd9d2','Quesadilla de Queso','Quesadilla de queso Oaxaca',6000,'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=400','Quesadillas',1,0,0,'kg',NULL,'2026-02-02 06:36:01','2026-02-02 07:27:09'),('70f7abfe-0001-11f1-a5c3-1866da2fd9d2','bcf3a84a-0001-11f1-a5c3-1866da2fd9d2','Burger Clásica','Hamburguesa con queso, lechuga y tomate',9500,'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400','Burgers',1,0,0,'kg',NULL,'2026-02-02 06:36:01','2026-02-02 07:27:09'),('70f7c4d0-0001-11f1-a5c3-1866da2fd9d2','bcf3a84a-0001-11f1-a5c3-1866da2fd9d2','Burger BBQ','Hamburguesa con salsa BBQ y tocino',11000,'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400','Burgers',1,0,0,'kg',NULL,'2026-02-02 06:36:01','2026-02-02 07:27:09'),('70f7c669-0001-11f1-a5c3-1866da2fd9d2','bcf3a84a-0001-11f1-a5c3-1866da2fd9d2','Burger Doble','Doble carne con queso americano',13500,'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400','Burgers',1,0,0,'kg',NULL,'2026-02-02 06:36:01','2026-02-02 07:27:09'),('70f7c714-0001-11f1-a5c3-1866da2fd9d2','bcf3a84a-0001-11f1-a5c3-1866da2fd9d2','Papas Fritas','Papas crujientes',4500,'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400','Acompañamientos',1,0,0,'kg',NULL,'2026-02-02 06:36:01','2026-02-02 07:27:09'),('711fc953-0001-11f1-a5c3-1866da2fd9d2','bcf50359-0001-11f1-a5c3-1866da2fd9d2','Pizza Margherita','Tomate, mozzarella y albahaca',15000,'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400','Pizza',1,0,0,'kg',NULL,'2026-02-02 06:36:01','2026-02-02 07:27:09'),('71258397-0001-11f1-a5c3-1866da2fd9d2','bcf50359-0001-11f1-a5c3-1866da2fd9d2','Pizza Pepperoni','Pepperoni y queso mozzarella',17000,'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400','Pizza',1,0,0,'kg',NULL,'2026-02-02 06:36:01','2026-02-02 07:27:09'),('7125858e-0001-11f1-a5c3-1866da2fd9d2','bcf50359-0001-11f1-a5c3-1866da2fd9d2','Pizza Hawaiana','Jamón y piña',16000,'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400','Pizza',1,0,0,'kg',NULL,'2026-02-02 06:36:01','2026-02-02 07:27:09'),('71258633-0001-11f1-a5c3-1866da2fd9d2','bcf50359-0001-11f1-a5c3-1866da2fd9d2','Lasagna','Lasagna casera con carne',14000,'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400','Pasta',1,0,0,'kg',NULL,'2026-02-02 06:36:01','2026-02-02 07:27:09'),('71481261-0001-11f1-a5c3-1866da2fd9d2','bcf632c5-0001-11f1-a5c3-1866da2fd9d2','Roll California','Cangrejo, aguacate y pepino',12000,'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400','Sushi',1,0,0,'kg',NULL,'2026-02-02 06:36:02','2026-02-02 07:27:09'),('71481720-0001-11f1-a5c3-1866da2fd9d2','bcf632c5-0001-11f1-a5c3-1866da2fd9d2','Roll Philadelphia','Salmón y queso crema',14000,'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=400','Sushi',1,0,0,'kg',NULL,'2026-02-02 06:36:02','2026-02-02 07:27:09'),('7148180b-0001-11f1-a5c3-1866da2fd9d2','bcf632c5-0001-11f1-a5c3-1866da2fd9d2','Sashimi Salmón','Sashimi fresco de salmón',16000,'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=400','Sashimi',1,0,0,'kg',NULL,'2026-02-02 06:36:02','2026-02-02 07:27:09'),('714818c4-0001-11f1-a5c3-1866da2fd9d2','bcf632c5-0001-11f1-a5c3-1866da2fd9d2','Nigiri Atún','Nigiri de atún fresco',13000,'https://images.unsplash.com/photo-1564489563601-c53cfc451e93?w=400','Nigiri',1,0,0,'kg',NULL,'2026-02-02 06:36:02','2026-02-02 07:27:09'),('714958fe-0001-11f1-a5c3-1866da2fd9d2','bcf8255f-0001-11f1-a5c3-1866da2fd9d2','Pollo Entero','Pollo rostizado completo',15000,'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400','Pollo',1,0,0,'kg',NULL,'2026-02-02 06:36:02','2026-02-02 07:27:09'),('71495ef2-0001-11f1-a5c3-1866da2fd9d2','bcf8255f-0001-11f1-a5c3-1866da2fd9d2','Medio Pollo','Medio pollo con tortillas',8500,'https://images.unsplash.com/photo-1594221708779-94832f4320d1?w=400','Pollo',1,0,0,'kg',NULL,'2026-02-02 06:36:02','2026-02-02 07:27:09'),('71495fe3-0001-11f1-a5c3-1866da2fd9d2','bcf8255f-0001-11f1-a5c3-1866da2fd9d2','Alitas BBQ','Alitas con salsa BBQ',9500,'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400','Pollo',1,0,0,'kg',NULL,'2026-02-02 06:36:02','2026-02-02 07:27:09'),('7149607d-0001-11f1-a5c3-1866da2fd9d2','bcf8255f-0001-11f1-a5c3-1866da2fd9d2','Ensalada César','Ensalada con pollo',7500,'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400','Ensaladas',1,0,0,'kg',NULL,'2026-02-02 06:36:02','2026-02-02 07:27:09'),('714aeec8-0001-11f1-a5c3-1866da2fd9d2','bcf96573-0001-11f1-a5c3-1866da2fd9d2','Ceviche de Camarón','Ceviche fresco con limón',12000,'https://images.unsplash.com/photo-1559737558-2f5a35f4523f?w=400','Mariscos',1,0,0,'kg',NULL,'2026-02-02 06:36:02','2026-02-02 07:27:09'),('714b04fc-0001-11f1-a5c3-1866da2fd9d2','bcf96573-0001-11f1-a5c3-1866da2fd9d2','Tostadas de Ceviche','Tostadas con ceviche mixto',10000,'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=400','Mariscos',1,0,0,'kg',NULL,'2026-02-02 06:36:02','2026-02-02 07:27:09'),('714b065e-0001-11f1-a5c3-1866da2fd9d2','bcf96573-0001-11f1-a5c3-1866da2fd9d2','Camarones al Mojo','Camarones con ajo',14000,'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400','Mariscos',1,0,0,'kg',NULL,'2026-02-02 06:36:02','2026-02-02 07:27:09'),('714b0705-0001-11f1-a5c3-1866da2fd9d2','bcf96573-0001-11f1-a5c3-1866da2fd9d2','Filete de Pescado','Filete empanizado',13000,'https://images.unsplash.com/photo-1580959375944-0b7b2e7e4f3a?w=400','Mariscos',1,0,0,'kg',NULL,'2026-02-02 06:36:02','2026-02-02 07:27:09'),('bcf31f05-0001-11f1-a5c3-1866da2fd9d2','bcf15003-0001-11f1-a5c3-1866da2fd9d2','Tacos de Birria (3 pzas)','Tacos de birria con consomé',8500,'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=400','Tacos',1,0,0,'kg',NULL,'2026-02-02 06:38:09','2026-02-02 07:27:09'),('bcf3353c-0001-11f1-a5c3-1866da2fd9d2','bcf15003-0001-11f1-a5c3-1866da2fd9d2','Tacos de Asada (3 pzas)','Tacos de carne asada',7500,'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400','Tacos',1,0,0,'kg',NULL,'2026-02-02 06:38:09','2026-02-02 07:27:09'),('bcf3364c-0001-11f1-a5c3-1866da2fd9d2','bcf15003-0001-11f1-a5c3-1866da2fd9d2','Tacos al Pastor (3 pzas)','Tacos al pastor con piña',7000,'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400','Tacos',1,0,0,'kg',NULL,'2026-02-02 06:38:09','2026-02-02 07:27:09'),('bcf336f0-0001-11f1-a5c3-1866da2fd9d2','bcf15003-0001-11f1-a5c3-1866da2fd9d2','Quesadilla de Queso','Quesadilla de queso Oaxaca',6000,'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=400','Quesadillas',1,0,0,'kg',NULL,'2026-02-02 06:38:09','2026-02-02 07:27:09'),('bcf40b78-0001-11f1-a5c3-1866da2fd9d2','bcf3a84a-0001-11f1-a5c3-1866da2fd9d2','Burger Clásica','Hamburguesa con queso, lechuga y tomate',9500,'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400','Burgers',1,0,0,'kg',NULL,'2026-02-02 06:38:09','2026-02-02 07:27:09'),('bcf428bc-0001-11f1-a5c3-1866da2fd9d2','bcf3a84a-0001-11f1-a5c3-1866da2fd9d2','Burger BBQ','Hamburguesa con salsa BBQ y tocino',11000,'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400','Burgers',1,0,0,'kg',NULL,'2026-02-02 06:38:09','2026-02-02 07:27:09'),('bcf42aa4-0001-11f1-a5c3-1866da2fd9d2','bcf3a84a-0001-11f1-a5c3-1866da2fd9d2','Burger Doble','Doble carne con queso americano',13500,'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400','Burgers',1,0,0,'kg',NULL,'2026-02-02 06:38:09','2026-02-02 07:27:09'),('bcf42b4f-0001-11f1-a5c3-1866da2fd9d2','bcf3a84a-0001-11f1-a5c3-1866da2fd9d2','Papas Fritas','Papas crujientes',4500,'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400','Acompañamientos',1,0,0,'kg',NULL,'2026-02-02 06:38:09','2026-02-02 07:27:09'),('bcf598d6-0001-11f1-a5c3-1866da2fd9d2','bcf50359-0001-11f1-a5c3-1866da2fd9d2','Pizza Margherita','Tomate, mozzarella y albahaca',15000,'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400','Pizza',1,0,0,'kg',NULL,'2026-02-02 06:38:09','2026-02-02 07:27:09'),('bcf5c35f-0001-11f1-a5c3-1866da2fd9d2','bcf50359-0001-11f1-a5c3-1866da2fd9d2','Pizza Pepperoni','Pepperoni y queso mozzarella',17000,'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400','Pizza',1,0,0,'kg',NULL,'2026-02-02 06:38:09','2026-02-02 07:27:09'),('bcf5c51b-0001-11f1-a5c3-1866da2fd9d2','bcf50359-0001-11f1-a5c3-1866da2fd9d2','Pizza Hawaiana','Jamón y piña',16000,'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400','Pizza',1,0,0,'kg',NULL,'2026-02-02 06:38:09','2026-02-02 07:27:09'),('bcf5c725-0001-11f1-a5c3-1866da2fd9d2','bcf50359-0001-11f1-a5c3-1866da2fd9d2','Lasagna','Lasagna casera con carne',14000,'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400','Pasta',1,0,0,'kg',NULL,'2026-02-02 06:38:09','2026-02-02 07:27:09'),('bcf716bc-0001-11f1-a5c3-1866da2fd9d2','bcf632c5-0001-11f1-a5c3-1866da2fd9d2','Roll California','Cangrejo, aguacate y pepino',12000,'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400','Sushi',1,0,0,'kg',NULL,'2026-02-02 06:38:09','2026-02-02 07:27:09'),('bcf72e47-0001-11f1-a5c3-1866da2fd9d2','bcf632c5-0001-11f1-a5c3-1866da2fd9d2','Roll Philadelphia','Salmón y queso crema',14000,'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=400','Sushi',1,0,0,'kg',NULL,'2026-02-02 06:38:09','2026-02-02 07:27:09'),('bcf72f85-0001-11f1-a5c3-1866da2fd9d2','bcf632c5-0001-11f1-a5c3-1866da2fd9d2','Sashimi Salmón','Sashimi fresco de salmón',16000,'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=400','Sashimi',1,0,0,'kg',NULL,'2026-02-02 06:38:09','2026-02-02 07:27:09'),('bcf73059-0001-11f1-a5c3-1866da2fd9d2','bcf632c5-0001-11f1-a5c3-1866da2fd9d2','Nigiri Atún','Nigiri de atún fresco',13000,'https://images.unsplash.com/photo-1564489563601-c53cfc451e93?w=400','Nigiri',1,0,0,'kg',NULL,'2026-02-02 06:38:09','2026-02-02 07:27:09'),('bcf8bd86-0001-11f1-a5c3-1866da2fd9d2','bcf8255f-0001-11f1-a5c3-1866da2fd9d2','Pollo Entero','Pollo rostizado completo',15000,'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400','Pollo',1,0,0,'kg',NULL,'2026-02-02 06:38:09','2026-02-02 07:27:09'),('bcf8c33e-0001-11f1-a5c3-1866da2fd9d2','bcf8255f-0001-11f1-a5c3-1866da2fd9d2','Medio Pollo','Medio pollo con tortillas',8500,'https://images.unsplash.com/photo-1594221708779-94832f4320d1?w=400','Pollo',1,0,0,'kg',NULL,'2026-02-02 06:38:09','2026-02-02 07:27:09'),('bcf8c42a-0001-11f1-a5c3-1866da2fd9d2','bcf8255f-0001-11f1-a5c3-1866da2fd9d2','Alitas BBQ','Alitas con salsa BBQ',9500,'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400','Pollo',1,0,0,'kg',NULL,'2026-02-02 06:38:09','2026-02-02 07:27:09'),('bcf8c4dd-0001-11f1-a5c3-1866da2fd9d2','bcf8255f-0001-11f1-a5c3-1866da2fd9d2','Ensalada César','Ensalada con pollo',7500,'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400','Ensaladas',1,0,0,'kg',NULL,'2026-02-02 06:38:09','2026-02-02 07:27:09'),('bcf9e334-0001-11f1-a5c3-1866da2fd9d2','bcf96573-0001-11f1-a5c3-1866da2fd9d2','Ceviche de Camarón','Ceviche fresco con limón',12000,'https://images.unsplash.com/photo-1559737558-2f5a35f4523f?w=400','Mariscos',1,0,0,'kg',NULL,'2026-02-02 06:38:09','2026-02-02 07:27:09'),('bcf9fbdf-0001-11f1-a5c3-1866da2fd9d2','bcf96573-0001-11f1-a5c3-1866da2fd9d2','Tostadas de Ceviche','Tostadas con ceviche mixto',10000,'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=400','Mariscos',1,0,0,'kg',NULL,'2026-02-02 06:38:09','2026-02-02 07:27:09'),('bcf9fd95-0001-11f1-a5c3-1866da2fd9d2','bcf96573-0001-11f1-a5c3-1866da2fd9d2','Camarones al Mojo','Camarones con ajo',14000,'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400','Mariscos',1,0,0,'kg',NULL,'2026-02-02 06:38:09','2026-02-02 07:27:09'),('bcf9fe7b-0001-11f1-a5c3-1866da2fd9d2','bcf96573-0001-11f1-a5c3-1866da2fd9d2','Filete de Pescado','Filete empanizado',13000,'https://images.unsplash.com/photo-1580959375944-0b7b2e7e4f3a?w=400','Mariscos',1,0,0,'kg',NULL,'2026-02-02 06:38:09','2026-02-02 07:27:09'),('dbbb199d-0000-11f1-a5c3-1866da2fd9d2','bcf15003-0001-11f1-a5c3-1866da2fd9d2','Tacos de Birria (3 pzas)','Tacos de birria de res con consomé, cebolla y cilantro',8500,'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=400','Tacos',1,0,0,'kg',NULL,'2026-02-02 06:31:51','2026-02-02 07:27:09'),('dbbbbeba-0000-11f1-a5c3-1866da2fd9d2','bcf15003-0001-11f1-a5c3-1866da2fd9d2','Tacos de Asada (3 pzas)','Tacos de carne asada con guacamole y pico de gallo',7500,'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400','Tacos',1,0,0,'kg',NULL,'2026-02-02 06:31:51','2026-02-02 07:27:09'),('dbbbc209-0000-11f1-a5c3-1866da2fd9d2','bcf15003-0001-11f1-a5c3-1866da2fd9d2','Tacos al Pastor (3 pzas)','Tacos al pastor con piña, cilantro y cebolla',7000,'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400','Tacos',1,0,0,'kg',NULL,'2026-02-02 06:31:51','2026-02-02 07:27:09'),('dbbbc470-0000-11f1-a5c3-1866da2fd9d2','bcf15003-0001-11f1-a5c3-1866da2fd9d2','Quesadilla de Queso','Quesadilla grande de queso Oaxaca',6000,'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=400','Quesadillas',1,0,0,'kg',NULL,'2026-02-02 06:31:51','2026-02-02 07:27:09'),('dbbbc633-0000-11f1-a5c3-1866da2fd9d2','bcf15003-0001-11f1-a5c3-1866da2fd9d2','Quesadilla de Birria','Quesadilla con birria y queso fundido',9000,'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=400','Quesadillas',1,0,0,'kg',NULL,'2026-02-02 06:31:51','2026-02-02 07:27:09'),('dbbc22f5-0000-11f1-a5c3-1866da2fd9d2','0','Torta de Birria','Torta con birria, frijoles, aguacate y queso',8000,'https://images.unsplash.com/photo-1619740455993-9e8c6c3e6e4f?w=400','Tortas',1,0,0,'kg',NULL,'2026-02-02 06:31:51','2026-02-02 06:31:51'),('dbbc286d-0000-11f1-a5c3-1866da2fd9d2','0','Torta de Asada','Torta de carne asada con todo',7500,'https://images.unsplash.com/photo-1619740455993-9e8c6c3e6e4f?w=400','Tortas',1,0,0,'kg',NULL,'2026-02-02 06:31:51','2026-02-02 06:31:51'),('dbbc391f-0000-11f1-a5c3-1866da2fd9d2','0','Coca-Cola 600ml','Refresco Coca-Cola',2000,'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400','Bebidas',1,0,0,'kg',NULL,'2026-02-02 06:31:51','2026-02-02 06:31:51'),('dbbc5d03-0000-11f1-a5c3-1866da2fd9d2','0','Agua de Horchata','Agua fresca de horchata natural',2500,'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400','Bebidas',1,0,0,'kg',NULL,'2026-02-02 06:31:51','2026-02-02 06:31:51'),('dbbc6479-0000-11f1-a5c3-1866da2fd9d2','0','Agua de Jamaica','Agua fresca de jamaica natural',2500,'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400','Bebidas',1,0,0,'kg',NULL,'2026-02-02 06:31:51','2026-02-02 06:31:51'),('prod-1','bcf15003-0001-11f1-a5c3-1866da2fd9d2','Tacos de Asada','3 tacos con carne asada',6000,'https://images.unsplash.com/photo-1565299585323-38d6b0865b47','tacos',1,0,0,'kg',NULL,'2026-02-02 03:43:56','2026-02-02 07:27:09'),('prod-2','bcf15003-0001-11f1-a5c3-1866da2fd9d2','Tacos de Pastor','3 tacos al pastor',5500,'https://images.unsplash.com/photo-1565299585323-38d6b0865b47','tacos',1,0,0,'kg',NULL,'2026-02-02 03:43:56','2026-02-02 19:05:22'),('prod-3','business-2','Aguacate','Aguacate fresco por kg',8000,'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578','frutas',1,0,0,'kg',NULL,'2026-02-02 03:43:56','2026-02-02 03:43:56');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refresh_tokens`
--

DROP TABLE IF EXISTS `refresh_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refresh_tokens` (
  `id` varchar(255) NOT NULL DEFAULT (uuid()),
  `user_id` varchar(255) NOT NULL,
  `token` text NOT NULL,
  `expires_at` timestamp NOT NULL,
  `revoked` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refresh_tokens`
--

LOCK TABLES `refresh_tokens` WRITE;
/*!40000 ALTER TABLE `refresh_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `refresh_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` varchar(255) NOT NULL DEFAULT (uuid()),
  `user_id` varchar(255) NOT NULL,
  `order_id` varchar(255) NOT NULL,
  `business_id` varchar(255) NOT NULL,
  `rating` int NOT NULL,
  `comment` text,
  `approved` tinyint(1) NOT NULL DEFAULT '1',
  `flagged` tinyint(1) NOT NULL DEFAULT '0',
  `moderation_reason` text,
  `business_response` text,
  `business_response_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `scheduled_orders`
--

DROP TABLE IF EXISTS `scheduled_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `scheduled_orders` (
  `id` varchar(255) NOT NULL DEFAULT (uuid()),
  `user_id` varchar(255) NOT NULL,
  `business_id` varchar(255) NOT NULL,
  `items` text NOT NULL,
  `scheduled_for` timestamp NOT NULL,
  `delivery_address` text NOT NULL,
  `delivery_latitude` text,
  `delivery_longitude` text,
  `payment_method` text NOT NULL,
  `notes` text,
  `status` text NOT NULL DEFAULT (_utf8mb4'pending'),
  `order_id` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `scheduled_orders`
--

LOCK TABLES `scheduled_orders` WRITE;
/*!40000 ALTER TABLE `scheduled_orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `scheduled_orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stripe_connect_accounts`
--

DROP TABLE IF EXISTS `stripe_connect_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stripe_connect_accounts` (
  `id` varchar(255) NOT NULL DEFAULT (uuid()),
  `user_id` varchar(255) NOT NULL,
  `business_id` varchar(255) DEFAULT NULL,
  `stripe_account_id` varchar(255) NOT NULL,
  `account_type` text NOT NULL,
  `onboarding_complete` tinyint(1) NOT NULL DEFAULT '0',
  `charges_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `payouts_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `details_submitted` tinyint(1) NOT NULL DEFAULT '0',
  `requirements` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `stripe_connect_accounts_stripe_account_id_unique` (`stripe_account_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stripe_connect_accounts`
--

LOCK TABLES `stripe_connect_accounts` WRITE;
/*!40000 ALTER TABLE `stripe_connect_accounts` DISABLE KEYS */;
/*!40000 ALTER TABLE `stripe_connect_accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `support_chats`
--

DROP TABLE IF EXISTS `support_chats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `support_chats` (
  `id` varchar(255) NOT NULL DEFAULT (uuid()),
  `user_id` varchar(255) NOT NULL,
  `status` text NOT NULL DEFAULT (_utf8mb4'active'),
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `support_chats`
--

LOCK TABLES `support_chats` WRITE;
/*!40000 ALTER TABLE `support_chats` DISABLE KEYS */;
/*!40000 ALTER TABLE `support_chats` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `support_messages`
--

DROP TABLE IF EXISTS `support_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `support_messages` (
  `id` varchar(255) NOT NULL DEFAULT (uuid()),
  `chat_id` varchar(255) NOT NULL,
  `user_id` varchar(255) DEFAULT NULL,
  `message` text NOT NULL,
  `is_bot` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `support_messages`
--

LOCK TABLES `support_messages` WRITE;
/*!40000 ALTER TABLE `support_messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `support_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_settings`
--

DROP TABLE IF EXISTS `system_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_settings` (
  `id` varchar(255) NOT NULL DEFAULT (uuid()),
  `key` varchar(255) NOT NULL,
  `value` text NOT NULL,
  `type` text NOT NULL DEFAULT (_utf8mb4'string'),
  `category` text NOT NULL,
  `description` text,
  `is_public` tinyint(1) NOT NULL DEFAULT '0',
  `updated_by` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `system_settings_key_unique` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_settings`
--

LOCK TABLES `system_settings` WRITE;
/*!40000 ALTER TABLE `system_settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `system_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transactions` (
  `id` varchar(255) NOT NULL DEFAULT (uuid()),
  `wallet_id` varchar(255) NOT NULL,
  `order_id` varchar(255) DEFAULT NULL,
  `type` text NOT NULL,
  `amount` int NOT NULL,
  `balance_before` int NOT NULL,
  `balance_after` int NOT NULL,
  `description` text NOT NULL,
  `status` text NOT NULL DEFAULT (_utf8mb4'completed'),
  `metadata` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactions`
--

LOCK TABLES `transactions` WRITE;
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` varchar(255) NOT NULL DEFAULT (uuid()),
  `email` text,
  `password` text,
  `name` text NOT NULL,
  `phone` text NOT NULL,
  `role` text NOT NULL DEFAULT (_utf8mb4'customer'),
  `email_verified` tinyint(1) NOT NULL DEFAULT '0',
  `phone_verified` tinyint(1) NOT NULL DEFAULT '0',
  `biometric_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `verification_code` text,
  `verification_expires` timestamp NULL DEFAULT NULL,
  `stripe_customer_id` text,
  `stripe_payment_method_id` text,
  `card_last4` text,
  `card_brand` text,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `is_online` tinyint(1) NOT NULL DEFAULT '0',
  `last_active_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('249c1786-ffea-11f0-a5c3-1866da2fd9d2',NULL,NULL,'Usuario','+52 341 456 7890','admin',0,1,0,NULL,NULL,NULL,NULL,NULL,NULL,1,0,NULL,'2026-02-02 03:49:15'),('323bc96b-0066-11f1-a5c3-1866da2fd9d2',NULL,NULL,'Usuario','+52 341 456 7893','customer',0,1,0,NULL,NULL,NULL,NULL,NULL,NULL,1,0,NULL,'2026-02-02 18:37:15'),('business-owner-1',NULL,NULL,'Carlos Restaurante','+52 341 456 7892','business_owner',0,1,0,NULL,NULL,NULL,NULL,NULL,NULL,1,0,NULL,'2026-02-02 03:43:56'),('business-owner-2',NULL,NULL,'Ana Mercado','+523414567893','business_owner',0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,1,0,NULL,'2026-02-02 03:43:56'),('customer-1',NULL,NULL,'Juan P├®rez','+523414567890','customer',0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,1,0,NULL,'2026-02-02 03:43:56'),('customer-2',NULL,NULL,'Mar├¡a Garc├¡a','+523414567891','customer',0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,1,0,NULL,'2026-02-02 03:43:56'),('driver-1',NULL,NULL,'Pedro Repartidor','+523414567894','delivery_driver',0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,1,0,NULL,'2026-02-02 03:43:56'),('ef47afae-0007-11f1-a5c3-1866da2fd9d2',NULL,NULL,'Usuario','+52 123 123 2131','customer',0,1,0,NULL,NULL,NULL,NULL,NULL,NULL,1,0,NULL,'2026-02-02 07:22:30');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wallets`
--

DROP TABLE IF EXISTS `wallets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wallets` (
  `id` varchar(255) NOT NULL DEFAULT (uuid()),
  `user_id` varchar(255) NOT NULL,
  `balance` int NOT NULL DEFAULT '0',
  `pending_balance` int NOT NULL DEFAULT '0',
  `total_earned` int NOT NULL DEFAULT '0',
  `total_withdrawn` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wallets`
--

LOCK TABLES `wallets` WRITE;
/*!40000 ALTER TABLE `wallets` DISABLE KEYS */;
INSERT INTO `wallets` VALUES ('wallet-business-1','business-owner-1',42000,0,0,0,'2026-02-02 03:43:56','2026-02-02 03:43:56'),('wallet-customer-1','customer-1',0,0,0,0,'2026-02-02 03:43:56','2026-02-02 03:43:56'),('wallet-driver-1','driver-1',9000,0,0,0,'2026-02-02 03:43:56','2026-02-02 03:43:56');
/*!40000 ALTER TABLE `wallets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `withdrawals`
--

DROP TABLE IF EXISTS `withdrawals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `withdrawals` (
  `id` varchar(255) NOT NULL DEFAULT (uuid()),
  `wallet_id` varchar(255) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `amount` int NOT NULL,
  `status` text NOT NULL DEFAULT (_utf8mb4'pending'),
  `stripe_transfer_id` text,
  `stripe_payout_id` text,
  `method` text NOT NULL DEFAULT (_utf8mb4'stripe'),
  `bank_account` text,
  `failure_reason` text,
  `processed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `withdrawals`
--

LOCK TABLES `withdrawals` WRITE;
/*!40000 ALTER TABLE `withdrawals` DISABLE KEYS */;
/*!40000 ALTER TABLE `withdrawals` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-02 16:13:07
