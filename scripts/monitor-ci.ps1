# CI Monitoring & Artifact Analysis Tool
# Purpose: Monitor GitHub Actions CI, download artifacts on failure, and analyze
# Date: December 7, 2025
# Uses: GitHub CLI (gh) for authentication-free access

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$RepoPath = "yukimura-ixa/school-timetable-senior-project",
    
    [Parameter(Mandatory=$false)]
    [int]$MaxRuns = 10,
    
    [Parameter(Mandatory=$false)]
    [string]$OutputDir = "ci-analysis",
    
    [Parameter(Mandatory=$false)]
    [switch]$DownloadAll,
    
    [Parameter(Mandatory=$false)]
    [switch]$NoDownload
)

# Create output directory
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

Write-Host "🚀 CI Monitoring Tool - Starting..." -ForegroundColor Green
Write-Host "Repository: $RepoPath"
Write-Host "Output Directory: $OutputDir"
Write-Host "Download on failure: $(if ($NoDownload) { 'Disabled' } else { 'Enabled' })"
Write-Host ""

# Verify gh CLI is available
$ghVersion = gh --version 2>&1 | Select-Object -First 1
if (-not $ghVersion) {
    Write-Host "❌ GitHub CLI (gh) is not installed or not in PATH" -ForegroundColor Red
    Write-Host "   Install from: https://cli.github.com/" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Using GitHub CLI: $ghVersion" -ForegroundColor Green
Write-Host ""

# ============================================================================
# 1. Fetch Recent Workflow Runs
# ============================================================================

Write-Host "📋 Fetching recent workflow runs..." -ForegroundColor Cyan

try {
    # Use correct gh CLI fields
    $runsOutput = & gh run list --repo $RepoPath --limit $MaxRuns --json "number,name,status,conclusion,createdAt,url" 2>&1 | Out-String
    
    # Check for errors
    if ($runsOutput -match "Unknown JSON field|ERROR") {
        Write-Host "❌ GitHub CLI error:" -ForegroundColor Red
        Write-Host $runsOutput -ForegroundColor Red
        Write-Host ""
        Write-Host "Available fields can be seen with: gh run list --help" -ForegroundColor Yellow
        exit 1
    }
    
    $runs = $runsOutput | ConvertFrom-Json -ErrorAction Stop
    
    if (-not $runs -or $runs.Count -eq 0) {
        Write-Host "❌ No workflow runs found" -ForegroundColor Yellow
        exit 0
    }
    
    # Handle single run (not an array)
    if ($runs -is [PSCustomObject] -and -not ($runs -is [array])) {
        $runs = @($runs)
    }
    
    Write-Host "✅ Found $($runs.Count) recent workflow runs" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Error parsing workflow runs: $_" -ForegroundColor Red
    Write-Host "Raw output: $runsOutput" -ForegroundColor Red
    exit 1
}

# ============================================================================
# 2. Analyze Each Run and Check for Failures
# ============================================================================

$failedRuns = @()
$passedRuns = @()

foreach ($run in $runs) {
    $runId = $run.number
    $runName = $run.name
    $runStatus = $run.status
    $runConclusion = $run.conclusion
    $runUrl = $run.url
    $createdAt = [datetime]::Parse($run.createdAt)
    
    # Determine status
    $isCompleted = -not [string]::IsNullOrWhiteSpace($runConclusion)
    $isSuccess = $runConclusion -eq "success"
    
    $statusEmoji = if ($isCompleted) { 
        if ($isSuccess) { "✅" } else { "❌" }
    } else {
        "⏳"
    }
    
    $conclusionText = if ($isCompleted) { $runConclusion.ToUpper() } else { "IN PROGRESS" }
    
    Write-Host "$statusEmoji [$conclusionText] $runName (Run #$runId)" -ForegroundColor $(
        if ($isCompleted) {
            if ($isSuccess) { "Green" } else { "Red" }
        } else {
            "Yellow"
        }
    )
    Write-Host "   Created: $($createdAt.ToString('yyyy-MM-dd HH:mm:ss'))"
    Write-Host "   URL: $runUrl"
    
    if ($isCompleted -and -not $isSuccess) {
        $failedRuns += @{
            number = $runId
            name = $runName
            status = $runStatus
            conclusion = $runConclusion
            url = $runUrl
            createdAt = $createdAt
        }
        Write-Host "   ⚠️  This run FAILED" -ForegroundColor Yellow
    } elseif ($isCompleted) {
        $passedRuns += $runId
    } else {
        Write-Host "   ⏳ Waiting for completion..." -ForegroundColor Yellow
    }
    Write-Host ""
}

# ============================================================================
# 3. Download Artifacts for Failed Runs
# ============================================================================

if ($failedRuns.Count -gt 0 -and -not $NoDownload) {
    Write-Host "📥 Downloading artifacts for $($failedRuns.Count) failed run(s)..." -ForegroundColor Cyan
    Write-Host ""
    
    foreach ($failedRun in $failedRuns) {
        $runId = $failedRun.number
        $runName = $failedRun.name
        
        Write-Host "📦 Processing: $runName (Run #$runId)" -ForegroundColor Cyan
        
        try {
            # Fetch artifacts for this run
            $artifactsJson = gh run download $runId --repo $RepoPath --dir "ci-analysis/run-$runId" 2>&1
            
            Write-Host "   ✅ Artifacts downloaded successfully" -ForegroundColor Green
            Write-Host "   📁 Location: ci-analysis/run-$runId" -ForegroundColor Green
            
        } catch {
            Write-Host "   ⚠️  Error or no artifacts: $_" -ForegroundColor Yellow
        }
        
        Write-Host ""
    }
} elseif ($failedRuns.Count -gt 0 -and $NoDownload) {
    Write-Host "⏭️  Skipping artifact download (--NoDownload specified)" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "✅ All recent runs PASSED - no artifacts to download" -ForegroundColor Green
    Write-Host ""
}

# ============================================================================
# 4. Analyze Artifacts
# ============================================================================

Write-Host "🔍 Analyzing downloaded artifacts..." -ForegroundColor Cyan
Write-Host ""

if ((Test-Path $OutputDir) -and (Get-ChildItem $OutputDir -Recurse -ErrorAction SilentlyContinue | Measure-Object).Count -gt 0) {
    
    # Find and analyze test result files
    $logFiles = Get-ChildItem $OutputDir -Recurse -Include "*.log", "*.txt" -ErrorAction SilentlyContinue | Select-Object -First 20
    
    if ($logFiles.Count -gt 0) {
        Write-Host "📊 Found log files:" -ForegroundColor Cyan
        
        foreach ($file in $logFiles) {
            $relativePath = $file.FullName.Replace((Get-Item $OutputDir).FullName, "").TrimStart("\")
            Write-Host "   📄 $relativePath" -ForegroundColor White
            
            # Show last 20 lines for context
            Write-Host "      Last lines:" -ForegroundColor Gray
            $lines = @(Get-Content $file.FullName -Tail 10 -ErrorAction SilentlyContinue)
            $lines | ForEach-Object { Write-Host "        $_" -ForegroundColor DarkGray }
        }
    }
    
    # Show directory structure
    Write-Host ""
    Write-Host "📁 Artifact Directory Structure:" -ForegroundColor Cyan
    Get-ChildItem $OutputDir -Recurse -ErrorAction SilentlyContinue | 
        ForEach-Object {
            $depth = ($_.FullName -split '\\').Count - (Get-Item $OutputDir).FullName.Split('\').Count
            $indent = "   " * $depth
            if ($_.PSIsContainer) {
                Write-Host "$indent📁 $($_.Name)" -ForegroundColor Cyan
            } else {
                $size = [math]::Round($_.Length / 1KB, 2)
                Write-Host "$indent📄 $($_.Name) ($size KB)" -ForegroundColor Gray
            }
        }
    
} else {
    Write-Host "ℹ️  No artifacts found in output directory" -ForegroundColor Yellow
}

Write-Host ""

# ============================================================================
# 5. Generate Summary Report
# ============================================================================

$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$reportPath = Join-Path $OutputDir "CI_ANALYSIS_REPORT_$timestamp.txt"

$reportContent = @"
================================================================================
CI MONITORING & ANALYSIS REPORT
Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
Repository: $RepoPath
================================================================================

SUMMARY
-------
Total Runs Analyzed: $($runs.Count)
Passed (Completed): $($passedRuns.Count)
Failed (Completed): $($failedRuns.Count)
In Progress: $(($runs | Where-Object { [string]::IsNullOrWhiteSpace($_.conclusion) }).Count)
Artifacts Downloaded: $(if ($failedRuns.Count -gt 0 -and -not $NoDownload) { 'Yes' } else { 'No' })

================================================================================
FAILED RUNS ($($failedRuns.Count))
================================================================================
$( if ($failedRuns.Count -gt 0) {
    $failedRuns | ForEach-Object {
        "
Run ID: $($_.number)
Name: $($_.name)
Status: $($_.conclusion)
Created: $($_.createdAt.ToString('yyyy-MM-dd HH:mm:ss'))
URL: $($_.url)
---"
    }
} else {
    "No failed runs"
})

================================================================================
NEXT STEPS
================================================================================

1. Review downloaded artifacts in: $(Resolve-Path $OutputDir)
2. Check detailed error logs in artifact directories
3. Run failed tests locally to reproduce:
   - pnpm test              (Unit tests)
   - pnpm test:e2e          (E2E tests)
   - pnpm run lint          (Linting)
   - pnpm run typecheck     (TypeScript)

4. Visit GitHub Actions for live logs:
   https://github.com/$RepoPath/actions

5. Common issues to check:
   - Database connection/health
   - Type errors or lint violations
   - Test timeouts or flaky tests
   - Resource constraints

================================================================================
HOW TO USE THIS TOOL
================================================================================

Usage:
  pwsh scripts/monitor-ci.ps1 [options]

Options:
  -MaxRuns <int>      : Number of recent runs to check (default: 10)
  -OutputDir <path>   : Output directory for artifacts (default: ci-analysis)
  -NoDownload         : Skip downloading artifacts
  -DownloadAll        : Download artifacts even from passed runs

Examples:
  # Check last 5 runs and download failed artifacts
  pwsh scripts/monitor-ci.ps1 -MaxRuns 5

  # Just check status without downloading
  pwsh scripts/monitor-ci.ps1 -NoDownload

  # Download all artifacts
  pwsh scripts/monitor-ci.ps1 -DownloadAll

================================================================================
"@

$reportContent | Tee-Object -FilePath $reportPath | Out-Host

Write-Host ""
Write-Host "✅ Monitoring complete!" -ForegroundColor Green
Write-Host "📄 Report saved to: $reportPath" -ForegroundColor Green
Write-Host "📁 Artifacts directory: $(Resolve-Path $OutputDir)" -ForegroundColor Green
Write-Host ""

# Show summary
if ($failedRuns.Count -gt 0) {
    Write-Host "⚠️  ACTION REQUIRED: $($failedRuns.Count) failed run(s) detected!" -ForegroundColor Yellow
} else {
    Write-Host "✅ All recent runs passed!" -ForegroundColor Green
}
