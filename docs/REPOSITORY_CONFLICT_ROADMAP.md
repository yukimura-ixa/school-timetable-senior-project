# Repository Pattern & Conflict Detection UI Roadmap

**Created:** November 4, 2025  
**Status:** Planning Complete, Implementation Ready  
**GitHub Issues:** [#56](https://github.com/yukimura-ixa/school-timetable-senior-project/issues/56), [#57](https://github.com/yukimura-ixa/school-timetable-senior-project/issues/57)

---

## 📋 Executive Summary

Two major architectural improvements identified and fully scoped:

1. **Repository Pattern Completion** - Migrate remaining raw Prisma queries in `src/lib/` to repository layer
2. **Conflict Detection UI Enhancements** - Add visual indicators, summary dashboard, and improved UX

Both initiatives are well-defined, have clear acceptance criteria, and are ready for implementation.

---

## 🎯 Initiative 1: Complete Repository Pattern Migration

**GitHub Issue:** [#56 - Complete Repository Pattern Migration](https://github.com/yukimura-ixa/school-timetable-senior-project/issues/56)  
**Priority:** High  
**Effort:** 13-19 hours (2-3 days)  
**Impact:** Completes Clean Architecture migration, enables comprehensive testing

### Current State

#### ✅ Already Using Repository Pattern
- All 15 feature modules in `src/features/*/infrastructure/repositories/`
- All Server Actions using repository pattern
- Comprehensive test coverage
- Consistent patterns established

#### ⚠️ Direct Prisma Usage (Needs Migration)
- `src/lib/public/teachers.ts` (288 lines) - 6 raw queries
- `src/lib/public/stats.ts` (202 lines) - 12+ raw queries
- `src/lib/public/classes.ts` - 3+ raw queries
- `src/lib/timetable-config.ts` (115 lines) - 1 raw query
- `src/lib/auth.ts` - 5 raw queries (special case)

**Total:** ~600 lines of code with direct Prisma access

### Solution Overview

#### Phase 1: Create Public Data Repository
**New File:** `src/lib/infrastructure/repositories/public-data.repository.ts`

```typescript
export const publicDataRepository = {
  // Teachers
  async findPublicTeachers(filters: PublicTeacherFilters) { },
  async countTeachers() { },
  async findPublicTeacherById(teacherId: number, term: TermInput) { },
  
  // Stats
  async getQuickStats() { },
  async getPeriodLoad(academicYear: number, semester: string) { },
  async getRoomOccupancy(academicYear: number, semester: string) { },
  
  // Classes
  async findPublicGradeLevels(filters: PublicGradeLevelFilters) { },
  async countGradeLevels() { },
};
```

#### Phase 2: Update Public Libraries
Refactor `src/lib/public/*.ts` files to use new repository:

```typescript
// Before
const teachers = await prisma.teacher.findMany({ where: { ... } });

// After
const teachers = await publicDataRepository.findPublicTeachers({ ... });
```

#### Phase 3: Consolidate Config Access
**Option A (Recommended):** Extend `src/features/config/infrastructure/repositories/config.repository.ts`

```typescript
// Add to existing config.repository.ts
async getTimetableConfig(academicYear: number, semester: semester): Promise<TimetableConfig> {
  const config = await prisma.table_config.findFirst({ ... });
  return parseConfigJson(config?.Config);
}
```

**Option B:** Keep utility, use repository internally

#### Phase 4: Auth.js Integration (Optional)
**Decision:** Keep direct Prisma in auth callbacks (acceptable infrastructure layer exception)

**Rationale:**
- Auth.js callbacks execute outside normal app context
- Infrastructure layer (auth) accessing infrastructure layer (database) is acceptable
- Testing auth callbacks is already challenging regardless of pattern
- Low ROI for migration effort

### Implementation Timeline

| Phase | Component | Effort | Priority |
|-------|-----------|--------|----------|
| 1 | Public Data Repository | 4-6h | High |
| 2 | Update Libraries | 3-4h | High |
| 3 | Config Consolidation | 2-3h | Medium |
| 4 | Auth Integration | 1-2h | Low (Optional) |
| Testing | Unit + Integration | 3-4h | High |

**Total:** 13-19 hours

### Acceptance Criteria

#### Must Have ✅
- [ ] No direct `prisma.*` calls in `src/lib/public/*.ts`
- [ ] `public-data.repository.ts` created with all methods
- [ ] All public files use repository pattern
- [ ] Timetable config uses `configRepository`
- [ ] Existing unit tests pass
- [ ] New repository methods have tests

#### Nice to Have 🎁
- [ ] Auth.js callbacks use repository (if feasible)
- [ ] `AGENTS.md` updated
- [ ] Memory file: `repository_pattern_complete`
- [ ] Performance benchmarks documented

### Technical Debt Resolved
- **Before:** ~600 LOC with direct Prisma access outside repositories
- **After:** 100% repository pattern compliance (except auth.ts)
- **Testing:** Full mocking capability for public API layer
- **Maintenance:** Centralized query optimization

---

## 🎨 Initiative 2: Conflict Detection UI Improvements

**GitHub Issue:** [#57 - Conflict Detection UI Improvements](https://github.com/yukimura-ixa/school-timetable-senior-project/issues/57)  
**Priority:** Medium  
**Effort:** 30-42 hours (Phase 1-3), 40-52 hours (Full)  
**Impact:** Dramatically improves admin user experience

### Current State Analysis

#### ✅ Strong Foundation
- **Domain Logic:** `conflict-detector.service.ts` (355 lines) - 5+ pure functions
  - Teacher, Room, Class, Lock conflict detection
  - Priority-based conflict checking
  - Comprehensive test coverage

- **Validation Hook:** `useConflictValidation.ts` (229 lines)
  - React hook for UI integration
  - Memoized conflict maps
  - Boolean availability checks

- **Repository:** `conflict.repository.ts`
  - `findAllConflicts()` - Database queries
  - Returns typed conflict summaries

- **E2E Tests:** `12-conflict-detector.spec.ts`
  - Comprehensive workflow coverage
  - Conflict detection scenarios tested

#### ⚠️ UI/UX Gaps

1. **Visual Indicators** (Missing)
   - Current: Text-only messages
   - Needed: Color-coded cells, icons, severity indicators

2. **Conflict Summary Dashboard** (Missing)
   - Current: No centralized overview
   - Needed: Conflict list, grouping, navigation

3. **Enhanced Messages** (Basic)
   - Current: Simple Thai text
   - Needed: Contextual details, suggestions, links

4. **Diff Viewer** (Missing)
   - Current: No visual comparison
   - Needed: Side-by-side, highlight changes

5. **Batch Resolution** (Missing)
   - Current: Manual one-by-one
   - Needed: Auto-suggest, bulk actions

6. **Real-time Feedback** (Partial)
   - Current: Validation on action
   - Needed: Predictive warnings, drag feedback

### Solution Overview

#### Phase 1: Visual Indicators (Priority: High)
**Components:**
- `ConflictIndicator.tsx` - Icon + color + badge component
- Update `TimeSlotGrid` - Color-coded cells based on conflicts

**Colors (Accessible):**
- 🔴 Red (`#DC2626`) - Teacher/Room conflicts
- 🟡 Yellow (`#F59E0B`) - Warnings
- 🔒 Gray (`#6B7280`) - Locked timeslots
- ✅ Green (`#10B981`) - Available
- ℹ️ Blue (`#3B82F6`) - Informational

**Icons (MUI):**
- `WarningAmberIcon` - Conflicts
- `LockIcon` - Locked
- `CheckCircleIcon` - Available
- `ErrorIcon` - Critical

**Effort:** 8-12 hours

#### Phase 2: Conflict Summary Dashboard (Priority: High)
**Components:**
- `ConflictSummaryPanel.tsx` - Main dashboard
- `ConflictListItem.tsx` - Individual conflict display
- `useConflictSummary.ts` - Data fetching hook

**Features:**
- Total conflict count with breakdown
- Grouped by type (Teacher, Room, Class, Unassigned)
- Click to navigate to grid location
- Severity indicators
- "Fix" button per conflict
- Real-time updates

**Integration:**
```typescript
// Use existing Server Action
const { data } = useSWR(
  ['conflicts', academicYear, semester],
  async () => await getConflictsAction({ AcademicYear, Semester })
);
```

**Effort:** 12-16 hours

#### Phase 3: Enhanced Messages (Priority: Medium)
**Components:**
- `ConflictDetailsModal.tsx` - Detailed conflict info
- `conflict-resolver.service.ts` (NEW) - Suggestion algorithm

**Features:**
- Detailed conflict context
- Conflicting schedules displayed
- 1-3 resolution suggestions
- "Apply suggestion" button
- Impact analysis

**Hook Update:**
```typescript
export interface DetailedConflictResult {
  type: ConflictType;
  message: string;
  severity: 'error' | 'warning' | 'info';
  
  // NEW
  conflictingSchedules: ConflictingSchedule[];
  suggestions: ResolutionSuggestion[];
}
```

**Effort:** 10-14 hours

#### Phase 4: Diff Viewer (Priority: Low)
**Components:**
- `ScheduleDiffViewer.tsx` - Before/After comparison

**Use Cases:**
- Bulk change preview
- Conflict resolution impact
- Change history

**Effort:** 16-20 hours

#### Phase 5: Auto-Resolution (Priority: Future)
**Components:**
- `ConflictResolutionWizard.tsx` - Multi-step wizard
- Smart suggestion algorithm

**Features:**
- Find nearest available slots
- Prioritize by availability
- Minimize total moves
- Preview + confirm

**Effort:** 24-32 hours

### Implementation Timeline

| Phase | Focus | Effort | Priority |
|-------|-------|--------|----------|
| 1 | Visual Indicators | 8-12h | High |
| 2 | Summary Dashboard | 12-16h | High |
| 3 | Enhanced Messages | 10-14h | Medium |
| 4 | Diff Viewer | 16-20h | Low |
| 5 | Auto-Resolution | 24-32h | Future |

**MVP (Phase 1-3):** 30-42 hours  
**Full (Phase 1-5):** 70-94 hours

### Acceptance Criteria

#### Phase 1 (Visual Indicators) ✅
- [ ] Color-coded timeslot cells
- [ ] Icons display correctly
- [ ] Hover tooltips show details
- [ ] Color-blind friendly
- [ ] E2E tests pass

#### Phase 2 (Summary Dashboard) ✅
- [ ] Conflict count displayed
- [ ] Grouped by type
- [ ] Click navigates to location
- [ ] Real-time updates
- [ ] Existing tests pass

#### Phase 3 (Enhanced Messages) ✅
- [ ] Modal opens on click
- [ ] Shows conflicting schedules
- [ ] 1-3 suggestions displayed
- [ ] "Apply" button works
- [ ] Thai language maintained

#### Must Not Break ⚠️
- [ ] `12-conflict-detector.spec.ts` passes
- [ ] `useConflictValidation` API backward compatible
- [ ] Domain services remain pure
- [ ] Repository pattern maintained
- [ ] Performance: < 100ms conflict checks

### Success Metrics

**Current Baseline:**
- Conflict detection: Functional ✅
- Visual feedback: Text-only ⚠️
- Resolution time: Manual (slow) 📉

**Target (After Phase 1-3):**
- Visual feedback: Color + icons ✅
- Conflict identification: 50% faster 📈
- Error rate: 30% fewer mistakes 📉
- User satisfaction: Positive admin feedback 😊

---

## 🚀 Getting Started

### For Repository Pattern Migration

1. **Read Issue:** [#56](https://github.com/yukimura-ixa/school-timetable-senior-project/issues/56)
2. **Study Examples:**
   - `src/features/teacher/infrastructure/repositories/teacher.repository.ts`
   - `src/features/config/infrastructure/repositories/config.repository.ts`
3. **Consult context7:**
   ```bash
   # Get Prisma best practices
   resolve-library-id("prisma") → /prisma/prisma
   get-library-docs("/prisma/prisma", topic="repository pattern")
   ```
4. **Start with Phase 1:** Create `public-data.repository.ts`

### For Conflict Detection UI

1. **Read Issue:** [#57](https://github.com/yukimura-ixa/school-timetable-senior-project/issues/57)
2. **Study Current Code:**
   - `src/features/schedule-arrangement/domain/services/conflict-detector.service.ts`
   - `src/features/schedule-arrangement/presentation/hooks/useConflictValidation.ts`
3. **Consult context7:**
   ```bash
   # Get MUI component patterns
   resolve-library-id("@mui/material") → /mui/material-ui
   get-library-docs("/mui/material-ui", topic="icons badges tooltips")
   ```
4. **Start with Phase 1:** Create `ConflictIndicator.tsx`

---

## 📚 Reference Documentation

### Repository Pattern
- **AGENTS.md** - Section 5: Coding Standards, Repository Pattern
- **code_style_conventions** (Serena memory) - Repository examples
- **comprehensive_user_flows** (Serena memory) - Architecture context

### Conflict Detection
- **conflict-detector.service.ts** - Pure domain logic
- **useConflictValidation.ts** - React hook implementation
- **12-conflict-detector.spec.ts** - E2E test examples
- **WEEK5_FINAL_SUMMARY.md** - TeacherArrangePage refactoring context

### Testing
- **jest_testing_nextjs_patterns** (Serena memory) - Unit test patterns
- **jest_test_status_nov2025_fixes_applied** (Serena memory) - Test status
- **playwright.config.ts** - E2E test configuration

---

## 🔗 Related Work

### Completed Foundations ✅
- Clean Architecture migration (all features)
- Server Actions pattern (100% adopted)
- Repository pattern (feature modules)
- Conflict detection logic (domain services)
- Conflict validation hook (presentation layer)

### Prerequisites ⚠️
- None - both initiatives are ready to start
- Repository migration is independent
- Conflict UI builds on existing logic

### Future Enhancements 🔮
- API versioning (after repository completion)
- Real-time collaboration (WebSocket)
- Advanced conflict resolution AI
- Schedule history/audit log
- Mobile-responsive conflict UI

---

## 📊 Impact Analysis

### Repository Pattern Completion

**Benefits:**
- ✅ 100% Clean Architecture compliance
- ✅ Full test coverage capability
- ✅ Centralized query optimization
- ✅ Easier to maintain/refactor
- ✅ Better separation of concerns

**Risks:**
- ⚠️ Auth.js callbacks may need special handling
- ⚠️ Performance regression if not careful
- ⚠️ Breaking changes in public API contracts

**Mitigation:**
- Keep auth.ts as acceptable exception
- Benchmark queries before/after
- Use semantic versioning for API changes

### Conflict Detection UI

**Benefits:**
- ✅ Dramatically improved admin UX
- ✅ 50% faster conflict identification
- ✅ 30% fewer scheduling errors
- ✅ Reduced training time for new admins
- ✅ Professional, polished interface

**Risks:**
- ⚠️ Complexity increase in UI layer
- ⚠️ Performance with many conflicts
- ⚠️ Accessibility concerns (color-only indicators)

**Mitigation:**
- Keep domain logic separate from UI
- Optimize conflict queries (pagination)
- Use icons + color (not color alone)
- Comprehensive E2E test coverage

---

## 📝 Notes

### General Guidelines
- Always consult **context7** before implementing (Next.js, MUI, Prisma patterns)
- Use **Serena** for codebase analysis and pattern discovery
- Maintain Thai language for all user-facing text
- Keep domain logic pure (no React dependencies)
- Write tests before refactoring (TDD approach)

### Repository Pattern
- Follow existing repository patterns in feature modules
- Export plain objects (not classes)
- One method per query pattern
- Use Prisma types (no manual typing)
- Include `orderBy` for consistent results

### Conflict UI
- Color-blind friendly (icons + colors)
- Performance: < 100ms conflict checks
- Backward compatibility for `useConflictValidation` hook
- Domain services remain pure functions
- E2E tests must continue passing

### Testing Strategy
- Unit tests for repositories (mock Prisma)
- Unit tests for domain services (pure functions)
- Integration tests for hooks (React Testing Library)
- E2E tests for complete workflows (Playwright)

---

**Status:** Ready for implementation  
**Next Steps:** Choose initiative, assign to developer, begin Phase 1  
**Questions:** Consult AGENTS.md or ask team lead

---

*Last updated: November 4, 2025*
