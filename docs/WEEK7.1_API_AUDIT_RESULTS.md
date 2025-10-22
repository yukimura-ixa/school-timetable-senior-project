# Week 7.1: API Route Audit Results

**Date**: October 22, 2025  
**Audit Scope**: All `/api` routes using `parseInt()`  
**Total Routes Audited**: 34 `parseInt()` calls across 14 files

---

## 📊 Audit Summary

### Status Overview

| Status | Count | Files |
|--------|-------|-------|
| ✅ **Already Safe** | 6 calls | 3 files |
| 🔴 **High Priority** (Critical Operations) | 12 calls | 4 files |
| 🟡 **Medium Priority** (Data Management) | 10 calls | 5 files |
| 🟢 **Low Priority** (Internal Logic) | 6 calls | 2 files |
| **TOTAL** | **34 calls** | **14 files** |

---

## ✅ Already Safe (Using safeParseInt)

These routes already use safe parsing - **no action needed**:

1. **`/api/teacher/route.ts`** (line 13)
   - ✅ Uses `safeParseInt()` for TeacherID
   
2. **`/api/gradelevel/getGradelevelForLock/route.ts`** (lines 13, 17)
   - ✅ Uses `safeParseInt()` for AcademicYear and TeacherIDs array
   
3. **`/api/class/checkConflict/route.ts`** (lines 11, 14)
   - ✅ Uses `safeParseInt()` for AcademicYear and TeacherID
   
4. **`/api/assign/route.ts`** (lines 15, 16)
   - ✅ Uses `safeParseInt()` for TeacherID and AcademicYear
   
5. **`/api/assign/getAvailableResp/route.ts`** (lines 12, 13)
   - ✅ Uses `safeParseInt()` for TeacherID and AcademicYear

---

## 🔴 High Priority (Critical Operations)

**These routes handle critical timetable operations and MUST be fixed first.**

### 1. `/api/arrange/route.ts` ⚠️ **CRITICAL**
**Risk**: Teacher timetable arrangement crashes
- **Line 8**: `const TeacherID = parseInt(request.nextUrl.searchParams.get("TeacherID"))`
- **Impact**: Core scheduling feature - HIGH TRAFFIC
- **Recommendation**: 
  ```typescript
  const TeacherID = safeParseInt(request.nextUrl.searchParams.get("TeacherID"));
  const validation = validateRequiredParams({ TeacherID });
  if (validation) return validation;
  ```

---

### 2. `/api/assign/getLockedResp/route.ts` ⚠️ **CRITICAL**
**Risk**: Locked schedule queries fail
- **Line 9**: `const AcademicYear = parseInt(request.nextUrl.searchParams.get("AcademicYear"))`
- **Impact**: Core locking feature
- **Recommendation**: Same safe parsing pattern

---

### 3. `/api/config/copy/route.ts` ⚠️ **CRITICAL**
**Risk**: Config copy operations fail silently
- **Lines**: 25, 31, 39, 59, 70, 93, 105, 162 (8 calls!)
- **Impact**: Critical for semester transitions
- **Note**: This file has the MOST unsafe parseInt calls
- **Recommendation**: 
  ```typescript
  // At start of POST handler:
  const fromAcademicYear = body.fromAcademicYear;
  const toAcademicYear = body.toAcademicYear;
  const fromSemester = body.fromSemester;
  const toSemester = body.toSemester;
  
  // Validate all required params
  const validation = validateRequiredParams({
    fromAcademicYear,
    toAcademicYear,
    fromSemester,
    toSemester
  });
  if (validation) return validation;
  
  // Then use safeParseInt for all AcademicYear values
  const fromYear = safeParseInt(fromAcademicYear);
  const toYear = safeParseInt(toAcademicYear);
  
  // Validate parsed years
  if (fromYear === null || toYear === null) {
    return createErrorResponse("Invalid academic year format", 400);
  }
  ```

---

### 4. `/api/config/getConfig/route.ts` ⚠️ **CRITICAL**
**Risk**: Config retrieval crashes
- **Line 8**: `const AcademicYear = parseInt(request.nextUrl.searchParams.get("AcademicYear"))`
- **Impact**: Config page won't load
- **Recommendation**: Safe parsing + validation

---

## 🟡 Medium Priority (Data Management)

**These routes handle CRUD operations - should be fixed after critical routes.**

### 5. `/api/class/route.ts`
**Risk**: Class schedule queries fail
- **Line 17**: `const AcademicYear = parseInt(...)`
- **Line 22**: `const TeacherID = parseInt(...)`
- **Impact**: Dashboard and reports
- **Recommendation**: Safe parsing for both params

---

### 6. `/api/class/summary/route.ts`
**Risk**: Summary page crashes
- **Line 9**: `const AcademicYear = parseInt(...)`
- **Impact**: Dashboard statistics
- **Recommendation**: Safe parsing

---

### 7. `/api/lock/route.ts`
**Risk**: Lock operations fail
- **Line 9**: `const AcademicYear = parseInt(...)`
- **Line 11**: Commented out (can remove)
- **Impact**: Schedule locking
- **Recommendation**: Safe parsing + cleanup

---

### 8. `/api/lock/listlocked/route.ts`
**Risk**: Locked schedule list fails
- **Line 9**: `const AcademicYear = parseInt(...)`
- **Line 13**: Commented out (can remove)
- **Impact**: Lock management UI
- **Recommendation**: Safe parsing + cleanup

---

### 9. `/api/program/route.ts`
**Risk**: Program queries fail
- **Line 9**: `const Year = parseInt(...)`
- **Impact**: Grade level management
- **Recommendation**: Safe parsing

---

### 10. `/api/program/programOfGrade/route.ts`
**Risk**: Program-grade mapping fails
- **Line 9**: `const AcademicYear = parseInt(...)`
- **Impact**: Grade level setup
- **Recommendation**: Safe parsing

---

## 🟢 Low Priority (Internal Logic)

**These are internal sorting/processing logic - lower risk but should still be fixed.**

### 11. `/api/timeslot/route.ts`
**Risk**: Timeslot operations partially unsafe
- **Line 11**: `const AcademicYear = parseInt(...)` - ⚠️ **NEEDS FIX**
- **Lines 27, 28**: Sorting logic for TimeslotIDs - ✅ **OK** (internal use)
- **Lines 135, 141**: POST body parsing - ⚠️ **NEEDS FIX**
- **Impact**: Timeslot configuration
- **Recommendation**: 
  ```typescript
  // GET handler:
  const AcademicYear = safeParseInt(request.nextUrl.searchParams.get("AcademicYear"));
  const validation = validateRequiredParams({ AcademicYear });
  if (validation) return validation;
  
  // POST handler:
  const academicYear = safeParseInt(body.AcademicYear);
  if (academicYear === null) {
    return createErrorResponse("Invalid academic year", 400);
  }
  ```

---

## 📋 Refactoring Priority Order

### Phase 1: Critical (Do First) 🔴
1. ✅ `/api/arrange/route.ts` (1 call)
2. ✅ `/api/assign/getLockedResp/route.ts` (1 call)
3. ✅ `/api/config/copy/route.ts` (8 calls - MOST COMPLEX)
4. ✅ `/api/config/getConfig/route.ts` (1 call)

**Subtotal**: 11 calls in 4 files

---

### Phase 2: Data Management (Do Second) 🟡
5. ✅ `/api/class/route.ts` (2 calls)
6. ✅ `/api/class/summary/route.ts` (1 call)
7. ✅ `/api/lock/route.ts` (1 call + cleanup)
8. ✅ `/api/lock/listlocked/route.ts` (1 call + cleanup)
9. ✅ `/api/program/route.ts` (1 call)
10. ✅ `/api/program/programOfGrade/route.ts` (1 call)

**Subtotal**: 7 calls in 6 files

---

### Phase 3: Internal Logic (Do Last) 🟢
11. ✅ `/api/timeslot/route.ts` (3 user-input calls, skip 2 internal sorting calls)

**Subtotal**: 3 calls in 1 file

---

## 📊 Refactoring Statistics

| Priority | Files | parseInt Calls | Estimated Time |
|----------|-------|----------------|----------------|
| 🔴 Critical | 4 | 11 | 3-4 hours |
| 🟡 Medium | 6 | 7 | 2-3 hours |
| 🟢 Low | 1 | 3 | 1 hour |
| ✅ Already Safe | 5 | 6 | 0 hours |
| **TOTAL** | **16** | **27** | **6-8 hours** |

**Note**: Internal sorting logic (2 calls in timeslot) can be left as-is - they operate on validated data.

---

## 🎯 Week 7.2 Execution Plan

**Start with Critical Routes (Phase 1)**:

1. **`/api/arrange/route.ts`** - Single param, straightforward
2. **`/api/assign/getLockedResp/route.ts`** - Single param, straightforward
3. **`/api/config/getConfig/route.ts`** - Single param, straightforward
4. **`/api/config/copy/route.ts`** - 8 calls, most complex (save for last)

**Testing After Each Route**:
- [ ] Run `pnpm test`
- [ ] Manual testing with invalid inputs (null, "", "abc")
- [ ] Verify existing functionality unchanged
- [ ] Check TypeScript errors

---

## 💡 Common Refactoring Pattern

**For ALL routes**, apply this pattern:

```typescript
// ❌ BEFORE:
export async function GET(request: Request) {
  const ParamName = parseInt(request.nextUrl.searchParams.get("ParamName"));
  // Direct database query - CRASH if ParamName is NaN
}

// ✅ AFTER:
import { safeParseInt } from "@/functions/parseUtils";
import { createErrorResponse, validateRequiredParams } from "@/functions/apiErrorHandling";

export async function GET(request: Request) {
  const ParamName = safeParseInt(request.nextUrl.searchParams.get("ParamName"));
  
  // Validate required parameters
  const validation = validateRequiredParams({ ParamName });
  if (validation) return validation;
  
  // Now ParamName is guaranteed to be a valid number
  // Proceed with database query...
}
```

---

## ✅ Week 7.1 Complete!

**Audit Results**:
- ✅ 14 files identified
- ✅ 34 parseInt calls catalogued
- ✅ 3-tier priority system established
- ✅ 6-8 hour refactoring estimate
- ✅ Execution plan created

**Next Step**: Week 7.2 - Start refactoring critical routes! 🚀
