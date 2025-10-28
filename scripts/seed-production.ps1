#!/usr/bin/env pwsh
# Script to seed production database with semesters 2567-2568
# Usage: .\scripts\seed-production.ps1

$ErrorActionPreference = "Stop"

$PRODUCTION_URL = "https://phrasongsa-timetable.vercel.app"
$SEED_SECRET = "df83c9b4a1e2f5d6c3a8b9e0f1d2c3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0"

Write-Host "🌱 Seeding production database..." -ForegroundColor Cyan
Write-Host "URL: $PRODUCTION_URL"
Write-Host "Years: 2567, 2568 (semesters 1 & 2)"
Write-Host ""

$uri = "$PRODUCTION_URL/api/admin/seed-semesters?secret=$SEED_SECRET&years=2567,2568"

try {
    $response = Invoke-RestMethod -Uri $uri -Method GET -UseBasicParsing
    
    if ($response.ok) {
        Write-Host "✓ Seed successful!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Results:" -ForegroundColor Cyan
        
        foreach ($result in $response.results) {
            $emoji = if ($result.created) { "✨" } else { "📋" }
            $status = if ($result.created) { "CREATED" } else { "EXISTS" }
            Write-Host "$emoji Semester $($result.semester)/$($result.year) - $status (ConfigID: $($result.configId))"
        }
        
        Write-Host ""
        Write-Host "You can now access these routes:" -ForegroundColor Yellow
        Write-Host "  • /dashboard/1-2567/all-timeslot"
        Write-Host "  • /dashboard/2-2567/all-timeslot"
        Write-Host "  • /dashboard/1-2568/all-timeslot"
        Write-Host "  • /dashboard/2-2568/all-timeslot"
        Write-Host "  • /schedule/1-2567/config"
        Write-Host "  • /schedule/2-2567/config"
        Write-Host "  • /schedule/1-2568/config"
        Write-Host "  • /schedule/2-2568/config"
    }
    else {
        Write-Host "✗ Seed failed!" -ForegroundColor Red
        Write-Host "Error: $($response.error)"
        exit 1
    }
}
catch {
    Write-Host "✗ Request failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)"
    
    if ($_.Exception.Response.StatusCode.value__ -eq 401) {
        Write-Host ""
        Write-Host "Unauthorized! Make sure SEED_SECRET is set in Vercel:" -ForegroundColor Yellow
        Write-Host "1. Run: .\scripts\add-seed-secret.ps1"
        Write-Host "2. Wait for deployment or trigger redeploy"
        Write-Host "3. Try again"
    }
    
    exit 1
}
