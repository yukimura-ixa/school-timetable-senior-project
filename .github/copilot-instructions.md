# GitHub Copilot Instructions

> **GitHub Copilot**: This file configures your behavior for this repository.

---

## Primary Instructions Source

**Always refer to and follow the instructions in `AGENTS.md` at the root of this repository.**

The `AGENTS.md` file contains the complete operating manual for AI coding agents working on this project.

---

## Key Directives

### 0. MCP Priority & Routing (MANDATORY)

**You MUST route work through these MCPs in this exact order of responsibility:**

1. **Serena (code-first MCP, REQUIRED for all code operations)**  
   - Use Serena for *reading, navigating, and editing* the codebase.  
   - Prefer Serena’s symbol-aware tools over raw text edits.  
   - Do **not** write/overwrite files directly via Files MCP unless Serena is unavailable.
   - Core Serena tools to prefer:  
     - `list_dir`, `search_for_pattern`, `read_file` (discovery)  
     - `rename_symbol`, `replace_symbol_body`, `replace_lines`, `insert_at_line` (edits)  
     - `summarize_changes`, `restart_language_server`, `get_current_config` (hygiene)

2. **context7 (docs MCP, REQUIRED before using any external library)**  
   - Always query context7 for the **exact versions** from `package.json`/lockfiles and pull **version-specific docs & examples**.  
   - If context7 contradicts prior knowledge, **follow context7** and note the delta in the Evidence Panel.

3. **Sequential-Thinking MCP (planner)**  
   - Use a planning MCP (e.g., `sequential-thinking`, `planner`, or equivalent) to form an internal step plan **before** doing edits.  
   - Keep raw chain-of-thought internal; expose only a concise **Plan Summary** (bulleted, ≤5 items) in outputs.

4. **Files MCP (read-only fallback)**  
   - Use for *reading* only when Serena read ops are insufficient. Avoid write ops here.

5. **GitHub MCP (issues/PRs)**  
   - Use for fetching issue/PR context, labels, discussions, and posting summaries as needed.

If Serena is not available, **fail fast** with a short note and proceed read-only; do not attempt risky text rewrites without Serena.

> **Definitions (C1/C2):**  
> *Idempotent* — safe to retry without changing the end result beyond the first execution.  
> *Delta* — the difference/change between two states (e.g., docs vs. code).  
> *Symbol-aware* — operations that understand code structure (types/functions), not just plain text.

---

### 1. MCP-First Workflow (MANDATORY)

**Always use MCP servers when reasoning about code, APIs, CLIs, or SDKs.**

#### Primary MCPs
- **Serena** — the default interface for *code navigation & edits*.  
- **context7** — the default interface for *library docs & examples* (version-specific).

#### Supporting MCPs
- **Sequential-Thinking MCP** — internal plan creation (output only a Plan Summary).  
- **GitHub MCP** — issues/PRs.  
- **Files MCP** — read-only fallback.

**Before implementing any feature that uses external libraries:**
- Query **context7** for the exact versions used in this project.  
- Prefer examples that match those versions.  
- Document versions and APIs in the Evidence Panel.

---

### 2. Package Manager

**⚠️ USE PNPM** — This project uses pnpm as the package manager. Always use `pnpm` commands, not npm or yarn.

---

### 3. Technology Stack

This is a **Next.js/TypeScript** project with:
- **Frontend/Backend**: Next.js 15 (React 18)
- **UI**: Tailwind CSS 4
- **ORM**: Prisma 5
- **DB**: MySQL 8 (Google Cloud SQL in prod)
- **Auth**: Google OAuth via NextAuth.js

> Always confirm versions via context7 using the repo’s `package.json` and lockfile(s).

---

### 4. Code Quality Standards

- **TypeScript everywhere** — No `any` types.
- **Prisma schema** is the single source of truth.
- **Pure functions** for constraint checks.
- **Table-driven tests** for all business logic.
- **Idempotent DB operations** (safe to retry).

---

### 5. Execution Flow

When given a task:

1. **Plan (Sequential-Thinking MCP)**  
   - Create an internal step plan.  
   - Output a compact **Plan Summary** (≤5 bullets) — no raw chain-of-thought.

2. **Evidence (context7)**  
   - Query for exact library versions and the APIs you’ll use.  
   - Capture **version numbers**, **API signatures**, and **links to canonical examples**.

3. **Implement (Serena)**  
   - Use Serena to navigate and edit code (symbol-aware where possible).  
   - Prefer `rename_symbol`/`replace_symbol_body` over ad-hoc string edits.  
   - Keep commits minimal, logically scoped.

4. **Test**  
   - Add/extend unit tests and table-driven cases for non-trivial logic.  
   - Add Playwright E2E when behavior spans multiple pages/roles.

5. **Runbook**  
   - Provide exact commands (pnpm), migrations (Prisma), and any env vars.  
   - Include a brief **MCP usage recap**: context7 queries (library@version) and Serena tools invoked.

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
pnpm format
```

## Remember

1. **Always consult `AGENTS.md` first** for complete instructions
2. **Always use Serena for code** (navigation/edits) and **context7** for documentation.
3. **Always use a Sequential-Thinking MCP** to plan; expose only a concise Plan Summary.
4. **Always use pnpm** for package management
5. **Always write TypeScript** with strong types
6. **Always add tests** for business logic

---

**For complete instructions, see `AGENTS.md` in the repository root.**
