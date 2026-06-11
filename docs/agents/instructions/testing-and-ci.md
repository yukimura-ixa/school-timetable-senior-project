# Testing And CI Workflow

## CI-First Policy
- GitHub Actions = primary quality gate.
- Small frequent commits + CI feedback loops.
- No full local test suite required before every commit.

## Local Testing Strategy
Focused local tests when:
- reproduce CI failure
- debug specific area
- pre-release confidence check

## Coverage Focus
- Unit tests: business rules, esp. MOE validation + conflict logic.
- E2E tests: critical paths — auth, timetable CRUD, arrange/assign flows, exports.

## Package Manager Rule
pnpm only — scripts, installs, tooling commands.

## Related Docs
- `docs/agents/TESTING_STRATEGY.md`