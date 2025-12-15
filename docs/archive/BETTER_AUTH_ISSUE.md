# Better-Auth Authentication Issue Documentation

## Issue Summary

Email/password authentication fails with "Invalid email or password" error despite correct database configuration and password hash verification.

## Environment

- **Project**: Next.js 16.0.0-canary.87
- **better-auth**: 1.4.2
- **Prisma**: 6.18.0
- **Database**: PostgreSQL via Prisma Accelerate
- **Node.js**: 22.20.0

## Expected Behavior

User should be able to sign in with email `admin@school.local` and password `admin123` when:

1. User record exists with correct password hash
2. Account record exists with `providerId='credential'` and matching password hash
3. better-auth is configured with `emailAndPassword: { enabled: true }`

## Actual Behavior

Login consistently fails with "Invalid email or password" error (HTTP 401) even when all database records and configurations are verified correct.

## Database Verification

### User Table

```sql
SELECT id, email, name, role, "emailVerified", password
FROM "User"
WHERE email = 'admin@school.local';
```

**Result**:

```
id: cmik0iyjy0000w0wm3tzd6nfn
email: admin@school.local
name: System Administrator
role: admin
emailVerified: true
password: 05f4127f7cbeeaf9ab5ee2d4deca630f:cd1a83058a5217474cab1f6a7fcd456f87fc79c964a32710291107a8d9678f085a57e4faeb73a08d1e9335af4d822358fd78b0071adfefec35faa4d0718bf0fb
```

### Account Table

```sql
SELECT id, "userId", "accountId", "providerId", password
FROM "Account"
WHERE "userId" = 'cmik0iyjy0000w0wm3tzd6nfn';
```

**Result**:

```
id: c[random]
userId: cmik0iyjy0000w0wm3tzd6nfn
accountId: admin@school.local
providerId: credential
password: 05f4127f7cbeeaf9ab5ee2d4deca630f:cd1a83058a5217474cab1f6a7fcd456f87fc79c964a32710291107a8d9678f085a57e4faeb73a08d1e9335af4d822358fd78b0071adfefec35faa4d0718bf0fb
```

**✅ Password hashes match exactly between User and Account tables**

## Configuration

### better-auth Server (`src/lib/auth.ts`)

```typescript
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import prisma from "@/lib/prisma";

export const auth = betterAuth({
  baseURL: process.env.AUTH_URL || "http://localhost:3000",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    // Using better-auth's default scrypt hashing
  },
  socialProviders: {
    google: {
      clientId: process.env.AUTH_GOOGLE_ID || "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET || "",
    },
  },
  plugins: [
    admin({
      defaultRole: "guest",
      adminRoles: ["admin"],
    }),
  ],
  experimental: {
    joins: true,
  },
});
```

### Prisma Schema (Account Model)

```prisma
model Account {
  id                    String    @id @default(cuid())
  userId                String
  accountId             String // Provider's account ID
  providerId            String // "google", "credentials", etc.
  accessToken           String?
  refreshToken          String?
  idToken               String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  password              String? // For credentials provider

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([providerId, accountId])
}
```

## Debugging Steps Performed (120 minutes)

1. ✅ Verified `baseURL` configuration in better-auth
2. ✅ Removed custom scrypt hashing to use better-auth defaults
3. ✅ Verified admin user exists in database with correct password hash
4. ✅ Discovered missing Account record (was the suspected root cause)
5. ✅ Created Account record with `providerId='credential'`
6. ✅ Verified password hash in Account table matches User table
7. ✅ Hard refreshed browser to clear cache
8. ✅ Restarted dev server to clear Prisma Accelerate cache
9. ❌ Login still fails

## API Response

```bash
curl -X POST http://localhost:3000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@school.local","password":"admin123"}'
```

**Response**:

```json
{
  "code": "INVALID_EMAIL_OR_PASSWORD",
  "message": "Invalid email or password"
}
```

**Status**: 401 Unauthorized

## Possible Causes

1. **better-auth bug**: Credential authentication may not correctly verify passwords from Account table in version 1.4.2
2. **Prisma Accelerate incompatibility**: Caching layer might prevent better-auth from seeing Account table updates
3. **Undocumented configuration**: There may be additional configuration required for credential provider that's not in the docs

## Reproduction Steps

1. Create User record with scrypt-hashed password (using better-auth's default implementation)
2. Create Account record with:
   - `userId` matching the User's id
   - `accountId` set to user's email
   - `providerId='credential'`
   - `password` set to same hash as User table
3. Configure better-auth with `emailAndPassword: { enabled: true }`
4. Attempt to sign in via `/api/auth/sign-in/email` endpoint
5. Observe 401 error with "Invalid email or password"

## Additional Context

- User was created via better-auth's `/api/auth/sign-up/email` endpoint (which should create both User and Account records)
- Manually verified in Prisma Studio that both records exist with matching password hashes
- Used Context7 to verify schema matches better-auth's official documentation
- Tested with both direct PostgreSQL connection and Prisma Accelerate

## Request

Please help identify if this is:

1. A bug in better-auth's credential authentication
2. A configuration issue not covered in documentation
3. An incompatibility with Prisma Accelerate

Thank you!
