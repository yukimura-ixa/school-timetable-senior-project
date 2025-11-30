# School Timetable Management System - Codebase Review & Guide

**Date:** November 30, 2024  
**Version:** 2.0.0 (Next.js 16 + Better Auth)

## 1. Introduction

This document provides a comprehensive review and operational guide for the School Timetable Management System. It reflects the current state of the codebase as of November 2024, correcting discrepancies found in legacy documentation (specifically `AGENTS.md`).

**Key Architecture Highlights:**

- **Framework:** Next.js 16.0.5 (App Router, Server Actions, Async Request APIs).
- **Language:** TypeScript (Strict Mode partial).
- **Authentication:** **Better Auth** (Replaces NextAuth.js v5).
- **Architecture:** Feature-based Clean Architecture (Domain, Application, Infrastructure, Presentation).
- **Package Manager:** `pnpm` (v10.x).
- **Quality Gate:** CI-First (GitHub Actions), primarily relying on Playwright E2E tests due to Jest incompatibilities.

## 2. Setup

### Prerequisites

- Node.js v20+
- pnpm v10+ (`npm install -g pnpm`)
- PostgreSQL v16+

### Installation & Configuration

1.  **Install Dependencies:**

    ```bash
    pnpm install
    ```

    _Warning: Do not use `npm` or `yarn`._

2.  **Environment Variables:**
    Create `.env` from `.env.example`. **Critical Update:** This project uses Better Auth. Ensure these variables are set:

    ```env
    # Database
    DATABASE_URL="postgresql://user:pass@localhost:5432/school_db"

    # Authentication (Better Auth)
    AUTH_SECRET="<generated-secret>"
    AUTH_URL="http://localhost:3000"
    AUTH_GOOGLE_ID="<google-client-id>"
    AUTH_GOOGLE_SECRET="<google-client-secret>"
    ```

3.  **Database Initialization:**

    ```bash
    # Apply migrations
    pnpm db:migrate

    # Seed with clean test data (Recommended for Dev)
    pnpm db:seed:clean
    ```

## 3. Usage

### Development Workflow

- **Start Server:** `pnpm dev`
- **Studio:** `pnpm db:studio` (Manage DB data)

### Architectural Patterns (Clean Architecture)

When adding new features, strictly adhere to this folder structure in `src/features/<domain>`:

| Layer              | Path                           | Responsibility                  | Key/File Pattern  |
| :----------------- | :----------------------------- | :------------------------------ | :---------------- |
| **Application**    | `application/actions/`         | Server Actions, orchestration   | `*.actions.ts`    |
| **Domain**         | `domain/services/`             | Pure business logic, validation | `*.service.ts`    |
| **Infrastructure** | `infrastructure/repositories/` | Database access (Prisma)        | `*.repository.ts` |
| **Presentation**   | `presentation/` or `src/app`   | UI Components, Hooks            | `*.tsx`           |

### Authentication (Better Auth)

Use the `better-auth` client and server utilities. **Do not use `next-auth`**.

**Server-Side (API/Actions):**

```typescript
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const session = await auth.api.getSession({
  headers: await headers(), // Must await headers() in Next.js 16
});
```

**Client-Side:**

```typescript
import { authClient } from "@/lib/auth-client";
const { data: session } = authClient.useSession();
```

### Next.js 16 Patterns

- **Async Params:** Always await `params` and `searchParams` in pages/layouts.
  ```typescript
  export default async function Page({
    params,
  }: {
    params: Promise<{ id: string }>;
  }) {
    const { id } = await params;
    // ...
  }
  ```
- **Server Actions:** Use `"use server"` at the top of action files. Use `createAction` wrapper for validation.

## 4. Troubleshooting

### Testing Issues

- **Problem:** `pnpm test` (Jest) hangs or fails with stack overflow.
- **Cause:** Known incompatibility between Jest and Next.js 16 Server Components.
- **Solution:** Do not rely on local unit tests. Use **Playwright** for verification:
  ```bash
  pnpm test:e2e        # Run all E2E tests
  pnpm test:e2e:ui     # Run with UI (recommended for debugging)
  ```

### Database Conflicts

- **Problem:** Scheduling double-bookings (e.g., same room, same time).
- **Context:** The database schema (`class_schedule`) intentionally lacks strict unique constraints on timeslots to allow "Draft" flexibility.
- **Solution:** Rely on the **Conflict Detection Service** in the Application layer. Ensure you run conflict checks before "Publishing" a schedule.

### Build Errors

- **Problem:** Type errors during build.
- **Solution:** Run `pnpm typecheck` locally. The project uses strict TypeScript. Note that some strictness flags are temporarily disabled in `tsconfig.json` via TODOs; do not re-enable them without fixing the underlying legacy code.
