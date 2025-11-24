# Environment Configuration Guide

## 📋 **Overview**

This project uses **environment-specific configuration files** to manage different deployment contexts:

- **`.env.local`** - Local development
- **`.env.ci`** - GitHub Actions CI/CD
- **`.env.test`** - E2E testing (Playwright)
- **`.env.production`** - Production deployment

---

## 🗂️ **Environment Files**

### **File Structure**

```
project/
├── .env.example                # General template (committed)
├── .env.local.example          # Local dev template (committed)
├── .env.production.example     # Production template (committed)
├── .env.ci                     # CI configuration (committed)
├── .env.test                   # E2E test configuration (committed)
├── .env.local                  # Your local config (gitignored)
└── .env.production             # Production config (gitignored)
```

### **Committed Files** ✅

These files are safe to commit:

- `.env.example` - General template
- `.env.local.example` - Local development template
- `.env.production.example` - Production template
- `.env.ci` - GitHub Actions configuration
- `.env.test` - E2E test configuration

### **Gitignored Files** 🚫

These files contain secrets and are **never** committed:

- `.env.local` - Your personal local configuration
- `.env.production` - Production secrets
- `.env` - Generic environment file
- `.env.development` - Development overrides

---

## 🚀 **Setup Instructions**

### **1. Local Development Setup**

```powershell
# Copy the template
cp .env.local.example .env.local

# Edit with your values
notepad .env.local

# Start development server
pnpm dev
```

**What to configure:**

- `DATABASE_URL` - Use Prisma proxy or local PostgreSQL
- `AUTH_SECRET` - Generate with `openssl rand -base64 32`
- `AUTH_GOOGLE_ID` & `AUTH_GOOGLE_SECRET` - Optional for OAuth
- `ENABLE_DEV_BYPASS="true"` - Skip OAuth for faster dev

### **2. GitHub CI Setup**

**No setup needed!** GitHub Actions automatically uses `.env.ci`.

**If you need secrets:**

1. Go to: `Settings > Secrets and variables > Actions`
2. Add repository secrets:
   - `AUTH_SECRET`
   - `AUTH_GOOGLE_ID` (if using OAuth in CI)
   - `AUTH_GOOGLE_SECRET` (if using OAuth in CI)

### **3. Production Setup**

```powershell
# Copy the template
cp .env.production.example .env.production

# Edit with your production values
notepad .env.production
```

**Critical production settings:**

- `DATABASE_URL` - Production database (Vercel Postgres, Supabase, etc.)
- `AUTH_SECRET` - Strong secret (NEVER reuse from dev!)
- `AUTH_URL` - Your production domain
- `ENABLE_DEV_BYPASS="false"` - ⚠️ MUST be false!
- Google OAuth credentials for production domain

**Deployment platforms:**

- **Vercel**: Set in Project Settings > Environment Variables
- **Railway**: Set in Project Settings > Variables
- **Netlify**: Set in Site Settings > Environment Variables
- **AWS/Azure**: Use secrets manager

### **4. E2E Test Setup**

**Already configured!** `.env.test` is committed and ready.

**For local E2E testing:**

```powershell
# Make sure Prisma Studio proxy is running
pnpm db:studio

# Run E2E tests
pnpm test:e2e
```

---

## 🔧 **Environment Variables Reference**

### **Database**

| Variable       | Description                 | Example                                    |
| -------------- | --------------------------- | ------------------------------------------ |
| `DATABASE_URL` | Primary database connection | `postgresql://user:pass@localhost:5432/db` |
| `POSTGRES_URL` | Alternate connection string | `postgresql://...`                         |

**Database Types:**

- **Prisma Proxy**: `prisma+postgres://localhost:51213/?api_key=...`
- **Direct PostgreSQL**: `postgresql://user:pass@host:port/database`
- **Vercel Postgres**: Auto-set by Vercel
- **Prisma Accelerate**: `prisma://accelerate.prisma-data.net/?api_key=...`

### **Authentication**

| Variable             | Description                | Required |
| -------------------- | -------------------------- | -------- |
| `AUTH_SECRET`        | NextAuth.js secret key     | ✅ Yes   |
| `AUTH_URL`           | Application base URL       | ✅ Yes   |
| `AUTH_GOOGLE_ID`     | Google OAuth client ID     | Optional |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret | Optional |

**Generate AUTH_SECRET:**

```powershell
openssl rand -base64 32
```

### **Development Bypass**

| Variable            | Description                            | Environment   |
| ------------------- | -------------------------------------- | ------------- |
| `ENABLE_DEV_BYPASS` | Skip OAuth login                       | Local/CI only |
| `DEV_USER_EMAIL`    | Test user email                        | Local/CI only |
| `DEV_USER_ROLE`     | Test user role (admin/teacher/student) | Local/CI only |

⚠️ **SECURITY**: NEVER enable in production!

### **Testing**

| Variable        | Description       | Used In                |
| --------------- | ----------------- | ---------------------- |
| `TEST_PASSWORD` | E2E test password | `.env.test`            |
| `SEED_SECRET`   | Seed API secret   | `.env.test`, `.env.ci` |
| `BASE_URL`      | Test server URL   | E2E tests              |

---

## 📊 **Environment Priority**

Next.js loads environment files in this order (later overrides earlier):

1. `.env` - Generic (all environments)
2. `.env.local` - Local overrides (gitignored)
3. `.env.[environment]` - Environment-specific
   - `.env.development` (next dev)
   - `.env.production` (next build + next start)
   - `.env.test` (for testing)

**Special cases:**

- `.env.local` is **always loaded** except in test mode
- GitHub Actions uses `.env.ci` explicitly
- E2E tests use `.env.test` explicitly

---

## 🔒 **Security Best Practices**

### **DO** ✅

1. **Use different secrets per environment**

   ```powershell
   # Generate unique secrets
   openssl rand -base64 32  # For local
   openssl rand -base64 32  # For production
   ```

2. **Store production secrets securely**
   - Use hosting platform's secret management
   - Use environment variables, not `.env` files
   - Rotate secrets regularly

3. **Validate environment variables**

   ```typescript
   if (!process.env.AUTH_SECRET) {
     throw new Error("AUTH_SECRET is required");
   }
   ```

4. **Use HTTPS in production**
   ```env
   # Production only
   AUTH_URL="https://yourdomain.com"
   ```

### **DON'T** 🚫

1. **Never commit secrets**
   - Double-check before committing
   - Use `.gitignore` properly
   - Review git history if secrets leaked

2. **Never reuse secrets across environments**

   ```
   ❌ Local:      AUTH_SECRET="dev-secret-123"
   ❌ Production: AUTH_SECRET="dev-secret-123"  # WRONG!

   ✅ Local:      AUTH_SECRET="dev-secret-123"
   ✅ Production: AUTH_SECRET="prod-xyz-789"    # CORRECT!
   ```

3. **Never hardcode secrets in code**

   ```typescript
   ❌ const secret = "my-secret-key";  // WRONG!
   ✅ const secret = process.env.AUTH_SECRET;  // CORRECT!
   ```

4. **Never enable dev bypass in production**
   ```env
   # Production .env
   ENABLE_DEV_BYPASS="false"  # MUST be false!
   ```

---

## 🧪 **Testing Different Environments**

### **Test Local Environment**

```powershell
# Uses .env.local
pnpm dev
```

### **Test Production Build**

```powershell
# Uses .env.production
pnpm build
pnpm start
```

### **Test E2E**

```powershell
# Uses .env.test
pnpm test:e2e
```

### **Test CI Locally**

```powershell
# Temporarily use CI config
cp .env.ci .env.local
pnpm dev
# Remember to restore your .env.local afterward!
```

---

## 🔍 **Troubleshooting**

### **"Environment variable not found"**

**Solution:**

1. Check if file exists: `.env.local` or `.env.production`
2. Verify variable name matches exactly
3. Restart dev server after changing env files
4. For production, set in hosting platform, not `.env.production`

### **"Auth secret not configured"**

**Solution:**

```powershell
# Generate new secret
openssl rand -base64 32

# Add to .env.local
AUTH_SECRET="<generated-secret>"
```

### **"Database connection failed"**

**Solution:**

1. **Local dev**: Start Prisma Studio (`pnpm db:studio`)
2. **Check DATABASE_URL** format:

   ```env
   # Prisma proxy
   DATABASE_URL="prisma+postgres://localhost:51213/?api_key=..."

   # Direct connection
   DATABASE_URL="postgresql://user:pass@host:5432/db"
   ```

3. **Verify database is running**

### **"OAuth redirect mismatch"**

**Cause:** OAuth credentials configured for different domain

**Solution:**

1. Go to Google Cloud Console
2. Add authorized redirect URI:
   - Local: `http://localhost:3000/api/auth/callback/google`
   - Prod: `https://yourdomain.com/api/auth/callback/google`

### **"Dev bypass not working"**

**Solution:**

```env
# In .env.local
ENABLE_DEV_BYPASS="true"  # Must be string "true"
DEV_USER_EMAIL="admin@test.local"
DEV_USER_ROLE="admin"
```

Restart dev server after changing.

---

## 📝 **Quick Reference**

### **Environment Files Checklist**

- [x] `.env.example` - Committed ✅
- [x] `.env.local.example` - Committed ✅
- [x] `.env.production.example` - Committed ✅
- [x] `.env.ci` - Committed ✅
- [x] `.env.test` - Committed ✅
- [ ] `.env.local` - Created locally (gitignored)
- [ ] `.env.production` - Set in hosting platform (gitignored)

### **Required Variables by Environment**

| Variable             | Local    | CI       | Production |
| -------------------- | -------- | -------- | ---------- |
| `DATABASE_URL`       | ✅       | ✅       | ✅         |
| `AUTH_SECRET`        | ✅       | ✅       | ✅         |
| `AUTH_URL`           | ✅       | ✅       | ✅         |
| `AUTH_GOOGLE_ID`     | Optional | Optional | ✅         |
| `AUTH_GOOGLE_SECRET` | Optional | Optional | ✅         |
| `ENABLE_DEV_BYPASS`  | ✅ true  | ✅ true  | ⚠️ false   |

---

## 📚 **Related Documentation**

- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Prisma Connection Management](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
- [NextAuth.js Configuration](https://next-auth.js.org/configuration/options)

---

**Last Updated:** 2025-11-21  
**Maintained by:** Development Team
