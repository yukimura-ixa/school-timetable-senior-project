#!/usr/bin/env pwsh
# Script to seed production database with semesters 2567-2568
# Usage: 
#   .\scripts\seed-production.ps1              # Create semesters only
#   .\scripts\seed-production.ps1 -SeedData    # Also create timeslots + config

param(
    [switch]$SeedData
)

$ErrorActionPreference = "Stop"

$PRODUCTION_URL = "https://phrasongsa-timetable.vercel.app"
$SEED_SECRET = $env:SEED_SECRET
if (-not $SEED_SECRET) {
    Write-Host "Missing SEED_SECRET env var." -ForegroundColor Red
    Write-Host "Set it and re-run:" -ForegroundColor Yellow
    Write-Host '  $env:SEED_SECRET="..."; .\scripts\seed-production.ps1' -ForegroundColor Yellow
    exit 1
}

Write-Host "🌱 Seeding production database..." -ForegroundColor Cyan
Write-Host "URL: $PRODUCTION_URL"
Write-Host "Years: 2567, 2568 (semesters 1 & 2)"
if ($SeedData) {
    Write-Host "Mode: FULL (semesters + timeslots + config)" -ForegroundColor Yellow
} else {
    Write-Host "Mode: MINIMAL (semesters only)" -ForegroundColor Green
}
Write-Host ""

$uri = "$PRODUCTION_URL/api/admin/seed-semesters?years=2567,2568"
if ($SeedData) {
    $uri += "&seedData=true"
}

try {
    $response = Invoke-RestMethod -Uri $uri -Method POST -Headers @{ "x-seed-secret" = $SEED_SECRET } -UseBasicParsing        
    
    if ($response.ok) {
        Write-Host "✓ Seed successful!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Results:" -ForegroundColor Cyan
        
        foreach ($result in $response.results) {
            $emoji = if ($result.created) { "✨" } else { "📋" }
            $status = if ($result.created) { "CREATED" } else { "EXISTS" }
            $line = "$emoji Semester $($result.semester)/$($result.year) - $status (ConfigID: $($result.configId))"
            
            if ($result.timeslots) {
                $line += " | Timeslots: $($result.timeslots)"
            }
            if ($result.tableConfig) {
                $line += " | Config: ✓"
            }
            
            Write-Host $line
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
