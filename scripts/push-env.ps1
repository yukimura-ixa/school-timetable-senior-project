#!/usr/bin/env pwsh
# Push Environment Variables to Vercel
# Usage: .\push-env.ps1

Write-Host "🚀 Vercel Environment Variable Setup" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if Vercel CLI is installed
if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Vercel CLI not found in PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please run one of these commands:" -ForegroundColor Yellow
    Write-Host "  npm install -g vercel" -ForegroundColor White
    Write-Host "  OR add to PATH: " -ForegroundColor White
    Write-Host "  `$env:PATH += ';B:\Tools\npm-global'" -ForegroundColor White
    exit 1
}

Write-Host "✅ Vercel CLI found" -ForegroundColor Green
Write-Host ""

# Check if project is linked
if (-not (Test-Path ".vercel")) {
    Write-Host "⚠️  Project not linked to Vercel" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please run: vercel link" -ForegroundColor White
    Write-Host ""
    $link = Read-Host "Run 'vercel link' now? (y/N)"
    if ($link -eq "y" -or $link -eq "Y") {
        vercel link
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Failed to link project" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "❌ Cannot continue without linking project" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Project linked to Vercel" -ForegroundColor Green
Write-Host ""

# Required environment variables
$requiredVars = @(
    @{
        Name = "AUTH_SECRET"
        Description = "JWT signing secret (generate with: openssl rand -base64 32)"
        Required = $true
    },
    @{
        Name = "AUTH_GOOGLE_ID"
        Description = "Google OAuth Client ID"
        Required = $true
    },
    @{
        Name = "AUTH_GOOGLE_SECRET"
        Description = "Google OAuth Client Secret"
        Required = $true
    },
    @{
        Name = "DATABASE_URL"
        Description = "PostgreSQL connection string (skip if using Vercel Storage)"
        Required = $false
    }
)

Write-Host "📝 Environment Variables to Push:" -ForegroundColor Cyan
Write-Host ""
foreach ($var in $requiredVars) {
    $required = if ($var.Required) { "[REQUIRED]" } else { "[OPTIONAL]" }
    Write-Host "  - $($var.Name) $required" -ForegroundColor White
    Write-Host "    $($var.Description)" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "⚠️  IMPORTANT NOTES:" -ForegroundColor Yellow
Write-Host "  1. If using Vercel Storage (Postgres), skip DATABASE_URL - it's auto-injected" -ForegroundColor White
Write-Host "  2. Values will be prompted interactively by Vercel CLI" -ForegroundColor White
Write-Host "  3. Select 'Production, Preview, Development' for all environments" -ForegroundColor White
Write-Host ""

$continue = Read-Host "Continue with environment variable setup? (y/N)"
if ($continue -ne "y" -and $continue -ne "Y") {
    Write-Host "❌ Cancelled" -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "🔧 Starting environment variable push..." -ForegroundColor Cyan
Write-Host ""

# Generate AUTH_SECRET if needed
Write-Host "📌 AUTH_SECRET" -ForegroundColor Yellow
Write-Host "   Generating secure random secret..." -ForegroundColor Gray
$authSecret = node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
Write-Host "   Generated: $authSecret" -ForegroundColor Green
Write-Host ""
Write-Host "   Run this command and paste the secret when prompted:" -ForegroundColor White
Write-Host "   vercel env add AUTH_SECRET" -ForegroundColor Cyan
Write-Host "   Then select: Production, Preview, Development" -ForegroundColor Gray
Write-Host ""
$pushSecret = Read-Host "Press Enter when ready to continue"

# Instructions for other variables
Write-Host ""
Write-Host "📌 AUTH_GOOGLE_ID" -ForegroundColor Yellow
Write-Host "   Run this command and paste your Google OAuth Client ID:" -ForegroundColor White
Write-Host "   vercel env add AUTH_GOOGLE_ID" -ForegroundColor Cyan
Write-Host "   Then select: Production, Preview, Development" -ForegroundColor Gray
Write-Host ""

Write-Host "📌 AUTH_GOOGLE_SECRET" -ForegroundColor Yellow
Write-Host "   Run this command and paste your Google OAuth Client Secret:" -ForegroundColor White
Write-Host "   vercel env add AUTH_GOOGLE_SECRET" -ForegroundColor Cyan
Write-Host "   Then select: Production, Preview, Development" -ForegroundColor Gray
Write-Host ""

Write-Host "📌 DATABASE_URL (Optional)" -ForegroundColor Yellow
Write-Host "   If NOT using Vercel Storage, run:" -ForegroundColor White
Write-Host "   vercel env add DATABASE_URL" -ForegroundColor Cyan
Write-Host "   Then select: Production, Preview, Development" -ForegroundColor Gray
Write-Host ""

Write-Host "✅ Environment Variable Setup Guide Complete" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Quick Reference:" -ForegroundColor Cyan
Write-Host "  - Generated AUTH_SECRET: $authSecret" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Run the 'vercel env add' commands above" -ForegroundColor White
Write-Host "  2. Verify: vercel env ls" -ForegroundColor White
Write-Host "  3. Deploy: vercel --prod" -ForegroundColor White
Write-Host ""
Write-Host "💡 Tip: You can also add env vars via Vercel Dashboard:" -ForegroundColor Yellow
Write-Host "   https://vercel.com/dashboard → Your Project → Settings → Environment Variables" -ForegroundColor Gray
Write-Host ""
