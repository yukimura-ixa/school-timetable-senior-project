#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Batch migrate E2E tests to use admin.fixture and web-first assertions

.DESCRIPTION
    This script automates the migration of E2E tests from legacy patterns to modern best practices:
    - Replaces @playwright/test imports with admin.fixture
    - Updates test signatures to use authenticatedAdmin fixture
    - Removes manual authentication code
    - Suggests web-first assertion replacements
    
.PARAMETER DryRun
    Preview changes without modifying files
    
.PARAMETER TargetFiles
    Specific files to migrate (comma-separated). If not specified, migrates all spec files.
    
.EXAMPLE
    .\scripts\migrate-e2e-tests.ps1 -DryRun
    Preview all changes
    
.EXAMPLE
    .\scripts\migrate-e2e-tests.ps1
    Apply all migrations
    
.EXAMPLE
    .\scripts\migrate-e2e-tests.ps1 -TargetFiles "01-home-page.spec.ts,02-auth.spec.ts"
    Migrate specific files only
#>

param(
    [switch]$DryRun = $false,
    [string]$TargetFiles = ""
)

# Colors for output
$Color = @{
    Info = "Cyan"
    Success = "Green"
    Warning = "Yellow"
    Error = "Red"
    Highlight = "Magenta"
}

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Type = "Info"
    )
    Write-Host $Message -ForegroundColor $Color[$Type]
}

# Migration patterns
$MigrationPatterns = @(
    @{
        Name = "Import Statement"
        Pattern = 'import\s+{\s*test,\s*expect\s*}\s+from\s+[''"]@playwright/test[''"]'
        Replacement = 'import { test, expect } from "./fixtures/admin.fixture"'
        Description = "Update import to use admin.fixture"
    },
    @{
        Name = "Test Signature - authenticatedAdmin"
        Pattern = 'test\((.*?),\s*async\s*\(\{\s*page\s*\}\)\s*=>'
        Replacement = 'test($1, async ({ authenticatedAdmin }) =>'
        Description = "Use authenticatedAdmin fixture"
        PostProcess = {
            param($content)
            # Add page destructuring
            $content -replace '(async\s*\(\{\s*authenticatedAdmin\s*\}\)\s*=>\s*\{)', '$1`n    const { page } = authenticatedAdmin;'
        }
    },
    @{
        Name = "waitForSelector with timeout"
        Pattern = 'await\s+page\.waitForSelector\([^)]+,\s*\{\s*timeout:\s*\d+\s*\}\)'
        Replacement = '// ⚠️ TODO: Replace with web-first assertion: await expect(page.locator("selector")).toBeVisible()'
        Description = "Flag waitForSelector for manual review"
    },
    @{
        Name = "waitForLoadState networkidle"
        Pattern = 'await\s+page\.waitForLoadState\([''"]networkidle[''"])\s*;'
        Replacement = '// ⚠️ Removed: await page.waitForLoadState("networkidle") - use web-first assertions instead'
        Description = "Remove networkidle waits"
    },
    @{
        Name = "goto with waitUntil"
        Pattern = 'page\.goto\(([^)]+),\s*\{\s*waitUntil:\s*[''"]domcontentloaded[''"].*?\}\)'
        Replacement = 'page.goto($1)'
        Description = "Remove waitUntil from goto()"
    }
)

# Anti-patterns to flag for manual review
$AntiPatterns = @(
    @{
        Pattern = 'waitForTimeout\('
        Message = "⚠️ Found waitForTimeout() - should be replaced with web-first assertion"
        IsError = $false
    },
    @{
        Pattern = 'test\.beforeEach.*goto.*signin'
        Message = "⚠️ Manual authentication in beforeEach - remove (fixture handles auth)"
        IsError = $true
    },
    @{
        Pattern = 'waitForURL.*signin'
        Message = "⚠️ Manual auth redirect handling - remove (fixture handles auth)"
        IsError = $true
    }
)

function Get-E2ETestFiles {
    param(
        [string]$FileFilter
    )
    
    $e2eDir = "b:\Dev\school-timetable-senior-project\e2e"
    
    if ($FileFilter) {
        $files = $FileFilter -split ',' | ForEach-Object {
            $file = $_.Trim()
            $fullPath = Join-Path $e2eDir $file
            if (Test-Path $fullPath) {
                Get-Item $fullPath
            } else {
                Write-ColorOutput "Warning: File not found: $file" "Warning"
            }
        }
    } else {
        $files = Get-ChildItem -Path $e2eDir -Filter "*.spec.ts" -File | Where-Object {
            # Exclude already migrated files and fixture files
            $_.Name -notmatch 'fixture' -and 
            $_.Name -ne '12-conflict-detector.spec.ts' -and
            $_.Name -ne 'visual-inspection.spec.ts'
        }
    }
    
    return $files
}

function Test-AntiPatterns {
    param(
        [string]$Content,
        [string]$FilePath
    )
    
    $issues = @()
    
    foreach ($pattern in $AntiPatterns) {
        if ($Content -match $pattern.Pattern) {
            $issues += @{
                File = $FilePath
                Message = $pattern.Message
                IsError = $pattern.IsError
                Pattern = $pattern.Pattern
            }
        }
    }
    
    return $issues
}

function Invoke-Migration {
    param(
        [string]$FilePath,
        [string]$Content
    )
    
    $modified = $Content
    $changes = @()
    
    foreach ($pattern in $MigrationPatterns) {
        if ($modified -match $pattern.Pattern) {
            $modified = $modified -replace $pattern.Pattern, $pattern.Replacement
            $changes += $pattern.Description
            
            # Apply post-processing if defined
            if ($pattern.PostProcess) {
                $modified = & $pattern.PostProcess $modified
            }
        }
    }
    
    return @{
        Content = $modified
        Changes = $changes
        HasChanges = $changes.Count -gt 0
    }
}

function Show-MigrationSummary {
    param(
        [string]$FilePath,
        [array]$Changes,
        [array]$Issues
    )
    
    Write-ColorOutput "`n📄 File: $FilePath" "Highlight"
    
    if ($Changes.Count -gt 0) {
        Write-ColorOutput "  ✅ Automated Changes:" "Success"
        foreach ($change in $Changes) {
            Write-ColorOutput "    - $change" "Info"
        }
    }
    
    if ($Issues.Count -gt 0) {
        Write-ColorOutput "  ⚠️ Manual Review Required:" "Warning"
        foreach ($issue in $Issues) {
            $color = if ($issue.IsError) { "Error" } else { "Warning" }
            Write-ColorOutput "    - $($issue.Message)" $color
        }
    }
    
    if ($Changes.Count -eq 0 -and $Issues.Count -eq 0) {
        Write-ColorOutput "  ℹ️ No changes needed" "Info"
    }
}

function New-BackupFile {
    param(
        [string]$FilePath
    )
    
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupPath = "$FilePath.backup_$timestamp"
    Copy-Item -Path $FilePath -Destination $backupPath
    Write-ColorOutput "  💾 Backup created: $backupPath" "Info"
}

# Main execution
Write-ColorOutput "╔═══════════════════════════════════════════════════════╗" "Highlight"
Write-ColorOutput "║   E2E Test Migration Script - Batch Processor         ║" "Highlight"
Write-ColorOutput "║   Phase 1: E2E Test Reliability                       ║" "Highlight"
Write-ColorOutput "╚═══════════════════════════════════════════════════════╝" "Highlight"
Write-ColorOutput ""

if ($DryRun) {
    Write-ColorOutput "🔍 DRY RUN MODE - No files will be modified`n" "Warning"
}

# Get files to process
$files = Get-E2ETestFiles -FileFilter $TargetFiles

if ($files.Count -eq 0) {
    Write-ColorOutput "No files found to migrate" "Warning"
    exit 0
}

Write-ColorOutput "Found $($files.Count) file(s) to process`n" "Info"

# Process each file
$totalChanges = 0
$totalIssues = 0
$processedFiles = 0

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    
    # Run migration
    $result = Invoke-Migration -FilePath $file.FullName -Content $content
    
    # Check for anti-patterns
    $issues = Test-AntiPatterns -Content $content -FilePath $file.Name
    
    # Show summary
    Show-MigrationSummary -FilePath $file.Name -Changes $result.Changes -Issues $issues
    
    # Apply changes if not dry run
    if (-not $DryRun -and $result.HasChanges) {
        New-BackupFile -FilePath $file.FullName
        Set-Content -Path $file.FullName -Value $result.Content -NoNewline
        Write-ColorOutput "  ✅ File updated" "Success"
        $processedFiles++
    }
    
    $totalChanges += $result.Changes.Count
    $totalIssues += $issues.Count
}

# Final summary
Write-ColorOutput "`n╔═══════════════════════════════════════════════════════╗" "Highlight"
Write-ColorOutput "║   Migration Summary                                   ║" "Highlight"
Write-ColorOutput "╚═══════════════════════════════════════════════════════╝" "Highlight"
Write-ColorOutput ""
Write-ColorOutput "Files processed: $($files.Count)" "Info"
Write-ColorOutput "Files modified: $processedFiles" "Success"
Write-ColorOutput "Automated changes: $totalChanges" "Success"
Write-ColorOutput "Manual review items: $totalIssues" "Warning"

if ($DryRun) {
    Write-ColorOutput "`n💡 Run without -DryRun to apply changes" "Info"
} else {
    Write-ColorOutput "`n✅ Migration complete!" "Success"
    Write-ColorOutput "📋 Next steps:" "Info"
    Write-ColorOutput "  1. Review modified files" "Info"
    Write-ColorOutput "  2. Address manual review items (marked with ⚠️)" "Info"
    Write-ColorOutput "  3. Run tests: pnpm test:e2e" "Info"
    Write-ColorOutput "  4. Remove backup files once verified" "Info"
}

Write-ColorOutput ""
