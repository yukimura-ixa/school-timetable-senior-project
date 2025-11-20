#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Setup local PostgreSQL test database for E2E tests

.DESCRIPTION
    Creates test database and user on local PostgreSQL server.
    This script is an alternative to using Docker Compose for test database.

.EXAMPLE
    .\scripts\setup-local-test-db.ps1
#>

$ErrorActionPreference = "Stop"

Write-Host "🗄️  Setting up local PostgreSQL test database..." -ForegroundColor Cyan

# Database credentials (matching .env.test)
$DB_NAME = "test_timetable"
$DB_USER = "test_user"
$DB_PASSWORD = "test_password"

# Check if PostgreSQL is installed and running
Write-Host "`n📋 Checking PostgreSQL installation..." -ForegroundColor Yellow

try {
    $psqlVersion = psql --version
    Write-Host "✅ PostgreSQL found: $psqlVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ PostgreSQL not found. Please install PostgreSQL first." -ForegroundColor Red
    Write-Host "   Download from: https://www.postgresql.org/download/windows/" -ForegroundColor Gray
    exit 1
}

# Check if PostgreSQL service is running
$pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
if ($pgService -and $pgService.Status -eq "Running") {
    Write-Host "✅ PostgreSQL service is running" -ForegroundColor Green
} else {
    Write-Host "⚠️  PostgreSQL service might not be running" -ForegroundColor Yellow
    Write-Host "   Try: net start postgresql-x64-16 (or your PostgreSQL service name)" -ForegroundColor Gray
}

Write-Host "`n🔧 Creating test database and user..." -ForegroundColor Cyan

# Create SQL commands
$sqlCommands = @"
-- Drop database if exists (for clean setup)
DROP DATABASE IF EXISTS $DB_NAME;

-- Drop user if exists
DROP USER IF EXISTS $DB_USER;

-- Create user
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';

-- Create database
CREATE DATABASE $DB_NAME OWNER $DB_USER;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
"@

# Execute SQL commands
# Note: Update 'postgres' username if your PostgreSQL uses different superuser
try {
    $sqlCommands | psql -U postgres -h localhost -p 5432
    Write-Host "✅ Database and user created successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to create database. Error: $_" -ForegroundColor Red
    Write-Host "`n💡 Tips:" -ForegroundColor Yellow
    Write-Host "   1. Make sure PostgreSQL is running" -ForegroundColor Gray
    Write-Host "   2. Verify you have superuser access (default: 'postgres' user)" -ForegroundColor Gray
    Write-Host "   3. Update the script if your PostgreSQL username is different" -ForegroundColor Gray
    exit 1
}

Write-Host "`n📊 Running Prisma migrations..." -ForegroundColor Cyan

# Set environment variable for test database
$env:DATABASE_URL = "postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}?schema=public"

try {
    pnpm prisma migrate deploy
    Write-Host "✅ Migrations applied successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to apply migrations. Error: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`n🌱 Seeding test database (optional)..." -ForegroundColor Cyan
Write-Host "   Run 'pnpm db:seed:clean' to populate with test data" -ForegroundColor Gray

Write-Host "`n✅ Local test database setup complete!" -ForegroundColor Green
Write-Host "`n📝 Database configuration:" -ForegroundColor Cyan
Write-Host "   Database: $DB_NAME" -ForegroundColor Gray
Write-Host "   User: $DB_USER" -ForegroundColor Gray
Write-Host "   Host: localhost:5432" -ForegroundColor Gray
Write-Host "`n🚀 You can now run E2E tests with:" -ForegroundColor Cyan
Write-Host "   pnpm test:e2e" -ForegroundColor Gray
