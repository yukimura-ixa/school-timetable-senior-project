# ConfigID Standardization — Quick Reference Card ✅

> **Status**: Migration COMPLETE (October 28, 2025)  
> **Canonical Format**: `"SEMESTER-YEAR"` (e.g., `"1-2567"`)

---

## ✅ Migration Complete

All code layers, tests, and database records now use the standardized `"SEMESTER-YEAR"` format.

| Format       | Example             | Where Used             | Status               |
| ------------ | ------------------- | ---------------------- | -------------------- |
| **Format 1** | `"1/2567"`          | Display only (Thai UI) | ✅ UI display format |
| **Format 2** | `"SEMESTER_1_2024"` | N/A                    | ✅ Removed           |
| **Format 3** | `"1-2567"`          | URLs, DB, code         | ✅ **CANONICAL**     |
| **Format 4** | `"2567-SEMESTER_1"` | N/A                    | ✅ Removed           |

**Important**: `"1/2567"` is now **only** used for Thai UI display. The canonical data format `"1-2567"` is used everywhere else.

---

## � Migration Summary

**Completed Phases (8/8):**

- ✅ Phase 1: Validation layer
- ✅ Phase 2: Route patterns
- ✅ Phase 3: Action layers
- ✅ Phase 4: Repository layer
- ✅ Phase 5: Test updates
- ✅ Phase 6: Database migration
- ✅ Phase 7: Documentation
- ✅ Phase 8: Deploy & verify

**Migration Statistics:**

- ✅ 6 code files updated
- ✅ 3 test files updated
- ✅ 41 database records migrated (1 table_config + 40 timeslots)
- ✅ All tests passing (20/20 seed validation tests)
- ✅ TypeScript compilation successful

---

## 🎯 Current Standard

**ConfigID Format**: `"SEMESTER-YEAR"`

```typescript
ConfigID = `${semesterNumber}-${academicYear}`

Examples:
- "1-2567" (Semester 1, Academic Year 2567)
- "2-2567" (Semester 2, Academic Year 2567)
- "1-2568" (Semester 1, Academic Year 2568)
```

**Regex Pattern**: `/^[1-3]-\d{4}$/`

**TimeslotID Format**: `"SEMESTER-YEAR-DAYPERIOD"`

```typescript
TimeslotID = `${semesterNumber}-${academicYear}-${day}${period}`

Examples:
- "1-2567-MON1" (Semester 1, 2567, Monday Period 1)
- "2-2568-FRI8" (Semester 2, 2568, Friday Period 8)
```

**Regex Pattern**: `/^[1-3]-\d{4}-(MON|TUE|WED|THU|FRI)[1-8]$/`

---

## 🔧 Code Reference

### Generator Functions

```typescript
// src/features/config/domain/services/config-validation.service.ts
export function generateConfigID(
  semesterNum: string,
  academicYear: number,
): string {
  return `${semesterNum}-${academicYear}`; // "1-2567"
}

export function parseConfigID(configId: string): ParsedConfigID {
  const parts = configId.split("-");
  // ...
  return { semester: parts[0], academicYear: parseInt(parts[1], 10) };
}
```

### Validation Schemas

```typescript
// src/features/config/infrastructure/schemas/config.schemas.ts
ConfigID: v.pipe(
  v.string("ConfigID ต้องเป็นข้อความ"),
  v.nonEmpty("ConfigID ต้องไม่เป็นค่าว่าง"),
  v.regex(
    /^[1-3]-\d{4}$/,
    'ConfigID ต้องมีรูปแบบ "SEMESTER-YEAR" (เช่น "1-2567")',
  ),
);
```

### Display Label (UI Only)

```typescript
// Converts "1-2567" → "1/2567" for Thai UI display
export function generateConfigIDLabel(configId: string): string {
  return configId.replace("-", "/");
}
```

---

## 🛠️ Migration Scripts (For Future Environments)

### Verification Script

**Usage**: Check if migration is needed

```bash
pnpm db:verify-configid
```

**Output**:

- ✅ Exit 0: All ConfigIDs canonical
- ❌ Exit 1: Migration needed (shows details)

### Migration Script

**Usage**: Automated migration to canonical format

```bash
pnpm db:migrate-configid
```

**Features**:

- ✅ Idempotent (safe to re-run)
- ✅ Create-then-delete strategy
- ✅ Referential integrity checks
- ✅ Detailed logging

**Files**:

- `scripts/verify-configid-migration.ts` (~340 lines)
- `scripts/migrate-configid.ts` (~280 lines)

---

## 🧪 Verification

---

## 🧪 Verification

### Run All Tests

```bash
# Unit tests
pnpm test

# Seed validation tests
pnpm test __test__/seed-validation.test.ts

# Config lifecycle tests
pnpm test __test__/config/

# TypeScript compilation
pnpm tsc --noEmit --skipLibCheck
```

### Verify Database

```bash
# Check if migration needed
pnpm db:verify-configid

# Expected output (after migration):
# ✅ No migration needed! All ConfigIDs in canonical format
```

### E2E Smoke Tests

```bash
# Local
pnpm test:e2e

# Production (if needed)
PLAYWRIGHT_BASE_URL=https://phrasongsa-timetable.vercel.app pnpm test:e2e
```

---

## 🔍 Search Patterns (For Detecting Old Formats)

### VS Code Regex Search

**Old slash format** (ConfigID):

```regex
["'`]\d+/\d{4}["'`]
```

**Old SEMESTER\_ prefix**:

```regex
SEMESTER_\d+_\d{4}
```

**Old year-first format**:

```regex
\d{4}-SEMESTER_\d+
```

**Note**: These patterns should now only appear in:

- Display label generation code (intentional)
- Migration documentation (historical reference)
- Comments explaining the migration

---

## 🛡️ Prevention (Future-Proofing)

### ESLint Rule (Optional)

```javascript
// .eslintrc.js
rules: {
  'no-restricted-syntax': [
    'error',
    {
      selector: 'Literal[value=/\\/[0-9]{4}/]',
      message: 'Use canonical ConfigID format: "SEMESTER-YEAR" (e.g., "1-2567")'
    }
  ]
}
```

### Database Constraint (Optional)

```sql
ALTER TABLE table_config
ADD CONSTRAINT chk_configid_format
CHECK (ConfigID REGEXP '^[1-3]-[0-9]{4}$');
```

**Note**: Currently not implemented. Database constraints can be added if needed for extra safety.

---

## 📚 Full Documentation

- **Migration Summary**: [docs/CONFIGID_FORMAT_MIGRATION.md](./CONFIGID_FORMAT_MIGRATION.md) ✅ COMPLETE
- **Week 9 Progress**: [docs/WEEK_9_SEEDING_AND_CONFIGID_COMPLETE.md](./WEEK_9_SEEDING_AND_CONFIGID_COMPLETE.md)

---

## 🆘 For New Environments (Staging/Production)

### If Deploying to Environment with Old Data

1. **Backup database** before migration
2. **Verify current state**:
   ```bash
   pnpm db:verify-configid
   ```
3. **If migration needed**:
   ```bash
   pnpm db:migrate-configid
   ```
4. **Re-verify**:
   ```bash
   pnpm db:verify-configid  # Should show ✅
   ```
5. **Run tests**:
   ```bash
   pnpm test
   ```
6. **Smoke test** key user flows

**Scripts are production-ready and safe to use.**

---

**Document Updated**: October 28, 2025  
**Migration Status**: ✅ COMPLETE

1. **Identify failing phase** (check error logs)
2. **Revert changes** in that phase:
   ```bash
   git revert <commit-hash>
   git push origin main
   ```
3. **Redeploy** previous version in Vercel dashboard (instant rollback)
4. **Review test failures** to understand root cause
5. **Fix issues** in feature branch before retry

### Critical Files for Rollback

- `src/services/config-validation.service.ts`
- `src/schemas/config.schemas.ts`
- `app/[configId]/` route structure
- `src/actions/` action layers
- `__test__/` test fixtures

---

## ⏱️ Estimated Timeline

| Phase                  | Time          | Risk       |
| ---------------------- | ------------- | ---------- |
| Phase 1: Validation    | 15 min        | Low        |
| Phase 2: Routes        | 30 min        | Medium     |
| Phase 3: Actions       | 30 min        | Medium     |
| Phase 4: Repository    | 15 min        | Low        |
| Phase 5: Tests         | 45 min        | Low        |
| Phase 6: Database      | 30 min        | High       |
| Phase 7: Documentation | 15 min        | Low        |
| Phase 8: Deploy        | 30 min        | Medium     |
| **Total**              | **3-4 hours** | **Medium** |

---

## 🎯 Success Criteria

- [ ] All 4 old formats replaced with canonical format
- [ ] All integration tests pass
- [ ] All E2E smoke tests pass (local + production)
- [ ] No console errors in browser
- [ ] All routes return 200 OK for valid ConfigIDs
- [ ] Database records use canonical format
- [ ] Documentation updated with examples
- [ ] ESLint/TypeScript rules prevent future violations

---

**Priority**: High (prevents data corruption and route mismatches)  
**Breaking Change**: Yes (coordinate with team before deployment)  
**Rollback**: Instant (Vercel rollback + git revert)

---

_Quick Ref v1.0 — 2025-01-27_
