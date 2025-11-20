# Test Database Setup Guide

This document explains how to set up the test database for E2E tests.

## 🎯 **Two Options Available**

### **Option 1: Local PostgreSQL (Recommended for Development)**

Use your local PostgreSQL installation. No Docker required.

#### **Prerequisites**
- PostgreSQL 16+ installed on Windows
- PostgreSQL service running

#### **Setup Steps**

1. **Run the setup script:**
   ```powershell
   .\scripts\setup-local-test-db.ps1
   ```

   This will:
   - Create `test_timetable` database
   - Create `test_user` with password `test_password`
   - Apply Prisma migrations
   - Grant all necessary privileges

2. **Verify the setup:**
   ```powershell
   psql -U test_user -d test_timetable -h localhost -p 5432
   ```

3. **Run tests:**
   ```powershell
   pnpm test:e2e
   ```

#### **Manual Setup (Alternative)**

If you prefer manual setup:

```sql
-- Connect to PostgreSQL as superuser
psql -U postgres

-- Create database and user
CREATE DATABASE test_timetable;
CREATE USER test_user WITH PASSWORD 'test_password';
GRANT ALL PRIVILEGES ON DATABASE test_timetable TO test_user;

-- Exit and apply migrations
\q
```

Then run migrations:
```powershell
$env:DATABASE_URL="postgresql://test_user:test_password@localhost:5432/test_timetable?schema=public"
pnpm prisma migrate deploy
```

---

### **Option 2: Docker Compose (CI/CD & Isolated Testing)**

Use Docker containers for complete isolation.

#### **Prerequisites**
- Docker Desktop installed and running
- No local PostgreSQL on port 5433

#### **Setup Steps**

1. **Start the test database:**
   ```powershell
   docker compose -f docker-compose.test.yml up -d
   ```

2. **Verify it's running:**
   ```powershell
   docker ps | Select-String "timetable-test-db"
   ```

3. **Run tests:**
   ```powershell
   pnpm test:e2e
   ```

4. **Stop when done:**
   ```powershell
   docker compose -f docker-compose.test.yml down
   ```

---

## 🔧 **Configuration Files**

### **`.env.test`**
Contains test environment variables, including:
- `DATABASE_URL` - Database connection string
- `ENABLE_DEV_BYPASS=true` - Bypass auth for E2E tests
- `TEST_PASSWORD` - Test user password

### **Current Configuration**

The project is currently configured to use **local PostgreSQL** (localhost:5432).

To switch to Docker:
```env
# In .env.test
DATABASE_URL="postgresql://test_user:test_password@127.0.0.1:5433/test_timetable?schema=public&connection_limit=5&pool_timeout=20&connect_timeout=10"
```

---

## 🧪 **Troubleshooting**

### **"Connection refused" Error**

**Cause:** PostgreSQL service not running

**Solution:**
```powershell
# Check service status
Get-Service -Name "postgresql*"

# Start service (replace with your service name)
net start postgresql-x64-16
```

### **"password authentication failed for user 'test_user'"**

**Cause:** User or password not configured correctly

**Solution:**
```sql
-- Connect as superuser
psql -U postgres

-- Reset password
ALTER USER test_user WITH PASSWORD 'test_password';
```

### **"database 'test_timetable' does not exist"**

**Cause:** Database not created

**Solution:**
```powershell
# Run setup script
.\scripts\setup-local-test-db.ps1
```

### **Migrations Not Applied**

**Solution:**
```powershell
# Set environment variable
$env:DATABASE_URL="postgresql://test_user:test_password@localhost:5432/test_timetable?schema=public"

# Apply migrations
pnpm prisma migrate deploy

# Verify
pnpm prisma db pull
```

---

## 📊 **Database Seeding**

For testing with realistic data:

```powershell
# Seed with full mock data
pnpm db:seed:clean

# Or seed minimal data
pnpm db:seed
```

---

## 🚀 **Quick Commands**

### **Reset Test Database**
```powershell
# Drop and recreate
dropdb -U postgres test_timetable
createdb -U postgres test_timetable -O test_user

# Reapply migrations
$env:DATABASE_URL="postgresql://test_user:test_password@localhost:5432/test_timetable?schema=public"
pnpm prisma migrate deploy
```

### **Check Connection**
```powershell
# Test connection
psql -U test_user -d test_timetable -h localhost -c "SELECT version();"
```

### **View Database**
```powershell
# Open Prisma Studio
pnpm db:studio

# Or use psql
psql -U test_user -d test_timetable
```

---

## 📝 **Best Practices**

1. **Use local PostgreSQL for development** - Faster and no Docker overhead
2. **Use Docker in CI/CD** - Consistent, isolated environment
3. **Reset database between test runs** - Prevents data contamination
4. **Never use production credentials** - Test database is separate

---

## 🔗 **Related Files**

- `.env.test` - Test environment configuration
- `docker-compose.test.yml` - Docker database setup
- `scripts/setup-local-test-db.ps1` - Local setup script
- `scripts/run-e2e-tests.mjs` - E2E test runner
- `playwright.config.ts` - Playwright configuration

---

**Last Updated:** 2025-11-21  
**Database Version:** PostgreSQL 16
