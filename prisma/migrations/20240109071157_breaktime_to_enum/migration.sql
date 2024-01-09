/*
  Warnings:

  - You are about to drop the column `IsBreaktime` on the `timeslot` table. All the data in the column will be lost.
  - Added the required column `Breaktime` to the `timeslot` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `timeslot` DROP COLUMN `IsBreaktime`,
    ADD COLUMN `Breaktime` ENUM('BREAK_JUNIOR', 'BREAK_SENIOR', 'NOT_BREAK') NOT NULL;
