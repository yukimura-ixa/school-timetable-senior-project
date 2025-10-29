#!/usr/bin/env pwsh
# Script to add SEED_SECRET to Vercel project environment variables
# Usage: .\scripts\add-seed-secret.ps1

$ErrorActionPreference = "Stop"

# Configuration
$PROJECT_ID = "prj_o5KqXsNNUElMhGyK3AifkCOvMWWE"
$TEAM_ID = "team_jyrcgHQ83Aa1oSvRNywwb2lY"
$SEED_SECRET = "df83c9b4a1e2f5d6c3a8b9e0f1d2c3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0"

# Get Vercel token from environment or prompt
$VERCEL_TOKEN = $env:VERCEL_TOKEN
if (-not $VERCEL_TOKEN) {
    Write-Host "VERCEL_TOKEN not found in environment."
    Write-Host "Please get your token from: https://vercel.com/account/tokens"
    $VERCEL_TOKEN = Read-Host "Enter your Vercel token"
}

# Prepare request
$headers = @{
    "Authorization" = "Bearer $VERCEL_TOKEN"
    "Content-Type"  = "application/json"
}

$body = @{
    key    = "SEED_SECRET"
    value  = $SEED_SECRET
    type   = "encrypted"
    target = @("production", "preview", "development")
} | ConvertTo-Json

$uri = "https://api.vercel.com/v10/projects/$PROJECT_ID/env?teamId=$TEAM_ID"

Write-Host "Adding SEED_SECRET to Vercel project..."
Write-Host "Project ID: $PROJECT_ID"
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body $body
    Write-Host "✓ Successfully added SEED_SECRET!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Environment variable details:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 3
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Wait for the next deployment to pick up the new env var (or redeploy now)"
    Write-Host "2. Run: .\scripts\seed-production.ps1"
}
catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $errorBody = $_.ErrorDetails.Message
    
    Write-Host "✗ Failed to add environment variable!" -ForegroundColor Red
    Write-Host "Status: $statusCode"
    Write-Host "Error: $errorBody"
    
    if ($statusCode -eq 401) {
        Write-Host ""
        Write-Host "Your token may be invalid or expired." -ForegroundColor Yellow
        Write-Host "Get a new token at: https://vercel.com/account/tokens"
    }
    elseif ($statusCode -eq 409 -or $errorBody -like "*already exists*") {
        Write-Host ""
        Write-Host "SEED_SECRET already exists. You can update it in Vercel dashboard:" -ForegroundColor Yellow
        Write-Host "https://vercel.com/yukimura-ixas-projects/phrasongsa-timetable/settings/environment-variables"
    }
    
    exit 1
}
