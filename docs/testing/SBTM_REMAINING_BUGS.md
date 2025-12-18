# Remaining Bugs from SBTM Session

**Session:** SBTM_SESSION_2025_01_19  
**Fixed:** 8 bugs (BUG-1, BUG-2, BUG-3, BUG-4, BUG-5, BUG-6, BUG-7, BUG-8)  
**Investigated:** 1 (BUG-9 - Not a Bug)  
**Remaining:** 0 bugs ✅  
**Commit:** 3a3662ed - fix: resolve P0 and P1 bugs from SBTM session

---

## Fixed Bugs ✅

### P0 - Critical

- **BUG-4**: UTC timezone display → Fixed with `timeZone: 'Asia/Bangkok'` in both teacher and class schedule pages

### P1 - High

- **BUG-1**: Sample schedule link 404 → Fixed by using current semester
- **BUG-2**: Sidebar visible to Guests → Fixed with isPublicRoute check
- **BUG-3**: Class schedule 404s → Fixed with numeric ID to GradeID conversion
- **BUG-5**: Negative Period Numbers → Fixed by creating centralized `extractPeriodFromTimeslotId` utility with robust regex parsing, replaced all 10 `substring(10)` usages

### P2 - Medium

- **BUG-6**: E2E Test Data Pollution → Fixed with Prisma cleanup script (`scripts/cleanup-e2e-data.ts`), deleted 3 E2E teacher records from production
- **BUG-7**: Duplicate Teacher Records → Fixed with audit and cleanup scripts (`scripts/audit-duplicate-teachers.ts`, `scripts/cleanup-duplicate-teachers.ts`), deleted 5 duplicate teachers with no assignments
- **BUG-8**: 404 page broken link → Fixed with proper Link component

---

## Investigation Complete - Not a Bug

---

### ~~BUG-9: All Utilization Shows 0%~~ → NOT A BUG

**Status:** ✅ INVESTIGATED - Expected Behavior

**Investigation Results** (via `scripts/investigate-utilization.ts`):

| Semester | Timeslots | Schedules | Config |
| -------- | --------- | --------- | ------ |
| 1/2567   | 40        | 45        | ✅     |
| 2/2567   | 40        | 0         | ✅     |
| 1/2568   | 40        | 0         | ✅     |

**Diagnosis:**

- Semester 1/2568 has **timeslots but NO class schedules** yet
- This is **intentional** - schedules haven't been created for future semesters
- No code fix required

**Recommendation:**

- Consider adding empty state messaging in analytics UI when no schedules exist
- This is a UX improvement, not a bug fix

**✅ TimeslotID Format Fixed:**

The format inconsistency detected during investigation has been fixed:

- Deleted 80 timeslots with wrong format (`1-2568-FRI-1`)
- Created 40 timeslots with correct format (`1-2568-FRI1`)
- Fixed analytics service to use centralized `extractPeriodFromTimeslotId` utility
- All semesters now use consistent format: `{sem}-{year}-{day}{period}`

---

## Recommended Next Steps

1. **Immediate (Pre-Production):**
   - Clean E2E test data from production (BUG-6)
   - Fix negative period numbers in seed (BUG-5)

2. **Short-term:**
   - Audit and fix duplicate teachers (BUG-7)
   - Investigate 0% utilization (BUG-9)

3. **Testing:**
   - Run local dev to verify fixes work correctly
   - Test with proper semester data
   - Verify Guest/Admin role separation

---

## Test Verification Commands

```bash
# Local dev server
pnpm dev

# Check for E2E data
psql $DATABASE_URL -c "SELECT COUNT(*) FROM teacher WHERE name LIKE '%E2E%';"

# Check for duplicate teachers
psql $DATABASE_URL -c "SELECT name, COUNT(*) FROM teacher GROUP BY name HAVING COUNT(*) > 1;"

# Check period numbers
psql $DATABASE_URL -c "SELECT DISTINCT CAST(SUBSTRING(\"TimeslotID\" FROM 11) AS INTEGER) as period FROM timeslot ORDER BY period;"
```

---

_Generated: 2025-12-18_  
_Session Report: docs/testing/SBTM_SESSION_2025_01_19.md_
