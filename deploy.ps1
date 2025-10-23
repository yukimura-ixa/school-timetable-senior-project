#!/usr/bin/env pwsh
# Vercel Deployment Script
# Run this script to prepare and deploy to Vercel

Write-Host "🚀 School Timetable - Vercel Deployment Helper" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're on the right branch
$currentBranch = git rev-parse --abbrev-ref HEAD
Write-Host "📍 Current branch: $currentBranch" -ForegroundColor Yellow

if ($currentBranch -ne "main" -and $currentBranch -ne "refactor") {
    Write-Host "⚠️  Warning: You're not on main or refactor branch" -ForegroundColor Yellow
    $continue = Read-Host "Continue anyway? (y/N)"
    if ($continue -ne "y") {
        exit 0
    }
}

Write-Host ""
Write-Host "📋 Pre-Deployment Checklist" -ForegroundColor Green
Write-Host "----------------------------" -ForegroundColor Green

# 1. Check if .env.example is up to date
Write-Host "✓ Checking .env.example..." -ForegroundColor White
if (Test-Path ".env.example") {
    Write-Host "  ✓ .env.example exists" -ForegroundColor Green
} else {
    Write-Host "  ✗ .env.example missing!" -ForegroundColor Red
}

# 2. Check if DEPLOYMENT.md exists
Write-Host "✓ Checking documentation..." -ForegroundColor White
if (Test-Path "DEPLOYMENT.md") {
    Write-Host "  ✓ DEPLOYMENT.md exists" -ForegroundColor Green
} else {
    Write-Host "  ✗ DEPLOYMENT.md missing!" -ForegroundColor Red
}

# 3. Check if vercel.json exists
Write-Host "✓ Checking Vercel config..." -ForegroundColor White
if (Test-Path "vercel.json") {
    Write-Host "  ✓ vercel.json exists" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  vercel.json missing (optional)" -ForegroundColor Yellow
}

# 4. Run build test
Write-Host ""
Write-Host "🔨 Running build test..." -ForegroundColor Cyan
$buildTest = Read-Host "Run build test before deployment? (Y/n)"
if ($buildTest -ne "n") {
    pnpm build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed! Fix errors before deploying." -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ Build successful!" -ForegroundColor Green
}

# 5. Check environment variables
Write-Host ""
Write-Host "📝 Environment Variables Checklist" -ForegroundColor Cyan
Write-Host "-----------------------------------" -ForegroundColor Cyan
Write-Host "Have you set these in Vercel Dashboard?" -ForegroundColor Yellow
Write-Host ""
Write-Host "Required variables:" -ForegroundColor White
Write-Host "  - DATABASE_URL (from Prisma Postgres)" -ForegroundColor Gray
Write-Host "  - NEXTAUTH_URL (your Vercel app URL)" -ForegroundColor Gray
Write-Host "  - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)" -ForegroundColor Gray
Write-Host "  - NEXT_GOOGLE_AUTH_CLIENT_ID" -ForegroundColor Gray
Write-Host "  - NEXT_GOOGLE_AUTH_CLIENT_SECRET" -ForegroundColor Gray
Write-Host ""
Write-Host "Security check:" -ForegroundColor White
Write-Host "  - ENABLE_DEV_BYPASS is NOT set (or = false)" -ForegroundColor Gray
Write-Host ""

$envReady = Read-Host "All environment variables configured? (y/N)"
if ($envReady -ne "y") {
    Write-Host ""
    Write-Host "📖 Please configure environment variables first:" -ForegroundColor Yellow
    Write-Host "   1. Go to Vercel Dashboard" -ForegroundColor Gray
    Write-Host "   2. Select your project" -ForegroundColor Gray
    Write-Host "   3. Go to Settings → Environment Variables" -ForegroundColor Gray
    Write-Host "   4. Add the required variables" -ForegroundColor Gray
    Write-Host ""
    Write-Host "See DEPLOYMENT.md for detailed instructions" -ForegroundColor Cyan
    exit 0
}

# 6. Database setup
Write-Host ""
Write-Host "🗄️  Database Setup" -ForegroundColor Cyan
Write-Host "-----------------" -ForegroundColor Cyan
$dbReady = Read-Host "Have you created Prisma Postgres database? (y/N)"
if ($dbReady -ne "y") {
    Write-Host ""
    Write-Host "📖 Create Prisma Postgres database:" -ForegroundColor Yellow
    Write-Host "   1. Go to https://console.prisma.io" -ForegroundColor Gray
    Write-Host "   2. Click 'New Project' or 'Create Database'" -ForegroundColor Gray
    Write-Host "   3. Choose region (e.g., Singapore - sin1)" -ForegroundColor Gray
    Write-Host "   4. Copy connection string" -ForegroundColor Gray
    Write-Host "   5. Add to Vercel environment variables" -ForegroundColor Gray
    Write-Host ""
    exit 0
}

# 7. Google OAuth setup
Write-Host ""
Write-Host "🔐 Google OAuth Setup" -ForegroundColor Cyan
Write-Host "---------------------" -ForegroundColor Cyan
$oauthReady = Read-Host "Have you configured Google OAuth for production? (y/N)"
if ($oauthReady -ne "y") {
    Write-Host ""
    Write-Host "📖 Configure Google OAuth:" -ForegroundColor Yellow
    Write-Host "   1. Go to https://console.cloud.google.com/apis/credentials" -ForegroundColor Gray
    Write-Host "   2. Create OAuth 2.0 Client ID" -ForegroundColor Gray
    Write-Host "   3. Add authorized redirect URI:" -ForegroundColor Gray
    Write-Host "      https://your-app.vercel.app/api/auth/callback/google" -ForegroundColor Gray
    Write-Host "   4. Copy Client ID and Secret to Vercel" -ForegroundColor Gray
    Write-Host ""
    exit 0
}

# 8. Deployment options
Write-Host ""
Write-Host "🚀 Deployment Options" -ForegroundColor Cyan
Write-Host "---------------------" -ForegroundColor Cyan
Write-Host "1. Deploy via Git Push (Automatic)" -ForegroundColor White
Write-Host "2. Deploy via Vercel CLI" -ForegroundColor White
Write-Host "3. Import to Vercel (First time)" -ForegroundColor White
Write-Host ""

$deployChoice = Read-Host "Choose deployment method (1-3)"

switch ($deployChoice) {
    "1" {
        Write-Host ""
        Write-Host "📤 Pushing to GitHub..." -ForegroundColor Cyan
        git status
        Write-Host ""
        $pushConfirm = Read-Host "Push current changes to GitHub? (y/N)"
        if ($pushConfirm -eq "y") {
            git push origin $currentBranch
            Write-Host ""
            Write-Host "✓ Pushed! Vercel will auto-deploy." -ForegroundColor Green
            Write-Host "📊 Check deployment status: https://vercel.com/dashboard" -ForegroundColor Cyan
        }
    }
    "2" {
        Write-Host ""
        Write-Host "📦 Deploying via Vercel CLI..." -ForegroundColor Cyan
        
        # Check if Vercel CLI is installed
        $vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
        if (-not $vercelInstalled) {
            Write-Host "⚠️  Vercel CLI not installed" -ForegroundColor Yellow
            $installCLI = Read-Host "Install Vercel CLI globally? (y/N)"
            if ($installCLI -eq "y") {
                npm install -g vercel
            } else {
                Write-Host "❌ Cannot deploy without Vercel CLI" -ForegroundColor Red
                exit 1
            }
        }
        
        Write-Host ""
        $prodDeploy = Read-Host "Deploy to production? (y=production, n=preview)"
        if ($prodDeploy -eq "y") {
            vercel --prod
        } else {
            vercel
        }
    }
    "3" {
        Write-Host ""
        Write-Host "📖 First-time Vercel Import:" -ForegroundColor Cyan
        Write-Host "   1. Go to https://vercel.com/new" -ForegroundColor Gray
        Write-Host "   2. Click 'Import Git Repository'" -ForegroundColor Gray
        Write-Host "   3. Select: yukimura-ixa/school-timetable-senior-project" -ForegroundColor Gray
        Write-Host "   4. Configure environment variables" -ForegroundColor Gray
        Write-Host "   5. Click 'Deploy'" -ForegroundColor Gray
        Write-Host ""
        Write-Host "After import, use option 1 (Git Push) for future deployments" -ForegroundColor Yellow
        
        $openBrowser = Read-Host "Open Vercel in browser? (Y/n)"
        if ($openBrowser -ne "n") {
            Start-Process "https://vercel.com/new"
        }
    }
    default {
        Write-Host "❌ Invalid choice" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "✅ Deployment process initiated!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Post-Deployment Tasks:" -ForegroundColor Cyan
Write-Host "-------------------------" -ForegroundColor Cyan
Write-Host "1. Wait for Vercel build to complete" -ForegroundColor White
Write-Host "2. Run database migrations:" -ForegroundColor White
Write-Host "   $env:DATABASE_URL='postgresql://...'`n   pnpm prisma migrate deploy" -ForegroundColor Gray
Write-Host "3. Test your app at: https://your-app.vercel.app" -ForegroundColor White
Write-Host "4. Verify Google OAuth login works" -ForegroundColor White
Write-Host "5. Verify dev bypass is disabled" -ForegroundColor White
Write-Host ""
Write-Host "📖 Full guide: See DEPLOYMENT.md" -ForegroundColor Cyan
Write-Host ""
