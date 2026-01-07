# Production Launch Checklist & Operations Guide

**Status:** 🟢 Ready for Production  
**Last Updated:** 8 January 2026  
**Deployment:** Vercel (phrasongsa-timetable.vercel.app)

---

## ✅ Pre-Launch Checklist

### 1. Security & Configuration
- [x] **Security headers** added to `next.config.mjs`
  - X-Frame-Options: DENY
  - X-Content-Type-Options: nosniff
  - X-XSS-Protection: 1; mode=block
  - Referrer-Policy: strict-origin-when-cross-origin

- [x] **Environment variables** configured in Vercel
  - DATABASE_URL (Postgres connection)
  - POSTGRES_PRISMA_URL (Accelerate pooling)
  - AUTH_SECRET (Better Auth encryption)
  - SENTRY_AUTH_TOKEN (Error tracking)

- [x] **Database backup** system established
  - Script: `scripts/db-backup.ts`
  - Usage: `pnpm exec tsx scripts/db-backup.ts`
  - Output: JSON backups in `backups/` directory

### 2. Admin User & Access
- [ ] **Initialize admin user** in production:
  ```bash
  # Set environment variable first:
  export DATABASE_URL="your_prod_postgres_url"
  
  # Then run:
  pnpm admin:seed:prod
  ```
  
  **Credentials after initialization:**
  - Email: `admin@school.local`
  - Password: `admin123`
  - ⚠️ CHANGE PASSWORD IMMEDIATELY IN PRODUCTION

### 3. Testing & Verification
- [x] **Mobile responsiveness** improved
  - Hero section responsive heights
  - Text sizing with sm/md/lg breakpoints
  - Responsive button padding
  - Badge scaling on desktop only

- [x] **E2E test fixes** deployed
  - Console error logging improved
  - Teacher selector visibility fixed
  - Latest commit: `d6dd62b3` (homepage mobile improvements)

- [ ] **Production E2E tests** (after admin user created):
  ```bash
  export E2E_ADMIN_EMAIL="admin@school.local"
  export E2E_ADMIN_PASSWORD="admin123"
  pnpm test:prod:visual
  ```

- [ ] **Manual smoke tests**:
  - [ ] Homepage loads correctly
  - [ ] Sign-in page is accessible
  - [ ] Admin can login and access dashboard
  - [ ] Teacher views work on mobile & desktop
  - [ ] Timetable export functions

### 4. Data & Compliance
- [x] **MOE compliance** validated
  - Subject codes follow Thai learning area patterns
  - Credit allocation respects MOE limits
  - Grade/section structure is correct

- [x] **Database** ready
  - Backup file created: 439 records
  - Schema migrated to production
  - Accelerate pooling enabled

---

## 🚀 Post-Launch Operations

### Daily Operations

#### Monitoring
```bash
# Check deployment status
curl -I https://phrasongsa-timetable.vercel.app

# View CI/CD logs
# → GitHub Actions: https://github.com/oberghub/school-timetable-senior-project/actions

# View Vercel logs
# → Vercel Dashboard: https://vercel.com
```

#### Database Backup (Recommended: Daily)
```bash
# Create backup (requires DATABASE_URL set)
pnpm exec tsx scripts/db-backup.ts

# Output example: backups/backup-2026-01-08T14-30-45-123Z.json
```

### Incident Response

#### Admin User Lost/Password Forgotten
```bash
# Re-initialize admin user (idempotent - safe to run multiple times)
export DATABASE_URL="your_prod_postgres_url"
pnpm admin:seed:prod

# Then update password manually via admin dashboard OR
# Reset password via forgot-password page at /forgot-password
```

#### Database Issues
```bash
# Check database connection
pnpm exec tsx scripts/check-db-state.ts

# View schema status
pnpm db:studio  # (local only, requires local DB running)
```

#### Deployment Rollback
See `docs/PRE_LAUNCH_CHECKLIST.md` → "Emergency Rollback Runbook"

### Weekly Tasks

- [ ] Review error logs (Sentry dashboard)
- [ ] Verify database backup from yesterday exists
- [ ] Check Vercel deployment metrics
- [ ] Review GitHub Actions CI results

### Monthly Tasks

- [ ] Audit user accounts and permissions
- [ ] Review and rotate API keys/secrets if needed
- [ ] Update dependencies (security patches)
- [ ] Performance review and optimization

---

## 📋 Deployment Git Workflow

### Making Changes to Production

1. **Make changes locally** and test
   ```bash
   git checkout -b feature/your-feature
   # Make your changes
   pnpm test       # Run tests
   pnpm build      # Build for production
   ```

2. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: description of changes"
   git push origin feature/your-feature
   ```

3. **Create Pull Request** on GitHub
   - Wait for CI/E2E tests to pass
   - Get code review
   - Merge to main

4. **Automatic Deployment**
   - Vercel automatically deploys main branch
   - Deployment takes ~5-10 minutes
   - Status visible on GitHub + Vercel dashboard

### Rolling Back a Deployment

If issues occur after deployment:

1. **Quick Revert** (recommended for broken commits)
   ```bash
   git revert HEAD  # Creates new commit that undoes changes
   git push origin main
   # Vercel automatically deploys the revert
   ```

2. **Manual Rollback** (deploy previous working commit)
   - Go to Vercel Dashboard
   - Select deployment to revert to
   - Click "Redeploy"

3. **Full Database Restore** (if data is corrupted)
   - See "Emergency Rollback Runbook" in PRE_LAUNCH_CHECKLIST.md

---

## 🔧 Useful Commands

### Database
```bash
# Seed database (idempotent, adds admin user)
pnpm db:seed

# Create backup
pnpm exec tsx scripts/db-backup.ts

# Initialize prod admin user
pnpm admin:seed:prod

# View database schema
pnpm db:studio
```

### Testing
```bash
# Run all tests locally
pnpm test

# Test against production
export E2E_ADMIN_EMAIL="admin@school.local"
export E2E_ADMIN_PASSWORD="admin123"
pnpm test:prod:visual

# Check for type errors
pnpm typecheck
```

### Code Quality
```bash
# Lint code
pnpm lint

# Format code
pnpm format

# Build for production
pnpm build
```

---

## 📞 Support & Contact

**Deployment Issues:**
- Check GitHub Actions: https://github.com/oberghub/school-timetable-senior-project/actions
- Check Vercel Dashboard: https://vercel.com/dashboard
- Review error logs in Sentry

**Database Issues:**
- Check database connection string in Vercel env vars
- Verify Prisma Accelerate credits
- Test locally with `.env.local`

**Code Issues:**
- Review commit history: `git log --oneline`
- Check failing tests in CI logs
- Run tests locally to reproduce

---

## 📚 Additional Documentation

- **Production Checklist:** `docs/PRE_LAUNCH_CHECKLIST.md`
- **Emergency Rollback:** `docs/PRE_LAUNCH_CHECKLIST.md` (Rollback Runbook section)
- **Architecture:** Project README and `conductor/tech-stack.md`
- **Thai MOE Compliance:** `docs/agents/THAI_MOE_CURRICULUM_RULES.md`

---

## 🎯 Next Steps

1. **Immediately after launch:**
   - [ ] Create production admin user (run `pnpm admin:seed:prod`)
   - [ ] Test login with admin@school.local / admin123
   - [ ] Change admin password immediately
   - [ ] Create backup (run `pnpm exec tsx scripts/db-backup.ts`)

2. **First week:**
   - [ ] Run full E2E tests against production
   - [ ] Verify all core workflows (login, timetable view, export)
   - [ ] Monitor error logs and performance
   - [ ] Collect user feedback

3. **Ongoing:**
   - [ ] Daily backup routine
   - [ ] Weekly monitoring and review
   - [ ] Continue development with main branch
   - [ ] Plan for scale-up if needed
