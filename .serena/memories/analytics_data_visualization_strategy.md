# Analytics Dashboard - Data Visualization Strategy
**School Timetable Management System**  
**Date:** October 31, 2025

---

## 1. Overview

This document outlines the comprehensive data visualization strategy for the Analytics Dashboard (`/dashboard/[semesterAndyear]/analytics/page.tsx`), focusing on providing actionable insights for school administrators using the School Timetable Management System.

### Goals
1. **Identify scheduling bottlenecks** - Highlight resource conflicts and inefficiencies
2. **Monitor workload balance** - Ensure fair distribution of teaching hours
3. **Optimize resource utilization** - Maximize efficient use of rooms and timeslots
4. **Ensure curriculum compliance** - Track mandatory subject coverage and credit requirements
5. **Enable data-driven decisions** - Provide clear metrics for schedule improvements

### Tech Stack (Available)
- ✅ **Recharts 3.3.0** - Primary charting library
- ✅ **MUI 7.3.4** - Cards, tables, data display components
- ✅ **Tailwind CSS 4.1.14** - Styling and layouts
- ✅ **Prisma 6.18.0** - Data aggregation queries
- ✅ **TypeScript** - Type-safe data transformations

---

## 2. Data Sources & Queries

### Available Database Models

```prisma
✅ class_schedule    # Core: ClassID, TimeslotID, SubjectCode, RoomID, GradeID, IsLocked
✅ teacher           # TeacherID, Name, Department, Email
✅ teachers_responsibility  # Links teachers to class_schedule
✅ subject           # SubjectCode, Name, Credit, Category, LearningArea, ActivityType
✅ timeslot          # TimeslotID, AcademicYear, Semester, StartTime, EndTime, DayOfWeek, Breaktime
✅ room              # RoomID, RoomName, Building, Floor
✅ gradelevel        # GradeID, Year, Number, StudentCount, ProgramID
✅ program           # ProgramID, Code, Name, Year, Track, MinTotalCredits
✅ program_subject   # Links subjects to programs (mandatory/elective tracking)
```

### Key Indexes for Performance
```prisma
✅ class_schedule_timeslot_grade_idx  # Fast conflict detection
✅ class_schedule_timeslot_room_idx   # Room utilization queries
✅ class_schedule_grade_locked_idx    # Filter by locked status
✅ timeslot_term_day_idx              # Timeslot filtering
```

---

## 3. Analytics Sections (Priority Order)

### 🎯 **Section 1: Schedule Overview Dashboard** (Priority 1)

**Purpose:** High-level health check of semester schedule

#### Metrics to Display

**Top Stats Cards (4 cards in grid)**
```typescript
type OverviewStats = {
  totalScheduledHours: number;      // Count of all class_schedule entries
  completionRate: number;           // Percentage of required hours scheduled
  activeTeachers: number;           // Teachers with >= 1 responsibility
  scheduleConflicts: number;        // Detected conflicts (overlapping timeslots)
};
```

**Data Query Strategy:**
```typescript
// src/features/analytics/infrastructure/repositories/overview.repository.ts
export async function getOverviewStats(configId: string) {
  const [semester, academicYear] = configId.split('-');
  
  const [
    totalScheduled,
    activeTeachers,
    totalTimeslots,
    requiredHours,
  ] = await Promise.all([
    // Count scheduled classes
    prisma.class_schedule.count({
      where: {
        timeslot: {
          AcademicYear: parseInt(academicYear),
          Semester: semester as semester,
        },
      },
    }),
    
    // Count unique teachers with assignments
    prisma.teachers_responsibility.groupBy({
      by: ['TeacherID'],
      where: {
        class_schedule: {
          timeslot: {
            AcademicYear: parseInt(academicYear),
            Semester: semester as semester,
          },
        },
      },
    }).then(res => res.length),
    
    // Count total available timeslots
    prisma.timeslot.count({
      where: {
        AcademicYear: parseInt(academicYear),
        Semester: semester as semester,
      },
    }),
    
    // Calculate required hours (grades * timeslots)
    prisma.gradelevel.count().then(gradeCount => gradeCount * totalTimeslots),
  ]);
  
  return {
    totalScheduledHours: totalScheduled,
    completionRate: (totalScheduled / requiredHours) * 100,
    activeTeachers,
    scheduleConflicts: 0, // TODO: Implement conflict detection
  };
}
```

**Visualization:**
- **Component:** MUI `Card` with stat display
- **Layout:** 4-column grid (responsive: 1 col mobile, 2 cols tablet, 4 cols desktop)
- **Icons:** MUI icons (Schedule, CheckCircle, Person, Warning)
- **Colors:** Blue (scheduled), Green (completion), Purple (teachers), Red (conflicts)

---

### 🎯 **Section 2: Teacher Workload Analysis** (Priority 2)

**Purpose:** Ensure fair distribution of teaching hours across teachers

#### 2.1 Teacher Hours Distribution (Histogram)

**Data Structure:**
```typescript
type TeacherWorkload = {
  teacherId: number;
  teacherName: string;
  department: string;
  totalHours: number;
  classCount: number;
  utilizationRate: number; // Percentage of available hours
};
```

**Query:**
```typescript
export async function getTeacherWorkloads(configId: string) {
  const [semester, academicYear] = configId.split('-');
  
  const teachers = await prisma.teacher.findMany({
    include: {
      teachers_responsibility: {
        where: {
          class_schedule: {
            timeslot: {
              AcademicYear: parseInt(academicYear),
              Semester: semester as semester,
            },
          },
        },
        include: {
          class_schedule: true,
        },
      },
    },
  });
  
  return teachers.map(teacher => ({
    teacherId: teacher.TeacherID,
    teacherName: `${teacher.Prefix}${teacher.Firstname} ${teacher.Lastname}`,
    department: teacher.Department,
    totalHours: teacher.teachers_responsibility.length,
    classCount: new Set(teacher.teachers_responsibility.map(r => r.class_schedule.GradeID)).size,
    utilizationRate: (teacher.teachers_responsibility.length / TOTAL_TIMESLOTS) * 100,
  }));
}
```

**Visualization:**
- **Chart Type:** Horizontal Bar Chart (Recharts `BarChart` with `layout="vertical"`)
- **X-Axis:** Teaching hours (0-40 range)
- **Y-Axis:** Teacher names (truncate if > 15 characters)
- **Colors:** 
  - 🟢 Green (0-20 hours) - Underutilized
  - 🟡 Yellow (21-30 hours) - Optimal
  - 🟠 Orange (31-35 hours) - High load
  - 🔴 Red (36+ hours) - Overloaded
- **Interactivity:** Tooltip shows department, class count, utilization %
- **Sorting:** Default by hours (descending), allow toggle to alphabetical

**Component Reference:**
```tsx
// Based on existing: src/app/(public)/_components/Charts.tsx
<TeacherUtilizationChart 
  data={teacherWorkloads.map(t => ({
    name: t.teacherName,
    hours: t.totalHours,
    color: getWorkloadColor(t.totalHours),
  }))}
/>
```

#### 2.2 Department Comparison (Bar Chart)

**Data Structure:**
```typescript
type DepartmentWorkload = {
  department: string;
  teacherCount: number;
  avgHoursPerTeacher: number;
  totalHours: number;
  minHours: number;
  maxHours: number;
};
```

**Query:**
```typescript
export async function getDepartmentWorkloads(configId: string) {
  const teacherWorkloads = await getTeacherWorkloads(configId);
  
  const deptMap = new Map<string, number[]>();
  teacherWorkloads.forEach(t => {
    if (!deptMap.has(t.department)) deptMap.set(t.department, []);
    deptMap.get(t.department)!.push(t.totalHours);
  });
  
  return Array.from(deptMap.entries()).map(([dept, hours]) => ({
    department: dept,
    teacherCount: hours.length,
    avgHoursPerTeacher: hours.reduce((a, b) => a + b, 0) / hours.length,
    totalHours: hours.reduce((a, b) => a + b, 0),
    minHours: Math.min(...hours),
    maxHours: Math.max(...hours),
  }));
}
```

**Visualization:**
- **Chart Type:** Grouped Bar Chart (avg/min/max side-by-side per department)
- **X-Axis:** Department names
- **Y-Axis:** Hours
- **Bars:** 3 bars per department (min, avg, max)
- **Colors:** Blue (avg), Gray (min), Red (max)
- **Tooltip:** Show all 3 values + teacher count

---

### 🎯 **Section 3: Room Utilization Analysis** (Priority 3)

**Purpose:** Optimize classroom usage and identify underutilized spaces

#### 3.1 Room Occupancy Heatmap

**Data Structure:**
```typescript
type RoomOccupancy = {
  roomId: number;
  roomName: string;
  building: string;
  dayOccupancy: {
    day: string; // MON, TUE, WED, THU, FRI
    periods: {
      period: number; // 1-8
      isOccupied: boolean;
    }[];
  }[];
  occupancyRate: number; // Percentage of occupied slots
};
```

**Query:**
```typescript
export async function getRoomOccupancy(configId: string) {
  const [semester, academicYear] = configId.split('-');
  
  const rooms = await prisma.room.findMany({
    include: {
      class_schedule: {
        where: {
          timeslot: {
            AcademicYear: parseInt(academicYear),
            Semester: semester as semester,
          },
        },
        include: {
          timeslot: true,
        },
      },
    },
  });
  
  return rooms.map(room => {
    const schedulesByDay = groupBy(room.class_schedule, cs => cs.timeslot.DayOfWeek);
    const totalSlots = DAYS.length * PERIODS_PER_DAY;
    const occupiedSlots = room.class_schedule.length;
    
    return {
      roomId: room.RoomID,
      roomName: room.RoomName,
      building: room.Building,
      dayOccupancy: DAYS.map(day => ({
        day,
        periods: Array.from({ length: PERIODS_PER_DAY }, (_, i) => ({
          period: i + 1,
          isOccupied: schedulesByDay[day]?.some(cs => 
            extractPeriodFromTimeslotId(cs.TimeslotID) === i + 1
          ) || false,
        })),
      })),
      occupancyRate: (occupiedSlots / totalSlots) * 100,
    };
  });
}
```

**Visualization:**
- **Chart Type:** Custom Heatmap Grid (inspired by existing `RoomOccupancyGrid`)
- **Layout:** Grid with days as columns, periods as rows
- **Colors:**
  - 🔴 Red (80-100%) - Heavily used
  - 🟠 Orange (60-79%) - Well used
  - 🟡 Yellow (40-59%) - Moderately used
  - 🟢 Green (20-39%) - Lightly used
  - ⚪ Gray (0-19%) - Rarely used
- **Interactivity:** Click cell to see class details
- **Filters:** Filter by building, sort by occupancy rate

**Component Reference:**
```tsx
// Based on: src/app/(public)/_components/Charts.tsx
<RoomOccupancyGrid 
  data={roomOccupancy.map(r => r.dayOccupancy.flat())} 
  days={DAYS}
/>
```

#### 3.2 Room Utilization Ranking (Table)

**Visualization:**
- **Component:** MUI `DataGrid` or custom table
- **Columns:** Room Name, Building, Occupied Slots, Total Slots, Utilization %, Status Badge
- **Sorting:** Default by utilization % (descending)
- **Status Badge:**
  - 🔴 "Over-utilized" (>90%)
  - 🟢 "Well-utilized" (70-90%)
  - 🟡 "Under-utilized" (50-69%)
  - ⚪ "Rarely used" (<50%)

---

### 🎯 **Section 4: Subject Distribution Analysis** (Priority 4)

**Purpose:** Monitor curriculum balance and subject coverage

#### 4.1 Subject Category Breakdown (Pie Chart)

**Data Structure:**
```typescript
type SubjectDistribution = {
  category: SubjectCategory; // CORE, ADDITIONAL, ACTIVITY, ELECTIVE
  learningArea?: LearningArea; // THAI, MATH, SCIENCE, etc.
  totalHours: number;
  percentage: number;
  subjectCount: number;
};
```

**Query:**
```typescript
export async function getSubjectDistribution(configId: string) {
  const [semester, academicYear] = configId.split('-');
  
  const schedules = await prisma.class_schedule.findMany({
    where: {
      timeslot: {
        AcademicYear: parseInt(academicYear),
        Semester: semester as semester,
      },
    },
    include: {
      subject: true,
    },
  });
  
  const categoryMap = new Map<SubjectCategory, number>();
  schedules.forEach(cs => {
    const count = categoryMap.get(cs.subject.Category) || 0;
    categoryMap.set(cs.subject.Category, count + 1);
  });
  
  const total = schedules.length;
  
  return Array.from(categoryMap.entries()).map(([category, hours]) => ({
    category,
    totalHours: hours,
    percentage: (hours / total) * 100,
    subjectCount: new Set(schedules.filter(cs => cs.subject.Category === category).map(cs => cs.SubjectCode)).size,
  }));
}
```

**Visualization:**
- **Chart Type:** Recharts `PieChart` with `Cell` coloring
- **Colors:** 
  - 🔵 Blue (CORE)
  - 🟢 Green (ADDITIONAL)
  - 🟡 Yellow (ACTIVITY)
  - 🟣 Purple (ELECTIVE)
- **Labels:** Show percentage + category name
- **Legend:** Bottom position with subject count
- **Tooltip:** Show hours, percentage, subject count

#### 4.2 Learning Area Distribution (Bar Chart)

**Data Structure:**
```typescript
type LearningAreaDistribution = {
  learningArea: LearningArea;
  totalHours: number;
  requiredHours: number; // From MOE standards
  complianceRate: number; // (total / required) * 100
};
```

**Visualization:**
- **Chart Type:** Stacked Bar Chart
- **X-Axis:** Learning areas (THAI, MATH, SCIENCE, SOCIAL, etc.)
- **Y-Axis:** Hours
- **Bars:** 2 stacks (scheduled hours, required hours)
- **Colors:** Blue (scheduled), Gray outline (required)
- **Highlight:** Red border if scheduled < required (non-compliance)

---

### 🎯 **Section 5: Schedule Quality Metrics** (Priority 5)

**Purpose:** Track schedule completeness and identify issues

#### 5.1 Completion Progress (Gauge Chart)

**Data Structure:**
```typescript
type CompletionMetrics = {
  totalRequiredSlots: number;    // grades * timeslots
  totalScheduledSlots: number;   // count of class_schedule
  completionRate: number;        // percentage
  lockedSchedules: number;       // IsLocked = true count
  unlocked Schedules: number;    // IsLocked = false count
  emptySlots: number;            // required - scheduled
};
```

**Visualization:**
- **Chart Type:** Recharts `RadialBarChart` (gauge/semi-circle)
- **Value:** Completion percentage (0-100%)
- **Colors:** Gradient from red (0%) to green (100%)
- **Center Text:** Large percentage value
- **Sub-text:** "{scheduled} / {required} slots filled"

#### 5.2 Lock Status Summary (Donut Chart)

**Visualization:**
- **Chart Type:** Recharts `PieChart` with inner radius (donut)
- **Segments:** Locked (green), Unlocked (yellow), Empty (gray)
- **Center Text:** Total schedule count
- **Legend:** Show counts and percentages

---

### 🎯 **Section 6: Time Analysis** (Priority 6)

**Purpose:** Identify peak and off-peak teaching times

#### 6.1 Period Load Distribution (Line Chart)

**Data Structure:**
```typescript
type PeriodLoad = {
  period: number; // 1-8
  periodLabel: string; // "08:00-09:00"
  totalScheduled: number;
  avgClassesPerDay: number;
  peakDay: string; // Day with most schedules in this period
};
```

**Query:**
```typescript
export async function getPeriodLoad(configId: string) {
  const [semester, academicYear] = configId.split('-');
  
  const schedules = await prisma.class_schedule.findMany({
    where: {
      timeslot: {
        AcademicYear: parseInt(academicYear),
        Semester: semester as semester,
      },
    },
    include: {
      timeslot: true,
    },
  });
  
  const periodMap = new Map<number, { total: number; byDay: Map<string, number> }>();
  
  schedules.forEach(cs => {
    const period = extractPeriodFromTimeslotId(cs.TimeslotID);
    if (!periodMap.has(period)) {
      periodMap.set(period, { total: 0, byDay: new Map() });
    }
    const data = periodMap.get(period)!;
    data.total++;
    data.byDay.set(cs.timeslot.DayOfWeek, (data.byDay.get(cs.timeslot.DayOfWeek) || 0) + 1);
  });
  
  return Array.from(periodMap.entries()).map(([period, data]) => ({
    period,
    periodLabel: formatPeriodTime(period),
    totalScheduled: data.total,
    avgClassesPerDay: data.total / 5,
    peakDay: Array.from(data.byDay.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || '-',
  }));
}
```

**Visualization:**
- **Chart Type:** Recharts `LineChart` with `Area` fill
- **X-Axis:** Period labels (time ranges)
- **Y-Axis:** Number of scheduled classes
- **Line:** Blue with gradient fill
- **Dot:** Show peak periods with red dots
- **Tooltip:** Show avg per day, peak day

#### 6.2 Day of Week Comparison (Bar Chart)

**Data Structure:**
```typescript
type DayLoad = {
  day: string; // MON, TUE, etc.
  dayLabel: string; // "จันทร์", "อังคาร"
  totalScheduled: number;
  avgPerPeriod: number;
  breaktimeCount: number; // Count of breaktime slots
};
```

**Visualization:**
- **Chart Type:** Recharts `BarChart`
- **X-Axis:** Day names (Thai labels)
- **Y-Axis:** Total scheduled classes
- **Colors:** Gradient blue
- **Tooltip:** Show avg per period, breaktime count

---

### 🎯 **Section 7: Curriculum Compliance** (Priority 7)

**Purpose:** Ensure programs meet MOE standards and credit requirements

#### 7.1 Program Credit Tracking (Table + Progress Bars)

**Data Structure:**
```typescript
type ProgramCompliance = {
  programId: number;
  programCode: string;
  programName: string;
  year: number;
  track: ProgramTrack;
  minTotalCredits: number;
  
  scheduledCredits: {
    core: number;
    additional: number;
    activity: number;
    elective: number;
    total: number;
  };
  
  requiredCredits: {
    core: number;
    additional: number;
    activity: number;
    elective: number;
    total: number;
  };
  
  complianceRate: number; // (scheduled / required) * 100
  missingSubjects: string[]; // SubjectCodes not yet scheduled
};
```

**Query:**
```typescript
export async function getProgramCompliance(configId: string) {
  const [semester, academicYear] = configId.split('-');
  const year = parseInt(academicYear) - 2500; // Convert Buddhist to grade year
  
  const programs = await prisma.program.findMany({
    where: {
      Year: year,
      IsActive: true,
    },
    include: {
      program_subject: {
        include: {
          subject: true,
        },
      },
      gradelevel: {
        include: {
          class_schedule: {
            where: {
              timeslot: {
                AcademicYear: parseInt(academicYear),
                Semester: semester as semester,
              },
            },
            include: {
              subject: true,
            },
          },
        },
      },
    },
  });
  
  return programs.map(program => {
    // Calculate scheduled credits by category
    const scheduledCredits = calculateScheduledCredits(program.gradelevel);
    
    // Calculate required credits from program_subject
    const requiredCredits = calculateRequiredCredits(program.program_subject);
    
    // Find missing mandatory subjects
    const scheduledSubjectCodes = new Set(
      program.gradelevel.flatMap(g => g.class_schedule.map(cs => cs.SubjectCode))
    );
    const missingSubjects = program.program_subject
      .filter(ps => ps.IsMandatory && !scheduledSubjectCodes.has(ps.SubjectCode))
      .map(ps => ps.SubjectCode);
    
    return {
      programId: program.ProgramID,
      programCode: program.ProgramCode,
      programName: program.ProgramName,
      year: program.Year,
      track: program.Track,
      minTotalCredits: program.MinTotalCredits,
      scheduledCredits,
      requiredCredits,
      complianceRate: (scheduledCredits.total / requiredCredits.total) * 100,
      missingSubjects,
    };
  });
}
```

**Visualization:**
- **Component:** MUI `Accordion` with nested tables
- **Layout:** One accordion per program
- **Header:** Program name, compliance rate (colored badge)
- **Content:**
  - Progress bars for each category (core, additional, activity, elective)
  - Color: Green (≥100%), Yellow (80-99%), Red (<80%)
  - Table of missing mandatory subjects
  - Total credits summary

#### 7.2 Mandatory Subject Coverage (Checklist)

**Visualization:**
- **Component:** MUI `List` with checkboxes (read-only)
- **Items:** All mandatory subjects from program_subject
- **Status:** ✅ Scheduled, ❌ Missing
- **Details:** Show which grade levels have scheduled the subject

---

## 4. Component Architecture

### Folder Structure

```
src/
├── features/
│   └── analytics/
│       ├── application/
│       │   ├── actions/
│       │   │   └── analytics.actions.ts        # Server Actions
│       │   └── schemas/
│       │       └── analytics.schemas.ts        # Valibot validation
│       ├── domain/
│       │   └── services/
│       │       ├── calculation.service.ts      # Pure calculations
│       │       └── aggregation.service.ts      # Data aggregation logic
│       ├── infrastructure/
│       │   └── repositories/
│       │       ├── overview.repository.ts      # Section 1 queries
│       │       ├── teacher.repository.ts       # Section 2 queries
│       │       ├── room.repository.ts          # Section 3 queries
│       │       ├── subject.repository.ts       # Section 4 queries
│       │       ├── quality.repository.ts       # Section 5 queries
│       │       ├── time.repository.ts          # Section 6 queries
│       │       └── compliance.repository.ts    # Section 7 queries
│       └── presentation/
│           ├── components/
│           │   ├── OverviewSection.tsx
│           │   ├── TeacherWorkloadSection.tsx
│           │   ├── RoomUtilizationSection.tsx
│           │   ├── SubjectDistributionSection.tsx
│           │   ├── QualityMetricsSection.tsx
│           │   ├── TimeAnalysisSection.tsx
│           │   └── ComplianceSection.tsx
│           └── charts/
│               ├── WorkloadBarChart.tsx        # Reusable chart components
│               ├── OccupancyHeatmap.tsx
│               ├── SubjectPieChart.tsx
│               ├── CompletionGauge.tsx
│               └── PeriodLineChart.tsx
└── app/
    └── dashboard/
        └── [semesterAndyear]/
            └── analytics/
                └── page.tsx                    # Main analytics page
```

### Page Component Pattern

```tsx
// src/app/dashboard/[semesterAndyear]/analytics/page.tsx
import { Suspense } from 'react';
import { getOverviewStats } from '@/features/analytics/infrastructure/repositories/overview.repository';
import { OverviewSection } from '@/features/analytics/presentation/components/OverviewSection';
// ... other imports

export default async function AnalyticsPage({
  params,
}: {
  params: Promise<{ semesterAndyear: string }>;
}) {
  const { semesterAndyear } = await params;
  
  // Fetch all data in parallel
  const [
    overviewStats,
    teacherWorkloads,
    roomOccupancy,
    subjectDist,
    qualityMetrics,
    periodLoad,
    programCompliance,
  ] = await Promise.all([
    getOverviewStats(semesterAndyear),
    getTeacherWorkloads(semesterAndyear),
    getRoomOccupancy(semesterAndyear),
    getSubjectDistribution(semesterAndyear),
    getCompletionMetrics(semesterAndyear),
    getPeriodLoad(semesterAndyear),
    getProgramCompliance(semesterAndyear),
  ]);
  
  return (
    <div className="space-y-8 p-6">
      <h1 className="text-3xl font-bold">วิเคราะห์ข้อมูลตารางเรียน</h1>
      
      {/* Section 1: Overview */}
      <Suspense fallback={<OverviewSkeleton />}>
        <OverviewSection stats={overviewStats} />
      </Suspense>
      
      {/* Section 2: Teacher Workload */}
      <Suspense fallback={<WorkloadSkeleton />}>
        <TeacherWorkloadSection workloads={teacherWorkloads} />
      </Suspense>
      
      {/* Section 3: Room Utilization */}
      <Suspense fallback={<RoomSkeleton />}>
        <RoomUtilizationSection occupancy={roomOccupancy} />
      </Suspense>
      
      {/* Section 4: Subject Distribution */}
      <Suspense fallback={<SubjectSkeleton />}>
        <SubjectDistributionSection distribution={subjectDist} />
      </Suspense>
      
      {/* Section 5: Quality Metrics */}
      <Suspense fallback={<QualitySkeleton />}>
        <QualityMetricsSection metrics={qualityMetrics} />
      </Suspense>
      
      {/* Section 6: Time Analysis */}
      <Suspense fallback={<TimeSkeleton />}>
        <TimeAnalysisSection periodLoad={periodLoad} />
      </Suspense>
      
      {/* Section 7: Curriculum Compliance */}
      <Suspense fallback={<ComplianceSkeleton />}>
        <ComplianceSection compliance={programCompliance} />
      </Suspense>
    </div>
  );
}
```

---

## 5. Performance Optimization

### Query Optimization

1. **Parallel Fetching** - Use `Promise.all()` to fetch all sections simultaneously
2. **Selective Includes** - Only include related data needed for calculations
3. **Indexed Queries** - Leverage existing Prisma indexes
4. **Memoization** - Cache expensive calculations in domain services

### Rendering Optimization

1. **Server Components** - Fetch data at page level (no client-side SWR needed)
2. **Suspense Boundaries** - Each section independently suspends
3. **Skeleton Loaders** - Show loading states while data fetches
4. **Code Splitting** - Lazy load chart components

### Caching Strategy

```typescript
// src/app/dashboard/[semesterAndyear]/analytics/page.tsx
export const revalidate = 60 * 10; // Revalidate every 10 minutes

export async function generateStaticParams() {
  // Pre-generate for current and next semester
  const semesters = await prisma.timeslot.groupBy({
    by: ['AcademicYear', 'Semester'],
  });
  
  return semesters.map(s => ({
    semesterAndyear: `${s.Semester}-${s.AcademicYear}`,
  }));
}
```

---

## 6. UI/UX Considerations

### Layout Design

```
┌─────────────────────────────────────────────────────────┐
│ 📊 วิเคราะห์ข้อมูลตารางเรียน                              │
├─────────────────────────────────────────────────────────┤
│ [Overview Section]                                       │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│ │ Total   │ │Complete │ │Teachers │ │Conflicts│       │
│ │ Hours   │ │ Rate    │ │ Active  │ │ Count   │       │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘       │
├─────────────────────────────────────────────────────────┤
│ [Teacher Workload Section]                               │
│ 📈 กระจายภาระงานสอน                                      │
│ ┌─────────────────────────────────────────────────┐     │
│ │ [Horizontal Bar Chart: Teacher Hours]           │     │
│ └─────────────────────────────────────────────────┘     │
│ ┌─────────────────────────────────────────────────┐     │
│ │ [Grouped Bar Chart: Department Comparison]      │     │
│ └─────────────────────────────────────────────────┘     │
├─────────────────────────────────────────────────────────┤
│ [Room Utilization Section]                               │
│ 🏫 การใช้ห้องเรียน                                       │
│ ┌─────────────────────────────────────────────────┐     │
│ │ [Heatmap Grid: Room Occupancy by Day/Period]    │     │
│ └─────────────────────────────────────────────────┘     │
│ ┌─────────────────────────────────────────────────┐     │
│ │ [Table: Room Utilization Ranking]               │     │
│ └─────────────────────────────────────────────────┘     │
├─────────────────────────────────────────────────────────┤
│ [Subject Distribution Section]                           │
│ 📚 การกระจายรายวิชา                                      │
│ ┌──────────────┐ ┌──────────────────────────────┐       │
│ │ [Pie Chart:  │ │ [Bar Chart: Learning Area   │       │
│ │  Category]   │ │  Distribution]              │       │
│ └──────────────┘ └──────────────────────────────┘       │
└─────────────────────────────────────────────────────────┘
```

### Responsive Breakpoints

```css
/* Mobile: 1 column, stacked charts */
@media (max-width: 768px) {
  grid-template-columns: 1fr;
}

/* Tablet: 2 columns */
@media (min-width: 769px) and (max-width: 1024px) {
  grid-template-columns: repeat(2, 1fr);
}

/* Desktop: 4 columns for stats, 2 for charts */
@media (min-width: 1025px) {
  .stats-grid { grid-template-columns: repeat(4, 1fr); }
  .charts-grid { grid-template-columns: repeat(2, 1fr); }
}
```

### Thai Language Labels

All UI text in Thai:
- Section headers: "ภาพรวมตารางเรียน", "กระจายภาระงานสอน", etc.
- Chart labels: "ชั่วโมงสอน", "อัตราการใช้งาน", "ห้องเรียน"
- Status badges: "สมบูรณ์", "ไม่สมบูรณ์", "ปกติ", "เกินโหลด"
- Tooltips: Show values in Thai format (e.g., "20 ชั่วโมง", "85%")

---

## 7. Testing Strategy

### Unit Tests (Jest)

**Test Domain Services:**
```typescript
// __test__/features/analytics/calculation.service.test.ts
describe('calculateCompletionRate', () => {
  it('should calculate correct completion rate', () => {
    const result = calculateCompletionRate(80, 100);
    expect(result).toBe(80);
  });
  
  it('should handle zero required slots', () => {
    const result = calculateCompletionRate(0, 0);
    expect(result).toBe(0);
  });
});
```

**Test Repositories (Mock Prisma):**
```typescript
// __test__/features/analytics/overview.repository.test.ts
describe('getOverviewStats', () => {
  it('should fetch and aggregate stats correctly', async () => {
    const mockPrisma = {
      class_schedule: { count: jest.fn().mockResolvedValue(120) },
      teachers_responsibility: { groupBy: jest.fn().mockResolvedValue([{ TeacherID: 1 }]) },
    };
    
    const stats = await getOverviewStats('1-2567', mockPrisma);
    
    expect(stats.totalScheduledHours).toBe(120);
    expect(stats.activeTeachers).toBe(1);
  });
});
```

### E2E Tests (Playwright)

**Test Analytics Page:**
```typescript
// e2e/analytics.spec.ts
test('should display analytics dashboard', async ({ page }) => {
  await page.goto('/dashboard/1-2567/analytics');
  
  // Check overview stats are visible
  await expect(page.locator('text=ภาพรวมตารางเรียน')).toBeVisible();
  await expect(page.locator('text=ชั่วโมงทั้งหมด')).toBeVisible();
  
  // Check charts are rendered
  await expect(page.locator('.recharts-wrapper')).toHaveCount(7);
  
  // Check teacher workload chart
  await expect(page.locator('text=กระจายภาระงานสอน')).toBeVisible();
});

test('should handle empty data gracefully', async ({ page }) => {
  // Test with semester that has no data
  await page.goto('/dashboard/3-2570/analytics');
  
  await expect(page.locator('text=ไม่มีข้อมูล')).toBeVisible();
});
```

---

## 8. Implementation Timeline

### Phase 1: Foundation (Week 1)
- ✅ Setup analytics feature folder structure
- ✅ Create repository layer for all 7 sections
- ✅ Create domain services for calculations
- ✅ Setup analytics page route

### Phase 2: Core Visualizations (Week 2)
- ✅ Implement Section 1: Overview Dashboard
- ✅ Implement Section 2: Teacher Workload Analysis
- ✅ Implement Section 3: Room Utilization Analysis
- ✅ Create reusable chart components

### Phase 3: Advanced Analytics (Week 3)
- ✅ Implement Section 4: Subject Distribution
- ✅ Implement Section 5: Quality Metrics
- ✅ Implement Section 6: Time Analysis
- ✅ Add interactivity (filtering, sorting)

### Phase 4: Compliance & Polish (Week 4)
- ✅ Implement Section 7: Curriculum Compliance
- ✅ Add skeleton loaders
- ✅ Mobile responsive design
- ✅ Accessibility improvements
- ✅ Performance optimization

### Phase 5: Testing & Documentation (Week 5)
- ✅ Unit tests for all services
- ✅ E2E tests for analytics page
- ✅ Update documentation
- ✅ User acceptance testing

---

## 9. Future Enhancements

### Export Capabilities
- **PDF Report** - Generate comprehensive analytics report
- **Excel Export** - Export raw data for offline analysis
- **Scheduled Reports** - Email daily/weekly summaries

### Advanced Features
- **Trend Analysis** - Compare current semester with historical data
- **Predictive Analytics** - Forecast future scheduling needs
- **What-If Scenarios** - Test schedule changes before applying
- **Automated Recommendations** - AI-powered scheduling suggestions

### Real-Time Updates
- **Live Dashboard** - WebSocket updates when schedules change
- **Notification System** - Alert admins of conflicts or issues
- **Collaborative Analytics** - Multi-user viewing with comments

---

## 10. Success Metrics

### User Impact
- ✅ **Time Savings** - Reduce schedule review time by 50%
- ✅ **Conflict Reduction** - Decrease scheduling conflicts by 80%
- ✅ **Resource Optimization** - Increase room utilization by 20%
- ✅ **Curriculum Compliance** - 100% mandatory subject coverage

### Technical Metrics
- ✅ **Page Load Time** - < 3 seconds for full dashboard
- ✅ **Query Performance** - All queries < 500ms
- ✅ **Error Rate** - < 0.1% for data fetching
- ✅ **Test Coverage** - > 80% for analytics features

---

## Summary

This data visualization strategy provides a comprehensive roadmap for building an analytics dashboard that empowers school administrators with actionable insights. By leveraging existing tools (Recharts, MUI, Prisma) and following clean architecture patterns, we can deliver a performant, maintainable, and user-friendly analytics experience.

**Key Takeaways:**
1. **7 Priority Sections** - From overview stats to curriculum compliance
2. **Existing Tech Stack** - No new dependencies needed
3. **Clean Architecture** - Repository → Service → Action → Component
4. **Performance First** - Parallel queries, Server Components, caching
5. **Thai Language** - All UI text localized
6. **Mobile Responsive** - Works on all devices
7. **Test Coverage** - Unit + E2E tests for reliability
8. **5-Week Timeline** - Phased implementation plan

Ready to start implementation! 🚀
