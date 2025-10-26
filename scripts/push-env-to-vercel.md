# Push Environment Variables to Vercel

## Prerequisites

1. Install Vercel CLI globally (already done):
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Link your project to Vercel:
   ```bash
   vercel link
   ```
   - Select your Vercel account
   - Select the project (or create new one)

---

## Required Environment Variables

### 1. **AUTH_SECRET** (Required)
Generate a secure random string for JWT signing:

```bash
# Generate new secret
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Add to Vercel (all environments)
vercel env add AUTH_SECRET
# When prompted:
# - Paste the generated secret
# - Select: Production, Preview, Development
```

---

### 2. **AUTH_GOOGLE_ID** (Required for Google OAuth)
Your Google OAuth Client ID:

```bash
vercel env add AUTH_GOOGLE_ID
# When prompted:
# - Paste your Google Client ID
# - Select: Production, Preview, Development
```

---

### 3. **AUTH_GOOGLE_SECRET** (Required for Google OAuth)
Your Google OAuth Client Secret:

```bash
vercel env add AUTH_GOOGLE_SECRET
# When prompted:
# - Paste your Google Client Secret (keep it secret!)
# - Select: Production, Preview, Development
```

---

### 4. **DATABASE_URL** (Required - via Vercel Storage)
This is automatically set when you connect Vercel Postgres from the Vercel Dashboard.

**Option A: Use Vercel Storage (Recommended)**
1. Go to your project in Vercel Dashboard
2. Navigate to **Storage** tab
3. Click **Create Database** → **Postgres**
4. Select **Neon** or **Prisma Postgres**
5. Connect the database to your project
6. `DATABASE_URL` will be automatically injected

**Option B: Use External Database**
```bash
vercel env add DATABASE_URL
# When prompted:
# - Paste your PostgreSQL connection string
# - Format: postgresql://user:password@host:port/database
# - Select: Production, Preview, Development
```

---

### 5. **AUTH_URL** (Optional - auto-detected in production)
Only needed if Vercel can't auto-detect your production URL:

```bash
vercel env add AUTH_URL production
# When prompted:
# - Enter: https://your-domain.vercel.app
# - Or your custom domain
```

---

## Quick Script (All at Once)

Create a `.env.production` file locally (DO NOT COMMIT):

```bash
AUTH_SECRET=your_generated_secret_here
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret
DATABASE_URL=your_postgres_connection_string
```

Then push all at once:

```bash
# Push all env vars from .env.production
vercel env pull .env.local
# This downloads current Vercel env vars

# Then manually add via CLI or Dashboard
```

---

## Vercel Dashboard Method (Easier)

Instead of CLI, use the Vercel Dashboard:

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable:
   - **Variable Name**: `AUTH_SECRET`
   - **Value**: `<your-secret>`
   - **Environments**: Production, Preview, Development
   - Click **Save**
5. Repeat for all required variables

---

## Verify Environment Variables

### List all environment variables
```bash
vercel env ls
```

### Pull environment variables to local .env.local
```bash
vercel env pull .env.local
```

### Remove an environment variable
```bash
vercel env rm AUTH_SECRET
```

---

## Required for Production

| Variable | Required? | Source | Notes |
|----------|-----------|--------|-------|
| `DATABASE_URL` | ✅ Yes | Vercel Storage or External | Auto-injected if using Vercel Postgres |
| `AUTH_SECRET` | ✅ Yes | Generate (openssl/crypto) | JWT signing key |
| `AUTH_GOOGLE_ID` | ✅ Yes | Google Cloud Console | OAuth Client ID |
| `AUTH_GOOGLE_SECRET` | ✅ Yes | Google Cloud Console | OAuth Client Secret |
| `AUTH_URL` | ⚠️ Optional | Your domain | Auto-detected in most cases |

---

## Optional (Development Only)

These should **NOT** be set in production:

| Variable | Use Case | Default |
|----------|----------|---------|
| `ENABLE_DEV_BYPASS` | Bypass OAuth for local dev | `false` |
| `DEV_USER_EMAIL` | Dev bypass credentials | - |
| `DEV_USER_ROLE` | Dev bypass role | - |
| `SEED_CLEAN_DATA` | Enable destructive seed | `false` |

---

## Security Notes

⚠️ **NEVER** commit these to Git:
- `.env`
- `.env.local`
- `.env.production`

✅ **Safe to commit**:
- `.env.example` (template only, no real values)

🔒 **Production Security**:
- Never enable `ENABLE_DEV_BYPASS` in production
- Use strong `AUTH_SECRET` (32+ bytes random)
- Rotate secrets if exposed
- Use Vercel's encrypted secret storage

---

## After Pushing Environment Variables

1. **Redeploy** your application:
   ```bash
   vercel --prod
   ```

2. **Or trigger redeploy from Dashboard**:
   - Go to Deployments
   - Click **Redeploy** on latest deployment
   - Select **Use existing Build Cache** (faster)

3. **Verify** environment variables are working:
   - Check deployment logs
   - Test authentication
   - Test database connection

---

## Troubleshooting

### "DATABASE_URL is not defined"
- Ensure Vercel Postgres is connected in Storage tab
- Or manually add `DATABASE_URL` via CLI/Dashboard

### "AUTH_SECRET is not defined"
- Run: `vercel env add AUTH_SECRET`
- Generate with: `openssl rand -base64 32`

### Google OAuth not working
- Verify `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` are set
- Check Google Cloud Console → Authorized redirect URIs:
  - Add: `https://your-domain.vercel.app/api/auth/callback/google`
  - Add: `http://localhost:3000/api/auth/callback/google` (for local dev)

### Changes not taking effect
- Redeploy after adding env vars
- Clear build cache if needed
- Check deployment logs for errors

---

## Next Steps

1. Login to Vercel: `vercel login`
2. Link project: `vercel link`
3. Push env vars: Use CLI commands above or Vercel Dashboard
4. Deploy: `vercel --prod`
5. Test: Visit your production URL

---

## Related Documentation

- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)
- [AUTH_PRISMA_ADAPTER_IMPLEMENTATION.md](../docs/AUTH_PRISMA_ADAPTER_IMPLEMENTATION.md)
- [SEED_SAFETY_GUIDE.md](../docs/SEED_SAFETY_GUIDE.md)
