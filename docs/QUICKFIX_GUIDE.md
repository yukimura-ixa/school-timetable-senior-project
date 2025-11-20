# QUICKFIX_GUIDE.md - Script Fixes

## Problem: 5 Script Files With PrismaClient Constructor Errors

Files affected:
- `scripts/check-admin-user.ts`
- `scripts/check-semester.ts` 
- `scripts/create-admin.ts`
- `scripts/verify-admin.ts`
- `scripts/verify-program-seed.ts`

Error: `Expected 1 arguments, but got 0`

## Solution: Replace with Singleton Import

### Manual Fix (Recommended - Safe & Simple)

For each of the 5 files above, make these two changes:

**Step 1**: Find this import (around line 6-8):
```typescript
import { PrismaClient } from "../prisma/generated/client";
// OR
import { PrismaClient } from '@/prisma/generated/client';
```

**Replace with**:
```typescript
import prisma from "../src/lib/prisma";
```

**Step 2**: Find this line (usually line 9):
```typescript
const prisma = new PrismaClient();
```

**Delete this entire line** (singleton import provides `prisma` already)

### Automated Fix (PowerShell)

Run from project root:

```powershell
# Fix all 5 scripts at once
$scripts = @(
  'scripts/check-admin-user.ts',
  'scripts/check-semester.ts', 
  'scripts/create-admin.ts',
  'scripts/verify-admin.ts',
  'scripts/verify-program-seed.ts'
)

foreach ($file in $scripts) {
  # Step 1: Replace import statement
  (Get-Content $file) -replace 
    'import \{ PrismaClient \} from [''"](@\/|\.\.\/)prisma\/generated\/client[''"];?', 
    'import prisma from "../src/lib/prisma";' | 
  # Step 2: Remove constructor line
   Where-Object { $_ -notmatch '^\s*const prisma = new PrismaClient\(\);?\s*$' } |
  Set-Content $file
}
```

### Verification

After fix, run:
```bash
pnpm typecheck 2>&1 | grep "Expected 1 arguments"
```

Should return **0 results** (was 5 before)

### Why This Works

- Prisma 7.x requires passing an adapter to `new PrismaClient({ adapter })`
- The singleton in `src/lib/prisma.ts` already has proper configuration
- Scripts can reuse the singleton instead of creating new instances
- Simpler and matches production usage pattern

---

**Status**: ✅ Fix documented  
**Time to fix manually**: ~5 minutes  
**Impact**: Fixes 5 of 125 TypeScript errors (4% of total)
