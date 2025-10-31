# GitHub Copilot Instructions (Next.js 16 + Vercel Postgres + MCP)

> This file configures how Copilot (Agent Mode) should work in this repo.  
> **Always follow `AGENTS.md` for full context.** PNPM‑only.

---

## 0) MCP Priority & Routing

**Use these MCP servers by default:**

- **Next DevTools MCP** (`next-devtools-mcp`) — upgrades, diagnostics, codemods for **Next.js 16**.  
- **Prisma MCP** (`@prisma/mcp`) — Prisma schema reasoning, migrations, CLI.

**Also available:**  
- **context7** — version‑specific docs lookup (resolve exact package versions).  
- **Serena** — symbol‑aware edits & code navigation.  
- **GitHub MCP** — issues/PR context & summaries.  
- **Files MCP** — read‑only fallback.
- **Playwright MCP** — for E2E test generation.
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

## 6) Quick Reference

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
