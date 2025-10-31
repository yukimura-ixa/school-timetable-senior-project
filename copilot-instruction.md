# Copilot Instructions - MCP-First with Serena Priority

This project mandates an MCP-first workflow for all code assistance. Always use MCP servers where available, and prefer PNPM for any package operations.

## Required Order of Operations

- Serena (code MCP) - FIRST for analysis, navigation, memories, and symbol-aware edits
- Next DevTools MCP - Next.js 16 diagnostics, codemods, upgrade guidance
- Prisma MCP - schema reasoning, migrations, Prisma CLI
- context7 - version-specific docs and API lookups
- mui-mcp - Material UI component documentation and usage guidance
- GitHub MCP - issues/PRs lookup and summaries
- Files MCP - read-only fallback when Serena read ops are insufficient
- Playwright MCP - E2E test generation

If any MCP is unavailable, proceed read-only, call out the limitation explicitly, and avoid risky multi-file edits.

## Detected MCP Servers (auto-discovery)

- None detected by tooling in this workspace or session.

Action: ensure your editor is configured with these servers: `serena`, `next-devtools-mcp`, `@prisma/mcp`, `context7`, `mui-mcp`, `github`, `files`, `playwright`.

## CRITICAL: Always Use Serena First (#serena MCP server)

For ALL analysis, investigation, and code understanding tasks, use Serena semantic tools:

### Standard Serena Workflow
1. Start with Serena memories: Use Serena to list memories and read relevant ones for context #serena
2. Use semantic analysis: Use Serena to find [symbols/functions/patterns] related to [issue] #serena
3. Get symbol-level insights: Use Serena to analyze [specific function] and show all referencing symbols #serena
4. Create new memories: Use Serena to write a memory about [findings] for future reference #serena

### Serena-First Examples

Instead of: "Search the codebase for database queries"
Use: "Use Serena to find all database query functions and analyze their performance patterns #serena"

Instead of: "Find all admin functions"
Use: "Use Serena to get symbols overview of admin files and find capability-checking functions #serena"

Instead of: "How do the three systems integrate?"
Use: "Use Serena to read the system-integration-map memory and show cross-system dependencies #serena"

## Guardrails and Defaults (Project-specific)

- TypeScript everywhere; minimize `any`
- Next.js 16 App Router; Node runtime for DB-backed routes
- Prisma v6 on Vercel Storage: Postgres; Prisma schema is source of truth
- Auth: Auth.js v5 (Google); Tailwind v4; MUI v7; Recharts for visualization
- Use PNPM for all scripts; Prisma client singleton; validation via Valibot at boundaries

## Fallback Policy

When MCP servers are not available:
- Work read-only and clearly state limitations
- Avoid risky multi-file changes without Serena; prefer small, surgical edits
- Defer migrations and codemods until Prisma or Next DevTools MCP are reachable

Refer AGENTS.md for additional project context