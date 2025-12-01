<#
.SYNOPSIS
Downloads E2E test artifacts from GitHub Actions using GitHub CLI.

.DESCRIPTION
Downloads playwright-merged-json and other artifacts from the latest or specific
GitHub Actions workflow run. Automatically extracts and organizes trace files.

.PARAMETER Workflow
The workflow name to download artifacts from. Default: "E2E Tests"

.PARAMETER Branch
The branch to filter runs by. Default: "main"

.PARAMETER RunId
Optional specific run ID. If not provided, uses the latest run.

.PARAMETER FailedOnly
Only download from failed runs.

.EXAMPLE
.\download-e2e-artifacts.ps1
Downloads from the latest E2E Tests run on main branch.

.EXAMPLE
.\download-e2e-artifacts.ps1 -FailedOnly
Downloads from the latest failed run.

.EXAMPLE
.\download-e2e-artifacts.ps1 -RunId 12345678
Downloads from a specific workflow run.

.NOTES
Requires GitHub CLI (gh) to be installed and authenticated.
Install: winget install --id GitHub.cli
Auth: gh auth login
#>

param(
    [Parameter(Mandatory=$false)]
    [string]$Workflow = "E2E Tests",
    
    [Parameter(Mandatory=$false)]
    [string]$Branch = "main",
    
    [Parameter(Mandatory=$false)]
    [string]$RunId,
    
    [Parameter(Mandatory=$false)]
    [switch]$FailedOnly
)

$ErrorActionPreference = "Stop"

# Colors for output
function Write-Info { param([string]$Message) Write-Host $Message -ForegroundColor Cyan }
function Write-Success { param([string]$Message) Write-Host $Message -ForegroundColor Green }
function Write-Warn { param([string]$Message) Write-Host $Message -ForegroundColor Yellow }
function Write-Err { param([string]$Message) Write-Host $Message -ForegroundColor Red }

# Check if gh CLI is installed
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Err "❌ GitHub CLI (gh) is not installed"
    Write-Warn ""
    Write-Warn "Install with:"
    Write-Warn "  winget install --id GitHub.cli"
    Write-Warn ""
    Write-Warn "Then authenticate:"
    Write-Warn "  gh auth login"
    exit 1
}

# Check if authenticated
$authStatus = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Err "❌ Not authenticated with GitHub CLI"
    Write-Warn ""
    Write-Warn "Run: gh auth login"
    exit 1
}

Write-Info "🔍 Finding workflow runs..."

# Build the gh run list command
$ghArgs = @("run", "list", "--workflow=$Workflow", "--branch=$Branch", "--limit=10", "--json", "databaseId,conclusion,headBranch,headSha,status,createdAt,displayTitle")

if ($RunId) {
    # If specific run ID provided, fetch it directly
    $ghArgs = @("run", "view", $RunId, "--json", "databaseId,conclusion,headBranch,headSha,status,createdAt,displayTitle")
    $runData = gh @ghArgs | ConvertFrom-Json
    $runs = @($runData)
} else {
    $runsJson = gh @ghArgs
    $runs = $runsJson | ConvertFrom-Json
    
    if ($FailedOnly) {
        $runs = $runs | Where-Object { $_.conclusion -eq "failure" }
    }
}

if (-not $runs -or $runs.Count -eq 0) {
    Write-Err "❌ No matching workflow runs found"
    Write-Warn ""
    Write-Warn "Try:"
    Write-Warn "  - Check workflow name: $Workflow"
    Write-Warn "  - Check branch: $Branch"
    Write-Warn "  - Remove -FailedOnly flag"
    exit 1
}

# Select the most recent run
$run = $runs[0]
$selectedRunId = $run.databaseId

Write-Success ""
Write-Success "📊 Workflow Run Details:"
Write-Host "  Run ID:     $selectedRunId" -ForegroundColor White
Write-Host "  Title:      $($run.displayTitle)" -ForegroundColor White
Write-Host "  Branch:     $($run.headBranch)" -ForegroundColor White
Write-Host "  Commit:     $($run.headSha.Substring(0, 7))" -ForegroundColor White
Write-Host "  Status:     $($run.status)" -ForegroundColor White
Write-Host "  Conclusion: $($run.conclusion)" -ForegroundColor $(if ($run.conclusion -eq 'success') { 'Green' } elseif ($run.conclusion -eq 'failure') { 'Red' } else { 'Yellow' })
Write-Host "  Created:    $($run.createdAt)" -ForegroundColor White

# Create output directory
$outputDir = "test-results-ci"
if (Test-Path $outputDir) {
    Write-Info ""
    Write-Info "🧹 Cleaning previous artifacts..."
    Remove-Item -Recurse -Force $outputDir
}
New-Item -ItemType Directory -Path $outputDir -Force | Out-Null

Write-Info ""
Write-Info "⬇️  Downloading artifacts..."

# Download all artifacts from the run
gh run download $selectedRunId --dir $outputDir 2>&1 | ForEach-Object {
    if ($_ -match "Downloading") {
        Write-Host "  $_" -ForegroundColor Gray
    }
}

if ($LASTEXITCODE -ne 0) {
    Write-Err "❌ Failed to download artifacts"
    Write-Warn "The run may still be in progress or have no artifacts."
    exit 1
}

Write-Success "✅ Artifacts downloaded to ./$outputDir/"

# Copy merged results to project root if available
$mergedJsonPath = Join-Path $outputDir "playwright-merged-json" "merged-results.json"
if (Test-Path $mergedJsonPath) {
    Copy-Item $mergedJsonPath "merged-results.json" -Force
    $fileSize = (Get-Item "merged-results.json").Length
    Write-Success ""
    Write-Success "📄 Merged results: ./merged-results.json ($fileSize bytes)"
}

# Copy HTML report if available
$htmlReportPath = Join-Path $outputDir "playwright-html-report"
if (Test-Path $htmlReportPath) {
    if (Test-Path "playwright-report") {
        Remove-Item -Recurse -Force "playwright-report"
    }
    Copy-Item -Recurse $htmlReportPath "playwright-report"
    Write-Success "📊 HTML report: ./playwright-report/index.html"
    Write-Info ""
    Write-Info "View HTML report with: pnpm test:report"
}

# Find and list trace files
$traceFiles = Get-ChildItem -Path $outputDir -Filter "*.zip" -Recurse -ErrorAction SilentlyContinue
if ($traceFiles) {
    Write-Warn ""
    Write-Warn "📊 Trace files available (for failed tests):"
    $traceFiles | ForEach-Object {
        Write-Host "  - $($_.FullName)" -ForegroundColor Gray
    }
    Write-Info ""
    Write-Info "View trace with: pnpm exec playwright show-trace <file.zip>"
}

# Find screenshots
$screenshots = Get-ChildItem -Path $outputDir -Include "*.png","*.jpg" -Recurse -ErrorAction SilentlyContinue
if ($screenshots) {
    Write-Warn ""
    Write-Warn "📸 Screenshots captured:"
    $screenshots | Select-Object -First 10 | ForEach-Object {
        Write-Host "  - $($_.FullName)" -ForegroundColor Gray
    }
    if ($screenshots.Count -gt 10) {
        Write-Host "  ... and $($screenshots.Count - 10) more" -ForegroundColor Gray
    }
}

Write-Success ""
Write-Success "✅ Done! Artifacts ready for analysis."
Write-Info ""
Write-Info "Quick commands:"
Write-Info "  View HTML report:    pnpm test:report"
Write-Info "  Analyze JSON:        code merged-results.json"
Write-Info "  View trace:          pnpm exec playwright show-trace <file.zip>"
