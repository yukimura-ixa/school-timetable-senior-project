# High-Priority GitHub Issues to Create

> These issues are extracted from `AGENTS.md` Section 13 - Future Implementation Ideas
> Copy each section below to create a new GitHub issue

---

## Issue 1: Complete Repository Pattern Migration

**Title:** `[Architecture] Complete Repository Pattern Migration`

**Labels:** `enhancement`, `architecture`, `high-priority`

**Body:**
```markdown
## 🎯 Goal
Migrate all remaining raw Prisma queries to the repository layer to achieve full separation of data access from business logic.

## 📋 Context
Currently, some features still use direct Prisma queries in Server Actions or components. This violates Clean Architecture principles and makes code harder to test and maintain.

## 🔨 Tasks
- [ ] Audit all Server Actions for raw Prisma queries
- [ ] Create missing repository methods
- [ ] Update Server Actions to use repositories
- [ ] Add unit tests for new repository methods
- [ ] Remove direct Prisma imports from application layer

## 📚 Reference
See `AGENTS.md` Section 13 - Architecture Improvements

## ✅ Acceptance Criteria
- Zero direct Prisma queries in `src/features/*/application/` directories
- All data access goes through `src/features/*/infrastructure/repositories/`
- Repository methods have unit tests with mocked Prisma client
- Documentation updated to reflect repository pattern usage

## 💡 Related
Part of Clean Architecture adoption documented in `AGENTS.md`
```

---

## Issue 2: Fix Store Type Mismatch (scheduledSubjects)

**Title:** `[TypeScript] Fix Store Type Mismatch for scheduledSubjects`

**Labels:** `bug`, `typescript`, `high-priority`, `technical-debt`

**Body:**
```markdown
## 🐛 Problem
The `arrangement-ui.store.ts` expects `SubjectData[]` but receives `ClassScheduleWithRelations[]`, causing type safety issues with temporary `as any` casts.

## 📍 Location
- **Store:** `src/features/schedule-arrangement/presentation/stores/arrangement-ui.store.ts`
- **Usage:** `src/app/schedule/[semesterAndyear]/arrange/teacher-arrange/page.tsx` lines 568-569

## 🔨 Solution
Update the store interface to accept Prisma types directly:

```typescript
// In arrangement-ui.store.ts
export interface ArrangementUIState {
  // Change from:
  scheduledSubjects: SubjectData[];
  // To:
  scheduledSubjects: ClassScheduleWithRelations[];
}
```

## 📚 Reference
- See `docs/TEACHER_ARRANGE_TYPE_SAFETY_COMPLETE.md` - Outstanding Technical Debt #1
- See `AGENTS.md` Section 13 - Technical Debt Tracking

## ✅ Acceptance Criteria
- Store accepts `ClassScheduleWithRelations[]` type
- Remove `as any` casts at lines 568-569 in teacher-arrange/page.tsx
- No TypeScript errors in affected files
- All existing tests pass

## 🏷️ Impact
- **Severity:** Medium - Temporary workaround exists but reduces type safety
- **Effort:** Low - 30-minute fix
```

---

## Issue 3: Implement Real-time Collaboration for Schedule Editing

**Title:** `[Feature] Real-time Collaboration with WebSocket Support`

**Labels:** `enhancement`, `feature`, `high-priority`

**Body:**
```markdown
## 🚀 Feature Request
Add WebSocket support to enable multiple users to edit schedules simultaneously with real-time updates.

## 💡 Use Case
When multiple admins or teachers are working on schedules for different grades/departments, they should see each other's changes in real-time to avoid conflicts and improve collaboration.

## 🔨 Proposed Implementation
1. **WebSocket Server**: Use Socket.IO or Pusher for real-time communication
2. **Presence Detection**: Show who else is viewing/editing the schedule
3. **Live Updates**: Broadcast schedule changes to all connected clients
4. **Optimistic Updates**: Update UI immediately, sync with server in background
5. **Conflict Resolution**: Handle simultaneous edits with last-write-wins or merge strategies

## 🛠️ Technical Stack
- **Option 1**: Socket.IO + Redis adapter (for horizontal scaling)
- **Option 2**: Pusher (managed service, easier setup)
- **Option 3**: Vercel Edge Functions + WebSocket API (experimental)

## 📚 Reference
See `AGENTS.md` Section 13 - Feature Enhancements

## ✅ Acceptance Criteria
- Multiple users can view the same schedule simultaneously
- Changes made by one user appear instantly for others
- Presence indicators show who is currently viewing/editing
- No data loss during simultaneous edits
- Works on both desktop and mobile browsers
- Performance remains acceptable with 10+ concurrent users

## 🎯 Priority Justification
- **High**: Addresses common pain point during peak scheduling season
- **Impact**: Significantly improves workflow efficiency
- **Risk**: Moderate complexity, needs careful conflict handling

## 💡 Related Issues
- Conflict Resolution UI (#TBD)
- Audit Log for tracking who made which changes (#TBD)
```

---

## Issue 4: Add Storybook for Component Library Documentation

**Title:** `[DevEx] Integrate Storybook for Component Documentation`

**Labels:** `enhancement`, `developer-experience`, `documentation`, `high-priority`

**Body:**
```markdown
## 🎯 Goal
Set up Storybook to document and showcase all reusable UI components with interactive examples.

## 📋 Benefits
- **Component Catalog**: Central place to browse all components
- **Interactive Playground**: Test component props and states
- **Visual Testing**: Catch UI regressions early
- **Design System**: Enforce consistency across features
- **Onboarding**: Help new developers understand component APIs

## 🔨 Implementation Steps
1. **Install Storybook**: `pnpm dlx storybook@latest init`
2. **Configure for Next.js 16**: Update Storybook config for App Router
3. **Write Stories**: Create `.stories.tsx` files for existing components
4. **Add Addons**:
   - `@storybook/addon-a11y` - Accessibility testing
   - `@storybook/addon-interactions` - User flow testing
   - `storybook-dark-mode` - Dark mode support
5. **Deploy**: Host on Vercel or Chromatic

## 📦 Component Coverage (Priority Order)
### Phase 1: Core UI (Week 1)
- [ ] PrimaryButton, SecondaryButton
- [ ] TextInput, Select, Checkbox
- [ ] Modal, Dialog, Snackbar
- [ ] Loading states (Skeleton, Spinner)

### Phase 2: Schedule Components (Week 2)
- [ ] TimeSlot, TimeslotCell
- [ ] TimetableGrid, TimetableHeader
- [ ] SubjectCard, TeacherCard
- [ ] ConflictIndicator

### Phase 3: Forms & Tables (Week 3)
- [ ] FormBuilder components
- [ ] DataGrid configurations
- [ ] Filter components
- [ ] Export buttons

## 📚 Reference
See `AGENTS.md` Section 13 - Developer Experience

## ✅ Acceptance Criteria
- Storybook runs locally with `pnpm storybook`
- At least 20 components have stories
- Stories include all major props and states
- Accessibility addon shows no critical issues
- Deployed to public URL for easy access
- README updated with Storybook link

## 🏷️ Estimated Effort
- **Setup**: 4 hours
- **Writing stories**: 1-2 hours per component
- **Total Phase 1**: ~2 weeks

## 💡 Related
- Visual Regression Testing with Chromatic (#TBD)
- Design System Documentation (#TBD)
```

---

## Issue 5: Fix 7 Failing Jest Test Suites

**Title:** `[Testing] Fix 7 Failing Jest Test Suites`

**Labels:** `bug`, `testing`, `high-priority`, `technical-debt`

**Body:**
```markdown
## 🐛 Problem
7 out of 21 Jest test suites are currently failing (67% pass rate). These are test bugs, not environment issues.

## 📊 Current Status
- **Passing**: 14/21 suites (67%), 278/349 tests (80%)
- **Failing**: 7 suites with test logic errors, assertion issues, mock setup problems

## 🔍 Investigation Needed
Run `pnpm test` to identify specific failing tests and categorize by issue type:
- Incorrect assertions
- Outdated mock data
- Missing test setup/teardown
- Race conditions in async tests
- Dependency injection issues

## 🔨 Resolution Strategy
1. **Triage**: Document each failing test with error message
2. **Fix**: Address issues one suite at a time
3. **Refactor**: Apply table-driven test pattern where applicable
4. **Verify**: Ensure tests are deterministic (no flakiness)

## 📚 Reference
- See `docs/JEST_ENVIRONMENT_FIX_COMPLETE.md` - Environment is already fixed
- See `AGENTS.md` Section 13 - Technical Debt Tracking

## ✅ Acceptance Criteria
- All 21 test suites pass (100%)
- Tests run deterministically (no flakiness)
- Coverage remains at 80%+ for critical paths
- No skipped tests (`test.skip`, `it.skip`)

## 🏷️ Priority
- **High**: Failing tests reduce confidence in CI/CD
- **Impact**: Blocks merging PRs with confidence
- **Effort**: 1-2 days estimated

## 💡 Next Steps
1. Run `pnpm test --verbose` to get detailed error logs
2. Create sub-issues for each failing test suite
3. Fix incrementally, commit per suite
```

---

## Issue 6: Add E2E Test Coverage to 80%+ Critical Paths

**Title:** `[Testing] Expand E2E Test Coverage to 80%+ Critical Paths`

**Labels:** `enhancement`, `testing`, `high-priority`

**Body:**
```markdown
## 🎯 Goal
Expand Playwright E2E test coverage to ensure all critical user journeys are tested across Admin, Teacher, and Student roles.

## 📊 Current Coverage
Current E2E tests cover basic flows. Need comprehensive coverage of:

### Critical Paths to Test

#### Admin Role (Priority 1)
- [ ] **Schedule Assignment Flow**
  - Create new semester configuration
  - Assign teachers to subjects
  - Drag-and-drop subjects to timeslots
  - Handle conflict detection and resolution
  - Lock timeslots for school-wide activities
  - Export schedule to Excel/PDF

- [ ] **Data Management Flow**
  - CRUD operations for teachers
  - CRUD operations for subjects
  - CRUD operations for classrooms
  - CRUD operations for grade levels
  - Bulk import via CSV/Excel

#### Teacher Role (Priority 2)
- [ ] **View Teaching Schedule**
  - Login and navigate to personal schedule
  - Filter by semester/week
  - Export personal schedule
  - View classroom assignments

- [ ] **View Student Schedules**
  - Browse by grade level
  - View specific class timetables
  - Export student schedules

#### Student Role (Priority 3)
- [ ] **View Class Schedule**
  - Login and view class timetable
  - Navigate between weeks
  - Mobile-responsive view

### Error Scenarios (Priority 1)
- [ ] Double-booking prevention (teacher conflict)
- [ ] Double-booking prevention (room conflict)
- [ ] Invalid timeslot assignment (break time)
- [ ] Network error handling
- [ ] Session timeout

## 🔨 Implementation Strategy
1. **Test Plan**: Document all test cases in spreadsheet
2. **Page Objects**: Create reusable page object models
3. **Test Data**: Use seeded data consistently
4. **Parallelization**: Configure sharding for faster runs
5. **CI/CD Integration**: Run on every PR

## 📚 Reference
See `AGENTS.md` Section 13 - Developer Experience

## ✅ Acceptance Criteria
- 80%+ critical path coverage achieved
- Tests run in < 10 minutes on CI
- Tests pass consistently (no flakiness)
- HTML report generated and archived
- Coverage tracked in README badge

## 🏷️ Estimated Effort
- **Phase 1 (Admin)**: 2 weeks
- **Phase 2 (Teacher)**: 1 week
- **Phase 3 (Student)**: 1 week
- **Error scenarios**: 3 days
- **Total**: ~5 weeks

## 💡 Related
- Visual Regression Testing (#TBD)
- Performance Testing (#TBD)
```

---

## Issue 7: Implement Performance Monitoring with Sentry

**Title:** `[Observability] Integrate Sentry for Error Tracking and Performance Monitoring`

**Labels:** `enhancement`, `observability`, `high-priority`

**Body:**
```markdown
## 🎯 Goal
Integrate Sentry to capture runtime errors, track performance metrics, and monitor user experience in production.

## 💡 Why Sentry?
- **Error Tracking**: Catch and diagnose production errors before users report them
- **Performance Monitoring**: Identify slow API calls, DB queries, and page loads
- **Session Replay**: Watch user sessions to reproduce bugs
- **Release Tracking**: Compare error rates across deployments
- **Alerting**: Get notified of critical issues immediately

## 🔨 Implementation Steps

### Phase 1: Error Tracking (Week 1)
1. Install Sentry SDK: `pnpm add @sentry/nextjs`
2. Configure `sentry.client.config.ts` and `sentry.server.config.ts`
3. Set up source maps upload in `next.config.mjs`
4. Add error boundaries to key components
5. Test with intentional errors in dev/staging

### Phase 2: Performance Monitoring (Week 2)
1. Enable performance tracing
2. Instrument critical API routes
3. Track database query performance
4. Monitor Core Web Vitals
5. Set performance budgets

### Phase 3: Alerts & Integrations (Week 3)
1. Configure alert rules for critical errors
2. Integrate with Discord/Slack
3. Set up release tracking
4. Configure user feedback widget
5. Enable session replay for admins

## 📊 Metrics to Track
- **Errors**: Rate, volume, new vs. regression
- **Performance**: API response times, DB query duration
- **Core Web Vitals**: LCP, FID, CLS
- **User Experience**: Session duration, feature adoption
- **Deployment**: Error rate before/after releases

## 🔒 Security Considerations
- [ ] Sanitize sensitive data (PII, credentials)
- [ ] Configure allowed domains
- [ ] Limit session replay to opt-in users
- [ ] Set up proper RBAC in Sentry dashboard

## 📚 Reference
- See `AGENTS.md` Section 13 - Observability
- See `.github/copilot-instructions.md` for Sentry tracing examples

## ✅ Acceptance Criteria
- Sentry captures all unhandled errors
- Source maps upload automatically on deployment
- Performance metrics visible in Sentry dashboard
- Alert rules configured for critical issues
- Team has access to Sentry dashboard
- Documentation updated with runbook

## 🏷️ Cost Estimate
- **Free Tier**: 5k errors/month, limited performance data
- **Team Plan**: $26/month for 50k errors, full features
- **Recommendation**: Start with free tier, upgrade as needed

## 💡 Related
- Structured Logging with Pino (#TBD)
- Distributed Tracing with OpenTelemetry (#TBD)
```

---

## Issue 8: Add Feature Flags with Vercel Edge Config

**Title:** `[Infrastructure] Implement Feature Flags with Vercel Edge Config`

**Labels:** `enhancement`, `infrastructure`, `high-priority`

**Body:**
```markdown
## 🎯 Goal
Implement feature flags to enable gradual rollouts, A/B testing, and emergency kill switches without deploying code.

## 💡 Use Cases
- **Gradual Rollout**: Release new schedule UI to 10% of users first
- **A/B Testing**: Test different conflict resolution strategies
- **Kill Switch**: Disable problematic features instantly
- **Role-based Features**: Show beta features to admins only
- **Environment Flags**: Enable dev features in staging only

## 🛠️ Technology Choice: Vercel Edge Config

**Why Vercel Edge Config?**
- Free tier available (sufficient for our needs)
- < 1ms latency (reads from edge)
- Native Next.js integration
- Simple key-value store
- No external service dependencies

**Alternative**: LaunchDarkly (more features, costs $8.33/user/month)

## 🔨 Implementation Plan

### Phase 1: Setup (Day 1)
```bash
# Install Vercel Edge Config SDK
pnpm add @vercel/edge-config

# Create Edge Config in Vercel dashboard
vercel env pull
```

### Phase 2: Feature Flag Service (Day 2)
```typescript
// src/lib/feature-flags.ts
import { get } from '@vercel/edge-config';

export async function isFeatureEnabled(
  flag: string,
  context?: { userId?: string; role?: string }
): Promise<boolean> {
  const config = await get<FeatureFlags>('feature-flags');
  const feature = config?.[flag];
  
  if (!feature) return false;
  if (feature.enabled === false) return false;
  
  // Role-based gating
  if (feature.roles && context?.role) {
    return feature.roles.includes(context.role);
  }
  
  // Percentage rollout
  if (feature.percentage && context?.userId) {
    return hashUserId(context.userId) < feature.percentage;
  }
  
  return feature.enabled;
}
```

### Phase 3: Initial Flags (Week 1)
Priority flags to implement:
- [ ] `newScheduleUI` - Toggle new drag-and-drop interface
- [ ] `realTimeCollab` - Enable WebSocket collaboration
- [ ] `analyticsV2` - New analytics dashboard
- [ ] `exportV2` - New Excel/PDF export engine
- [ ] `betaFeatures` - Show beta ribbon for admins

### Phase 4: UI Components (Week 1)
```typescript
// Usage in components
import { FeatureFlag } from '@/components/FeatureFlag';

<FeatureFlag flag="newScheduleUI">
  <NewScheduleInterface />
</FeatureFlag>

<FeatureFlag flag="newScheduleUI" fallback={<OldScheduleInterface />}>
  <NewScheduleInterface />
</FeatureFlag>
```

## 📊 Edge Config Structure
```json
{
  "feature-flags": {
    "newScheduleUI": {
      "enabled": true,
      "percentage": 10,
      "description": "New drag-and-drop schedule interface"
    },
    "realTimeCollab": {
      "enabled": true,
      "roles": ["admin"],
      "description": "WebSocket real-time collaboration"
    },
    "betaFeatures": {
      "enabled": true,
      "roles": ["admin", "teacher"],
      "description": "Show beta feature indicators"
    }
  }
}
```

## 📚 Reference
See `AGENTS.md` Section 13 - Developer Experience

## ✅ Acceptance Criteria
- Edge Config configured in Vercel dashboard
- Feature flag service implemented with type safety
- React hook `useFeatureFlag()` available
- At least 5 feature flags defined
- Documentation with flag catalog
- Admin UI to view flag status

## 🏷️ Benefits
- **Deploy Anytime**: Decouple deploys from releases
- **Reduce Risk**: Test features with small user groups
- **Fast Rollback**: Disable features without redeploying
- **Data-Driven**: Make decisions based on metrics

## 💡 Related
- A/B Testing Framework (#TBD)
- Analytics Dashboard V2 (#TBD)
```

---

## Instructions for Creating Issues

1. Go to https://github.com/yukimura-ixa/school-timetable-senior-project/issues/new
2. Copy the **Title** for each issue
3. Copy the **Body** content
4. Add the suggested **Labels**
5. Click "Submit new issue"

## Priority Order Recommendation

Based on impact and effort, create issues in this order:

1. **Issue 5** - Fix 7 Failing Jest Test Suites (Quick win, high impact on CI/CD)
2. **Issue 2** - Fix Store Type Mismatch (Quick fix, removes technical debt)
3. **Issue 1** - Complete Repository Pattern Migration (Architecture foundation)
4. **Issue 4** - Add Storybook (Improves developer experience significantly)
5. **Issue 7** - Implement Sentry (Critical for production monitoring)
6. **Issue 8** - Add Feature Flags (Enables safer deployments)
7. **Issue 6** - Expand E2E Coverage (Long-term investment)
8. **Issue 3** - Real-time Collaboration (Complex feature, needs planning)

---

## Notes

- All issues reference `AGENTS.md` Section 13 for full context
- Each issue includes clear acceptance criteria
- Technical implementation details provided where applicable
- Estimated effort helps with sprint planning
- Labels help with organization and filtering
