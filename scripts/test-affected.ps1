#!/usr/bin/env pwsh
<#
.SYNOPSIS
Run E2E tests based on changed files (incremental test selection).

.DESCRIPTION
Analyzes git diff to determine which E2E tests are affected by changes,
then runs only those tests for faster feedback.

.PARAMETER BaseBranch
The base branch to compare against. Default: "origin/main"

.PARAMETER All
Run all tests regardless of changes.

.PARAMETER DryRun
Show which tests would run without actually running them.

.EXAMPLE
.\test-affected.ps1
Runs affected tests based on changes vs origin/main.

.EXAMPLE
.\test-affected.ps1 -DryRun
Shows which tests would run without executing them.

.EXAMPLE
.\test-affected.ps1 -BaseBranch "origin/develop"
Compares against develop branch instead of main.
#>

param(
    [Parameter(Mandatory=$false)]
    [string]$BaseBranch = "origin/main",
    
    [Parameter(Mandatory=$false)]
    [switch]$All,
    
    [Parameter(Mandatory=$false)]
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

function Write-Info { param([string]$Message) Write-Host $Message -ForegroundColor Cyan }
function Write-Success { param([string]$Message) Write-Host $Message -ForegroundColor Green }
function Write-Warn { param([string]$Message) Write-Host $Message -ForegroundColor Yellow }

# Mapping of source paths to test patterns
$testMappings = @{
    # Feature-based mappings
    "src/features/teacher"        = "teacher"
    "src/features/schedule"       = "schedule|assign|arrange"
    "src/features/assign"         = "assign|arrange"
    "src/features/semester"       = "semester|dashboard"
    "src/features/program"        = "program|curriculum"
    "src/features/conflict"       = "conflict|assign"
    "src/features/timeslot"       = "timeslot|schedule"
    "src/features/analytics"      = "analytics"
    
    # Management routes
    "src/app.*management"         = "management|crud"
    
    # Auth-related
    "src/features/auth"           = "auth|login|signin"
    "src/app.*signin"             = "auth|login|signin"
    "src/lib/auth"                = "auth|login|signin"
    
    # Dashboard
    "src/app.*dashboard"          = "dashboard|teacher-table|student-table"
    
    # Export functionality
    "src/features/export"         = "export|pdf"
    "src/utils/pdf"               = "export|pdf"
    
    # E2E test files themselves
    "e2e/01-auth"                 = "auth"
    "e2e/02-setup"                = "setup"
    "e2e/03-timetable-core"       = "timetable|arrange"
    "e2e/04-bulk-ops"             = "bulk"
    "e2e/05-permissions"          = "permission"
    "e2e/06-export"               = "export"
    "e2e/smoke"                   = "smoke"
}

# If --All flag, run everything
if ($All) {
    Write-Info "🔍 Running all E2E tests..."
    if ($DryRun) {
        Write-Warn "[DRY RUN] Would run: pnpm test:e2e"
        exit 0
    }
    pnpm test:e2e
    exit $LASTEXITCODE
}

# Get changed files
Write-Info "🔍 Analyzing changes vs $BaseBranch..."

try {
    # Fetch to ensure we have latest
    git fetch origin --quiet 2>$null
    
    # Get list of changed files
    $changedFiles = git diff --name-only "$BaseBranch...HEAD" 2>$null
    
    if (-not $changedFiles) {
        # No changes vs branch, check uncommitted changes
        $changedFiles = git diff --name-only HEAD
        if (-not $changedFiles) {
            $changedFiles = git diff --name-only --staged
        }
    }
} catch {
    Write-Warn "⚠️  Could not determine changed files, running smoke tests"
    $changedFiles = @()
}

if (-not $changedFiles -or $changedFiles.Count -eq 0) {
    Write-Info "No changes detected, running smoke tests..."
    if ($DryRun) {
        Write-Warn "[DRY RUN] Would run: pnpm test:smoke"
        exit 0
    }
    pnpm test:smoke
    exit $LASTEXITCODE
}

Write-Info ""
Write-Info "📁 Changed files:"
$changedFiles | ForEach-Object { Write-Host "  - $_" -ForegroundColor Gray }

# Determine which test patterns to run
$testPatterns = @()

foreach ($file in $changedFiles) {
    foreach ($mapping in $testMappings.GetEnumerator()) {
        if ($file -match $mapping.Key) {
            $patterns = $mapping.Value -split "\|"
            foreach ($pattern in $patterns) {
                if ($testPatterns -notcontains $pattern) {
                    $testPatterns += $pattern
                }
            }
        }
    }
}

# Check for infrastructure/config changes that need full suite
$infraPatterns = @(
    "playwright\.config",
    "package\.json",
    "prisma/schema",
    "next\.config",
    "\.github/workflows"
)

$needsFullSuite = $false
foreach ($file in $changedFiles) {
    foreach ($pattern in $infraPatterns) {
        if ($file -match $pattern) {
            Write-Warn ""
            Write-Warn "⚠️  Infrastructure change detected: $file"
            $needsFullSuite = $true
            break
        }
    }
    if ($needsFullSuite) { break }
}

if ($needsFullSuite) {
    Write-Warn "Running full E2E suite due to infrastructure changes..."
    if ($DryRun) {
        Write-Warn "[DRY RUN] Would run: pnpm test:e2e"
        exit 0
    }
    pnpm test:e2e
    exit $LASTEXITCODE
}

# If no patterns matched, run smoke tests
if ($testPatterns.Count -eq 0) {
    Write-Info ""
    Write-Info "No specific test patterns matched, running smoke tests..."
    if ($DryRun) {
        Write-Warn "[DRY RUN] Would run: pnpm test:smoke"
        exit 0
    }
    pnpm test:smoke
    exit $LASTEXITCODE
}

# Build grep pattern
$grepPattern = $testPatterns -join "|"

Write-Success ""
Write-Success "🎯 Affected test patterns: $grepPattern"
Write-Info ""

# Run affected tests
$command = "pnpm exec playwright test --grep `"$grepPattern`""

if ($DryRun) {
    Write-Warn "[DRY RUN] Would run: $command"
    Write-Info ""
    Write-Info "Matched test files:"
    pnpm exec playwright test --grep "$grepPattern" --list 2>$null | ForEach-Object {
        if ($_ -match "\.spec\.ts") {
            Write-Host "  $_" -ForegroundColor Gray
        }
    }
    exit 0
}

Write-Info "Running: $command"
Write-Info ""

pnpm exec playwright test --grep "$grepPattern"
exit $LASTEXITCODE
