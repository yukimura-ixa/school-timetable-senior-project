-- AlterEnum
ALTER TYPE "breaktime" ADD VALUE 'BREAK';

-- CreateTable
CREATE TABLE "break_group" (
    "BreakGroupID" SERIAL NOT NULL,
    "Name" TEXT NOT NULL,
    "Label" TEXT NOT NULL,
    "Color" TEXT NOT NULL DEFAULT '#9E9E9E',
    "ConfigID" TEXT NOT NULL,

    CONSTRAINT "break_group_pkey" PRIMARY KEY ("BreakGroupID")
);

-- CreateTable
CREATE TABLE "break_group_grade" (
    "BreakGroupGradeID" SERIAL NOT NULL,
    "BreakGroupID" INTEGER NOT NULL,
    "GradeID" TEXT NOT NULL,

    CONSTRAINT "break_group_grade_pkey" PRIMARY KEY ("BreakGroupGradeID")
);

-- CreateIndex
CREATE INDEX "break_group_ConfigID_idx" ON "break_group"("ConfigID");

-- CreateIndex
CREATE UNIQUE INDEX "break_group_config_name_unique" ON "break_group"("ConfigID", "Name");

-- CreateIndex
CREATE INDEX "break_group_grade_BreakGroupID_idx" ON "break_group_grade"("BreakGroupID");

-- CreateIndex
CREATE INDEX "break_group_grade_GradeID_idx" ON "break_group_grade"("GradeID");

-- CreateIndex
CREATE UNIQUE INDEX "break_group_grade_BreakGroupID_GradeID_key" ON "break_group_grade"("BreakGroupID", "GradeID");

-- AddForeignKey
ALTER TABLE "break_group" ADD CONSTRAINT "break_group_ConfigID_fkey" FOREIGN KEY ("ConfigID") REFERENCES "table_config"("ConfigID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "break_group_grade" ADD CONSTRAINT "break_group_grade_BreakGroupID_fkey" FOREIGN KEY ("BreakGroupID") REFERENCES "break_group"("BreakGroupID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "break_group_grade" ADD CONSTRAINT "break_group_grade_GradeID_fkey" FOREIGN KEY ("GradeID") REFERENCES "gradelevel"("GradeID") ON DELETE CASCADE ON UPDATE CASCADE;
