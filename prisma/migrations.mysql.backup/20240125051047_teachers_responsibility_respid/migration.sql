-- DropForeignKey
ALTER TABLE `teachers_responsibility` DROP FOREIGN KEY `teachers_responsibility_GradeID_fkey`;

-- DropForeignKey
ALTER TABLE `teachers_responsibility` DROP FOREIGN KEY `teachers_responsibility_SubjectCode_fkey`;

-- DropForeignKey
ALTER TABLE `teachers_responsibility` DROP FOREIGN KEY `teachers_responsibility_TeacherID_fkey`;

-- AddForeignKey
ALTER TABLE `teachers_responsibility` ADD CONSTRAINT `teachers_responsibility_GradeID_fkey` FOREIGN KEY (`GradeID`) REFERENCES `gradelevel`(`GradeID`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `teachers_responsibility` ADD CONSTRAINT `teachers_responsibility_SubjectCode_fkey` FOREIGN KEY (`SubjectCode`) REFERENCES `subject`(`SubjectCode`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `teachers_responsibility` ADD CONSTRAINT `teachers_responsibility_TeacherID_fkey` FOREIGN KEY (`TeacherID`) REFERENCES `teacher`(`TeacherID`) ON DELETE CASCADE ON UPDATE CASCADE;
