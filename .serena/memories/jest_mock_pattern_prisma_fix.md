# Jest Mock Pattern for Prisma in This Project

## Issue Resolved

Fixed Jest mock re-initialization errors across test files (Issue #39).

## Root Cause

The global Prisma mock in `jest.setup.js` creates **pre-configured** mock functions:

```typescript
// jest.setup.js (lines 97-180)
mockPrisma = {
  class_schedule: {
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({} as any),
    update: jest.fn().mockResolvedValue({} as any),
    delete: jest.fn().mockResolvedValue({} as any),
    // ... other methods
  },
  // ... other tables
};
```

**These pre-configured mocks cannot be chained** with `.mockResolvedValue()` or `.mockImplementation()` because Jest doesn't allow modifying already-configured mock return values.

## The Working Pattern

### ✅ CORRECT - Direct Assignment

Replace the entire mock function with a fresh `jest.fn()`:

```typescript
// Direct assignment creates a NEW mock function
mockPrisma.table.method = jest.fn(() => Promise.resolve(data));
```

### ❌ WRONG - Chaining Methods

These patterns fail with "mockImplementation is not a function":

```typescript
// ❌ Cannot chain on pre-configured mock
mockPrisma.table.method.mockImplementation(() => Promise.resolve(data));
mockPrisma.table.method.mockResolvedValue(data);

// ❌ Casting doesn't help
(mockPrisma.table.method as jest.Mock).mockImplementation(() =>
  Promise.resolve(data),
);
```

## According to Jest Official Docs

From Context7 Jest documentation:

1. **mockImplementation()**: "Replaces the implementation of a mock function" - but only works on mocks that haven't been pre-configured
2. **mockResolvedValue()**: Shorthand for `jest.fn().mockImplementation(() => Promise.resolve(value))` - must be called on the mock creation, not after
3. **Direct assignment**: When you need to replace a pre-configured mock, assign a new `jest.fn()` directly

## Why Direct Assignment Works

```typescript
// This creates a FRESH mock function with NO pre-configured behavior
mockPrisma.table.method = jest.fn(() => Promise.resolve(data));
```

- Creates new `jest.fn()` instance
- No pre-existing configuration to conflict with
- Implementation defined inline as arrow function
- Returns Promise directly (works with async/await)
- Compatible with TypeScript mocking system

## Examples by Use Case

### Single Value Return

```typescript
// Return empty array
mockClassSchedule.findMany = jest.fn(() => Promise.resolve([]));

// Return null
mockClassSchedule.findUnique = jest.fn(() => Promise.resolve(null));

// Return mock object
mockClassSchedule.create = jest.fn(() => Promise.resolve({ id: 1 } as any));
```

### Complex Data Return

```typescript
mockClassSchedule.findMany = jest.fn(() =>
  Promise.resolve([
    {
      ClassID: "C_M1-1_T1_MATH101",
      TimeslotID: "T1",
      SubjectCode: "MATH101",
      // ... more fields
    },
  ]),
);
```

### Multiple Mocks in One Test

```typescript
beforeEach(() => {
  jest.clearAllMocks();
});

it("should handle complex scenario", async () => {
  // Set up multiple mocks
  mockClassSchedule.findMany = jest.fn(() => Promise.resolve([]));
  mockTeachersResp.findMany = jest.fn(() => Promise.resolve([mockTeacher]));
  mockClassSchedule.findUnique = jest.fn(() => Promise.resolve(null));
  mockClassSchedule.create = jest.fn(() => Promise.resolve(mockSchedule));

  // Run test
  const result = await myFunction();

  // Assertions
  expect(result).toBeDefined();
});
```

## Files Fixed (Issue #39)

1. **conflict.repository.test.ts** (8 instances)
   - Also removed duplicate local mock (lines 7-15)
   - All 8 tests passing

2. **schedule.repository.test.ts** (10 instances)
   - All 10 tests passing

3. **schedule-arrangement.actions.test.ts** (18 instances)
   - All 11 tests passing

**Total: 36 instances fixed, 29 tests passing**

## When to Use Each Pattern

### Use Direct Assignment (`= jest.fn(...)`) When:

- ✅ Working with pre-configured global mocks (like our Prisma mock)
- ✅ Need to replace mock behavior in individual tests
- ✅ Getting "mockImplementation is not a function" errors
- ✅ Mock was created in jest.setup.js with `.mockResolvedValue()`

### Use `.mockImplementation()` When:

- ✅ Creating NEW mock from scratch: `const mock = jest.fn().mockImplementation(...)`
- ✅ Mock is defined locally in test file without pre-configuration
- ✅ Need to chain multiple configurations: `.mockImplementationOnce().mockImplementationOnce()`

### Use `.mockResolvedValue()` When:

- ✅ Creating NEW async mock: `const mock = jest.fn().mockResolvedValue(data)`
- ✅ Simpler async pattern without custom logic
- ✅ Mock is not pre-configured

## Testing Best Practices Applied

1. **Always clear mocks**: Use `jest.clearAllMocks()` in `beforeEach()`
2. **Isolate tests**: Each test should set up its own mocks
3. **Direct assignment**: Use `= jest.fn(() => ...)` for pre-configured mocks
4. **Type safety**: Accept `as any` where Prisma types are complex (test code only)
5. **Verify calls**: Use `expect(mockFn).toHaveBeenCalledWith(...)` to verify behavior

## Related Files

- `jest.setup.js`: Global Prisma mock configuration (lines 97-180)
- All `*.test.ts` files using Prisma: Should follow this pattern
- GitHub Issue #39: Documented full resolution process

## Future Considerations

If we ever need to modify jest.setup.js to NOT pre-configure mocks:

```typescript
// Alternative setup (NOT currently used)
mockPrisma = {
  class_schedule: {
    findMany: jest.fn(), // No .mockResolvedValue()
    findUnique: jest.fn(),
    // ... etc
  },
};
```

This would allow `.mockResolvedValue()` to work, but breaks existing tests that expect empty arrays/null by default.

**Current pattern (direct assignment) is the correct approach for our codebase.**
