# Next.js 16 DevTools & MCP Guide

Doc: how agents use Next.js 16 DevTools MCP integration (e.g. `nextjs_runtime`, `browser_eval`, upgrade helpers) for Phrasongsa Timetable project.

Complements MCP rules in `AGENTS.md`. Details **runtime-specific** workflows.

---

## 1. Goals

- Base Next.js behavior on **actual runtime state**, not guesses.
- Use official docs (Context7) + runtime tools together.
- Use automated helpers (upgrade tools, cache components), not manual hacks.

---

## 2. Initialization (Per Session)

Start of Next.js-focused session, agent must:

1. Ensure dev server running (e.g. `pnpm dev` in separate terminal).
2. Discover runtime tools via `nextjs_runtime` `list_tools` / discovery action.
3. Use Next-specific docs via Context7 for:
   - App Router
   - Server Components
   - server actions
   - routing, caching, RSC rules.

Never assume old Next.js patterns valid. Always check docs.

---

## 3. Runtime Diagnostics (`nextjs_runtime`)

Use runtime MCP tools when:

- Debug Next.js errors (build or runtime).
- Need which routes exist + how rendered.
- Need cache or RSC behavior for route.

Workflow:

1. List tools:
   - e.g. `action: "list_tools"`.
2. Call tools:
   - `get_routes` – route tree, segment types, RSC vs client.
   - `get_errors` – server/runtime errors.
   - `get_build_info` – recent build details.
   - `clear_cache` – when testing cache changes.

Rules:

- Run diagnostics **before** code changes for hard bugs.
- Results guide where to look in code (Serena), which docs to read (Context7).

---

## 4. Browser Automation (`browser_eval`)

Use when:

- Verify **actual page behavior**:
  - hydration issues
  - client-side errors
  - dynamic layouts
- Need screenshots for visual inspection.
- Need console logs from browser context.

Steps:

1. Start browser (e.g. headless Chromium).
2. Navigate to target URL (dev or preview).
3. Collect console messages (errors/warnings).
4. Optional: capture screenshot.
5. Close browser when done.

Priorities:

- `nextjs_runtime` first for server-side errors + routing info.
- `browser_eval` confirms client-side behavior + visual correctness.

---

## 5. Upgrade & Migration Tools

Upgrade Next.js or enable new features (e.g. Cache Components): prefer official or MCP-based helpers over manual edits.

Rules:

- Upgrade helpers only on **clean git working tree** (no uncommitted changes).
- Automated tools handle:
  - dependency bumps
  - codemods for new APIs
  - basic config migrations.
- After upgrade:
  - `nextjs_runtime` checks build/runtime errors
  - `browser_eval` spots visible regressions on critical routes.

---

## 6. Cache Components and Performance

Project enables Cache Components or other caching:

- Runtime tools verify:
  - which routes static vs dynamic,
  - which use `cacheLife`, `cacheTag`, or similar.
- Before changing cache behavior for route:
  - tests must cover cached + invalidation flows.

No random "optimize" — no forced caching or runtime switch without understanding impact on timetable correctness + MOE logic.

---

## 7. Safety and Degraded Modes

Next.js runtime MCP endpoints down:

- State clearly in response: `nextjs_runtime` or related tools down.
- Avoid:
  - large routing changes,
  - deep RSC ↔ client component refactors,
  - performance changes depending on cache behavior.
- Keep changes small. Rely more on:
  - Context7 docs,
  - Serena for code structure,
  - tests for validation.

Tools back → re-run diagnostics, confirm behavior.