/*
  Warnings:

  - You are about to drop the column `DayOfWeek` on the `class_schedule` table. All the data in the column will be lost.
  - Added the required column `DayOfWeek` to the `timeslot` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `class_schedule` DROP COLUMN `DayOfWeek`;

-- AlterTable
ALTER TABLE `timeslot` ADD COLUMN `DayOfWeek` ENUM('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN') NOT NULL;
