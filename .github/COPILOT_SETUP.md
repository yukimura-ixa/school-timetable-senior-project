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

### 4. Code Standards

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

- **Next.js 16.0.1** with App Router
- **React 19.2.0** with Next.js Server Components
- **TypeScript** (latest)
- **Prisma 6.18.0** with PostgreSQL (Vercel Storage)
- **Tailwind CSS 4.1.14**
- **Auth.js (NextAuth) 5.0.0-beta.29** for Google OAuth
- **Material-UI 7.3.4** for components
- **Valibot 1.1.0** for validation
- **Zustand 5.0.8** for state management
- **Recharts 3.3.0** for data visualization
- **Jest 29.7.0** for unit testing
- **Playwright 1.56.1** for E2E testing

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

## Testing with GitHub Copilot

### Unit Testing (Jest)

**When Copilot should create unit tests:**
- Pure functions in domain services
- Validation logic
- Repository methods (with mocked Prisma)
- Utility functions
- Business rule enforcement

**Test patterns to follow:**

```typescript
// __test__/features/{domain}/{domain}-validation.test.ts
import { describe, test, expect } from "@jest/globals";
import { validateTimeslotConflict } from "@/features/timeslot/domain/services/timeslot-validation.service";

describe('validateTimeslotConflict', () => {
  test('should return conflict when timeslots overlap', () => {
    const slot1 = { day: 'MON', period: 1, startTime: '08:00' };
    const slot2 = { day: 'MON', period: 1, startTime: '08:00' };
    
    const result = validateTimeslotConflict(slot1, slot2);
    
    expect(result.hasConflict).toBe(true);
    expect(result.message).toContain('ซ้ำซ้อน');
  });
  
  test('should return no conflict when different periods', () => {
    const slot1 = { day: 'MON', period: 1, startTime: '08:00' };
    const slot2 = { day: 'MON', period: 2, startTime: '09:00' };
    
    const result = validateTimeslotConflict(slot1, slot2);
    
    expect(result.hasConflict).toBe(false);
  });
});
```

**Table-driven tests for complex scenarios:**

```typescript
describe('validateScheduleConflict', () => {
  const testCases = [
    {
      name: 'teacher conflict - same time',
      input: { teacherId: 'T001', day: 'MON', period: 1 },
      existing: [{ teacherId: 'T001', day: 'MON', period: 1 }],
      expected: { valid: false, message: 'ครูสอนซ้ำในช่วงเวลาเดียวกัน' }
    },
    {
      name: 'room conflict - same time',
      input: { roomId: 'R101', day: 'MON', period: 1 },
      existing: [{ roomId: 'R101', day: 'MON', period: 1 }],
      expected: { valid: false, message: 'ห้องถูกใช้งานแล้ว' }
    },
    {
      name: 'no conflict - different time',
      input: { teacherId: 'T001', day: 'MON', period: 1 },
      existing: [{ teacherId: 'T001', day: 'TUE', period: 1 }],
      expected: { valid: true }
    }
  ];

  testCases.forEach(({ name, input, existing, expected }) => {
    test(name, () => {
      const result = validateScheduleConflict(input, existing);
      expect(result).toEqual(expected);
    });
  });
});
```

**Running unit tests:**
```bash
pnpm test                    # Run all tests
pnpm test:watch              # Watch mode
pnpm test path/to/test.ts    # Specific test file
```

---

### E2E Testing (Playwright)

**When Copilot should create E2E tests:**
- Critical user flows (login, schedule creation, export)
- Multi-step processes across pages
- Role-based access (Admin/Teacher/Student)
- Data mutations with verification
- Error handling and validation

**Test patterns to follow:**

```typescript
// e2e/features/schedule-assignment.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Schedule Assignment', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/signin');
    await page.fill('input[name="email"]', process.env.TEST_ADMIN_EMAIL!);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should create new schedule assignment', async ({ page }) => {
    // Navigate to assign page
    await page.goto('/schedule/1-2567/assign');
    await expect(page.locator('h1')).toContainText('มอบหมายรายวิชา');
    
    // Select class
    await page.selectOption('select[name="gradeLevel"]', 'M.1/1');
    
    // Add subject
    await page.click('button:has-text("เพิ่มรายวิชา")');
    await page.fill('input[name="subjectCode"]', 'TH101');
    await page.selectOption('select[name="teacherId"]', 'T001');
    
    // Save
    await page.click('button[type="submit"]');
    
    // Verify success
    await expect(page.locator('text=บันทึกสำเร็จ')).toBeVisible();
    
    // Verify data persisted
    await page.reload();
    await expect(page.locator('text=TH101')).toBeVisible();
  });

  test('should validate teacher conflict', async ({ page }) => {
    await page.goto('/schedule/1-2567/assign');
    
    // Try to assign same teacher to overlapping timeslot
    await page.click('button:has-text("เพิ่มรายวิชา")');
    await page.selectOption('select[name="teacherId"]', 'T001');
    await page.selectOption('select[name="timeslot"]', 'MON1');
    await page.click('button[type="submit"]');
    
    // Expect conflict error
    await expect(page.locator('text=ครูสอนซ้ำ')).toBeVisible();
  });
});
```

**Test data strategy:**
- Use seeded data from `prisma/seed.ts`
- Known semesters: `1-2567`, `2-2567`, `1-2568`
- Known teachers: Check seed file for IDs
- Known classes: Check seed file for grade levels

**Running E2E tests:**
```bash
pnpm test:e2e                # Run all E2E tests (local)
pnpm test:e2e:ui             # UI mode for debugging
pnpm test:e2e:headed         # See browser
pnpm test:vercel             # Test against production
pnpm test:vercel:public      # Test public pages only
```

---

### Test Coverage Guidelines

**Copilot should ensure:**
1. **Unit test coverage** for all business logic
2. **E2E test coverage** for all critical user flows
3. **Edge cases** are tested (empty state, error states, boundary values)
4. **Error messages** are in Thai where user-facing
5. **Test isolation** - tests don't depend on each other
6. **Seed data** is documented in test comments

**Coverage targets:**
- Unit tests: 70%+ for domain services
- E2E tests: All critical flows (schedule creation, conflicts, exports)
- Integration tests: All Server Actions with validation

---

### When to Write Tests

**Always write tests when:**
- Adding new business rules or validation
- Creating new Server Actions
- Implementing conflict detection logic
- Adding export functionality
- Changing data models
- Refactoring critical paths

**Example workflow:**
1. Write failing test first (TDD approach)
2. Implement feature to pass test
3. Refactor with tests as safety net
4. Add E2E test for complete flow
5. Run full test suite before commit

---

**Last Updated**: October 31, 2025
