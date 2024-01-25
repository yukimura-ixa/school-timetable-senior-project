-- /*
--   Warnings:

--   - The primary key for the `teachers_responsibility` table will be changed. If it partially fails, the table could be left without primary key constraint.
--   - Added the required column `RespID` to the `teachers_responsibility` table without a default value. This is not possible if the table is not empty.

-- */
-- -- AlterTable
-- ALTER TABLE `teachers_responsibility` DROP PRIMARY KEY,
--     ADD COLUMN `RespID` INTEGER NOT NULL AUTO_INCREMENT,
--     ADD PRIMARY KEY (`RespID`);

-- -- CreateIndex
-- CREATE INDEX `teachers_responsibility_TeacherID_fkey` ON `teachers_responsibility`(`TeacherID`);

-- -- RenameIndex
-- ALTER TABLE `teachers_responsibility` RENAME INDEX `teachers_responsibility_GradeID_idx` TO `teachers_responsibility_GradeID_fkey`;

-- -- RenameIndex
-- ALTER TABLE `teachers_responsibility` RENAME INDEX `teachers_responsibility_SubjectCode_idx` TO `teachers_responsibility_SubjectCode_fkey`;

-- DropForeignKey
ALTER TABLE `teachers_responsibility` DROP FOREIGN KEY `teachers_responsibility_TeacherID_fkey`;
ALTER TABLE `teachers_responsibility` DROP FOREIGN KEY `teachers_responsibility_GradeID_fkey`;
ALTER TABLE `teachers_responsibility` DROP FOREIGN KEY `teachers_responsibility_SubjectCode_fkey`;

-- DropPrimaryKey
ALTER TABLE `teachers_responsibility` DROP PRIMARY KEY;

-- AlterTable
ALTER TABLE `teachers_responsibility` ADD COLUMN `RespID` INTEGER NOT NULL AUTO_INCREMENT, ADD PRIMARY KEY (`RespID`);

-- CreateIndex
CREATE INDEX `teachers_responsibility_TeacherID_fkey` ON `teachers_responsibility`(`TeacherID`);

-- RenameIndex
ALTER TABLE `teachers_responsibility` RENAME INDEX `teachers_responsibility_GradeID_idx` TO `teachers_responsibility_GradeID_fkey`;

-- RenameIndex
ALTER TABLE `teachers_responsibility` RENAME INDEX `teachers_responsibility_SubjectCode_idx` TO `teachers_responsibility_SubjectCode_fkey`;

-- AddForeignKey
ALTER TABLE `teachers_responsibility` ADD CONSTRAINT `teachers_responsibility_TeacherID_fkey` FOREIGN KEY (`TeacherID`) REFERENCES `teacher`(`TeacherID`) ON DELETE CASCADE;
ALTER TABLE `teachers_responsibility` ADD CONSTRAINT `teachers_responsibility_GradeID_fkey` FOREIGN KEY (`GradeID`) REFERENCES `gradelevel`(`GradeID`) ON DELETE CASCADE;
ALTER TABLE `teachers_responsibility` ADD CONSTRAINT `teachers_responsibility_SubjectCode_fkey` FOREIGN KEY (`SubjectCode`) REFERENCES `subject`(`SubjectCode`) ON DELETE CASCADE;
