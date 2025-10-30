# Dashboard Import Path Fix

## Issue
The dashboard repository was using incorrect import path:
```typescript
import prisma from "@/lib/prisma"; // ❌ WRONG - lib/prisma doesn't exist
```

## Root Cause
The actual Prisma client file is located at:
- **File**: `src/libs/prisma.ts` (note: **libs** with an 's', not **lib**)

## Solution
Fixed import path in dashboard repository:
```typescript
import prisma from "@/libs/prisma"; // ✅ CORRECT
```

## Project Convention
All files in the codebase use `@/libs/prisma` for Prisma client imports:
- `src/libs/auth.ts`
- `src/lib/timetable-config.ts`
- `src/lib/public/teachers.ts`
- `src/lib/public/stats.ts`
- `src/features/semester/infrastructure/repositories/semester.repository.ts`
- `src/features/config/application/actions/config-lifecycle.actions.ts`
- And 9+ other files

## Files Modified
1. **src/features/dashboard/infrastructure/repositories/dashboard.repository.ts**
   - Line 8: Changed `@/lib/prisma` → `@/libs/prisma`

## Verification
- ✅ Dev server restarted successfully on port 3000
- ✅ Import error resolved
- ✅ Dashboard page should now load correctly

## Remember
Always use **`@/libs/prisma`** (plural "libs") for Prisma client imports in this project.
