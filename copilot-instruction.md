# Copilot Instructions - Quick Reference

See `AGENTS.md` for the full SubSentinel handbook. This file is a short reminder; defer to the handbook if anything conflicts.

## MCP Checklist

1. Serena - launch first for memories, semantic search, and symbol-aware edits.
2. Next DevTools MCP - Next.js 16 diagnostics and codemods.
3. context7 - confirm package versions and look up APIs.
4. GitHub MCP - review related pull requests or issues when useful.

Optional (configure when available): Prisma MCP, Files MCP, Playwright MCP, MUI MCP. If a server is offline, say so and prefer read-only investigation until it recovers.

## Serena-First Workflow

- List relevant memories before digging into a task.
- Use semantic queries instead of raw search to locate symbols.
- Create or update Serena memories after you learn something important.

Example phrasing: "Use Serena to inspect timetable conflict resolvers and list dependent routes."

## Guardrails and Defaults

- TypeScript everywhere; keep `any` use minimal.
- Next.js 16 App Router with Node runtime for DB-backed routes.
- Prisma v6 on Vercel Postgres; Prisma schema is the source of truth.
- Tailwind v4, MUI v7, Recharts for visualization components.
- Use PNPM commands exclusively.

## Working Without MCP Access

- Call out missing servers immediately.
- Limit refactors when Serena is unavailable; keep edits surgical.
- Defer migrations or codemods until the matching MCP (Prisma or Next DevTools) is reachable.
