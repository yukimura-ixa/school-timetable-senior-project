# GitHub Issue & PR Creation Policy

## Overview

This memory documents the mandatory policy for creating GitHub issues and pull requests when discovering bugs, TODOs, technical debt, or features during development work.

## When to Create Issues

### 1. Bugs (ALWAYS CREATE ISSUE)

- Failed tests or test suites
- Runtime errors or exceptions
- Type errors or compilation issues
- Logic errors or incorrect behavior

### 2. Technical Debt (CREATE ISSUE)

- `TODO` or `FIXME` comments in code
- Code smells (duplicate code, complex functions)
- Missing type annotations or `any` types
- Deprecated API usage

### 3. Missing Features (CREATE ISSUE)

- Features mentioned in comments but not implemented
- User-facing improvements
- Developer experience enhancements

### 4. Performance Issues (CREATE ISSUE)

- Slow queries or operations
- Memory leaks or resource issues
- Bundle size problems

## Standard Workflow

```typescript
// When discovering issues during work:
1. Document the issue clearly (what, where, why)
2. Assess severity: critical/high/medium/low
3. Determine if it follows dev standards (check AGENTS.md)
4. Create GitHub issue with proper labels
5. Add to current TODO list if related to active work
6. Continue with original task unless critical
```

## Issue Template Structure

```markdown
## Description

[Clear description of the bug/feature/debt]

## Location

- File(s): [path/to/file.ts]
- Line(s): [specific lines if applicable]

## Current Behavior

[What currently happens]

## Expected Behavior

[What should happen]

## Reproduction Steps (for bugs)

1. [Step 1]
2. [Step 2]
   ...

## Proposed Solution

[Suggested approach or fix]

## Technical Context

- Related files: [list]
- Dependencies: [list]
- Estimated effort: [S/M/L/XL]

## Related Issues/PRs

- Relates to #[issue number]
- Blocked by #[issue number]
```

## PR Creation Criteria

Create a PR when:

- Fixing issues discovered during work
- Implementing features that span multiple commits
- Making significant refactoring changes

### PR Template

```markdown
## Changes

[Summary of what changed]

## Related Issues

Closes #[issue number]

## Testing

- [ ] Unit tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed

## Checklist

- [ ] Follows AGENTS.md guidelines
- [ ] Context7 consulted for all library usage
- [ ] Type safety maintained (no new `any`)
- [ ] Tests passing (pnpm test)
- [ ] Linting passing (pnpm lint)
```

## Standard Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `technical-debt` - Code quality improvements
- `performance` - Performance optimization
- `testing` - Test-related issues
- `documentation` - Documentation improvements
- `priority: high` - Needs immediate attention
- `priority: medium` - Should be addressed soon
- `priority: low` - Nice to have
- `good first issue` - Good for newcomers

## When NOT to Create Issues

- One-line fixes that can be done immediately
- Typos in comments or documentation
- Personal preferences without technical merit
- Issues already tracked (check existing issues first)

## Example: Real-World Usage

### Scenario: Fixing Store Type Mismatch

```typescript
// While fixing store type mismatch, discovered:

// 1. Immediate fix needed
GitHub Issue #32: "Fix store type mismatch in arrangement-ui"
- Description: Store expects SubjectData[] but receives ClassScheduleWithRelations[]
- Solution: Create mapper functions
- Labels: bug, priority: high
- Status: Fixed in PR #XX

// 2. Related issues found
GitHub Issue #33: "Fix 7 failing Jest test suites"
- Description: Mock setup conflicts and data fixture issues
- Root cause: Duplicate jest.mock() declarations
- Labels: testing, technical-debt, priority: high
- Status: In Progress (5/7 fixed)

// 3. Continue with original task
```

## Automation with MCP GitHub Tools

```typescript
// Use structured approach
await mcp_github_issue_write({
  method: "create",
  owner: "yukimura-ixa",
  repo: "school-timetable-senior-project",
  title: "[Bug] Clear, concise title",
  body: `## Description
Detailed description...

## Location
- File(s): src/features/...
- Line(s): 123-145

## Current Behavior
What happens now...

## Expected Behavior
What should happen...

## Proposed Solution
Implementation approach...`,
  labels: ["bug", "priority: high"],
});
```

## Quality Guidelines

**Do:**

- Create meaningful issues that provide value
- Include sufficient context for others to understand
- Use clear, descriptive titles
- Add relevant labels and priorities
- Link related issues and PRs
- Document reproduction steps for bugs

**Don't:**

- Create noise issues for trivial matters
- Duplicate existing issues (search first)
- Create issues without adequate description
- Skip testing requirements in PRs
- Forget to update TODO list when issues are created

## Integration with TODO List

When creating an issue:

1. Add corresponding TODO item if work is ongoing
2. Reference issue number in TODO description
3. Update TODO status as work progresses
4. Mark TODO complete when issue is closed

Example TODO entry:

```markdown
- [x] Fix store type mismatch (scheduledSubjects)
  - Fixed: Created proper mapper functions to convert ClassScheduleWithRelations to SubjectData format.
  - Removed 'as any' casts at lines 568-569.
  - Tracked in GitHub issue #32.
```

## Remember

**Quality over quantity.** Create meaningful issues that help the team understand and resolve problems efficiently. Every issue should add value to the project's development process.
