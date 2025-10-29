# Thai Year Format Migration

## Migration Date
October 29, 2025

## Overview
Successfully migrated database from international year format (7-12) to Thai school year format (1-6) with Thai-style GradeID format.

## Changes Applied

### 1. Year Field (program, gradelevel)
**Before:** Year 7-12 (international format)
**After:** Year 1-6 (Thai format)

Mapping:
- Year 7 → Year 1 (ม.1)
- Year 8 → Year 2 (ม.2)
- Year 9 → Year 3 (ม.3)
- Year 10 → Year 4 (ม.4)
- Year 11 → Year 5 (ม.5)
- Year 12 → Year 6 (ม.6)

### 2. GradeID Field (gradelevel)
**Before:** `"7-1"`, `"8-2"`, `"9-3"`, etc.
**After:** `"ม.1/1"`, `"ม.2/2"`, `"ม.3/3"`, etc.

Format: `"ม.{YEAR}/{SECTION}"`

### 3. Migration Statistics
- **Grade Levels**: 18 updated
- **Programs**: 9 updated
- **Class Schedules**: 0 updated (none existed yet)
- **Teacher Responsibilities**: 0 updated (none existed yet)

## Thai Education System

### Junior High (ม.ต้น)
- ม.1 (Year 1) - Mathayom 1
- ม.2 (Year 2) - Mathayom 2
- ม.3 (Year 3) - Mathayom 3

### Senior High (ม.ปลาย)
- ม.4 (Year 4) - Mathayom 4
- ม.5 (Year 5) - Mathayom 5
- ม.6 (Year 6) - Mathayom 6

## Updated Files

### 1. Migration Script
**File:** `prisma/migrate-thai-year-format.ts`
- Converts existing database data
- Updates Year values from 7-12 to 1-6
- Updates GradeID format to Thai style
- Updates all foreign key references

### 2. Utility Library
**File:** `src/lib/thai-year-format.ts`
- `formatThaiYear(year: number)` - Convert to display format "ม.1" to "ม.6"
- `parseThaiYear(thaiYearStr: string)` - Parse display format to number
- `generateThaiGradeID(year: number, section: number)` - Generate "ม.1/1" format
- `parseThaiGradeID(gradeID: string)` - Parse GradeID to { year, section }
- `isJuniorHigh(year: number)` - Check if year 1-3
- `isSeniorHigh(year: number)` - Check if year 4-6
- `getLevelName(year: number)` - Return "ม.ต้น" or "ม.ปลาย"
- `isValidThaiYear(year: number)` - Validate year range
- `isValidThaiGradeID(gradeID: string)` - Validate GradeID format

### 3. Seed Script
**File:** `prisma/seed.ts`
- Updated program creation to use Year 1-6
- Updated gradelevel creation to use GradeID "ม.1/1" format
- All program lookups now use Thai years

## Usage Guidelines

### Creating New Programs
```typescript
const program = await prisma.program.create({
  data: {
    ProgramCode: 'GENERAL-M1-2567',
    ProgramName: 'หลักสูตรทั่วไป ม.1',
    Year: 1, // Thai year (not 7)
    Track: 'GENERAL',
    MinTotalCredits: 40,
    IsActive: true
  }
});
```

### Creating New Grade Levels
```typescript
import { generateThaiGradeID } from '@/lib/thai-year-format';

const gradeLevel = await prisma.gradelevel.create({
  data: {
    GradeID: generateThaiGradeID(1, 1), // "ม.1/1"
    Year: 1, // Thai year
    Number: 1, // Section
    StudentCount: 30,
    ProgramID: programId
  }
});
```

### Displaying Thai Year Labels
```typescript
import { formatThaiYear } from '@/lib/thai-year-format';

// Display format
const label = formatThaiYear(1); // "ม.1"
const fullLabel = `หลักสูตรชั้นมัธยมศึกษาปีที่ ${year}`; // Already correct in UI
```

### Parsing GradeID
```typescript
import { parseThaiGradeID } from '@/lib/thai-year-format';

const { year, section } = parseThaiGradeID('ม.1/1');
// year = 1, section = 1
```

### Checking Education Level
```typescript
import { isJuniorHigh, isSeniorHigh, getLevelName } from '@/lib/thai-year-format';

if (isJuniorHigh(year)) {
  // Junior high logic (Year 1-3)
}

if (isSeniorHigh(year)) {
  // Senior high logic (Year 4-6)
}

const levelName = getLevelName(year); // "ม.ต้น" or "ม.ปลาย"
```

## Database Schema

### gradelevel Table
```prisma
model gradelevel {
  GradeID      String @id          // "ม.1/1", "ม.2/2", etc.
  Year         Int                 // 1-6 (Thai years)
  Number       Int                 // Section number
  StudentCount Int    @default(0)
  ProgramID    Int?
  
  program                 program?                    @relation(...)
  class_schedule          class_schedule[]
  teachers_responsibility teachers_responsibility[]
  
  @@unique([Year, Number])
}
```

### program Table
```prisma
model program {
  ProgramID       Int          @id @default(autoincrement())
  ProgramCode     String       @unique
  ProgramName     String
  Year            Int          // 1-6 (Thai years)
  Track           ProgramTrack
  MinTotalCredits Float        @default(0)
  IsActive        Boolean      @default(true)
  
  gradelevel      gradelevel[]
  program_subject program_subject[]
  
  @@unique([Year, Track])
}
```

## Validation Rules

### Year Validation
- **Range:** 1-6 (inclusive)
- **Type:** Integer
- **Labels:** ม.1, ม.2, ม.3, ม.4, ม.5, ม.6

### GradeID Validation
- **Format:** `/^ม\.\d\/\d+$/`
- **Examples:** "ม.1/1", "ม.6/3"
- **Components:** Thai year (1-6) + section (1+)

## Backward Compatibility

### Legacy Format Support (Deprecated)
The utility library includes deprecated functions for conversion:
- `convertToThaiYear(7-12)` → 1-6
- `convertToInternationalYear(1-6)` → 7-12

**Do not use these in new code.** Always use Thai year format directly.

## Routes & UI

### Program Management Routes
- `/management/program` - Lists all years (1-6 displayed as "ม.1-ม.6")
- `/management/program/year/[year]` - Year parameter is 1-6 (not 7-12)

### Display Convention
All UI already uses Thai labels:
```tsx
<p>หลักสูตรชั้นมัธยมศึกษาปีที่ {year}</p>
// Displays: "หลักสูตรชั้นมัธยมศึกษาปีที่ 1" for ม.1
```

## Testing Checklist

After migration, verify:
- ✅ Programs show correct Year 1-6
- ✅ Grade levels show GradeID "ม.1/1" format
- ✅ Management pages display correctly
- ✅ Seed script creates data with new format
- ✅ No foreign key constraint violations
- ⚠️ Class schedules (none exist yet)
- ⚠️ Teacher responsibilities (none exist yet)

## Next Steps

1. **Update data model memory** with new format examples
2. **Update business rules** to reflect Thai year validation (1-6)
3. **Test all CRUD operations** with new format
4. **Update any hardcoded Year checks** from 7-12 to 1-6
5. **Update E2E tests** if they reference old format
6. **Update exports** (Excel/PDF) to use Thai labels
7. **Consider updating Prisma schema comments** to document Thai format

## Rollback Procedure

If migration needs to be reversed:
```bash
# Option 1: Restore from backup
pnpm prisma db push --force-reset
# Then restore backup SQL

# Option 2: Create reverse migration script
# (reverse mapping: 1→7, 2→8, etc.)
```

## References

- Migration script: `prisma/migrate-thai-year-format.ts`
- Utility library: `src/lib/thai-year-format.ts`
- Seed script: `prisma/seed.ts`
- Thai education system: [MOE Thailand](https://www.moe.go.th/)
