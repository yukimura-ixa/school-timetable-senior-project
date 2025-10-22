# Test Environment Setup Guide

**Last Updated:** October 22, 2025  
**Purpose:** Complete guide for running unit, integration, and E2E tests

---

## 🚀 Quick Start: Running Tests

### Unit & Integration Tests (Jest)
```bash
# Run all unit/integration tests (excludes E2E)
pnpm test

# Run specific test file
pnpm test schedule-arrangement.actions.test.ts

# Run tests in watch mode
pnpm test:watch

# Run with coverage
pnpm test -- --coverage
```

**What's Tested:**
- Domain layer: Conflict detection service (28 tests)
- Infrastructure layer: Repository data access (10 tests)
- Application layer: Server Actions (11 tests)
- Component tests, utility functions, seed validation

**Total:** 88 tests

### E2E Tests (Playwright)
```bash
# Run all E2E tests (headless)
pnpm test:e2e

# Run E2E with UI mode (interactive)
pnpm test:e2e:ui

# Run E2E in headed mode (see browser)
pnpm test:e2e:headed

# Debug specific test
pnpm test:e2e:debug

# List all E2E tests
pnpm test:e2e --list

# View last test report
pnpm test:report
```

**What's Tested:**
- Home page & authentication (3 tests)
- Data management (7 tests)
- Schedule configuration (5 tests)
- Timetable arrangement (7 tests)
- Viewing & exports (8 tests)

**Total:** 30 E2E tests

---

## 📊 Test Configuration

### Jest Configuration (`jest.config.js`)

**Key Settings:**
- **testEnvironment:** `jest-environment-jsdom` (React component testing)
- **testPathIgnorePatterns:** Excludes `/e2e/` directory (Playwright tests)
- **transformIgnorePatterns:** Handles `next-auth` ESM modules
- **moduleNameMapper:** Path aliases (`@/...`)

### Playwright Configuration (`playwright.config.ts`)

**Key Settings:**
- **Browser:** Chromium only (optimized for speed)
- **Base URL:** `http://localhost:3000`
- **Environment:** Loads `.env.test` automatically
- **Retries:** 0 (fail fast for debugging)
- **Workers:** 1 (sequential execution)

---

## 🎯 Overview

This guide explains how to properly configure environment variables for E2E testing, including API base URL configuration and test-specific settings.

---

## 📋 Environment Files

### 1. `.env.test` (E2E Testing)

Created for Playwright E2E tests. This file is automatically loaded by `playwright.config.ts`.

**Location:** `b:\Dev\school-timetable-senior-project\.env.test`

**Purpose:**
- Configure test-specific environment variables
- Set API base URL for test environment
- Enable dev bypass for easier test authentication
- Use separate test database (optional)

**Key Variables:**
```bash
# API Configuration - CRITICAL for fixing "Invalid URL" errors
NEXT_PUBLIC_API_HOST="http://localhost:3001/api"

# Auth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="test-secret-key"
ENABLE_DEV_BYPASS="true"

# Test Database (optional)
DATABASE_URL="mysql://root:password@localhost:3306/school-timetable-db-test?..."
```

### 2. `.env.example` (Updated)

Now includes `NEXT_PUBLIC_API_HOST` configuration with documentation.

**New Addition:**
```bash
# API Configuration
# Backend API base URL - used by axios for all API calls
NEXT_PUBLIC_API_HOST="http://localhost:3001/api"
```

---

## 🔧 Configuration Changes Made

### 1. Fixed `useMemo` Import (teacher-table/page.tsx)

**Issue:** Missing React hook import causing runtime error

**Fix:**
```typescript
// Before
import React, { useRef, useState } from "react";

// After  
import React, { useMemo, useRef, useState } from "react";
```

**Files Fixed:**
- `src/app/dashboard/[semesterAndyear]/teacher-table/page.tsx`

### 2. Added API Base URL Configuration

**Issue:** `axios` baseURL undefined, causing "Invalid URL" errors in tests

**Root Cause:**
```typescript
// src/libs/axios.ts
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_HOST, // ❌ Was undefined
  timeout: 60000,
  // ...
});
```

**Fix:**
- Added `NEXT_PUBLIC_API_HOST` to `.env.example`
- Created `.env.test` with test-specific API URL
- Updated `playwright.config.ts` to load `.env.test`

### 3. Enhanced Playwright Configuration

**Before:**
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  // ... config
});
```

**After:**
```typescript
import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '.env.test') });

export default defineConfig({
  // ... config
});
```

**Why:** Ensures test-specific environment variables are loaded before tests run.

---

## 🚀 Setup Instructions

### Step 1: Install dotenv (if not already installed)

```powershell
pnpm add -D dotenv
```

### Step 2: Create `.env.test` File

```powershell
# Copy from template or create manually
New-Item -Path ".env.test" -ItemType File
```

Then add the content from this document.

### Step 3: Configure API Base URL

**Option A: Mock API Server (Recommended for isolated testing)**
```bash
NEXT_PUBLIC_API_HOST="http://localhost:3001/api"
```

**Option B: Actual Development API**
```bash
NEXT_PUBLIC_API_HOST="http://localhost:3000/api"
```

**Option C: Empty (Test error handling)**
```bash
# NEXT_PUBLIC_API_HOST=""
```

### Step 4: Update `.env` for Development

```powershell
# Copy example to .env if not exists
if (!(Test-Path .env)) {
  Copy-Item .env.example .env
}
```

Then edit `.env` and set:
```bash
NEXT_PUBLIC_API_HOST="http://localhost:3001/api"
```

### Step 5: Verify Configuration

```powershell
# Run a single test to verify
pnpm exec playwright test e2e/01-home-page.spec.ts --headed
```

---

## 🧪 Testing Scenarios

### Scenario 1: With Mock API Server

1. Start mock API server on port 3001
2. Set `NEXT_PUBLIC_API_HOST="http://localhost:3001/api"` in `.env.test`
3. Run tests: `pnpm test:e2e`

### Scenario 2: With Real API (Next.js API Routes)

1. Ensure Next.js dev server is running (includes API routes)
2. Set `NEXT_PUBLIC_API_HOST="http://localhost:3000/api"` in `.env.test`
3. Run tests: `pnpm test:e2e`

### Scenario 3: Testing Error Handling

1. Leave `NEXT_PUBLIC_API_HOST` empty or set to invalid URL
2. Run tests to verify error handling works correctly
3. Should see proper error states in UI

---

## 📝 Environment Variable Reference

### Required for E2E Tests

| Variable | Purpose | Example |
|----------|---------|---------|
| `NEXT_PUBLIC_API_HOST` | Axios base URL | `http://localhost:3001/api` |
| `NEXTAUTH_URL` | NextAuth base URL | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | NextAuth encryption | `test-secret-key` |
| `ENABLE_DEV_BYPASS` | Enable dev login | `true` |

### Optional for E2E Tests

| Variable | Purpose | Default |
|----------|---------|---------|
| `BASE_URL` | Playwright base URL | `http://localhost:3000` |
| `DATABASE_URL` | Test database connection | Same as dev |
| `DEV_USER_EMAIL` | Test user email | `test@example.com` |

---

## 🐛 Troubleshooting

### Issue: "Invalid URL" Errors in Tests

**Symptoms:**
```
TypeError: Invalid URL
  at fetcher (src\libs\axios.ts:20:32)
  input: '/teacher'
```

**Solution:**
1. Check `.env.test` exists
2. Verify `NEXT_PUBLIC_API_HOST` is set
3. Restart Playwright tests
4. Check `playwright.config.ts` loads dotenv

### Issue: API Calls Not Working

**Symptoms:**
- Tests hang or timeout
- No API responses

**Solution:**
1. Verify API server is running (if using mock)
2. Check API URL is correct
3. Test API manually: `curl http://localhost:3001/api/teacher`
4. Check CORS settings if using separate API server

### Issue: Environment Variables Not Loading

**Symptoms:**
- `process.env.NEXT_PUBLIC_API_HOST` is undefined in tests
- Tests use wrong configuration

**Solution:**
1. Verify `dotenv` is installed: `pnpm list dotenv`
2. Check path in `playwright.config.ts` is correct
3. Add debug log:
   ```typescript
   console.log('API Host:', process.env.NEXT_PUBLIC_API_HOST);
   ```
4. Restart Playwright test runner

---

## 🔐 Security Notes

### `.env.test` File

- ✅ **Safe to commit** if it contains only test values
- ⚠️ **Add to .gitignore** if it contains real credentials
- ✅ **Use separate test database** to avoid data corruption
- ✅ **Never use production credentials** in test files

### API Configuration

- ✅ **Use localhost URLs** for testing
- ✅ **Use HTTPS** in production
- ⚠️ **Validate API URLs** before use
- ✅ **Mock sensitive APIs** in tests

---

## 📚 Related Documentation

- [E2E Test Execution Guide](E2E_TEST_EXECUTION_GUIDE.md)
- [E2E Test Implementation Summary](E2E_IMPLEMENTATION_SUMMARY.md)
- [Development Guide](DEVELOPMENT_GUIDE.md)
- [Playwright Configuration](https://playwright.dev/docs/test-configuration)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)

---

## ✅ Verification Checklist

After setup, verify:

- [ ] `.env.test` file exists with correct values
- [ ] `NEXT_PUBLIC_API_HOST` is set in `.env.test`
- [ ] `playwright.config.ts` loads `.env.test`
- [ ] `dotenv` package is installed
- [ ] `.env` file has `NEXT_PUBLIC_API_HOST` for development
- [ ] Single test runs successfully
- [ ] API calls work in tests (check browser console)
- [ ] No "Invalid URL" errors in test output

---

## 🎯 Next Steps

1. ✅ **Run Full Test Suite**
   ```powershell
   pnpm test:e2e
   ```

2. ✅ **Verify All Tests Pass**
   - Check for remaining "Invalid URL" errors
   - Verify API responses are correct
   - Confirm all auth flows work

3. ✅ **Document Any Issues**
   - Add to troubleshooting section
   - Create GitHub issues if needed
   - Update configuration as needed

---

**Document Version:** 1.0  
**Last Updated:** October 20, 2025  
**Status:** ✅ Configuration Complete
