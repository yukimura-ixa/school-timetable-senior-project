# Bug Fixes & Dashboard Improvements Plan

## Date: October 30, 2025

## Current State Analysis

### Existing Bugs Found

#### 1. **SelectRoomName.tsx** - Unused Variables & Code Quality Issues
**Location**: `src/app/schedule/[semesterAndyear]/lock/component/SelectRoomName.tsx`

**Issues**:
- Line 5: `BsInfo` imported but never used
- Line 16: `isLoading`, `error`, `mutate` destructured but never used
- Line 19: `searchText` state variable never used
- Line 26: `text` should be `const` instead of `let` (never reassigned)
- Line 32: `res` should be `const` instead of `let` (never reassigned)

**Impact**: Low - Code linting errors, no functional impact but reduces code quality

**Fix Priority**: Medium - Easy cleanup, improves maintainability

---

#### 2. **use-class-schedules.ts** - Unsafe Any Type Destructuring
**Location**: `src/hooks/use-class-schedules.ts`

**Issues**:
- Line 28: `useSWR` destructuring has unsafe `any` value
- Line 45: `error` assignment is unsafe `any` value

**Impact**: Medium - Type safety issue, could lead to runtime errors

**Fix Priority**: Medium - Should add proper type annotations

---

#### 3. **Prisma Schema Duplication** (False Positive)
**Location**: `prisma/generated/schema.prisma`

**Issues**: Multiple "duplicate definition" errors for all models and enums

**Analysis**: This is a GENERATED file. The errors are likely false positives from the IDE/linter reading both the source `prisma/schema.prisma` and the generated version.

**Impact**: None - Generated file, can be ignored

**Fix Priority**: Low - Configure `.gitignore` or IDE to exclude generated files from linting

---

### Dashboard Pages Analysis

#### Current Dashboard Structure

```
src/app/
├── (public)/
│   ├── page.tsx                    # PUBLIC HOMEPAGE (statistics, search teachers/classes)
│   └── _components/                # QuickStats, MiniCharts, Tables, Pagination
│
├── dashboard/
│   ├── select-semester/
│   │   └── page.tsx               # Semester selection page
│   └── [semesterAndyear]/
│       ├── all-program/
│       │   └── page.tsx           # Program overview
│       ├── all-timeslot/
│       │   └── page.tsx           # Timeslot overview
│       ├── student-table/
│       │   └── page.tsx           # STUDENT TIMETABLE VIEW
│       └── teacher-table/
│           └── page.tsx           # TEACHER TIMETABLE VIEW
```

#### Key Observations

1. **No Main Dashboard Landing Page**
   - `/dashboard/select-semester/page.tsx` serves as entry point
   - No analytics dashboard for admins
   - No statistics or insights for the selected semester

2. **Student Table Page** (`student-table/page.tsx`)
   - **Purpose**: Display class timetables
   - **Features**: 
     - Grade level selection dropdown
     - Export to Excel/PDF
     - Timetable grid view
   - **Data Flow**: Fetches timeslots + class schedules via SWR
   - **State Management**: Local state for selected grade

3. **Teacher Table Page** (`teacher-table/page.tsx`)
   - **Purpose**: Display teacher timetables
   - **Features**:
     - Teacher selection dropdown
     - Export to Excel/PDF
     - Timetable grid view
   - **Data Flow**: Fetches timeslots + class schedules + teacher info via SWR
   - **State Management**: Local state for selected teacher

4. **Public Homepage** (`(public)/page.tsx`)
   - **Purpose**: Public-facing homepage with statistics
   - **Features**:
     - Quick stats cards (teacher count, class count, etc.)
     - Mini charts for data visualization
     - Searchable teacher/class tables
     - Pagination
     - Tab navigation (teachers vs classes)
   - **Architecture**: Uses Suspense boundaries for progressive loading
   - **Performance**: Data revalidation commented out (build investigation)

---

## Improvement Ideas

### 🎯 Priority 1: Create Main Dashboard Landing Page

**Location**: `src/app/dashboard/[semesterAndyear]/page.tsx`

**Purpose**: Admin overview for selected semester

**Features to Implement**:

1. **Quick Statistics Cards**
   - Total teachers (with active schedules)
   - Total classes
   - Total scheduled hours
   - Completion percentage (scheduled vs required)
   - Conflict count (if any)

2. **Data Visualization**
   - Bar chart: Hours per teacher
   - Pie chart: Subject distribution
   - Line chart: Schedule completion over time
   - Heat map: Room utilization

3. **Recent Activity**
   - Last modified schedules
   - Recent conflicts resolved
   - Pending assignments

4. **Quick Actions**
   - Jump to teacher table
   - Jump to student table
   - Jump to arrange schedule
   - Export all reports

5. **Semester Health Indicators**
   - Teachers without schedules
   - Classes without full schedules
   - Room utilization rate
   - Break time compliance

**Technical Approach**:
```typescript
// src/app/dashboard/[semesterAndyear]/page.tsx
export default async function DashboardPage({
  params,
}: {
  params: Promise<{ semesterAndyear: string }>;
}) {
  const { semesterAndyear } = await params;
  const [semester, academicYear] = semesterAndyear.split('-');
  
  // Fetch dashboard data (parallel)
  const [stats, schedules, teachers, classes] = await Promise.all([
    getDashboardStats(semesterAndyear),
    getClassSchedules(semesterAndyear),
    getTeachers(),
    getGradeLevels(),
  ]);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Suspense fallback={<StatsSkeleton />}>
        <StatsCards stats={stats} />
      </Suspense>
      
      <Suspense fallback={<ChartsSkeleton />}>
        <ChartsSection data={schedules} />
      </Suspense>
      
      {/* More sections */}
    </div>
  );
}
```

---

### 🎯 Priority 2: Rebuild/Enhance Teacher Table Page

**Current Issues**:
- Limited teacher information display
- No filtering by department
- No sorting options
- No teacher comparison view

**Proposed Enhancements**:

1. **Enhanced Teacher Selection**
   ```typescript
   // Multi-select for comparing teachers
   <TeacherMultiSelect
     onSelect={handleSelectTeachers}
     selected={selectedTeachers}
     groupBy="department"
     sortBy="name|hours|utilization"
   />
   ```

2. **Teacher Summary Card**
   - Photo/avatar
   - Full name with prefix
   - Department
   - Total teaching hours
   - Number of classes
   - Room assignments
   - Schedule conflicts (if any)

3. **Side-by-Side Comparison**
   - Allow comparing 2-3 teachers
   - Highlight differences
   - Show workload balance

4. **Filtering & Sorting**
   - By department
   - By teaching hours (ascending/descending)
   - By utilization rate
   - By number of classes

5. **Export Options**
   - Individual teacher (current)
   - Selected teachers
   - All teachers by department
   - Bulk export with one sheet per teacher

6. **Analytics View Toggle**
   - Switch between timetable and analytics
   - Show teaching load graph
   - Show room utilization
   - Show time distribution

**Data Structure**:
```typescript
interface TeacherDashboardData {
  teacher: Teacher;
  schedules: ClassSchedule[];
  stats: {
    totalHours: number;
    totalClasses: number;
    utilizationRate: number;
    roomsUsed: string[];
    conflictCount: number;
  };
}
```

---

### 🎯 Priority 3: Rebuild/Enhance Student Table Page

**Current Issues**:
- Limited grade information
- No program/track context
- No filtering by program
- No comparison view

**Proposed Enhancements**:

1. **Enhanced Grade Selection**
   ```typescript
   // Grouping by program/level
   <GradeMultiSelect
     onSelect={handleSelectGrades}
     selected={selectedGrades}
     groupBy="program|level"
     showStats={true}
   />
   ```

2. **Grade Summary Card**
   - Grade level (e.g., M.1/1)
   - Program code (e.g., M1-SCI)
   - Total students (if available)
   - Required hours
   - Scheduled hours
   - Completion percentage
   - Room assignment

3. **Program Context**
   - Show mandatory subjects
   - Show elective subjects
   - Highlight missing subjects
   - Credit hour compliance

4. **Side-by-Side Comparison**
   - Compare classes in same grade
   - Compare different programs
   - Highlight schedule differences

5. **Filtering & Sorting**
   - By program (SCI, LANG, etc.)
   - By grade level (M.1, M.2, M.3)
   - By completion percentage
   - By room assignment

6. **Export Options**
   - Individual class (current)
   - Selected classes
   - All classes by grade level
   - All classes by program
   - Curriculum compliance report

7. **Analytics View Toggle**
   - Switch between timetable and analytics
   - Show subject distribution
   - Show teacher coverage
   - Show break time visualization

**Data Structure**:
```typescript
interface StudentDashboardData {
  grade: GradeLevel;
  program: Program;
  schedules: ClassSchedule[];
  stats: {
    requiredHours: number;
    scheduledHours: number;
    completionRate: number;
    teachersCount: number;
    subjectsCount: number;
    roomAssignment: string | null;
  };
}
```

---

### 🎯 Priority 4: Add Analytics Dashboard Section

**New Route**: `src/app/dashboard/[semesterAndyear]/analytics/page.tsx`

**Purpose**: Deep analytics and insights for semester

**Sections**:

1. **Workload Distribution**
   - Teacher hours distribution histogram
   - Identify overloaded/underutilized teachers
   - Department comparison

2. **Room Utilization**
   - Heat map by day/period
   - Identify underutilized rooms
   - Room type analysis (lab, classroom, etc.)

3. **Schedule Quality Metrics**
   - Conflict resolution rate
   - Average schedule completeness
   - Break time compliance rate
   - Curriculum coverage

4. **Curriculum Analysis**
   - Subject hours vs requirements
   - Mandatory subject coverage
   - Elective distribution
   - Credit hour compliance

5. **Time Analysis**
   - Peak teaching hours
   - Empty slots analysis
   - Teacher free period patterns
   - Class idle time

**Data Visualization Libraries**:
- Use existing **Recharts** for charts
- Consider adding heat maps for room utilization
- Use tables with inline charts for metrics

---

### 🎯 Priority 5: Improve Public Homepage

**Current State**: Good foundation, some optimizations needed

**Proposed Enhancements**:

1. **Re-enable Revalidation**
   ```typescript
   // Currently commented out
   export const revalidate = 60 * 60 * 24 * 30; // 30 days
   ```
   - Investigate build issue
   - Consider dynamic revalidation based on data changes

2. **Add More Statistics**
   - Total subjects
   - Total programs
   - Active semesters
   - Last update timestamp

3. **Enhanced Search**
   - Fuzzy search for better matching
   - Search suggestions/autocomplete
   - Recent searches

4. **Teacher Profile Cards**
   - Clickable teacher cards with photo
   - Modal with full schedule preview
   - Contact information (if public)

5. **Class Schedule Preview**
   - Hover preview of schedule
   - Click to expand full view
   - Download option per class

---

## Implementation Plan

### Phase 1: Bug Fixes (1-2 hours)
1. Fix SelectRoomName.tsx unused variables
2. Add type annotations to use-class-schedules.ts
3. Update .gitignore to exclude prisma/generated from linting

### Phase 2: Main Dashboard (3-5 days)
1. Create dashboard stats repository
2. Create dashboard data aggregation functions
3. Build stats cards components
4. Build charts components
5. Build quick actions section
6. Integrate all sections into dashboard page

### Phase 3: Enhanced Teacher Table (2-3 days)
1. Build multi-select component
2. Create teacher summary card
3. Add filtering/sorting
4. Implement comparison view
5. Enhance export options

### Phase 4: Enhanced Student Table (2-3 days)
1. Build enhanced grade selector
2. Create grade summary card
3. Add program context
4. Implement comparison view
5. Enhance export options

### Phase 5: Analytics Dashboard (3-4 days)
1. Create analytics data services
2. Build workload distribution charts
3. Build room utilization heat maps
4. Build quality metrics section
5. Build curriculum analysis section

### Phase 6: Public Homepage Improvements (1-2 days)
1. Fix revalidation
2. Add more stats
3. Enhance search
4. Add teacher cards
5. Add schedule previews

---

## Design Patterns to Follow

1. **Server Components by Default**
   - Fetch data at page level
   - Use async/await
   - Pass data to client components

2. **Client Components for Interactivity**
   - Mark with "use client"
   - Use hooks (useState, useEffect, useSWR)
   - Handle user interactions

3. **Suspense Boundaries**
   - Wrap async components
   - Provide skeleton loaders
   - Progressive enhancement

4. **Type Safety**
   - Use Prisma-generated types
   - Define component prop interfaces
   - Avoid `any` types

5. **Idempotent Operations**
   - Safe retry logic
   - Use upsert when appropriate
   - Validate before mutations

6. **Error Handling**
   - User-friendly Thai error messages
   - Graceful degradation
   - Error boundaries

---

## Testing Strategy

1. **Unit Tests** (Jest)
   - Test data aggregation functions
   - Test validation logic
   - Test calculation utilities

2. **E2E Tests** (Playwright)
   - Test dashboard page load
   - Test teacher/student table navigation
   - Test export functionality
   - Test search/filter functionality

3. **Manual Testing**
   - Cross-browser testing
   - Mobile responsiveness
   - Print/PDF generation quality
   - Excel export formatting

---

## Dependencies Needed

### Current Dependencies (Already Available)
- ✅ Recharts - Data visualization
- ✅ ExcelJS - Excel export
- ✅ react-to-print - PDF generation
- ✅ SWR - Data fetching
- ✅ MUI v7 - UI components
- ✅ Tailwind CSS v4 - Styling

### Potential New Dependencies
- 📦 `react-hot-toast` - Better toast notifications (optional, notistack exists)
- 📦 `date-fns` - Date formatting utilities (if needed)
- 📦 `lodash` - Utility functions for data manipulation (optional)

**Recommendation**: Use existing dependencies first, only add if absolutely necessary.

---

## Performance Considerations

1. **Data Fetching**
   - Use parallel fetching (`Promise.all`)
   - Implement proper caching with SWR
   - Use pagination for large datasets

2. **Component Rendering**
   - Use `useMemo` for expensive calculations
   - Use `useCallback` for stable function references
   - Lazy load heavy components

3. **Database Queries**
   - Add indexes if queries are slow
   - Use `select` to limit returned fields
   - Batch operations when possible

4. **Export Operations**
   - Show progress indicators
   - Handle large datasets gracefully
   - Consider server-side export generation

---

## Accessibility Considerations

1. **Keyboard Navigation**
   - All interactive elements keyboard accessible
   - Proper tab order
   - Focus indicators

2. **Screen Readers**
   - Proper ARIA labels
   - Semantic HTML
   - Alt text for charts/images

3. **Color Contrast**
   - WCAG AA compliance
   - Don't rely solely on color
   - High contrast mode support

4. **Responsive Design**
   - Mobile-friendly layouts
   - Touch-friendly targets
   - Readable font sizes

---

## Security Considerations

1. **Authentication**
   - Verify session on dashboard pages
   - Redirect to login if not authenticated
   - Role-based access control

2. **Data Access**
   - Validate semester ownership
   - Check permissions before mutations
   - Sanitize user inputs

3. **Export Operations**
   - Rate limiting
   - Size limits
   - Validate data before export

---

## Next Steps

1. **Review this plan with user** - Get feedback and priorities
2. **Fix existing bugs** - Quick wins
3. **Start with main dashboard** - Highest impact
4. **Iterate on teacher/student tables** - Enhance existing features
5. **Add analytics dashboard** - Advanced insights
6. **Polish public homepage** - User experience

