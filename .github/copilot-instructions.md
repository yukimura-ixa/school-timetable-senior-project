# GitHub Copilot Instructions

> **GitHub Copilot**: This file configures your behavior for this repository.

---

## Primary Instructions Source

**Always refer to and follow the instructions in `AGENTS.md` at the root of this repository.**

The `AGENTS.md` file contains the complete operating manual for AI coding agents working on this project.

---

## Key Directives

### 1. MCP-First Workflow (MANDATORY)

**Always use MCP servers when reasoning about code, APIs, CLIs, or SDKs.**

#### Primary MCP: context7

**You MUST use context7 to pull up-to-date, version-specific docs and code examples for any library you touch.**

- Query context7 BEFORE implementing any feature that uses external libraries
- Always fetch the exact versions being used in this project (see package.json)
- If context7 contradicts prior knowledge, follow context7 and note the delta
- Document the library versions and APIs used in your responses

#### Other MCPs

Use other MCPs when relevant:
- **GitHub MCP** for issues/PRs
- **Files MCP** for local files
- Any other available MCPs that can help with the task

### 2. Package Manager

**⚠️ USE PNPM** - This project uses pnpm as the package manager. Always use `pnpm` commands, not npm or yarn.

### 3. Technology Stack

This is a **Next.js/TypeScript** project with:
- **Frontend/Backend**: Next.js 15 (React 18)
- **UI**: Tailwind CSS 4
- **ORM**: Prisma 5
- **DB**: MySQL 8 (Google Cloud SQL in prod)
- **Auth**: Google OAuth via NextAuth.js

### 4. Code Quality Standards

- **TypeScript everywhere** - No `any` types
- **Prisma schema** as the single source of truth
- **Pure functions** for constraint checks
- **Table-driven tests** for all business logic
- **Idempotent DB operations** (safe to retry)

### 5. Execution Flow

When given a task:

1. **Query context7** for the exact library versions and APIs
2. **Show an Evidence Panel** with versions and APIs you'll use
3. **Implement with TypeScript-first code**
4. **Add tests** for non-trivial logic
5. **Provide runbook** (commands, migrations)

---

## Project Context

This is a **school timetable management system** that:
- Helps schools create conflict-free class timetables
- Supports Admin, Teacher, and Student roles
- Handles teacher assignments, room allocations, and schedule conflicts
- Exports schedules to Excel and PDF

**Full project context and requirements are in `AGENTS.md`.**

---

## Quick Reference

```bash
# Dev commands
pnpm install
pnpm prisma generate && pnpm prisma migrate dev
pnpm dev

# Test commands
pnpm test
pnpm test:e2e

# Lint/format
pnpm lint
```

---

## Remember

1. **Always consult `AGENTS.md` first** for complete instructions
2. **Always use context7** for library documentation
3. **Always use pnpm** for package management
4. **Always write TypeScript** with strong types
5. **Always add tests** for business logic

---

**For complete instructions, see `AGENTS.md` in the repository root.**
