# Script to run E2E tests with proper environment setup# E2E Test Runner with Automatic Database Lifecycle Management

# This ensures the dev server uses .env.test for auth bypass# PowerShell version for Windows

# Usage: .\scripts\run-e2e-tests.ps1 [playwright-args]

$ErrorActionPreference = "Stop"

param(

Write-Host "🔧 E2E Test Runner: Setting up test environment..." -ForegroundColor Cyan    [Parameter(ValueFromRemainingArguments=$true)]

Write-Host ""    [string[]]$PlaywrightArgs = @()

)

# 1. Check if dev server is running on port 3000

$port3000 = netstat -ano | Select-String ":3000.*LISTENING"# Configuration

if ($port3000) {$AutoManage = $env:AUTO_MANAGE_TEST_DB -ne 'false'

    Write-Host "⚠️  Dev server is already running on port 3000" -ForegroundColor Yellow$SkipCleanup = $env:SKIP_DB_CLEANUP -eq 'true'

    Write-Host "   Please stop it first to run E2E tests with test environment"$DbStarted = $false

    Write-Host ""$ExitCode = 0

    

    # Extract PID from netstat output# Color functions

    $pid = ($port3000 -split '\s+')[-1]function Write-ColorOutput {

    Write-Host "   To stop: taskkill /F /PID $pid" -ForegroundColor Yellow    param(

    Write-Host "   Or press Ctrl+C in the dev server terminal"        [string]$Message,

    exit 1        [string]$Color = 'White'

}    )

    Write-Host $Message -ForegroundColor $Color

# 2. Load .env.test and start dev server}

Write-Host "🚀 Starting Next.js dev server with .env.test..." -ForegroundColor Green

function Test-DockerAvailable {

# Load env vars from .env.test    try {

Get-Content .env.test | ForEach-Object {        docker --version 2>&1 | Out-Null

    if ($_ -notmatch '^\s*#' -and $_ -match '=') {        return $LASTEXITCODE -eq 0

        $parts = $_ -split '=', 2    }

        $key = $parts[0].Trim()    catch {

        $value = $parts[1].Trim().Trim('"')        return $false

        [Environment]::SetEnvironmentVariable($key, $value, 'Process')    }

    }}

}

function Test-DatabaseRunning {

# Start dev server in background    try {

$devServer = Start-Process -FilePath "pnpm" -ArgumentList "dev" -PassThru -NoNewWindow -RedirectStandardOutput "dev-server.log" -RedirectStandardError "dev-server-error.log"        $result = docker ps --filter "name=timetable-test-db" --format "{{.Status}}" 2>$null

Write-Host "   Dev server PID: $($devServer.Id)" -ForegroundColor Gray        return $result -match '^Up'

Write-Host ""    }

    catch {

# 3. Wait for dev server to be ready        return $false

Write-Host "⏳ Waiting for dev server to be ready..." -ForegroundColor Yellow    }

$maxAttempts = 30}

$attempt = 0

function Wait-ForDatabase {

while ($attempt -lt $maxAttempts) {    param([int]$MaxAttempts = 30)

    try {    

        $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 1 -ErrorAction SilentlyContinue    Write-ColorOutput "⏳ Waiting for database to be ready..." Yellow

        if ($response.StatusCode -eq 200) {    

            Write-Host "✅ Dev server is ready!" -ForegroundColor Green    for ($attempt = 1; $attempt -le $MaxAttempts; $attempt++) {

            Write-Host ""        try {

            break            docker exec timetable-test-db pg_isready -U test_user 2>&1 | Out-Null

        }            if ($LASTEXITCODE -eq 0) {

    }                Write-ColorOutput "✅ Database is ready!`n" Green

    catch {                return $true

        # Server not ready yet            }

    }        }

            catch {

    $attempt++            # Continue waiting

    if ($attempt % 5 -eq 0) {        }

        Write-Host "   Still waiting... ($attempt/$maxAttempts)" -ForegroundColor Gray        

    }        Start-Sleep -Seconds 1

    Start-Sleep -Seconds 1        

}        if ($attempt % 5 -eq 0) {

            Write-ColorOutput "   Still waiting... ($attempt/$MaxAttempts)" Gray

if ($attempt -eq $maxAttempts) {        }

    Write-Host "❌ Dev server failed to start within timeout" -ForegroundColor Red    }

    Stop-Process -Id $devServer.Id -Force -ErrorAction SilentlyContinue    

    exit 1    Write-ColorOutput "❌ Database failed to start within timeout" Red

}    return $false

}

# 4. Run E2E tests

Write-Host "🧪 Running Playwright E2E tests..." -ForegroundColor Cyanfunction Start-TestDatabase {

Write-Host ""    Write-ColorOutput "🐘 Starting test database container..." Cyan

    

try {    try {

    $testArgs = $args -join ' '        docker compose -f docker-compose.test.yml up -d

    if ($testArgs) {        

        pnpm exec playwright test $testArgs        if ($LASTEXITCODE -eq 0) {

    } else {            if (Wait-ForDatabase) {

        pnpm exec playwright test                $script:DbStarted = $true

    }                return $true

    $testExitCode = $LASTEXITCODE            }

}        }

finally {    }

    # 5. Cleanup: stop dev server    catch {

    Write-Host ""        Write-ColorOutput "❌ Failed to start database: $_" Red

    Write-Host "🧹 Cleaning up: Stopping dev server..." -ForegroundColor Yellow    }

    Stop-Process -Id $devServer.Id -Force -ErrorAction SilentlyContinue    

        return $false

    # Clean up log files}

    Remove-Item -Path "dev-server.log" -ErrorAction SilentlyContinue

    Remove-Item -Path "dev-server-error.log" -ErrorAction SilentlyContinuefunction Stop-TestDatabase {

}    Write-ColorOutput "`n🛑 Stopping test database..." Cyan

    

exit $testExitCode    try {

        docker compose -f docker-compose.test.yml down
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "✅ Test database stopped`n" Green
        }
        else {
            Write-ColorOutput "⚠️  Failed to stop database`n" Yellow
        }
    }
    catch {
        Write-ColorOutput "⚠️  Failed to stop database: $_`n" Yellow
    }
}

function Invoke-Cleanup {
    if ($script:DbStarted -and -not $SkipCleanup) {
        Stop-TestDatabase
    }
    elseif ($script:DbStarted) {
        Write-ColorOutput "`nℹ️  Keeping database running (SKIP_DB_CLEANUP=true)" Gray
        Write-ColorOutput "   Stop manually with: docker compose -f docker-compose.test.yml down`n" Gray
    }
}

# Main script
try {
    Write-ColorOutput "`n🚀 E2E Test Runner with Automatic Database Management`n" Cyan
    
    # Check Docker availability
    if (-not (Test-DockerAvailable)) {
        Write-ColorOutput "⚠️  Docker not available" Yellow
        Write-ColorOutput "ℹ️  Assuming external database management`n" Gray
    }
    elseif (-not $AutoManage) {
        Write-ColorOutput "ℹ️  Automatic database management disabled" Gray
        Write-ColorOutput "   (AUTO_MANAGE_TEST_DB=false)`n" Gray
    }
    else {
        # Check if database is already running
        if (Test-DatabaseRunning) {
            Write-ColorOutput "ℹ️  Test database is already running" Gray
            Write-ColorOutput "   Reusing existing instance`n" Gray
        }
        else {
            # Start database
            if (-not (Start-TestDatabase)) {
                Write-ColorOutput "❌ Cannot proceed without database`n" Red
                exit 1
            }
        }
    }
    
    # Run Playwright tests
    Write-ColorOutput "🎭 Starting Playwright tests...`n" Cyan
    
    $playwrightCmd = "pnpm exec playwright test"
    if ($PlaywrightArgs.Count -gt 0) {
        $playwrightCmd += " " + ($PlaywrightArgs -join " ")
    }
    
    Invoke-Expression $playwrightCmd
    $ExitCode = $LASTEXITCODE
    
    # Show test summary
    if ($ExitCode -eq 0) {
        Write-ColorOutput "`n✅ All tests passed!`n" Green
    }
    else {
        Write-ColorOutput "`n⚠️  Tests completed with exit code: $ExitCode`n" Yellow
    }
}
catch {
    Write-ColorOutput "`n❌ Error: $_`n" Red
    $ExitCode = 1
}
finally {
    # Cleanup
    Invoke-Cleanup
}

exit $ExitCode
