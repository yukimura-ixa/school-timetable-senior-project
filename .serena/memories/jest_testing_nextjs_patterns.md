# Jest Testing Patterns for Next.js 16

## Official Next.js Jest Setup

Based on: https://nextjs.org/docs/app/guides/testing/jest

### Key Configuration Points

1. **Use `next/jest` transformer** - Handles all Next.js-specific configurations automatically
2. **Test environment: jsdom** - For React component testing
3. **Setup file for custom matchers** - `jest.setup.js` with `@testing-library/jest-dom`

### Important Limitations

**Async Server Components NOT Supported:**

> "Since `async` Server Components are new to the React ecosystem, Jest currently does not support them. While you can still run unit tests for synchronous Server and Client Components, we recommend using an E2E tests for `async` components."

**Implications:**

- Unit tests work for synchronous Server Components and Client Components
- Async Server Components should use E2E tests (Playwright)
- This is an ecosystem limitation, not a configuration issue

### Recommended Testing Strategy

1. **Unit Tests (Jest)** - Pure business logic, validation, synchronous components
2. **E2E Tests (Playwright)** - Full user flows, async server components, API routes

## Current Project Status

### Jest Configuration (✅ CORRECT)

```typescript
// jest.config.js
const nextJest = require("next/jest");
const createJestConfig = nextJest({ dir: "./" });

const customJestConfig = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};

module.exports = createJestConfig(customJestConfig);
```

### Mock Setup Pattern (✅ FIXED)

**Global Mock (jest.setup.js):**

```typescript
jest.mock("@/lib/prisma", () => ({
  default: {
    table: {
      findMany: jest.fn().mockResolvedValue([]),
      // ... other methods
    },
  },
}));
```

**Test File Usage:**

```typescript
// CORRECT: Use typed reference, don't duplicate jest.mock
const mockTable = prisma.table as jest.Mocked<typeof prisma.table>;

beforeEach(() => {
  mockTable.findMany.mockResolvedValue(testData);
  // OR for already-initialized mocks:
  (mockTable.findMany as jest.Mock).mockImplementation(() =>
    Promise.resolve(testData),
  );
});
```

**AVOID:**

```typescript
// WRONG: Duplicate jest.mock causes conflicts
jest.mock("@/lib/prisma"); // Already mocked globally!

// WRONG: Can't chain mockResolvedValue on initialized mocks
mockTable.findMany.mockResolvedValue(data); // May fail if already initialized
```

## Common Test Patterns

### Repository Tests

```typescript
describe("Repository", () => {
  const mockTable = prisma.table as jest.Mocked<typeof prisma.table>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch data", async () => {
    mockTable.findMany.mockResolvedValue([{ id: 1 }] as any);
    const result = await repository.fetchData();
    expect(result).toHaveLength(1);
  });
});
```

### Service Tests (Pure Logic)

```typescript
describe("Service", () => {
  it("should validate input correctly", () => {
    const input = {
      /* test data */
    };
    const result = service.validate(input);
    expect(result.isValid).toBe(true);
  });
});
```

### Component Tests (Synchronous Only)

```typescript
import { render, screen } from '@testing-library/react';

describe('Component', () => {
  it('should render content', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

## Test Fixture Best Practices

### Create Helper Functions

```typescript
const createTestInput = (overrides = {}) => ({
  requiredField1: "default",
  requiredField2: "default",
  // ... all required fields with defaults
  ...overrides,
});

// Usage
const input = createTestInput({ requiredField1: "custom" });
```

### Match Service Interface Exactly

```typescript
// Service expects: { availableGrades, availableTimeslots }
// Test must provide: { availableGrades, availableTimeslots }
// NOT: { grades, timeslots } ❌
```

## Debugging Tips

1. **"mockResolvedValue is not a function"** → Use `mockImplementation(() => Promise.resolve(...))`
2. **"Cannot read properties of undefined"** → Check fixture data structure matches service interface
3. **Duplicate mock warnings** → Remove `jest.mock()` from test files, use global mock
4. **Type errors** → Use `jest.Mocked<typeof module>` for proper typing

## Resources

- [Next.js Jest Guide](https://nextjs.org/docs/app/guides/testing/jest)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Playground](https://testing-playground.com/)
