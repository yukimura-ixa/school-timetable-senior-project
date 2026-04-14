# Testing And CI Workflow

## CI-First Policy
- Treat GitHub Actions as the primary quality gate.
- Prefer small frequent commits and CI feedback loops.
- Do not require full local test suites before every commit.

## Local Testing Strategy
Run focused local tests when needed for:
- reproducing CI failures
- debugging a specific area
- pre-release confidence checks

## Coverage Focus
- Unit tests for business rules, especially MOE validation and conflict logic.
- E2E tests for critical paths: auth, timetable CRUD, arrange/assign flows, and exports.

## Package Manager Rule
Use pnpm only for scripts, installs, and tooling commands.

## Related Docs
- `docs/agents/TESTING_STRATEGY.md`
