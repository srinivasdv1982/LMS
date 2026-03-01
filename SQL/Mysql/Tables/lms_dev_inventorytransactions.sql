-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: lms_dev
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `inventorytransactions`
--

DROP TABLE IF EXISTS `inventorytransactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventorytransactions` (
  `TransactionId` int NOT NULL AUTO_INCREMENT,
  `LodgeId` int NOT NULL,
  `InventoryItemId` int NOT NULL,
  `TransactionType` varchar(50) NOT NULL,
  `Quantity` int NOT NULL,
  `UnitPrice` decimal(18,2) DEFAULT '0.00',
  `TransactionDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `VendorId` int DEFAULT NULL,
  `CreatedBy` int NOT NULL,
  PRIMARY KEY (`TransactionId`),
  KEY `LodgeId` (`LodgeId`),
  KEY `InventoryItemId` (`InventoryItemId`),
  KEY `VendorId` (`VendorId`),
  KEY `CreatedBy` (`CreatedBy`),
  CONSTRAINT `inventorytransactions_ibfk_1` FOREIGN KEY (`LodgeId`) REFERENCES `lodges` (`LodgeId`),
  CONSTRAINT `inventorytransactions_ibfk_2` FOREIGN KEY (`InventoryItemId`) REFERENCES `inventoryitems` (`InventoryItemId`),
  CONSTRAINT `inventorytransactions_ibfk_3` FOREIGN KEY (`VendorId`) REFERENCES `vendors` (`VendorId`),
  CONSTRAINT `inventorytransactions_ibfk_4` FOREIGN KEY (`CreatedBy`) REFERENCES `employees` (`EmployeeId`),
  CONSTRAINT `CK_Quantity` CHECK ((`Quantity` > 0)),
  CONSTRAINT `CK_TransactionType` CHECK ((`TransactionType` in (_utf8mb4'ADJUSTMENT',_utf8mb4'DAMAGE',_utf8mb4'ISSUE',_utf8mb4'PURCHASE')))
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-01 18:36:01
