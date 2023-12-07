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
-- Table structure for table `teaches`
--

DROP TABLE IF EXISTS `teaches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teaches` (
  `TeacherID` int NOT NULL,
  `GradeID` varchar(100) NOT NULL,
  `SubjectID` int NOT NULL,
  `AcademicYear` year NOT NULL,
  `Semester` enum('1','2') NOT NULL,
  `TeachHour` int NOT NULL,
  PRIMARY KEY (`TeacherID`,`GradeID`,`SubjectID`),
  KEY `teaches_GradeID_fk_idx` (`GradeID`),
  KEY `teaches_SubjectID_fk_idx` (`SubjectID`),
  CONSTRAINT `teaches_GradeID_fk` FOREIGN KEY (`GradeID`) REFERENCES `gradelevel` (`GradeID`),
  CONSTRAINT `teaches_SubjectID_fk` FOREIGN KEY (`SubjectID`) REFERENCES `subject` (`SubjectID`),
  CONSTRAINT `teaches_TeacherID_fk` FOREIGN KEY (`TeacherID`) REFERENCES `teacher` (`TeacherID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teaches`
--

LOCK TABLES `teaches` WRITE;
/*!40000 ALTER TABLE `teaches` DISABLE KEYS */;
INSERT INTO `teaches` VALUES (3,'101',5,2023,'1',9),(3,'101',9,2023,'1',4),(3,'101',10,2023,'1',4),(3,'102',5,2023,'1',9),(3,'102',10,2023,'1',4),(3,'103',5,2023,'1',9),(3,'301',65,2023,'1',1),(3,'401',6,2023,'1',4),(3,'402',6,2023,'1',4),(3,'501',7,2023,'1',4),(3,'502',7,2023,'1',4),(4,'201',12,2023,'1',9),(4,'202',12,2023,'1',9),(4,'203',12,2023,'1',9),(4,'301',14,2023,'1',9),(4,'302',14,2023,'1',9),(4,'303',13,2023,'1',2),(4,'303',14,2023,'1',9),(4,'402',4,2023,'1',1),(5,'101',18,2023,'1',9),(5,'102',18,2023,'1',9),(5,'103',18,2023,'1',9),(5,'201',19,2023,'1',9),(5,'202',19,2023,'1',9),(5,'203',19,2023,'1',9),(5,'301',23,2023,'1',1);
/*!40000 ALTER TABLE `teaches` ENABLE KEYS */;
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
