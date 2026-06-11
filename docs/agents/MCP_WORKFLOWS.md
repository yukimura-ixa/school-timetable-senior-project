# MCP Workflows Guide

Guide: **how** use MCP tools for Phrasongsa Timetable project. Expands MCP rules from `AGENTS.md` (Core Agent Contract).

- Audience: AI agents, developers
- Scope: Context7, Serena, GitHub MCP, dynamic MCPs (Next DevTools, Playwright)

---

## 1. MCP Priority Model (Recap)

Global priority order (defined in `AGENTS.md`):

1. **Context7** – official library/framework docs
2. **Serena** – codebase navigation, symbol-aware search
3. **GitHub** – issues, PRs, history
4. **Dynamic tools** – Next DevTools, Playwright, etc.

Doubt? Higher-priority MCP **must** run before lower.

---

## 2. Context7 – Library & Framework Docs

### 2.1 When to use

Use Context7 when:

- Call or modify **library/framework APIs**:
  - Next.js, React, Prisma, MUI, Tailwind, Better Auth/Auth.js, SWR, Zustand, Recharts, Valibot, Playwright, etc.
- Unsure about:
  - API signatures
  - supported options
  - deprecations / breaking changes
  - recommended patterns

### 2.2 Typical workflow

1. Identify libraries involved (e.g. Next.js routing, Prisma queries).
2. Resolve library in Context7 (e.g. `next`, `@prisma/client`).
3. Search topic:
   - Example topics: “App Router server actions”, “Prisma findMany include select”.
4. Align plan with **official doc patterns**, not memory.

Context7 down → **degraded mode**: no new patterns, no risky upgrades, keep changes small.

---

## 3. Serena – Codebase Reality

### 3.1 When to use

Use Serena for **any change** depending on how repo actually written:

- Locate functions, components, hooks, repositories, schemas
- Understand feature wiring end-to-end
- Find all symbol references (safe refactors)
- Discover existing test patterns or memories for feature

### 3.2 Typical workflow

- `get_symbols_overview` — feature folder structure
- `find_symbol` — open specific function/component
- `find_referencing_symbols` — who calls it
- built-in Grep for regex discovery; follow-up reads via Serena
- `list_memories` / `read_memory` — load existing design notes

Never propose multi-file refactors or “big rewrites” without Serena first.

Serena down → **degraded navigation mode**: only local, clearly-bounded changes; document risk.

---

## 4. GitHub MCP – Issues, PRs, History

### 4.1 When to use

Use GitHub MCP when:

- Task references issue numbers, PRs, branches, epics
- Task fits broader work item (feature, bug, refactor)
- Need to know:
  - why something done
  - what broke before
  - what product constraints exist

### 4.2 Typical workflow

- Fetch issue: description, acceptance criteria, comments.
- Fetch PR (if any):
  - previous attempts
  - reviewer feedback
  - related commits
- Use to shape:
  - solution design
  - edge cases, test cases
  - what **not** to repeat.

---

## 5. Dynamic Tools – Next DevTools, Playwright, etc.

### 5.1 Next DevTools / nextjs_runtime

Use when:

- Need current routes, errors, cache behavior, RSC/server action usage.
- Debug runtime issues not visible in static code.

Example flows:

- `list_tools` → inspect available devtools
- `call_tool('get_routes')` → understand app structure
- `call_tool('get_errors')` → debug runtime problems

### 5.2 Prisma CLI

Use for:

- Inspect schema and relations (`prisma studio`, `prisma/schema.prisma`)
- Understand migrations
- Debug query performance

No guess table shapes when Prisma can tell.

### 5.3 Playwright MCP

Use when:

- Add or update E2E tests
- Triage flaky E2E failures
- Check coverage for critical journeys (auth, CRUD, export)

Prefer **narrow** E2E specs (journey-focused); unit tests handle detailed logic.

---

## 6. Degraded MCP Modes (Central Rules)

- **Context7 down** → no new library patterns, no upgrades, only small changes.
- **Serena down** → no cross-cutting refactors; one file, minimal changes.
- **GitHub down** → assume missing constraints; no radical behavior changes.
- **Dynamic tools down** → no assert “this passes E2E” or “runtime is clean” without caveats.

Degraded mode → state it in response, bias toward safer, smaller work.