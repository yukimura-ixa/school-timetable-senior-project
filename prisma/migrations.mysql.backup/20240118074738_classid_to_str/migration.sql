/*
  Warnings:

  - The primary key for the `class_schedule` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `AcademicYear` to the `program` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Semester` to the `program` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `class_schedule` DROP PRIMARY KEY,
    MODIFY `ClassID` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`ClassID`);

-- AlterTable
ALTER TABLE `program` ADD COLUMN `AcademicYear` INTEGER NOT NULL,
    ADD COLUMN `Semester` ENUM('SEMESTER_1', 'SEMESTER_2') NOT NULL;
