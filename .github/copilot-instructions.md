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

- **Framework**: **Next.js 16** (App Router, **proxy.ts** convention; **async Request APIs only**)  
- **ORM**: Prisma  
- **DB**: **Vercel Storage: Postgres** (Marketplace integration; `DATABASE_URL` injected by Vercel)  
- **UI**: Tailwind CSS  
- **Auth**: NextAuth (Google)

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

- Resolved versions (from `package.json`/lockfile) for next, react, prisma, tailwind, next-auth.  
- API list you’ll use (e.g., Route Handlers, Prisma `upsert/transaction`, Zod validation).  
- Any deltas (docs vs. code).

---

## 6) Quick Reference

```bash
pnpm i
pnpm db:deploy
pnpm dev
pnpm test
pnpm lint && pnpm format
```

**Remember:** follow `AGENTS.md`. Keep edits small, typed, and covered by tests.
