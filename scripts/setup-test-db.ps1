#!/usr/bin/env pwsh
# Test Database Setup Script
# Initializes local PostgreSQL test database in Docker for Jest unit tests

param(
    [switch]$SkipMigrations,
    [switch]$SkipSeed,
    [switch]$Force
)

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Test Database Setup" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "Checking Docker..." -ForegroundColor Yellow
try {
    docker ps > $null 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Docker is not running!" -ForegroundColor Red
        Write-Host "Please start Docker Desktop and try again." -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Docker is not installed or not accessible!" -ForegroundColor Red
    exit 1
}

# Check if test database is already running
$existingContainer = docker ps -a --filter "name=timetable-test-db" --format "{{.Names}}"
if ($existingContainer -and !$Force) {
    Write-Host ""
    Write-Host "Test database container already exists!" -ForegroundColor Yellow
    Write-Host "Options:" -ForegroundColor Yellow
    Write-Host "  1. Use existing (pnpm test:db:restart)" -ForegroundColor White
    Write-Host "  2. Remove and recreate (run with -Force flag)" -ForegroundColor White
    Write-Host ""
    $choice = Read-Host "Continue with existing container? (y/N)"
    if ($choice -ne "y" -and $choice -ne "Y") {
        Write-Host "Setup cancelled." -ForegroundColor Yellow
        exit 0
    }
} elseif ($existingContainer -and $Force) {
    Write-Host ""
    Write-Host "Removing existing container..." -ForegroundColor Yellow
    pnpm test:db:down
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to remove existing container!" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ Container removed" -ForegroundColor Green
}

# Start test database
Write-Host ""
Write-Host "Starting PostgreSQL test database..." -ForegroundColor Yellow
pnpm test:db:up
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to start test database!" -ForegroundColor Red
    exit 1
}

# Wait for database to be ready
Write-Host "Waiting for database to be ready..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0
$ready = $false

while ($attempt -lt $maxAttempts -and !$ready) {
    $attempt++
    Start-Sleep -Seconds 1
    
    $health = docker inspect --format='{{.State.Health.Status}}' timetable-test-db 2>$null
    if ($health -eq "healthy") {
        $ready = $true
    } else {
        Write-Host "." -NoNewline
    }
}

Write-Host ""
if (!$ready) {
    Write-Host "ERROR: Database failed to become healthy after 30 seconds!" -ForegroundColor Red
    Write-Host "Check logs with: pnpm test:db:logs" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ Database is ready" -ForegroundColor Green

# Apply migrations
if (!$SkipMigrations) {
    Write-Host ""
    Write-Host "Applying database migrations..." -ForegroundColor Yellow
    pnpm test:db:migrate
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Migration failed!" -ForegroundColor Red
        Write-Host "Try: pnpm test:db:reset" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "✓ Migrations applied" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Skipping migrations (use -SkipMigrations:$false to include)" -ForegroundColor Gray
}

# Seed database
if (!$SkipSeed) {
    Write-Host ""
    Write-Host "Seeding test data..." -ForegroundColor Yellow
    pnpm test:db:seed
    if ($LASTEXITCODE -ne 0) {
        Write-Host "WARNING: Seeding failed (you can run pnpm test:db:seed manually)" -ForegroundColor Yellow
    } else {
        Write-Host "✓ Test data seeded" -ForegroundColor Green
    }
} else {
    Write-Host ""
    Write-Host "Skipping seed (use -SkipSeed:$false to include)" -ForegroundColor Gray
}

# Success message
Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "✓ Test Database Setup Complete!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Database Info:" -ForegroundColor Cyan
Write-Host "  Host:     localhost" -ForegroundColor White
Write-Host "  Port:     5433" -ForegroundColor White
Write-Host "  Database: test_timetable" -ForegroundColor White
Write-Host "  User:     test_user" -ForegroundColor White
Write-Host "  Password: test_password" -ForegroundColor White
Write-Host ""
Write-Host "Connection String:" -ForegroundColor Cyan
Write-Host "  postgresql://test_user:test_password@localhost:5433/test_timetable" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Run tests:      pnpm test" -ForegroundColor White
Write-Host "  2. Watch mode:     pnpm test:watch" -ForegroundColor White
Write-Host "  3. View logs:      pnpm test:db:logs" -ForegroundColor White
Write-Host "  4. Stop database:  pnpm test:db:down" -ForegroundColor White
Write-Host ""
Write-Host "See TEST_DATABASE.md for more information." -ForegroundColor Gray
Write-Host ""
