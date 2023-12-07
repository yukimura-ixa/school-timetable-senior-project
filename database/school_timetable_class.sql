-- MySQL dump 10.13  Distrib 8.0.34, for Win64 (x86_64)
--
-- Host: localhost    Database: school_timetable
-- ------------------------------------------------------
-- Server version	8.0.34

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
-- Table structure for table `class`
--

DROP TABLE IF EXISTS `class`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `class` (
  `ClassID` int NOT NULL AUTO_INCREMENT,
  `DayOfWeek` enum('MON','TUE','WED','THU','FRI','SAT','SUN') NOT NULL,
  `TimeslotID` varchar(100) NOT NULL,
  `SubjectID` int NOT NULL,
  `RoomID` int DEFAULT NULL,
  `GradeID` varchar(100) NOT NULL,
  PRIMARY KEY (`ClassID`),
  UNIQUE KEY `ClassID_UNIQUE` (`ClassID`),
  KEY `SubjectID_fk_idx` (`SubjectID`) /*!80000 INVISIBLE */,
  KEY `RoomID_fk_idx` (`RoomID`) /*!80000 INVISIBLE */,
  KEY `TimeslotID_fk_idx` (`TimeslotID`),
  KEY `class_GradeID_fk_idx` (`GradeID`),
  CONSTRAINT `class_GradeID_fk` FOREIGN KEY (`GradeID`) REFERENCES `gradelevel` (`GradeID`),
  CONSTRAINT `class_RoomID_fk` FOREIGN KEY (`RoomID`) REFERENCES `room` (`RoomID`),
  CONSTRAINT `class_SubjectID_fk` FOREIGN KEY (`SubjectID`) REFERENCES `subject` (`SubjectID`),
  CONSTRAINT `class_TimeslotID_fk` FOREIGN KEY (`TimeslotID`) REFERENCES `timeslot` (`TimeslotID`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class`
--

LOCK TABLES `class` WRITE;
/*!40000 ALTER TABLE `class` DISABLE KEYS */;
INSERT INTO `class` VALUES (1,'MON','3',8,7,'602'),(2,'MON','5',8,7,'601'),(3,'MON','6',5,7,'103'),(4,'MON','7',6,7,'401'),(5,'TUE','1',5,7,'102'),(6,'TUE','2',7,7,'501'),(7,'TUE','3',7,7,'103'),(8,'TUE','4',7,7,'101'),(9,'TUE','6',8,7,'601'),(10,'WED','1',5,7,'101'),(11,'WED','2',5,7,'102'),(12,'WED','3',8,7,'602'),(13,'WED','4',6,7,'401'),(14,'WED','5',6,7,'402'),(15,'WED','6',7,7,'502'),(16,'WED','7',153,NULL,'101'),(17,'WED','7',153,NULL,'102'),(18,'WED','7',153,NULL,'103'),(19,'WED','7',153,NULL,'201'),(20,'WED','7',153,NULL,'202'),(21,'WED','7',153,NULL,'203'),(22,'WED','7',153,NULL,'301'),(23,'WED','7',153,NULL,'302'),(24,'WED','7',153,NULL,'303'),(25,'WED','7',152,NULL,'401'),(26,'WED','7',152,NULL,'402'),(27,'WED','7',152,NULL,'501'),(28,'WED','7',152,NULL,'502'),(29,'WED','7',152,NULL,'601'),(30,'WED','7',152,NULL,'602'),(31,'THU','3',7,7,'502'),(32,'THU','4',5,7,'102'),(33,'THU','5',5,7,'101'),(34,'THU','6',7,7,'501'),(35,'THU','7',6,7,'402'),(36,'FRI','2',5,7,'103'),(37,'FRI','3',9,7,'102'),(38,'FRI','4',9,7,'102');
/*!40000 ALTER TABLE `class` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-12-07  1:33:02
