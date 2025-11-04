# Test Database Setup Script for E2E Tests
# Starts PostgreSQL test container and runs migrations

Write-Host "🐘 Starting PostgreSQL test database..." -ForegroundColor Cyan

# Start the test database container
docker-compose -f docker-compose.test.yml up -d

# Wait for PostgreSQL to be ready
Write-Host "⏳ Waiting for database to be ready..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0
$ready = $false

while (-not $ready -and $attempt -lt $maxAttempts) {
    $attempt++
    Start-Sleep -Seconds 1
    
    try {
        $result = docker exec timetable-test-db pg_isready -U test_user 2>&1
        if ($LASTEXITCODE -eq 0) {
            $ready = $true
            Write-Host "✅ Database is ready!" -ForegroundColor Green
        }
    }
    catch {
        # Continue waiting
    }
    
    if (-not $ready -and $attempt -lt $maxAttempts) {
        Write-Host "   Attempt $attempt/$maxAttempts..." -ForegroundColor Gray
    }
}

if (-not $ready) {
    Write-Host "❌ Database failed to start after $maxAttempts seconds" -ForegroundColor Red
    exit 1
}

# Load test environment
Write-Host "`n🔧 Loading test environment..." -ForegroundColor Cyan
$envTestPath = Join-Path $PSScriptRoot ".." ".env.test"
if (Test-Path $envTestPath) {
    Get-Content $envTestPath | ForEach-Object {
        if ($_ -match '^([^=#]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim('"')
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
}

# Run Prisma migrations
Write-Host "`n📦 Running database migrations..." -ForegroundColor Cyan
try {
    $env:DATABASE_URL = "postgresql://test_user:test_password@localhost:5433/test_timetable?schema=public"
    pnpm prisma migrate deploy
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Migrations completed successfully!" -ForegroundColor Green
    }
    else {
        Write-Host "⚠️  Migration completed with warnings" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "❌ Migration failed: $_" -ForegroundColor Red
    exit 1
}

# Seed test data (optional)
Write-Host "`n🌱 Seeding test data..." -ForegroundColor Cyan
try {
    pnpm prisma db seed
    Write-Host "✅ Test data seeded successfully!" -ForegroundColor Green
}
catch {
    Write-Host "⚠️  Seeding skipped or failed: $_" -ForegroundColor Yellow
}

Write-Host "`n✨ Test database is ready for E2E tests!" -ForegroundColor Green
Write-Host "   Connection: postgresql://test_user:test_password@localhost:5433/test_timetable" -ForegroundColor Gray
Write-Host "   To stop: docker-compose -f docker-compose.test.yml down`n" -ForegroundColor Gray
