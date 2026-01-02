-- Add missing indexes for query optimization
-- Created: Jan 2, 2025
-- Purpose: Improve performance for frequently-queried patterns
-- Risk: NONE (non-breaking, additive only)

-- 1. Add composite index on table_config for AcademicYear + Semester queries
-- Improves: Dashboard semester filtering, config lookups
CREATE INDEX IF NOT EXISTS "table_config_year_semester_idx" ON "table_config"("AcademicYear", "Semester");

-- 2. Add index on User.createdAt for user analytics and sorting
-- Improves: Admin dashboards, user history reports
DO $$
BEGIN
	IF EXISTS (
		SELECT 1 FROM pg_class c
		JOIN pg_namespace n ON n.oid = c.relnamespace
		WHERE c.relname = 'User' AND n.nspname = current_schema()
	) THEN
		CREATE INDEX IF NOT EXISTS "user_created_at_idx" ON "User"("createdAt");
	END IF;
END $$;

-- 3. Add single-field index on timeslot.AcademicYear for year-wide queries
-- Improves: Queries filtering by academic year only (not semester)
CREATE INDEX IF NOT EXISTS "timeslot_year_idx" ON "timeslot"("AcademicYear");

-- 4. Add composite index on teachers_responsibility for GradeID + Semester
-- Improves: Lock feature queries, grade-level conflict detection
CREATE INDEX IF NOT EXISTS "teachers_responsibility_grade_semester_idx" ON "teachers_responsibility"("GradeID", "Semester");

-- Note: Existing indexes on frequently-queried fields are already optimal:
-- - class_schedule: GradeID, RoomID, SubjectCode, TimeslotID (all present)
-- - teacher: Department (present)
-- - subject: Category, LearningArea, ActivityType (all present)
-- - program: Year, IsActive (all present)
-- - EmailOutbox: Comprehensive coverage (all present)
