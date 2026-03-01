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
-- Table structure for table `housekeepingtasks`
--

DROP TABLE IF EXISTS `housekeepingtasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `housekeepingtasks` (
  `TaskId` int NOT NULL AUTO_INCREMENT,
  `LodgeId` int NOT NULL,
  `RoomId` int NOT NULL,
  `AssignedTo` int NOT NULL,
  `Status` varchar(50) DEFAULT 'Pending',
  `TaskDate` date DEFAULT (curdate()),
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`TaskId`),
  KEY `LodgeId` (`LodgeId`),
  KEY `RoomId` (`RoomId`),
  KEY `AssignedTo` (`AssignedTo`),
  CONSTRAINT `housekeepingtasks_ibfk_1` FOREIGN KEY (`LodgeId`) REFERENCES `lodges` (`LodgeId`),
  CONSTRAINT `housekeepingtasks_ibfk_2` FOREIGN KEY (`RoomId`) REFERENCES `rooms` (`RoomId`),
  CONSTRAINT `housekeepingtasks_ibfk_3` FOREIGN KEY (`AssignedTo`) REFERENCES `employees` (`EmployeeId`),
  CONSTRAINT `CK_TaskStatus` CHECK ((`Status` in (_utf8mb4'Completed',_utf8mb4'In Progress',_utf8mb4'Pending')))
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
