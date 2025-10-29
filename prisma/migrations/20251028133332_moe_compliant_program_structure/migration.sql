/*
  Warnings:

  - You are about to drop the column `AcademicYear` on the `program` table. All the data in the column will be lost.
  - You are about to drop the column `Semester` on the `program` table. All the data in the column will be lost.
  - You are about to drop the column `ProgramID` on the `subject` table. All the data in the column will be lost.
  - The `Category` column on the `subject` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `_gradelevelToprogram` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[Year,Number]` on the table `gradelevel` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ProgramCode]` on the table `program` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[Year,Track]` on the table `program` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ProgramCode` to the `program` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Track` to the `program` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Year` to the `program` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProgramTrack" AS ENUM ('SCIENCE_MATH', 'LANGUAGE_MATH', 'LANGUAGE_ARTS', 'GENERAL');

-- CreateEnum
CREATE TYPE "SubjectCategory" AS ENUM ('CORE', 'ADDITIONAL', 'ACTIVITY');

-- CreateEnum
CREATE TYPE "LearningArea" AS ENUM ('THAI', 'MATHEMATICS', 'SCIENCE', 'SOCIAL', 'HEALTH_PE', 'ARTS', 'CAREER', 'FOREIGN_LANGUAGE');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('CLUB', 'SCOUT', 'GUIDANCE', 'SOCIAL_SERVICE');

-- DropForeignKey
ALTER TABLE "public"."_gradelevelToprogram" DROP CONSTRAINT "_gradelevelToprogram_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_gradelevelToprogram" DROP CONSTRAINT "_gradelevelToprogram_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."subject" DROP CONSTRAINT "fk_subject_program";

-- DropIndex
DROP INDEX "public"."program_term_idx";

-- DropIndex
DROP INDEX "public"."program_unique_term";

-- DropIndex
DROP INDEX "public"."subject_ProgramID_idx";

-- AlterTable
ALTER TABLE "gradelevel" ADD COLUMN     "ProgramID" INTEGER;

-- AlterTable
ALTER TABLE "program" DROP COLUMN "AcademicYear",
DROP COLUMN "Semester",
ADD COLUMN     "Description" TEXT,
ADD COLUMN     "IsActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "MinTotalCredits" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "ProgramCode" TEXT NOT NULL,
ADD COLUMN     "Track" "ProgramTrack" NOT NULL,
ADD COLUMN     "Year" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "subject" DROP COLUMN "ProgramID",
ADD COLUMN     "ActivityType" "ActivityType",
ADD COLUMN     "Description" TEXT,
ADD COLUMN     "IsGraded" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "LearningArea" "LearningArea",
DROP COLUMN "Category",
ADD COLUMN     "Category" "SubjectCategory" NOT NULL DEFAULT 'CORE';

-- DropTable
DROP TABLE "public"."_gradelevelToprogram";

-- CreateTable
CREATE TABLE "program_subject" (
    "ProgramSubjectID" SERIAL NOT NULL,
    "ProgramID" INTEGER NOT NULL,
    "SubjectCode" TEXT NOT NULL,
    "Category" "SubjectCategory" NOT NULL,
    "IsMandatory" BOOLEAN NOT NULL DEFAULT true,
    "MinCredits" DOUBLE PRECISION NOT NULL,
    "MaxCredits" DOUBLE PRECISION,
    "SortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "program_subject_pkey" PRIMARY KEY ("ProgramSubjectID")
);

-- CreateIndex
CREATE INDEX "program_subject_ProgramID_idx" ON "program_subject"("ProgramID");

-- CreateIndex
CREATE INDEX "program_subject_SubjectCode_idx" ON "program_subject"("SubjectCode");

-- CreateIndex
CREATE INDEX "program_subject_Category_idx" ON "program_subject"("Category");

-- CreateIndex
CREATE UNIQUE INDEX "program_subject_unique" ON "program_subject"("ProgramID", "SubjectCode");

-- CreateIndex
CREATE INDEX "gradelevel_ProgramID_idx" ON "gradelevel"("ProgramID");

-- CreateIndex
CREATE INDEX "gradelevel_Year_idx" ON "gradelevel"("Year");

-- CreateIndex
CREATE UNIQUE INDEX "gradelevel_year_number_unique" ON "gradelevel"("Year", "Number");

-- CreateIndex
CREATE UNIQUE INDEX "program_ProgramCode_key" ON "program"("ProgramCode");

-- CreateIndex
CREATE INDEX "program_Year_idx" ON "program"("Year");

-- CreateIndex
CREATE INDEX "program_IsActive_idx" ON "program"("IsActive");

-- CreateIndex
CREATE UNIQUE INDEX "program_year_track_unique" ON "program"("Year", "Track");

-- CreateIndex
CREATE INDEX "subject_Category_idx" ON "subject"("Category");

-- CreateIndex
CREATE INDEX "subject_LearningArea_idx" ON "subject"("LearningArea");

-- CreateIndex
CREATE INDEX "subject_ActivityType_idx" ON "subject"("ActivityType");

-- AddForeignKey
ALTER TABLE "gradelevel" ADD CONSTRAINT "fk_gradelevel_program" FOREIGN KEY ("ProgramID") REFERENCES "program"("ProgramID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_subject" ADD CONSTRAINT "fk_program_subject_program" FOREIGN KEY ("ProgramID") REFERENCES "program"("ProgramID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_subject" ADD CONSTRAINT "fk_program_subject_subject" FOREIGN KEY ("SubjectCode") REFERENCES "subject"("SubjectCode") ON DELETE CASCADE ON UPDATE CASCADE;
