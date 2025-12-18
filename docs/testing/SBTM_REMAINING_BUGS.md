# Remaining Bugs from SBTM Session

**Session:** SBTM_SESSION_2025_01_19  
**Fixed:** 5 bugs (BUG-1, BUG-2, BUG-3, BUG-4, BUG-8)  
**Remaining:** 4 bugs  
**Commit:** 3a3662ed - fix: resolve P0 and P1 bugs from SBTM session

---

## Fixed Bugs ✅

### P0 - Critical
- **BUG-4**: UTC timezone display → Fixed with `timeZone: 'Asia/Bangkok'` in both teacher and class schedule pages

### P1 - High  
- **BUG-1**: Sample schedule link 404 → Fixed by using current semester
- **BUG-2**: Sidebar visible to Guests → Fixed with isPublicRoute check
- **BUG-3**: Class schedule 404s → Fixed with numeric ID to GradeID conversion

### P2 - Medium
- **BUG-8**: 404 page broken link → Fixed with proper Link component

---

## Remaining Bugs (Need Data/Cleanup Work)

### P1 - High

#### BUG-5: Negative Period Numbers
**Description:** Schedule shows คาบ -8, คาบ -7, etc.  
**Impact:** Confusing UX, incorrect period numbering  
**Root Cause:** Seed data issue - timeslots have negative slot numbers  
**Fix Required:** 
1. Update seed data to use positive period numbers (1-16)
2. Migration script to fix existing timeslots
3. Validation to prevent negative period numbers

**Files to Check:**
- `prisma/seed.ts` (or seed data source)
- Timeslot creation logic
- Period number validation

---

### P2 - Medium

#### BUG-6: E2E Test Data Pollution
**Description:** Production shows นายE2E-Teacher-* records  
**Impact:** Unprofessional appearance, data integrity  
**Root Cause:** E2E tests writing to production database  
**Fix Required:**
1. Database cleanup script to remove E2E-* records
2. Update E2E setup to use test database only
3. Add seed/migration guards to prevent test data in prod

**Files to Check:**
- E2E test setup/teardown
- Database connection configuration for tests
- Vercel environment variables

---

#### BUG-7: Duplicate Teacher Records
**Description:** Teachers with identical names (นางมาลี สุขใจ appears 2x with IDs 619, 613)  
**Impact:** Data integrity, confusing for users  
**Root Cause:** Seed data or migration issue creating duplicates  
**Fix Required:**
1. Database audit query to find all duplicates
2. Manual merge/deletion of duplicate records
3. Add unique constraint if appropriate
4. Fix seed data source

**SQL Query:**
```sql
SELECT name, COUNT(*) as count 
FROM teacher 
GROUP BY name 
HAVING COUNT(*) > 1;
```

---

#### BUG-9: All Utilization Shows 0%
**Description:** Semester 1/2568 shows no schedule data  
**Impact:** Depends - may be intentional (no data for that semester)  
**Root Cause:** Either missing schedule data or data is for different semester  
**Investigation Required:**
1. Check if semester 1/2568 is the "current" semester
2. Verify schedule data exists for this semester in DB
3. If intentional, add empty state messaging

**Files to Check:**
- Schedule assignment data
- Semester configuration
- Statistics calculation logic

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

*Generated: 2025-12-18*  
*Session Report: docs/testing/SBTM_SESSION_2025_01_19.md*
