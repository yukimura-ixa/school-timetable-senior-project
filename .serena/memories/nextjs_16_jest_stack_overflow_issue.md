# Next.js 16 + Jest Stack Overflow Issue

## Problem Description

**Status**: Known Issue (Next.js 16.0.1 + Jest 29.7.0 incompatibility)

When running Jest tests with Next.js 16, tests pass successfully but Jest does not exit cleanly. Instead, it throws a stack overflow error:

```
RangeError: Maximum call stack size exceeded
  at newAsyncId (node:internal/async_hooks:425:20)
  at setImmediate (node:timers:230:10)
  at setImmediate (node_modules/next/src/server/node-environment-extensions/unhandled-rejection.tsx:639:7)
  at listener (node_modules/next/src/server/node-environment-extensions/unhandled-rejection.tsx:635:9)
  ... collapsed 94 duplicate lines matching above 1 lines 94 times...
```

## Root Cause

Next.js 16's unhandled rejection handler in `node-environment-extensions/unhandled-rejection.tsx` creates infinite recursion when combined with Jest's async handling:

1. Unhandled rejections from Prisma mock (database connection errors) trigger Next.js handler
2. Next.js handler uses `setImmediate` recursively (line 639)
3. Jest's async hooks trigger more unhandled rejections  
4. Infinite loop → stack overflow

The handler code that causes the issue:
```typescript
// In Next.js unhandled-rejection.tsx:639
setImmediate(() => {
  // This creates infinite recursion with Jest
});
```

## Impact

- **Tests**: ✅ All tests pass (21/21 in config-lifecycle, 11/11 in schedule-arrangement, etc.)
- **Process**: ❌ Jest does not exit cleanly (stack overflow after test completion)
- **CI/CD**: May fail in CI if not using `--forceExit`

## Workarounds

### Option 1: Use --forceExit Flag (Recommended)

Add to jest.config.js:
```javascript
module.exports = {
  // ... other config
  forceExit: true, // Force Jest to exit after tests complete
};
```

Or use CLI flag:
```bash
pnpm test --forceExit
```

**Pros**: Tests run and exit cleanly  
**Cons**: May hide legitimate async operation leaks

### Option 2: Accept the Error

Tests pass, but process exits with error code 1. CI/CD will fail.

**Pros**: No config changes  
**Cons**: Red output, CI failures

### Option 3: Mock the Next.js Module (Attempted - Failed)

Attempted to mock the unhandled rejection module:
```javascript
// In jest.setup.js
jest.mock('next/dist/server/node-environment-extensions/unhandled-rejection', () => ({}), { virtual: true });
```

**Result**: Module still loads (Next.js imports it before Jest setup runs)

### Option 4: Stub setImmediate (Attempted - Failed)

Attempted to detect and break recursion in setImmediate:
```javascript
// In jest.setup.js
const originalSetImmediate = global.setImmediate;
global.setImmediate = function(callback, ...args) {
  const stackTrace = new Error().stack || '';
  if (stackTrace.includes('unhandled-rejection') && recursionDepth > 10) {
    return { _idleTimeout: -1 }; // Break recursion
  }
  return originalSetImmediate(callback, ...args);
};
```

**Result**: Next.js wraps setImmediate AFTER our setup, so our wrapper is bypassed

## Current Solution

**Using Option 1 (--forceExit) until Next.js fixes the upstream issue**

Update package.json scripts:
```json
{
  "scripts": {
    "test": "jest --forceExit",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage --forceExit"
  }
}
```

## Related Issues

- Next.js 16 + Jest compatibility: https://github.com/vercel/next.js/issues/... (to be filed)
- Similar pattern in Next.js < 16: Required `experimental.mcpServer: true` config
- Jest detectOpenHandles: Does not help (detects the issue but can't prevent it)

## Files Modified

- `jest.setup.js`: Lines 181-185 (attempted fixes, currently contains mock attempt)
- `__test__/config/config-lifecycle.actions.test.ts`: Added afterAll cleanup hook (lines 18-22)

## Test Status Summary

All tests passing across multiple files:
- `conflict.repository.test.ts`: 8/8 ✅
- `schedule.repository.test.ts`: 10/10 ✅
- `schedule-arrangement.actions.test.ts`: 11/11 ✅
- `config-lifecycle.actions.test.ts`: 21/21 ✅

**Total**: 50/50 tests passing ✅  
**Issue**: Stack overflow after completion ❌

## Next Steps

1. **Short-term**: Use `--forceExit` flag in jest.config.js
2. **Medium-term**: File issue with Next.js team
3. **Long-term**: Wait for Next.js 16.1+ fix or patch release

## Update Log

- 2025-01-XX: Issue discovered during Jest mock pattern fixes
- 2025-01-XX: Attempted multiple fixes (module mock, setImmediate guard)
- 2025-01-XX: Documented as known issue, recommending --forceExit workaround