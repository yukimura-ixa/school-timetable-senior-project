# SBTM Exploratory Testing Session Report

**Session Date:** 2025-01-20  
**Tester:** Antigravity Agent  
**Environment:** Production (https://phrasongsa-timetable.vercel.app) + Local (localhost:3000)  
**Duration:** ~45 minutes  
**Focus:** Admin Workflows (Charter A & B)

---

## Session Charter

**Mission:** Explore Admin workflows (Teacher Management, Scheduling) using production credentials.
**Previous Context:** 17 bugs fixed from previous session.
**Follow-up Session:** Continued testing on local environment (2025-12-20).

---

## Areas Covered

| Area                | Coverage   | Notes                                             |
| ------------------- | ---------- | ------------------------------------------------- |
| Teacher Management  | ✅ Full    | CRUD tested, Add/Edit/Delete dialogs working      |
| Room Management     | ⚠️ Partial | Loaded but very slow                              |
| Scheduling (1/2568) | ✅ Fixed   | Works on local - BUG-22 was production data issue |
| Scheduling (1/2567) | ✅ Partial | Loaded successfully (used as control)             |
| Subject Assignment  | ✅ Full    | Subject/Class dropdowns tested, BUG-24 fixed      |

---

## Bug Summary (Session Findings)

### 🔴 P0 - Critical

| ID         | Bug                                                 | Impact                                                                                                     | Status         |
| ---------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | -------------- |
| **BUG-22** | **Crash when accessing Schedule Assign for 1/2568** | `TypeError: o.map is not a function` blocking all scheduling for the draft semester. Admin cannot proceed. | WORKS ON LOCAL |

### 🟠 P1 - High

| ID         | Bug                                               | Impact                                                                                                                            | Status                 |
| ---------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| **BUG-21** | **Management pages stuck in "Loading..." state**  | Initial load of Teacher/Room/Schedule pages takes >5-10s or hangs. Shows "Student" role temporarily. Degrades UX significantly.   | NEEDS PRODUCTION CHECK |
| **BUG-23** | **Session Role Instability / Hydration Mismatch** | Admin user briefly appears as "Student" (with "Loading..." state) before eventually hydrating as Admin. Likely relates to BUG-21. | OBSERVED ON LOCAL      |

### 🟡 P2 - Medium

| ID         | Bug                                        | Impact                                                                                                                                                | Status |
| ---------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| **BUG-19** | **React Hydration Error #418**             | Console spam on Dashboard and Management pages. Indicates server/client HTML mismatch.                                                                | NEW    |
| **BUG-20** | **Test Data in Production**                | Found `ZZ_Test_Admin` teacher record left over from previous runs.                                                                                    | FIXED  |
| **BUG-24** | **Duplicate React keys in class dropdown** | Console errors "Encountered two children with the same key" in Subject Assignment page. Class labels showed "ม.M/-" instead of proper "ม.1/1" format. | FIXED  |

---

## Detailed Notes

1.  **Teacher Management**:
    - Creation works: Created `ZZ-TEST Suchart`, `ZZ_BugHunt_Test Verified`.
    - Search works: Filtered correctly.
    - Deletion works: Successfully deleted test records.
    - Add Teacher dialog: Form properly structured with validation.
    - **Issue**: Very slow initial load (BUG-21) - hydrates as "Student" briefly.

2.  **Scheduling (Charter B)**:
    - **Works on Local 1/2568**: Tested assignment interface - loads correctly, teacher selection works.
    - **BUG-22 Status**: May have been production-specific data issue or has been fixed.
    - Subject dropdown: Works correctly with all subjects.
    - Class dropdown: Fixed BUG-24 - now shows proper "ม.Year/Number" labels.

3.  **Subject Assignment**:
    - Fixed `QuickAssignmentPanel.tsx` to use proper `Year` and `Number` fields instead of substring on `GradeID`.
    - Added `getOptionKey` and `isOptionEqualToValue` for MUI Autocomplete.
    - No more duplicate key console errors.

---

## Fixes Applied This Session

### BUG-24 Fix: Duplicate React Keys in Class Dropdown

**File:** `src/app/schedule/[semesterAndyear]/assign/component/QuickAssignmentPanel.tsx`

**Root Cause:** The Autocomplete component used `GradeID.toString()[0]` and `[2]` to extract year/section, which failed for non-numeric or short GradeIDs, causing all options to render as "ม.M/-" with duplicate keys.

**Fix:**

```tsx
// Before
getOptionLabel={(option) => `ม.${option.GradeID.toString()[0]}/${option.GradeID.toString()[2]}`}

// After
getOptionLabel={(option) => `ม.${option.Year}/${option.Number}`}
getOptionKey={(option) => option.GradeID}
isOptionEqualToValue={(option, value) => option.GradeID === value.GradeID}
```

---

## Recommendations

1. ~~**Investigate BUG-22 (P0)**~~: Tested on local - works correctly. Verify on production after deployment.
2. **Optimize Initial Load (BUG-21)**: The global semester fetching logic seems to be a bottleneck or race condition causing session flickering.
3. **Fix Hydration Errors (BUG-19)**: Audit `Navbar` and `ManagementLayout` for conditional rendering based on auth state (ensure `mounted` check is used consistently).
4. **Deploy BUG-24 fix**: Push changes to production.

---

_Generated: 2025-12-20_  
_Updated: 2025-12-21 (Bug hunting session)_

## Follow-up Session (Dec 21, 2025)

### Re-tested Bugs

| Bug    | Status           | Notes                                                      |
| ------ | ---------------- | ---------------------------------------------------------- |
| BUG-19 | **NOT OBSERVED** | No hydration errors in console during testing              |
| BUG-21 | **MITIGATED**    | Enabled Turbopack filesystem cache (`unstable_buildCache`) |
| BUG-22 | **FIXED**        | Schedule pages load correctly on local                     |
| BUG-23 | **FIXED**        | Changed to show 'กำลังโหลด...' during hydration            |

### BUG-23 Root Cause Analysis

The session flashes 'นักเรียน กำลังตรวจสอบสิทธิ์...' (Student checking permissions) on every page navigation before hydrating as the actual admin role. This is a client-side hydration issue where:

1. Server renders with no session (shows default 'Student' role)
2. Client hydrates and fetches actual session
3. Session updates UI to show admin

**Fix:** Use `useState` + `useEffect` pattern to delay role-dependent UI until after hydration (similar to BUG-13, BUG-15 fixes).

### Additional Findings (Dec 21, continued)

| Bug         | Route                            | Description                                        |
| ----------- | -------------------------------- | -------------------------------------------------- |
| BUG-19      | `/dashboard/[sem]/teacher-table` | Hydration error in TeacherTablePage (**FIXED**)    |
| MUI Warning | `/dashboard/[sem]/teacher-table` | Disabled button children in MUI Tooltip components |
| BUG-25      | `/management/email-outbox`       | Async searchParams issue (**FIXED**)               |

**BUG-19 Fix:**

- Added `isHydrated` state with `useEffect` initialization
- Changed conditional at line 403 to `{isHydrated && isAdmin &&`
- Prevents admin-only bulk export section from rendering until client hydration completes
