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

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '11cd8659-9f67-11ee-afa0-42010a400002:1-222332';

--
-- Table structure for table `teacher`
--

DROP TABLE IF EXISTS `teacher`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teacher` (
  `TeacherID` int NOT NULL AUTO_INCREMENT,
  `Prefix` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Firstname` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Lastname` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Department` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '-',
  PRIMARY KEY (`TeacherID`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teacher`
--

LOCK TABLES `teacher` WRITE;
/*!40000 ALTER TABLE `teacher` DISABLE KEYS */;
INSERT INTO `teacher` VALUES (1,'นาย','พูลศักดิ์','พ่อบุตรดี','การงานอาชีพและเทคโนโลยี'),(2,'นาง','พัชรีรัตน์','โวเบ้า','การงานอาชีพและเทคโนโลยี'),(3,'นาง','สุภาพรณ์','วงศ์ทรรศนกุล','ภาษาไทย'),(4,'นาง','รุ่งราตรี','ธรรมดวงศรี','ภาษาไทย'),(5,'นาง','วรารักษ์','สังกาชาติ','คณิตศาสตร์'),(6,'นาง','มิตรศิลป์','คณาบุตร','คณิตศาสตร์'),(7,'นาง','นงค์รักษ์','พ่อบุตรดี','คณิตศาสตร์'),(8,'นางสาว','สุอาภา','วรคันทักษ์','คณิตศาสตร์'),(9,'นาง','อนัญญา','คูสกุล','วิทยาศาสตร์'),(10,'นาง','ชนัดดา','ตาสำโรง','วิทยาศาสตร์'),(11,'นาง','วิมลรัตน์','ศรีสำอางค์','วิทยาศาสตร์'),(12,'นางสาว','วรานาถ','กิมาลี','วิทยาศาสตร์'),(13,'นาย','ชัยวัฒน์','วังทะพันธ์','วิทยาศาสตร์'),(14,'นาย','เมธาเกียรติ','เดชาภัคกูลกีรติ','วิทยาศาสตร์'),(15,'นาย','ณัฐกิตต์','ไกยะฝ่าย','วิทยาศาสตร์'),(16,'นางสาว','สุภาวดี','จันทรสาขา','ภาษาต่างประเทศ'),(17,'นาง','วาสนา','จันทะโสก','ภาษาต่างประเทศ'),(18,'นาย','สุพรรณ','เคนวงษา','ภาษาต่างประเทศ'),(19,'นางสาว','ศิริรักษ์','อินอุ่นโชติ','ภาษาต่างประเทศ'),(20,'นางสาว','สำเนียง','เพ็งเวลุน','สังคมศึกษา ศาสนา และวัฒนธรรม'),(21,'นาง','จินพศิกา','มีบุญ','สังคมศึกษา ศาสนา และวัฒนธรรม'),(22,'นางสาว','สุภาณี','เชื้อคำเพ็ง','สังคมศึกษา ศาสนา และวัฒนธรรม'),(23,'นาย','พจน์','ทองยืน','การงานอาชีพและเทคโนโลยี'),(24,'นาย','วิศวะ','แก้วดี','สุขศึกษาและพลศึกษา'),(25,'นางสาว','ศิริรักษ์','สารทอง','การงานอาชีพและเทคโนโลยี'),(26,'นาง','มนีรัตน์','สุขสบาย','ศิลปะ'),(27,'นาย','วัชระ','พวงมี','สุขศึกษาและพลศึกษา');
/*!40000 ALTER TABLE `teacher` ENABLE KEYS */;
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

-- Dump completed on 2024-01-09  0:22:51
