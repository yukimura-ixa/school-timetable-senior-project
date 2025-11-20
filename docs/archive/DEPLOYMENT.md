# Vercel Deployment Guide - School Timetable System

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Prisma Postgres**: Account at [console.prisma.io](https://console.prisma.io)
3. **Google OAuth Credentials**: From [Google Cloud Console](https://console.cloud.google.com/)
4. **GitHub Repository**: Code pushed to your repository

---

## 🚀 Step-by-Step Deployment

### 1. Create Prisma Postgres Database

1. Go to [console.prisma.io](https://console.prisma.io)
2. Click **"New Project"** or **"Create Database"**
3. Choose your region (closest to your users)
4. Database name: `school-timetable-prod`
5. Click **"Create"**
6. Copy the **Connection String** (starts with `postgresql://`)

**Example Connection String:**
```
postgresql://user:password@aws-region.prisma.io:5432/database?schema=public&connection_limit=10
```

---

### 2. Set Up Google OAuth (Production)

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project or select existing one
3. Go to **APIs & Services → Credentials**
4. Click **"Create Credentials"** → **"OAuth 2.0 Client ID"**
5. Application type: **Web application**
6. Name: `School Timetable Production`
7. **Authorized JavaScript origins:**
   ```
   https://your-app.vercel.app
   ```
8. **Authorized redirect URIs:**
   ```
   https://your-app.vercel.app/api/auth/callback/google
   ```
9. Click **"Create"**
10. Copy **Client ID** and **Client Secret**

---

### 3. Deploy to Vercel

#### Option A: Import from GitHub (Recommended)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select your GitHub repository: `yukimura-ixa/school-timetable-senior-project`
4. Click **"Import"**
5. Configure project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `pnpm build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)

#### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

---

### 4. Configure Environment Variables in Vercel

Go to **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these variables (for **Production** environment):

#### **Database**
```bash
DATABASE_URL=postgresql://your-connection-string-from-prisma
```

#### **NextAuth**
```bash
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-generated-secret-here
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

#### **Google OAuth**
```bash
NEXT_GOOGLE_AUTH_CLIENT_ID=your-client-id.apps.googleusercontent.com
NEXT_GOOGLE_AUTH_CLIENT_SECRET=your-client-secret
```

#### **Security (Important!)**
```bash
# Do NOT add ENABLE_DEV_BYPASS in production!
# Or explicitly set it to false:
ENABLE_DEV_BYPASS=false
```

---

### 5. Run Database Migrations

After first deployment, you need to apply your database schema:

#### Option A: Using Vercel CLI + Prisma CLI

```bash
# Set the DATABASE_URL from Prisma Postgres
$env:DATABASE_URL="postgresql://your-connection-string"

# Generate Prisma Client
pnpm prisma generate

# Run migrations
pnpm prisma migrate deploy

# Optional: Seed the database
pnpm prisma db seed
```

#### Option B: Add to Vercel Build Script

Update `package.json`:
```json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && next build",
    "vercel-build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

⚠️ **Note**: Running migrations during build is not recommended for production. Better to run migrations separately.

---

### 6. Verify Deployment

1. **Check Build Logs**: Vercel Dashboard → Deployments → Latest → View Logs
2. **Test Application**: Visit `https://your-app.vercel.app`
3. **Test Authentication**: 
   - Try logging in with Google OAuth
   - Verify the dev bypass is disabled (button should NOT appear)
4. **Test Database**: 
   - Try creating a teacher/subject/room
   - Verify data persists

---

## 🔧 Recommended Vercel Configuration

Create `vercel.json` in your project root:

```json
{
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "regions": ["sin1"],
  "env": {
    "DATABASE_URL": "@database-url",
    "NEXTAUTH_URL": "@nextauth-url",
    "NEXTAUTH_SECRET": "@nextauth-secret",
    "NEXT_GOOGLE_AUTH_CLIENT_ID": "@google-client-id",
    "NEXT_GOOGLE_AUTH_CLIENT_SECRET": "@google-client-secret"
  }
}
```

---

## 📊 Database Management

### View Database

```bash
# Using Prisma Studio (local connection to Prisma Postgres)
$env:DATABASE_URL="postgresql://your-connection-string"
pnpm prisma studio
```

### Create Migration

```bash
# Create new migration
pnpm prisma migrate dev --name add_new_feature

# Apply to production
pnpm prisma migrate deploy
```

### Backup Database

```bash
# Export data (requires direct PostgreSQL access)
pg_dump -h host -U user -d database > backup.sql
```

---

## 🔐 Security Checklist

- ✅ `ENABLE_DEV_BYPASS` is NOT set in production
- ✅ `NEXTAUTH_SECRET` is a strong random value
- ✅ Google OAuth credentials are production credentials
- ✅ Database connection string uses SSL (`sslmode=require`)
- ✅ Environment variables are set in Vercel Dashboard (not in code)
- ✅ `.env` file is in `.gitignore`

---

## 🐛 Troubleshooting

### Build Fails with "Prisma Client not found"

**Solution**: Ensure `postinstall` script is in `package.json`:
```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

### Database Connection Fails

**Check**:
1. DATABASE_URL is correctly formatted
2. Prisma Postgres database is active
3. Connection limit is appropriate (10-20 for serverless)
4. SSL mode is enabled in connection string

### Authentication Redirects Fail

**Check**:
1. NEXTAUTH_URL matches your Vercel domain exactly
2. Google OAuth redirect URI includes your Vercel domain
3. No trailing slashes in URLs

### Dev Bypass Appears in Production

**FIX IMMEDIATELY**:
1. Remove `ENABLE_DEV_BYPASS` from Vercel environment variables
2. Redeploy the application
3. Verify the button no longer appears

---

## 📈 Monitoring

- **Vercel Analytics**: Automatic performance monitoring
- **Vercel Logs**: Real-time function logs
- **Prisma Accelerate** (optional): Query caching and connection pooling

---

## 🔄 Continuous Deployment

Vercel automatically deploys on every push to `main` branch:

```bash
# Push to deploy
git push origin refactor

# Or merge PR to main
```

**Preview Deployments**: Every PR gets a unique preview URL.

---

## 💡 Best Practices

1. **Use Preview Deployments** for testing before merging to main
2. **Set up different environments**:
   - Production: `main` branch
   - Staging: `staging` branch (optional)
   - Development: Preview deployments
3. **Monitor performance** via Vercel Dashboard
4. **Keep dependencies updated** with `pnpm update`
5. **Regular database backups** (Prisma Postgres has automatic backups)

---

## 📞 Support Resources

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Prisma Postgres**: [prisma.io/postgres](https://www.prisma.io/postgres)
- **Next.js Deployment**: [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)

---

## ✅ Final Checklist

Before going live:

- [ ] Prisma Postgres database created
- [ ] Google OAuth configured for production domain
- [ ] All environment variables set in Vercel
- [ ] Database migrations applied successfully
- [ ] Test authentication with real Google accounts
- [ ] Verify dev bypass is disabled
- [ ] Test all CRUD operations
- [ ] Check loading/empty states work correctly
- [ ] Verify error handling works
- [ ] Test on mobile devices
- [ ] Set up monitoring/alerts

---

**You're ready to deploy! 🚀**
