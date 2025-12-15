# Security Improvements Implementation Guide
**Date**: December 7, 2025  
**Effort**: Quick wins available (5-10 min each)

---

## Priority 1: HTTP Security Headers (5 min)

### Step 1: Update `next.config.mjs`

**Current**:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.googleusercontent.com" },
    ],
  },
};
export default nextConfig;
```

**Updated**:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.googleusercontent.com" },
    ],
  },
  
  // Security headers for defense-in-depth
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "geolocation=(), microphone=(), camera=()",
          },
        ],
      },
      // Optional: Stricter CSP for admin panel
      {
        source: "/dashboard/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

**What This Does**:
- `X-Frame-Options: DENY` - Prevents clickjacking attacks
- `X-Content-Type-Options: nosniff` - Prevents MIME type sniffing
- `X-XSS-Protection` - Legacy XSS filter for older browsers
- `Referrer-Policy` - Controls what referrer info is shared
- `Permissions-Policy` - Disables sensitive APIs (camera, microphone, geolocation)

**Verification**:
```bash
# After deployment, check headers:
curl -I https://your-domain.com
# Should see security headers in response
```

---

## Priority 2: Reduce Sensitive Logging (5 min)

### Step 1: Update `src/lib/prisma.ts`

**Current**:
```typescript
if (process.env.NODE_ENV !== "production") {
  // Avoid logging raw secrets; only log protocol + host
  const safeConnection = connectionString
    .replace(/:.+@/, ":***@")
    .substring(0, 80);
  console.warn("[PRISMA] Connecting to DB:", safeConnection);
}
```

**Updated**:
```typescript
if (process.env.NODE_ENV !== "production" && process.env.DEBUG_DB) {
  // Only log if explicitly enabled for debugging
  console.warn("[PRISMA] Database connection initialized");
}
```

**What Changed**:
- Removed URL logging entirely (no need to log connection)
- Made it opt-in via `DEBUG_DB` environment variable
- Generic message doesn't leak any system information

**To Enable Debugging** (if needed):
```bash
# Temporary, for debugging only:
export DEBUG_DB=true
pnpm dev
```

---

## Priority 3: Enhanced Seed Endpoint Logging (10 min)

### Step 1: Add Audit Logging

**Location**: `src/app/api/admin/seed-semesters/route.ts`

**Add After Line 7**:
```typescript
/**
 * Audit log for admin seed operations
 * Tracks who initiated seeding and when
 */
async function logSeedAudit(
  action: string,
  userId: string | null,
  status: "success" | "failure",
  details?: Record<string, unknown>,
) {
  // In production, this could write to:
  // - CloudWatch / Datadog
  // - Dedicated audit database
  // - Structured logging service
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    action,
    userId,
    status,
    details,
  };
  
  if (process.env.NODE_ENV === "production") {
    // Send to structured logging service
    console.info("[AUDIT]", JSON.stringify(logEntry));
  } else {
    // Local development
    console.log("[AUDIT]", logEntry);
  }
}
```

**Add to POST Handler** (after authentication checks):
```typescript
// Log the audit entry
await logSeedAudit(
  "SEED_SEMESTERS",
  session?.user?.id || null,
  "success",
  { years: targetYears, seedData },
);
```

**Benefits**:
- ✅ Tracks who ran seed operations
- ✅ Timestamp for investigation
- ✅ Non-sensitive operation details
- ✅ Helps with compliance audits

---

## Priority 4: Add security.txt (5 min)

### Step 1: Create `public/.well-known/security.txt`

**File**: `public/.well-known/security.txt`

```plaintext
Contact: security@example.com
Expires: 2026-12-07T00:00:00Z
Preferred-Languages: en, th
Canonical: https://your-domain.com/.well-known/security.txt

# Security Policy
# Please report security vulnerabilities to security@example.com
# https://your-domain.com/security-policy

# Supported signature algorithms
Signature: https://your-domain.com/.well-known/security.key.asc
```

**Step 2**: Update the contact email

```bash
# Replace example.com with your actual domain
sed -i 's/example.com/your-domain.com/g' public/.well-known/security.txt
```

**Benefits**:
- ✅ Standard security disclosure process
- ✅ Prevents security researchers from causing harm
- ✅ Shows professional security posture

---

## Priority 5: Add Rate Limiting to Public APIs (10 min)

### Current: Done for Auth
The authentication already has rate limiting:
```typescript
rateLimit: {
  enabled: process.env.NODE_ENV === "production" && !process.env.CI,
  window: 60,
  max: 50,
},
```

### Optional: Add Rate Limiting to Public Data Endpoints

**Location**: `src/lib/infrastructure/repositories/public-data.repository.ts`

**Add Simple Rate Limiter**:
```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Cached instance
let ratelimit: Ratelimit | null = null;

function getRatelimit(): Ratelimit | null {
  if (!process.env.UPSTASH_REDIS_REST_URL) {
    return null; // Not configured
  }

  if (!ratelimit) {
    ratelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(100, "1 h"), // 100 requests per hour
      analytics: true,
      prefix: "@upstash/ratelimit",
    });
  }

  return ratelimit;
}

export async function checkRateLimit(
  identifier: string,
): Promise<{ success: boolean }> {
  const rl = getRatelimit();
  if (!rl) {
    return { success: true }; // Skip if not configured
  }

  try {
    const { success } = await rl.limit(identifier);
    return { success };
  } catch (error) {
    console.error("[RateLimit] Error:", error);
    return { success: true }; // Fail open
  }
}
```

**Note**: This is OPTIONAL - public endpoints already have sensible caching.

---

## Priority 6: Security Headers Validation Test (10 min)

### Add Test to Verify Headers

**File**: `e2e/security/headers.spec.ts` (NEW)

```typescript
import { test, expect } from "@playwright/test";

test.describe("Security Headers", () => {
  test("should have X-Frame-Options header", async ({ request }) => {
    const response = await request.get("/");
    expect(response.headerValue("X-Frame-Options")).toBeDefined();
    expect(response.headerValue("X-Frame-Options")).toBe("DENY");
  });

  test("should have X-Content-Type-Options header", async ({ request }) => {
    const response = await request.get("/");
    expect(response.headerValue("X-Content-Type-Options")).toBe("nosniff");
  });

  test("should have X-XSS-Protection header", async ({ request }) => {
    const response = await request.get("/");
    expect(response.headerValue("X-XSS-Protection")).toBeDefined();
  });

  test("should have Referrer-Policy header", async ({ request }) => {
    const response = await request.get("/");
    expect(response.headerValue("Referrer-Policy")).toBeDefined();
  });

  test("should not expose server info", async ({ request }) => {
    const response = await request.get("/");
    expect(response.headerValue("Server")).not.toContain("Node");
    expect(response.headerValue("X-Powered-By")).toBeUndefined();
  });
});
```

**Run**:
```bash
pnpm playwright test e2e/security/headers.spec.ts
```

---

## Priority 7: Add Environment Variable Validation (10 min)

### Create Validation Script

**File**: `scripts/validate-secrets.ts` (NEW)

```typescript
/**
 * Validates that all required secrets are set
 * Run before deployment to catch misconfiguration
 */

const REQUIRED_SECRETS = [
  "DATABASE_URL",
  "BETTER_AUTH_SECRET",
] as const;

const OPTIONAL_SECRETS = [
  "AUTH_GOOGLE_ID",
  "AUTH_GOOGLE_SECRET",
  "SEED_SECRET",
] as const;

function validateSecrets() {
  const missingRequired: string[] = [];
  const missingOptional: string[] = [];

  for (const secret of REQUIRED_SECRETS) {
    if (!process.env[secret]) {
      missingRequired.push(secret);
    }
  }

  for (const secret of OPTIONAL_SECRETS) {
    if (!process.env[secret] && process.env.NODE_ENV === "production") {
      missingOptional.push(secret);
    }
  }

  if (missingRequired.length > 0) {
    console.error("❌ Missing required secrets:", missingRequired);
    process.exit(1);
  }

  if (missingOptional.length > 0) {
    console.warn("⚠️ Missing optional secrets:", missingOptional);
  }

  console.log("✅ All required secrets validated");
}

validateSecrets();
```

**Add to `package.json`**:
```json
{
  "scripts": {
    "validate:secrets": "tsx scripts/validate-secrets.ts",
    "prestart": "npm run validate:secrets"
  }
}
```

**Run Before Deployment**:
```bash
pnpm validate:secrets
```

---

## Implementation Checklist

- [ ] **Step 1**: Update `next.config.mjs` with security headers (5 min)
  - [ ] Add X-Frame-Options
  - [ ] Add X-Content-Type-Options
  - [ ] Add X-XSS-Protection
  - [ ] Add Referrer-Policy
  - [ ] Add Permissions-Policy
  - [ ] Test headers with `curl -I`

- [ ] **Step 2**: Reduce logging in `src/lib/prisma.ts` (5 min)
  - [ ] Remove connection string logging
  - [ ] Add DEBUG_DB gate
  - [ ] Test in development

- [ ] **Step 3**: Create `public/.well-known/security.txt` (5 min)
  - [ ] Create file
  - [ ] Update contact email
  - [ ] Test via browser

- [ ] **Step 4**: Add seed audit logging (10 min)
  - [ ] Create audit logging function
  - [ ] Add to seed endpoint
  - [ ] Test in development

- [ ] **Step 5**: Create security headers test (10 min)
  - [ ] Create `e2e/security/headers.spec.ts`
  - [ ] Run test locally
  - [ ] Verify all headers present

- [ ] **Step 6**: Add environment validation (10 min)
  - [ ] Create `scripts/validate-secrets.ts`
  - [ ] Update `package.json`
  - [ ] Test validation

- [ ] **Step 7**: Commit all changes
  ```bash
  git add -A
  git commit -m "chore: enhance security posture with headers, logging, and validation"
  git push
  ```

- [ ] **Step 8**: Deploy to production
  - [ ] Verify headers on production
  - [ ] Check security test passes
  - [ ] Monitor logs for errors

---

## Estimated Total Effort

| Task | Effort | Priority |
|------|--------|----------|
| Security headers | 5 min | P1 |
| Reduce logging | 5 min | P1 |
| Audit logging | 10 min | P2 |
| security.txt | 5 min | P2 |
| Headers test | 10 min | P2 |
| Secrets validation | 10 min | P2 |
| **Total** | **45 min** | — |

All tasks can be completed in **<1 hour** with significant security benefits.

---

## Deployment Strategy

### Option A: All at Once (Recommended)
1. Make all changes locally
2. Test each change
3. Single commit: "chore: enhance security"
4. Single deployment to production

### Option B: Incremental
1. Deploy P1 items (headers + logging) - 10 min
2. Wait 24 hours for any issues
3. Deploy P2 items (audit logging + tests) - 20 min

### Option C: Feature Branches
1. Create `feature/security-improvements` branch
2. Add each improvement in separate commits
3. Create PR for review
4. Merge after approval

**Recommendation**: **Option A** - All improvements are low-risk and enhance security.

---

## Verification After Deployment

```bash
# Check security headers on production
curl -I https://your-production-domain.com | grep -E "X-|Referrer|Permissions"

# Expected output:
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
# X-XSS-Protection: 1; mode=block
# Referrer-Policy: strict-origin-when-cross-origin
# Permissions-Policy: geolocation=(), microphone=(), camera=()

# Run security tests
pnpm playwright test e2e/security/

# Validate environment
pnpm validate:secrets
```

---

## Monitoring & Maintenance

### Weekly
- [ ] Check for dependency updates: `pnpm outdated`
- [ ] Review Vercel deployment logs for errors

### Monthly
- [ ] Review security audit logs
- [ ] Check for GitHub security alerts
- [ ] Verify seed endpoint uses only HTTPS

### Quarterly
- [ ] Re-run security code review
- [ ] Update security headers if new recommendations
- [ ] Review access logs for suspicious activity

---

## Additional Resources

- [OWASP Secure Headers](https://owasp.org/www-project-secure-headers/)
- [Next.js Security Best Practices](https://nextjs.org/docs/basic-features/data-fetching/forms-and-mutations#security)
- [Mozilla Developer Security Guidelines](https://developer.mozilla.org/en-US/docs/Web/Security)
- [security.txt Standard](https://securitytxt.org/)

---

**Generated**: 2025-12-07  
**Status**: Ready for implementation  
**Estimated ROI**: High security improvements in minimal time
