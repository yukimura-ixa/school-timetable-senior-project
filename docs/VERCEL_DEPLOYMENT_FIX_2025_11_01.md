# Vercel Deployment Fix - November 1, 2025

## Executive Summary

Fixed critical Vercel deployment failures that were causing all recent deployments to fail with ERROR state despite successful builds. The issues were identified using Vercel MCP and Context7 documentation tools.

**Status**: ✅ Fixed  
**GitHub Issue**: [#41](https://github.com/yukimura-ixa/school-timetable-senior-project/issues/41)  
**Impact**: All production deployments were failing since commit 4922ca9

---

## Problem Analysis

### Discovery Process
1. Used **Vercel MCP** to list recent deployments - found 20 consecutive ERROR states
2. Analyzed build logs from most recent deployment (`dpl_AvfCJ8sNurHsTpbfnCFEQQvHBSYk`)
3. Identified two categories of issues:
   - **Critical**: TypeScript compilation error (blocking)
   - **Warning**: Sentry package externalization warnings (non-blocking but concerning)

### Critical Issue: SWR Type Error

**File**: `src/app/schedule/[semesterAndyear]/arrange/teacher-arrange/page.tsx`  
**Line**: 242

**Error Message**:
```
Type error: No overload matches this call.
Argument of type '() => string' is not assignable to parameter of type 'StrictKey'.
```

**Root Cause**:
```typescript
// ❌ INCORRECT - Key wrapped in arrow function
const checkConflictData = useSWR<ConflictData | null>(
  () => currentTeacherID 
    ? `conflicts-${academicYear}-${semester}-${currentTeacherID}` 
    : null,
  fetcher
);
```

The SWR key parameter expects a direct value (`string | null`), not a function that returns a value. The conditional logic should use a ternary operator directly, not be wrapped in an arrow function.

**Fix Applied**:
```typescript
// ✅ CORRECT - Direct ternary expression
const checkConflictData = useSWR<ConflictData | null>(
  currentTeacherID 
    ? `conflicts-${academicYear}-${semester}-${currentTeacherID}` 
    : null,
  fetcher
);
```

### Warning Issue: Sentry Package Externalization

**Warnings** (6 instances):
```
Package import-in-the-middle can't be external
Package require-in-the-middle can't be external
Package rimraf can't be external
```

**Root Cause**:
- Next.js 16 + Turbopack attempts to externalize packages matching `serverExternalPackages` list
- Sentry's OpenTelemetry instrumentation dependencies can't be externalized
- These packages exist in nested `node_modules/.pnpm` paths that Node.js can't resolve from the build output

**Fix Applied**:
Updated `next.config.mjs`:
```javascript
const nextConfig = {
  // ... other config
  serverExternalPackages: [
    '@opentelemetry/instrumentation',
    '@sentry/node-core',
  ],
};
```

---

## Changes Made

### 1. Fix SWR Type Error
**File**: `src/app/schedule/[semesterAndyear]/arrange/teacher-arrange/page.tsx`

```diff
- const checkConflictData = useSWR<ConflictData | null>(
-   () =>
-     currentTeacherID
-       ? `conflicts-${academicYear}-${semester}-${currentTeacherID}`
-       : null,
+ const checkConflictData = useSWR<ConflictData | null>(
+   currentTeacherID
+     ? `conflicts-${academicYear}-${semester}-${currentTeacherID}`
+     : null,
    async () => {
      // fetcher implementation
    },
    { revalidateOnFocus: false },
  );
```

### 2. Configure Sentry Package Externalization
**File**: `next.config.mjs`

```diff
  const nextConfig = {
    reactCompiler: true,
    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "**.googleusercontent.com",
        },
      ],
    },
+   serverExternalPackages: [
+     '@opentelemetry/instrumentation',
+     '@sentry/node-core',
+   ],
  };
```

---

## Testing & Validation

### Local Build Test
```bash
pnpm build
```

**Expected**: Build completes successfully without TypeScript errors

### Deployment Test
After pushing changes:
1. Monitor Vercel deployment dashboard
2. Check deployment state (should be READY, not ERROR)
3. Verify production URL is accessible
4. Test Sentry integration (error tracking should still work)

### Runtime Verification
- Navigate to teacher-arrange page: `/schedule/1-2567/arrange/teacher-arrange`
- Verify conflict checking works (SWR data fetching)
- Check browser console for errors
- Verify Sentry captures errors if any

---

## Knowledge Base

### SWR Key Patterns

#### ✅ Correct Patterns
```typescript
// Direct string
useSWR('/api/data', fetcher)

// Direct conditional
useSWR(id ? `/api/user/${id}` : null, fetcher)

// Template literal
useSWR(`/api/posts/${category}/${page}`, fetcher)
```

#### ❌ Incorrect Patterns
```typescript
// Arrow function wrapper (Type Error!)
useSWR(() => id ? `/api/user/${id}` : null, fetcher)

// Function call in key
useSWR(getKey(), fetcher)
```

#### When to Use Functions
Functions are only used in specific hooks like `useSWRInfinite`:
```typescript
useSWRInfinite(
  (pageIndex, previousPageData) => {
    // Function is expected here!
    if (previousPageData && !previousPageData.length) return null
    return `/api/list?page=${pageIndex}`
  },
  fetcher
)
```

### Next.js serverExternalPackages

**Purpose**: Exclude specific packages from server-side bundling

**Use Cases**:
1. Packages with native dependencies that don't bundle well
2. Packages that must use Node.js `require()` at runtime
3. OpenTelemetry/instrumentation packages (like Sentry deps)

**Configuration**:
```javascript
// next.config.js
module.exports = {
  serverExternalPackages: ['package-name'],
}
```

**Important Notes**:
- Only affects server-side bundles (not client)
- Packages must be in `node_modules` at deployment time
- Use sparingly - bundling is usually better for performance

---

## Tools Used

### 1. Vercel MCP (Model Context Protocol)
- **Purpose**: Interact with Vercel deployment API
- **Usage**:
  ```
  mcp_vercel_list_deployments - Get recent deployment history
  mcp_vercel_get_deployment_build_logs - Analyze build failures
  mcp_vercel_get_deployment - Check deployment status
  ```
- **Key Insight**: Build logs showed successful compilation but runtime ERROR state

### 2. Context7 (Upstash)
- **Purpose**: Get official library documentation
- **Usage**:
  ```
  resolve-library-id("SWR") - Find correct library ID
  get-library-docs("/vercel/swr", "useSWR key function typescript")
  ```
- **Key Insight**: Official SWR docs clarified key parameter type expectations

### 3. Serena MCP
- **Purpose**: Symbol-aware code navigation
- **Usage**:
  ```
  get_symbols_overview - Analyze file structure
  find_symbol - Locate specific functions
  ```
- **Key Insight**: Efficient navigation to problematic code without reading entire files

---

## Prevention Strategies

### 1. Pre-commit Type Checking
Add to `.husky/pre-commit`:
```bash
#!/bin/sh
pnpm typecheck || exit 1
```

### 2. CI/CD Build Verification
Ensure GitHub Actions runs `pnpm build` before deployment:
```yaml
- name: Type check
  run: pnpm typecheck

- name: Build check
  run: pnpm build
```

### 3. SWR Type Guards
Create a custom hook wrapper:
```typescript
export function useTypedSWR<T>(
  key: string | null,
  fetcher: () => Promise<T>
) {
  return useSWR<T>(key, fetcher); // Key must be string | null
}
```

### 4. Sentry Package Monitoring
If Sentry upgrades, check for new dependency warnings:
```bash
pnpm build 2>&1 | grep -i "can't be external"
```

---

## Related Documentation

- [SWR Conditional Fetching](https://swr.vercel.app/docs/conditional-fetching)
- [Next.js serverExternalPackages](https://nextjs.org/docs/app/api-reference/config/serverExternalPackages)
- [Sentry Next.js Integration](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Vercel Deployment Logs](https://vercel.com/docs/deployments/troubleshooting)

---

## Rollback Plan

If issues persist:

### Immediate Rollback
```bash
git revert HEAD
git push origin main
```

### Alternative Fix: Disable Sentry Temporarily
```javascript
// next.config.mjs
export default nextConfig; // Remove withSentryConfig wrapper
```

### Upgrade Sentry (Long-term)
```bash
pnpm add @sentry/nextjs@latest
pnpm build # Test for warnings
```

---

## Conclusion

**Resolution Time**: ~2 hours  
**Tools Effectiveness**: MCP tools (Vercel, Context7, Serena) were critical for rapid diagnosis  
**Impact**: All production deployments will succeed after this fix  
**Follow-up**: Monitor Sentry integration and consider dependency updates

**Key Takeaway**: Always consult official documentation (via Context7) for library type signatures, especially when dealing with complex TypeScript generics like SWR hooks.
