# GitHub Copilot Setup Guide

This guide explains how GitHub Copilot is configured for this project and how to use it effectively.

---

## Configuration

GitHub Copilot has been configured to follow project-specific instructions through two files:

1. **`.github/copilot-instructions.md`** - GitHub Copilot's configuration file
2. **`AGENTS.md`** - Complete AI agent operating manual (referenced by copilot-instructions.md)

---

## How It Works

### Automatic Configuration

GitHub Copilot automatically reads `.github/copilot-instructions.md` when you work in this repository. This file:

- Directs Copilot to follow the instructions in `AGENTS.md`
- Emphasizes the **MCP-first workflow** (especially **context7**)
- Specifies the tech stack and coding standards
- Provides quick reference for common commands

### MCP-First Approach

**Most Important**: This project requires AI agents to use **MCP (Model Context Protocol)** servers, especially **context7**, to:

- Fetch up-to-date, version-specific documentation
- Get accurate API examples for libraries
- Verify current best practices
- Ensure compatibility with project dependencies

---

## Using GitHub Copilot Chat

### In VS Code

When using GitHub Copilot Chat in VS Code:

```
Use #file:AGENTS.md as the source of truth. Use context7 for docs.
```

Or simply start your request with:

```
Following AGENTS.md, please [your request]
```

### Reference Files and Symbols

- Use `#file:path/to/file` to reference specific files
- Use `#symbol:functionName` to reference specific functions/classes
- Use `@workspace` for repo-wide reasoning

### Example Prompts

**Good prompts that follow the MCP-first approach:**

```
Following AGENTS.md, use context7 to fetch the latest Prisma 5.22 
documentation and help me create a new model for tracking teacher 
availability.
```

```
Use context7 to check the Next.js 15 App Router docs, then help me 
create a new API route for exporting schedules to Excel.
```

**What to emphasize:**

- Always mention using context7 for library documentation
- Reference AGENTS.md when needed
- Specify the tech stack (Next.js, TypeScript, Prisma, etc.)

---

## For AI Agents

If you're an AI agent working on this codebase:

### 0. Environment Setup (First Time)

**Before starting any work, set up the development environment:**

```bash
# 1. Install pnpm package manager
npm install -g pnpm@10.20.0

# 2. Install all project dependencies
pnpm install --frozen-lockfile

# 3. Set up environment variables
cp .env.example .env
# Edit .env with appropriate values

# 4. Generate Prisma client
pnpm prisma generate

# 5. Run database migrations (if using real DB)
pnpm db:migrate

# 6. Seed test data (optional)
pnpm db:seed:clean
```

**Verify setup:**

```bash
# Check if tests run
pnpm test

# Check if build works
pnpm build
```

### 1. Read Instructions First

Always read and follow `AGENTS.md` in the repository root. It contains:

- Your role and responsibilities
- Project context and requirements
- Execution checklist
- Coding rules and standards
- Response format template

### 2. Use MCP Servers (MANDATORY)

**Before implementing any feature:**

1. Query **context7** for the exact library versions used in this project
2. Fetch version-specific documentation and examples
3. Document what you learned in an "Evidence Panel"
4. Follow the APIs and patterns shown in the current docs

### 3. Package Manager

**Always use `pnpm`**, never npm or yarn:

```bash
pnpm install          # Install dependencies
pnpm dev              # Start dev server
pnpm test             # Run tests
pnpm prisma generate  # Generate Prisma client
```

### 4. Test Environment Setup

When working with tests, ensure proper setup:

#### Installing Dependencies

```bash
# Install pnpm if not available
npm install -g pnpm@10.20.0

# Install project dependencies
pnpm install --frozen-lockfile

# Generate Prisma client (required for tests)
pnpm prisma generate
```

#### Database Simulation for Tests

This project uses **different approaches** for different test types:

##### Approach 1: Mock-Based (Unit Tests)

**Best for**: Fast, isolated unit tests

Unit tests use mocks defined in `jest.setup.js`:
- Prisma client is completely mocked
- No real database connection needed
- Test data is defined inline in test files
- Very fast execution (< 5 seconds for 300+ tests)

**Example**: Lock template tests use mock fixtures:

```typescript
const mockGrades = [
  { GradeID: "1-1", GradeName: "ม.1/1", Level: 1 },
  { GradeID: "1-2", GradeName: "ม.1/2", Level: 1 },
];
```

##### Approach 2: Seed-Based (E2E Tests)

**Best for**: Integration and E2E tests

E2E tests require a real database with seed data:

1. **Set up test database**:
   ```bash
   # Create .env with test database
   DATABASE_URL="******localhost:3306/test_db"
   
   # Run migrations
   pnpm db:migrate
   
   # Seed with clean test data
   pnpm db:seed:clean
   ```

2. **Seed file** (`prisma/seed.ts`):
   - Creates realistic Thai school data
   - 60 teachers, 18 grades, 50+ subjects
   - 8 periods per day, 5 days per week
   - Department-based structure

3. **Use in E2E tests**:
   - Playwright tests run against seeded data
   - Global setup runs before test suite
   - Data is consistent across test runs

##### Approach 3: In-Memory Database (Optional)

**Best for**: Fast integration tests without external DB

Not currently implemented, but could use:
- `@prisma/client` with SQLite in-memory
- Or `jest-prisma` for automatic setup/teardown

#### Environment Variables

Create `.env` file for tests:

```bash
# For E2E tests (requires real database)
DATABASE_URL="******localhost:3306/test_db"

# For all tests
AUTH_SECRET="test-secret-key-for-development-only-32chars"
AUTH_URL=http://localhost:3000
ENABLE_DEV_BYPASS=true
DEV_USER_ID=1
DEV_USER_EMAIL=admin@test.com
DEV_USER_NAME=Test Admin
DEV_USER_ROLE=admin
```

**Note**: Unit tests don't require `DATABASE_URL` because they use mocks.

### 5. Code Standards

- **TypeScript everywhere** - No `any` types
- **Prisma schema** as single source of truth
- **Pure functions** for business logic
- **Table-driven tests** for all logic
- **Idempotent DB operations**

---

## Project-Specific Context

### What This System Does

A school timetable management system that:
- Creates conflict-free class schedules
- Manages teachers, rooms, subjects, and classes
- Detects scheduling conflicts automatically
- Exports schedules to Excel and PDF
- Supports Admin, Teacher, and Student roles

### Tech Stack

- **Next.js 15** with App Router
- **React 18** with Next.js Server Components
- **TypeScript** (latest)
- **Prisma 5** with MySQL
- **Tailwind CSS 4**
- **NextAuth.js** for Google OAuth
- **Material-UI 5** for components

### Key Files

- `AGENTS.md` - Complete AI agent instructions
- `.github/copilot-instructions.md` - GitHub Copilot config
- `prisma/schema.prisma` - Database schema (source of truth)
- `package.json` - Dependencies and scripts

---

## Verification

To verify GitHub Copilot is using the instructions:

1. Open a chat in VS Code
2. Ask: "What instructions are you following for this project?"
3. Copilot should reference the `.github/copilot-instructions.md` file
4. It should mention using context7 and following AGENTS.md

---

## Troubleshooting

### Copilot Not Following Instructions

1. **Check file location**: Ensure `.github/copilot-instructions.md` exists
2. **Reload VS Code**: Close and reopen VS Code to refresh Copilot
3. **Explicit reference**: Start your prompt with "Following AGENTS.md..."
4. **File permissions**: Ensure the files are readable

### MCP Servers Not Available

If context7 or other MCP servers aren't available:

1. Check if MCP is enabled in your environment
2. Request access to the required MCP servers
3. Fall back to explicitly referencing the package versions in package.json
4. Note in your response that MCP wasn't available

### Tests Failing Due to Missing Dependencies

If tests fail with module not found errors:

```bash
# Ensure dependencies are installed
pnpm install --frozen-lockfile

# Regenerate Prisma client
pnpm prisma generate

# Clear Jest cache
pnpm test -- --clearCache
```

### Database Connection Errors in Tests

For **unit tests**: Should not happen (they use mocks)
- Check `jest.setup.js` is properly configured
- Ensure no test is importing real Prisma client

For **E2E tests**: Check database connection
```bash
# Verify DATABASE_URL is set
cat .env | grep DATABASE_URL

# Test database connection
pnpm prisma db pull

# Reseed if needed
pnpm db:seed:clean
```

---

## Best Practices

### ✅ Do

- Always query context7 for library docs
- Reference AGENTS.md for project context
- Use pnpm for all package operations
- Write TypeScript with strong types
- Add tests for business logic
- Follow the execution checklist in AGENTS.md

### ❌ Don't

- Use npm or yarn instead of pnpm
- Skip the context7 query step
- Use `any` types in TypeScript
- Ignore the coding rules in AGENTS.md
- Make breaking changes without checking requirements

---

## Updates

When dependencies are updated, remember to:

1. Update the Evidence Panel template in AGENTS.md
2. Re-query context7 for the new versions
3. Update any migration notes or breaking changes
4. Document the changes in the PR

---

## Questions?

For more details, see:

- **`AGENTS.md`** - Complete instructions for AI agents
- **`README.md`** - Project overview and setup
- **`docs/DEVELOPMENT_GUIDE.md`** - Development setup guide

---

**Last Updated**: October 19, 2025
