-- CreateTable
CREATE TABLE `class` (
    `ClassID` INTEGER NOT NULL AUTO_INCREMENT,
    `DayOfWeek` ENUM('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN') NOT NULL,
    `TimeslotID` VARCHAR(100) NOT NULL,
    `SubjectCode` VARCHAR(10) NOT NULL,
    `RoomID` INTEGER NULL,
    `GradeID` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `ClassID_UNIQUE`(`ClassID`),
    INDEX `RoomID_fk_idx`(`RoomID`),
    INDEX `SubjectID_fk_idx`(`SubjectCode`),
    INDEX `TimeslotID_fk_idx`(`TimeslotID`),
    INDEX `class_GradeID_fk_idx`(`GradeID`),
    PRIMARY KEY (`ClassID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gradelevel` (
    `GradeID` VARCHAR(100) NOT NULL,
    `Year` INTEGER NOT NULL,
    `Number` INTEGER NOT NULL,
    `GradeProgram` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `GradeID_UNIQUE`(`GradeID`),
    PRIMARY KEY (`GradeID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `room` (
    `RoomID` INTEGER NOT NULL,
    `RoomName` VARCHAR(100) NOT NULL,
    `Building` VARCHAR(100) NULL DEFAULT '-',
    `Floor` VARCHAR(100) NULL DEFAULT '-',

    UNIQUE INDEX `RoomID_UNIQUE`(`RoomID`),
    PRIMARY KEY (`RoomID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subject` (
    `SubjectCode` VARCHAR(10) NOT NULL,
    `SubjectName` VARCHAR(100) NOT NULL,
    `Credit` ENUM('CREDIT_05', 'CREDIT_10', 'CREDIT_15', 'CREDIT_20') NOT NULL,
    `Category` VARCHAR(100) NOT NULL DEFAULT '-',
    `SubjectProgram` VARCHAR(100) NOT NULL DEFAULT '-',

    UNIQUE INDEX `SubjectCode_UNIQUE`(`SubjectCode`),
    PRIMARY KEY (`SubjectCode`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `teacher` (
    `TeacherID` INTEGER NOT NULL AUTO_INCREMENT,
    `Prefix` VARCHAR(10) NOT NULL,
    `Firstname` VARCHAR(100) NOT NULL,
    `Lastname` VARCHAR(100) NOT NULL,
    `Department` VARCHAR(100) NOT NULL DEFAULT '-',

    UNIQUE INDEX `TeacherID_UNIQUE`(`TeacherID`),
    PRIMARY KEY (`TeacherID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `timeslot` (
    `TimeslotID` VARCHAR(100) NOT NULL,
    `StartTime` TIME(0) NOT NULL,
    `EndTime` TIME(0) NOT NULL,
    `IsBreaktime` BOOLEAN NOT NULL,

    UNIQUE INDEX `TimeslotID_UNIQUE`(`TimeslotID`),
    PRIMARY KEY (`TimeslotID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `teachers_responsibility` (
    `TeacherID` INTEGER NOT NULL,
    `GradeID` VARCHAR(100) NOT NULL,
    `SubjectCode` VARCHAR(10) NOT NULL,
    `AcademicYear` YEAR NOT NULL,
    `Semester` ENUM('SEMESTER_1', 'SEMESTER_2') NOT NULL,
    `TeachHour` INTEGER NOT NULL,

    INDEX `teachers_responsibility_GradeID_fk_idx`(`GradeID`),
    INDEX `teachers_responsibility_SubjectID_fk_idx`(`SubjectCode`),
    PRIMARY KEY (`TeacherID`, `GradeID`, `SubjectCode`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `class` ADD CONSTRAINT `class_GradeID_fk` FOREIGN KEY (`GradeID`) REFERENCES `gradelevel`(`GradeID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `class` ADD CONSTRAINT `class_RoomID_fk` FOREIGN KEY (`RoomID`) REFERENCES `room`(`RoomID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `class` ADD CONSTRAINT `class_SubjectCode_fk` FOREIGN KEY (`SubjectCode`) REFERENCES `subject`(`SubjectCode`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `class` ADD CONSTRAINT `class_TimeslotID_fk` FOREIGN KEY (`TimeslotID`) REFERENCES `timeslot`(`TimeslotID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `teachers_responsibility` ADD CONSTRAINT `teachers_responsibility_GradeID_fk` FOREIGN KEY (`GradeID`) REFERENCES `gradelevel`(`GradeID`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `teachers_responsibility` ADD CONSTRAINT `teachers_responsibility_SubjectCode_fk` FOREIGN KEY (`SubjectCode`) REFERENCES `subject`(`SubjectCode`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `teachers_responsibility` ADD CONSTRAINT `teachers_responsibility_TeacherID_fk` FOREIGN KEY (`TeacherID`) REFERENCES `teacher`(`TeacherID`) ON DELETE RESTRICT ON UPDATE RESTRICT;

