/*
  Warnings:

  - The primary key for the `_class_scheduleToteachers_responsibility` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `class_schedule` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `ClassID` column on the `class_schedule` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[DisplayID]` on the table `gradelevel` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `A` on the `_class_scheduleToteachers_responsibility` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `DisplayID` to the `gradelevel` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_class_scheduleToteachers_responsibility" DROP CONSTRAINT "_class_scheduleToteachers_responsibility_A_fkey";

-- AlterTable
ALTER TABLE "_class_scheduleToteachers_responsibility" DROP CONSTRAINT "_class_scheduleToteachers_responsibility_AB_pkey",
DROP COLUMN "A",
ADD COLUMN     "A" INTEGER NOT NULL,
ADD CONSTRAINT "_class_scheduleToteachers_responsibility_AB_pkey" PRIMARY KEY ("A", "B");

-- AlterTable
ALTER TABLE "class_schedule" DROP CONSTRAINT "class_schedule_pkey",
DROP COLUMN "ClassID",
ADD COLUMN     "ClassID" SERIAL NOT NULL,
ADD CONSTRAINT "class_schedule_pkey" PRIMARY KEY ("ClassID");

-- AlterTable
ALTER TABLE "gradelevel" ADD COLUMN     "DisplayID" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "gradelevel_DisplayID_key" ON "gradelevel"("DisplayID");

-- AddForeignKey
ALTER TABLE "_class_scheduleToteachers_responsibility" ADD CONSTRAINT "_class_scheduleToteachers_responsibility_A_fkey" FOREIGN KEY ("A") REFERENCES "class_schedule"("ClassID") ON DELETE CASCADE ON UPDATE CASCADE;
