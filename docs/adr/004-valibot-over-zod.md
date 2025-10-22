# ADR 004: Valibot Over Zod for Runtime Validation

**Status**: Accepted
**Date**: 2025-10-21
**Deciders**: Solo Developer
**Supersedes**: Manual validation in API routes

---

## Context and Problem Statement

Current API routes have no input validation, leading to:
- Runtime errors from invalid data
- Poor error messages for users
- Type safety only at build time, not runtime
- No single source of truth for input schemas

We need a runtime validation library that works with TypeScript and is suitable for Next.js Server Actions.

**Question**: Which runtime validation library should we use?

---

## Decision Drivers

- **Bundle Size**: Important for client-side bundles
- **TypeScript Integration**: Type inference from schemas
- **Performance**: Fast validation
- **Tree-Shaking**: Only import what's used
- **Developer Experience**: Easy to write schemas
- **Error Messages**: Clear, user-friendly errors

---

## Considered Options

### Option 1: Manual Validation
**Bundle Size**: 0 KB

**Pros**:
- No additional dependencies
- Full control

**Cons**:
- Repetitive code
- Easy to miss validations
- No type inference
- Inconsistent error messages
- Not maintainable

### Option 2: Zod
**Bundle Size**: ~14 KB (minified)

**Pros**:
- Very popular (most used validation library)
- Excellent TypeScript integration
- Large community
- Many integrations

**Cons**:
- Large bundle size (~14 KB)
- Not modular (imports whole library)
- Slower than alternatives
- Not optimized for tree-shaking

**Example**:
```typescript
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  age: z.number().min(18),
});
```

### Option 3: Yup
**Bundle Size**: ~23 KB

**Pros**:
- Mature library
- Familiar API

**Cons**:
- Even larger than Zod
- Less TypeScript-focused
- Older design patterns

### Option 4: Valibot (CHOSEN)
**Bundle Size**: ~1.31 KB (for equivalent schemas)

**Pros**:
- **Extremely small**: 1-2 KB for typical usage
- **Modular**: Only bundle what you use
- **Fast**: Better runtime performance than Zod
- **Tree-shakeable**: Excellent for Next.js
- **TypeScript-first**: Great type inference
- **Modern API**: Functional, composable

**Cons**:
- Newer library (less mature)
- Smaller community than Zod
- Fewer resources/tutorials

**Example**:
```typescript
import * as v from 'valibot';

const schema = v.object({
  email: v.pipe(v.string(), v.email()),
  age: v.pipe(v.number(), v.minValue(18)),
});
```

---

## Decision Outcome

**Chosen option**: Valibot

### Rationale

1. **Bundle Size**: ~90% smaller than Zod (1.31 KB vs 14 KB)
2. **Performance**: Faster validation runtime
3. **Modularity**: Only import what you need
4. **Tree-Shaking**: Perfect for Next.js App Router
5. **Modern**: Functional API with `pipe` composition
6. **TypeScript**: Excellent type inference with `v.InferOutput<>`
7. **Future-Proof**: Better architecture for long-term

### When Bundle Size Matters

In Server Actions, validation code runs:
1. On the server (OK, larger bundles)
2. In client components that import actions (NOT OK if large)

With Valibot's modularity, we only ship the validators we actually use.

### API Comparison

```typescript
// Zod (14 KB base)
import { z } from 'zod';

const schema = z.object({
  email: z.string().email().max(100),
  password: z.string().min(8),
});

type Input = z.infer<typeof schema>;

// Valibot (1.31 KB for this)
import * as v from 'valibot';

const schema = v.object({
  email: v.pipe(v.string(), v.email(), v.maxLength(100)),
  password: v.pipe(v.string(), v.minLength(8)),
});

type Input = v.InferOutput<typeof schema>;
```

Both provide similar functionality, but Valibot bundles much smaller.

---

## Consequences

### Positive

1. ✅ **Smaller Bundles**: ~90% reduction in validation code size
2. ✅ **Faster Performance**: Better runtime validation speed
3. ✅ **Type Safety**: Runtime validation + compile-time types
4. ✅ **Better Errors**: Structured, actionable error messages
5. ✅ **Composable**: `pipe` makes complex validations clear
6. ✅ **Tree-Shaking**: Only bundle validators used

### Negative

1. ⚠️ **Learning Curve**: Different API from Zod (if team knows Zod)
2. ⚠️ **Less Resources**: Fewer tutorials and StackOverflow answers
3. ⚠️ **Newer**: Less battle-tested than Zod

### Mitigation

- Provide clear examples in shared schemas
- Document common patterns
- Create reusable schema builders
- For solo dev, learning curve is minimal

---

## Implementation

### Common Schemas

Create reusable schemas in `shared/schemas/`:

```typescript
// shared/schemas/common.schemas.ts
import * as v from 'valibot';

export const emailSchema = v.pipe(
  v.string(),
  v.nonEmpty('Email is required'),
  v.email('Invalid email format'),
  v.maxLength(100, 'Email too long')
);

export const idSchema = v.pipe(
  v.string(),
  v.nonEmpty('ID is required')
);

export const academicYearSchema = v.pipe(
  v.number(),
  v.minValue(2000),
  v.maxValue(2100)
);
```

### Feature Schemas

Each feature defines its own schemas:

```typescript
// features/schedule-arrangement/application/schemas/arrangement.schema.ts
import * as v from 'valibot';
import { idSchema, academicYearSchema } from '@/shared/schemas/common.schemas';

export const arrangeScheduleSchema = v.object({
  teacherId: idSchema,
  timeslotId: idSchema,
  subjectCode: idSchema,
  roomId: idSchema,
  gradeId: idSchema,
  academicYear: academicYearSchema,
  semester: v.pipe(v.number(), v.minValue(1), v.maxValue(2)),
});

export type ArrangeScheduleInput = v.InferOutput<typeof arrangeScheduleSchema>;
```

### Usage in Server Actions

```typescript
'use server';

import * as v from 'valibot';
import { createAction } from '@/shared/lib/action-wrapper';
import { arrangeScheduleSchema } from '../schemas/arrangement.schema';

export const arrangeScheduleAction = createAction(
  arrangeScheduleSchema,
  async (input) => {
    // input is fully typed and validated!
    const { teacherId, timeslotId } = input;
    // ... business logic
  }
);
```

### Error Handling

```typescript
const result = v.safeParse(schema, data);

if (!result.success) {
  // result.issues contains detailed error information
  console.log(result.issues);
  // [
  //   {
  //     kind: 'validation',
  //     type: 'email',
  //     message: 'Invalid email format',
  //     path: [{ key: 'email' }],
  //   }
  // ]
}
```

---

## Migration from Existing Code

Current API routes have no validation:
```typescript
// ❌ Before: No validation
const body = await req.json();
const { teacherId, timeslotId } = body; // Unsafe!
```

With Valibot:
```typescript
// ✅ After: Validated and typed
const input = v.parse(schema, data); // Throws if invalid
// or
const result = v.safeParse(schema, data); // Returns result object
```

---

## Links

- [Valibot Documentation](https://valibot.dev/)
- [Valibot vs Zod Comparison](https://valibot.dev/guides/comparison/)
- [Valibot GitHub](https://github.com/fabian-hiller/valibot)

---

## Related ADRs

- ADR 001: Feature-Based Architecture
- ADR 003: Server Actions Over API Routes

---

## Notes

Valibot's modular design makes it perfect for Next.js App Router where bundle size matters. The functional `pipe` API also encourages composable, reusable validation logic.

If migrating from Zod in the future, the API is similar enough that migration would be straightforward (just refactor pipe chains).
