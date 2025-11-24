# Next.js Dev Server Background Mode Best Practices

**CRITICAL: When starting a Next.js dev server for testing, ALWAYS start it in a separate terminal or background mode.**

## Why This Matters

Starting `pnpm dev` or `pnpm dev:e2e` in the current terminal will:

- ❌ Block the terminal from executing subsequent commands
- ❌ Force you to stop the server to run other commands
- ❌ Potentially interrupt test execution if server is stopped mid-run

## Best Practices

### Option 1: Separate Terminal (Recommended for Development)

```powershell
# Terminal 1: Start dev server
pnpm dev:e2e

# Terminal 2: Run tests
pnpm test:e2e
```

### Option 2: Background Process (PowerShell)

```powershell
# Start dev server in background
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "pnpm dev:e2e"

# Run tests in current terminal
pnpm test:e2e
```

### Option 3: Use Playwright's reuseExistingServer (Current Setup)

```typescript
// playwright.config.ts
webServer: {
  command: 'pnpm dev:e2e',
  url: 'http://localhost:3000',
  reuseExistingServer: true, // ✅ Won't start if already running
  timeout: 120 * 1000,
}
```

**With this config:**

- Playwright will NOT start a new server if one is already running on port 3000
- You can manually start server in separate terminal and keep it running
- Playwright tests will detect and use existing server

### Option 4: Skip Playwright's Web Server Management

```powershell
# Set environment variable to skip auto-server
$env:SKIP_WEBSERVER = "true"

# Start server manually in background or separate terminal
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "pnpm dev:e2e"

# Run tests (won't try to start server)
pnpm test:e2e
```

## Current Project Configuration

**Package.json Scripts:**

- `dev` - Standard dev server (loads .env)
- `dev:e2e` - E2E test server (loads .env.test via dotenv-cli)

**Playwright Config:**

- Uses `reuseExistingServer: true` ✅
- Timeout: 120 seconds for server startup
- Port: 3000

## Recommendations for This Project

1. **Development workflow:**
   - Terminal 1: `pnpm dev:e2e` (keep running)
   - Terminal 2: `pnpm test:e2e` (run as needed)

2. **CI/CD workflow:**
   - Let Playwright manage server lifecycle (current setup works)
   - `reuseExistingServer: true` prevents conflicts in parallel runs

3. **Debugging workflow:**
   - Start server manually in separate terminal with verbose logging
   - Set `SKIP_WEBSERVER=true` to prevent Playwright from managing it
   - Run tests with `--debug` or `--ui` flags

## Common Issues Avoided

✅ **Avoided:** Terminal blocked by dev server  
✅ **Avoided:** Stopping server mid-test  
✅ **Avoided:** Port conflicts from multiple server instances  
✅ **Avoided:** HMR/Fast Refresh interfering with tests (can disable in manual server)

## Last Updated

November 12, 2025 - Added during E2E test stabilization work
