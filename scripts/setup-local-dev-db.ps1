#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Setup local PostgreSQL dev database (Docker), separate from test DB.

.DESCRIPTION
    Reuses the existing `timetable-test-db` Postgres 16 container (5433) but
    provisions a second logical database `timetable_dev` so dev runs do not
    collide with E2E test resets.

    Steps:
      1. Ensure Docker container is running (docker-compose.test.yml).
      2. Create `timetable_dev` DB owned by `test_user` if missing.
      3. Run `prisma migrate deploy` against the local dev URL.

    After running, .env points DATABASE_URL at localhost:5433/timetable_dev
    so `pnpm dev` no longer hits remote Prisma Accelerate.

.EXAMPLE
    .\scripts\setup-local-dev-db.ps1
    .\scripts\setup-local-dev-db.ps1 -Seed   # also runs db:seed:clean
#>

param(
    [switch]$Seed
)

$ErrorActionPreference = "Stop"

$container = "timetable-test-db"
$devDb     = "timetable_dev"
$dbUser    = "test_user"
$dbPass    = "test_password"
$devUrl    = "postgresql://${dbUser}:${dbPass}@localhost:5433/${devDb}?schema=public&connection_limit=10"

Write-Host "Local dev DB setup" -ForegroundColor Cyan

# 1. Ensure container up
$running = docker ps --filter "name=$container" --format "{{.Names}}"
if (-not $running) {
    Write-Host "Starting docker compose (test stack)..." -ForegroundColor Yellow
    docker compose -f docker-compose.test.yml up -d
    Start-Sleep -Seconds 3
}
Write-Host "Container '$container' running" -ForegroundColor Green

# 2. Create dev DB if missing (idempotent — ignore "already exists")
Write-Host "Ensuring database '$devDb' exists..." -ForegroundColor Yellow
$exists = (docker exec $container psql -U $dbUser -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$devDb'" 2>$null | Out-String).Trim()
if ($exists -ne "1") {
    docker exec $container psql -U $dbUser -d postgres -c "CREATE DATABASE $devDb OWNER $dbUser" | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "Failed to create database '$devDb'" }
    Write-Host "Created database '$devDb'" -ForegroundColor Green
} else {
    Write-Host "Database '$devDb' already exists" -ForegroundColor Green
}

# 3. Migrate
Write-Host "Applying prisma migrations..." -ForegroundColor Cyan
$env:DATABASE_URL = $devUrl
$env:PRISMA_DATABASE_URL = ""
$env:ACCELERATE_URL = ""
pnpm prisma migrate deploy
if ($LASTEXITCODE -ne 0) { throw "prisma migrate deploy failed" }

# 4. Optional seed
if ($Seed) {
    Write-Host "Seeding..." -ForegroundColor Cyan
    pnpm exec dotenv -v SEED_CLEAN_DATA=true -- tsx prisma/seed.ts
}

Write-Host ""
Write-Host "Done. Dev DB ready at:" -ForegroundColor Green
Write-Host "  $devUrl" -ForegroundColor Gray
Write-Host ""
Write-Host "Ensure .env has:" -ForegroundColor Cyan
Write-Host "  DATABASE_URL=`"$devUrl`"" -ForegroundColor Gray
Write-Host "  PRISMA_DATABASE_URL=" -ForegroundColor Gray
Write-Host "  ACCELERATE_URL=" -ForegroundColor Gray
