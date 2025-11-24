# Thai MOE Program Model — Year (Matthayom 1–6)

Date: 2025-10-27

This document outlines how Programs should be modeled per Thai Ministry of Education standards, emphasizing year-specific definitions (Matthayom 1–6).

## Year Enumeration

- M1, M2, M3 — Lower Secondary
- M4, M5, M6 — Upper Secondary

In the data model, prefer an enum in the schema:

```prisma
// prisma/schema.prisma (proposal)
enum GradeYear {
  M1
  M2
  M3
  M4
  M5
  M6
}

model Program {
  ProgramID      Int        @id @default(autoincrement())
  ProgramCode    String
  ProgramNameTh  String
  ProgramNameEn  String?
  year           GradeYear
  semester       Int // 1 or 2
  academicYear   Int // YYYY
  // ... relationships
  @@unique([ProgramCode, year, semester, academicYear])
}
```

## Weekly Lessons Standards (Placeholder)

Provide a configuration keyed by Year with subjects and weekly lesson counts. These values should be confirmed and filled per MOE standard.

```ts
// src/config/moe-standards.ts (proposal)
export type YearKey = "M1" | "M2" | "M3" | "M4" | "M5" | "M6";

export interface SubjectWeeklyStandard {
  subjectCode: string;
  subjectNameTh: string;
  weeklyLessons: number;
  category?: "core" | "elective";
}

export const MOE_WEEKLY_STANDARDS: Record<YearKey, SubjectWeeklyStandard[]> = {
  M1: [
    /* TODO: fill official subjects + hours */
  ],
  M2: [
    /* ... */
  ],
  M3: [
    /* ... */
  ],
  M4: [
    /* ... */
  ],
  M5: [
    /* ... */
  ],
  M6: [
    /* ... */
  ],
};
```

## Validation Strategy

- Program creation/update must include a valid `year` (M1–M6).
- If standards are enabled, validate:
  - Sum of weekly lessons matches per-year MOE totals.
  - Subject-category minimums are met (e.g., Thai, Math, Science, etc.).
- Validation errors should be human-friendly (Thai messages) via valibot.

## Seeding & Tests

- Extend seed to include sample Programs for M1–M6 with compliant weekly lessons.
- Add tests for:
  - Uniqueness (ProgramCode, Year, Semester, AcademicYear)
  - Validation failures when standards are not met
  - Filtering by Year/Semester in Program page
