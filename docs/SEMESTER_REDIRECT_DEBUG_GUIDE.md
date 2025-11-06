# Semester Redirect Issue - Debugging Guide

> Investigation of persistent redirect to `/dashboard/select-semester` even when semester exists in database

## Issue Summary

**Problem:** User reports redirect persists when clicking "จัดตารางสอน" tab and selecting semester from navbar, even though semester `1-2567` exists in database.

**Status:** ✅ Debug logging added, root cause being investigated

---

## Investigation Timeline

### Phase 1: Initial Investigation (Completed ✅)
- ✅ Verified semester `1-2567` exists in database (Status: DRAFT, Completeness: 0%)
- ✅ Verified proxy.ts matcher configuration (fixed to `/dashboard/:path*`)
- ✅ Found redirect sources: TWO layout files with validation logic
  - `src/app/schedule/[semesterAndyear]/layout.tsx`
  - `src/app/dashboard/[semesterAndyear]/layout.tsx`

### Phase 2: Database Validation (Completed ✅)
```bash
# Database check confirmed:
✅ Semester 1-2567 EXISTS in table_config
✅ Status: DRAFT
✅ Completeness: 0%
✅ 40 timeslots configured
✅ Repository query (findByYearAndSemester) works correctly
```

### Phase 3: Code Analysis (Completed ✅)
```typescript
// Layout validation logic (BOTH layouts):
1. Parse URL param: "1-2567" → { semester: 1, year: 2567 }
2. Validate format: semester === 1 or 2, year is integer
3. Query database: semesterRepository.findByYearAndSemester(year, semester)
4. Redirect if NOT found

// Key finding:
✅ parseParam() function works correctly for "1-2567"
✅ Database query works correctly (enum comparison validated)
✅ Semester exists in DB, should NOT redirect
```

### Phase 4: Debug Logging Added (Current 🔄)
Added comprehensive console.log statements to both layout files:
- Log raw param value from Next.js router
- Log parsed values (semester, year, label)
- Log database lookup result
- Log redirect reasons

---

## Root Cause Hypothesis

**Most likely causes (in order of probability):**

### 1. **URL Param Mismatch** (HIGH PROBABILITY ⚠️)
   - User might be accessing a **different URL** than expected
   - Check if URL is `/schedule/1-2567/arrange` (correct) or something else
   - Navbar might be navigating to wrong route
   
   **Test:**
   ```
   1. Open browser DevTools
   2. Navigate to "จัดตารางสอน" tab
   3. Check URL bar for actual value
   4. Check terminal logs for layout debug output
   ```

### 2. **Multiple Layout Renders** (MEDIUM PROBABILITY)
   - Next.js might be rendering layout multiple times
   - First render before semester selection?
   - Race condition between navbar state and route params?
   
   **Test:**
   ```
   1. Watch terminal for multiple layout calls
   2. Check if redirect happens before or after semester selection
   3. Verify navbar state updates before navigation
   ```

### 3. **Client-Side Navigation Issue** (MEDIUM PROBABILITY)
   - Next.js router might not be passing params correctly
   - `useRouter().push()` might have wrong param format
   - Tab navigation component might have stale state
   
   **Test:**
   ```
   1. Check src/app/schedule/[semesterAndyear]/page.tsx tab logic
   2. Verify router.push() calls have correct format
   3. Check if usePathname() returns correct value
   ```

### 4. **Caching Issue** (LOW PROBABILITY)
   - Router cache might be stale
   - Layout might be cached with old validation result
   
   **Test:**
   ```
   1. Clear browser cache and cookies
   2. Restart Next.js dev server
   3. Try in incognito mode
   ```

---

## Debug Instructions (For User)

### Step 1: Start Dev Server with Logging
```bash
pnpm dev
```

### Step 2: Reproduce Issue
1. Navigate to public page or sign in
2. Click "จัดตารางสอน" in sidebar or navbar
3. Select semester "1-2567" if prompted
4. Watch terminal output for debug logs

### Step 3: Collect Debug Output
Look for these log patterns in terminal:

```
✅ GOOD (No redirect):
🔍 [ScheduleSemesterLayout] Raw param: 1-2567
🔍 [ScheduleSemesterLayout] Parsed: { semester: 1, year: 2567, label: '1-2567' }
🔍 [ScheduleSemesterLayout] Checking DB for: { year: 2567, semester: 1 }
🔍 [ScheduleSemesterLayout] DB result: ✅ Found
✅ [ScheduleSemesterLayout] All checks passed, rendering children

❌ BAD (Redirect happens):
🔍 [ScheduleSemesterLayout] Raw param: [check what this is]
🔍 [ScheduleSemesterLayout] Parsed: [check semester/year values]
❌ [ScheduleSemesterLayout] Invalid format, redirecting to select-semester
   OR
❌ [ScheduleSemesterLayout] Semester not in DB, redirecting to select-semester
```

### Step 4: Check Browser DevTools
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "Doc" (documents)
4. Look for redirects (301/302 status codes)
5. Check request URL vs final URL

### Step 5: Report Findings
Share the following information:
1. Terminal debug logs (copy/paste)
2. Browser URL bar value when clicking "จัดตารางสอน"
3. Browser Network tab redirect chain
4. Screenshot of issue

---

## Testing Scripts

**Note:** Debug scripts for this issue have been removed after fix completion (Issue #77).
For database verification, use:
```bash
pnpm tsx scripts/check-semester.ts 1-2567
```

---

## Quick Fixes to Try

### Fix 1: Clear Next.js Cache
```bash
rm -rf .next
pnpm dev
```

### Fix 2: Clear Browser Cache
- Chrome: Ctrl+Shift+Delete → Clear cache
- Or use Incognito mode (Ctrl+Shift+N)

### Fix 3: Check Navbar Semester State
```typescript
// In src/components/templates/Menubar.tsx or DashboardMenubar.tsx
// Look for semester selection logic
// Verify it's setting correct value before navigation
```

---

## Context7 Official Patterns

Based on Next.js 16 official docs, the redirect pattern we're using is correct:

```typescript
// ✅ CORRECT: Conditional redirect in layout
export default async function Layout({ params }) {
  const { id } = await params;
  
  if (!isValid(id)) {
    redirect('/error'); // This is the official pattern
  }
  
  return <>{children}</>;
}
```

Our implementation follows this pattern exactly. The issue is likely:
1. **What value** is being passed to `params.semesterAndyear`
2. **When** the layout is being called (timing issue)
3. **How many times** the layout renders (multiple calls)

---

## Next Steps

1. ✅ **Debug logging added** - Wait for user to run dev server and report logs
2. ⏳ **Analyze logs** - Identify actual param value causing redirect
3. ⏳ **Fix root cause** - Based on log analysis
4. ⏳ **Verify fix** - Test with user confirmation

---

## Related Files

### Layouts with Redirects:
- `src/app/schedule/[semesterAndyear]/layout.tsx` (✅ debug logging added)
- `src/app/dashboard/[semesterAndyear]/layout.tsx` (✅ debug logging added)

### Navigation Components:
- `src/components/templates/Menubar.tsx` (sidebar menu)
- `src/components/templates/DashboardMenubar.tsx` (dashboard sidebar)
- `src/app/schedule/[semesterAndyear]/page.tsx` (tab navigation)

### Auth & Middleware:
- `proxy.ts` (auth middleware)
- `src/lib/auth.ts` (Auth.js config)

### Repository:
- `src/features/semester/infrastructure/repositories/semester.repository.ts`

### Debug Scripts:
- `scripts/check-semester.ts` (for database verification)

---

## Public Page Admin Button (Fixed ✅)

**Issue:** Admin login button should show current user and add "go back to admin pages" link

**Solution:** Updated `src/app/(public)/page.tsx` to:
1. Call `auth()` to get session
2. Show user info (name + role) if authenticated
3. Replace "Admin Login" with "กลับสู่หน้าจัดการ" (Go back to admin pages)
4. Add home icon for better UX

**Test:**
```bash
1. Sign in as admin
2. Navigate to public page (/)
3. Check top-right corner shows:
   - User name/email
   - User role in Thai
   - "กลับสู่หน้าจัดการ" button with home icon
4. Click button → should navigate to /dashboard/select-semester
```

---

## Summary

**What we know:**
- ✅ Database is correct (semester exists)
- ✅ Query logic is correct (repository works)
- ✅ Parse logic is correct (validation works)
- ✅ Redirect pattern is correct (follows Next.js docs)
- ⚠️ Redirect still happens (user reports)

**What we need to find:**
- ❓ What is the ACTUAL param value being passed?
- ❓ When/why is layout being called with wrong value?
- ❓ Is there client-side navigation issue?

**How to find it:**
- 🔍 User runs dev server with debug logging
- 🔍 User reproduces issue and shares logs
- 🔍 Analyze logs to identify root cause
