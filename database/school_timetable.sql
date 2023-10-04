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
-- Table structure for table `gradelevel`
--

DROP TABLE IF EXISTS `gradelevel`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gradelevel` (
  `GradeLevelID` varchar(100) NOT NULL,
  `Year` int NOT NULL,
  `Number` int NOT NULL,
  `Program` varchar(100) NOT NULL,
  PRIMARY KEY (`GradeLevelID`)
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
-- Table structure for table `gradeleveltimeslot`
--

DROP TABLE IF EXISTS `gradeleveltimeslot`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gradeleveltimeslot` (
  `GradeLevelID` varchar(100) NOT NULL,
  `TimeslotID` varchar(100) NOT NULL,
  PRIMARY KEY (`GradeLevelID`,`TimeslotID`),
  KEY `gradeleveltimeslot_TimeslotID_fk_idx` (`TimeslotID`),
  CONSTRAINT `gradeleveltimeslot_GradeLevelID_fk` FOREIGN KEY (`GradeLevelID`) REFERENCES `gradelevel` (`GradeLevelID`),
  CONSTRAINT `gradeleveltimeslot_TimeslotID_fk` FOREIGN KEY (`TimeslotID`) REFERENCES `timeslot` (`TimeslotID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gradeleveltimeslot`
--

LOCK TABLES `gradeleveltimeslot` WRITE;
/*!40000 ALTER TABLE `gradeleveltimeslot` DISABLE KEYS */;
/*!40000 ALTER TABLE `gradeleveltimeslot` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `room`
--

DROP TABLE IF EXISTS `room`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `room` (
  `RoomID` varchar(100) NOT NULL,
  `RoomName` varchar(100) NOT NULL,
  `Building` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT '-',
  `Floor` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT '-',
  PRIMARY KEY (`RoomID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `room`
--

LOCK TABLES `room` WRITE;
/*!40000 ALTER TABLE `room` DISABLE KEYS */;
INSERT INTO `room` VALUES ('1','สนามกีฬา','-',NULL),('10','คอม 1','-',NULL),('2','ห้องนาฎศิลป์','-',NULL),('3','322','-',NULL),('4','323','-',NULL),('5','324','-',NULL),('6','325','-',NULL),('7','332','-',NULL),('8','334','-',NULL),('9','335','-',NULL);
/*!40000 ALTER TABLE `room` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subject`
--

DROP TABLE IF EXISTS `subject`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subject` (
  `SubjectID` varchar(100) NOT NULL,
  `SubjectName` varchar(100) NOT NULL,
  `Credit` enum('0.5','1.0','1.5') NOT NULL,
  `Category` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '-',
  PRIMARY KEY (`SubjectID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subject`
--

LOCK TABLES `subject` WRITE;
/*!40000 ALTER TABLE `subject` DISABLE KEYS */;
INSERT INTO `subject` VALUES ('ก20931','คอมพิวเตอร์','0.5','การงานอาชีพและเทคโนโลยี'),('ค31203','คณิตศาสตร์สร้างสรรค์','1.0','คณิตศาสตร์'),('ค32201','คณิตศาสตร์เพิ่มเติม','1.5','คณิตศาสตร์'),('ง20201','การงานเพิ่มเติม','1.0','การงานอาชีพ'),('จ31201','ภาษาจีน','1.0','ภาษาต่างประเทศ'),('ท21101','ภาษาไทยพื้นฐาน','1.5','ภาษาไทย'),('พ23103','ฟุตบอล','1.0','สุขศึกษาและพลศึกษา'),('ว30221','เคมี 1','1.0','วิทยาศาสตร์'),('ศ33102','ศิลปะ','1.0','ศิลปะ'),('ส22106','ประวัติศาสตร์ 3','1.5','สังคมศึกษาฯ'),('ส31101','สังคมพื้นฐาน 1','1.5','สังคมศึกษาฯ'),('อ33102','ภาษาอังกฤษพิ้นฐาน','1.5','ภาษาต่างประเทศ');
/*!40000 ALTER TABLE `subject` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subjecttimeslot`
--

DROP TABLE IF EXISTS `subjecttimeslot`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subjecttimeslot` (
  `SubjectID` varchar(100) NOT NULL,
  `TimeslotID` varchar(100) NOT NULL,
  PRIMARY KEY (`SubjectID`,`TimeslotID`),
  KEY `subjecttimeslot_TimeslotID_fk_idx` (`TimeslotID`),
  CONSTRAINT `subjecttimeslot_SubjectID_fk` FOREIGN KEY (`SubjectID`) REFERENCES `subject` (`SubjectID`),
  CONSTRAINT `subjecttimeslot_TimeslotID_fk` FOREIGN KEY (`TimeslotID`) REFERENCES `timeslot` (`TimeslotID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subjecttimeslot`
--

LOCK TABLES `subjecttimeslot` WRITE;
/*!40000 ALTER TABLE `subjecttimeslot` DISABLE KEYS */;
INSERT INTO `subjecttimeslot` VALUES ('ก20931','01'),('ค31203','02'),('ค32201','03'),('ง20201','04'),('จ31201','05'),('ท21101','06'),('พ23103','07'),('ว30221','08'),('ศ33102','09'),('ส22106','10'),('ค31203','11'),('ค31203','12'),('ง20201','13'),('ง20201','14'),('ง20201','15'),('ก20931','16'),('ค31203','17'),('ค31203','18'),('ง20201','19'),('ง20201','20');
/*!40000 ALTER TABLE `subjecttimeslot` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teacher`
--

DROP TABLE IF EXISTS `teacher`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teacher` (
  `TeacherID` int NOT NULL AUTO_INCREMENT,
  `Title` enum('นาย','นาง','นางสาว') NOT NULL,
  `FirstName` varchar(100) NOT NULL,
  `LastName` varchar(100) NOT NULL,
  `Department` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '-',
  PRIMARY KEY (`TeacherID`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teacher`
--

LOCK TABLES `teacher` WRITE;
/*!40000 ALTER TABLE `teacher` DISABLE KEYS */;
INSERT INTO `teacher` VALUES (1,'นาย','พูลศักดิ์','พ่อบุตรดี','-'),(2,'นาง','พัชรีรัตน์','โวเบ้า','-'),(3,'นาง','สุภาพรณ์','วงศ์ทรรศนกุล','-'),(4,'นาง','รุ่งราตรี','ธรรมดวงศรี','-'),(5,'นาง','วรารักษ์','สังกาชาติ','-'),(6,'นาง','มิตรศิลป์','คณาบุตร','-'),(7,'นาง','นงค์รักษ์','พ่อบุตรดี','-'),(8,'นางสาว','สุอาภา','วรคันทักษ์','-'),(9,'นาง','อนัญญา','คูสกุล','-'),(10,'นาง','ชนัดดา','ตาสำโรง','-');
/*!40000 ALTER TABLE `teacher` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teachersubject`
--

DROP TABLE IF EXISTS `teachersubject`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teachersubject` (
  `TeacherID` int NOT NULL,
  `SubjectID` varchar(100) NOT NULL,
  `Semester` enum('1','2') NOT NULL,
  `AcademicYear` year NOT NULL,
  `TeachHour` int NOT NULL,
  PRIMARY KEY (`TeacherID`,`SubjectID`),
  KEY `SubjectID_fk_idx` (`SubjectID`),
  CONSTRAINT `SubjectID_fk` FOREIGN KEY (`SubjectID`) REFERENCES `subject` (`SubjectID`),
  CONSTRAINT `TeacherID_fk` FOREIGN KEY (`TeacherID`) REFERENCES `teacher` (`TeacherID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teachersubject`
--

LOCK TABLES `teachersubject` WRITE;
/*!40000 ALTER TABLE `teachersubject` DISABLE KEYS */;
INSERT INTO `teachersubject` VALUES (1,'ก20931','1',2023,2),(2,'ค31203','1',2023,3),(3,'ง20201','1',2023,2),(4,'จ31201','1',2023,2),(5,'ท21101','1',2023,2),(6,'พ23103','1',2023,1),(7,'ว30221','1',2023,2),(8,'ศ33102','1',2023,2),(9,'ส22106','1',2023,2),(10,'ส31101','1',2023,3);
/*!40000 ALTER TABLE `teachersubject` ENABLE KEYS */;
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
  `DayOfWeek` enum('SUN','MON','TUE','WED','THU','FRI','SAT') NOT NULL,
  `IsBreaktime` tinyint(1) NOT NULL,
  PRIMARY KEY (`TimeslotID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `timeslot`
--

LOCK TABLES `timeslot` WRITE;
/*!40000 ALTER TABLE `timeslot` DISABLE KEYS */;
INSERT INTO `timeslot` VALUES ('01','08:30:00','09:20:00','MON',0),('02','09:20:00','10:10:00','MON',0),('03','10:10:00','11:00:00','MON',0),('04','11:00:00','11:50:00','MON',0),('05','11:50:00','12:40:00','MON',0),('06','12:40:00','13:30:00','MON',0),('07','13:30:00','14:20:00','MON',0),('08','14:20:00','15:10:00','MON',0),('09','15:10:00','16:00:00','MON',0),('10','12:00:00','12:50:00','MON',1),('11','08:30:00','09:20:00','TUE',0),('12','09:20:00','10:10:00','TUE',0),('13','10:10:00','11:00:00','TUE',0),('14','11:00:00','11:50:00','TUE',0),('15','11:50:00','12:40:00','TUE',0),('16','12:40:00','13:30:00','TUE',0),('17','13:30:00','14:20:00','TUE',0),('18','14:20:00','15:10:00','TUE',0),('19','15:10:00','16:00:00','TUE',0),('20','12:00:00','12:50:00','TUE',1),('21','08:30:00','09:20:00','WED',0),('22','09:20:00','10:10:00','WED',0),('23','10:10:00','11:00:00','WED',0),('24','11:00:00','11:50:00','WED',0),('25','11:50:00','12:40:00','WED',0),('26','12:40:00','13:30:00','WED',0),('27','13:30:00','14:20:00','WED',0),('28','14:20:00','15:10:00','WED',0),('29','15:10:00','16:00:00','WED',0),('30','12:00:00','12:50:00','WED',1),('31','08:30:00','09:20:00','THU',0),('32','09:20:00','10:10:00','THU',0),('33','10:10:00','11:00:00','THU',0),('34','11:00:00','11:50:00','THU',0),('35','11:50:00','12:40:00','THU',0),('36','12:40:00','13:30:00','THU',0),('37','13:30:00','14:20:00','THU',0),('38','14:20:00','15:10:00','THU',0),('39','15:10:00','16:00:00','THU',0),('40','12:00:00','12:50:00','THU',1),('41','08:30:00','09:20:00','FRI',0),('42','09:20:00','10:10:00','FRI',0),('43','10:10:00','11:00:00','FRI',0),('44','11:00:00','11:50:00','FRI',0),('45','11:50:00','12:40:00','FRI',0),('46','12:40:00','13:30:00','FRI',0),('47','13:30:00','14:20:00','FRI',0),('48','14:20:00','15:10:00','FRI',0),('49','15:10:00','16:00:00','FRI',0),('50','12:00:00','12:50:00','FRI',1);
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

-- Dump completed on 2023-10-04 15:36:37
