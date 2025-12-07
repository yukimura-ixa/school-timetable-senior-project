# Archive outdated documentation files
# Run from project root: .\archive_outdated_docs.ps1

$docsPath = ".\docs"
$archivePath = ".\docs\archive"

# Ensure archive directory exists
if (-not (Test-Path $archivePath)) {
    New-Item -ItemType Directory -Path $archivePath | Out-Null
    Write-Host "✓ Created archive directory" -ForegroundColor Green
}

$filesCount = 0

# Old E2E & Test Docs (8 files)
$oldE2E = @(
    "E2E_README_OLD.md",
    "ANALYTICS_DASHBOARD_E2E_TESTS.md",
    "ANALYTICS_DASHBOARD_TESTING_CHECKLIST.md",
    "E2E_TEST_EXECUTION_GUIDE.md",
    "PLAYWRIGHT_ADMIN_TESTING.md",
    "TEST_ENVIRONMENT_SETUP.md",
    "TEST_PLAN.md",
    "VERCEL_INTEGRATION_TESTS.md"
)

# Session/Progress Summaries (3 files)
$sessions = @(
    "SESSION_2025-11-21_COMPLETE_SUMMARY.md",
    "SESSION_SUMMARY.md",
    "FIX_PROGRESS.md"
)

# Duplicate Dev Bypass Docs (2 files)
$devBypass = @(
    "DEV_BYPASS_REMOVAL.md",
    "DEV_BYPASS_REMOVAL_REVIEW.md"
)

# Old GitHub Issues Docs (9 files)
$gitHubOld = @(
    "GITHUB_ISSUES_CLOSURE_REPORT_2025-11-21.md",
    "GITHUB_ISSUES_STATUS_2025-11-21.md",
    "GITHUB_ISSUES_UPDATE_2025-11-21.md",
    "GITHUB_ISSUES_UPDATE_FINAL_2025-11-21.md",
    "GITHUB_ISSUE_UPDATES_READY.md",
    "GITHUB_ISSUE_UPDATES_SUMMARY.md",
    "GITHUB_ISSUES_SESSION_2025-11-21_EVENING.md",
    "GITHUB_ISSUES_REVIEW_2025-11-21.md"
)

# Old Database Setup Docs (1 file)
$dbSetup = @(
    "TEST_DATABASE_SETUP.md"
)

$allFiles = $oldE2E + $sessions + $devBypass + $gitHubOld + $dbSetup

Write-Host "📦 Archiving outdated documentation..." -ForegroundColor Cyan
Write-Host ""

foreach ($file in $allFiles) {
    $filePath = Join-Path $docsPath $file
    if (Test-Path $filePath) {
        Move-Item $filePath $archivePath -Force
        Write-Host "✓ $file" -ForegroundColor Green
        $filesCount++
    } else {
        Write-Host "⚠ $file (not found)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "✅ Completed: $filesCount files archived" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:"
Write-Host "  1. Review archived files in docs/archive/"
Write-Host "  2. Commit changes: git add . && git commit -m 'docs: archive 22 outdated documentation files'"
Write-Host "  3. Update ARCHIVE_2025_COMPREHENSIVE.md with newly archived files"
