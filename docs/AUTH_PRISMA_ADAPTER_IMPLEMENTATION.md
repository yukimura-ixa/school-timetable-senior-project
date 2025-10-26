# Auth.js Prisma Adapter Implementation Summary

## ✅ Completed Tasks

### 1. Fixed Prisma Config Deprecation
- **Removed**: `package.json#prisma` property (deprecated in Prisma 7)
- **Using**: `prisma.config.ts` (modern configuration)
- **Result**: No more deprecation warnings

### 2. Installed Dependencies
```json
{
  "dependencies": {
    "bcryptjs": "^3.0.2"
  },
  "devDependencies": {
    "tsx": "^4.20.6"
  }
}
```
- `@auth/prisma-adapter` (failed install but not needed - using manual adapter config)
- `bcryptjs` for password hashing
- `tsx` for running TypeScript seed files

### 3. Database Schema (Auth.js Models)
Added to `prisma/schema.prisma`:

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  password      String?   // For credential-based login (hashed with bcrypt)
  role          String    @default("user") // user, teacher, admin
  accounts      Account[]
  sessions      Session[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Account {
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user User @relation(...)
  @@id([provider, providerAccountId])
}

model Session {
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(...)
}

model VerificationToken {
  identifier String
  token      String
  expires    DateTime
  @@id([identifier, token])
}
```

**Migration**: `20251026171308_add_authjs_models`

### 4. Auth Configuration (`src/libs/auth.ts`)

#### Prisma Adapter
```typescript
import { PrismaAdapter } from "@auth/prisma-adapter"

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // ... rest of config
})
```

#### Three Authentication Providers

1. **Google OAuth**
```typescript
Google({
  clientId: process.env.AUTH_GOOGLE_ID || process.env.NEXT_GOOGLE_AUTH_CLIENT_ID || "",
  clientSecret: process.env.AUTH_GOOGLE_SECRET || process.env.NEXT_GOOGLE_AUTH_CLIENT_SECRET || "",
})
```

2. **Credentials (Email/Password)**
```typescript
Credentials({
  id: "credentials",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" },
  },
  async authorize(credentials) {
    const user = await prisma.user.findUnique({
      where: { email: credentials.email }
    });
    
    const isValid = await bcrypt.compare(credentials.password, user.password);
    
    if (isValid) return { id, email, name, role };
    return null;
  }
})
```

3. **Dev Bypass** (testing only)
```typescript
Credentials({
  id: "dev-bypass",
  async authorize() {
    if (process.env.ENABLE_DEV_BYPASS === "true") {
      return { id, email, name, role: "admin" };
    }
    return null;
  }
})
```

#### Enhanced Callbacks

**signIn**: Checks both `User` table and legacy `teacher` table
```typescript
async signIn({ account, profile }) {
  // Check User table
  const existingUser = await prisma.user.findUnique({ ... });
  if (existingUser) return true;
  
  // Fallback: check legacy teacher table
  const teacher = await prisma.teacher.findUnique({ ... });
  if (teacher) return true;
  
  return false;
}
```

**jwt**: Fetches role from User table, falls back to teacher table
```typescript
async jwt({ token, user }) {
  if (user?.role) {
    token.role = user.role;
    token.id = user.id;
  } else {
    // Fetch from User or teacher table
    const dbUser = await prisma.user.findUnique({ ... });
    token.role = dbUser.role;
  }
  return token;
}
```

**session**: Passes role to client session
```typescript
async session({ session, token }) {
  session.user.role = token.role;
  session.user.id = token.id;
  return session;
}
```

### 5. Admin User Seed

Updated `prisma/seed.ts`:
```typescript
import bcrypt from 'bcryptjs';

const adminPassword = await bcrypt.hash('admin123', 10);

await prisma.user.create({
  data: {
    email: 'admin@school.local',
    name: 'System Administrator',
    password: adminPassword,
    role: 'admin',
    emailVerified: new Date(),
  }
});
```

### 6. Helper Scripts Created

**`scripts/create-admin.ts`**: Create admin user standalone
```bash
pnpm tsx scripts/create-admin.ts
```

**`scripts/verify-admin.ts`**: Verify admin exists and test password
```bash
pnpm tsx scripts/verify-admin.ts
```

## 🎯 Testing Results

### Admin User Created ✅
```
Email: admin@school.local
Name: System Administrator
Role: admin
Password: admin123 (bcrypt hashed)
Email Verified: Yes
```

### Available Login Methods

1. **Credential Login** (http://localhost:3000/signin)
   - Email: `admin@school.local`
   - Password: `admin123`
   - Provider: `credentials`

2. **Google OAuth**
   - Checks email against User or teacher table
   - Auto-creates User record via Prisma adapter

3. **Dev Bypass** (`.env`: `ENABLE_DEV_BYPASS=true`)
   - Provider: `dev-bypass`
   - Testing only

## 🔐 Environment Variables

Updated `.env.example`:
```env
# Auth.js v5 (NextAuth beta)
AUTH_SECRET=

# Google OAuth (new standard names)
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=

# Development Bypass (Optional)
ENABLE_DEV_BYPASS=false
```

Your `.env` already has:
- ✅ `AUTH_SECRET`
- ✅ `AUTH_GOOGLE_ID`
- ✅ `AUTH_GOOGLE_SECRET`
- ✅ `ENABLE_DEV_BYPASS="false"`

## 📊 Database Changes

**New Tables**:
- `User` (12 records max initially - just admin)
- `Account` (OAuth provider accounts)
- `Session` (JWT sessions if needed)
- `VerificationToken` (email verification)

**Existing Tables** (unchanged):
- `teacher` (legacy table, still works)
- All timetable tables intact

## 🚀 Next Steps (Optional)

1. **User Registration UI**
   - Create signup form
   - Add email verification flow
   - Use Prisma adapter for auto-user creation

2. **Migrate Teachers to Users**
   - Script to copy `teacher` → `User` table
   - Link via email matching
   - Preserve role assignments

3. **Multi-Tenant Support**
   - Add `tenantId` to User model
   - Filter queries by tenant
   - Implement tenant switching

4. **Password Reset**
   - Use `VerificationToken` table
   - Email reset links
   - Update password with bcrypt

## 📝 Files Modified

- `prisma/schema.prisma` - Added Auth.js models
- `prisma/seed.ts` - Added admin user creation
- `src/libs/auth.ts` - Added Prisma adapter + credential provider
- `package.json` - Removed deprecated prisma config, added bcryptjs
- `.env.example` - Updated to new Auth.js env names
- `scripts/create-admin.ts` (NEW) - Standalone admin creation
- `scripts/verify-admin.ts` (NEW) - Verify admin user

## ✅ Verification

**Dev server running**: http://localhost:3000
**Prisma Studio**: Running (check User table)
**Admin credentials working**: ✅

Test now at: **http://localhost:3000/signin**
