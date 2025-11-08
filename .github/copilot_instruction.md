# GitHub Copilot Instructions (Next.js 16 + Vercel Postgres + MCP)

> This file configures how Copilot (Agent Mode) should work in this repo.  
> **Always follow `AGENTS.md` for full context.** PNPM‑only.

---

## 0) MCP Priority & Routing

**CRITICAL: ALWAYS consult context7 BEFORE fixing bugs or implementing features! AND ALWAYS call the `init` tool from the next-devtools-mcp server FIRST BEFORE starting `pnpm dev` to inspect problems**

Use MCP servers in this strict priority order:

1. **context7** (`@upstash/context7-mcp`) — **MANDATORY FIRST STEP** for all bug fixes and features. Fetch version-specific docs for Next.js, React, Prisma, MUI, Tailwind, Auth.js, Valibot, Zustand, SWR, Recharts before writing code. Use `resolve-library-id` then `get-library-docs`.

2. **Serena** (`serena`) — symbol‑aware edits & code navigation. Use for codebase understanding and precise refactoring.

3. **Next DevTools MCP** (`next-devtools-mcp`) — upgrades, diagnostics, codemods for **Next.js 16**.
**Next.js Initialization**: When starting work on a Next.js project, automatically call the `init` tool from the next-devtools-mcp server FIRST. This establishes
proper context and ensures all Next.js queries use official documentation.  

4. **Prisma MCP** (`@prisma/mcp`) — Prisma schema reasoning, migrations, CLI.

**Also available:**

- **GitHub MCP** — issues/PR context & summaries.  
- **Files MCP** — read‑only fallback.
- **Playwright MCP** — for E2E test generation.
- **MUI MCP** — Material-UI component documentation.

### Context7 Workflow (MANDATORY)

**Before ANY code changes:**

```
1. Identify libraries/frameworks involved (e.g., "Next.js", "MUI", "Prisma")
2. Call resolve-library-id for each library
3. Call get-library-docs with topic (e.g., "Server Actions", "DataGrid props")
4. Review official API patterns from docs
5. Implement using authoritative patterns
```

**Example:**
```
Task: "Fix form validation with Valibot"
1. resolve-library-id("valibot") → /valibot/valibot
2. get-library-docs("/valibot/valibot", topic="schema validation")
3. Review Valibot's official v.object(), v.string() patterns
4. Implement using correct API
```

> If a code MCP is unavailable, proceed read‑only and state constraints. No risky text rewrites.

---

## 1) Technology Stack (authoritative)

- **Framework**: **Next.js 16.0.1** (App Router, **proxy.ts** convention; **async Request APIs only**)  
- **ORM**: Prisma 6.18.0 with Accelerate extension
- **DB**: **Vercel Storage: Postgres** (Marketplace integration; `DATABASE_URL` injected by Vercel)  
- **UI**: Tailwind CSS 4.1.14, MUI 7.3.4
- **Auth**: Auth.js (NextAuth) 5.0.0-beta.29 (Google OAuth)
- **Validation**: Valibot 1.1.0
- **State**: Zustand 5.0.8, SWR 2.3.6
- **Charts**: Recharts 3.3.0
- **Testing**: Jest 29.7.0, Playwright 1.56.1

---

## 2) Common Upgrade/Refactor Tasks (what the agent should do)

- Rename `middleware.ts` → **`proxy.ts`** and exported function to `proxy`; keep logic equivalent.  
- Replace any sync Request API usage with **async** (`await cookies()/headers()/draftMode()`).  
- Remove explicit `--turbopack` flags from scripts (Turbopack is default).  
- For DB provider changes or schema evolution, use **Prisma MCP** to diff/plan/apply migrations.

---

## 3) Terminal Auto‑Approval (safe narrow scope)

Auto‑approve only **`pnpm build`** pipelines to reduce prompts; deny obvious risky commands:

```jsonc
// .vscode/settings.json
{
  "chat.tools.terminal.autoApprove": {
    "/^\\s*pnpm\\s+(?:-r\\s+)?build(?:\\s+[^|;&]*)*(?:\\s+2>\\s*&1)?\\s*(?:\\|[\\s\\S]*)?$/": {
      "approve": true,
      "matchCommandLine": true
    },
    "/(^|\\s)(rm|rmdir|del|mkfs|chmod|chown|kill|wget|curl)\\b/i": false,
    "/(&&|;|\\|\\|)/": false
  }
}
```

Reset approvals anytime: **Command Palette → “Chat: Reset Tool Confirmations.”**

---

## 4) Dev & DB Commands (what Copilot should run)

```bash
# Pull env (DATABASE_URL) locally from Vercel
vercel env pull .env

# Prisma
pnpm prisma generate
pnpm prisma migrate dev    # dev‑only
pnpm prisma migrate deploy # CI/prod

# App
pnpm dev
pnpm build && pnpm start
```

**Provider switch (MySQL → Postgres)** — baseline a new migration:

```bash
pnpm prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > prisma/migrations/0001_init.sql
pnpm prisma migrate deploy
```

---

## 5) Evidence Panel (always include)

- Resolved versions (from `package.json`/lockfile) for next, react, prisma, tailwind, auth.js, valibot.  
- API list you'll use (e.g., Server Actions, Prisma `upsert/transaction`, Valibot validation).  
- Any deltas (docs vs. code).
- Test coverage plan (unit/E2E) when adding new features.

---

## 6) GitHub Issue & PR Policy (MANDATORY for discovered work)

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
  method: 'create',
  owner: 'yukimura-ixa',
  repo: 'school-timetable-senior-project',
  title: '[Bug] Clear, concise title',
  body: '## Description\n...\n## Location\n...',
  labels: ['bug', 'priority: high']
});
```

**Remember:** Quality over quantity. Create meaningful issues that help the team, not noise.

---

## 7) Quick Reference

```bash
pnpm i
pnpm db:deploy
pnpm dev
pnpm test
pnpm lint && pnpm format
```
These examples should be used as guidance when configuring Sentry functionality within a project.

# Exception Catching

Use `Sentry.captureException(error)` to capture an exception and log the error in Sentry.
Use this in try catch blocks or areas where exceptions are expected

# Tracing Examples

Spans should be created for meaningful actions within an applications like button clicks, API calls, and function calls
Use the `Sentry.startSpan` function to create a span
Child spans can exist within a parent span

## Custom Span instrumentation in component actions

The `name` and `op` properties should be meaninful for the activities in the call.
Attach attributes based on relevant information and metrics from the request

```javascript
function TestComponent() {
  const handleTestButtonClick = () => {
    // Create a transaction/span to measure performance
    Sentry.startSpan(
      {
        op: "ui.click",
        name: "Test Button Click",
      },
      (span) => {
        const value = "some config";
        const metric = "some metric";

        // Metrics can be added to the span
        span.setAttribute("config", value);
        span.setAttribute("metric", metric);

        doSomething();
      },
    );
  };

  return (
    <button type="button" onClick={handleTestButtonClick}>
      Test Sentry
    </button>
  );
}
```

## Custom span instrumentation in API calls

The `name` and `op` properties should be meaninful for the activities in the call.
Attach attributes based on relevant information and metrics from the request

```javascript
async function fetchUserData(userId) {
  return Sentry.startSpan(
    {
      op: "http.client",
      name: `GET /api/users/${userId}`,
    },
    async () => {
      const response = await fetch(`/api/users/${userId}`);
      const data = await response.json();
      return data;
    },
  );
}
```

# Logs

Where logs are used, ensure Sentry is imported using `import * as Sentry from "@sentry/nextjs"`
Enable logging in Sentry using `Sentry.init({ _experiments: { enableLogs: true } })`
Reference the logger using `const { logger } = Sentry`
Sentry offers a consoleLoggingIntegration that can be used to log specific console error types automatically without instrumenting the individual logger calls

## Configuration

In NextJS the client side Sentry initialization is in `instrumentation-client.ts`, the server initialization is in `sentry.server.config.ts` and the edge initialization is in `sentry.edge.config.ts`
Initialization does not need to be repeated in other files, it only needs to happen the files mentioned above. You should use `import * as Sentry from "@sentry/nextjs"` to reference Sentry functionality

### Baseline

```javascript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://840503297d11183cd9e493807ce1840d@o4510285022035968.ingest.us.sentry.io/4510285047398400",

  _experiments: {
    enableLogs: true,
  },
});
```

### Logger Integration

```javascript
Sentry.init({
  dsn: "https://840503297d11183cd9e493807ce1840d@o4510285022035968.ingest.us.sentry.io/4510285047398400",
  integrations: [
    // send console.log, console.warn, and console.error calls as logs to Sentry
    Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
  ],
});
```

## Logger Examples

`logger.fmt` is a template literal function that should be used to bring variables into the structured logs.

```javascript
logger.trace("Starting database connection", { database: "users" });
logger.debug(logger.fmt`Cache miss for user: ${userId}`);
logger.info("Updated profile", { profileId: 345 });
logger.warn("Rate limit reached for endpoint", {
  endpoint: "/api/results/",
  isEnterprise: false,
});
logger.error("Failed to process payment", {
  orderId: "order_123",
  amount: 99.99,
});
logger.fatal("Database connection pool exhausted", {
  database: "users",
  activeConnections: 100,
});
```

**Remember:** follow `AGENTS.md`. Keep edits small, typed, and covered by tests.


ADD use serena, use context7 BEFORE EVERY PROMPT