/*
  Warnings:

  - A unique constraint covering the columns `[ProgramName,Semester,AcademicYear]` on the table `program` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `AcademicYear` to the `program` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SemesterStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'LOCKED', 'ARCHIVED');

-- DropIndex
DROP INDEX "public"."program_ProgramName_key";

-- AlterTable
ALTER TABLE "program" ADD COLUMN     "AcademicYear" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "table_config" ADD COLUMN     "configCompleteness" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isPinned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastAccessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "status" "SemesterStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "program_term_idx" ON "program"("AcademicYear", "Semester");

-- CreateIndex
CREATE UNIQUE INDEX "program_unique_term" ON "program"("ProgramName", "Semester", "AcademicYear");

-- CreateIndex
CREATE INDEX "table_config_status_idx" ON "table_config"("status");

-- CreateIndex
CREATE INDEX "table_config_pinned_idx" ON "table_config"("isPinned");

-- CreateIndex
CREATE INDEX "table_config_accessed_idx" ON "table_config"("lastAccessedAt");
