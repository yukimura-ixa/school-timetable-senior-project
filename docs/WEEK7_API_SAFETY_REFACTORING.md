# Week 7: API Route Safety Refactoring

**Date**: October 22, 2025  
**Status**: 🚀 **READY TO START**  
**Goal**: Fix unsafe `parseInt()` usage in remaining API routes

---

## 📋 Context

**Weeks 5-6 Achievements**:
- ✅ Week 5: Zustand store, @dnd-kit examples, TeacherArrangePage refactored, custom hooks
- ✅ Week 6: Complete @dnd-kit migration, removed react-beautiful-dnd (~900KB saved)

**Current State**:
- ✅ 88/88 unit tests passing
- ✅ 0 TypeScript errors in schedule-arrangement feature
- ✅ `parseUtils.ts` and `apiErrorHandling.ts` utilities exist
- ⚠️ 5+ API routes still using unsafe `parseInt()` calls

---

## 🎯 Week 7 Goal

**Refactor remaining API routes to use safe parsing utilities**

This prevents runtime crashes when query parameters are:
- `null` or `undefined`
- Empty strings
- Non-numeric values
- Out of range integers

---

## 📝 Week 7 Tasks

### Week 7.1: Audit & Prioritize API Routes

**Objective**: Identify all API routes using unsafe `parseInt()`

**Steps**:
1. Search for `parseInt(` across `/api` directory
2. Categorize by risk:
   - 🔴 **High**: Routes handling critical operations (assign, arrange, config)
   - 🟡 **Medium**: Routes handling data management (teacher, room, subject)
   - 🟢 **Low**: Routes with proper error handling already
3. Create refactoring checklist with file paths

**Expected Outcome**: Complete list of API routes needing refactoring

---

### Week 7.2: Refactor High-Priority API Routes (Critical)

**Target Files**:
1. `/api/arrange/route.ts` - Timetable arrangement operations
2. `/api/assign/getLockedResp/route.ts` - Locked schedule queries
3. `/api/config/copy/route.ts` - Config copy operations

**Refactoring Pattern**:

**BEFORE**:
```typescript
export async function GET(request: Request) {
  const TeacherID = parseInt(request.nextUrl.searchParams.get("TeacherID"));
  // ❌ Crash if TeacherID is null/undefined/invalid
  
  const data = await prisma.teacher.findUnique({
    where: { TeacherID }
  });
  // ...
}
```

**AFTER**:
```typescript
import { safeParseInt } from "@/functions/parseUtils";
import { createErrorResponse, validateRequiredParams } from "@/functions/apiErrorHandling";

export async function GET(request: Request) {
  // ✅ Safe parsing with clear error
  const TeacherID = safeParseInt(
    request.nextUrl.searchParams.get("TeacherID")
  );
  
  // ✅ Validate required params
  const validation = validateRequiredParams({ TeacherID });
  if (validation) return validation;
  
  // ✅ Now TeacherID is guaranteed to be a valid number
  const data = await prisma.teacher.findUnique({
    where: { TeacherID }
  });
  
  if (!data) {
    return createErrorResponse("Teacher not found", 404);
  }
  
  return NextResponse.json(data);
}
```

**Validation Checklist per Route**:
- [ ] Replace `parseInt()` with `safeParseInt()`
- [ ] Add `validateRequiredParams()` check
- [ ] Add proper error responses for not found cases
- [ ] Test with invalid inputs (null, "", "abc", "999999")
- [ ] Verify existing functionality unchanged

**Expected Outcome**: 3 critical API routes refactored and tested

---

### Week 7.3: Refactor Medium-Priority API Routes (Data Management)

**Target Files**:
1. `/api/room/route.ts` - Room CRUD operations
2. `/api/subject/route.ts` - Subject CRUD operations
3. `/api/teacher/route.ts` (if unsafe) - Teacher CRUD operations

**Same Pattern as 7.2**:
- Use `safeParseInt()` for all ID parsing
- Use `validateRequiredParams()` for validation
- Add proper error handling
- Test thoroughly

**Expected Outcome**: 3 data management API routes refactored

---

### Week 7.4: Refactor Remaining API Routes & Testing

**Target Files**:
- Any remaining routes identified in Week 7.1 audit

**Steps**:
1. Apply same refactoring pattern
2. Run full test suite: `pnpm test`
3. Manual testing of affected features:
   - Teacher management
   - Room management
   - Subject management
   - Timetable arrangement
   - Config copying
4. Document any breaking changes (should be none)

**Expected Outcome**: 
- All API routes using safe parsing
- 88/88 tests still passing
- 0 TypeScript errors
- Comprehensive testing completed

---

## 📊 Success Criteria

### Code Quality
- [ ] Zero `parseInt()` calls without error handling in `/api`
- [ ] All API routes use `safeParseInt()` and `validateRequiredParams()`
- [ ] Proper error responses (400/404/500) with meaningful messages

### Testing
- [ ] 88/88 unit tests passing
- [ ] Manual testing of all CRUD operations
- [ ] Invalid input testing (null, undefined, "", "abc")
- [ ] 0 TypeScript errors

### Documentation
- [ ] Update API documentation with error responses
- [ ] Document validation patterns
- [ ] Create API testing guide

---

## 🎯 Benefits

1. **Reliability**: Prevent runtime crashes from invalid inputs
2. **Security**: Proper input validation prevents injection attacks
3. **User Experience**: Clear error messages instead of 500 errors
4. **Maintainability**: Consistent error handling across all routes
5. **Type Safety**: Guaranteed valid numbers after validation

---

## 📈 Estimated Timeline

| Task | Estimated Time | Risk |
|------|----------------|------|
| 7.1: Audit | 1 hour | Low |
| 7.2: Critical Routes | 3-4 hours | Medium |
| 7.3: Data Routes | 2-3 hours | Low |
| 7.4: Remaining + Testing | 2-3 hours | Low |
| **Total** | **8-11 hours** | **Low-Medium** |

**Recommended Pace**: 1-2 tasks per day over 3-4 days

---

## 🚨 Rollback Plan

**If issues arise**:

1. **Per-route rollback** (recommended):
   ```bash
   git checkout HEAD -- src/app/api/arrange/route.ts
   ```

2. **Full rollback**:
   ```bash
   git revert <commit-hash>
   ```

3. **Safe approach**: Keep both versions and A/B test

---

## 📚 Reference Files

**Utilities** (already exist):
- `src/functions/parseUtils.ts` - Safe parsing functions
- `src/functions/apiErrorHandling.ts` - Error response utilities

**Example Refactored Routes** (for reference):
- Check git history for previously refactored routes

**Testing**:
- `__test__/functions/parseUtils.test.ts` - Utility tests

---

## 🎯 Next Steps After Week 7

**Week 8 Options**:
1. **Performance Optimization**: Bundle analysis, lazy loading, code splitting
2. **Type Safety**: Replace `any` types in components with proper interfaces
3. **React Hook Cleanup**: Fix dependency warnings in useEffect
4. **E2E Test Coverage**: Add remaining 2 skipped tests
5. **Documentation**: API reference, component library, developer guide

---

## 💡 Notes

- This is **low-risk refactoring** - same functionality, better error handling
- Can be done incrementally (1 route at a time)
- Utilities already exist and tested
- Follows patterns already established in previous refactoring

---

**Ready to start? Let's make the API routes bulletproof! 🚀**
