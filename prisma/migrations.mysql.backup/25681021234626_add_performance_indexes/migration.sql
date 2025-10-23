-- Add performance indexes for conflict detection queries
-- These indexes optimize the conflict detection service created in Phase 2

-- class_schedule: Composite index for checking class conflicts (same grade + timeslot)
CREATE INDEX `class_schedule_timeslot_grade_idx` ON `class_schedule`(`TimeslotID`, `GradeID`);

-- class_schedule: Composite index for checking room conflicts (same room + timeslot)
CREATE INDEX `class_schedule_timeslot_room_idx` ON `class_schedule`(`TimeslotID`, `RoomID`);

-- class_schedule: Composite index for finding locked schedules by grade
CREATE INDEX `class_schedule_grade_locked_idx` ON `class_schedule`(`GradeID`, `IsLocked`);

-- timeslot: Composite index for finding all timeslots in a term/semester
CREATE INDEX `timeslot_term_day_idx` ON `timeslot`(`AcademicYear`, `Semester`, `DayOfWeek`);

-- teachers_responsibility: Composite index for finding teacher's assignments in a term
CREATE INDEX `teachers_responsibility_teacher_term_idx` ON `teachers_responsibility`(`TeacherID`, `AcademicYear`, `Semester`);

-- teachers_responsibility: Composite index for finding grade/subject assignments in a term
CREATE INDEX `teachers_responsibility_grade_subject_term_idx` ON `teachers_responsibility`(`GradeID`, `SubjectCode`, `AcademicYear`, `Semester`);
