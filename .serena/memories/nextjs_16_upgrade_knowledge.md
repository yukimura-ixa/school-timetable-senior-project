# Next.js 16 Upgrade Knowledge

## Current Project Status
- **Version**: Next.js 16.0.1 (stable) ✅
- **Already Upgraded**: Yes, project is on stable Next.js 16
- **Async APIs**: Using async `cookies()`, `headers()`, `draftMode()` correctly
- **Turbopack**: Default bundler (--turbopack flags removed)
- **TypeScript**: 5.8.3 (meets 5.1+ requirement)
- **Package Manager**: pnpm

## Key Next.js 16 Features in Use

### 1. Server Actions Pattern
```typescript
// Standard return type for all Server Actions
export interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: unknown;
    field?: string;
  };
}

// Using with SWR in client components
const { data } = useSWR(...)
const hasError = !data || ('success' in (data as object) && !(data as ActionResult<unknown>).success);
const response = data as ActionResult<DataType> | undefined;
```

### 2. Async Request APIs (Mandatory in Next.js 16)
These APIs are now **async** and must be awaited:
- `await cookies()`
- `await headers()`
- `await draftMode()`
- `await params` (in page/layout props)
- `await searchParams` (in page props)

### 3. Type-Safe SWR Error Handling Pattern
```typescript
// ❌ OLD (unsafe in Next.js 16):
const { data, error } = useSWR(...)
if (error) { ... }

// ✅ NEW (type-safe):
const { data } = useSWR(...)
const hasError = !data || ('success' in (data as object) && !(data as ActionResult<unknown>).success);
```

### 4. Cache Invalidation APIs
- **`updateTag(tag)`**: Use in Server Actions for immediate consistency (read-your-own-writes)
- **`revalidateTag(tag, 'max')`**: Use in Route Handlers for background invalidation (requires profile parameter in v16)

### 5. Middleware → Proxy Migration
- File rename: `middleware.ts` → `proxy.ts`
- Export rename: `export function middleware` → `export function proxy`
- Config renames:
  - `experimental.middlewarePrefetch` → `experimental.proxyPrefetch`
  - `experimental.middlewareClientMaxBodySize` → `experimental.proxyClientMaxBodySize`

### 6. Image Configuration Changes
Default value changes in Next.js 16:
- `minimumCacheTTL`: 60s → 14400s (4 hours)
- `qualities`: [1..100] → [75]
- `imageSizes`: removed 16
- `dangerouslyAllowLocalIP`: now false by default
- `maximumRedirects`: unlimited → 3

### 7. Parallel Routes Requirement
All parallel route slots (folders starting with `@`) must have `default.js` files, except `@children`.

### 8. Removed Features
- **AMP support**: Completely removed (`useAmp` hook, `amp` config)
- **Runtime config**: `serverRuntimeConfig` and `publicRuntimeConfig` removed (use `.env` files)
- **PPR flags**: `experimental.ppr` removed (use `experimental.cacheComponents`)
- **`unstable_rootParams()`**: Removed (use params from props)
- **Automatic scroll-behavior**: Must explicitly add `data-scroll-behavior="smooth"` to `<html>`

### 9. ESLint Changes
- Build no longer runs linting automatically
- `@next/eslint-plugin-next` defaults to ESLint Flat Config (v10 format)
- ESLint config removed from `next.config.js` (use `.eslintrc.json` or `eslint.config.js`)

### 10. Build Improvements (Automatic)
- Turbopack is default (no `--turbopack` flag needed)
- Separate output directories for `dev` and `build` (enables concurrent execution)
- Lockfile mechanism prevents conflicts from concurrent builds
- Native TypeScript config support with `--experimental-next-config-strip-types`

## Browser Verification Best Practice
**CRITICAL**: Always use browser automation (browser_eval MCP tool) for page verification, NOT curl or HTTP requests:

✅ **Browser automation detects:**
- Runtime errors
- Hydration issues
- Client-side JavaScript problems
- Console errors and warnings
- Actual user experience

❌ **curl/HTTP only checks:**
- HTTP status codes (misses all JavaScript issues)

## Common Type Safety Patterns

### Type-Safe Memoization with ActionResult
```typescript
const classData = useMemo((): ScheduleEntry[] => {
  const response = classDataResponse as ActionResult<ScheduleEntry[]> | undefined;
  if (!response || !response.success || !response.data) {
    return [];
  }
  return response.data;
}, [classDataResponse]);
```

### Type-Safe Error Flags
```typescript
const hasTimeslotError = !timeslotResponse || 
  ('success' in (timeslotResponse as object) && 
  !(timeslotResponse as ActionResult<unknown>).success);
```

## Project-Specific Patterns

### Action Wrapper (src/shared/lib/action-wrapper.ts)
All Server Actions use `createAction()` wrapper that:
- Handles authentication checking
- Performs input validation with Valibot
- Provides structured error handling
- Returns standardized `ActionResult<T>` format

### Error Handling Convention
```typescript
export const ActionErrorCode = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  FORBIDDEN: 'FORBIDDEN',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;
```

## Known Issues and Solutions

### Issue: SWR Error Destructuring
SWR's `error` object is always typed as `any`, causing lint errors.

**Solution**: Don't destructure error; compute error flags from response shape:
```typescript
const { data } = useSWR(...) // Don't destructure 'error'
const hasError = !data || ('success' in (data as object) && !(data as ActionResult<unknown>).success);
```

### Issue: Unnecessary Type Assertions
TypeScript may complain about unnecessary type assertions when the inferred type already matches.

**Solution**: Use type guards with runtime checks:
```typescript
const response = data;
const result = (response && typeof response === 'object' && 
  'success' in response && response.success && 
  'data' in response && response.data) 
  ? response.data 
  : undefined;
```

## Resources
- Official upgrade guide: [Next.js 16 Upgrade](https://nextjs.org/docs/app/building-your-application/upgrading/version-16)
- Codemod: `npx @next/codemod@canary upgrade latest`
- Async API migration: All request APIs now async
- Browser verification: Use `browser_eval` MCP tool for real browser testing

## Related Memories
- `current_lint_and_type_status_nov2025` - Latest lint/type error status
- `code_style_conventions` - Project TypeScript conventions
- `project_overview` - Overall architecture
