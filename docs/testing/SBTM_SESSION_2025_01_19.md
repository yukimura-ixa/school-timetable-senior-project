# SBTM Exploratory Testing Session Report

**Session Date:** 2025-01-19  
**Tester:** GitHub Copilot (AI-assisted QA)  
**Environment:** Production (https://phrasongsa-timetable.vercel.app)  
**Duration:** ~45 minutes (shortened due to blocked Admin login)  
**Build/Commit:** Unknown (production deployment)

---

## Session Charter

**Mission:** Explore the Admin experience end-to-end (plus Guest fallback) to discover high-risk issues in:
1. Scheduling workflows
2. Role-based access
3. UX quality and visual correctness
4. Reliability under interruptions

---

## Areas Covered

| Area | Coverage | Notes |
|------|----------|-------|
| Home Page (Guest) | ✅ Full | Stats, search, tabs, pagination |
| Teacher Schedule View | ✅ Full | Empty schedule, timezone issue |
| Class Schedule View | ❌ Blocked | All routes return 404 |
| Sign-in Page | ✅ Full | Email/password + Google OAuth |
| Admin Dashboard | ❌ Blocked | Requires authentication |
| Management Pages | ❌ Blocked | Correctly requires auth |
| Mobile Responsiveness | ✅ Partial | Home page only |

---

## Bug Summary (Prioritized)

### 🔴 P0 - Critical

| ID | Bug | Impact | Status |
|----|-----|--------|--------|
| BUG-4 | **Time slots display in UTC instead of Thai local time** | Period times show nonsensical hours (e.g., คาบ 1: 01:30-02:20 instead of 08:30-09:20). Timetables are unusable for end users. | Matches GitHub Issue #198 |

### 🟠 P1 - High

| ID | Bug | Impact | Status |
|----|-----|--------|--------|
| BUG-1 | **"ดูตารางสอนตัวอย่าง" sample link leads to 404** | Home page CTA broken - `/teachers/1-2567` returns 404. Bad first impression. | NEW |
| BUG-2 | **Management sidebar links visible to Guest users** | All admin menu items (ข้อมูลครู, ข้อมูลวิชา, etc.) shown to unauthenticated users. Security/UX concern. | NEW |
| BUG-3 | **All class schedule routes return 404** | `/classes/101/2568/1` linked from home page returns 404. Core feature broken. | NEW |
| BUG-5 | **Negative period numbers in schedule grid** | Schedule shows คาบ -8, คาบ -7, etc. Confusing/incorrect period numbering. | NEW |

### 🟡 P2 - Medium

| ID | Bug | Impact | Status |
|----|-----|--------|--------|
| BUG-6 | **E2E test data pollution in production** | Test records (นายE2E-Teacher-*) visible in production teacher list. Unprofessional. | NEW |
| BUG-7 | **Duplicate teacher records** | Multiple teachers have identical names (นางมาลี สุขใจ, นายสมชาย ใจดี appear 2x). Data integrity issue. | NEW |
| BUG-8 | **404 page "กลับหน้าหลัก" link broken** | Uses `href="#"` instead of proper route. | NEW |
| BUG-9 | **All teacher/class utilization shows 0%** | Semester 1/2568 shows no schedule data for all 53 teachers and 22 classes. | May be intentional (no data) |

---

## Observations (Non-Bugs)

1. **Search functionality works well** - Real-time filtering by Thai text works correctly
2. **Pagination present** - Shows "1 ถึง 25 จาก 53 รายการ" with working Previous/Next
3. **Stats cards display correctly** - 53 teachers, 22 classrooms, 51 rooms, 132 subjects, 20 programs
4. **Tab switching works** - Teachers / Classes tabs function correctly
5. **Auth redirect works** - Management routes correctly redirect to signin
6. **Mobile layout acceptable** - Table scrolls horizontally on 375px width
7. **Thai localization good** - UI text properly in Thai throughout

---

## Session Limitations

1. **Admin flows not tested** - Could not authenticate (no test credentials for prod)
2. **Scheduling CRUD not tested** - Requires Admin access
3. **Conflict detection not tested** - Requires Admin access
4. **Export functionality not tested** - Requires Admin access
5. **Logout flow not tested** - Was not authenticated

---

## Automation Backlog (Proposed Playwright Tests)

| Priority | Test Name | Description |
|----------|-----------|-------------|
| P0 | `verify-period-times-thai-timezone.spec.ts` | Assert that period times display in ICT (UTC+7) range 08:00-17:00 |
| P1 | `sample-schedule-link.spec.ts` | Assert home page sample link navigates to valid schedule |
| P1 | `guest-sidebar-visibility.spec.ts` | Assert management menu items hidden for unauthenticated users |
| P1 | `class-schedule-routes.spec.ts` | Assert `/classes/{id}/{semester}` routes render schedules |
| P2 | `period-numbering.spec.ts` | Assert all period numbers are positive (1-16) |
| P2 | `no-test-data-in-prod.spec.ts` | Assert no "E2E-" prefixed records in production |
| P2 | `404-page-back-link.spec.ts` | Assert 404 page back link navigates to `/` |
| P3 | `teacher-search-filter.spec.ts` | Assert search filters teachers by name/department |
| P3 | `mobile-responsive-home.spec.ts` | Assert home page renders correctly at 375px width |
| P3 | `duplicate-teachers-check.spec.ts` | Assert no duplicate teacher names in listing |

---

## Recommendations

### Immediate (Before Launch)

1. **Fix UTC timezone rendering (BUG-4)** - This is a showstopper
2. **Fix sample schedule link (BUG-1)** - Bad first impression
3. **Fix class schedule 404s (BUG-3)** - Core feature broken
4. **Clean E2E test data from production (BUG-6)** - Run cleanup script

### Short-term

1. **Hide admin sidebar for guests (BUG-2)** - Security best practice
2. **Fix negative period numbers (BUG-5)** - Data/seed issue
3. **Fix 404 page link (BUG-8)** - UX polish

### Long-term

1. **Investigate duplicate teacher data** - Database integrity audit
2. **Add semester switching UI** - Currently hardcoded to 1-2568
3. **Add empty state messaging** - Explain why 0% utilization

---

## Related GitHub Issues

| Issue | Status | Connection |
|-------|--------|------------|
| #198 | Open | BUG-4 (UTC timezone) - confirmed in this session |
| #199 | Open | Dashboard sidebar context - related to BUG-2 |
| #200 | Open | Student table issues - not tested |
| #201 | Open | Logout fails - not tested (no auth) |

---

## Session Metrics

- **Time Spent:** ~45 minutes
- **Bugs Found:** 9 (1 P0, 4 P1, 4 P2)
- **Bugs Confirmed:** 1 (GitHub #198)
- **Automation Items Proposed:** 10
- **Coverage:** Limited (Guest-only, no Admin access)

---

## Next Session Recommendations

1. **Run against local dev** - Use test credentials to access Admin flows
2. **Focus on scheduling CRUD** - Core admin workflow
3. **Test conflict detection** - Critical business logic
4. **Test export functionality** - Official document generation
5. **Run with network throttling** - Test slow connection behavior

---

*Session completed: 2025-01-19*
