# Phrasongsa Timetable Agent Contract

Default instructions for all coding agents in this repository.

## Essentials
- Scope: all code edits, tests, architecture changes, and curriculum/scheduling behavior.
- Package manager: pnpm only.
- Evidence policy: MCP-first, no guessing when tools can provide facts.
- Compliance policy: Thai MOE constraints are hard requirements.
- Quality policy: CI-first testing and type-safe implementation.
- Precedence: this file overrides other local agent docs when conflicts exist.

## Quick Commands
- `pnpm dev`
- `pnpm build`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm test:e2e`

## Detailed Instructions
- [Project Reference](docs/agents/instructions/project-reference.md)
- [MCP And Evidence Rules](docs/agents/instructions/mcp-and-evidence.md)
- [MOE And Identifier Rules](docs/agents/instructions/moe-and-identifiers.md)
- [Coding Standards](docs/agents/instructions/coding-standards.md)
- [Architecture And Next.js Patterns](docs/agents/instructions/architecture-and-nextjs.md)
- [Testing And CI Workflow](docs/agents/instructions/testing-and-ci.md)
- [Safety And Response Rules](docs/agents/instructions/safety-and-response.md)

## Existing Companion Docs
- [Thai MOE Curriculum Rules](docs/agents/THAI_MOE_CURRICULUM_RULES.md)
- [Testing Strategy](docs/agents/TESTING_STRATEGY.md)
- [MCP Workflows](docs/agents/MCP_WORKFLOWS.md)

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
