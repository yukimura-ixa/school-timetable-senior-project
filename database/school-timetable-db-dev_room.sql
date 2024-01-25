-- MySQL dump 10.13  Distrib 8.0.34, for Win64 (x86_64)
--
-- Host: 34.27.217.57    Database: school-timetable-db-dev
-- ------------------------------------------------------
-- Server version	8.0.31-google

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
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '0ae2ccd9-bb2e-11ee-9a14-42010a400004:1-3109,
11cd8659-9f67-11ee-afa0-42010a400002:1-473106';

--
-- Table structure for table `room`
--

DROP TABLE IF EXISTS `room`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `room` (
  `RoomID` int NOT NULL AUTO_INCREMENT,
  `RoomName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Building` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '-',
  `Floor` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '-',
  PRIMARY KEY (`RoomID`),
  UNIQUE KEY `room_RoomName_key` (`RoomName`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `room`
--

LOCK TABLES `room` WRITE;
/*!40000 ALTER TABLE `room` DISABLE KEYS */;
INSERT INTO `room` VALUES (1,'สนามกีฬา','-','-'),(2,'นาฎศิลป์','-','-'),(3,'322','-','-'),(4,'323','-','-'),(5,'324','-','-'),(6,'325','-','-'),(7,'332','-','-'),(8,'334','-','-'),(9,'335','-','-'),(10,'คอม 1','-','-'),(11,'STEM','-','-'),(12,'213','-','-'),(13,'222','-','-'),(14,'223','-','-'),(15,'224','-','-'),(16,'3/1','-','-'),(17,'3/3','-','-'),(18,'336','-','-'),(19,'337','-','-'),(20,'338','-','-'),(21,'6/1','-','-'),(22,'6/2','-','-'),(23,'คอม 2','-','-'),(24,'ชีววิทยา','-','-'),(25,'ฟิสิกส์1','-','-'),(26,'ฟิสิกส์2','-','-'),(27,'วิทย์','-','-'),(28,'สังคม 1','-','-'),(29,'เคมี','-','-');
/*!40000 ALTER TABLE `room` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-01-25 13:22:58
