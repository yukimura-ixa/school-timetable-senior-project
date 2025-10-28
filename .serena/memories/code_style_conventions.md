# Code Style & Conventions

## General Principles
- **Feature-based architecture** with clear separation of concerns
- **Pure functions** for business logic (domain layer)
- **Idempotent operations** for all database mutations
- **Type safety** preferred but strict mode disabled (legacy)
- **Server components** by default; client components marked with `"use client"`

## TypeScript

### Configuration
- Target: ES5
- Module: ESNext
- Module Resolution: Bundler
- Strict: **false** (legacy - gradually improving)
- JSX: react-jsx (React 19 automatic runtime)

### Type Conventions
- Use TypeScript types, avoid `any` where possible
- Prefer interfaces for object shapes
- Use type aliases for unions and primitives
- Export types alongside implementations
- Use Valibot's `InferOutput<>` for schema-derived types

### Naming Conventions
```typescript
// Interfaces/Types - PascalCase
interface TeacherData {}
type ConfigID = string;

// Functions - camelCase
function generateConfigID() {}
export async function getTeachers() {}

// Server Actions - camelCase with descriptive names
export async function createSemester() {}
export async function validateConfigID() {}

// Constants - UPPER_SNAKE_CASE or PascalCase
const MAX_PERIODS = 8;
const DefaultConfig = {...};

// Components - PascalCase
export default function TeacherTable() {}

// Files - kebab-case for utilities, PascalCase for components
// teacher-validation.service.ts
// TeacherTable.tsx
```

### Path Aliases
```typescript
@/           // Root (src/)
@/features   // Feature modules
@/components // Shared components
@/lib        // Utilities
@/prisma/generated       // Prisma client
@/prisma/generated/edge  // Prisma edge client (for Accelerate)
```

## Code Organization

### Feature Structure
```
features/semester/
├── application/
│   ├── actions/          # Server actions (async, "use server")
│   │   └── semester.actions.ts
│   └── schemas/          # Valibot validation schemas
│       └── semester.schemas.ts
├── domain/
│   └── services/         # Pure business logic functions
│       └── semester-validation.service.ts
├── infrastructure/
│   └── repositories/     # Database access layer
│       └── semester.repository.ts
└── presentation/         # (optional) UI-specific code
    ├── components/
    ├── hooks/
    └── stores/
```

### Domain Layer Rules
- **Pure functions only** - no side effects
- **No database access** - use repository pattern
- **Validation returns**: `string | null` (error message or null)
- **Clear function names**: `validateConfigExists()`, `checkDuplicateConfig()`

### Repository Layer
- Export named functions/objects, not classes
- Use Prisma client singleton
- Idempotent operations (upsert, skipDuplicates)
- Return domain types, not Prisma types directly

### Action Layer (Server Actions)
- Mark with `"use server"` directive
- Return `ActionResult<T>` pattern:
  ```typescript
  type ActionResult<T> = {
    success: boolean;
    data?: T;
    error?: string;
  };
  ```
- Validate input with Valibot schemas
- Call domain services for business logic
- Call repositories for data access
- Wrap in try-catch with user-friendly errors

## React Components

### File Structure
```tsx
// Imports - grouped logically
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { Button } from "@mui/material";
import { customUtil } from "@/lib/utils";

// Types/Interfaces
interface TeacherTableProps {
  teachers: Teacher[];
  semester: string;
}

// Component
export default function TeacherTable({ teachers, semester }: TeacherTableProps) {
  // Hooks at top
  const [selected, setSelected] = useState<number[]>([]);
  
  // Event handlers
  const handleSelect = (id: number) => {
    setSelected(prev => [...prev, id]);
  };
  
  // Render
  return <div>...</div>;
}
```

### Component Conventions
- Default export for page components
- Named exports for reusable components
- Props interface defined above component
- Server components by default (no `"use client"` unless needed)
- Client components: state, effects, event handlers, browser APIs

### Async Components (Server)
```tsx
export default async function DashboardPage({
  params,
}: {
  params: Promise<{ semesterAndyear: string }>;
}) {
  const { semesterAndyear } = await params;
  // Await data fetching
  const data = await fetchData();
  return <div>{data}</div>;
}
```

## Validation

### Valibot Schemas
```typescript
import * as v from 'valibot';

export const createConfigSchema = v.object({
  ConfigID: v.pipe(
    v.string('ConfigID ต้องเป็นข้อความ'),
    v.nonEmpty('ConfigID ต้องไม่เป็นค่าว่าง'),
    v.regex(/^[1-3]-\d{4}$/, 'ConfigID ต้องมีรูปแบบ "SEMESTER-YEAR"')
  ),
  AcademicYear: v.pipe(
    v.number('ปีการศึกษาต้องเป็นตัวเลข'),
    v.integer('ปีการศึกษาต้องเป็นจำนวนเต็ม'),
    v.minValue(2500, 'ปีการศึกษาต้องไม่น้อยกว่า 2500')
  ),
});

export type CreateConfigInput = v.InferOutput<typeof createConfigSchema>;
```

### Error Messages
- Use **Thai language** for user-facing errors
- Use **English** for developer errors (console, logs)
- Provide actionable error messages

## Database (Prisma)

### Client Usage
```typescript
import prisma from '@/lib/prisma'; // Singleton client

// Idempotent create
await prisma.timeslot.createMany({
  data: timeslots,
  skipDuplicates: true,
});

// Upsert for updates
await prisma.table_config.upsert({
  where: { ConfigID: configId },
  update: { Config: newConfig },
  create: { ConfigID: configId, Config: newConfig },
});
```

### Migrations
- Run `pnpm prisma migrate dev` after schema changes
- Always name migrations descriptively
- Never edit migration files manually
- Run `pnpm prisma generate` after schema changes

### Seeding
- Idempotent seed functions
- Use `skipDuplicates: true` for createMany
- Check existence before creating

## Styling

### Tailwind CSS v4
- Utility-first approach
- Use `@apply` sparingly
- Responsive modifiers: `md:`, `lg:`, `xl:`
- Dark mode: (not currently implemented)

### MUI v7
- Use theme customization in `src/app/theme.ts`
- Prefer MUI components for consistency
- Override styles with `sx` prop
```tsx
<Button sx={{ mb: 2, bgcolor: 'primary.main' }}>
  Save
</Button>
```

## Testing

### Unit Tests (Jest)
- Located in `__test__/` directory
- Test pure functions (domain services)
- Test validation logic
- Mock Prisma client for repository tests
```typescript
describe('generateConfigID', () => {
  it('should generate ConfigID in SEMESTER-YEAR format', () => {
    expect(generateConfigID('1', 2567)).toBe('1-2567');
  });
});
```

### E2E Tests (Playwright)
- Located in `e2e/` directory
- Test critical user flows
- Test all seeded semesters
- Check for console errors
```typescript
test('should display dashboard for 1-2567', async ({ page }) => {
  await page.goto('/dashboard/1-2567/all-timeslot');
  await expect(page.locator('table')).toBeVisible();
});
```

## Comments & Documentation

### JSDoc for Public Functions
```typescript
/**
 * Generate ConfigID from semester number and academic year
 * Format: "SEMESTER-YEAR" (e.g., "1-2567", "2-2568")
 * Pure function for deterministic ConfigID generation
 */
export function generateConfigID(semesterNum: string, academicYear: number): string {
  return `${semesterNum}-${academicYear}`;
}
```

### Inline Comments
- Explain **why**, not what
- Use for complex business logic
- Mark TODOs with `// TODO:` and issue reference
```typescript
// Check for conflicts with existing schedules
// Required by business rule: no teacher can teach two classes simultaneously
const conflicts = await checkTeacherConflicts(teacherId, timeslotId);
```

## Git Conventions

### Commit Messages
```
<type>: <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring (no behavior change)
- `test`: Adding tests
- `docs`: Documentation only
- `style`: Formatting, semicolons, etc.
- `perf`: Performance improvements
- `chore`: Maintenance, deps

**Examples:**
```
feat: add timeslot seeding to seed API

- Add seedTimeslots() function for baseline timeslot creation
- Add seedData query parameter support
- Update production seed script with -SeedData flag

Closes #123
```

## Performance

### Database Queries
- Use `select` to limit fields
- Use `include` sparingly
- Add indexes for frequently queried fields
- Batch operations when possible (createMany, deleteMany)

### Server Components
- Fetch data at component level
- Use Suspense for loading states
- Prefer server components for data-heavy pages

### Client Components
- Use `useMemo` for expensive computations
- Use `useCallback` for stable function references
- Lazy load heavy components

## Security

### Authentication
- All admin routes require authentication
- Check session server-side
- Use NextAuth session management

### API Routes
- Validate all inputs with Valibot
- Check permissions before mutations
- Use SEED_SECRET for production seed endpoints

### Environment Variables
- Never commit `.env` files
- Use Vercel environment variables for production
- Validate env vars at runtime when critical
