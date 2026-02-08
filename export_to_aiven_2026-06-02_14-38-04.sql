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
INSERT INTO `addresses` VALUES ('5804461d-02ee-11f1-a2c4-1866da2fd9d2','249c1786-ffea-11f0-a5c3-1866da2fd9d2','CASA','CALLE ALEJANDRIA 3','Autlán','Jalisco','',0,'19.7708','-104.3636','2026-02-05 23:56:52'),('6801d365-02ee-11f1-a2c4-1866da2fd9d2','249c1786-ffea-11f0-a5c3-1866da2fd9d2','ASDASDAS','ASDASDASD','Autlán','Jalisco','',0,'19.7708','-104.3636','2026-02-05 23:57:19'),('8dddac93-02e8-11f1-a2c4-1866da2fd9d2','driver-1','Casa','Prueba numero 22','Autlán','Jalisco','',1,'19.7708','-104.3636','2026-02-05 23:15:26');
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
INSERT INTO `audit_logs` VALUES ('017ebf57-02fc-11f1-a2c4-1866da2fd9d2','249c1786-ffea-11f0-a5c3-1866da2fd9d2','create_coupon','coupon',NULL,'{\"method\":\"POST\",\"path\":\"/admin/coupons\",\"body\":{\"code\":\"ADASDASD\",\"discountType\":\"percentage\",\"discountValue\":10,\"minOrderAmount\":10000,\"maxUses\":5,\"maxUsesPerUser\":1,\"expiresAt\":\"2026-03-31T00:00:00.000Z\",\"isActive\":true},\"query\":{}}','::1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36','2026-02-06 01:34:40'),('0d990f43-02fb-11f1-a2c4-1866da2fd9d2','249c1786-ffea-11f0-a5c3-1866da2fd9d2','create_coupon','coupon',NULL,'{\"method\":\"POST\",\"path\":\"/admin/coupons\",\"body\":{\"code\":\"CASKIUZMAIN\",\"discountType\":\"percentage\",\"discountValue\":10,\"minOrderAmount\":10000,\"maxUses\":5,\"maxUsesPerUser\":1,\"expiresAt\":\"2026-03-31T00:00:00.000Z\",\"isActive\":true},\"query\":{}}','::1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36','2026-02-06 01:27:51'),('34306a16-02ff-11f1-a2c4-1866da2fd9d2','249c1786-ffea-11f0-a5c3-1866da2fd9d2','create_coupon','coupon',NULL,'{\"method\":\"POST\",\"path\":\"/admin/coupons\",\"body\":{\"code\":\"PAULETTE\",\"discountType\":\"percentage\",\"discountValue\":10,\"minOrderAmount\":10000,\"maxUses\":10,\"maxUsesPerUser\":1,\"expiresAt\":\"2026-03-31T00:00:00.000Z\",\"isActive\":true},\"query\":{}}','::1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36','2026-02-06 01:57:34'),('4566cc51-02fe-11f1-a2c4-1866da2fd9d2','249c1786-ffea-11f0-a5c3-1866da2fd9d2','create_coupon','coupon',NULL,'{\"method\":\"POST\",\"path\":\"/admin/coupons\",\"body\":{\"code\":\"ASDASDASD\",\"discountType\":\"percentage\",\"discountValue\":10,\"minOrderAmount\":10000,\"maxUses\":10,\"maxUsesPerUser\":null,\"expiresAt\":\"2026-03-31T00:00:00.000Z\",\"isActive\":true},\"query\":{}}','::1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36','2026-02-06 01:50:53'),('6869443a-02ed-11f1-a2c4-1866da2fd9d2','249c1786-ffea-11f0-a5c3-1866da2fd9d2','update_user','user','249c1786-ffea-11f0-a5c3-1866da2fd9d2','{\"method\":\"PUT\",\"path\":\"/users/249c1786-ffea-11f0-a5c3-1866da2fd9d2\",\"body\":{\"name\":\"Caskiuz Main\",\"phone\":\"+52 341 456 7890\",\"email\":\"admin@nemy.com\"},\"query\":{}}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 OPR/126.0.0.0 (Edition Campaign 34)','2026-02-05 23:50:10'),('6c528506-02fc-11f1-a2c4-1866da2fd9d2','249c1786-ffea-11f0-a5c3-1866da2fd9d2','create_coupon','coupon',NULL,'{\"method\":\"POST\",\"path\":\"/admin/coupons\",\"body\":{\"code\":\"ADASDASD\",\"discountType\":\"percentage\",\"discountValue\":10,\"minOrderAmount\":10000,\"maxUses\":5,\"maxUsesPerUser\":1,\"expiresAt\":\"2026-03-31T00:00:00.000Z\",\"isActive\":true},\"query\":{}}','::1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36','2026-02-06 01:37:39'),('6ddb0919-02fc-11f1-a2c4-1866da2fd9d2','249c1786-ffea-11f0-a5c3-1866da2fd9d2','create_coupon','coupon',NULL,'{\"method\":\"POST\",\"path\":\"/admin/coupons\",\"body\":{\"code\":\"ADASDASD\",\"discountType\":\"percentage\",\"discountValue\":10,\"minOrderAmount\":10000,\"maxUses\":5,\"maxUsesPerUser\":1,\"expiresAt\":\"2026-03-31T00:00:00.000Z\",\"isActive\":true},\"query\":{}}','::1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36','2026-02-06 01:37:42'),('6e453af2-02fc-11f1-a2c4-1866da2fd9d2','249c1786-ffea-11f0-a5c3-1866da2fd9d2','create_coupon','coupon',NULL,'{\"method\":\"POST\",\"path\":\"/admin/coupons\",\"body\":{\"code\":\"ADASDASD\",\"discountType\":\"percentage\",\"discountValue\":10,\"minOrderAmount\":10000,\"maxUses\":5,\"maxUsesPerUser\":1,\"expiresAt\":\"2026-03-31T00:00:00.000Z\",\"isActive\":true},\"query\":{}}','::1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36','2026-02-06 01:37:43'),('6e6a97bd-02fc-11f1-a2c4-1866da2fd9d2','249c1786-ffea-11f0-a5c3-1866da2fd9d2','create_coupon','coupon',NULL,'{\"method\":\"POST\",\"path\":\"/admin/coupons\",\"body\":{\"code\":\"ADASDASD\",\"discountType\":\"percentage\",\"discountValue\":10,\"minOrderAmount\":10000,\"maxUses\":5,\"maxUsesPerUser\":1,\"expiresAt\":\"2026-03-31T00:00:00.000Z\",\"isActive\":true},\"query\":{}}','::1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36','2026-02-06 01:37:43'),('96c85354-02fc-11f1-a2c4-1866da2fd9d2','249c1786-ffea-11f0-a5c3-1866da2fd9d2','create_coupon','coupon',NULL,'{\"method\":\"POST\",\"path\":\"/admin/coupons\",\"body\":{\"code\":\"ADASDASD\",\"discountType\":\"percentage\",\"discountValue\":10,\"minOrderAmount\":10000,\"maxUses\":5,\"maxUsesPerUser\":1,\"expiresAt\":\"2026-03-31T00:00:00.000Z\",\"isActive\":true},\"query\":{}}','::1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36','2026-02-06 01:38:50'),('bc52ccfa-02fb-11f1-a2c4-1866da2fd9d2','249c1786-ffea-11f0-a5c3-1866da2fd9d2','create_coupon','coupon',NULL,'{\"method\":\"POST\",\"path\":\"/admin/coupons\",\"body\":{\"code\":\"CASKIUZMAIN\",\"discountType\":\"percentage\",\"discountValue\":10,\"minOrderAmount\":10000,\"maxUses\":5,\"maxUsesPerUser\":1,\"expiresAt\":\"2026-03-31T00:00:00.000Z\",\"isActive\":true},\"query\":{}}','::1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36','2026-02-06 01:32:44'),('e187ccc9-02fc-11f1-a2c4-1866da2fd9d2','249c1786-ffea-11f0-a5c3-1866da2fd9d2','create_coupon','coupon',NULL,'{\"method\":\"POST\",\"path\":\"/admin/coupons\",\"body\":{\"code\":\"ASDASDASD\",\"discountType\":\"percentage\",\"discountValue\":10,\"minOrderAmount\":10000,\"maxUses\":2,\"maxUsesPerUser\":1,\"expiresAt\":\"2026-05-31T00:00:00.000Z\",\"isActive\":true},\"query\":{}}','::1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36','2026-02-06 01:40:56');
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
  `phone_verified` tinyint(1) NOT NULL DEFAULT '0',
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
  `stripe_account_id` text,
  `stripe_account_status` text DEFAULT (_utf8mb4'pending'),
  `verification_code` varchar(10) DEFAULT NULL,
  `verification_expires` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `avg_prep_time` int DEFAULT '20' COMMENT 'Tiempo promedio preparaci├│n en minutos',
  `min_prep_time` int DEFAULT '10' COMMENT 'Tiempo m├¡nimo preparaci├│n',
  `max_prep_time` int DEFAULT '45' COMMENT 'Tiempo m├íximo preparaci├│n',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `businesses`
--

LOCK TABLES `businesses` WRITE;
/*!40000 ALTER TABLE `businesses` DISABLE KEYS */;
INSERT INTO `businesses` VALUES ('bcf15003-0001-11f1-a5c3-1866da2fd9d2','business-owner-1','Tacos El Güero','Los mejores tacos de Autlán','restaurant','https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400',NULL,'Av. Revolución 123, Centro, Autlán','+52 317 123 4567',0,NULL,0,0,'30-45 min',2500,5000,1,0,'[{\"day\":\"Lunes\",\"isOpen\":true,\"openTime\":\"09:00\",\"closeTime\":\"18:00\"},{\"day\":\"Martes\",\"isOpen\":true,\"openTime\":\"09:00\",\"closeTime\":\"18:00\"},{\"day\":\"Miércoles\",\"isOpen\":true,\"openTime\":\"09:00\",\"closeTime\":\"18:00\"},{\"day\":\"Jueves\",\"isOpen\":true,\"openTime\":\"09:00\",\"closeTime\":\"18:00\"},{\"day\":\"Viernes\",\"isOpen\":true,\"openTime\":\"09:00\",\"closeTime\":\"18:00\"},{\"day\":\"Sábado\",\"isOpen\":true,\"openTime\":\"09:00\",\"closeTime\":\"14:00\"},{\"day\":\"Domingo\",\"isOpen\":false,\"openTime\":\"09:00\",\"closeTime\":\"14:00\"}]','tacos,mexicana,antojitos','2026-02-02 06:38:09','20.0736','-104.3647',10,500,'pending',NULL,10,0,NULL,NULL,NULL,1,0,0,0,20,NULL,NULL,'pending',NULL,NULL,'2026-02-06 18:25:33',20,15,30),('bcf3a84a-0001-11f1-a5c3-1866da2fd9d2','business-owner-1','Burger House','Hamburguesas artesanales','restaurant','https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',NULL,'Calle Hidalgo 456, Autlán','+52 317 234 5678',0,NULL,0,0,'30-45 min',3000,8000,1,1,NULL,'burgers,hamburguesas,americana','2026-02-02 06:38:09','20.0740','-104.3650',10,500,'pending',NULL,10,0,NULL,NULL,NULL,1,0,0,0,20,NULL,NULL,'pending',NULL,NULL,'2026-02-05 23:02:20',20,15,30),('bcf50359-0001-11f1-a5c3-1866da2fd9d2','business-owner-1','Pizza Napoli','Auténtica pizza italiana','restaurant','https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',NULL,'Av. Juárez 789, Autlán','+52 317 345 6789',0,NULL,0,0,'30-45 min',3500,12000,1,1,NULL,'pizza,italiana,pastas','2026-02-02 06:38:09','20.0745','-104.3655',10,500,'pending',NULL,10,0,NULL,NULL,NULL,1,0,0,0,20,NULL,NULL,'pending',NULL,NULL,'2026-02-05 23:02:20',20,15,30),('bcf632c5-0001-11f1-a5c3-1866da2fd9d2',NULL,'Sushi Zen','Sushi fresco y delicioso','restaurant','https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400',NULL,'Calle Morelos 321, Autlán','+52 317 456 7890',0,NULL,0,0,'30-45 min',4000,15000,1,1,NULL,'sushi,japonesa','2026-02-02 06:38:09','20.0750','-104.3660',10,500,'pending',NULL,10,0,NULL,NULL,NULL,1,0,0,0,20,NULL,NULL,'pending',NULL,NULL,'2026-02-05 23:02:20',20,15,30),('bcf8255f-0001-11f1-a5c3-1866da2fd9d2',NULL,'Pollo Loco','Pollo asado y rostizado','restaurant','https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400',NULL,'Av. Independencia 654, Autlán','+52 317 567 8901',0,NULL,0,0,'30-45 min',2500,7000,1,1,NULL,'pollo,alitas','2026-02-02 06:38:09','20.0755','-104.3665',10,500,'pending',NULL,10,0,NULL,NULL,NULL,1,0,0,0,20,NULL,NULL,'pending',NULL,NULL,'2026-02-05 23:02:20',20,15,30),('bcf96573-0001-11f1-a5c3-1866da2fd9d2',NULL,'Mariscos El Puerto','Mariscos frescos del pacífico','restaurant','https://images.unsplash.com/photo-1559737558-2f5a35f4523f?w=400',NULL,'Calle Zaragoza 987, Autlán','+52 317 678 9012',0,NULL,0,0,'30-45 min',3500,10000,1,1,NULL,'mariscos,pescado','2026-02-02 06:38:09','20.0760','-104.3670',10,500,'pending',NULL,10,0,NULL,NULL,NULL,1,0,0,0,20,NULL,NULL,'pending',NULL,NULL,'2026-02-05 23:02:20',20,15,30),('business-1','business-owner-1','Tacos El G├╝ero','Los mejores tacos de Autl├ín','restaurant','https://images.unsplash.com/photo-1565299585323-38d6b0865b47','https://images.unsplash.com/photo-1565299585323-38d6b0865b47',NULL,NULL,0,NULL,480,0,'20-30 min',2500,5000,1,1,NULL,'tacos,mexicana','2026-02-02 03:43:56',NULL,NULL,10,500,'pending',NULL,10,0,NULL,NULL,NULL,1,0,0,0,20,NULL,NULL,'pending',NULL,NULL,'2026-02-05 23:02:20',20,15,30),('business-2','business-owner-2','Super Mercado Central','Frutas, verduras y m├ís','market','https://images.unsplash.com/photo-1542838132-92c53300491e','https://images.unsplash.com/photo-1542838132-92c53300491e',NULL,NULL,0,NULL,450,0,'30-45 min',3000,10000,1,1,NULL,'mercado,abarrotes','2026-02-02 03:43:56',NULL,NULL,10,500,'pending',NULL,10,0,NULL,NULL,NULL,1,0,0,0,20,NULL,NULL,'pending',NULL,NULL,'2026-02-05 23:02:20',20,15,30),('test-business-1','test-business-1','Test Restaurant',NULL,'restaurant',NULL,NULL,NULL,NULL,0,NULL,0,0,'30-45 min',2500,5000,1,1,NULL,NULL,'2026-02-05 04:08:19',NULL,NULL,10,500,'pending',NULL,10,0,NULL,NULL,NULL,1,0,0,0,20,NULL,NULL,'pending',NULL,NULL,'2026-02-05 23:02:20',20,15,30);
/*!40000 ALTER TABLE `businesses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `call_logs`
--

DROP TABLE IF EXISTS `call_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `call_logs` (
  `id` varchar(255) NOT NULL,
  `order_id` varchar(255) NOT NULL,
  `business_id` varchar(255) NOT NULL,
  `call_sid` varchar(255) DEFAULT NULL,
  `phone_number` varchar(50) DEFAULT NULL,
  `purpose` varchar(50) DEFAULT 'order_notification',
  `status` varchar(50) DEFAULT 'initiated',
  `duration` int DEFAULT NULL,
  `outcome` varchar(50) DEFAULT NULL,
  `response` varchar(10) DEFAULT NULL,
  `response_action` varchar(50) DEFAULT NULL,
  `retry_count` int DEFAULT '0',
  `error` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `call_logs`
--

LOCK TABLES `call_logs` WRITE;
/*!40000 ALTER TABLE `call_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `call_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coupons`
--

DROP TABLE IF EXISTS `coupons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coupons` (
  `id` varchar(255) NOT NULL DEFAULT (uuid()),
  `code` varchar(50) NOT NULL,
  `discount_type` varchar(20) NOT NULL,
  `discount_value` int NOT NULL,
  `min_order_amount` int DEFAULT '0',
  `max_uses` int DEFAULT NULL,
  `max_uses_per_user` int DEFAULT '1',
  `used_count` int NOT NULL DEFAULT '0',
  `expires_at` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coupons`
--

LOCK TABLES `coupons` WRITE;
/*!40000 ALTER TABLE `coupons` DISABLE KEYS */;
INSERT INTO `coupons` VALUES ('9a98c588-f561-43bf-a157-d567639061dc','PAULETTE','percentage',10,10000,10,1,0,'2026-03-31 04:00:00',1,'2026-02-06 01:57:34','2026-02-06 01:57:34');
/*!40000 ALTER TABLE `coupons` ENABLE KEYS */;
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
  `avg_speed` decimal(5,2) DEFAULT '25.00' COMMENT 'Velocidad promedio en km/h',
  PRIMARY KEY (`id`),
  UNIQUE KEY `delivery_drivers_user_id_unique` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `delivery_drivers`
--

LOCK TABLES `delivery_drivers` WRITE;
/*!40000 ALTER TABLE `delivery_drivers` DISABLE KEYS */;
INSERT INTO `delivery_drivers` VALUES ('driver-rec-1','driver-1','motorcycle','ABC-123',0,'7.7692928','-72.2337792','2026-02-06 22:34:09',4,5,4,0,0,NULL,NULL,'2026-02-05 22:35:37',25.00);
/*!40000 ALTER TABLE `delivery_drivers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `delivery_zones`
--

DROP TABLE IF EXISTS `delivery_zones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `delivery_zones` (
  `id` varchar(255) NOT NULL DEFAULT (uuid()),
  `name` text NOT NULL,
  `description` text,
  `deliveryFee` int NOT NULL,
  `maxDeliveryTime` int DEFAULT '45',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `coordinates` text,
  `centerLatitude` text,
  `centerLongitude` text,
  `radiusKm` int DEFAULT '5',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `delivery_zones`
--

LOCK TABLES `delivery_zones` WRITE;
/*!40000 ALTER TABLE `delivery_zones` DISABLE KEYS */;
INSERT INTO `delivery_zones` VALUES ('zone-centro-autlan','Centro Autlán','Centro histórico y comercial de Autlán de Navarro',2500,30,1,NULL,'20.6736','-104.3647',3,'2026-02-05 00:37:20','2026-02-05 00:37:20'),('zone-este-autlan','Este Autlán','Zona este hacia El Grullo',3500,40,1,NULL,'20.6736','-104.3500',5,'2026-02-05 00:37:20','2026-02-05 00:37:20'),('zone-norte-autlan','Norte Autlán','Zona norte incluyendo colonias residenciales',3000,35,1,NULL,'20.6800','-104.3647',4,'2026-02-05 00:37:20','2026-02-05 00:37:20'),('zone-oeste-autlan','Oeste Autlán','Zona oeste hacia la sierra',3500,40,0,NULL,'20.6736','-104.3800',5,'2026-02-05 00:37:20','2026-02-05 00:37:20'),('zone-sur-autlan','Sur Autlán','Zona sur hacia carretera a Colima',3000,35,1,NULL,'20.6672','-104.3647',4,'2026-02-05 00:37:20','2026-02-05 00:37:20');
/*!40000 ALTER TABLE `delivery_zones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favorites`
--

DROP TABLE IF EXISTS `favorites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favorites` (
  `id` varchar(255) NOT NULL DEFAULT (uuid()),
  `user_id` varchar(255) NOT NULL,
  `business_id` varchar(255) DEFAULT NULL,
  `product_id` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_business_id` (`business_id`),
  KEY `idx_product_id` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favorites`
--

LOCK TABLES `favorites` WRITE;
/*!40000 ALTER TABLE `favorites` DISABLE KEYS */;
INSERT INTO `favorites` VALUES ('5e100c11-ad25-482b-bb04-ad112873418e','323bc96b-0066-11f1-a5c3-1866da2fd9d2','bcf3a84a-0001-11f1-a5c3-1866da2fd9d2',NULL,'2026-02-06 03:02:10'),('5ed6c752-afea-4b57-a8d4-5bf0d65bcaca','323bc96b-0066-11f1-a5c3-1866da2fd9d2','bcf15003-0001-11f1-a5c3-1866da2fd9d2',NULL,'2026-02-06 02:55:07');
/*!40000 ALTER TABLE `favorites` ENABLE KEYS */;
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
  `status` enum('pending','accepted','preparing','ready','assigned_driver','picked_up','on_the_way','in_transit','arriving','delivered','cancelled','refunded') DEFAULT 'pending',
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
  `penalty_amount` int DEFAULT NULL,
  `business_response_at` timestamp NULL DEFAULT NULL,
  `stripe_payment_intent_id` text,
  `paid_at` timestamp NULL DEFAULT NULL,
  `refunded_at` timestamp NULL DEFAULT NULL,
  `driver_paid_at` timestamp NULL DEFAULT NULL,
  `driver_payment_status` text DEFAULT (_utf8mb4'pending'),
  `assigned_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `estimated_prep_time` int DEFAULT NULL,
  `estimated_delivery_time` int DEFAULT NULL,
  `estimated_total_time` int DEFAULT NULL,
  `actual_prep_time` int DEFAULT NULL,
  `actual_delivery_time` int DEFAULT NULL,
  `picked_up_at` timestamp NULL DEFAULT NULL,
  `is_priority` tinyint(1) DEFAULT '0',
  `priority_fee` int DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES ('155afa0e-02f0-11f1-a2c4-1866da2fd9d2','249c1786-ffea-11f0-a5c3-1866da2fd9d2','bcf50359-0001-11f1-a5c3-1866da2fd9d2','Pizza Napoli','','[{\"id\":\"1770335447419\",\"product\":{\"id\":\"711fc953-0001-11f1-a5c3-1866da2fd9d2\",\"name\":\"Pizza Margherita\",\"description\":\"Tomate, mozzarella y albahaca\",\"price\":150,\"image\":\"https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400\",\"category\":\"Pizza\",\"isAvailable\":true,\"available\":true,\"businessId\":\"bcf50359-0001-11f1-a5c3-1866da2fd9d2\"},\"quantity\":1}]','pending',15000,4000,19000,'cash',NULL,'CALLE ALEJANDRIA 3, Autlán',NULL,NULL,'2026-02-06 00:09:19','2026-02-06 05:56:20',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'19.7708','-104.3636','refund',NULL,20000,1000,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'pending',NULL,'2026-02-06 00:09:20',NULL,NULL,NULL,NULL,NULL,NULL,0,0),('5cc34654-02f0-11f1-a2c4-1866da2fd9d2','249c1786-ffea-11f0-a5c3-1866da2fd9d2','bcf50359-0001-11f1-a5c3-1866da2fd9d2','Pizza Napoli','','[{\"id\":\"1770336660854\",\"product\":{\"id\":\"711fc953-0001-11f1-a5c3-1866da2fd9d2\",\"name\":\"Pizza Margherita\",\"description\":\"Tomate, mozzarella y albahaca\",\"price\":150,\"image\":\"https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400\",\"category\":\"Pizza\",\"isAvailable\":true,\"available\":true,\"businessId\":\"bcf50359-0001-11f1-a5c3-1866da2fd9d2\"},\"quantity\":1}]','pending',15000,4000,19000,'cash',NULL,'ASDASDASD, Autlán',NULL,NULL,'2026-02-06 00:11:19','2026-02-06 05:58:20',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'19.7708','-104.3636','refund',NULL,20000,1000,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'pending',NULL,'2026-02-06 00:11:19',NULL,NULL,NULL,NULL,NULL,NULL,0,0),('85b49190-0009-11f1-a5c3-1866da2fd9d2','ef47afae-0007-11f1-a5c3-1866da2fd9d2','bcf3a84a-0001-11f1-a5c3-1866da2fd9d2','Burger House','','[{\"id\":\"1770017621159\",\"product\":{\"id\":\"70f7abfe-0001-11f1-a5c3-1866da2fd9d2\",\"name\":\"Burger Clásica\",\"description\":\"Hamburguesa con queso, lechuga y tomate\",\"price\":95,\"image\":\"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400\",\"category\":\"Burgers\",\"isAvailable\":true,\"available\":true,\"businessId\":\"bcf3a84a-0001-11f1-a5c3-1866da2fd9d2\"},\"quantity\":1}]','pending',9500,0,9500,'cash',NULL,'Calle Reforma 456, Autlán de Navarro',NULL,NULL,'2026-02-02 07:33:52',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'refund',NULL,9500,0,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'pending',NULL,'2026-02-04 13:25:49',NULL,NULL,NULL,NULL,NULL,NULL,0,0),('9b07681b-0038-11f1-a5c3-1866da2fd9d2','ef47afae-0007-11f1-a5c3-1866da2fd9d2','bcf15003-0001-11f1-a5c3-1866da2fd9d2','Tacos El Güero',NULL,'[{\"id\":\"1\",\"quantity\":2,\"product\":{\"id\":\"1\",\"name\":\"Tacos al Pastor\",\"price\":15}}]','delivered',3000,2500,5500,'cash',NULL,'Calle Principal 123','driver-1',NULL,'2026-02-05 09:05:18',NULL,NULL,NULL,NULL,NULL,NULL,825,3850,825,NULL,'2026-02-05 09:40:18',NULL,NULL,'refund',NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'pending',NULL,'2026-02-05 22:56:03',NULL,NULL,NULL,NULL,NULL,NULL,0,0),('a21aad8b-02f0-11f1-a2c4-1866da2fd9d2','249c1786-ffea-11f0-a5c3-1866da2fd9d2','bcf632c5-0001-11f1-a5c3-1866da2fd9d2','Sushi Zen','','[{\"id\":\"1770336777063\",\"product\":{\"id\":\"71481261-0001-11f1-a5c3-1866da2fd9d2\",\"name\":\"Roll California\",\"description\":\"Cangrejo, aguacate y pepino\",\"price\":120,\"image\":\"https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400\",\"category\":\"Sushi\",\"isAvailable\":true,\"available\":true,\"businessId\":\"bcf632c5-0001-11f1-a5c3-1866da2fd9d2\"},\"quantity\":1},{\"id\":\"1770336781509\",\"product\":{\"id\":\"714818c4-0001-11f1-a5c3-1866da2fd9d2\",\"name\":\"Nigiri Atún\",\"description\":\"Nigiri de atún fresco\",\"price\":130,\"image\":\"https://images.unsplash.com/photo-1564489563601-c53cfc451e93?w=400\",\"category\":\"Nigiri\",\"isAvailable\":true,\"available\":true,\"businessId\":\"bcf632c5-0001-11f1-a5c3-1866da2fd9d2\"},\"quantity\":1}]','accepted',25000,4000,29000,'cash',NULL,'CALLE ALEJANDRIA 3, Autlán',NULL,NULL,'2026-02-06 00:13:16','2026-02-06 06:00:16',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'19.7708','-104.3636','refund',NULL,30000,1000,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'pending',NULL,'2026-02-06 00:13:18',NULL,NULL,NULL,NULL,NULL,NULL,0,0),('b9337282-0009-11f1-a5c3-1866da2fd9d2','ef47afae-0007-11f1-a5c3-1866da2fd9d2','bcf3a84a-0001-11f1-a5c3-1866da2fd9d2','Burger House','','[{\"id\":\"1770017709168\",\"product\":{\"id\":\"70f7abfe-0001-11f1-a5c3-1866da2fd9d2\",\"name\":\"Burger Clásica\",\"description\":\"Hamburguesa con queso, lechuga y tomate\",\"price\":95,\"image\":\"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400\",\"category\":\"Burgers\",\"isAvailable\":true,\"available\":true,\"businessId\":\"bcf3a84a-0001-11f1-a5c3-1866da2fd9d2\"},\"quantity\":1}]','pending',9500,0,9500,'cash',NULL,'Calle Reforma 456, Autlán de Navarro',NULL,NULL,'2026-02-02 07:35:18',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'refund',NULL,9500,0,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'pending',NULL,'2026-02-05 23:06:06',NULL,NULL,NULL,NULL,NULL,NULL,0,0),('de789f66-026a-11f1-adf2-1866da2fd9d2','323bc96b-0066-11f1-a5c3-1866da2fd9d2','bcf15003-0001-11f1-a5c3-1866da2fd9d2','Tacos El G├╝ero','https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400','[{\"id\":\"prod-1\",\"name\":\"Tacos de Asada\",\"price\":5000,\"quantity\":1},{\"id\":\"prod-2\",\"name\":\"Quesadilla\",\"price\":4000,\"quantity\":1}]','ready',5500,1000,6500,'card',NULL,'{\"street\":\"Calle Ju├írez 123\",\"city\":\"Autl├ín\",\"state\":\"Jalisco\",\"zipCode\":\"48900\",\"coordinates\":{\"latitude\":19.7717,\"longitude\":-104.3659}}','driver-1','Sin cebolla por favor','2026-02-05 08:15:44',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'refund',NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'pending',NULL,'2026-02-06 18:34:34',NULL,NULL,NULL,NULL,NULL,NULL,0,0),('de78dc57-026a-11f1-adf2-1866da2fd9d2','323bc96b-0066-11f1-a5c3-1866da2fd9d2','bcf3a84a-0001-11f1-a5c3-1866da2fd9d2','Burger House','https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400','[{\"id\":\"prod-3\",\"name\":\"Hamburguesa Cl├ísica\",\"price\":5500,\"quantity\":1},{\"id\":\"prod-4\",\"name\":\"Papas Fritas\",\"price\":3000,\"quantity\":1}]','picked_up',5500,1000,6500,'card',NULL,'{\"street\":\"Av. Revoluci├│n 456\",\"city\":\"Autl├ín\",\"state\":\"Jalisco\",\"zipCode\":\"48900\",\"coordinates\":{\"latitude\":19.7720,\"longitude\":-104.3650}}','driver-1','Extra salsa','2026-02-05 08:15:44',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'refund',NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'pending',NULL,'2026-02-06 18:36:40',NULL,NULL,NULL,NULL,NULL,NULL,0,0),('e4aa3c3d-0009-11f1-a5c3-1866da2fd9d2','ef47afae-0007-11f1-a5c3-1866da2fd9d2','bcf3a84a-0001-11f1-a5c3-1866da2fd9d2','Burger House','','[{\"id\":\"1770017781458\",\"product\":{\"id\":\"70f7abfe-0001-11f1-a5c3-1866da2fd9d2\",\"name\":\"Burger Clásica\",\"description\":\"Hamburguesa con queso, lechuga y tomate\",\"price\":95,\"image\":\"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400\",\"category\":\"Burgers\",\"isAvailable\":true,\"available\":true,\"businessId\":\"bcf3a84a-0001-11f1-a5c3-1866da2fd9d2\"},\"quantity\":1}]','pending',9500,0,9500,'cash',NULL,'Calle Reforma 456, Autlán de Navarro',NULL,NULL,'2026-02-02 07:36:31',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'refund',NULL,9500,0,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'pending',NULL,'2026-02-05 23:06:06',NULL,NULL,NULL,NULL,NULL,NULL,0,0),('order-delivered-1','customer-1','business-1','Tacos El G├╝ero','https://images.unsplash.com/photo-1565299585323-38d6b0865b47','[{\"id\":\"prod-1\",\"name\":\"Tacos de Asada\",\"price\":6000,\"quantity\":2}]','delivered',12000,2500,14500,'card',NULL,'{\"street\":\"Calle Principal 123\",\"city\":\"Autl├ín\",\"state\":\"Jalisco\",\"zipCode\":\"48900\",\"lat\":19.7667,\"lng\":-104.3667}','driver-1',NULL,'2026-02-02 02:05:56',NULL,NULL,NULL,NULL,NULL,NULL,2175,10150,2175,NULL,'2026-02-02 02:43:56',NULL,NULL,'refund',NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'pending',NULL,'2026-02-05 22:56:11',NULL,NULL,NULL,NULL,NULL,NULL,0,0),('order-in-progress-1','customer-2','business-1','Tacos El G├╝ero','https://images.unsplash.com/photo-1565299585323-38d6b0865b47','[{\"id\":\"prod-2\",\"name\":\"Tacos de Pastor\",\"price\":5500,\"quantity\":3}]','delivered',16500,2500,19000,'card',NULL,'{\"street\":\"Avenida Ju├írez 456\",\"city\":\"Autl├ín\",\"state\":\"Jalisco\",\"zipCode\":\"48900\",\"lat\":19.7667,\"lng\":-104.3667}','driver-1',NULL,'2026-02-05 09:15:31',NULL,NULL,NULL,NULL,NULL,NULL,2850,13300,2850,NULL,'2026-02-05 09:45:31',NULL,NULL,'refund',NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'pending',NULL,'2026-02-05 22:56:03',NULL,NULL,NULL,NULL,NULL,NULL,0,0),('test-order-1','customer-1','business-2','Super Mercado Central',NULL,'[{\"productId\":\"prod-1\",\"quantity\":2}]','delivered',12500,2500,15000,'card',NULL,'{\"street\":\"Calle Test 123\"}','driver-1',NULL,'2026-02-05 09:40:42',NULL,NULL,NULL,NULL,NULL,NULL,2250,10500,2250,NULL,'2026-02-05 10:05:42',NULL,NULL,'refund',NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'pending','2026-02-05 09:59:59','2026-02-05 22:56:03',NULL,NULL,NULL,NULL,NULL,NULL,0,0);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` varchar(255) NOT NULL DEFAULT (uuid()),
  `order_id` varchar(255) NOT NULL,
  `customer_id` varchar(255) NOT NULL,
  `business_id` varchar(255) NOT NULL,
  `driver_id` varchar(255) DEFAULT NULL,
  `amount` int NOT NULL,
  `currency` text NOT NULL DEFAULT (_utf8mb4'MXN'),
  `status` text NOT NULL DEFAULT (_utf8mb4'pending'),
  `payment_method` text NOT NULL DEFAULT (_utf8mb4'card'),
  `stripe_payment_intent_id` text,
  `processed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
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
INSERT INTO `reviews` VALUES ('review-driver-1','323bc96b-0066-11f1-a5c3-1866da2fd9d2','test-order-1','business-1',5,'Excelente servicio, muy r├ípido',1,0,NULL,NULL,NULL,'2026-02-05 22:54:11'),('review-driver-2','323bc96b-0066-11f1-a5c3-1866da2fd9d2','order-delivered-1','business-2',4,'Buen servicio',1,0,NULL,NULL,NULL,'2026-02-05 22:54:11'),('review-driver-3','customer-2','order-in-progress-1','business-1',5,'Muy profesional',1,0,NULL,NULL,NULL,'2026-02-05 22:54:11'),('review-driver-4','customer-2','9b07681b-0038-11f1-a5c3-1866da2fd9d2','business-1',4,'Todo bien',1,0,NULL,NULL,NULL,'2026-02-05 22:54:11');
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
INSERT INTO `support_chats` VALUES ('fcecfde6-2f40-4ee7-95b7-b6d8b21b31b4','customer-1','in_progress','2026-02-04 13:52:38','2026-02-06 05:58:45');
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
INSERT INTO `support_messages` VALUES ('001a497f-e791-4634-8d1c-0ae5f543e66c','fcecfde6-2f40-4ee7-95b7-b6d8b21b31b4','249c1786-ffea-11f0-a5c3-1866da2fd9d2','probando respeusta de soporte ',0,'2026-02-06 02:01:19'),('6935ec4d-34e2-4793-b68b-74c76cabf967','fcecfde6-2f40-4ee7-95b7-b6d8b21b31b4',NULL,'Lo siento, el servicio de IA no está configurado. Un administrador te responderá pronto.',1,'2026-02-06 02:01:19'),('ffa9198d-c0e8-4896-94c0-53ceb8bfdce4','fcecfde6-2f40-4ee7-95b7-b6d8b21b31b4','customer-1','123213',0,'2026-02-04 13:52:38');
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
INSERT INTO `system_settings` VALUES ('4647f3a8-02d3-11f1-a2c4-1866da2fd9d2','delivery_per_km','8','number','delivery','Costo por kil├│metro en MXN',0,NULL,'2026-02-05 20:43:06','2026-02-05 20:43:06'),('4647f7a1-02d3-11f1-a2c4-1866da2fd9d2','delivery_min_fee','15','number','delivery','Tarifa m├¡nima de env├¡o en MXN',0,NULL,'2026-02-05 20:43:06','2026-02-05 20:43:06'),('4647f8be-02d3-11f1-a2c4-1866da2fd9d2','delivery_max_fee','40','number','delivery','Tarifa m├íxima de env├¡o en MXN',0,NULL,'2026-02-05 20:43:06','2026-02-05 20:43:06'),('4647f9b0-02d3-11f1-a2c4-1866da2fd9d2','delivery_speed_km_per_min','0.5','number','delivery','Velocidad promedio en km/min (~30 km/h)',0,NULL,'2026-02-05 20:43:06','2026-02-05 20:43:06'),('4647fd57-02d3-11f1-a2c4-1866da2fd9d2','delivery_default_prep_time','20','number','delivery','Tiempo de preparaci├│n por defecto en minutos',0,NULL,'2026-02-05 20:43:06','2026-02-05 20:43:06'),('c2f8e1ef-01d7-11f1-8b91-1866da2fd9d2','platform_commission_rate','0.15','number','commissions','Comisión de la plataforma (15%)',0,NULL,'2026-02-04 14:42:42','2026-02-04 14:42:42'),('c2fb1647-01d7-11f1-8b91-1866da2fd9d2','business_commission_rate','0.70','number','commissions','Comisión del negocio (70%)',0,NULL,'2026-02-04 14:42:42','2026-02-04 14:42:42'),('c2fbe1c2-01d7-11f1-8b91-1866da2fd9d2','driver_commission_rate','0.15','number','commissions','Comisión del repartidor (15%)',0,NULL,'2026-02-04 14:42:42','2026-02-04 14:42:42'),('c2fc8212-01d7-11f1-8b91-1866da2fd9d2','min_withdrawal_amount','10000','number','payments','Monto mínimo de retiro (centavos)',0,NULL,'2026-02-04 14:42:42','2026-02-04 14:42:42'),('c2fd3e7e-01d7-11f1-8b91-1866da2fd9d2','fund_hold_duration_hours','0','number','payments','Horas de retención de fondos (0 = pago inmediato)',0,NULL,'2026-02-04 14:42:42','2026-02-04 14:42:42'),('c2fddb6a-01d7-11f1-8b91-1866da2fd9d2','max_daily_transactions','100','number','payments','Máximo de transacciones diarias por usuario',0,NULL,'2026-02-04 14:42:42','2026-02-04 14:42:42'),('c2fe8029-01d7-11f1-8b91-1866da2fd9d2','max_transaction_amount','1000000','number','payments','Monto máximo por transacción (centavos)',0,NULL,'2026-02-04 14:42:42','2026-02-04 14:42:42'),('c2feffc0-01d7-11f1-8b91-1866da2fd9d2','delivery_base_fee','15','number','operations','Tarifa base de env├¡o en MXN',1,NULL,'2026-02-04 14:42:42','2026-02-05 20:43:06'),('c2ff7a9f-01d7-11f1-8b91-1866da2fd9d2','delivery_fee_per_km','500','number','operations','Tarifa por kilómetro (centavos)',1,NULL,'2026-02-04 14:42:42','2026-02-04 14:42:42'),('c300042e-01d7-11f1-8b91-1866da2fd9d2','max_delivery_radius_km','10','number','operations','Radio máximo de entrega (km)',1,NULL,'2026-02-04 14:42:42','2026-02-04 14:42:42'),('c3011e4b-01d7-11f1-8b91-1866da2fd9d2','order_regret_period_seconds','60','number','operations','Período de arrepentimiento (segundos)',1,NULL,'2026-02-04 14:42:42','2026-02-04 14:42:42'),('c301c413-01d7-11f1-8b91-1866da2fd9d2','pending_order_call_minutes','3','number','operations','Minutos antes de llamar al negocio',0,NULL,'2026-02-04 14:42:42','2026-02-04 14:42:42'),('c302412f-01d7-11f1-8b91-1866da2fd9d2','max_simultaneous_orders','10','number','operations','Máximo de pedidos simultáneos por negocio',0,NULL,'2026-02-04 14:42:42','2026-02-04 14:42:42'),('c302c204-01d7-11f1-8b91-1866da2fd9d2','max_login_attempts','5','number','security','Intentos máximos de login',0,NULL,'2026-02-04 14:42:42','2026-02-04 14:42:42'),('c3036430-01d7-11f1-8b91-1866da2fd9d2','rate_limit_requests_per_minute','60','number','security','Límite de requests por minuto',0,NULL,'2026-02-04 14:42:42','2026-02-04 14:42:42'),('c30455e1-01d7-11f1-8b91-1866da2fd9d2','driver_max_strikes','3','number','security','Strikes máximos antes de bloqueo',0,NULL,'2026-02-04 14:42:42','2026-02-04 14:42:42'),('c3051544-01d7-11f1-8b91-1866da2fd9d2','app_maintenance_mode','false','boolean','app','Modo mantenimiento',1,NULL,'2026-02-04 14:42:42','2026-02-04 14:42:42'),('c3059cc1-01d7-11f1-8b91-1866da2fd9d2','app_version_required','1.0.0','string','app','Versión mínima requerida',1,NULL,'2026-02-04 14:42:42','2026-02-04 14:42:42'),('c3061cc5-01d7-11f1-8b91-1866da2fd9d2','support_phone','+523171234567','string','app','Teléfono de soporte',1,NULL,'2026-02-04 14:42:42','2026-02-04 14:42:42'),('c3068d06-01d7-11f1-8b91-1866da2fd9d2','support_email','soporte@nemy.mx','string','app','Email de soporte',1,NULL,'2026-02-04 14:42:42','2026-02-04 14:42:42'),('c30706e8-01d7-11f1-8b91-1866da2fd9d2','twilio_phone_number','','string','twilio','Número de teléfono Twilio',0,NULL,'2026-02-04 14:42:42','2026-02-04 14:42:42'),('c307a1ae-01d7-11f1-8b91-1866da2fd9d2','twilio_studio_flow_sid','','string','twilio','Twilio Studio Flow SID para llamadas',0,NULL,'2026-02-04 14:42:42','2026-02-04 14:42:42');
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
  `wallet_id` varchar(255) DEFAULT NULL,
  `order_id` varchar(255) DEFAULT NULL,
  `type` text NOT NULL,
  `amount` int NOT NULL,
  `balance_before` int DEFAULT NULL,
  `balance_after` int DEFAULT NULL,
  `description` text,
  `status` text NOT NULL DEFAULT (_utf8mb4'completed'),
  `metadata` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `business_id` varchar(255) DEFAULT NULL,
  `user_id` varchar(255) DEFAULT NULL,
  `stripe_payment_intent_id` text,
  `stripe_transfer_id` text,
  `stripe_refund_id` text,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactions`
--

LOCK TABLES `transactions` WRITE;
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
INSERT INTO `transactions` VALUES ('0c85634b-0249-11f1-adf2-1866da2fd9d2','dba51d89-0248-11f1-adf2-1866da2fd9d2','test','test',1000,2000,3000,'test','completed',NULL,'2026-02-05 08:13:39',NULL,'non-existent-user',NULL,NULL,NULL,'2026-02-05 04:13:39'),('298f6302-024b-11f1-adf2-1866da2fd9d2','298e7e65-024b-11f1-adf2-1866da2fd9d2','test-order-1','test_credit',5000,0,5000,'Test credit','completed',NULL,'2026-02-05 08:28:47',NULL,'test-customer-1',NULL,NULL,NULL,'2026-02-05 04:28:46'),('29a811af-024b-11f1-adf2-1866da2fd9d2','298e7e65-024b-11f1-adf2-1866da2fd9d2','concurrent-0','concurrent_test',1000,5000,6000,'Concurrent test 0','completed',NULL,'2026-02-05 08:28:47',NULL,'test-customer-1',NULL,NULL,NULL,'2026-02-05 04:28:46'),('29a98aa7-024b-11f1-adf2-1866da2fd9d2','298e7e65-024b-11f1-adf2-1866da2fd9d2','concurrent-2','concurrent_test',1000,5000,6000,'Concurrent test 2','completed',NULL,'2026-02-05 08:28:47',NULL,'test-customer-1',NULL,NULL,NULL,'2026-02-05 04:28:46'),('29aa21f8-024b-11f1-adf2-1866da2fd9d2','298e7e65-024b-11f1-adf2-1866da2fd9d2','concurrent-1','concurrent_test',1000,5000,6000,'Concurrent test 1','completed',NULL,'2026-02-05 08:28:47',NULL,'test-customer-1',NULL,NULL,NULL,'2026-02-05 04:28:47'),('29ab421a-024b-11f1-adf2-1866da2fd9d2','298e7e65-024b-11f1-adf2-1866da2fd9d2','concurrent-3','concurrent_test',1000,5000,6000,'Concurrent test 3','completed',NULL,'2026-02-05 08:28:47',NULL,'test-customer-1',NULL,NULL,NULL,'2026-02-05 04:28:47'),('29abe38a-024b-11f1-adf2-1866da2fd9d2','298e7e65-024b-11f1-adf2-1866da2fd9d2','concurrent-4','concurrent_test',1000,5000,6000,'Concurrent test 4','completed',NULL,'2026-02-05 08:28:47',NULL,'test-customer-1',NULL,NULL,NULL,'2026-02-05 04:28:47'),('29b22d2a-024b-11f1-adf2-1866da2fd9d2','298e7e65-024b-11f1-adf2-1866da2fd9d2','audit-order','audit_test',500,6000,6500,'Audit trail test','completed',NULL,'2026-02-05 08:28:47',NULL,'test-customer-1',NULL,NULL,NULL,'2026-02-05 04:28:47'),('c082b662-024a-11f1-adf2-1866da2fd9d2','dba51d89-0248-11f1-adf2-1866da2fd9d2','test','test',1000,3000,4000,'test','completed',NULL,'2026-02-05 08:25:51',NULL,'non-existent-user',NULL,NULL,NULL,'2026-02-05 04:25:50'),('dba58358-0248-11f1-adf2-1866da2fd9d2','dba51d89-0248-11f1-adf2-1866da2fd9d2','test','test',1000,0,1000,'test','completed',NULL,'2026-02-05 08:12:17',NULL,'non-existent-user',NULL,NULL,NULL,'2026-02-05 04:12:17'),('e8b8608e-0248-11f1-adf2-1866da2fd9d2','dba51d89-0248-11f1-adf2-1866da2fd9d2','test','test',1000,1000,2000,'test','completed',NULL,'2026-02-05 08:12:39',NULL,'non-existent-user',NULL,NULL,NULL,'2026-02-05 04:12:39'),('fe15ec1c-024a-11f1-adf2-1866da2fd9d2','dba51d89-0248-11f1-adf2-1866da2fd9d2','test','test',1000,4000,5000,'test','completed',NULL,'2026-02-05 08:27:34',NULL,'non-existent-user',NULL,NULL,NULL,'2026-02-05 04:27:33'),('txn-driver-9b07681b-0038-11f1-a5c3-1866da2fd9d2',NULL,'9b07681b-0038-11f1-a5c3-1866da2fd9d2','delivery_earning',825,NULL,NULL,'Comisi├│n por entrega - Orden #2fd9d2','completed',NULL,'2026-02-05 09:40:18',NULL,'driver-1',NULL,NULL,NULL,'2026-02-05 22:41:49'),('txn-driver-order-delivered-1',NULL,'order-delivered-1','delivery_earning',2175,NULL,NULL,'Comisi├│n por entrega - Orden #ered-1','completed',NULL,'2026-02-02 02:43:56',NULL,'driver-1',NULL,NULL,NULL,'2026-02-05 22:41:49'),('txn-driver-order-in-progress-1',NULL,'order-in-progress-1','delivery_earning',2850,NULL,NULL,'Comisi├│n por entrega - Orden #ress-1','completed',NULL,'2026-02-05 09:45:31',NULL,'driver-1',NULL,NULL,NULL,'2026-02-05 22:41:49'),('txn-driver-test-order-1',NULL,'test-order-1','delivery_earning',2250,NULL,NULL,'Comisi├│n por entrega - Orden #rder-1','completed',NULL,'2026-02-05 10:05:42',NULL,'driver-1',NULL,NULL,NULL,'2026-02-05 22:41:49');
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
  `profile_image` text,
  `stripe_account_id` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('249c1786-ffea-11f0-a5c3-1866da2fd9d2','admin@nemy.com','$2b$10$rKZLvVZhN8p8pYqYqYqYqOqYqYqYqYqYqYqYqYqYqYqYqYqYqYqYq','Caskiuz Main','+52 341 456 7890','admin',0,1,0,NULL,NULL,NULL,NULL,NULL,NULL,1,0,NULL,'2026-02-02 03:49:15','/uploads/profiles/249c1786-ffea-11f0-a5c3-1866da2fd9d2_1770335363136.jpeg',NULL),('323bc96b-0066-11f1-a5c3-1866da2fd9d2','customer@nemy.com','$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','Usuario','+52 341 456 7893','customer',0,1,0,NULL,NULL,NULL,NULL,NULL,NULL,1,0,NULL,'2026-02-02 18:37:15',NULL,NULL),('business-owner-1','business@nemy.com','$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','Carlos Restaurante','+52 341 456 7892','business_owner',0,1,0,NULL,NULL,NULL,NULL,NULL,NULL,1,0,NULL,'2026-02-02 03:43:56',NULL,NULL),('business-owner-2','business@nemy.com','$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','Ana Mercado','+523414567893','business_owner',0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,1,0,NULL,'2026-02-02 03:43:56',NULL,NULL),('customer-1','admin@nemy.com','$2b$10$rKZLvVZhN8p8pYqYqYqYqOqYqYqYqYqYqYqYqYqYqYqYqYqYqYqYq','Juan P├®rez','+523414567890','admin',0,1,0,NULL,NULL,NULL,NULL,NULL,NULL,1,0,NULL,'2026-02-02 03:43:56',NULL,NULL),('customer-2','customer@nemy.com','$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','Mar├¡a Garc├¡a','+523414567891','customer',0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,1,0,NULL,'2026-02-02 03:43:56',NULL,NULL),('driver-1','driver@nemy.com','$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','Pedro Repartidor','+523414567894','delivery_driver',0,1,0,NULL,NULL,NULL,NULL,NULL,NULL,1,1,'2026-02-06 02:38:10','2026-02-02 03:43:56','/uploads/profiles/driver-1_1770381356522.jpeg',NULL),('eab33ec2-00e9-11f1-a5c3-1866da2fd9d2','customer@nemy.com','$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','Usuario','+523414567892','customer',0,1,0,NULL,NULL,NULL,NULL,NULL,NULL,1,0,NULL,'2026-02-03 10:20:09',NULL,NULL),('ef47afae-0007-11f1-a5c3-1866da2fd9d2','customer@nemy.com','$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','Usuario','+52 123 123 2131','customer',0,1,0,NULL,NULL,NULL,NULL,NULL,NULL,1,0,NULL,'2026-02-02 07:22:30',NULL,NULL),('test-business-1',NULL,NULL,'Test Business Owner','+521234567891','business_owner',0,1,0,NULL,NULL,NULL,NULL,NULL,NULL,1,0,NULL,'2026-02-05 04:08:19',NULL,NULL),('test-customer-1',NULL,NULL,'Test Customer','+521234567890','customer',0,1,0,NULL,NULL,NULL,NULL,NULL,NULL,1,0,NULL,'2026-02-05 04:08:19',NULL,NULL),('test-driver-1',NULL,NULL,'Test Driver','+521234567892','delivery_driver',0,1,0,NULL,NULL,NULL,NULL,NULL,NULL,1,0,NULL,'2026-02-05 04:08:19',NULL,NULL);
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
INSERT INTO `wallets` VALUES ('298e7e65-024b-11f1-adf2-1866da2fd9d2','test-customer-1',6500,0,6500,0,'2026-02-05 04:28:46','2026-02-05 08:28:47'),('815f3ac6-0263-11f1-adf2-1866da2fd9d2','driver-1',8100,0,8100,0,'2026-02-05 07:23:02','2026-02-05 07:23:02'),('db99ccbd-0248-11f1-adf2-1866da2fd9d2','test-business-1',42000,0,42000,0,'2026-02-05 04:12:17','2026-02-05 08:28:47'),('db9af9b3-0248-11f1-adf2-1866da2fd9d2','test-driver-1',9000,0,9000,0,'2026-02-05 04:12:17','2026-02-05 08:28:47'),('dba51d89-0248-11f1-adf2-1866da2fd9d2','non-existent-user',5000,0,5000,0,'2026-02-05 04:12:17','2026-02-05 08:27:34'),('wallet-business-1','business-owner-1',42000,0,0,0,'2026-02-02 03:43:56','2026-02-02 03:43:56'),('wallet-customer-1','customer-1',0,0,0,0,'2026-02-02 03:43:56','2026-02-02 03:43:56');
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

-- Dump completed on 2026-02-06 14:38:04
