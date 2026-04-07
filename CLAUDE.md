# CLAUDE.md - Project Guide for Claude Code

## Project Overview

**Phrasongsa Timetable** - A school timetable management system for Thai secondary schools.
Built with Next.js 16 (App Router), TypeScript (strict), Prisma + PostgreSQL, MUI 7, Tailwind CSS 4, Better Auth, Valibot, and Zustand/SWR.

Authors: Napat Phobutdee & Natapon Wangkham (KMITL, 2023)

## Quick Reference

```bash
# Package manager: PNPM only (never npm/yarn)
pnpm install              # Install dependencies
pnpm dev                  # Dev server (port 3000)
pnpm build                # Production build
pnpm lint                 # ESLint
pnpm typecheck            # TypeScript checking

# Database
pnpm db:migrate           # Create migration (dev)
pnpm db:deploy            # Apply migrations (prod)
pnpm db:seed:clean        # Seed with sample data
pnpm db:studio            # Prisma Studio UI

# Testing
pnpm test                 # Unit tests (Vitest)
pnpm test:watch           # Watch mode
pnpm test:e2e             # E2E tests (Playwright)
pnpm test:e2e:ui          # E2E with UI
```

## Architecture

**Feature-based structure** in `src/features/<domain>/`:
- `application/actions/` - Server actions
- `application/queries/` - Data queries
- `domain/services/` - Business logic
- `domain/repositories/` - Data access (Prisma)
- `presentation/` - React components

**21 feature modules:** analytics, arrange, assign, class, config, conflict, dashboard, email, export, gradelevel, lock, program, room, schedule-arrangement, semester, subject, teacher, teaching-assignment, timeslot

## Key Files

| Purpose | Path |
|---------|------|
| DB schema | `prisma/schema.prisma` |
| Auth config | `src/lib/auth.ts` |
| Prisma client | `src/lib/prisma.ts` |
| MUI theme | `src/app/theme.ts` |
| Timeslot ID utils | `src/utils/timeslot-id.ts` |
| Zustand stores | `src/stores/` |
| API routes | `src/app/api/` |
| E2E tests | `e2e/` |
| Unit tests | `__test__/` |

## Critical Rules

1. **PNPM only** - Never use npm or yarn
2. **Thai MOE compliance** - Subject codes (e.g. `ท21101`), credits, and hours follow MOE curriculum structure. Never invent codes or deviate from MOE patterns
3. **CI-first testing** - Commit and push; let GitHub Actions validate. Only run specific tests locally when debugging
4. **No `any` types** - Use domain types from Prisma schema and Valibot validation
5. **Server Components by default** - Use `"use client"` only when necessary
6. **Valibot for validation** - Not Zod. Return `{ success: true, data }` or `{ success: false, error }`

## ID Formats

**TimeslotID:** `{SEMESTER}-{YEAR}-{DAY}{PERIOD}` (e.g. `1-2567-MON1`)
- No hyphen before period number! `1-2567-MON1` not `1-2567-MON-1`
- Always use utilities from `src/utils/timeslot-id.ts`, never manual string parsing

**ConfigID:** `{SEMESTER}-{YEAR}` (e.g. `1-2567`)

## Tech Stack Summary

- **Framework:** Next.js 16 (App Router, React Compiler, React 19)
- **Styling:** MUI 7 + Tailwind CSS 4
- **Auth:** Better Auth (email/password + Google OAuth)
- **DB:** PostgreSQL 16 via Prisma ORM 6
- **Validation:** Valibot 1.3
- **State:** Zustand (UI) + SWR (server)
- **DnD:** DnD Kit
- **Charts:** Recharts
- **Export:** ExcelJS, jsPDF, html2canvas
- **Testing:** Vitest (unit) + Playwright (E2E)
- **Deploy:** Vercel

## AGENTS.md Precedence

The `AGENTS.md` file in this repo defines the full agent contract including MCP priority, MOE compliance rules, and coding standards. When in doubt, defer to `AGENTS.md`.
