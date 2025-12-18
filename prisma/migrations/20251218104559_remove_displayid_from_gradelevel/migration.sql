/*
  Warnings:

  - You are about to drop the column `DisplayID` on the `gradelevel` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "gradelevel_DisplayID_key";

-- AlterTable
ALTER TABLE "gradelevel" DROP COLUMN "DisplayID";
