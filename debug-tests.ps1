# Simple diagnostic script for test discovery
Write-Host "=== Playwright Test Discovery Diagnostic ===" -ForegroundColor Cyan
Write-Host ""

# Check Node and pnpm versions
Write-Host "Environment:" -ForegroundColor Yellow
Write-Host "  Node: $(node --version)"
Write-Host "  pnpm: $(pnpm --version)"
Write-Host ""

# Count test files
$specFiles = Get-ChildItem e2e\*.spec.ts
$setupFiles = Get-ChildItem e2e\*.setup.ts
Write-Host "Test Files Found:" -ForegroundColor Yellow
Write-Host "  Spec files: $($specFiles.Count)"
Write-Host "  Setup files: $($setupFiles.Count)"
Write-Host ""

# Try to run Playwright list without webserver
Write-Host "Attempting test discovery (no webserver)..." -ForegroundColor Yellow
$env:SKIP_WEBSERVER = "1"

try {
    # Capture output
    $output = pnpm exec playwright test --list 2>&1 | Out-String
    $exitCode = $LASTEXITCODE
    
    Write-Host "Exit Code: $exitCode" -ForegroundColor $(if ($exitCode -eq 0) { 'Green' } else { 'Red' })
    
    # Parse output for test count
    if ($output -match '(\d+) tests? total') {
        $testCount = $matches[1]
        Write-Host "Tests Discovered: $testCount" -ForegroundColor $(if ($testCount -gt 0) { 'Green' } else { 'Red' })
    } else {
        Write-Host "Tests Discovered: UNKNOWN (output parsing failed)" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "Full Output:" -ForegroundColor Gray
    Write-Host $output
    
} catch {
    Write-Host "ERROR: $_" -ForegroundColor Red
}
