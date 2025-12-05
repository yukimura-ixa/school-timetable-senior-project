# Seed Data Relationship Improvements (June 2025)

## Changes Made to `prisma/seed.ts`

### 1. Department-to-LearningArea Mapping Constants

Added two mapping constants for consistent alignment between teachers and MOE learning areas:

```typescript
const DEPT_TO_LEARNING_AREA: Record<string, LearningArea> = {
  "ภาษาไทย": "THAI",
  "คณิตศาสตร์": "MATHEMATICS",
  "วิทยาศาสตร์และเทคโนโลยี": "SCIENCE",
  "สังคมศึกษา": "SOCIAL",
  "สุขศึกษาและพลศึกษา": "HEALTH_PE",
  "ศิลปะ": "ARTS",
  "การงานอาชีพ": "CAREER",
  "ภาษาต่างประเทศ": "FOREIGN_LANGUAGE",
};

const SUBJECT_PREFIX_TO_DEPT: Record<string, string> = {
  "ท": "ภาษาไทย",
  "ค": "คณิตศาสตร์",
  // ... etc
};
```

### 2. Program-Subject Relationships

Added `program_subject` entries linking all 10 demo subjects to the M1-SCI program:
- Core subjects (8): ท21101, ค21101, ว21101, ส21101, พ21101, ศ21101, ง21101, อ21101
- Activity subjects (2): ACT-CLUB, ACT-GUIDE

Each entry includes:
- Category (CORE or ACTIVITY)
- IsMandatory flag
- MinCredits (calculated from subject credit)
- SortOrder

### 3. Multi-Semester Teacher Responsibilities

Changed from single semester (1-2567) to ALL 3 semesters:
- 1-2567 (SEMESTER_1)
- 2-2567 (SEMESTER_2)  
- 1-2568 (SEMESTER_1)

Total responsibilities created: **72 entries**
- 3 semesters × 3 grades × 8 subjects = 72

### 4. Validation Warnings

Added warning when teacher department doesn't match subject's expected learning area:
```typescript
const expectedDept = SUBJECT_PREFIX_TO_DEPT[mapping.subjectCode.charAt(0)];
if (teacher.Department !== expectedDept) {
  console.warn(`⚠️ Teacher ${teacher.Firstname} (${teacher.Department}) assigned to ${mapping.subjectCode} but expected ${expectedDept}`);
}
```

## Data Model Relationships Now Properly Seeded

```
program ─┬─ program_subject ─── subject
         └─ gradelevel ─── teachers_responsibility ─┬─ teacher
                                                    └─ subject

10 subjects → 10 program_subject entries
8 teachers × 3 grades × 3 semesters = 72 responsibilities
```

## Demo Seed Output Summary

```
📊 Demo Data Summary:
   • Subjects: 10
   • Program: 1 (หลักสูตรวิทย์-คณิต ม.1)
   • Program-Subject Links: 10
   • Grade Levels: 3 (M.1/1-3)
   • Rooms: 5
   • Teachers: 8
   • Timeslots: 120 (3 semesters)
   • Table Configurations: 3 (1-2567, 2-2567, 1-2568)
   • Teacher Responsibilities: 72 (all 3 semesters)
   • Class Schedules: 36
```

## Usage

```bash
pnpm db:seed:demo  # Creates demo data with all relationships
```
