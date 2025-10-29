-- CreateEnum
CREATE TYPE "day_of_week" AS ENUM ('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN');

-- CreateEnum
CREATE TYPE "subject_credit" AS ENUM ('CREDIT_05', 'CREDIT_10', 'CREDIT_15', 'CREDIT_20');

-- CreateEnum
CREATE TYPE "semester" AS ENUM ('SEMESTER_1', 'SEMESTER_2');

-- CreateEnum
CREATE TYPE "breaktime" AS ENUM ('BREAK_JUNIOR', 'BREAK_SENIOR', 'BREAK_BOTH', 'NOT_BREAK');

-- CreateTable
CREATE TABLE "class_schedule" (
    "ClassID" TEXT NOT NULL,
    "TimeslotID" TEXT NOT NULL,
    "SubjectCode" TEXT NOT NULL,
    "RoomID" INTEGER,
    "GradeID" TEXT NOT NULL,
    "IsLocked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "class_schedule_pkey" PRIMARY KEY ("ClassID")
);

-- CreateTable
CREATE TABLE "gradelevel" (
    "GradeID" TEXT NOT NULL,
    "Year" INTEGER NOT NULL,
    "Number" INTEGER NOT NULL,

    CONSTRAINT "gradelevel_pkey" PRIMARY KEY ("GradeID")
);

-- CreateTable
CREATE TABLE "room" (
    "RoomID" SERIAL NOT NULL,
    "RoomName" TEXT NOT NULL,
    "Building" TEXT NOT NULL DEFAULT '-',
    "Floor" TEXT NOT NULL DEFAULT '-',

    CONSTRAINT "room_pkey" PRIMARY KEY ("RoomID")
);

-- CreateTable
CREATE TABLE "subject" (
    "SubjectCode" TEXT NOT NULL,
    "SubjectName" TEXT NOT NULL,
    "Credit" "subject_credit" NOT NULL,
    "Category" TEXT NOT NULL DEFAULT '-',
    "ProgramID" INTEGER,

    CONSTRAINT "subject_pkey" PRIMARY KEY ("SubjectCode")
);

-- CreateTable
CREATE TABLE "program" (
    "ProgramID" SERIAL NOT NULL,
    "ProgramName" TEXT NOT NULL,
    "Semester" "semester" NOT NULL,

    CONSTRAINT "program_pkey" PRIMARY KEY ("ProgramID")
);

-- CreateTable
CREATE TABLE "teacher" (
    "TeacherID" SERIAL NOT NULL,
    "Prefix" TEXT NOT NULL,
    "Firstname" TEXT NOT NULL,
    "Lastname" TEXT NOT NULL,
    "Department" TEXT NOT NULL DEFAULT '-',
    "Email" TEXT NOT NULL,
    "Role" TEXT NOT NULL DEFAULT 'teacher',

    CONSTRAINT "teacher_pkey" PRIMARY KEY ("TeacherID")
);

-- CreateTable
CREATE TABLE "timeslot" (
    "TimeslotID" TEXT NOT NULL,
    "AcademicYear" INTEGER NOT NULL,
    "Semester" "semester" NOT NULL,
    "StartTime" TIME(0) NOT NULL,
    "EndTime" TIME(0) NOT NULL,
    "Breaktime" "breaktime" NOT NULL,
    "DayOfWeek" "day_of_week" NOT NULL,

    CONSTRAINT "timeslot_pkey" PRIMARY KEY ("TimeslotID")
);

-- CreateTable
CREATE TABLE "teachers_responsibility" (
    "RespID" SERIAL NOT NULL,
    "TeacherID" INTEGER NOT NULL,
    "GradeID" TEXT NOT NULL,
    "SubjectCode" TEXT NOT NULL,
    "AcademicYear" INTEGER NOT NULL,
    "Semester" "semester" NOT NULL,
    "TeachHour" INTEGER NOT NULL,

    CONSTRAINT "teachers_responsibility_pkey" PRIMARY KEY ("RespID")
);

-- CreateTable
CREATE TABLE "table_config" (
    "ConfigID" TEXT NOT NULL,
    "AcademicYear" INTEGER NOT NULL,
    "Semester" "semester" NOT NULL,
    "Config" JSONB NOT NULL,

    CONSTRAINT "table_config_pkey" PRIMARY KEY ("ConfigID")
);

-- CreateTable
CREATE TABLE "_class_scheduleToteachers_responsibility" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_class_scheduleToteachers_responsibility_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_gradelevelToprogram" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_gradelevelToprogram_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "class_schedule_GradeID_idx" ON "class_schedule"("GradeID");

-- CreateIndex
CREATE INDEX "class_schedule_RoomID_idx" ON "class_schedule"("RoomID");

-- CreateIndex
CREATE INDEX "class_schedule_SubjectCode_idx" ON "class_schedule"("SubjectCode");

-- CreateIndex
CREATE INDEX "class_schedule_TimeslotID_idx" ON "class_schedule"("TimeslotID");

-- CreateIndex
CREATE INDEX "class_schedule_timeslot_grade_idx" ON "class_schedule"("TimeslotID", "GradeID");

-- CreateIndex
CREATE INDEX "class_schedule_timeslot_room_idx" ON "class_schedule"("TimeslotID", "RoomID");

-- CreateIndex
CREATE INDEX "class_schedule_grade_locked_idx" ON "class_schedule"("GradeID", "IsLocked");

-- CreateIndex
CREATE UNIQUE INDEX "room_RoomName_key" ON "room"("RoomName");

-- CreateIndex
CREATE INDEX "subject_ProgramID_idx" ON "subject"("ProgramID");

-- CreateIndex
CREATE UNIQUE INDEX "program_ProgramName_key" ON "program"("ProgramName");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_Email_key" ON "teacher"("Email");

-- CreateIndex
CREATE INDEX "timeslot_term_day_idx" ON "timeslot"("AcademicYear", "Semester", "DayOfWeek");

-- CreateIndex
CREATE INDEX "teachers_responsibility_TeacherID_idx" ON "teachers_responsibility"("TeacherID");

-- CreateIndex
CREATE INDEX "teachers_responsibility_GradeID_idx" ON "teachers_responsibility"("GradeID");

-- CreateIndex
CREATE INDEX "teachers_responsibility_SubjectCode_idx" ON "teachers_responsibility"("SubjectCode");

-- CreateIndex
CREATE INDEX "teachers_responsibility_teacher_term_idx" ON "teachers_responsibility"("TeacherID", "AcademicYear", "Semester");

-- CreateIndex
CREATE INDEX "teachers_responsibility_grade_subject_term_idx" ON "teachers_responsibility"("GradeID", "SubjectCode", "AcademicYear", "Semester");

-- CreateIndex
CREATE INDEX "_class_scheduleToteachers_responsibility_B_index" ON "_class_scheduleToteachers_responsibility"("B");

-- CreateIndex
CREATE INDEX "_gradelevelToprogram_B_index" ON "_gradelevelToprogram"("B");

-- AddForeignKey
ALTER TABLE "class_schedule" ADD CONSTRAINT "fk_class_schedule_grade" FOREIGN KEY ("GradeID") REFERENCES "gradelevel"("GradeID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_schedule" ADD CONSTRAINT "fk_class_schedule_room" FOREIGN KEY ("RoomID") REFERENCES "room"("RoomID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_schedule" ADD CONSTRAINT "fk_class_schedule_subject" FOREIGN KEY ("SubjectCode") REFERENCES "subject"("SubjectCode") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_schedule" ADD CONSTRAINT "fk_class_schedule_timeslot" FOREIGN KEY ("TimeslotID") REFERENCES "timeslot"("TimeslotID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject" ADD CONSTRAINT "fk_subject_program" FOREIGN KEY ("ProgramID") REFERENCES "program"("ProgramID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teachers_responsibility" ADD CONSTRAINT "fk_teachers_responsibility_grade" FOREIGN KEY ("GradeID") REFERENCES "gradelevel"("GradeID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teachers_responsibility" ADD CONSTRAINT "fk_teachers_responsibility_subject" FOREIGN KEY ("SubjectCode") REFERENCES "subject"("SubjectCode") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teachers_responsibility" ADD CONSTRAINT "fk_teachers_responsibility_teacher" FOREIGN KEY ("TeacherID") REFERENCES "teacher"("TeacherID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_class_scheduleToteachers_responsibility" ADD CONSTRAINT "_class_scheduleToteachers_responsibility_A_fkey" FOREIGN KEY ("A") REFERENCES "class_schedule"("ClassID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_class_scheduleToteachers_responsibility" ADD CONSTRAINT "_class_scheduleToteachers_responsibility_B_fkey" FOREIGN KEY ("B") REFERENCES "teachers_responsibility"("RespID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_gradelevelToprogram" ADD CONSTRAINT "_gradelevelToprogram_A_fkey" FOREIGN KEY ("A") REFERENCES "gradelevel"("GradeID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_gradelevelToprogram" ADD CONSTRAINT "_gradelevelToprogram_B_fkey" FOREIGN KEY ("B") REFERENCES "program"("ProgramID") ON DELETE CASCADE ON UPDATE CASCADE;

