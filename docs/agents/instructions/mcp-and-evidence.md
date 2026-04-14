# MCP And Evidence Rules

## Overview
Use tools as the default source of truth. Avoid assumptions from model memory when a tool can provide real repository or runtime evidence.

## Priority
1. Context7 for framework and library docs
2. Serena for symbols, references, and repository memories
3. Thoughtbox for non-trivial and MOE-sensitive design decisions
4. GitHub tools for issue and PR acceptance criteria
5. Runtime tools (Next DevTools, Prisma, Playwright) for behavior claims

## Required Checks
- Call Context7 before coding when API behavior or version syntax matters.
- Use Serena before multi-file edits or refactors.
- Create a Thoughtbox plan for curriculum, conflict logic, export rules, auth/permissions, and cross-cutting UX decisions.
- Use runtime tools before claiming route behavior, DB schema effects, or E2E outcomes.
- If a required MCP is unavailable, state degraded mode and keep changes conservative.

## Evidence Quality
- Prefer direct references to files, symbols, tests, or tool outputs.
- If issue or PR context exists, implement against acceptance criteria instead of assumptions.
