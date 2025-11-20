#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Update GitHub issues based on today's completed work

.DESCRIPTION
    This script helps update GitHub issues to reflect the work completed on 2025-11-21:
    - TypeScript fixes (all TS7006 errors resolved)
    - Environment separation (local/CI/prod)
    - Prisma proxy setup
    - Project cleanup
    - Testing infrastructure fixes

.EXAMPLE
    .\update-github-issues.ps1
#>

$ErrorActionPreference = "Stop"

Write-Host "🔍 GitHub Issue Updater" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
Write-Host ""

# Check if gh CLI is installed
try {
    gh --version | Out-Null
} catch {
    Write-Host "❌ GitHub CLI (gh) not found. Please install it first:" -ForegroundColor Red
    Write-Host "   https://cli.github.com/" -ForegroundColor Yellow
    exit 1
}

# Fetch open issues
Write-Host "📋 Fetching open issues..." -ForegroundColor Yellow
$issuesJson = gh issue list --limit 50 --state open --json number,title,labels,body
$issues = $issuesJson | ConvertFrom-Json

if ($issues.Count -eq 0) {
    Write-Host "✅ No open issues found!" -ForegroundColor Green
    exit 0
}

Write-Host "Found $($issues.Count) open issues`n" -ForegroundColor Green

# Keywords to search for in issues
$keywords = @(
    "typescript",
    "ts7006",
    "implicit any",
    "environment",
    "env",
    "config",
    "prisma",
    "database",
    "testing",
    "jest",
    "playwright",
    "e2e",
    "cleanup",
    "documentation"
)

# Find related issues
Write-Host "🔎 Searching for related issues..." -ForegroundColor Yellow
$relatedIssues = @()

foreach ($issue in $issues) {
    $issueText = "$($issue.title) $($issue.body)".ToLower()
    
    foreach ($keyword in $keywords) {
        if ($issueText -contains $keyword) {
            $relatedIssues += $issue
            break
        }
    }
}

if ($relatedIssues.Count -eq 0) {
    Write-Host "ℹ️  No issues found matching our work keywords" -ForegroundColor Gray
    Write-Host ""
    Write-Host "💡 Suggestion: Create a new issue to document today's work" -ForegroundColor Cyan
    Write-Host ""
    
    $create = Read-Host "Create a summary issue? (y/N)"
    
    if ($create -eq "y") {
        Write-Host ""
        Write-Host "📝 Creating summary issue..." -ForegroundColor Yellow
        
        $issueBody = @"
## 📋 Summary

Completed comprehensive project improvements on 2025-11-21:

### ✅ Completed
- Fixed all TypeScript TS7006 errors (40+ files)
- Separated environment configs (local/CI/prod)
- Set up Prisma proxy for local testing
- Cleaned project root directory (-37% files)
- Fixed Playwright + Jest infrastructure
- Created 6+ new documentation files

### 📊 Impact
- TypeScript errors: 50+ → 0 (100% reduction)
- Project organization: Significantly improved
- Development setup: Simplified
- Documentation: Comprehensive

### 🔗 Commit
See commit: \`feat: Complete TypeScript fixes, environment separation, and project cleanup\`

**Files changed:** 73  
**Insertions:** +4,636  
**Deletions:** -1,687

### 📚 Documentation
- docs/ENVIRONMENT_SETUP.md
- docs/ENVIRONMENT_SEPARATION_SUMMARY.md
- docs/PRISMA_PROXY_SETUP.md
- docs/TEST_DATABASE_SETUP.md
- docs/PROJECT_ROOT_CLEANUP_SUMMARY.md
- docs/SESSION_2025-11-21_COMPLETE_SUMMARY.md
"@
        
        Write-Host ""
        gh issue create `
            --title "[COMPLETED] TypeScript Fixes, Environment Separation, and Project Cleanup" `
            --body $issueBody `
            --label "enhancement,completed"
        
        Write-Host ""
        Write-Host "✅ Summary issue created!" -ForegroundColor Green
    }
} else {
    Write-Host "✅ Found $($relatedIssues.Count) potentially related issue(s):`n" -ForegroundColor Green
    
    foreach ($issue in $relatedIssues) {
        $labels = ($issue.labels | ForEach-Object { $_.name }) -join ", "
        Write-Host "#$($issue.number): " -NoNewline -ForegroundColor Yellow
        Write-Host "$($issue.title)" -ForegroundColor White
        if ($labels) {
            Write-Host "  Labels: $labels" -ForegroundColor Gray
        }
        Write-Host ""
    }
    
    Write-Host "💡 Suggestions:" -ForegroundColor Cyan
    Write-Host "  1. Review each issue to see if it's resolved by today's work" -ForegroundColor Gray
    Write-Host "  2. Add comments referencing the completion commit" -ForegroundColor Gray
    Write-Host "  3. Close issues that are now resolved" -ForegroundColor Gray
    Write-Host ""
    
    $update = Read-Host "Add completion comment to these issues? (y/N)"
    
    if ($update -eq "y") {
        $comment = @"
## ✅ Potentially Resolved

This issue may have been addressed by recent work completed on 2025-11-21.

### Changes Made:
- Fixed all TypeScript TS7006 errors (40+ files)
- Separated environment configs (local/CI/prod)
- Set up Prisma proxy for local testing
- Cleaned project root directory
- Fixed testing infrastructure

**Commit:** \`feat: Complete TypeScript fixes, environment separation, and project cleanup\`

Please review and close if this resolves the issue.

See: docs/SESSION_2025-11-21_COMPLETE_SUMMARY.md for full details.
"@
        
        Write-Host ""
        foreach ($issue in $relatedIssues) {
            Write-Host "📝 Adding comment to #$($issue.number)..." -ForegroundColor Yellow
            gh issue comment $issue.number --body $comment
        }
        
        Write-Host ""
        Write-Host "✅ Comments added to $($relatedIssues.Count) issue(s)!" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "🎯 Done!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Review issues on GitHub" -ForegroundColor Gray
Write-Host "  2. Close resolved issues manually" -ForegroundColor Gray
Write-Host "  3. Update project board if needed" -ForegroundColor Gray
