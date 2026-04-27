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


<!-- BEGIN BEADS INTEGRATION v:1 profile:minimal hash:ca08a54f -->
## Beads Issue Tracker

This project uses **bd (beads)** for issue tracking. Run `bd prime` to see full workflow context and commands.

### Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --claim  # Claim work
bd close <id>         # Complete work
```

### Rules

- Use `bd` for ALL task tracking — do NOT use TodoWrite, TaskCreate, or markdown TODO lists
- Run `bd prime` for detailed command reference and session close protocol
- Use `bd remember` for persistent knowledge — do NOT use MEMORY.md files

## Session Completion

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd dolt push
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds
<!-- END BEADS INTEGRATION -->
