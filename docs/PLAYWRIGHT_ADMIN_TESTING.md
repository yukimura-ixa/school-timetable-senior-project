# Playwright Admin Testing Guide

## Setup Complete ✅

Your Playwright configuration has been updated to support:
- **Playwright Chromium** (bundled, headless)
- **Brave Browser** (your installed browser)

## Browser Configuration

### Brave Browser
- **Path**: `C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe`
- **Project Name**: `brave`
- **Features**: 
  - Uses your installed Brave browser
  - Hidden automation flags
  - Better sandbox options

### Playwright Chromium
- **Path**: Auto-detected in `C:\Users\napat\AppData\Local\ms-playwright\chromium-1194`
- **Project Name**: `chromium`
- **Features**:
  - Bundled with Playwright
  - Lightweight headless mode
  - Consistent cross-platform

## Installation

Ensure Playwright browsers are installed:
```powershell
npx playwright install chromium
```

Or use the package.json script:
```powershell
pnpm run playwright:install
```

## Running Tests

### Quick Commands

#### Test Admin Auth Flow
```powershell
# Run with default browser (chromium, headless)
pnpm run test:e2e:admin

# Run with Brave (headed mode to see browser)
pnpm run test:e2e:admin:brave

# Debug mode (opens inspector)
pnpm run test:e2e:admin:debug
```

#### Run All E2E Tests
```powershell
# All tests with chromium (headless)
pnpm run test:e2e

# All tests with Brave
pnpm run test:e2e:brave

# All tests with UI mode (interactive)
pnpm run test:e2e:ui
```

#### Specific Project Selection
```powershell
# Force Chromium
pnpm run test:e2e:chromium

# Force Brave
pnpm run test:e2e:brave
```

### Advanced Options

#### Run with custom browser
```powershell
# Specify project explicitly
npx playwright test --project=brave

# Headed mode (see browser window)
npx playwright test --headed

# Debug mode
npx playwright test --debug

# Specific test file
npx playwright test e2e/admin-auth-flow.spec.ts
```

#### View Test Report
```powershell
pnpm run test:report
```

## Test File: `e2e/admin-auth-flow.spec.ts`

This new test suite covers:

### 1. Authentication Flow
- ✅ Sign-in page displays all options
- ✅ Admin credentials login (`admin@school.local` / `admin123`)
- ✅ Invalid credential error handling
- ✅ Form validation

### 2. Dashboard Navigation
- ✅ Semester selection page access
- ✅ Timetable management page
- ✅ Teacher management page
- ✅ Class management page
- ✅ Sign-out functionality

### 3. Visual UI Checks
- ✅ Console error detection
- ✅ Screenshot capture of all pages

## Expected Test Flow

1. **Navigate to `/signin`**
2. **Fill credentials**: `admin@school.local` / `admin123`
3. **Submit form**
4. **Verify redirect** to `/dashboard/select-semester`
5. **Navigate to other admin pages** (timetable, teachers, classes)
6. **Capture screenshots** for visual verification
7. **Test sign-out**

## Troubleshooting

### Brave Browser Not Found
If Brave path is incorrect, update `playwright.config.ts`:
```typescript
executablePath: 'YOUR_BRAVE_PATH_HERE',
```

### Chromium Installation Issues
```powershell
# Reinstall Playwright browsers
npx playwright install --force chromium
```

### Tests Failing Due to Timing
Adjust timeouts in `playwright.config.ts`:
```typescript
actionTimeout: 15000,      // Increase if needed
navigationTimeout: 30000,  // Increase if needed
```

### Dev Server Not Starting
Ensure `.env.test` exists and contains required environment variables:
```env
DATABASE_URL="your-test-db-url"
AUTH_SECRET="your-auth-secret"
```

## Output Locations

- **Screenshots**: `test-results/screenshots/`
- **Videos**: `test-results/artifacts/`
- **HTML Report**: `playwright-report/index.html`
- **Test Artifacts**: `test-results/artifacts/`

## Next Steps

1. **Run the admin flow test**:
   ```powershell
   pnpm run test:e2e:admin:brave
   ```

2. **Check the screenshots** in `test-results/screenshots/`

3. **Review the HTML report**:
   ```powershell
   pnpm run test:report
   ```

4. **Adjust selectors** if your UI differs from expectations

## Admin Credentials (Dev/Test)

- **Email**: `admin@school.local`
- **Password**: `admin123`

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Test Configuration](https://playwright.dev/docs/test-configuration)
- [Browser Selection](https://playwright.dev/docs/browsers)
