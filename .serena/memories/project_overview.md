# School Timetable System - Project Overview

**Last Updated:** October 31, 2025

## Purpose

A comprehensive web application designed for secondary schools to create and manage class and teaching schedules efficiently. The system prevents scheduling conflicts and provides accessible online viewing for teachers and students.

## Tech Stack

### Core Framework

- **Next.js 16.0.0** (App Router, React 19.2.0)
- **TypeScript** (latest) with strict type checking disabled
- **Node.js 18+** required

### Database & ORM

- **Prisma 6.18.0** with Prisma Client and Accelerate extension
- **PostgreSQL** via Vercel Storage (production)
- Database connection via `@prisma/extension-accelerate`

### UI Framework

- **Material-UI (MUI) v7.3.4** - Component library
- **Tailwind CSS v4.1.14** - Utility-first styling
- **Emotion** - CSS-in-JS for MUI

### Authentication

- **Auth.js (NextAuth) v5.0.0-beta.29** with Google OAuth
- **Prisma Adapter** for session management

### State Management & Data Fetching

- **Zustand 5.0.8** - Client state management
- **SWR 2.3.6** - Data fetching and caching
- **Server Actions** - Primary data mutation pattern
- **@dnd-kit** - Drag-and-drop for schedule arrangement

### Validation & Forms

- **Valibot 1.1.0** - Schema validation (lightweight Zod alternative)

### Testing

- **Jest 29.7.0** - Unit testing
- **Playwright 1.56.1** - E2E testing
- **React Testing Library 16.3.0**

### Additional Libraries

- **ExcelJS 4.4.0** - Excel export
- **react-to-print 3.2.0** - PDF generation
- **Recharts 3.3.0** - Data visualization
- **Notistack 3.0.2** - Toast notifications

### Package Manager

- **pnpm 10.18.3+** (REQUIRED - not npm/yarn)

## Architecture

### Clean Architecture Pattern ✅

**All features now follow Clean Architecture with Server Actions:**

```
features/{domain}/
├── application/
│   ├── actions/          # Server Actions (✅ 100% migrated)
│   │   └── {domain}.actions.ts
│   └── schemas/          # Valibot validation schemas
│       └── {domain}.schemas.ts
├── domain/
│   └── services/         # Pure business logic functions
│       └── {domain}-validation.service.ts
├── infrastructure/
│   └── repositories/     # Database access layer (Prisma)
│       └── {domain}.repository.ts
└── presentation/         # (optional) UI-specific code
    ├── components/
    ├── hooks/
    └── stores/
```

### Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (minimal - most use Server Actions)
│   ├── dashboard/         # Dashboard pages
│   │   └── [semesterAndyear]/  # Dynamic routes (e.g., "1-2567")
│   │       ├── all-timeslot/
│   │       ├── teacher-table/
│   │       ├── student-table/
│   │       └── all-program/
│   ├── schedule/          # Schedule management pages
│   │   └── [semesterAndyear]/
│   │       ├── assign/    # Subject assignment
│   │       ├── arrange/   # Timetable arrangement
│   │       ├── config/    # Semester configuration
│   │       └── lock/      # Lock schedules
│   └── proxy.ts           # Next.js 16 middleware (renamed from middleware.ts)
├── features/              # Feature-based modules (Clean Architecture)
│   ├── assign/           # Subject assignment to classes
│   ├── class/            # Class schedule management
│   ├── config/           # Semester configuration
│   ├── gradelevel/       # Grade level management
│   ├── program/          # Curriculum program management
│   ├── room/             # Room management
│   ├── schedule-arrangement/ # Schedule arrangement logic
│   ├── semester/         # Semester management
│   ├── subject/          # Subject management
│   ├── teacher/          # Teacher management
│   └── timeslot/         # Timeslot management
├── components/           # Shared UI components
├── hooks/               # Shared React hooks
│   └── useSemesterSync.ts  # Global semester state management ✅
├── lib/                 # Utility libraries
│   └── prisma.ts        # Prisma client singleton
├── shared/              # Shared schemas & utilities
│   └── lib/
│       └── action-wrapper.ts  # ActionResult<T> pattern
├── stores/              # Zustand stores
│   └── semester-store.ts  # Global semester state
└── types/               # TypeScript type definitions

prisma/
├── schema.prisma        # Database schema (PostgreSQL)
├── migrations/          # Migration history
└── generated/           # Generated Prisma Client
    ├── index.ts         # Standard Prisma Client
    └── edge/            # Edge runtime with Accelerate

__test__/               # Unit tests (Jest)
e2e/                    # Playwright E2E tests
docs/                   # Documentation
scripts/                # Build & deployment scripts
```

## Key Architectural Decisions

### 1. Server Actions (✅ 100% Migrated)

**Status:** All components now use Server Actions instead of API routes

**Migration Complete:**

- ✅ **Schedule Feature** (6/6 components)
- ✅ **Dashboard Feature** (4/4 components)
- ✅ **Legacy `axios.ts` deleted**
- ✅ **No fetcher usage remaining**

**Pattern:**

```typescript
// Server Action (in features/{domain}/application/actions/)
"use server";

export const getDataAction = createAction(
  getDataSchema,
  async (input: GetDataInput) => {
    const data = await repository.findByTerm(
      input.AcademicYear,
      input.Semester,
    );
    return data;
  },
);

// Usage in Client Component
const { data } = useSWR(
  ["cache-key", param],
  async ([, param]) => await getDataAction({ param }),
);

// Unwrap ActionResult<T>
if (data && "success" in data && data.success && data.data) {
  const actualData = data.data;
  // Use actualData
}
```

### 2. Global Semester State (✅ Complete)

**Hook:** `useSemesterSync(configId: string)`
**Store:** Zustand `semester-store.ts`

**Usage in ALL components:**

```typescript
const { semester, academicYear } = useSemesterSync(params.semesterAndyear);
// Returns: { semester: "1", academicYear: "2567" }
```

**Replaces:** Manual `split("-")` parsing everywhere

### 3. ConfigID Format (✅ Standardized)

**Canonical Format:** `"SEMESTER-YEAR"` (e.g., `"1-2567"`, `"2-2568"`)

**Used in:**

- Route segments: `/dashboard/1-2567/all-timeslot`
- Database `ConfigID` field
- TimeslotID prefix: `"1-2567-MON1"`
- Global state: `useSemesterSync`

**Validation:** `/^[1-3]-\d{4}$/`

### 4. ActionResult Pattern

**Type:**

```typescript
type ActionResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
};
```

**Benefits:**

- Consistent error handling
- Type-safe responses
- Valibot schema validation
- No HTTP status codes needed

## Key Conventions

### Route Patterns

- Dynamic routes use `[semesterAndyear]` parameter
- Format: hyphen-separated (e.g., `/dashboard/1-2567/`)
- Validation in layout.tsx ensures ConfigID exists in DB

### Data Fetching

- **Primary:** Server Actions via `useSWR`
- **Fallback:** Direct Server Component fetching (async/await)
- **Deprecated:** API routes (only for legacy external integrations)

### State Management

- **Global:** Zustand stores (semester, UI state)
- **Server:** React Server Components (no client state)
- **Client:** `useState`, `useMemo`, `useCallback`

### Environment Variables

```env
DATABASE_URL          # Postgres connection (Vercel Storage via Marketplace)
AUTH_SECRET          # Auth.js secret
AUTH_URL             # App URL
AUTH_GOOGLE_ID       # OAuth client ID
AUTH_GOOGLE_SECRET   # OAuth client secret
SEED_SECRET          # Production seed API protection
```

## Deployment

- **Platform**: Vercel
- **Database**: Vercel Storage: Postgres (Marketplace integration)
- **Production URL**: https://phrasongsa-timetable.vercel.app
- **Build Command**: `pnpm build`
- **Start Command**: `pnpm start`

## Major Milestones (2025)

### October 2025

1. ✅ **Server Actions Migration Complete**
   - All 10 components (6 schedule + 4 dashboard) migrated
   - axios.ts completely removed
   - Established ActionResult<T> pattern
   - Created 2 new Server Actions:
     - `getSubjectsByGradeAction`
     - `getProgramByGradeAction`

2. ✅ **Global State Refactoring**
   - Created `useSemesterSync` hook
   - Replaced manual `split()` parsing in all components
   - Centralized semester state in Zustand

3. ✅ **ConfigID Standardization**
   - Migrated from multiple formats to canonical `"SEMESTER-YEAR"`
   - Updated all validation layers
   - Updated route parsing
   - Updated TimeslotID generation

### Earlier 2025

4. ✅ **Next.js 16 Upgrade**
   - Async Request APIs (`await cookies()`, `await headers()`)
   - `middleware.ts` → `proxy.ts` convention
   - React 19 compatibility

5. ✅ **MUI v7 Migration**
   - Upgraded from MUI v5/v6
   - Updated theme configuration
   - Fixed breaking changes

6. ✅ **Tailwind CSS v4**
   - Migrated from v3
   - Updated configuration

## Feature Status

### ✅ Complete & Production-Ready

- Schedule Feature (assign, arrange, config, lock)
- Dashboard Feature (all-timeslot, teacher-table, student-table, all-program)
- Teacher Management
- Subject Management
- Room Management
- Timeslot Configuration
- Grade Level Management
- Program Management
- Authentication (Google OAuth)
- Export (Excel, PDF)
- Global Semester State

### 🚧 Planned/Future

- Draft Mode for schedule preview
- Advanced conflict resolution
- Multi-user concurrent editing
- Mobile-responsive schedule viewing
- Email notifications
- Audit logs

## Performance Considerations

### Database

- Prisma with Accelerate for connection pooling
- Indexed foreign keys for fast joins
- Batch operations (`createMany`, `deleteMany`)

### Frontend

- Server Components for data-heavy pages
- Client Components only when needed (state, events, browser APIs)
- useSWR for client-side caching
- Code splitting via dynamic imports

### Caching Strategy

- SWR cache keys include relevant parameters
- `revalidateOnFocus: false` for stable data
- Manual revalidation via `mutate()`

## Testing Strategy

### Unit Tests (Jest)

- Domain services (pure functions)
- Validation logic
- Utility functions
- Repository methods (mocked Prisma)

### E2E Tests (Playwright)

- Critical user flows
- Schedule creation/modification
- Conflict detection
- Export functionality
- All seeded semesters

### Current Coverage

- Unit: ~60% (improving)
- E2E: Key flows covered

## Documentation

### Key Docs (docs/)

- `AGENTS.md` - AI agent instructions
- `DEPLOYMENT.md` - Production deployment guide
- `.github/copilot-instructions.md` - GitHub Copilot config
- Various feature-specific implementation docs

### Code Documentation

- JSDoc for public functions
- Inline comments for complex logic
- README.md for setup instructions

## Common Patterns

### Server Action Creation

1. Create repository method in `infrastructure/repositories/`
2. Create Valibot schema in `application/schemas/`
3. Create Server Action in `application/actions/`
4. Use `createAction` wrapper from `action-wrapper.ts`
5. Import in component with `useSWR`

### Adding New Feature

1. Create feature directory: `features/{domain}/`
2. Follow Clean Architecture structure
3. Create repository (data access)
4. Create validation service (business logic)
5. Create schemas (Valibot)
6. Create Server Actions
7. Create presentation components (if needed)
8. Update types
9. Add tests

### Debugging

- Check browser console for client errors
- Check terminal for server errors
- Use React DevTools for component tree
- Use Prisma Studio for database inspection: `pnpm prisma studio`
- Check Vercel logs for production issues

## Known Limitations

1. **TypeScript Strict Mode**: Disabled (legacy codebase)
2. **Timeslot Editing**: Limited to admin (no teacher self-service)
3. **Conflict Auto-Resolution**: Manual resolution required
4. **Mobile UI**: Optimized for desktop (mobile usable but not ideal)
5. **Real-time Updates**: Requires manual refresh (no WebSocket)

## Support & Maintenance

**Development Team Contact:**

- Primary: Project maintainer
- Repository: GitHub (private)
- Deployment: Vercel dashboard

**Critical Dependencies:**

- Next.js 16+ (stable)
- Prisma 6+ (stable)
- MUI v7 (stable)
- Auth.js v5 (beta - stable enough)
