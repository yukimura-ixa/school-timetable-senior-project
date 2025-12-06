# Next.js 16 DevTools & MCP Guide

This document explains how agents should use the Next.js 16 DevTools MCP
integration (e.g. `nextjs_runtime`, `browser_eval`, upgrade helpers)
for the Phrasongsa Timetable project.

It complements the MCP rules in `AGENTS.md` and details **runtime-specific**
workflows.

---

## 1. Goals

- Always base Next.js behavior on **actual runtime state**, not guesses.
- Use official docs (Context7) + runtime tools together.
- Use automated helpers (upgrade tools, cache components) instead of manual hacks.

---

## 2. Initialization (Per Session)

At the start of a Next.js-focused session, the agent should:

1. Ensure dev server is running (e.g. `pnpm dev` in a separate terminal).
2. Discover runtime tools using `nextjs_runtime`’s `list_tools` / discovery action.
3. Use Next-specific docs via Context7 for:
   - App Router
   - Server Components
   - server actions
   - routing, caching, RSC rules.

Agents must **not** assume old Next.js patterns are valid; always check docs.

---

## 3. Runtime Diagnostics (`nextjs_runtime`)

Use the runtime MCP tools whenever you:

- Debug Next.js errors (build or runtime).
- Need to know which routes exist and how they are rendered.
- Need to understand cache or RSC behavior for a route.

Typical workflow:

1. List available tools:
   - e.g. `action: "list_tools"`.
2. Call specific tools like:
   - `get_routes` – inspect route tree, segment types, RSC vs client.
   - `get_errors` – see server/runtime errors.
   - `get_build_info` – details about recent build.
   - `clear_cache` – when testing cache-related changes.

Rules:

- Run diagnostics **before** making code changes for hard bugs.
- Use results to guide where to look in the code (Serena) and which docs to read (Context7).

---

## 4. Browser Automation (`browser_eval`)

Use browser automation when:

- You need to verify **actual page behavior**:
  - hydration issues
  - client-side errors
  - dynamic layouts
- You want screenshots for visual inspection.
- You need console logs from the browser context.

Typical steps:

1. Start a browser (e.g. headless Chromium).
2. Navigate to the target URL (dev or preview).
3. Collect console messages (errors/warnings).
4. Optionally capture a screenshot.
5. Close the browser when done.

Priorities:

- Prefer `nextjs_runtime` for server-side errors and routing information.
- Use `browser_eval` to confirm client-side behavior and visual correctness.

---

## 5. Upgrade & Migration Tools

When upgrading Next.js or enabling new features (like Cache Components),
prefer official or MCP-based helpers over manual edits.

General rules:

- Use upgrade helpers only on a **clean git working tree** (no uncommitted changes).
- Let automated tools handle:
  - dependency bumps
  - codemods for new APIs
  - basic config migrations.
- After running an upgrade:
  - use `nextjs_runtime` to check for build/runtime errors
  - use `browser_eval` to spot visible regressions on critical routes.

---

## 6. Cache Components and Performance

If the project enables Cache Components or other caching strategies:

- Use runtime tools to verify:
  - which routes are static vs dynamic,
  - which ones use `cacheLife`, `cacheTag`, or similar patterns.
- Before changing cache behavior for a route:
  - confirm intent via Thoughtbox (design and risk).
  - ensure tests cover both cached and invalidation flows.

Agents must not randomly “optimize” by forcing caching or switching runtimes
without understanding the impact on timetable correctness and MOE logic.

---

## 7. Safety and Degraded Modes

If Next.js runtime MCP endpoints are not available:

- State clearly in your response that `nextjs_runtime` or related tools are down.
- Avoid:
  - large-scale routing changes,
  - deep RSC ↔ client component refactors,
  - performance changes that depend on cache behavior.
- Keep changes limited and rely more on:
  - Context7 docs,
  - Serena for code structure,
  - tests for validation.

When the tools become available again, re-run diagnostics to confirm behavior.
