## Description

<!-- Provide a brief description of the changes in this PR -->

## Type of Change

<!-- Mark with an 'x' the appropriate option(s) -->

- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📝 Documentation update
- [ ] 🔧 Configuration change
- [ ] ♻️ Code refactoring (no functional changes)
- [ ] ✅ Test additions or updates

## Related Issues

<!-- Link to related issues (e.g., Fixes #123, Closes #456) -->

## Changes Made

<!-- List the main changes made in this PR -->

-
-
-

## Testing

### Unit Tests

- [ ] Existing unit tests pass
- [ ] New unit tests added (if applicable)
- [ ] Coverage maintained or improved

### E2E Tests

- [ ] Existing E2E tests pass locally
- [ ] New E2E tests added (if applicable)
- [ ] GitHub Actions E2E workflow passed

**E2E Test Results:**

<!-- If you ran E2E tests, provide a summary or link to the GitHub Actions run -->

### Manual Testing

<!-- Describe manual testing performed -->

- [ ] Tested on Chrome/Chromium
- [ ] Tested on different screen sizes
- [ ] Verified authentication flows
- [ ] Checked database migrations

## Screenshots/Videos

<!-- If applicable, add screenshots or videos demonstrating the changes -->

## Checklist

### Code Quality

- [ ] Code follows the project's style guidelines (AGENTS.md)
- [ ] Self-review of code completed
- [ ] Code is properly commented (especially complex logic)
- [ ] No console.log statements left in production code
- [ ] TypeScript types are properly defined (no `any` without justification)

### Documentation

- [ ] Updated README.md (if applicable)
- [ ] Updated AGENTS.md (if changing patterns)
- [ ] Added/updated JSDoc comments
- [ ] Updated relevant documentation files

### Database

- [ ] Database migrations created (if schema changed)
- [ ] Migration tested with `pnpm db:migrate`
- [ ] Seed script updated (if needed)

### CI/CD

- [ ] All CI checks pass (lint, type-check, unit tests)
- [ ] E2E tests pass on GitHub Actions
- [ ] No new TypeScript errors introduced
- [ ] No new ESLint warnings

### Security

- [ ] No sensitive data exposed in code
- [ ] Environment variables properly configured
- [ ] Authentication/authorization checks in place
- [ ] Input validation implemented

## Additional Notes

<!-- Any additional information that reviewers should know -->

---

## For Reviewers

### Review Focus Areas

<!-- Highlight specific areas that need careful review -->

-

### Testing Instructions

<!-- Provide step-by-step instructions for reviewers to test the changes -->

1.
2.
3.

### E2E Test Coverage

<!-- Describe which E2E test scenarios cover this change -->

-

---

**Note for Contributors:**

- E2E tests run automatically on GitHub Actions for every PR
- You can manually trigger E2E tests from the Actions tab
- Download test reports from workflow artifacts if tests fail
- See [E2E GitHub Actions Guide](.github/E2E_GITHUB_ACTIONS.md) for details
