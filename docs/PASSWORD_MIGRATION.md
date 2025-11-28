# Password Migration Guide: BCrypt → Scrypt

## Overview

This guide covers migrating user passwords from bcrypt to scrypt hashing, following the better-auth migration completed on 2025-11-28.

## Why This Migration?

- **Better Security**: scrypt is more resistant to brute-force attacks
- **No Dependencies**: Uses Node's built-in crypto module
- **Better-Auth Alignment**: Matches better-auth's default recommendation
- **Consistency**: All password hashing now uses the same algorithm

## What Changed

### Code Changes (✅ Complete)

- `src/lib/auth.ts` - Now uses scrypt for password verification
- `prisma/seed.ts` - Creates scrypt hashes
- All helper scripts - Use scrypt for new users

### Database Impact

- **Existing users**: Passwords are still bcrypt-hashed (incompatible!)
- **New users**: Will get scrypt hashes
- **Result**: Existing users cannot log in until migrated

---

## Migration Options

### Option 1: Test/Development Environment (Recommended)

**For local development and CI/CD:**

```bash
# Simple: Just reseed the database
pnpm db:seed:clean
```

This creates fresh admin user with scrypt hash.

**Already Done:**

- ✅ CI workflows updated (e2e-tests.yml, smoke-tests.yml)
- ✅ Both use consistent AUTH_SECRET
- ✅ Both run `pnpm db:seed:clean` which creates scrypt hashes

### Option 2: Production Environment

**⚠️ IMPORTANT**: You **cannot** automatically migrate existing bcrypt hashes to scrypt without the plaintext passwords.

#### Sub-Option 2A: Reset Admin Password (Safest)

Update just the admin user:

```bash
# Connect to production database
DATABASE_URL="your-production-url" pnpm tsx scripts/reset-production-admin.ts
```

This will:

1. Show current admin user status
2. Ask for confirmation
3. Reset password to `admin123` with scrypt hash
4. Remind you to change the password

#### Sub-Option 2B: Analyze Current State

Check what needs migration:

```bash
# Dry run - shows what would be changed
DATABASE_URL="your-production-url" pnpm tsx scripts/migrate-passwords-to-scrypt.ts
```

Output will show:

- How many users have bcrypt hashes
- How many already have scrypt hashes
- Migration recommendations

#### Sub-Option 2C: Full Database Reseed (DESTRUCTIVE)

```bash
# ⚠️ WARNING: This deletes ALL data!
DATABASE_URL="your-production-url" pnpm db:seed:clean
```

Only use this if:

- You have no production data yet
- You have a backup
- You're okay losing all existing data

---

## For CI/CD (✅ Already Done)

### E2E Tests (`.github/workflows/e2e-tests.yml`)

```yaml
# These steps ensure scrypt hashes:
- name: Seed test database
  run: pnpm db:seed:clean # Creates scrypt hashes
  env:
    AUTH_SECRET: ci-test-secret-e2e-playwright # Consistent secret

- name: Run E2E tests
  env:
    AUTH_SECRET: ci-test-secret-e2e-playwright # Same secret
```

### Smoke Tests (`.github/workflows/smoke-tests.yml`)

```yaml
# Same pattern:
- name: Seed test database
  run: pnpm db:seed:clean # Creates scrypt hashes
  env:
    AUTH_SECRET: ci-test-secret-smoke-tests # Consistent secret

- name: Run smoke tests
  env:
    AUTH_SECRET: ci-test-secret-smoke-tests # Same secret
```

**Key Point**: `AUTH_SECRET` must be the same during seeding and testing.

---

## Technical Details

### Scrypt Hash Format

```
salt:derivedKey
```

Example:

```
a37ae811fab46e0ac4969c64f0610f5b:7f9f1798cb4b99a633f2c4d3da88179888c7...
```

- **Salt**: 16 bytes, hex-encoded (32 characters)
- **Derived Key**: 64 bytes, hex-encoded (128 characters)
- **Total Length**: ~161 characters

### BCrypt Hash Format (Old)

```
$2a$10$randomsaltandhashhere...
```

Example:

```
$2a$10$N9qo8uLO Gmavl.oK5NC2O1F5u7PWU4u6X.pBr5AE9d.Qb9KqyT5i
```

---

## Verification

### Check Local Database

```bash
# Start local test database
pnpm test:db:up

# Create admin with scrypt
DATABASE_URL="postgresql://test_user:test_password@localhost:5433/test_timetable" \
  pnpm tsx scripts/create-admin.ts

# Verify hash format
docker exec timetable-test-db psql -U test_user -d test_timetable \
  -c "SELECT email, SUBSTRING(password, 1, 70) FROM \"User\" WHERE email = 'admin@school.local';"
```

Expected output shows scrypt hash (hex with colon).

### Check Production Database

```bash
# Analyze production passwords
DATABASE_URL="your-production-url" pnpm tsx scripts/migrate-passwords-to-scrypt.ts
```

---

## Troubleshooting

### Issue: "Login fails after migration"

**Cause**: User still has bcrypt hash but auth.ts expects scrypt.

**Solution**: Reset that user's password with scrypt:

```bash
DATABASE_URL="your-db-url" pnpm tsx scripts/create-admin.ts
```

### Issue: "CI tests fail with 401 Unauthorized"

**Cause**: AUTH_SECRET mismatch between seed and test steps.

**Solution**: Check that both steps use the same `AUTH_SECRET`:

```yaml
- name: Seed
  env:
    AUTH_SECRET: ci-test-secret-e2e-playwright

- name: Test
  env:
    AUTH_SECRET: ci-test-secret-e2e-playwright # Must match!
```

### Issue: "Hash format: unknown"

**Cause**: Password hash doesn't match bcrypt or scrypt format.

**Solution**: Check the hash manually, then reset:

```bash
DATABASE_URL="your-db-url" pnpm tsx scripts/reset-production-admin.ts
```

---

## Migration Checklist

### Development ✅

- [x] Update code to use scrypt
- [x] Create `.env.local` with test database
- [x] Reseed local database
- [x] Verify admin login works
- [x] Test E2E locally

### CI/CD ✅

- [x] Update e2e-tests.yml (already correct)
- [x] Update smoke-tests.yml (already correct)
- [x] Verify AUTH_SECRET consistency
- [x] Tests pass in CI

### Production ⚠️

- [ ] Analyze current users (`scripts/migrate-passwords-to-scrypt.ts`)
- [ ] Reset admin password (`scripts/reset-production-admin.ts`)
- [ ] OR reseed database (`pnpm db:seed:clean`)
- [ ] Verify admin login works
- [ ] Update any other user accounts as needed

---

## Summary

✅ **Code Migration**: Complete  
✅ **CI/CD Setup**: Complete  
⚠️ **Production Migration**: Use `scripts/reset-production-admin.ts`

The migration is backward-incompatible by design - once you switch to scrypt, bcrypt hashes won't work. This is intentional for security.
