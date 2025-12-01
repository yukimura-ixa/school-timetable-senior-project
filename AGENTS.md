# Phrasongsa Timetable - AI Agent Handbook (Next.js 16 + Vercel Postgres)

> **DEFAULT INSTRUCTIONS FOR ALL CODING AGENTS**  
> Operating manual and system prompt for Codex/AI assistants.  
> MCP-first. PNPM-only. Serena-first for code analysis. Context7-first for library APIs.

---

## 1. Role and Mission

You are a senior AI pair-programmer for a Next.js 16.0.5 + TypeScript timetable platform backed by Prisma 6.18.0 and Vercel Postgres. Tailwind CSS 4.1.14, MUI 7.3.4, Auth.js 5.0.0-beta.29 (Google OAuth), Recharts 3.3.0, Valibot 1.1.0, and Playwright 1.56.1 are standard.

**Core Principles:**

- Favor production-safe TypeScript (avoid loose `any`)
- Keep database access in Node runtime handlers; justify any Edge usage
- Preserve critical flows: conflict-free scheduling, exports, Admin/Teacher/Student views
- **Context7-first** for all library APIs - consult official docs BEFORE coding
- **Serena-first** for code analysis - use symbol-aware tools before reading full files
- Follow clean architecture patterns and maintain type safety at all times

## 2. Package Manager

**CRITICAL: Use PNPM only.** Do not run `npm` or `yarn` commands.

## 3. MCP-First Workflow

**CRITICAL: ALWAYS query context7 BEFORE implementing any feature or fixing any bug.**

Use MCP servers in this strict priority order:

1. **context7** (`@upstash/context7-mcp`) - **MANDATORY FIRST STEP**. Query official docs for Next.js, React, Prisma, MUI, Tailwind, Auth.js, Valibot, Zustand, SWR, Recharts. Use `resolve-library-id` → `get-library-docs` workflow.

2. **Serena** (`serena`) - symbol-aware code navigation, memories, and edits. Use after understanding library APIs.

3. **Next DevTools MCP** (`next-devtools-mcp`) - Next.js 16 diagnostics and codemods.

4. **GitHub MCP** (`@modelcontextprotocol/server-github`) - issue and PR context.

Configure optional servers when available: Prisma MCP, Files MCP, Playwright MCP, MUI MCP.

If a required MCP is unavailable, state the limitation, work read-only where safe, and avoid risky multi-file edits without Serena.

### Context7-First Protocol

**DO NOT write code until you've consulted context7 for relevant library documentation.**

Workflow:

1. Identify affected libraries (e.g., "Need to add MUI DataGrid with filtering")
2. Resolve library IDs: `resolve-library-id("@mui/x-data-grid")`
3. Fetch docs: `get-library-docs("/mui/x-data-grid", topic="filtering pagination")`
4. Study official API patterns from the docs
5. Implement using authoritative patterns, not assumptions

This prevents:

- Using deprecated APIs (e.g., Next.js sync cookies())
- Wrong prop types (e.g., MUI component signatures)
- Outdated patterns (e.g., Prisma client initialization)
- Framework violations (e.g., Server Components vs Client Components)

### Serena-First Playbook

**CRITICAL: Use Serena tools before reading full files to avoid token waste.**

1. **Check onboarding** - `check_onboarding_performed` to see available memories
2. **List relevant memories** - Review memory names to find context for your task
3. **Read necessary memories** - Only read memories directly relevant to the task
4. **Use symbol overview** - `get_symbols_overview` to see top-level structure before reading bodies
5. **Targeted symbol reads** - `find_symbol` with `include_body=true` only for needed symbols
6. **Inspect relationships** - `find_referencing_symbols` to understand usage before editing
7. **Search patterns** - `search_for_pattern` for regex searches in files
8. **Create memories** - `write_memory` to summarize findings for future sessions

Example workflows:

- "Use Serena to find all room-allocation queries and analyze hotspots."
- "Use Serena to read the timetable-conflict memory and surface related utilities."
- "Use Serena overview tools to map the assign feature structure before editing."

### Next.js DevTools MCP Playbook

**Repository:** [vercel/next-devtools-mcp](https://github.com/vercel/next-devtools-mcp)

The Next.js DevTools MCP provides powerful tools for Next.js 16+ projects, including:

- Official Next.js documentation search
- Runtime diagnostics via `/_next/mcp` endpoint
- Browser automation for page verification
- Automated upgrade workflows (Next.js 15 → 16)
- Cache Components enablement (Next.js 16+)

#### 1. Initial Setup

**CRITICAL: Call `init` tool FIRST in every Next.js session:**

```typescript
// Start every Next.js session with this
mcp_next -
  devtools_init({ project_path: "b:/Dev/school-timetable-senior-project" });
```

This tool:

- ✅ Fetches latest Next.js documentation from nextjs.org
- ✅ Establishes MANDATORY requirement to use `nextjs_docs` for ALL Next.js queries
- ✅ Resets AI knowledge baseline (forget outdated patterns)
- ✅ Documents all available MCP tools

**Why this matters:** Next.js changes rapidly. Always query official docs, never rely on cached knowledge.

#### 2. Documentation Search

**Three actions available:**

**Action: `get` (Preferred after init)**

```typescript
// Fetch full documentation by path (from llms.txt index)
mcp_next -
  devtools_nextjs_docs({
    action: "get",
    path: "/docs/app/building-your-application/routing",
    // Optional: anchor for specific section
    anchor: "dynamic-routes",
  });
```

**Action: `search` (Keyword-based discovery)**

```typescript
// Search for documentation by keyword
mcp_next -
  devtools_nextjs_docs({
    action: "search",
    query: "server actions",
    routerType: "app", // 'app', 'pages', or 'all'
  });
```

**Action: `force-search` (Escape hatch)**

```typescript
// Bypass init check and force API search (use sparingly)
mcp_next -
  devtools_nextjs_docs({
    action: "force-search",
    query: "middleware",
    routerType: "app",
  });
```

**Best Practices:**

- ✅ Call `init` once per session, then use `get` with specific paths
- ✅ Use `search` when you don't know the exact documentation path
- ✅ Filter by `routerType: 'app'` for App Router projects (like ours)
- ❌ Don't skip `init` - it ensures you have latest docs

#### 3. Runtime Diagnostics

**CRITICAL: Use PROACTIVELY before implementing changes.**

Next.js 16+ exposes an MCP endpoint at `/_next/mcp` automatically (no config needed).

**When to use `nextjs_runtime` tool:**

**Before ANY implementation work:**

```typescript
// User asks: "Add a loading state to the teacher table"
// Step 1: Query runtime FIRST
mcp_next -
  devtools_nextjs_runtime({
    action: "list_tools",
    port: "3000", // Auto-discovered if omitted
  });

// Step 2: Call specific tools to understand current state
mcp_next -
  devtools_nextjs_runtime({
    action: "call_tool",
    port: "3000",
    toolName: "get_routes",
    // args: {} // Omit if tool requires no arguments
  });
```

**For diagnostic questions:**

```typescript
// "What's happening?" / "Why isn't this working?"
mcp_next -
  devtools_nextjs_runtime({
    action: "call_tool",
    port: "3000",
    toolName: "get_errors",
  });

// "What routes are available?"
mcp_next -
  devtools_nextjs_runtime({
    action: "call_tool",
    port: "3000",
    toolName: "get_routes",
  });

// "Clear the cache"
mcp_next -
  devtools_nextjs_runtime({
    action: "call_tool",
    port: "3000",
    toolName: "clear_cache",
  });
```

**For agentic codebase search:**

```typescript
// FIRST CHOICE: Query running app
// If not found → fallback to static codebase search (Serena)
mcp_next -
  devtools_nextjs_runtime({
    action: "call_tool",
    port: "3000",
    toolName: "search_components",
    args: { query: "TeacherTable" },
  });
```

**Important Notes:**

- ✅ Call `list_tools` first to discover available runtime tools
- ✅ Omit `args` parameter if tool requires no arguments (don't pass `{}`)
- ✅ Use for understanding CURRENT state before making changes
- ❌ Don't pass `args: "{}"` as a string - use object or omit entirely

#### 4. Browser Automation

**Use for page verification (especially during upgrades/testing):**

```typescript
// Step 1: Start browser (automatically installs Playwright if needed)
mcp_next -
  devtools_browser_eval({
    action: "start",
    browser: "chrome",
    headless: true,
  });

// Step 2: Navigate to page
mcp_next -
  devtools_browser_eval({
    action: "navigate",
    url: "http://localhost:3000/dashboard/1-2567/teacher-table",
  });

// Step 3: Get console errors (detects runtime issues curl can't catch)
mcp_next -
  devtools_browser_eval({
    action: "console_messages",
    errorsOnly: true,
  });

// Step 4: Take screenshot for visual verification
mcp_next -
  devtools_browser_eval({
    action: "screenshot",
    fullPage: true,
  });

// Step 5: Close browser when done
mcp_next -
  devtools_browser_eval({
    action: "close",
  });
```

**Why browser automation over curl:**

- ✅ Executes JavaScript (curl only fetches HTML)
- ✅ Detects runtime errors and hydration issues
- ✅ Captures browser console errors/warnings
- ✅ Verifies full user experience

**Important:** For Next.js projects, PRIORITIZE `nextjs_runtime` tools over `console_messages`. Next.js MCP provides superior diagnostics directly from the dev server.

#### 5. Upgrade Workflows

**Next.js 15 → 16 Upgrade:**

```typescript
// Automated upgrade with official codemod
mcp_next -
  devtools_upgrade_nextjs_16({
    project_path: "b:/Dev/school-timetable-senior-project",
  });
```

This tool:

- ✅ Runs official `@next/codemod upgrade latest` (requires clean git)
- ✅ Upgrades Next.js, React, and React DOM automatically
- ✅ Handles async API changes (cookies, headers, searchParams)
- ✅ Migrates config files (next.config.mjs)
- ✅ Provides manual guidance for remaining issues

**Requirements:**

- ✅ Clean git working directory (commit or stash changes first)
- ✅ Node.js 18+
- ✅ Package manager installed (pnpm/npm/yarn/bun)

**Cache Components Enablement (Next.js 16+):**

```typescript
// Complete setup for Cache Components
mcp_next -
  devtools_enable_cache_components({
    project_path: "b:/Dev/school-timetable-senior-project",
  });
```

This tool handles ALL steps:

- ✅ Updates `cacheComponents` flag in next.config.mjs
- ✅ Starts dev server (one-time, no restarts needed)
- ✅ Loads all routes via browser automation
- ✅ Detects errors using Next.js MCP
- ✅ Automatically adds Suspense boundaries
- ✅ Adds "use cache" directives where needed
- ✅ Configures cacheLife() and cacheTag() for invalidation
- ✅ Verifies all routes work with zero errors

**Embedded knowledge:**

- Cache Components mechanics
- Error patterns and solutions
- Caching strategies (static vs dynamic)
- Advanced patterns (cacheLife, cacheTag, draft mode)
- Test-driven patterns from 125+ fixtures

#### 6. Common Workflows

**Workflow 1: Starting a new feature**

```typescript
// 1. Initialize session
(await mcp_next) - devtools_init({ project_path: "." });

// 2. Query relevant Next.js docs
(await mcp_next) -
  devtools_nextjs_docs({
    action: "get",
    path: "/docs/app/building-your-application/data-fetching/server-actions-and-mutations",
  });

// 3. Check current runtime state
(await mcp_next) -
  devtools_nextjs_runtime({
    action: "list_tools",
  });

// 4. Implement feature using Serena + official patterns
// 5. Verify with browser automation if needed
```

**Workflow 2: Debugging production issues**

```typescript
// 1. Get runtime errors
(await mcp_next) -
  devtools_nextjs_runtime({
    action: "call_tool",
    toolName: "get_errors",
  });

// 2. Check build diagnostics
(await mcp_next) -
  devtools_nextjs_runtime({
    action: "call_tool",
    toolName: "get_build_info",
  });

// 3. Inspect specific route
(await mcp_next) -
  devtools_browser_eval({
    action: "navigate",
    url: "http://localhost:3000/problematic-route",
  });

(await mcp_next) -
  devtools_browser_eval({
    action: "console_messages",
    errorsOnly: true,
  });
```

**Workflow 3: Verifying pages after upgrade**

```typescript
// 1. Upgrade Next.js
(await mcp_next) - devtools_upgrade_nextjs_16({ project_path: "." });

// 2. Start dev server (separate terminal)
// $ pnpm dev

// 3. Verify critical pages with browser automation
const criticalPages = [
  "/dashboard/1-2567/teacher-table",
  "/dashboard/1-2567/student-table",
  "/dashboard/1-2567/assign",
];

for (const page of criticalPages) {
  (await mcp_next) -
    devtools_browser_eval({
      action: "navigate",
      url: `http://localhost:3000${page}`,
    });

  const errors =
    (await mcp_next) -
    devtools_browser_eval({
      action: "console_messages",
      errorsOnly: true,
    });

  // Analyze and fix any errors found
}
```

#### 7. Troubleshooting

**MCP endpoint not available:**

```typescript
// Check Next.js version (must be 16+)
// $ pnpm list next

// If version < 16, upgrade first:
(await mcp_next) - devtools_upgrade_nextjs_16({ project_path: "." });

// Verify dev server is running:
// $ pnpm dev

// Check server started successfully (look for /_next/mcp endpoint message)
```

**Server discovery issues:**

```typescript
// Manually specify port if auto-discovery fails
(await mcp_next) -
  devtools_nextjs_runtime({
    action: "list_tools",
    port: "3000", // Explicit port
  });

// Or discover all running servers
(await mcp_next) -
  devtools_nextjs_runtime({
    action: "discover_servers",
    includeUnverified: true,
  });
```

**Browser automation not working:**

```typescript
// Playwright auto-installs, but if issues occur:
// $ pnpm exec playwright install chromium

// Check browser availability:
(await mcp_next) -
  devtools_browser_eval({
    action: "list_tools",
  });
```

#### 8. Best Practices

**DO:**

- ✅ Call `init` at the start of every Next.js session
- ✅ Query `nextjs_docs` before implementing Next.js features
- ✅ Use `nextjs_runtime` to understand current state before changes
- ✅ Use browser automation for page verification (not curl)
- ✅ Leverage automated upgrade tools for major version bumps
- ✅ Check runtime errors proactively, not just when things break

**DON'T:**

- ❌ Skip `init` and rely on cached Next.js knowledge
- ❌ Use deprecated APIs without checking docs first
- ❌ Make changes without querying runtime state
- ❌ Use curl for Next.js page verification (misses client-side errors)
- ❌ Manually upgrade Next.js when automated codemods exist
- ❌ Pass `args: "{}"` as a string to runtime tools

## 4. Execution Checklist

1. Clarify task and acceptance criteria (<= 8 bullets).
2. Build the Evidence Panel via context7/Serena (package versions, APIs, schema).
3. Write a plan (tools, steps, validation) and keep it <= 8 bullets.
4. Implement with Serena-powered edits; keep DB operations idempotent.
5. Validate with unit tests for constraint logic and E2E tests for cross-role flows; run `pnpm` scripts.
6. Provide a runbook (commands, env vars, rollback/testing notes).
7. Call out risks and TODOs, including missing MCP access.

## 4.1. CI-First Development Policy

> **Trust CI, not local validation. Speed over pre-flight checks.**

This project follows a **CI-first development workflow** where all tests, linting, and type-checking are delegated to GitHub Actions CI. Local development prioritizes **speed and iteration** over validation.

### Core Philosophy

**✅ DO:**

- **Trust CI as the quality gatekeeper** - All validation happens in GitHub Actions
- **Commit and push frequently** - Small commits get faster feedback
- **Continue working while CI runs** - Parallel work while awaiting CI results
- **Read CI logs when failures occur** - Understand issues before retrying
- **Use draft PRs for WIP** - CI still runs, but reviewers know it's not ready

**❌ DON'T:**

- **Don't add pre-commit hooks** - Violates CI-first philosophy (slows commits)
- **Don't add pre-push hooks** - Blocks rapid iteration
- **Don't run full test suite locally** - Slow and redundant (trust CI instead)
- **Don't wait for "perfect" commits** - CI will catch issues
- **Don't suggest `npm`/`yarn`** - This project uses PNPM only

### When to Run Tests/Lint Locally

**Optional local validation** is available for specific scenarios:

**✅ USE local validation when:**

- Debugging a failing CI check (reproduce the exact failure)
- Pre-release validation (major version bumps)
- Offline development (no GitHub access)
- Quick sanity check (optional convenience, not required)

**Commands for optional local validation:**

```bash
pnpm test:affected       # Run affected tests (faster than full suite)
pnpm lint:files src/**   # Lint specific files (when debugging CI lint failures)
pnpm typecheck           # Type-check (rare - IDE usually catches these)
pnpm test                # Full test suite (avoid unless necessary - very slow)
pnpm test:e2e            # E2E tests locally (requires local DB setup)
```

**❌ DON'T use local validation for:**

- Normal feature development (trust CI instead)
- Every commit (too slow, defeats CI-first purpose)
- Checking "if it works" (push to CI for validation)
- Pre-commit verification (no hooks by design)

### Agent Implementation Guidance

When implementing features or fixes:

1. **Skip local test runs** - Don't suggest `pnpm test` unless debugging CI failure
2. **Recommend pushing to CI** - Instead of "run tests locally", say "push to GitHub to trigger CI"
3. **Use Context7 + Serena** - Research libraries and analyze code BEFORE implementing
4. **Write quality code first** - Focus on correctness, let CI catch issues
5. **Explain CI process** - When user asks "how to test", explain CI-first workflow

**Example responses:**

```
User: "How do I test this change?"
Agent: "Push your changes to GitHub. CI will automatically run:
        - Lint & Type Check (~5 min)
        - Unit Tests (~8 min)
        - Build (~8 min)
        - E2E Tests (~15 min)

        You'll see results in the PR checks. Continue working on other tasks
        while CI runs in parallel."

User: "Should I run tests before committing?"
Agent: "No need! This project uses CI-first workflow. Commit and push frequently.
        CI will validate everything. If issues arise, CI logs will show exactly
        what to fix."

User: "Tests are failing in CI"
Agent: "Let's check the CI logs. [Analyze failure logs from GitHub Actions]
        The issue is [specific error]. Here's the fix: [implementation].
        Optionally, you can reproduce locally with: pnpm test [specific-test-file]"
```

### CI Workflow Overview

Our CI runs **4 parallel jobs** for fast feedback:

| Job               | Duration  | Caching | Parallelized |
| ----------------- | --------- | ------- | ------------ |
| Lint & Type Check | ~3-5 min  | Yes ✅  | No           |
| Unit Tests        | ~8-10 min | Yes ✅  | Yes (50%)    |
| Build             | ~8-10 min | Yes ✅  | No           |
| E2E Tests         | ~15 min   | Yes ✅  | Yes (4x)     |

**Caching optimizations:**

- PNPM dependencies (setup-node built-in)
- Prisma Client (`.prisma` cache)
- Next.js build (`.next/cache`)
- TypeScript build info (`.tsbuildinfo`)
- Jest cache (`.jest-cache`)

**Result:** ~2-3 minute reduction per job compared to non-cached CI

### Documentation References

- **[CI_FIRST_WORKFLOW.md](docs/CI_FIRST_WORKFLOW.md)** - Complete developer workflow guide
- **[CI_TROUBLESHOOTING.md](docs/CI_TROUBLESHOOTING.md)** - Debugging CI failures
- **[E2E_RELIABILITY_GUIDE.md](docs/E2E_RELIABILITY_GUIDE.md)** - E2E testing patterns

### CI Triggers & Optimizations

**Automatic triggers:**

- ✅ Push to `main` or `develop` branches
- ✅ Pull request creation/updates
- ❌ Skipped for docs-only changes (`**.md`, `docs/**`, `screenshots/**`)

**Manual triggers:**

- E2E tests via GitHub Actions UI (workflow_dispatch)

**Quality gates:**

- Branch protection rules require all CI checks to pass
- Cannot merge failing PRs
- Draft PRs still run CI (for iterative development)

### GitHub Artifacts & Test Results

**CRITICAL: Use GitHub CLI to download E2E test artifacts for debugging CI failures.**

The project includes a PowerShell script for downloading artifacts from GitHub Actions:

```bash
# Download artifacts from latest E2E run
pnpm ci:artifacts

# Download only from failed runs
pnpm ci:artifacts:failed

# Or use the script directly with options
pwsh scripts/download-e2e-artifacts.ps1 -RunId 12345678
pwsh scripts/download-e2e-artifacts.ps1 -Branch develop
```

**Prerequisites:**
- GitHub CLI installed: `winget install --id GitHub.cli`
- Authenticated: `gh auth login`

**What gets downloaded:**
- `test-results-ci/` - All shard artifacts (traces, screenshots, error contexts)
- `merged-results.json` - Combined test results from all shards
- `playwright-report/` - HTML report for visual inspection

**Useful commands after download:**
```bash
# View HTML report in browser
pnpm test:report

# Analyze merged results
code merged-results.json

# View trace file for specific failure
pnpm exec playwright show-trace test-results-ci/*/trace.zip
```

**Script parameters:**
| Parameter | Default | Description |
|-----------|---------|-------------|
| `-Workflow` | "E2E Tests" | Workflow name to download from |
| `-Branch` | "main" | Branch to filter runs |
| `-RunId` | (latest) | Specific workflow run ID |
| `-FailedOnly` | false | Only download from failed runs |

**Artifact types available:**
- `playwright-merged-json` - Combined JSON results
- `playwright-html-report` - Merged HTML report
- `playwright-html-shard-*` - Per-shard HTML reports
- `playwright-json-shard-*` - Per-shard JSON results

### Migration Context

This project **transitioned to CI-first** to improve developer velocity:

- **Before:** Pre-commit hooks ran lint/typecheck/tests → slow `git commit` (10-30s)
- **After:** No hooks, instant commits, CI validates everything
- **Result:** 10x faster local development, same quality guarantees

**Historical notes:**

- Jest setup migration (Issue #9e1459d) - Migrated to TypeScript for proper linting
- Jest stack overflow (Issue #46) - Workaround with `forceExit: true` for Next.js 16 compatibility

---

## 5. Coding Standards

### Core Principles

- Prisma schema is the source of truth; generate types rather than duplicating models.
- Prefer pure functions for constraint checks and use table-driven tests.
- Validate boundaries with Valibot (preferred) or Zod; return actionable errors.
- Make database mutations idempotent and document upsert or retry keys.
- Keep exports (Excel/PDF) deterministic with stable sort order.

### Modernized Codebase Conventions (#codebase)

## Clean Architecture Pattern (ADOPTED)

```
src/features/<domain>/
  ├── domain/           # Business logic, entities, types
  │   ├── entities/     # Domain models
  │   └── types/        # Domain-specific types
  ├── application/      # Use cases, actions
  │   ├── actions/      # Server Actions (Next.js)
  │   └── use-cases/    # Pure business logic
  ├── infrastructure/   # Data access, external services
  │   ├── repositories/ # Prisma queries
  │   └── adapters/     # External API clients
  └── presentation/     # UI components, pages
      ├── components/   # React components
      ├── hooks/        # Custom hooks
      └── stores/       # Zustand stores
```

**Type Safety Standards**

- **NO** `as any` casts without documented TODO and justification
- Use `Omit<T, K>` utility to override field types properly
- Create named type aliases for complex intersections
- Add inline type annotations for callback parameters
- Prefer type inference over explicit typing where clear

**Component Patterns**

- Server Components by default (Next.js App Router)
- Client Components only when needed (`"use client"` directive)
- Separate data fetching (Server Actions) from presentation
- Use `Suspense` boundaries for async operations
- Co-locate component types with components

**State Management**

- Zustand for complex UI state (modals, filters, selections)
- SWR for server data caching and revalidation
- URL state for shareable filters (searchParams)
- Local state (`useState`) for simple ephemeral state

**Error Handling**

- Valibot schemas for input validation
- Return type patterns: `{ success: true, data } | { success: false, error }`
- User-facing errors in Thai language
- Console errors/warnings in English for debugging

**Testing Philosophy**

- Unit test business logic (pure functions, validation)
- E2E test user journeys (happy paths + critical errors)
- Mock external dependencies (Prisma, APIs)
- Seed realistic test data
- Prefer table-driven tests for multiple scenarios

## 6. Next.js 16 Guardrails

- Rename `middleware.ts` to `proxy.ts` and export `proxy`.
- Use async request APIs only (`await cookies()`, `await headers()`, `await draftMode()`).
- Turbopack is default; remove manual `--turbopack` flags.
- Prefer Node runtime for proxies and route handlers.

## 7. Database and Prisma Notes

- Pull env vars via `vercel env pull .env`; ensure `DATABASE_URL` is present.
- Use Prisma MCP for migrations when available; otherwise run `pnpm db:migrate` (dev) or `pnpm db:deploy` (prod) with caution.
- Maintain a Prisma client singleton with `withAccelerate` to avoid HMR churn.

```ts
import { PrismaClient } from "@/prisma/generated/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const globalForPrisma = globalThis as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient().$extends(withAccelerate());

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

## 8. Testing Strategy

### Unit Tests (Jest)

- Located in `__test__/` directory
- Test pure functions, validation logic, repository methods
- Use table-driven tests for business rules
- Mock Prisma client for repository tests
- Run with: `pnpm test` or `pnpm test:watch`

### E2E Tests (Playwright)

- Located in `e2e/` directory
- Test critical user flows across all roles (Admin/Teacher/Student)
- Use seeded test data from `prisma/seed.ts`
- Configure in `playwright.config.ts` and `playwright.vercel.config.ts`
- Run with: `pnpm test:e2e` (local) or `pnpm test:vercel` (production)

### Known Testing Issues

#### Next.js 16 + Jest Stack Overflow (Issue #46)

**Status**: Workaround Applied ✅

Jest tests pass but process doesn't exit cleanly due to Next.js 16.0.1 unhandled rejection handler causing infinite `setImmediate` recursion.

**Workaround**: `forceExit: true` in `jest.config.js` (lines 34-37)

- All 50+ tests passing across 4 test files ✅
- Process exits cleanly with `forceExit` flag ✅
- May hide legitimate async operation leaks ⚠️

**Details**: See `nextjs_16_jest_stack_overflow_issue` memory file or [Issue #46](https://github.com/yukimura-ixa/school-timetable-senior-project/issues/46)

**What NOT to do**:

- ❌ Remove `forceExit` flag (will cause stack overflow)
- ❌ Try to mock Next.js unhandled rejection module (doesn't work)
- ❌ Wrap `setImmediate` (Next.js wraps it after our setup)

**Long-term**: Waiting for Next.js 16.1+ upstream fix

### Test Creation Guidelines

1. **Unit tests first** - Test business logic in isolation
2. **E2E for flows** - Test complete user journeys
3. **Use Serena** - Find existing test patterns with `search_for_pattern`
4. **Seed data** - Reference seeded semesters (1-2567, 2-2567, 1-2568)
5. **Assertions** - Use meaningful error messages in Thai where appropriate

### Common Test Patterns

**Unit Test (Jest)**:

```typescript
describe("validateTimeslotConflict", () => {
  it("should return conflict when timeslots overlap", () => {
    const result = validateTimeslotConflict(slot1, slot2);
    expect(result.hasConflict).toBe(true);
    expect(result.message).toContain("ซ้ำซ้อน");
  });
});
```

**E2E Test (Playwright)**:

```typescript
test("should create new schedule assignment", async ({ page }) => {
  await page.goto("/schedule/1-2567/assign");
  await page.click("text=เพิ่มรายวิชา");
  await page.fill('[name="subjectCode"]', "TH101");
  await page.click('button[type="submit"]');
  await expect(page.locator("text=บันทึกสำเร็จ")).toBeVisible();
});
```

## 9. Response Format (every task)

1. Plan (<= 8 bullets)
2. Evidence Panel (versions/APIs)
3. Code (ready to paste)
4. Tests (unit/E2E when applicable)
5. Runbook (commands/env/migrations)
6. Risks and TODOs

## 9.1 GitHub Issue & PR Policy

**CRITICAL: Always create GitHub issues/PRs for discovered bugs, TODOs, and features that follow dev standards.**

### When to Create Issues

Create a GitHub issue when you discover:

1. **Bugs** - Any defect, error, or unintended behavior
   - Failed tests or test suites
   - Runtime errors or exceptions
   - Type errors or compilation issues
   - Logic errors or incorrect behavior

2. **Technical Debt** - Code quality issues that need improvement
   - `TODO` or `FIXME` comments in code
   - Code smells (duplicate code, complex functions, etc.)
   - Missing type annotations or `any` types
   - Deprecated API usage

3. **Missing Features** - Functionality gaps identified during work
   - Features mentioned in comments but not implemented
   - User-facing improvements
   - Developer experience enhancements

4. **Performance Issues** - Optimization opportunities
   - Slow queries or operations
   - Memory leaks or resource issues
   - Bundle size problems

### Issue Creation Workflow

```typescript
// When discovering issues during work:
1. Document the issue clearly (what, where, why)
2. Assess severity: critical/high/medium/low
3. Determine if it follows dev standards (check AGENTS.md)
4. Create GitHub issue with proper labels
5. Add to current TODO list if related to active work
6. Continue with original task unless critical
```

### Issue Template

Use this structure when creating issues:

```markdown
## Description

[Clear description of the bug/feature/debt]

## Location

- File(s): [path/to/file.ts]
- Line(s): [specific lines if applicable]

## Current Behavior

[What currently happens]

## Expected Behavior

[What should happen]

## Reproduction Steps (for bugs)

1. [Step 1]
2. [Step 2]
   ...

## Proposed Solution

[Suggested approach or fix]

## Technical Context

- Related files: [list]
- Dependencies: [list]
- Estimated effort: [S/M/L/XL]

## Related Issues/PRs

- Relates to #[issue number]
- Blocked by #[issue number]
```

### PR Creation Workflow

Create a PR when:

- Fixing issues discovered during work
- Implementing features that span multiple commits
- Making significant refactoring changes

**PR Template:**

```markdown
## Changes

[Summary of what changed]

## Related Issues

Closes #[issue number]

## Testing

- [ ] Unit tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed

## Checklist

- [ ] Follows AGENTS.md guidelines
- [ ] Context7 consulted for all library usage
- [ ] Type safety maintained (no new `any`)
- [ ] Tests passing (pnpm test)
- [ ] Linting passing (pnpm lint)
```

### Labels to Use

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `technical-debt` - Code quality improvements
- `performance` - Performance optimization
- `testing` - Test-related issues
- `documentation` - Documentation improvements
- `priority: high` - Needs immediate attention
- `priority: medium` - Should be addressed soon
- `priority: low` - Nice to have
- `good first issue` - Good for newcomers

### When NOT to Create Issues

- One-line fixes that can be done immediately
- Typos in comments or documentation
- Personal preferences without technical merit
- Issues already tracked (check existing issues first)

### Example: Issue Creation During Bug Fix

```typescript
// Scenario: While fixing store type mismatch, discovered multiple similar issues

// 1. Fix immediate issue (store type mismatch)
// 2. Create issue for related problems found:

GitHub Issue #32: "Fix store type mismatch in arrangement-ui"
- Description: Store expects SubjectData[] but receives ClassScheduleWithRelations[]
- Solution: Create mapper functions
- Status: In Progress

GitHub Issue #33: "Fix 7 failing Jest test suites"
- Description: Mock setup conflicts and data fixture issues
- Root cause: Duplicate jest.mock() declarations
- Status: In Progress (5/7 fixed)

// 3. Continue with original task
```

### Automation Tips

When creating issues via MCP GitHub tools:

```typescript
// Use structured approach
await mcp_github_issue_write({
  method: "create",
  owner: "yukimura-ixa",
  repo: "school-timetable-senior-project",
  title: "[Bug] Clear, concise title",
  body: "## Description\n...\n## Location\n...",
  labels: ["bug", "priority: high"],
});
```

**Remember:** Quality over quantity. Create meaningful issues that help the team, not noise.

---

## 10. Security Best Practices

### Authentication & Authorization

**Session Management:**

- Use Auth.js (NextAuth) v5 for all authentication
- Never expose sensitive user data (email, tokens) to client
- Extract only necessary fields: `{ name, role }` for client serialization
- Keep session checks server-side in Server Actions and API routes

**Access Control:**

```typescript
// ✅ GOOD: Server-side auth check
export async function deleteSchedule(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return { success: false, error: 'Unauthorized' };
  }
  // ... perform action
}

// ❌ BAD: Client-side only check (easily bypassed)
'use client';
export function DeleteButton() {
  const { data: session } = useSession();
  if (session?.user.role !== 'admin') return null;
  return <button onClick={deleteAction}>Delete</button>; // Action not protected!
}
```

**Component Protection:**

```typescript
// Protect semester selector from public access
{session.status === "authenticated" && <SemesterSelector />}

// Read-only displays for public pages
export function CurrentSemesterBadge() {
  const { semester } = useSemesterStore();
  // ✅ No setSemester - read-only
  return <div>ภาคเรียน {semester}</div>;
}

// Role-based UI restrictions (implemented in student-table)
function StudentTablePage() {
  const { data: session } = useSession();
  const isStudent = session?.user?.role === "student";

  return (
    <>
      {/* Bulk export hidden for students */}
      {!isStudent && <BulkExportSection />}

      {/* Individual export hidden for students */}
      {!isStudent && (
        <Stack direction="row" spacing={1}>
          <Button onClick={handleExport}>Export Excel</Button>
          <Button onClick={handlePDF}>Export PDF</Button>
        </Stack>
      )}

      {/* Students see read-only timetable only */}
      <TimetableDisplay />
    </>
  );
}
```

### Data Validation

**Input Sanitization:**

```typescript
// Use Valibot for all user inputs
import * as v from "valibot";

const CreateSubjectSchema = v.object({
  code: v.pipe(
    v.string(),
    v.minLength(5),
    v.maxLength(10),
    v.regex(/^[A-Z]{2}\d{3}$/),
  ),
  name: v.pipe(v.string(), v.minLength(1), v.maxLength(200)),
  credits: v.pipe(v.number(), v.minValue(0.5), v.maxValue(5)),
});

export async function createSubject(input: unknown) {
  // ✅ Always validate before database operations
  const result = v.safeParse(CreateSubjectSchema, input);
  if (!result.success) {
    return { success: false, error: "Invalid input" };
  }
  // ... use result.output (typed and validated)
}
```

**SQL Injection Prevention:**

- ✅ Always use Prisma query builder (parameterized queries)
- ❌ Never use raw SQL with string concatenation
- ❌ Never use `prisma.$executeRawUnsafe()` with user input

```typescript
// ✅ SAFE: Prisma query builder
await prisma.teacher.findMany({
  where: { name: { contains: userInput } },
});

// ❌ UNSAFE: Raw SQL with user input
await prisma.$executeRawUnsafe(
  `SELECT * FROM Teacher WHERE name LIKE '%${userInput}%'`,
);
```

### Environment Variables

**Secret Management:**

```bash
# .env (NEVER commit)
DATABASE_URL="postgresql://..."
AUTH_SECRET="..."  # Generate with: openssl rand -base64 32
AUTH_GOOGLE_ID="..."
AUTH_GOOGLE_SECRET="..."

# Pull from Vercel for production values
vercel env pull .env
```

**Code Usage:**

```typescript
// ✅ Access via process.env (Next.js auto-validates)
const dbUrl = process.env.DATABASE_URL;

// ✅ Client-side public vars (prefix with NEXT_PUBLIC_)
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// ❌ Never expose secrets to client
// This will NOT work (and shouldn't!)
const secret = process.env.AUTH_SECRET; // undefined in browser
```

### XSS Prevention

**React Auto-Escaping:**

```typescript
// ✅ React auto-escapes by default
<div>{userInput}</div>  // Safe

// ⚠️ Dangerous - only use with sanitized content
<div dangerouslySetInnerHTML={{ __html: trustedHtml }} />
```

**URL Handling:**

```typescript
// ✅ Use Next.js Link for internal navigation
<Link href="/schedule/1-2567">Go to schedule</Link>

// ✅ Validate external URLs
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}
```

### Rate Limiting

**API Protection:**

```typescript
// Implement rate limiting for public endpoints
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"), // 10 requests per 10 seconds
});

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return new Response("Rate limit exceeded", { status: 429 });
  }
  // ... handle request
}
```

### CORS & Headers

**Security Headers (next.config.mjs):**

```javascript
const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

export default {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};
```

---

## 11. Performance Best Practices

### Database Optimization

**Query Efficiency:**

```typescript
// ✅ Include necessary relations only
const schedules = await prisma.classSchedule.findMany({
  where: { configId: "1-2567" },
  include: {
    subject: true,
    room: true,
    // Don't include unless needed
  },
});

// ✅ Use select for large datasets
const teachers = await prisma.teacher.findMany({
  select: {
    id: true,
    name: true,
    // Skip unused fields
  },
});

// ✅ Batch queries instead of loops
const teacherIds = [1, 2, 3];
const teachers = await prisma.teacher.findMany({
  where: { id: { in: teacherIds } },
});
// ❌ for (const id of teacherIds) { await prisma.teacher.findUnique({ where: { id } }) }
```

**Caching with SWR:**

```typescript
"use client";
import useSWR from "swr";

export function TeacherList() {
  const { data, error, isLoading } = useSWR(
    "teachers-list",
    async () => {
      const result = await getTeachersAction();
      return result.success ? result.data : [];
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    },
  );
  // ...
}
```

### React Performance

**Memoization:**

```typescript
import { memo, useMemo, useCallback } from 'react';

// ✅ Memo expensive components
export const TeacherCard = memo(function TeacherCard({ teacher }: Props) {
  return <div>{teacher.name}</div>;
});

// ✅ Memo expensive calculations
const sortedTeachers = useMemo(() => {
  return teachers.sort((a, b) => a.name.localeCompare(b.name));
}, [teachers]);

// ✅ Memo callbacks passed to children
const handleClick = useCallback((id: string) => {
  console.log('Clicked:', id);
}, []);
```

**Code Splitting:**

```typescript
// ✅ Dynamic imports for large components
import dynamic from 'next/dynamic';

const PDFExportDialog = dynamic(
  () => import('@/components/PDFExportDialog'),
  { loading: () => <Skeleton /> }
);

// ✅ Route-based code splitting (automatic with App Router)
// Each page in app/ directory is automatically code-split
```

### Image Optimization

```typescript
import Image from 'next/image';

// ✅ Use Next.js Image component
<Image
  src="/teachers/avatar.jpg"
  alt="Teacher avatar"
  width={100}
  height={100}
  priority={false} // Only true for above-the-fold images
/>

// ✅ Configure domains for external images (next.config.mjs)
images: {
  domains: ['cdn.example.com'],
  formats: ['image/avif', 'image/webp'],
}
```

### Bundle Size

**Monitor and Optimize:**

```bash
# Analyze bundle
pnpm build
pnpm analyze  # If configured

# Check for large dependencies
npx webpack-bundle-analyzer .next/server/app/**/*.js
```

**Tree-shaking:**

```typescript
// ✅ Import specific functions
import { format } from "date-fns";

// ❌ Imports entire library
import * as dateFns from "date-fns";

// ✅ Use dynamic imports for heavy libraries
const { default: jsPDF } = await import("jspdf");
```

---

## 12. Testing Best Practices

### 12.0 Rules of Engagement (agents)

1. Choose the lowest test level that proves the behavior:
   - Unit for pure logic, schemas, selectors.
   - Integration for UI ↔ data boundaries (React component + server action, repo + DB).
   - E2E only for critical journeys (auth, timetable CRUD, conflict resolution, export).
     Rationale: test pyramid/trophy = lots of unit/integration, few E2E. (Higher layers are slower and flakier.)
2. No `waitForTimeout()` in E2E except in `visual-inspection.spec.ts`.
3. Before adding a new E2E spec, ask: can a contract test (Pact) or an integration test prove this?
4. Every E2E action must use locator assertions (`expect(...).toBeVisible()/toBeEnabled()`) before click/press.
5. Keep E2E specs short, outcome-based, and tagged in the title: `[journey]`, `[smoke]`, `[a11y]`, `[visual]`, `[contract]`.
6. CI quality gates: E2E wall time ≤ 15 min, flake rate < 2%. If exceeded, downshift tests or fix root causes.
7. Prefer realistic DB in tests using Testcontainers (integration) over adding more E2E permutations.

### Unit Testing Strategy

**Test Structure (AAA Pattern):**

```typescript
describe("validateTimeslotConflict", () => {
  it("should return conflict when timeslots overlap", () => {
    // Arrange
    const slot1 = { day: 1, period: 1, roomId: 1 };
    const slot2 = { day: 1, period: 1, roomId: 1 };

    // Act
    const result = validateTimeslotConflict(slot1, slot2);

    // Assert
    expect(result.hasConflict).toBe(true);
    expect(result.message).toContain("ซ้ำซ้อน");
  });
});
```

**Table-Driven Tests:**

```typescript
describe("credit validation", () => {
  const testCases = [
    { input: 0.5, expected: true, desc: "minimum valid credit" },
    { input: 2.0, expected: true, desc: "maximum valid credit" },
    { input: 0.0, expected: false, desc: "zero credits" },
    { input: 5.5, expected: false, desc: "exceeds maximum" },
  ];

  testCases.forEach(({ input, expected, desc }) => {
    it(`should return ${expected} for ${desc}`, () => {
      expect(isValidCredit(input)).toBe(expected);
    });
  });
});
```

**Mocking Best Practices:**

```typescript
// ✅ Mock at module level
jest.mock("@/lib/prisma", () => ({
  prisma: {
    teacher: {
      findMany: jest.fn(),
    },
  },
}));

// ✅ Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});

// ✅ Type-safe mocks
import { prisma } from "@/lib/prisma";
const mockFindMany = prisma.teacher.findMany as jest.MockedFunction<
  typeof prisma.teacher.findMany
>;

mockFindMany.mockResolvedValue([{ id: 1, name: "John" }]);
```

### E2E Testing Strategy

**Page Object Model:**

```typescript
// e2e/page-objects/TeacherTablePO.ts
export class TeacherTablePO extends BasePage {
  readonly exportButton: Locator;
  readonly teacherCheckboxes: Locator;

  constructor(page: Page) {
    super(page);
    this.exportButton = page.getByRole("button", { name: "ส่งออก PDF" });
    this.teacherCheckboxes = page.locator(
      'input[type="checkbox"][name^="teacher-"]',
    );
  }

  async goto(semesterAndYear: string) {
    await super.goto(`/dashboard/${semesterAndYear}/teacher-table`);
    await this.waitForPageLoad();
    await this.waitForSemesterSync(semesterAndYear);
  }

  async selectTeachers(count: number) {
    for (let i = 0; i < count; i++) {
      await this.teacherCheckboxes.nth(i).check();
    }
  }
}
```

**Test Data Management:**

```typescript
// Use seeded data consistently
test("TC-001: Export teacher PDFs", async ({ page }) => {
  const teacherTablePO = new TeacherTablePO(page);

  // Use known seeded data (1-2567 always has 56 teachers)
  await teacherTablePO.goto("1-2567");
  await teacherTablePO.selectTeachers(5);
  await teacherTablePO.exportButton.click();

  // Verify using data-testid
  await expect(page.locator('[data-testid="pdf-dialog"]')).toBeVisible();
});
```

**Flaky Test Prevention:**

```typescript
// ✅ Wait for specific conditions
await page.waitForSelector('[data-loaded="true"]');
await page.waitForLoadState('networkidle');

// ✅ Use built-in retry logic
await expect(page.locator('text=Success')).toBeVisible({ timeout: 10000 });

// ❌ Avoid arbitrary timeouts
await page.waitForTimeout(3000); // Brittle!

// ✅ Use testId for stability
<button data-testid="submit-button">Submit</button>
await page.locator('[data-testid="submit-button"]').click();
```

### E2E Reliability Patterns (November 2025)

Use these standardized patterns to reduce flakiness. Prefer them over time-based waits or broad `networkidle` waits.

- Safe interaction: assert visibility/enabled before click

  ```ts
  const submit = page.getByRole("button", { name: /บันทึก|save/i });
  await expect(submit).toBeVisible({ timeout: 5000 });
  await expect(submit).toBeEnabled();
  await submit.click();
  ```

- Navigation readiness: target key selectors instead of `networkidle`

  ```ts
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForSelector('table, main, [role="main"]', { timeout: 10000 });
  ```

- Debounced search/filter: rely on retries with `expect().toPass()`

  ```ts
  await page.fill('input[placeholder*="ค้นหา"]', "นาย");
  await expect(async () => {
    expect(page.url()).toContain("search=นาย");
  }).toPass({ timeout: 3000 });
  ```

- Table/data update: wait for meaningful DOM change

  ```ts
  const initial = await page.locator("table tbody tr").count();
  await page
    .waitForFunction(
      (prev) => {
        const rows = document.querySelectorAll("table tbody tr").length;
        return rows !== prev || rows === 0;
      },
      initial,
      { timeout: 3000 },
    )
    .catch(() => {});
  ```

- Modal flow: assert dialog appears and closes deterministically

  ```ts
  await openButton.click();
  const modal = page.locator('[role="dialog"], .modal');
  await expect(modal).toBeVisible({ timeout: 5000 });
  await cancelButton.click();
  await page
    .waitForFunction(
      () => document.querySelectorAll('[role="dialog"]').length === 0,
      { timeout: 2000 },
    )
    .catch(() => {});
  await expect(modal).not.toBeVisible();
  ```

- MUI selects: wait for enabled state before opening

  ```ts
  await page.waitForSelector("#grade-select:not(.Mui-disabled)", {
    timeout: 10000,
  });
  await page.locator("#grade-select").click();
  await page.waitForSelector('[role="listbox"]', { timeout: 5000 });
  ```

- DnD stability (@dnd-kit): verify drag/finish state, not time
  ```ts
  await expect(source).toBeVisible();
  await expect(target).toBeVisible();
  await page.mouse.down();
  await page
    .waitForFunction(
      () =>
        document.body.style.cursor === "grabbing" ||
        document.querySelector("[data-dragging]"),
      { timeout: 1000 },
    )
    .catch(() => {});
  await page.mouse.up();
  await page
    .waitForFunction(
      () =>
        document.body.style.cursor !== "grabbing" &&
        !document.body.classList.contains("dragging"),
      { timeout: 1000 },
    )
    .catch(() => {});
  ```

Anti-patterns to avoid:

- `waitForTimeout()` (except manual `visual-inspection.spec.ts`)
- Blind `page.click()` without visibility/enabled checks
- Blanket `waitForLoadState('networkidle')` for UI readiness
- Assertions that assume immediate DOM updates after actions

E2E Reliability Metrics (Nov 2025):

- Phase A: 210/210 functional `waitForTimeout` calls removed (100%)
- Phase B Session 1: Public + Arrange flows stabilized; DnD `networkidle` reduced
- Phase B Session 2: Management CRUD replacing 12+ `networkidle` calls
  - Estimated reliability improvement: +40–50% pass rate
  - Expected runtime reduction: 30–40%

### Test Coverage Goals

**Target Coverage:**

- Unit tests: 80%+ for business logic
- E2E tests: 100% critical user paths
- Integration tests: All API endpoints

**Priority:**

1. Critical business rules (conflict detection, validation)
2. Data mutations (create, update, delete)
3. Authentication and authorization
4. Happy paths for each user role
5. Error handling and edge cases

### 12.1 Playwright “paved road” config (drop-in)

```
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './e2e',
  reporter: [['html'], ['list']],
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  fullyParallel: true,
  workers: process.env.CI ? undefined : '50%',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',        // capture traces only when needed
    video: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'pnpm run start',      // or 'next start'
    url: 'http://localhost:3000',
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
// Why: official guidance recommends retries  trace on first retry; webServer  reuseExistingServer stabilizes runs locally and in CI.
```

### 12.2 Test taxonomy & naming

Place files under:

```
e2e/
  01-auth/…               // [journey] login/logout/password reset
  02-setup/…              // [journey] year/term, import teachers/rooms/subjects
  03-timetable-core/…     // [journey] create class, DnD place block, resolve conflict
  04-bulk-ops/…           // [journey] copy week, auto-generate → tweak
  05-permissions/…        // [journey] role boundaries
  06-export/…             // [journey] PDF/Excel
  a11y/…                  // [a11y] axe scans (smoke-level)
  visual/…                // [visual] targeted screenshots for critical pages
```

Add tags in test titles, e.g. `test('[journey] create class and save', …)` so agents can run subsets via `--grep`.

### 12.3 a11y smoke with axe

```
// e2e/a11y/dashboard-a11y.spec.ts
import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';
test('[a11y] dashboard has no critical violations', async ({ page }) => {
  await page.goto('/dashboard/1-2567/teacher-table');
  const results = await new AxeBuilder({ page }).analyze();
  const critical = results.violations.filter(v => v.impact === 'critical');
  expect.soft(critical, JSON.stringify(critical, null, 2)).toHaveLength(0);
});
// Why: official Playwright  axe-core flow for automatically detectable issues.
```

### 12.4 Visual checks for critical chrome

```
// e.g., header, timetable grid, export dialog
import { test, expect } from '@playwright/test';
test('[visual] timetable grid renders baseline', async ({ page }) => {
  await page.goto('/dashboard/1-2567/assign');
  await expect(page).toHaveScreenshot(); // baseline once, review diffs in PRs
});
// Optional: use Percy when baselines need to live in the cloud at scale.
```

### 12.5 Contract tests instead of brittle E2E

```
// pact tests live in __contracts__/ and run in CI before E2E
// Replace matrixed “client↔API” E2E with Pact contracts for stable boundaries.
// Agents: write Pact tests when adding/changing API endpoints; keep 1 happy-path E2E per endpoint.
```

### 12.6 DB integration via Testcontainers (Node)

```
// For repository/service tests, spin up Postgres with Testcontainers.
// Agents: prefer this to mocking Prisma for behavior that depends on SQL semantics or constraints.
// See runbook: `pnpm test:integration` starts containers locally and in CI (GitHub Actions supports Docker).
```

### 12.7 Agent checklists (per PR)

**Plan**

- Which level(s)? Why the lowest possible?
- Data: seeded IDs or containerized DB?
- For E2E: which `[journey]` is covered and why only 1–2 permutations?
  **Implementation**
- Locator-based waits only; no `waitForTimeout`.
- Traces/videos/screenshots only on failure.
- a11y smoke added for new pages; visual baselines for critical chrome.
  **Validation**
- CI green under 15 min E2E wall time; re-run flaky spec locally with `--debug` and trace viewer.
- If flake recurs, file an issue and downshift the test.

---

## 13. CI/CD Best Practices

### GitHub Actions Workflow

**Build and Test Pipeline:**

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run linter
        run: pnpm lint

      - name: Run type check
        run: pnpm typecheck

      - name: Run unit tests
        run: pnpm test --coverage

      - name: Run E2E tests
        run: pnpm test:e2e
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}

      - name: Build
        run: pnpm build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          AUTH_SECRET: ${{ secrets.AUTH_SECRET }}
```

### Vercel Deployment

**Preview Deployments:**

- Every PR gets automatic preview deployment
- Test features in production-like environment
- Share preview URLs with team/stakeholders

**Production Deployment:**

```bash
# Deploy from CLI
vercel --prod

# Or use Vercel GitHub integration (recommended)
# Automatically deploys main branch to production
```

**Environment Variables:**

```bash
# Set via Vercel dashboard or CLI
vercel env add DATABASE_URL
vercel env add AUTH_SECRET
vercel env add AUTH_GOOGLE_ID
vercel env add AUTH_GOOGLE_SECRET

# Pull to local
vercel env pull .env
```

### Database Migrations

**Development:**

```bash
# Create migration
pnpm db:migrate --name add_teacher_department

# Apply migrations
pnpm db:deploy
```

**Production (via CI/CD):**

```yaml
- name: Run migrations
  run: pnpm db:deploy
  env:
    DATABASE_URL: ${{ secrets.PROD_DATABASE_URL }}
```

**Migration Safety:**

- ✅ Test migrations on staging first
- ✅ Backup production DB before migrations
- ✅ Use reversible migrations when possible
- ❌ Never delete columns without deprecation period
- ❌ Never change column types without data migration

### Monitoring and Alerting

**Sentry Integration:**

```typescript
// sentry.server.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.VERCEL_ENV || "development",
  tracesSampleRate: 0.1,

  beforeSend(event, hint) {
    // Filter out noise
    if (event.exception?.values?.[0]?.value?.includes("ResizeObserver")) {
      return null;
    }
    return event;
  },
});
```

**Performance Monitoring:**

```typescript
import * as Sentry from "@sentry/nextjs";

export async function fetchTeachers() {
  return Sentry.startSpan(
    {
      op: "http.client",
      name: "GET /api/teachers",
    },
    async (span) => {
      const result = await fetch("/api/teachers");
      span.setAttribute("teacher_count", result.length);
      return result;
    },
  );
}
```

---

## 14. Runbook Commands

```bash
# Environment setup
vercel env pull .env

# Install dependencies (PNPM only!)
pnpm install

# Database operations
pnpm db:deploy              # Apply migrations (prod/CI)
pnpm db:migrate             # Create migration (dev only)
pnpm db:studio              # Open Prisma Studio GUI
pnpm db:seed                # Seed development data
pnpm db:seed:clean          # Clean seed (deletes all data!)

# Development
pnpm dev                    # Start dev server
pnpm build                  # Production build
pnpm typecheck              # Run TypeScript type check

# Testing
pnpm test                   # Unit tests (Jest)
pnpm test:watch             # Unit tests in watch mode
pnpm test:e2e               # E2E tests local (Playwright)
pnpm test:e2e:ui            # E2E tests with UI mode
pnpm test:vercel            # E2E tests against production

# Code quality
pnpm lint                   # Run ESLint
pnpm lint:fix               # Fix auto-fixable issues
pnpm format                 # Format with Prettier

# Admin management
pnpm admin:create           # Create admin user
pnpm admin:verify           # Verify admin exists
```

Required env vars: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `NEXT_TELEMETRY_DISABLED=1`, `SEED_SECRET`.

---

## 15. Observability & Monitoring

### Structured Logging

**Sentry Logger:**

```typescript
import * as Sentry from "@sentry/nextjs";
const { logger } = Sentry;

// Use appropriate log levels
logger.trace("Starting database connection", { database: "users" });
logger.debug(logger.fmt`Cache miss for user: ${userId}`);
logger.info("Updated profile", { profileId: 345 });
logger.warn("Rate limit reached", { endpoint: "/api/results/" });
logger.error("Failed to process payment", { orderId: "order_123" });
logger.fatal("Database connection pool exhausted");
```

**Correlation IDs:**

```typescript
import { headers } from "next/headers";
import { v4 as uuidv4 } from "uuid";

export async function GET(request: Request) {
  const requestId = (await headers()).get("x-request-id") || uuidv4();

  logger.info("Processing request", { requestId, path: request.url });

  try {
    // ... handle request
    logger.info("Request completed", { requestId, duration: 123 });
  } catch (error) {
    logger.error("Request failed", { requestId, error });
    throw error;
  }
}
```

### Performance Tracing

**Span Instrumentation:**

```typescript
// UI interactions
function TestComponent() {
  const handleButtonClick = () => {
    Sentry.startSpan(
      {
        op: "ui.click",
        name: "Export PDF Button Click",
      },
      (span) => {
        span.setAttribute("teacher_count", selectedTeachers.length);
        span.setAttribute("page_size", pageSize);
        exportPDF();
      },
    );
  };

  return <button onClick={handleButtonClick}>Export PDF</button>;
}

// API calls
async function fetchTeacherData(teacherId: string) {
  return Sentry.startSpan(
    {
      op: "http.client",
      name: `GET /api/teachers/${teacherId}`,
    },
    async (span) => {
      const response = await fetch(`/api/teachers/${teacherId}`);
      span.setAttribute("status_code", response.status);
      const data = await response.json();
      return data;
    },
  );
}
```

### Error Tracking

**Exception Capture:**

```typescript
try {
  await createSchedule(data);
} catch (error) {
  // Capture with context
  Sentry.captureException(error, {
    tags: {
      feature: "schedule-creation",
      semester: "1-2567",
    },
    extra: {
      scheduleData: data,
      userId: session.user.id,
    },
  });
  throw error;
}
```

**Custom Error Boundaries:**

```typescript
'use client';
import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export function ErrorBoundary({ error }: { error: Error }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div>
      <h2>เกิดข้อผิดพลาด</h2>
      <p>กรุณาลองใหม่อีกครั้ง หรือติดต่อผู้ดูแลระบบ</p>
    </div>
  );
}
```

### Metrics and Dashboards

**Vercel Analytics:**

```typescript
// Automatically tracks Web Vitals
// View in Vercel Dashboard > Analytics

// Custom events
import { track } from "@vercel/analytics";

track("schedule_created", {
  semester: "1-2567",
  teacher_count: 56,
});
```

**Custom Metrics:**

```typescript
// Track business metrics
export async function trackScheduleMetrics(configId: string) {
  const metrics = await prisma.classSchedule.groupBy({
    by: ["configId"],
    where: { configId },
    _count: { id: true },
    _sum: { conflictCount: true },
  });

  logger.info("Schedule metrics", {
    configId,
    total_schedules: metrics._count.id,
    total_conflicts: metrics._sum.conflictCount,
  });
}
```

---

## 16. Governance and Precedence

- Official docs (context7 or vendor) outrank local heuristics if guidance conflicts.
- Serena edits outrank manual refactors when available.
- Highlight outstanding MCP outages or missing data in final responses.
- AGENTS.md is the default instruction for all coding agents - always refer back here for guidance.

---

## 17. Glossary

- **Idempotent** - safe to re-run without new side effects.
- **Baseline migration** - accept the current DB schema as the starting point after a provider change.
- **Symbol-aware** - understands code structure (types/functions) rather than plain text.
- **Clean Architecture** - layered design isolating business logic from infrastructure.
- **Server Actions** - Next.js async functions executed on server, callable from client.
- **MCP** - Model Context Protocol; integration protocol for AI tools and external services.
- **Context7** - MCP server providing up-to-date library documentation.
- **Serena** - MCP server for symbol-aware code analysis and editing.

---

## 18. Future Implementation Ideas

### Architecture Improvements

- [ ] **Repository Pattern Completion** - Migrate remaining raw Prisma queries to repository layer
- [ ] **Domain Event System** - Add event bus for cross-feature communication (e.g., schedule changes trigger notifications)
- [ ] **CQRS Pattern** - Separate read models from write models for complex queries LOW PRIORITY
- [ ] **API Layer** - Add REST/GraphQL API for external integrations
- [ ] **Background Jobs** - Implement job queue (BullMQ) for async operations (exports, notifications) LOW PRIORITY

### Feature Enhancements

- [ ] **Real-time Collaboration** - WebSocket support for multi-user schedule editing LOW PRIORITY
- [ ] **Conflict Resolution UI** - Visual diff viewer for schedule conflicts
- [ ] **AI Schedule Optimization** - ML-powered room/timeslot allocation LOW PRIORITY
- [ ] **Mobile App** - React Native app using shared validation/types LOW PRIORITY
- [ ] **Export Templates** - Customizable PDF/Excel templates with branding
- [ ] **Audit Log** - Track all schedule changes with rollback capability
- [ ] **Notification System** - Email/SMS alerts for schedule changes LOW PRIORITY

### Developer Experience

- [ ] **Storybook Integration** - Component library documentation LOW PRIORITY
- [ ] **API Documentation** - OpenAPI/Swagger for external endpoints LOW PRIORITY
- [ ] **Performance Monitoring** - Sentry + Vercel Analytics integration
- [ ] **Feature Flags** - LaunchDarkly/Vercel Edge Config for gradual rollouts LOW PRIORITY
- [ ] **E2E Test Coverage** - Expand to 80%+ critical path coverage
- [ ] **Visual Regression Testing** - Percy/Chromatic for UI snapshots

### Infrastructure

- [ ] **Multi-tenancy** - Support multiple schools in single deployment
- [ ] **Backup Strategy** - Automated daily DB backups with point-in-time recovery
- [ ] **CDN Optimization** - Cloudflare/Vercel Edge for static assets
- [ ] **Search Engine** - Typesense/Algolia for fast subject/teacher lookup
- [ ] **Caching Layer** - Redis for frequently accessed data (timeslots, rooms)

### Security & Compliance

- [ ] **Role-based Access Control** - Granular permissions (view/edit/delete)
- [ ] **Data Encryption** - Encrypt sensitive PII at rest
- [ ] **Compliance Logging** - PDPA compliance audit trail
- [ ] **Rate Limiting** - Protect API endpoints from abuse
- [ ] **Security Scanning** - Automated SAST/DAST in CI/CD

### Observability

- [ ] **Structured Logging** - Pino/Winston with correlation IDs
- [ ] **Distributed Tracing** - OpenTelemetry for request tracing
- [ ] **Custom Dashboards** - Grafana for business metrics
- [ ] **Alerting** - PagerDuty integration for critical errors
- [ ] **Cost Monitoring** - Track Vercel/DB spend with budget alerts

### Technical Debt Tracking

- [ ] **Store Type Refactoring** - Update Zustand stores to use Prisma types directly
- [ ] **Legacy Component Migration** - Finish migrating old class components
- [ ] **SWR Type Annotations** - Remove all `useSWR<any>` in favor of proper types
- [ ] **Callback Signature Consistency** - Standardize TimeSlot component callbacks
- [ ] **Test Flakiness** - Fix remaining 7 unstable Jest test suites

**Note:** Prioritize based on user feedback and business impact. Always consult context7 for implementation patterns before starting any feature.

# Internal Analysis of School Timetable Management System

This document consolidates internal analysis of the `school-timetable-senior-project` repository. It evaluates how well the current implementation aligns with the original concept document and educational regulations for Thai secondary schools. This is not a public overview but an internal assessment intended to guide future development.

## High-Level Overview

The project is a full-stack web application built with Next.js and TypeScript, backed by a PostgreSQL database via Prisma. It provides administrative tools for managing school timetables, teacher assignments, and curriculum compliance. The architecture follows a feature-first organization: each domain (semester, timeslot, assign, config) contains application actions, domain services and infrastructure repositories.

## Comparison with the Original Concept

### Completed Features

- **Master data management**: CRUD interfaces for teachers, grade levels, subjects and rooms allow administrators to manage core data.
- **Timetable configuration**: Administrators configure days of the week, number and length of periods, break times and starting times.
- **Data carry over**: The system supports copying configurations and timeslots from a previous semester.
- **Locked timeslots**: Common periods (e.g. assemblies, scout meetings) can be locked across all classes and teachers.
- **Manual arrangement**: An interactive interface allows dragging classes into a teacher’s timetable with real-time conflict checks.
- **Conflict detection**: The conflict detector ensures no teacher, room or class is double-booked.
- **Curriculum compliance**: A program management module validates that each grade’s subjects and credits satisfy Ministry of Education rules.
- **Role-based timetable views**: Admins, teachers and students can view appropriate schedules via the web app.

### Partially Implemented or In Progress

- **Teacher–subject assignment workflow**: The underlying model exists, but a refined UI for assigning teachers per grade is still under development.
- **Teaching statistics and reports**: Some totals (teacher load, credit summaries) are displayed, but comprehensive statistical dashboards are limited.
- **Export/print**: Curriculum exports to Excel exist. PDF exports of timetables are being built; a configurable PDF generator and customization dialog exist but are not fully integrated.
- **Automated scheduling** (Optional): The original concept assumed manual arrangement; an automatic scheduler would be a value-added feature.

## Compliance with Thai Secondary School Standards

The application encodes many requirements of the Thai secondary curriculum. Administrators can only schedule classes within defined days and periods. Teacher assignment warnings discourage overloading teachers beyond 16–18 periods per week. Program validation enforces that each grade’s subject list and credit totals meet national curriculum standards. Locked timeslots and room conflict checks ensure institutional activities and limited resources are respected. The system therefore aligns strongly with Thai regulations.

## Recommendations

1. **Finish teacher assignment UI**: Deliver the planned assignment management page to simplify linking teachers to classes and maintain load and qualification warnings.
2. **Add a final validation report**: Provide a completeness check before publishing a timetable to ensure all required subjects are scheduled the correct number of times and highlight any unassigned lessons.
3. **Implement automatic scheduling**: Introduce an optional algorithm to generate initial timetables that satisfy all constraints, then allow manual adjustments.
4. **Enhance statistics**: Build dashboards summarizing teacher loads, free periods and subject distribution to aid planning and highlight compliance issues.
5. **Maintain standards updates**: Externalize Ministry of Education rules so they can be updated without code changes, ensuring ongoing compliance.

## Conclusion

Overall, the current implementation largely fulfills the original plan and offers a modern, compliant timetable management system. Remaining gaps mainly concern UI polish, reporting and automation. Addressing these will make the system more user-friendly and fully aligned with Thai secondary school standards.
