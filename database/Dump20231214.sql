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
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES ('d023438f-bedc-498f-aaf0-c7bc36fdcf29','2df21a1a4b2e4fe55cde1ceb56d7ae56f5df825ddd0bcf13477a894d605a1afe','2023-12-06 21:29:52.275','0_init','',NULL,'2023-12-06 21:29:52.275',0);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;

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
  `SubjectCode` varchar(10) NOT NULL,
  `RoomID` int DEFAULT NULL,
  `GradeID` varchar(100) NOT NULL,
  PRIMARY KEY (`ClassID`),
  UNIQUE KEY `ClassID_UNIQUE` (`ClassID`),
  KEY `SubjectID_fk_idx` (`SubjectCode`) /*!80000 INVISIBLE */,
  KEY `TimeslotID_fk_idx` (`TimeslotID`),
  KEY `class_GradeID_fk_idx` (`GradeID`),
  KEY `class_RoomID_fk_idx` (`RoomID`),
  CONSTRAINT `class_GradeID_fk` FOREIGN KEY (`GradeID`) REFERENCES `gradelevel` (`GradeID`),
  CONSTRAINT `class_RoomID_fk` FOREIGN KEY (`RoomID`) REFERENCES `room` (`RoomID`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `class_SubjectCode_fk` FOREIGN KEY (`SubjectCode`) REFERENCES `subject` (`SubjectCode`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `class_TimeslotID_fk` FOREIGN KEY (`TimeslotID`) REFERENCES `timeslot` (`TimeslotID`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class`
--

LOCK TABLES `class` WRITE;
/*!40000 ALTER TABLE `class` DISABLE KEYS */;
/*!40000 ALTER TABLE `class` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gradelevel`
--

DROP TABLE IF EXISTS `gradelevel`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gradelevel` (
  `GradeID` varchar(100) NOT NULL,
  `Year` int NOT NULL,
  `Number` int NOT NULL,
  `GradeProgram` varchar(100) NOT NULL,
  PRIMARY KEY (`GradeID`),
  UNIQUE KEY `GradeID_UNIQUE` (`GradeID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gradelevel`
--

LOCK TABLES `gradelevel` WRITE;
/*!40000 ALTER TABLE `gradelevel` DISABLE KEYS */;
INSERT INTO `gradelevel` VALUES ('101',1,1,'regular'),('102',1,2,'regular'),('103',1,3,'regular'),('201',2,1,'regular'),('202',2,2,'regular'),('203',2,3,'regular'),('301',3,1,'regular'),('302',3,2,'regular'),('303',3,3,'regular'),('401',4,1,'scimath'),('402',4,2,'scimath'),('501',5,1,'scimath'),('502',5,2,'scimath'),('601',6,1,'scimath'),('602',6,2,'scimath');
/*!40000 ALTER TABLE `gradelevel` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `room`
--

DROP TABLE IF EXISTS `room`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `room` (
  `RoomID` int NOT NULL AUTO_INCREMENT,
  `RoomName` varchar(100) NOT NULL,
  `Building` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT '-',
  `Floor` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT '-',
  PRIMARY KEY (`RoomID`),
  UNIQUE KEY `RoomID_UNIQUE` (`RoomID`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `room`
--

LOCK TABLES `room` WRITE;
/*!40000 ALTER TABLE `room` DISABLE KEYS */;
INSERT INTO `room` VALUES (1,'สนามกีฬา','-','-'),(2,'นาฎศิลป์','-','-'),(3,'322','-','-'),(4,'323','-','-'),(5,'324','-','-'),(6,'325','-','-'),(7,'332','-','-'),(8,'334','-','-'),(9,'335','-','-'),(10,'คอม 1','-','-'),(11,'STEM','-','-'),(12,'213','-','-'),(13,'222','-','-'),(14,'223','-','-'),(15,'224','-','-'),(16,'3/1','-','-'),(17,'3/3','-','-'),(18,'336','-','-'),(19,'337','-','-'),(20,'338','-','-'),(21,'6/1','-','-'),(22,'6/2','-','-'),(23,'คอม 2','-','-'),(24,'ชีววิทยา','-','-'),(25,'ฟิสิกส์1','-','-'),(26,'ฟิสิกส์2','-','-'),(27,'วิทย์','-','-'),(28,'สังคม 1','-','-'),(29,'เคมี','-','-'),(30,'sssss','sss','222');
/*!40000 ALTER TABLE `room` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subject`
--

DROP TABLE IF EXISTS `subject`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subject` (
  `SubjectCode` varchar(10) NOT NULL,
  `SubjectName` varchar(100) NOT NULL,
  `Credit` enum('CREDIT_05','CREDIT_10','CREDIT_15','CREDIT_20') NOT NULL,
  `Category` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '-',
  `SubjectProgram` varchar(100) NOT NULL DEFAULT '-',
  PRIMARY KEY (`SubjectCode`),
  UNIQUE KEY `SubjectCode_UNIQUE` (`SubjectCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subject`
--

LOCK TABLES `subject` WRITE;
/*!40000 ALTER TABLE `subject` DISABLE KEYS */;
INSERT INTO `subject` VALUES ('asas','as','CREDIT_05','วิทยาศาสตร์',''),('asdasdasa','sdasd','CREDIT_05','วิทยาศาสตร์',''),('ฟหกฟหกฟหก','กดหกดหกดหก','CREDIT_05','ภาษาไทย','');
/*!40000 ALTER TABLE `subject` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teacher`
--

DROP TABLE IF EXISTS `teacher`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teacher` (
  `TeacherID` int NOT NULL AUTO_INCREMENT,
  `Prefix` varchar(10) NOT NULL,
  `Firstname` varchar(100) NOT NULL,
  `Lastname` varchar(100) NOT NULL,
  `Department` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '-',
  PRIMARY KEY (`TeacherID`),
  UNIQUE KEY `TeacherID_UNIQUE` (`TeacherID`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teacher`
--

LOCK TABLES `teacher` WRITE;
/*!40000 ALTER TABLE `teacher` DISABLE KEYS */;
INSERT INTO `teacher` VALUES (4,'นาง','รุ่งราตรี','ธรรมดวงศรี','ภาษาไทย'),(5,'นาง','วรารักษ์','สังกาชาติ','คณิตศาสตร์'),(6,'นาง','มิตรศิลป์','คณาบุตร','คณิตศาสตร์'),(7,'นาง','นงค์รักษ์','พ่อบุตรดี','คณิตศาสตร์'),(8,'นางสาว','สุอาภา','วรคันทักษ์','คณิตศาสตร์'),(9,'นาง','อนัญญา','คูสกุล','วิทยาศาสตร์'),(10,'นาง','ชนัดดา','ตาสำโรง','วิทยาศาสตร์'),(11,'นาง','วิมลรัตน์','ศรีสำอางค์','วิทยาศาสตร์'),(12,'นางสาว','วรานาถ','กิมาลี','วิทยาศาสตร์'),(13,'นาย','ชัยวัฒน์','วังทะพันธ์','วิทยาศาสตร์'),(14,'นาย','เมธาเกียรติ','เดชาภัคกูลกีรติ','วิทยาศาสตร์'),(15,'นาย','ณัฐกิตต์','ไกยะฝ่าย','วิทยาศาสตร์'),(16,'นางสาว','สุภาวดี','จันทรสาขา','ภาษาต่างประเทศ'),(17,'นาง','วาสนา','จันทะโสก','ภาษาต่างประเทศ'),(18,'นาย','สุพรรณ','เคนวงษา','ภาษาต่างประเทศ'),(19,'นางสาว','ศิริรักษ์','อินอุ่นโชติ','ภาษาต่างประเทศ'),(20,'นางสาว','สำเนียง','เพ็งเวลุน','สังคมศึกษา ศาสนา และวัฒนธรรม'),(21,'นาง','จินพศิกา','มีบุญ','สังคมศึกษา ศาสนา และวัฒนธรรม'),(22,'นางสาว','สุภาณี','เชื้อคำเพ็ง','สังคมศึกษา ศาสนา และวัฒนธรรม'),(23,'นาย','พจน์','ทองยืน','การงานอาชีพและเทคโนโลยี'),(24,'นาย','วิศวะ','แก้วดี','สุขศึกษาและพลศึกษา'),(25,'นางสาว','ศิริรักษ์','สารทอง','การงานอาชีพและเทคโนโลยี'),(26,'นาง','มนีรัตน์','สุขสบาย','ศิลปะ'),(27,'นาย','วัชระ','พวงมี','สุขศึกษาและพลศึกษา');
/*!40000 ALTER TABLE `teacher` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teachers_responsibility`
--

DROP TABLE IF EXISTS `teachers_responsibility`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teachers_responsibility` (
  `TeacherID` int NOT NULL,
  `GradeID` varchar(100) NOT NULL,
  `SubjectCode` varchar(10) NOT NULL,
  `AcademicYear` year NOT NULL,
  `Semester` enum('SEMESTER_1','SEMESTER_2') NOT NULL,
  `TeachHour` int NOT NULL,
  PRIMARY KEY (`TeacherID`,`GradeID`,`SubjectCode`),
  KEY `teachers_responsibility_GradeID_fk_idx` (`GradeID`),
  KEY `teachers_responsibility_SubjectID_fk_idx` (`SubjectCode`),
  CONSTRAINT `teachers_responsibility_GradeID_fk` FOREIGN KEY (`GradeID`) REFERENCES `gradelevel` (`GradeID`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `teachers_responsibility_SubjectCode_fk` FOREIGN KEY (`SubjectCode`) REFERENCES `subject` (`SubjectCode`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `teachers_responsibility_TeacherID_fk` FOREIGN KEY (`TeacherID`) REFERENCES `teacher` (`TeacherID`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teachers_responsibility`
--

LOCK TABLES `teachers_responsibility` WRITE;
/*!40000 ALTER TABLE `teachers_responsibility` DISABLE KEYS */;
/*!40000 ALTER TABLE `teachers_responsibility` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `timeslot`
--

DROP TABLE IF EXISTS `timeslot`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `timeslot` (
  `TimeslotID` varchar(100) NOT NULL,
  `StartTime` time NOT NULL,
  `EndTime` time NOT NULL,
  `IsBreaktime` tinyint(1) NOT NULL,
  PRIMARY KEY (`TimeslotID`),
  UNIQUE KEY `TimeslotID_UNIQUE` (`TimeslotID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `timeslot`
--

LOCK TABLES `timeslot` WRITE;
/*!40000 ALTER TABLE `timeslot` DISABLE KEYS */;
INSERT INTO `timeslot` VALUES ('1','08:30:00','09:20:00',0),('2','09:20:00','10:10:00',0),('3','10:20:00','11:10:00',0),('4','11:10:00','12:00:00',0),('5','13:00:00','13:50:00',0),('6','13:50:00','14:40:00',0),('7','14:40:00','15:30:00',0),('8','15:30:00','16:20:00',0),('B1','10:10:00','10:20:00',1),('B2','12:00:00','13:00:00',1);
/*!40000 ALTER TABLE `timeslot` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-12-14 23:31:23
