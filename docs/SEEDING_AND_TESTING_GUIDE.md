# Production Seeding & Testing Guide

> Quick reference for seeding production data and running smoke tests

## 🌱 Seeding Production Semesters

### Basic Seeding (Semesters Only)

Creates semester records for 2567-2568 (4 semesters total):

```powershell
.\scripts\seed-production.ps1
```

**What it creates:**
- ✅ Semester records in `table_config` (ConfigID format: `1-2567`, `2-2567`, etc.)
- ✅ Minimal config JSON

### Full Seeding (Semesters + Timeslots + Config)

Creates semesters AND baseline timeslots/config:

```powershell
.\scripts\seed-production.ps1 -SeedData
```

**What it creates:**
- ✅ Semester records
- ✅ 40 timeslots per semester (5 days × 8 periods)
- ✅ Baseline `table_config` with periods, breaks, school days

### Custom Years

Seed specific academic years:

```powershell
# Via API directly
$SECRET = "your-secret-here"
Invoke-RestMethod `
  -Uri "https://phrasongsa-timetable.vercel.app/api/admin/seed-semesters?secret=$SECRET&years=2569,2570&seedData=true" `
  -Method GET
```

---

## 🧪 Running Tests

### 1. Integration Tests (Seed Endpoint)

Tests the seed API in development:

```bash
# Set environment
export TEST_BASE_URL=http://localhost:3000
export SEED_SECRET=your-dev-secret

# Run test
pnpm test __test__/integration/seed-endpoint.integration.test.ts
```

**What it tests:**
- Authentication (401 without secret)
- Semester creation
- Idempotency (safe to run multiple times)
- ConfigID format validation (`1-2567` format)
- Timeslot/config seeding with `seedData=true`

### 2. Smoke Tests (Playwright)

E2E tests for all seeded terms:

```bash
# Local
pnpm test:e2e e2e/smoke/semester-smoke.spec.ts

# Production
PLAYWRIGHT_BASE_URL=https://phrasongsa-timetable.vercel.app pnpm test:e2e e2e/smoke/semester-smoke.spec.ts
```

**What it tests:**
- Schedule config pages (`/schedule/{term}/config`) return 200 OK
- Dashboard pages (`/dashboard/{term}/all-timeslot`) return 200 OK
- Critical UI elements render (tables, pagination, metrics)
- No runtime console errors
- Invalid route handling

---

## 📋 Seeded Terms (Default)

| Term | ConfigID | Routes |
|------|----------|--------|
| Semester 1/2567 | `1-2567` | `/schedule/1-2567/config`, `/dashboard/1-2567/all-timeslot` |
| Semester 2/2567 | `2-2567` | `/schedule/2-2567/config`, `/dashboard/2-2567/all-timeslot` |
| Semester 1/2568 | `1-2568` | `/schedule/1-2568/config`, `/dashboard/1-2568/all-timeslot` |
| Semester 2/2568 | `2-2568` | `/schedule/2-2568/config`, `/dashboard/2-2568/all-timeslot` |

---

## 🔧 Troubleshooting

### "Unauthorized" Error

**Problem:** API returns 401

**Solution:** Check `SEED_SECRET` environment variable:

```bash
# Set in Vercel (production)
npx vercel env add SEED_SECRET

# Set locally (.env.local)
SEED_SECRET=df83c9b4a1e2f5d6c3a8b9e0f1d2c3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0
```

### "404 Not Found" on Routes

**Problem:** Routes like `/dashboard/1-2567/...` return 404

**Solution:** Verify semesters were created:

```powershell
# Check production
$response = Invoke-RestMethod -Uri "https://phrasongsa-timetable.vercel.app/api/admin/seed-semesters?secret=$SECRET"
$response.results
```

### Tests Fail with "Cannot find module"

**Problem:** Integration tests fail to import

**Solution:** Ensure test environment is configured:

```bash
# Check Jest config
cat jest.config.js

# Install dependencies
pnpm install
```

### Playwright Tests Timeout

**Problem:** E2E tests timeout waiting for elements

**Solution:** Increase timeout or check network:

```bash
# Increase timeout
PLAYWRIGHT_TIMEOUT=30000 pnpm test:e2e

# Debug mode
pnpm test:e2e:debug e2e/smoke/semester-smoke.spec.ts
```

---

## 🔒 Security Notes

- **Never commit** `SEED_SECRET` to version control
- **Rotate secret** if accidentally exposed
- **Restrict access** to seed API (admin-only via secret)
- **Use HTTPS** for production seed operations

---

## 📚 Related Docs

- [CONFIGID_FORMAT_MIGRATION.md](./CONFIGID_FORMAT_MIGRATION.md) - ConfigID format standardization
- [PRODUCTION_SEED_GUIDE.md](./PRODUCTION_SEED_GUIDE.md) - Detailed seeding guide
- [QUICK_SEED_SETUP.md](./QUICK_SEED_SETUP.md) - Quick setup instructions

---

## ✅ Post-Seeding Verification

After seeding production:

1. **Check routes:**
   ```bash
   curl -I https://phrasongsa-timetable.vercel.app/dashboard/1-2567/all-timeslot
   curl -I https://phrasongsa-timetable.vercel.app/schedule/2-2568/config
   ```

2. **Run smoke tests:**
   ```bash
   PLAYWRIGHT_BASE_URL=https://phrasongsa-timetable.vercel.app pnpm test:e2e e2e/smoke/semester-smoke.spec.ts
   ```

3. **Verify UI:**
   - Visit each route manually
   - Check for teacher tables, pagination, metrics
   - Ensure no console errors

4. **Check database:**
   - Confirm semesters exist in Prisma Studio
   - Verify timeslots were created (if using `-SeedData`)

---

## 🚀 CI/CD Integration

Add to your deployment pipeline:

```yaml
# .github/workflows/deploy.yml
- name: Seed production semesters
  run: |
    ./scripts/seed-production.ps1 -SeedData
  env:
    SEED_SECRET: ${{ secrets.SEED_SECRET }}

- name: Run smoke tests
  run: |
    PLAYWRIGHT_BASE_URL=${{ secrets.PRODUCTION_URL }} pnpm test:e2e e2e/smoke/semester-smoke.spec.ts
```

This ensures semesters are always available after deployment.
