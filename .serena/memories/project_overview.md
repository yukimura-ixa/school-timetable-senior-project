# School Timetable System - Project Overview

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
- **MySQL 8.0** (legacy/development support)

### UI Framework
- **Material-UI (MUI) v7.3.4** - Component library
- **Tailwind CSS v4.1.14** - Utility-first styling
- **Emotion** - CSS-in-JS for MUI

### Authentication
- **NextAuth.js 5.0.0-beta.29** (Auth.js) with Google OAuth
- **Prisma Adapter** for session management

### State Management & Data Fetching
- **Zustand 5.0.8** - Client state management
- **SWR 2.3.6** - Data fetching and caching
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
- **pnpm 10.18.3+** (required - not npm/yarn)

## Architecture

### Directory Structure
```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── schedule/          # Schedule viewing pages
│   └── [semesterAndyear]/ # Dynamic routes (format: "1-2567")
├── features/              # Feature-based modules
│   ├── config/           # Table configuration
│   ├── semester/         # Semester management
│   ├── teacher/          # Teacher management
│   ├── subject/          # Subject management
│   ├── schedule-arrangement/ # Timetable scheduling
│   └── */
│       ├── application/  # Actions & schemas
│       ├── domain/       # Business logic & services
│       ├── infrastructure/ # Repositories
│       └── presentation/ # UI components & hooks
├── components/           # Shared UI components
├── lib/                  # Utility libraries
├── shared/              # Shared schemas & utilities
└── types/               # TypeScript type definitions

prisma/
├── schema.prisma        # Database schema
├── migrations/          # Migration history
└── seed.ts             # Database seeding

__test__/               # Unit tests
e2e/                    # Playwright E2E tests
docs/                   # Documentation
scripts/                # Build & deployment scripts
```

### Feature-Based Architecture
Each feature follows a layered architecture:
- **Application Layer**: Server actions, validation schemas
- **Domain Layer**: Business logic, validation services (pure functions)
- **Infrastructure Layer**: Database repositories
- **Presentation Layer**: React components, hooks, stores

## Key Conventions

### ConfigID Format (CRITICAL - Recently Standardized)
**Canonical Format**: `"SEMESTER-YEAR"` (e.g., `"1-2567"`, `"2-2568"`)

**Usage:**
- Route segments: `/dashboard/1-2567/all-timeslot`
- Database `ConfigID` field in `table_config` table
- TimeslotID prefix: `"1-2567-MON1"`, `"2-2568-TUE3"`

**Migration Status:**
- ✅ Validation layer updated (regex: `/^[1-3]-\d{4}$/`)
- ✅ Route parsing updated
- ✅ Action layers updated (TimeslotID generation)
- ✅ Seed API updated
- 🔄 Tests being updated
- ⏳ Database migration pending

**Note:** Database enum values `SEMESTER_1`, `SEMESTER_2` remain unchanged.

### Route Patterns
- Dynamic routes use `[semesterAndyear]` parameter
- Format: hyphen-separated (e.g., `/dashboard/1-2567/`)
- Validation in layout.tsx ensures ConfigID exists in DB

### API Routes
- Located in `src/app/api/`
- Use Next.js App Router conventions
- Return `Response.json()` for API responses

### Environment Variables
```env
DATABASE_URL          # Postgres connection (Vercel Storage)
NEXTAUTH_URL         # App URL
NEXTAUTH_SECRET      # Auth secret
GOOGLE_CLIENT_ID     # OAuth
GOOGLE_CLIENT_SECRET # OAuth
SEED_SECRET          # Production seed API protection
```

## Deployment
- **Platform**: Vercel
- **Database**: Vercel Storage: Postgres (via Marketplace)
- **Production URL**: https://phrasongsa-timetable.vercel.app

## Recent Major Changes
1. **ConfigID Standardization** (Oct 2025) - Migrated from multiple formats to canonical `"SEMESTER-YEAR"`
2. **Seed API Enhancement** - Added timeslot/config seeding with `-SeedData` flag
3. **Next.js 16 Upgrade** - Async Request APIs, proxy.ts convention
4. **MUI v7 Migration** - Updated from MUI v5/v6
5. **Tailwind CSS v4** - Migrated from v3
