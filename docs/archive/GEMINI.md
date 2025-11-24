# Gemini Project: AI Agent Handbook for Phrasongsa Timetable

> **DEFAULT INSTRUCTIONS FOR ALL CODING AGENTS**
> This document provides a comprehensive overview and operating manual for the School Timetable Management System project. It is the primary source of truth for development conventions, architecture, and workflow.

## 1. Project Overview

This is a full-stack web application built to modernize and streamline the creation and management of school timetables. It provides a feature-rich platform for administrators to manage teachers, subjects, classrooms, and curriculum, and to build complex schedules using a drag-and-drop interface with built-in conflict detection. The system also serves as a viewable portal for teachers and students.

### Key Technologies

- **Framework**: Next.js 16 (with React 19)
- **Language**: TypeScript
- **Styling**: Material-UI 7 & Tailwind CSS
- **Database ORM**: Prisma 6.18
- **Database**: PostgreSQL / Vercel Postgres
- **Authentication**: NextAuth.js v5 (Google OAuth & Credentials)
- **State Management**: Zustand & SWR
- **Validation**: Valibot
- **Testing**: Jest (Unit/Integration) & Playwright (E2E)
- **Package Manager**: **pnpm** ( exclusively)

## 2. Core Principles & Workflow

### **CRITICAL: Agent Operating Protocol**

1.  **MCP-First Workflow**: Always query Model Context Protocol (MCP) servers before implementing features or fixing bugs.
    - **Context7-First**: Query official library documentation (`resolve-library-id` -> `get-library-docs`) for Next.js, React, Prisma, MUI, etc., _before writing any code_.
    - **Serena-First**: Use symbol-aware tools (`get_symbols_overview`, `find_symbol`) for code analysis _before reading full files_.
    - **Next DevTools MCP**: Use for runtime diagnostics, browser automation, and upgrade workflows. Start every session with `mcp_next-devtools_init`.

2.  **Package Manager**: Use **`pnpm`** exclusively. Do not use `npm` or `yarn`.

3.  **CI-First Development**: Trust the GitHub Actions CI as the primary quality gate.
    - **Do not** run full test/lint suites locally for every commit. This is slow and redundant.
    - **Do** commit and push frequently. CI runs in parallel and provides fast feedback.
    - Local validation is for debugging CI failures, not for pre-flight checks.

4.  **Coding Standards**:
    - Adhere to the Clean Architecture pattern defined in `src/features`.
    - Maintain strict type safety. Avoid `any` unless absolutely necessary and documented.
    - Default to Server Components. Use Client Components (`"use client"`) only when state or browser APIs are required.

## 3. Project Structure

The codebase follows a clean architecture pattern, organized by feature domains.

```
/
├── src/
│   ├── app/                # Next.js App Router: Pages and API routes
│   ├── features/<domain>/  # Self-contained feature modules
│   │   ├── application/    # Use cases and server actions
│   │   ├── domain/         # Core business logic, entities, types
│   │   ├── infrastructure/ # Repositories (Prisma queries)
│   │   └── presentation/   # UI Components, hooks, stores
│   ├── components/         # Shared, non-feature-specific components
│   └── libs/               # Prisma client setup, other configs
├── prisma/
│   ├── schema.prisma       # The single source of truth for the database schema
│   └── seed.ts             # Script for seeding the database with test data
├── e2e/
│   └── *.spec.ts           # Playwright end-to-end tests
└── __test__/
    └── *.test.ts           # Jest unit and integration tests
```

## 4. Development Setup

### Prerequisites

- Node.js (v18.x or higher)
- **pnpm** (v10.x or higher)
- PostgreSQL (v16 or higher)

### Step-by-step Guide

1.  **Clone the Repository**: `git clone https://github.com/yukimura-ixa/school-timetable-senior-project.git && cd school-timetable-senior-project`
2.  **Install Dependencies**: `pnpm install`
3.  **Configure Environment**:
    - Copy the example file: `cp .env.example .env`
    - For local development, enable the OAuth bypass and set your database URL:
      ```env
      ENABLE_DEV_BYPASS="true"
      DEV_USER_EMAIL="admin@test.com"
      DEV_USER_ROLE="admin"
      DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/school-timetable-db-dev"
      NEXTAUTH_URL="http://localhost:3000"
      NEXTAUTH_SECRET="your-secret-key" # Generate with: openssl rand -base64 32
      ```
4.  **Setup PostgreSQL Database**: `CREATE DATABASE "school-timetable-db-dev";`
5.  **Run Migrations & Seeding**:
    ```bash
    pnpm db:migrate
    pnpm db:seed:clean # Recommended for dev: clears and populates with full mock data
    ```
6.  **Start the Development Server**: `pnpm dev`
    - The app will be at `http://localhost:3000`. Log in using the "Dev Bypass" button.

## 5. Available Commands

### Main Commands

- `pnpm dev`: Starts the Next.js development server.
- `pnpm build`: Creates a production build.
- `pnpm start`: Starts the production server.

### Testing Commands (CI-First)

- `pnpm test`: Runs all unit tests using Jest. **(Use for debugging, not pre-commit checks)**.
- `pnpm test:e2e`: Runs all end-to-end tests using Playwright.
- `pnpm test:e2e:ui`: Opens the Playwright UI for interactive E2E testing.

### Database Commands

- `pnpm db:migrate`: Creates and applies new migrations (dev).
- `pnpm db:deploy`: Applies pending migrations (prod).
- `pnpm db:seed:clean`: **(Recommended for Dev)** Clears and re-populates the DB with full mock data.
- `pnpm db:studio`: Opens the Prisma Studio web GUI.

### Code Quality

- `pnpm lint`: Runs ESLint.
- `pnpm format`: Formats code with Prettier.
- `pnpm typecheck`: Runs TypeScript compiler checks.

## 6. Database and Prisma

The schema is defined in `prisma/schema.prisma`. Use the following singleton pattern for the Prisma Client to prevent connection issues during development hot-reloading.

```ts
// src/libs/prisma.ts
import { PrismaClient } from "@/prisma/generated/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const globalForPrisma = globalThis as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient().$extends(withAccelerate());

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

## 7. Testing Strategy

This project uses a "Test Pyramid" approach, emphasizing unit and integration tests, with fewer, more critical E2E tests.

- **Unit Tests (Jest)**: Located in `__test__/`, they test pure functions, validation logic, and business rules in isolation.
- **E2E Tests (Playwright)**: Located in `e2e/`, they cover critical, cross-role user journeys like authentication, scheduling, and exporting.
- **CI-First**: All tests are run automatically in GitHub Actions. **Do not run tests locally before every commit.**

### Known Issue: Jest Stack Overflow

A known issue with Next.js 16 causes Jest to hang. The `forceExit: true` flag in `jest.config.js` is an intentional workaround. Do not remove it.

## 8. Security & Performance

- **Authentication**: All sensitive operations must be protected by a server-side session check using `next-auth`.
- **Validation**: All user input must be validated on the server using **Valibot** schemas before being processed or stored.
- **SQL Injection**: Prevented by using the Prisma ORM exclusively. Do not use raw SQL queries with user input.
- **Performance**: Use `React.memo`, `useMemo`, and `useCallback` to optimize expensive components. Use `next/dynamic` for code-splitting large components. Leverage the Next.js Image component for automatic image optimization.
