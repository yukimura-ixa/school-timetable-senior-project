-- CreateTable
CREATE TABLE `class_schedule` (
    `ClassID` INTEGER NOT NULL AUTO_INCREMENT,
    `DayOfWeek` ENUM('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN') NOT NULL,
    `TimeslotID` VARCHAR(191) NOT NULL,
    `SubjectCode` VARCHAR(191) NOT NULL,
    `RoomID` INTEGER NULL,
    `GradeID` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`ClassID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gradelevel` (
    `GradeID` VARCHAR(191) NOT NULL,
    `Year` INTEGER NOT NULL,
    `Number` INTEGER NOT NULL,
    `ProgramID` INTEGER NOT NULL,

    PRIMARY KEY (`GradeID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `room` (
    `RoomID` INTEGER NOT NULL AUTO_INCREMENT,
    `RoomName` VARCHAR(191) NOT NULL,
    `Building` VARCHAR(191) NOT NULL DEFAULT '-',
    `Floor` VARCHAR(191) NOT NULL DEFAULT '-',

    PRIMARY KEY (`RoomID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subject` (
    `SubjectCode` VARCHAR(191) NOT NULL,
    `SubjectName` VARCHAR(191) NOT NULL,
    `Credit` ENUM('CREDIT_05', 'CREDIT_10', 'CREDIT_15', 'CREDIT_20') NOT NULL,
    `Category` VARCHAR(191) NOT NULL DEFAULT '-',
    `ProgramID` INTEGER NOT NULL,

    PRIMARY KEY (`SubjectCode`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `program` (
    `ProgramID` INTEGER NOT NULL AUTO_INCREMENT,
    `ProgramName` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`ProgramID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `teacher` (
    `TeacherID` INTEGER NOT NULL AUTO_INCREMENT,
    `Prefix` VARCHAR(191) NOT NULL,
    `Firstname` VARCHAR(191) NOT NULL,
    `Lastname` VARCHAR(191) NOT NULL,
    `Department` VARCHAR(191) NOT NULL DEFAULT '-',

    PRIMARY KEY (`TeacherID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `timeslot` (
    `TimeslotID` VARCHAR(191) NOT NULL,
    `AcademicYear` INTEGER NOT NULL,
    `Semester` ENUM('SEMESTER_1', 'SEMESTER_2') NOT NULL,
    `StartTime` TIME NOT NULL,
    `EndTime` TIME NOT NULL,
    `IsBreaktime` BOOLEAN NOT NULL,

    PRIMARY KEY (`TimeslotID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `teachers_responsibility` (
    `TeacherID` INTEGER NOT NULL,
    `GradeID` VARCHAR(191) NOT NULL,
    `SubjectCode` VARCHAR(191) NOT NULL,
    `AcademicYear` INTEGER NOT NULL,
    `Semester` ENUM('SEMESTER_1', 'SEMESTER_2') NOT NULL,
    `TeachHour` INTEGER NOT NULL,

    INDEX `teachers_responsibility_GradeID_idx`(`GradeID`),
    INDEX `teachers_responsibility_SubjectCode_idx`(`SubjectCode`),
    PRIMARY KEY (`TeacherID`, `GradeID`, `SubjectCode`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `class_schedule` ADD CONSTRAINT `class_schedule_RoomID_fkey` FOREIGN KEY (`RoomID`) REFERENCES `room`(`RoomID`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `class_schedule` ADD CONSTRAINT `class_schedule_GradeID_fkey` FOREIGN KEY (`GradeID`) REFERENCES `gradelevel`(`GradeID`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `class_schedule` ADD CONSTRAINT `class_schedule_SubjectCode_fkey` FOREIGN KEY (`SubjectCode`) REFERENCES `subject`(`SubjectCode`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `class_schedule` ADD CONSTRAINT `class_schedule_TimeslotID_fkey` FOREIGN KEY (`TimeslotID`) REFERENCES `timeslot`(`TimeslotID`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gradelevel` ADD CONSTRAINT `gradelevel_ProgramID_fkey` FOREIGN KEY (`ProgramID`) REFERENCES `program`(`ProgramID`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subject` ADD CONSTRAINT `subject_ProgramID_fkey` FOREIGN KEY (`ProgramID`) REFERENCES `program`(`ProgramID`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `teachers_responsibility` ADD CONSTRAINT `teachers_responsibility_TeacherID_fkey` FOREIGN KEY (`TeacherID`) REFERENCES `teacher`(`TeacherID`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `teachers_responsibility` ADD CONSTRAINT `teachers_responsibility_GradeID_fkey` FOREIGN KEY (`GradeID`) REFERENCES `gradelevel`(`GradeID`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `teachers_responsibility` ADD CONSTRAINT `teachers_responsibility_SubjectCode_fkey` FOREIGN KEY (`SubjectCode`) REFERENCES `subject`(`SubjectCode`) ON DELETE CASCADE ON UPDATE CASCADE;

