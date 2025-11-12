#!/usr/bin/env pwsh
<#
.SYNOPSIS
    E2E Test Tri-Run Validation Script
.DESCRIPTION
    Executes 3 consecutive E2E test runs to measure:
    - Pass rate consistency
    - Average runtime
    - Flakiness detection
    - Improvement validation
.EXAMPLE
    .\scripts\tri-run-validation.ps1
#>

$ErrorActionPreference = "Continue"

# ANSI Colors
$colors = @{
    Reset = "`e[0m"
    Cyan = "`e[36m"
    Green = "`e[32m"
    Yellow = "`e[33m"
    Red = "`e[31m"
    Gray = "`e[90m"
    Bold = "`e[1m"
}

function Write-ColorHost($message, $color = 'Reset') {
    Write-Host "$($colors[$color])$message$($colors.Reset)"
}

function Parse-TestResults($output) {
    $passed = 0
    $failed = 0
    $flaky = 0
    
    if ($output -match '(\d+) passed') { $passed = [int]$matches[1] }
    if ($output -match '(\d+) failed') { $failed = [int]$matches[1] }
    if ($output -match '(\d+) flaky') { $flaky = [int]$matches[1] }
    
    return @{
        Passed = $passed
        Failed = $failed
        Flaky = $flaky
        Total = $passed + $failed + $flaky
    }
}

# Header
Write-ColorHost "`n╔════════════════════════════════════════════════════════════════╗" Cyan
Write-ColorHost "║     E2E Test Tri-Run Validation - Phase B Session 4           ║" Cyan
Write-ColorHost "╚════════════════════════════════════════════════════════════════╝`n" Cyan

Write-ColorHost "📊 Measuring reliability improvements from Phase B optimizations" Gray
Write-ColorHost "   - 79 networkidle waits eliminated (Sessions 2-3)" Gray
Write-ColorHost "   - Target: >90% pass rate, 30-40% runtime reduction`n" Gray

# Storage for results
$runs = @()

# Execute 3 runs
for ($i = 1; $i -le 3; $i++) {
    Write-ColorHost "`n$($colors.Bold)═══ Run $i/3 ═══$($colors.Reset)" Cyan
    
    $startTime = Get-Date
    
    # Run tests and capture output
    $output = pnpm test:e2e 2>&1 | Out-String
    $exitCode = $LASTEXITCODE
    
    $duration = ((Get-Date) - $startTime).TotalSeconds
    $results = Parse-TestResults $output
    
    # Calculate pass rate
    $passRate = if ($results.Total -gt 0) { 
        [math]::Round(($results.Passed / $results.Total) * 100, 1) 
    } else { 
        0 
    }
    
    # Store results
    $runs += @{
        Run = $i
        Passed = $results.Passed
        Failed = $results.Failed
        Flaky = $results.Flaky
        Total = $results.Total
        Duration = $duration
        PassRate = $passRate
        ExitCode = $exitCode
    }
    
    # Display results
    $statusColor = if ($passRate -ge 90) { 'Green' } elseif ($passRate -ge 75) { 'Yellow' } else { 'Red' }
    
    Write-ColorHost "`nRun $i Results:" Gray
    Write-ColorHost "  ✓ Passed:  $($results.Passed)" Green
    if ($results.Failed -gt 0) { Write-ColorHost "  ✗ Failed:  $($results.Failed)" Red }
    if ($results.Flaky -gt 0) { Write-ColorHost "  ~ Flaky:   $($results.Flaky)" Yellow }
    Write-ColorHost "  • Total:   $($results.Total)" Gray
    Write-ColorHost "  ⏱ Duration: $([math]::Round($duration, 1))s" Gray
    Write-ColorHost "  📈 Pass Rate: $passRate%" $statusColor
}

# Statistical Analysis
Write-ColorHost "`n`n╔════════════════════════════════════════════════════════════════╗" Cyan
Write-ColorHost "║                    Statistical Summary                         ║" Cyan
Write-ColorHost "╚════════════════════════════════════════════════════════════════╝`n" Cyan

# Calculate averages
$avgPassed = ($runs | Measure-Object -Property Passed -Average).Average
$avgFailed = ($runs | Measure-Object -Property Failed -Average).Average
$avgFlaky = ($runs | Measure-Object -Property Flaky -Average).Average
$avgDuration = ($runs | Measure-Object -Property Duration -Average).Average
$avgPassRate = ($runs | Measure-Object -Property PassRate -Average).Average

# Calculate variance
$passRateVariance = ($runs | ForEach-Object { [math]::Pow($_.PassRate - $avgPassRate, 2) } | Measure-Object -Average).Average
$passRateStdDev = [math]::Sqrt($passRateVariance)

Write-ColorHost "Average Results (3 runs):" Bold
Write-ColorHost "  Passed:    $([math]::Round($avgPassed, 1))" Green
Write-ColorHost "  Failed:    $([math]::Round($avgFailed, 1))" $(if ($avgFailed -gt 0) { 'Yellow' } else { 'Gray' })
Write-ColorHost "  Flaky:     $([math]::Round($avgFlaky, 1))" $(if ($avgFlaky -gt 0) { 'Yellow' } else { 'Gray' })
Write-ColorHost "  Duration:  $([math]::Round($avgDuration, 1))s" Cyan
Write-ColorHost "  Pass Rate: $([math]::Round($avgPassRate, 1))%" $(if ($avgPassRate -ge 90) { 'Green' } else { 'Yellow' })

Write-ColorHost "`nConsistency Metrics:" Bold
Write-ColorHost "  Pass Rate Std Dev: $([math]::Round($passRateStdDev, 2))%" Gray
Write-ColorHost "  Duration Range:    $([math]::Round(($runs | Measure-Object -Property Duration -Minimum).Minimum, 1))s - $([math]::Round(($runs | Measure-Object -Property Duration -Maximum).Maximum, 1))s" Gray

# Improvements Summary
Write-ColorHost "`n`n╔════════════════════════════════════════════════════════════════╗" Cyan
Write-ColorHost "║                  Optimization Summary                          ║" Cyan
Write-ColorHost "╚════════════════════════════════════════════════════════════════╝`n" Cyan

Write-ColorHost "Phase B Improvements Applied:" Bold
Write-ColorHost "  ✅ Session 2: Management CRUD (4 specs)" Green
Write-ColorHost "     - program-management.spec.ts" Gray
Write-ColorHost "     - program-subject-assignment.spec.ts" Gray
Write-ColorHost "     - activity-management.spec.ts" Gray
Write-ColorHost "     - schedule-config.spec.ts" Gray
Write-ColorHost "`n  ✅ Session 3: Advanced Modals (3 specs)" Green
Write-ColorHost "     - conflict-detector.spec.ts (19 networkidle)" Gray
Write-ColorHost "     - bulk-lock.spec.ts (19 networkidle)" Gray
Write-ColorHost "     - lock-templates.spec.ts (38 networkidle)" Gray
Write-ColorHost "`n  ✅ DnD Cleanup: drag-and-drop.spec.ts (3 networkidle)" Green

Write-ColorHost "`n  📊 Total Eliminated: 79 networkidle waits" Cyan

# Target Achievement
Write-ColorHost "`n`n╔════════════════════════════════════════════════════════════════╗" Cyan
Write-ColorHost "║                   Target Achievement                           ║" Cyan
Write-ColorHost "╚════════════════════════════════════════════════════════════════╝`n" Cyan

$passRateTarget = 90
$passRateMet = $avgPassRate -ge $passRateTarget

Write-ColorHost "Pass Rate Target: ≥$passRateTarget%" Gray
Write-ColorHost "  Achieved: $([math]::Round($avgPassRate, 1))%" $(if ($passRateMet) { 'Green' } else { 'Yellow' })
Write-ColorHost "  Status:   $(if ($passRateMet) { '✅ MET' } else { '⚠️  PARTIAL' })" $(if ($passRateMet) { 'Green' } else { 'Yellow' })

# Exit with success if all runs passed
$allPassed = ($runs | Where-Object { $_.ExitCode -eq 0 }).Count -eq 3
if ($allPassed) {
    Write-ColorHost "`n✅ All 3 runs completed successfully!`n" Green
    exit 0
} else {
    Write-ColorHost "`n⚠️  Some runs had failures - review results above`n" Yellow
    exit 1
}
