# MCP And Evidence Rules

## Overview
Tools = default source of truth. No model-memory assumptions when tool give real repo or runtime evidence.

## Priority
1. Context7 — framework + library docs
2. Serena — symbols, references, repo memories
3. GitHub tools — issue + PR acceptance criteria
4. Runtime tools (Next DevTools, Playwright) — behavior claims; Prisma CLI — DB schema effects

## Required Checks
- Context7 before coding when API behavior or version syntax matter.
- Serena before multi-file edits or refactors.
- Runtime tools before claiming route behavior, DB schema effects, E2E outcomes.
- Required MCP unavailable → state degraded mode, keep changes conservative.

## Evidence Quality
- Prefer direct refs: files, symbols, tests, tool outputs.
- Issue or PR context exist → implement against acceptance criteria, not assumptions.