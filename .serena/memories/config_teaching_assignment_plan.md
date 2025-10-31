# Configuration & Teaching Assignment System Analysis & Plan

**Thai Names:** ตั้งค่าตาราง / มอบหมายการสอน  
**English Names:** Timetable Configuration / Teaching Assignment  
**Date:** October 31, 2025  
**Status:** 📋 PLANNING & ANALYSIS

## System Overview

This document covers TWO interconnected systems that manage the foundation of the timetable:

1. **ตั้งค่าตาราง (Timetable Configuration)** - Dashboard configuration pages
2. **มอบหมายการสอน (Teaching Assignment)** - Program and subject assignment

## Part 1: ตั้งค่าตาราง (Timetable Configuration)

### Current Implementation

**Location:** `src/app/dashboard/[semesterAndyear]/`

**Pages:**
```
dashboard/[semesterAndyear]/
├── page.tsx                    # Dashboard home (analytics)
├── all-timeslot/              # ตั้งค่าช่วงเวลา (Timeslot Configuration)
│   ├── page.tsx               # Main timeslot management
│   ├── component/
│   │   ├── TableHead.tsx
│   │   ├── TableBody.tsx
│   │   ├── TeacherList.tsx
│   │   └── TableResult.tsx
│   └── functions/
│       ├── ExportTeacherTable.tsx
│       └── ExportTeacherSummary.tsx
└── all-program/               # ตั้งค่าหลักสูตร (Program Configuration)
    └── page.tsx               # Program management
```

### Features Currently Implemented

#### 1. Timeslot Configuration (`all-timeslot/`)
**Purpose:** Configure daily schedule structure (periods, breaks, times)

**Current Features:**
- ✅ View all timeslots in table format
- ✅ Display by day (MON-FRI)
- ✅ Show period numbers and times
- ✅ Mark break times (BREAK_JUNIOR, BREAK_SENIOR, BREAK_BOTH)
- ✅ Teacher schedule visualization
- ✅ Export to Excel (teacher table, teacher summary)
- ⚠️ Uses legacy fetcher (not Server Actions)
- ⚠️ Mixed Tailwind + inline styles

**Data Model:**
```typescript
interface Timeslot {
  TimeslotID: string;        // "1-2567-MON1"
  ConfigID: string;          // "1-2567"
  DayOfWeek: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI';
  PeriodNumber: number;      // 1-8
  StartTime: Date;           // "08:00:00"
  EndTime: Date;             // "09:00:00"
  Breaktime: 'NONE' | 'BREAK_JUNIOR' | 'BREAK_SENIOR' | 'BREAK_BOTH';
}
```

#### 2. Program Configuration (`all-program/`)
**Purpose:** Manage academic programs (หลักสูตร)

**Status:** ⚠️ Implementation unclear, may be incomplete

### Issues & Technical Debt

#### Architecture Issues
1. **Legacy Fetcher Pattern**
   ```typescript
   // ❌ OLD: Using axios fetcher
   const fetchTimeSlot = useSWR(
     `/timeslot?AcademicYear=${year}&Semester=SEMESTER_${semester}`,
     fetcher
   );
   
   // ✅ NEW: Should use Server Actions
   const { data } = useSWR(
     ['timeslots', configId],
     () => getTimeslotsByTermAction({ configId })
   );
   ```

2. **Inconsistent Styling**
   - Mixed Tailwind CSS + inline styles
   - No MUI v7 components
   - Not responsive

3. **Type Safety**
   - Uses `any` types in data processing
   - No strict TypeScript
   - Missing type definitions for exports

4. **No Edit/Add Functionality**
   - View-only interface
   - Can't add/edit/delete timeslots from UI
   - Must seed via API or database

### Proposed Improvements

#### Phase 1: Modernize Timeslot Configuration (3-4 hours)

**Goals:**
- Migrate to Server Actions
- Add CRUD operations (Create, Update, Delete)
- Use MUI v7 DataGrid
- Improve UX with dialogs/forms

**New Features:**
1. **Timeslot Editor Dialog**
   ```tsx
   <Dialog open={editDialog}>
     <DialogTitle>แก้ไขช่วงเวลา</DialogTitle>
     <DialogContent>
       <TextField label="วัน" select value={dayOfWeek} />
       <TextField label="คาบที่" type="number" value={periodNumber} />
       <TimePicker label="เวลาเริ่ม" value={startTime} />
       <TimePicker label="เวลาสิ้นสุด" value={endTime} />
       <FormControl>
         <FormLabel>พักเที่ยง</FormLabel>
         <RadioGroup value={breaktime}>
           <Radio value="NONE" label="ไม่พัก" />
           <Radio value="BREAK_JUNIOR" label="พักม.ต้น" />
           <Radio value="BREAK_SENIOR" label="พักม.ปลาย" />
           <Radio value="BREAK_BOTH" label="พักทั้งหมด" />
         </RadioGroup>
       </FormControl>
     </DialogContent>
     <DialogActions>
       <Button onClick={onCancel}>ยกเลิก</Button>
       <Button onClick={onSave} variant="contained">บันทึก</Button>
     </DialogActions>
   </Dialog>
   ```

2. **Bulk Operations**
   - Copy timeslots from previous term
   - Generate standard schedule template
   - Bulk edit break times

3. **Validation**
   - No overlapping times
   - Consistent duration per period
   - Break times don't overlap with classes

**Server Actions to Add:**
```typescript
// src/features/timeslot/application/actions/timeslot.actions.ts

export async function createTimeslotAction(
  params: CreateTimeslotInput
): Promise<ActionResult<timeslot>>;

export async function updateTimeslotAction(
  params: UpdateTimeslotInput
): Promise<ActionResult<timeslot>>;

export async function deleteTimeslotAction(
  params: { timeslotId: string }
): Promise<ActionResult<void>>;

export async function copyTimeslotsFromTermAction(
  params: { sourceConfigId: string; targetConfigId: string }
): Promise<ActionResult<timeslot[]>>;

export async function generateStandardScheduleAction(
  params: {
    configId: string;
    periodsPerDay: number;
    startTime: string;
    periodDuration: number; // minutes
    breakPeriods: number[]; // [4, 8]
  }
): Promise<ActionResult<timeslot[]>>;
```

**UI Components:**
```
dashboard/[semesterAndyear]/all-timeslot/
├── page.tsx                          # Main page (refactored)
└── _components/
    ├── TimeslotDataGrid.tsx          # MUI DataGrid
    ├── TimeslotEditorDialog.tsx      # Add/Edit dialog
    ├── TimeslotBulkActions.tsx       # Toolbar with bulk ops
    ├── CopyFromTermDialog.tsx        # Copy from previous term
    ├── GenerateScheduleDialog.tsx    # Generate template
    └── TimeslotValidationAlert.tsx   # Validation errors
```

#### Phase 2: Program Configuration (2-3 hours)

**Analyze Current State:**
- Determine if `all-program/` is implemented or stub
- Document current functionality
- Identify missing features

**Expected Features:**
1. View all programs for semester
2. Add/edit program details
3. Configure program settings
4. Link to subject assignments

## Part 2: มอบหมายการสอน (Teaching Assignment)

### Current Implementation

**Location:** `src/app/management/program/`

**Structure:**
```
management/program/
├── page.tsx                          # Program list (ม.1-6)
├── year/[year]/                      # Programs by year
│   └── page.tsx
├── [programId]/                      # Program details
│   ├── page.tsx
│   └── component/
│       └── ProgramSubjectAssignmentPage.tsx
└── component/
    ├── AddStudyProgramModal.tsx
    ├── EditStudyProgramModal.tsx
    ├── DeleteProgramModal.tsx
    ├── ProgramTable.tsx
    ├── SelectSubjects.tsx
    └── ...
```

### Features Currently Implemented

#### 1. Program Management
**Purpose:** Define academic programs (หลักสูตร) for each grade

**Current Features:**
- ✅ List programs by year (ม.1-6)
- ✅ Add/edit/delete programs
- ✅ Program details (name, year)
- ⚠️ Basic UI, not using MUI v7

**Data Model:**
```typescript
interface StudyProgram {
  ProgramID: number;
  ProgramName: string;        // "แผนการเรียนวิทย์-คณิต"
  Year: number;               // 1-6 (ม.1-6)
  AcademicYear: string;       // "2567"
  Semester: 'SEMESTER_1' | 'SEMESTER_2' | 'SEMESTER_3';
  
  // Relations
  program_subject: ProgramSubject[];
  class_config: ClassConfig[];
}
```

#### 2. Subject Assignment to Programs
**Purpose:** Assign subjects to each program with credit hours

**Location:** `management/program/[programId]/component/ProgramSubjectAssignmentPage.tsx`

**Current Features:**
- ✅ View all available subjects
- ✅ Select subjects for program
- ✅ Configure credits (min/max)
- ✅ Mark mandatory/elective
- ✅ MOE validation (กระทรวงศึกษาธิการ standards)
- ⚠️ Uses MUI v5/v6 components (needs v7 migration)

**Data Model:**
```typescript
interface ProgramSubject {
  ProgramID: number;
  SubjectCode: string;
  MinCredits: number;         // Minimum required credits
  MaxCredits: number;         // Maximum allowed credits
  IsMandatory: boolean;       // Required vs elective
  SortOrder: number;          // Display order
  
  // Relations
  subject: Subject;
}

interface Subject {
  SubjectCode: string;        // "ENG101"
  SubjectName: string;        // "English Communication"
  Category: 'CORE' | 'ADDITIONAL' | 'ACTIVITY';
  Credit: string;             // "1.0"
}
```

**MOE Validation:**
```typescript
interface MoeValidation {
  isValid: boolean;
  errors?: string[];          // Critical issues
  warnings?: string[];        // Recommendations
}

// Example validation rules:
// - Core subjects must total ≥ 20 credits
// - Additional subjects ≥ 10 credits
// - Activities ≥ 1 credit
// - Total ≤ 50 credits per year
```

### Issues & Technical Debt

#### 1. UI Inconsistency
- Program list page uses basic Tailwind
- Assignment page uses older MUI components
- No unified design system

#### 2. Workflow Complexity
**Current:** 
1. Create program → 2. Navigate to program details → 3. Assign subjects

**Better:**
1. Create program with inline subject selection
2. Wizard-style flow

#### 3. Limited Features
- ❌ No bulk assignment (copy from previous year)
- ❌ No program templates
- ❌ No subject grouping/categories view
- ❌ No credit summary visualization

#### 4. Type Safety
- Uses PascalCase types (legacy)
- Some `any` types in validation
- Needs migration to strict types

### Proposed Improvements

#### Phase 1: Program Management Modernization (3-4 hours)

**Goals:**
- Migrate to MUI v7
- Add wizard for program creation
- Improve subject assignment UX

**New Components:**

1. **ProgramWizard.tsx** (Multi-step form)
   ```tsx
   <Stepper activeStep={step}>
     <Step key="basic">
       <StepLabel>ข้อมูลพื้นฐาน</StepLabel>
       <StepContent>
         <TextField label="ชื่อแผนการเรียน" />
         <Select label="ระดับชั้น" />
       </StepContent>
     </Step>
     
     <Step key="subjects">
       <StepLabel>เลือกวิชา</StepLabel>
       <StepContent>
         <SubjectSelectionGrid />
       </StepContent>
     </Step>
     
     <Step key="review">
       <StepLabel>ตรวจสอบ</StepLabel>
       <StepContent>
         <ProgramSummary />
         <MoeValidationResult />
       </StepContent>
     </Step>
   </Stepper>
   ```

2. **SubjectSelectionGrid.tsx** (Enhanced selection)
   ```tsx
   <DataGrid
     rows={subjects}
     columns={[
       { field: 'SubjectCode', headerName: 'รหัส' },
       { field: 'SubjectName', headerName: 'ชื่อวิชา' },
       { field: 'Category', headerName: 'ประเภท' },
       { 
         field: 'selected', 
         headerName: 'เลือก',
         renderCell: (params) => (
           <Checkbox checked={params.value} />
         )
       },
       {
         field: 'credits',
         headerName: 'หน่วยกิต',
         renderCell: (params) => (
           <TextField
             type="number"
             size="small"
             disabled={!params.row.selected}
           />
         )
       }
     ]}
     checkboxSelection
     groupBy="Category"
   />
   ```

3. **ProgramCreditSummary.tsx** (Visualization)
   ```tsx
   <Card>
     <CardContent>
       <Typography variant="h6">สรุปหน่วยกิต</Typography>
       
       <Stack spacing={2}>
         <Box>
           <Typography>วิชาพื้นฐาน (Core)</Typography>
           <LinearProgress 
             variant="determinate" 
             value={(coreCredits / 20) * 100}
           />
           <Typography variant="caption">
             {coreCredits} / 20 หน่วยกิต (ขั้นต่ำ)
           </Typography>
         </Box>
         
         <Box>
           <Typography>วิชาเพิ่มเติม (Additional)</Typography>
           <LinearProgress 
             variant="determinate" 
             value={(additionalCredits / 10) * 100}
           />
           <Typography variant="caption">
             {additionalCredits} / 10 หน่วยกิต (ขั้นต่ำ)
           </Typography>
         </Box>
         
         <Box>
           <Typography>กิจกรรม (Activity)</Typography>
           <LinearProgress 
             variant="determinate" 
             value={(activityCredits / 1) * 100}
           />
           <Typography variant="caption">
             {activityCredits} / 1 หน่วยกิต (ขั้นต่ำ)
           </Typography>
         </Box>
       </Stack>
       
       <Divider sx={{ my: 2 }} />
       
       <Alert severity={totalCredits <= 50 ? 'success' : 'error'}>
         รวมทั้งหมด: {totalCredits} หน่วยกิต
         {totalCredits > 50 && ' (เกินกว่าที่กำหนด 50 หน่วยกิต)'}
       </Alert>
     </CardContent>
   </Card>
   ```

#### Phase 2: Bulk Operations & Templates (2-3 hours)

**New Features:**

1. **Copy Program from Previous Year**
   ```typescript
   export async function copyProgramAction(params: {
     sourceProgramId: number;
     targetYear: number;
     targetSemester: string;
   }): Promise<ActionResult<StudyProgram>>;
   ```

2. **Program Templates**
   ```typescript
   // Predefined templates
   const PROGRAM_TEMPLATES = {
     'วิทย์-คณิต': {
       subjects: ['MATH101', 'MATH102', 'SCI101', ...],
       credits: { MATH101: 2, MATH102: 2, ... }
     },
     'ภาษา-จีน': {
       subjects: ['CHI101', 'CHI102', 'ENG101', ...],
       credits: { CHI101: 2, CHI102: 2, ... }
     },
     // ...
   };
   ```

3. **Subject Recommendations**
   - Based on grade level
   - Based on program type
   - MOE curriculum standards

#### Phase 3: Integration with Teaching Assignment (1-2 hours)

**Link to Teacher Assignment System:**

```
Program (หลักสูตร)
  ↓ has subjects
Subject Assignment (มอบหมายวิชา)
  ↓ assigned to
Teacher Responsibility (ความรับผิดชอบ)
  ↓ scheduled in
Timetable Arrangement (จัดตารางเรียน)
```

**New Flow:**
1. Admin creates program with subjects
2. System suggests teacher assignments based on:
   - Teacher qualifications
   - Subject expertise
   - Workload balance
3. Teachers are assigned to program subjects
4. Timetable arrangement uses these assignments

## Implementation Priority

### High Priority (P0)
1. ✅ **Timeslot CRUD Operations** - Essential for timetable setup
2. ✅ **Program Subject Assignment** - Core feature, needs polish
3. ⏳ **MOE Validation Improvements** - Ensure compliance

### Medium Priority (P1)
1. ⏳ **Program Wizard** - Better UX
2. ⏳ **Credit Summary Visualization** - Helpful for admins
3. ⏳ **Bulk Operations** - Time saver

### Low Priority (P2)
1. ⏳ **Program Templates** - Nice to have
2. ⏳ **Subject Recommendations** - AI-powered feature
3. ⏳ **Advanced Reporting** - Analytics

## Recommended Implementation Order

### Session 1: Timeslot Configuration (3-4 hours)
1. Create Server Actions for CRUD
2. Build TimeslotDataGrid component
3. Add TimeslotEditorDialog
4. Implement validation
5. Test

### Session 2: Program Management (3-4 hours)
1. Migrate to MUI v7
2. Create ProgramWizard
3. Enhance SubjectSelectionGrid
4. Add credit summary visualization
5. Test

### Session 3: Bulk Operations (2-3 hours)
1. Copy from previous term
2. Program templates
3. Subject recommendations
4. Test

### Session 4: Polish & Integration (1-2 hours)
1. Responsive design
2. Accessibility
3. Documentation
4. Final testing

**Total Estimated Time:** 9-13 hours

## Success Metrics

### Must Have
- ✅ Full CRUD for timeslots
- ✅ Program wizard functional
- ✅ MOE validation passing
- ✅ All MUI v7 components
- ✅ Zero TypeScript errors
- ✅ Mobile responsive

### Should Have
- ✅ Bulk operations
- ✅ Credit visualization
- ✅ Copy from previous year
- ✅ Validation improvements

### Nice to Have
- ⏳ Program templates
- ⏳ AI recommendations
- ⏳ Advanced analytics

## Next Steps

1. **Get User Feedback** on priorities
2. **Start with Timeslot Configuration** (highest priority)
3. **Create Feature Branch** `feature/config-teaching-assignment`
4. **Begin Implementation**

## Questions for User

1. **Priority:** Which system is more urgent - Timeslot Config or Program Management?
2. **Features:** Any specific features needed for the new school term?
3. **Timeline:** When is this needed by?
4. **Scope:** Full implementation or MVP first?

---

**Status:** Ready for user feedback and prioritization  
**Next Action:** Await user input on priorities
