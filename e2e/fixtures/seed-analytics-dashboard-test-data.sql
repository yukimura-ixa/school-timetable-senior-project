-- Analytics Dashboard E2E Test Data Seed
-- Purpose: Create diverse test data for E2E testing of analytics dashboard
-- Usage: Run this in your test database before E2E tests
--
-- Creates:
-- - 15 semesters with varied properties
-- - 4 different statuses (draft, published, locked, archived)
-- - 3 completeness ranges (low <31%, medium 31-79%, high 80%+)
-- - 5 academic years (2564-2568)
-- - Recent access patterns (for "Recently Accessed" stat)
-- - Mix of pinned and unpinned semesters

-- Clean slate (optional - comment out if you want to keep existing data)
-- DELETE FROM semesters WHERE id BETWEEN 1000 AND 1015;

-- Insert test semesters
INSERT INTO semesters (
  id,
  academicYear,
  term,
  status,
  completeness,
  isPinned,
  lastAccessedAt,
  createdAt,
  updatedAt
) VALUES

-- ====================
-- PUBLISHED SEMESTERS (4)
-- ====================

-- High completeness, pinned, recently accessed
(1001, 2567, 1, 'published', 85, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- High completeness, not pinned, recently accessed
(1002, 2567, 2, 'published', 92, false, CURRENT_TIMESTAMP - INTERVAL '5 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- High completeness, pinned, old access
(1003, 2566, 2, 'published', 95, true, CURRENT_TIMESTAMP - INTERVAL '40 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Medium completeness, not pinned, recently accessed
(1004, 2566, 1, 'published', 67, false, CURRENT_TIMESTAMP - INTERVAL '10 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),


-- ====================
-- DRAFT SEMESTERS (4)
-- ====================

-- Low completeness, not pinned, recently accessed
(1005, 2568, 1, 'draft', 25, false, CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Low completeness, not pinned, recently accessed
(1006, 2568, 2, 'draft', 18, false, CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Medium completeness, not pinned, recently accessed
(1007, 2567, 3, 'draft', 45, false, CURRENT_TIMESTAMP - INTERVAL '15 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Medium completeness, pinned, recently accessed
(1008, 2565, 1, 'draft', 52, true, CURRENT_TIMESTAMP - INTERVAL '20 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),


-- ====================
-- LOCKED SEMESTERS (4)
-- ====================

-- High completeness (perfect), not pinned, old access
(1009, 2566, 3, 'locked', 100, false, CURRENT_TIMESTAMP - INTERVAL '50 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- High completeness, not pinned, old access
(1010, 2565, 2, 'locked', 88, false, CURRENT_TIMESTAMP - INTERVAL '80 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- High completeness, pinned, old access
(1011, 2565, 3, 'locked', 91, true, CURRENT_TIMESTAMP - INTERVAL '100 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Medium completeness, not pinned, old access
(1012, 2564, 1, 'locked', 74, false, CURRENT_TIMESTAMP - INTERVAL '120 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),


-- ====================
-- ARCHIVED SEMESTERS (3)
-- ====================

-- Medium completeness, not pinned, very old access
(1013, 2564, 2, 'archived', 78, false, CURRENT_TIMESTAMP - INTERVAL '200 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- High completeness, not pinned, very old access
(1014, 2564, 3, 'archived', 89, false, CURRENT_TIMESTAMP - INTERVAL '250 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Medium completeness, not pinned, very old access
(1015, 2563, 1, 'archived', 63, false, CURRENT_TIMESTAMP - INTERVAL '300 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);


-- ====================
-- EXPECTED TEST RESULTS
-- ====================

/*
Total Semesters: 15

Status Distribution:
- Draft:     4 (26.7%)
- Published: 4 (26.7%)
- Locked:    4 (26.7%)
- Archived:  3 (20.0%)

Completeness Distribution:
- Low (<31%):       2 (13.3%) - IDs: 1005, 1006
- Medium (31-79%):  6 (40.0%) - IDs: 1004, 1007, 1008, 1012, 1013, 1015
- High (80%+):      7 (46.7%) - IDs: 1001, 1002, 1003, 1009, 1010, 1011, 1014

Average Completeness: ~67.5%

Pinned Semesters: 5 (33.3%) - IDs: 1001, 1003, 1008, 1011

Recently Accessed (last 30 days): 8 (53.3%) - IDs: 1001-1008

Academic Year Distribution:
- 2568: 2 (13.3%)
- 2567: 3 (20.0%)
- 2566: 3 (20.0%)
- 2565: 3 (20.0%)
- 2564: 3 (20.0%)
- 2563: 1 (6.7%)

Top 5 Years (for display):
1. 2567: 3 semesters (20.0%)
2. 2566: 3 semesters (20.0%)
3. 2565: 3 semesters (20.0%)
4. 2564: 3 semesters (20.0%)
5. 2568: 2 semesters (13.3%)

Note: Resource totals (classes, teachers, subjects, rooms) will be 0
unless you also seed those tables. Dashboard will show 0 for those stats.
*/


-- ====================
-- OPTIONAL: ADD RESOURCE DATA
-- ====================

-- If you want to test resource totals, uncomment and adjust these:

/*
-- Example classes (adjust table/column names as needed)
INSERT INTO classes (id, name, semesterId, createdAt, updatedAt) VALUES
(2001, 'ม.4/1', 1001, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2002, 'ม.4/2', 1001, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2003, 'ม.5/1', 1002, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Example teachers (adjust table/column names as needed)
INSERT INTO teachers (id, name, email, createdAt, updatedAt) VALUES
(3001, 'ครูสมชาย', 'somchai@test.local', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3002, 'ครูสมหญิง', 'somying@test.local', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Example subjects (adjust table/column names as needed)
INSERT INTO subjects (id, name, code, createdAt, updatedAt) VALUES
(4001, 'คณิตศาสตร์', 'M101', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4002, 'วิทยาศาสตร์', 'S101', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4003, 'ภาษาไทย', 'T101', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Example rooms (adjust table/column names as needed)
INSERT INTO rooms (id, name, capacity, createdAt, updatedAt) VALUES
(5001, '301', 40, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5002, '302', 40, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5003, 'ห้องปฏิบัติการ', 30, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
*/


-- ====================
-- VERIFICATION QUERIES
-- ====================

-- Run these after seeding to verify data:

-- Check total count
SELECT COUNT(*) AS total_semesters FROM semesters WHERE id BETWEEN 1001 AND 1015;

-- Check status distribution
SELECT status, COUNT(*) AS count, ROUND(COUNT(*) * 100.0 / 15, 1) AS percentage
FROM semesters 
WHERE id BETWEEN 1001 AND 1015
GROUP BY status
ORDER BY count DESC;

-- Check completeness distribution
SELECT 
  CASE 
    WHEN completeness < 31 THEN 'Low (<31%)'
    WHEN completeness BETWEEN 31 AND 79 THEN 'Medium (31-79%)'
    ELSE 'High (80%+)'
  END AS completeness_range,
  COUNT(*) AS count,
  ROUND(COUNT(*) * 100.0 / 15, 1) AS percentage
FROM semesters
WHERE id BETWEEN 1001 AND 1015
GROUP BY completeness_range
ORDER BY 
  CASE completeness_range
    WHEN 'Low (<31%)' THEN 1
    WHEN 'Medium (31-79%)' THEN 2
    ELSE 3
  END;

-- Check average completeness
SELECT ROUND(AVG(completeness), 1) AS avg_completeness
FROM semesters
WHERE id BETWEEN 1001 AND 1015;

-- Check pinned count
SELECT COUNT(*) AS pinned_count
FROM semesters
WHERE id BETWEEN 1001 AND 1015 AND isPinned = true;

-- Check recently accessed (last 30 days)
SELECT COUNT(*) AS recently_accessed
FROM semesters
WHERE id BETWEEN 1001 AND 1015 
AND lastAccessedAt >= CURRENT_TIMESTAMP - INTERVAL '30 days';

-- Check academic year distribution
SELECT academicYear, COUNT(*) AS count, ROUND(COUNT(*) * 100.0 / 15, 1) AS percentage
FROM semesters
WHERE id BETWEEN 1001 AND 1015
GROUP BY academicYear
ORDER BY count DESC, academicYear DESC
LIMIT 5;


-- ====================
-- CLEANUP (use when done testing)
-- ====================

-- DELETE FROM semesters WHERE id BETWEEN 1001 AND 1015;
-- DELETE FROM classes WHERE id BETWEEN 2001 AND 2003;
-- DELETE FROM teachers WHERE id BETWEEN 3001 AND 3002;
-- DELETE FROM subjects WHERE id BETWEEN 4001 AND 4003;
-- DELETE FROM rooms WHERE id BETWEEN 5001 AND 5003;
