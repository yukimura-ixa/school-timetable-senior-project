/*
  Warnings:

  - A unique constraint covering the columns `[TimeslotID,GradeID]` on the table `class_schedule` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[TimeslotID,RoomID]` on the table `class_schedule` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[TeacherID,GradeID,SubjectCode,AcademicYear,Semester]` on the table `teachers_responsibility` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "class_schedule_timeslot_grade_idx";

-- DropIndex
DROP INDEX "class_schedule_timeslot_room_idx";

-- DropIndex
DROP INDEX "teachers_responsibility_grade_subject_term_idx";

-- CreateIndex
CREATE UNIQUE INDEX "class_schedule_timeslot_grade_unique" ON "class_schedule"("TimeslotID", "GradeID");

-- CreateIndex
CREATE UNIQUE INDEX "class_schedule_timeslot_room_unique" ON "class_schedule"("TimeslotID", "RoomID");

-- CreateIndex
CREATE INDEX "program_subject_IsMandatory_idx" ON "program_subject"("IsMandatory");

-- CreateIndex
CREATE INDEX "teacher_Department_idx" ON "teacher"("Department");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_responsibility_unique" ON "teachers_responsibility"("TeacherID", "GradeID", "SubjectCode", "AcademicYear", "Semester");
