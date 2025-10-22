# Code Style and Conventions

## TypeScript Configuration

### Current Settings (Intentionally Relaxed)
The project has **intentionally relaxed TypeScript settings** to avoid massive breaking changes:

```jsonc
{
  "strict": false,                    // Strict mode disabled
  "noUnusedLocals": false,           // Allow unused variables
  "noUnusedParameters": false,       // Allow unused parameters
  "noImplicitReturns": false,        // Allow implicit returns
  "noFallthroughCasesInSwitch": true // Prevent switch fallthrough
}
```

### Future Improvement Goal
During refactoring, progressively enable stricter TypeScript checks:
1. Enable `strict: true`
2. Enable `noUnusedLocals: true`
3. Enable `noUnusedParameters: true`
4. Enable `noImplicitReturns: true`
5. Eliminate all `any` types

## Naming Conventions

### Files & Directories
- **Components**: PascalCase (e.g., `TeacherTable.tsx`, `AddModalForm.tsx`)
- **Utilities**: camelCase (e.g., `parseUtils.ts`, `apiErrorHandling.ts`)
- **API Routes**: lowercase with hyphens (e.g., `route.ts` in directories)
- **Pages**: lowercase with hyphens or `page.tsx` (Next.js App Router)
- **Hooks**: camelCase with descriptive names (e.g., `teacherData.ts`, `useTeachers`)

### Variables & Functions
- **Variables**: camelCase (e.g., `teacherData`, `isLoading`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- **Functions**: camelCase (e.g., `fetchTeachers`, `checkConflict`)
- **React Components**: PascalCase (e.g., `TeacherTable`, `SearchBar`)
- **Interfaces/Types**: PascalCase (e.g., `Teacher`, `ClassSchedule`)

### Database Models (Prisma)
- **Table names**: snake_case (e.g., `class_schedule`, `teacher_responsibility`)
- **Column names**: PascalCase (e.g., `TeacherID`, `FirstName`, `SubjectCode`)
- **Relationships**: camelCase (e.g., `teacher`, `gradelevel`)

## Code Organization

### Component Structure
```tsx
// 1. Imports (external libraries first, then local)
import { useState } from "react";
import { Button } from "@mui/material";
import { CustomComponent } from "@/components/custom";

// 2. Types/Interfaces
interface ComponentProps {
  title: string;
  onAction: () => void;
}

// 3. Component Definition
export default function Component({ title, onAction }: ComponentProps) {
  // 4. State declarations
  const [state, setState] = useState();

  // 5. Effects and hooks
  useEffect(() => {}, []);

  // 6. Event handlers
  const handleClick = () => {};

  // 7. Render helpers
  const renderSection = () => {};

  // 8. Return JSX
  return <div>{/* ... */}</div>;
}
```

### API Route Structure
```typescript
// Current structure (to be refactored):
// - HTTP concerns mixed with Prisma queries and business logic
// - Direct Prisma calls in route handlers

// Future structure (Clean Architecture):
// - Separate handlers, services, and repositories
// - Use Server Actions for mutations
```

## Styling Conventions

### Tailwind CSS
- **Utility-first approach**: Use Tailwind utility classes
- **Custom CSS**: Avoid unless absolutely necessary
- **Responsive design**: Use Tailwind responsive prefixes (`sm:`, `md:`, `lg:`, etc.)
- **Accessibility**: Ensure proper color contrast and keyboard navigation

### Component Styling
```tsx
// Preferred: Tailwind utilities
<button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
  Click Me
</button>

// For complex/reusable styles: Extract to component
// For dynamic styles: Use clsx or cn utility
```

## Code Quality Standards

### Pure Functions
- **Prefer pure functions** for business logic (no side effects)
- **Constraint checks** should be pure and testable
- **Keep side effects at edges** (API boundaries, React effects)

### Error Handling
- **Consistent error handling** across all routes
- **Proper error types** (avoid generic `Error`)
- **User-friendly error messages**

### Testing
- **Table-driven tests** for business logic
- **Unit tests** for pure functions and utilities
- **Integration tests** for API routes
- **E2E tests** for critical user flows

### Comments & Documentation
- **Self-documenting code**: Prefer clear naming over comments
- **JSDoc comments**: For public APIs and complex functions
- **Inline comments**: Only when logic is non-obvious
- **README files**: In feature directories when needed

## Prisma Best Practices

### Schema as Single Source of Truth
- **All data models** defined in `schema.prisma`
- **Generate TypeScript types** after schema changes
- **Use Prisma relations** for data integrity

### Query Patterns
```typescript
// Preferred: Type-safe queries
const teacher = await prisma.teacher.findUnique({
  where: { TeacherID: id },
  include: { teachers_responsibility: true },
});

// Avoid: Raw SQL unless necessary
// Use: Prisma's transaction API for complex operations
```

### Idempotent Operations
- **Database operations should be safe to retry**
- **Use upsert** when appropriate
- **Handle concurrent updates** gracefully

## Import Aliases

### Path Aliases (tsconfig.json)
```typescript
// Use @/ alias for src/ directory
import { Teacher } from "@/types/teacher";
import { fetchData } from "@/functions/api";
import { Button } from "@/components/elements";
```

## Prettier Configuration

Current settings:
```json
{
  "semi": true,                 // Use semicolons
  "singleQuote": false,        // Use double quotes
  "trailingComma": "all",      // Trailing commas everywhere
  "bracketSameLine": false     // Closing brackets on new line
}
```

## Future Refactoring Goals

1. **Feature-Based Architecture**: Organize code by feature, not by type
2. **Clean Architecture**: Separate concerns (handlers, services, repositories)
3. **Zustand**: Centralized client state management
4. **Server Actions**: Replace API routes for mutations
5. **Strong TypeScript**: Enable strict mode, eliminate `any` types
6. **Pure Functions**: Extract business logic from components
7. **Consistent Patterns**: Standardize data fetching and error handling
