# MCP Workflows Guide

This document explains **how** to use MCP tools effectively for the
Phrasongsa Timetable project. It expands the MCP rules defined in
`AGENTS.md` (Core Agent Contract).

- Target audience: AI agents and developers
- Scope: Context7, Serena, GitHub MCP, dynamic MCPs (Next DevTools, Playwright)

---

## 1. MCP Priority Model (Recap)

Global priority order (already defined in `AGENTS.md`):

1. **Context7** – official library/framework docs
2. **Serena** – codebase navigation and symbol-aware search
3. **GitHub** – issues, PRs, historical context
4. **Dynamic tools** – Next DevTools, Playwright, etc.

When in doubt, assume a higher-priority MCP **must** be used before a lower one.

---

## 2. Context7 – Library & Framework Docs

### 2.1 When to use

Use Context7 whenever you:

- Call or modify **library/framework APIs**:
  - Next.js, React, Prisma, MUI, Tailwind, Better Auth/Auth.js, SWR, Zustand,
    Recharts, Valibot, Playwright, etc.
- Are unsure about:
  - API signatures
  - supported options
  - deprecations / breaking changes
  - recommended patterns

### 2.2 Typical workflow

1. Identify libraries involved (e.g. Next.js routing, Prisma queries).
2. Resolve the library in Context7 (e.g. `next`, `@prisma/client`).
3. Search for the relevant topic:
   - Example topics: “App Router server actions”, “Prisma findMany include select”.
4. Read and align your plan with **official doc patterns**, not memory.

If Context7 is down, note you are in **degraded mode**, avoid new patterns
and risky upgrades, and keep changes small.

---

## 3. Serena – Codebase Reality

### 3.1 When to use

Use Serena for **any change** that depends on how the repo is actually written:

- Locating functions, components, hooks, repositories, schemas
- Understanding how a feature is wired end-to-end
- Finding all references to a symbol (for safe refactors)
- Discovering existing test patterns or memories for a feature

### 3.2 Typical workflow

- `get_symbols_overview` to see the structure of a feature folder
- `find_symbol` to open a specific function/component
- `find_referencing_symbols` to discover who calls it
- built-in Grep for regex discovery; follow-up reads via Serena
- `list_memories` / `read_memory` to load existing design notes

Never propose multi-file refactors or “big rewrites” without first using Serena.

If Serena is down, you are in **degraded navigation mode**: only do local,
clearly-bounded changes and document the risk.

---

## 4. GitHub MCP – Issues, PRs, History

### 4.1 When to use

Use GitHub MCP when:

- The task references:
  - issue numbers, PRs, branches, or epics
- The task clearly fits a broader work item (feature, bug, refactor)
- You need to know:
  - why something was done
  - what went wrong previously
  - what product constraints exist

### 4.2 Typical workflow

- Fetch the relevant issue: description, acceptance criteria, comments.
- Fetch the PR (if any) to see:
  - previous attempts
  - reviewer feedback
  - related commits
- Use this to shape:
  - solution design
  - edge cases and test cases
  - what **not** to do again.

---

## 5. Dynamic Tools – Next DevTools, Playwright, etc.

### 5.1 Next DevTools / nextjs_runtime

Use when you:

- Need to see current routes, errors, cache behavior, RSC/server action usage.
- Debug runtime issues that don’t show clearly in static code.

Example flows:

- `list_tools` → inspect available devtools
- `call_tool('get_routes')` → understand app structure
- `call_tool('get_errors')` → debug runtime problems

### 5.2 Prisma CLI

Use for:

- Inspecting schema and relations (`prisma studio`, `prisma/schema.prisma`)
- Understanding migrations
- Debugging query performance issues

Don’t guess table shapes when Prisma can tell you.

### 5.3 Playwright MCP

Use when:

- Adding or updating E2E tests
- Triaging flaky E2E failures
- Checking coverage for critical journeys (auth, CRUD, export)

Prefer **narrow** E2E specs (journey-focused) and let unit tests handle detailed logic.

---

## 6. Degraded MCP Modes (Central Rules)

- **Context7 down** → no new library patterns, no upgrades, only small changes.
- **Serena down** → avoid cross-cutting refactors; stay in one file, minimal changes.
- **GitHub down** → assume there may be missing constraints; avoid radical behavior changes.
- **Dynamic tools down** → do not assert “this passes E2E” or “runtime is clean” without caveats.

When in degraded mode, state it in your response and bias toward safer, smaller work.
