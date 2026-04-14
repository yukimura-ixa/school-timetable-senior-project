# CLAUDE.md - Project Guide

Phrasongsa Timetable is a Next.js 16 school timetable platform for Thai secondary schools with strict MOE compliance requirements.

## Quick Reference
- Package manager: pnpm only
- `pnpm dev`
- `pnpm build`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm test:e2e`
- `pnpm db:migrate`
- `pnpm db:deploy`
- `pnpm db:seed:clean`

## Critical Overrides
- Follow `AGENTS.md` as the primary local contract for all coding agents.
- Use MCP tools before assumptions when evidence is available.
- Keep Thai MOE and TimeslotID/ConfigID format rules intact.

## Detailed Guidance
- [Agent Contract](AGENTS.md)
- [Project Reference](docs/agents/instructions/project-reference.md)
- [MCP And Evidence Rules](docs/agents/instructions/mcp-and-evidence.md)
- [MOE And Identifier Rules](docs/agents/instructions/moe-and-identifiers.md)
- [Coding Standards](docs/agents/instructions/coding-standards.md)
- [Architecture And Next.js Patterns](docs/agents/instructions/architecture-and-nextjs.md)
- [Testing And CI Workflow](docs/agents/instructions/testing-and-ci.md)
- [Safety And Response Rules](docs/agents/instructions/safety-and-response.md)
