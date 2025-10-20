# MUI Component Migration - PowerShell Script
# 
# This script helps migrate imports from custom components to MUI-based components
# 
# Usage:
#   .\migrate-imports.ps1 -ComponentName PrimaryButton -DryRun
#   .\migrate-imports.ps1 -ComponentName PrimaryButton -Execute
#   .\migrate-imports.ps1 -All -Execute

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('PrimaryButton', 'TextField', 'SearchBar', 'ErrorState', 'CheckBox', 'All')]
    [string]$ComponentName = 'All',
    
    [Parameter(Mandatory=$false)]
    [switch]$DryRun = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$Execute = $false,
    
    [Parameter(Mandatory=$false)]
    [string]$SourcePath = "src"
)

# Component mapping
$componentMappings = @{
    'PrimaryButton' = @{
        Old = '@/components/elements/static/PrimaryButton'
        New = '@/components/mui/PrimaryButton'
        Pattern = 'from\s+[''"]@/components/elements/static/PrimaryButton[''"]'
    }
    'TextField' = @{
        Old = '@/components/elements/input/field/TextField'
        New = '@/components/mui/TextField'
        Pattern = 'from\s+[''"]@/components/elements/input/field/TextField[''"]'
    }
    'SearchBar' = @{
        Old = '@/components/elements/input/field/SearchBar'
        New = '@/components/mui/SearchBar'
        Pattern = 'from\s+[''"]@/components/elements/input/field/SearchBar[''"]'
    }
    'ErrorState' = @{
        Old = '@/components/elements/static/ErrorState'
        New = '@/components/mui/ErrorState'
        Pattern = 'from\s+[''"]@/components/elements/static/ErrorState[''"]'
    }
    'CheckBox' = @{
        Old = '@/components/elements/input/selected_input/CheckBox'
        New = '@/components/mui/CheckBox'
        Pattern = 'from\s+[''"]@/components/elements/input/selected_input/CheckBox[''"]'
    }
}

function Show-Banner {
    Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║     MUI Component Migration Script            ║" -ForegroundColor Cyan
    Write-Host "║     School Timetable Project                  ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Get-FilesToMigrate {
    param([string]$Component)
    
    $mapping = $componentMappings[$Component]
    $pattern = $mapping.Old -replace '@/', ''
    
    Write-Host "Searching for files using: $($mapping.Old)" -ForegroundColor Yellow
    
    $files = Get-ChildItem -Path $SourcePath -Recurse -Filter *.tsx | 
        Where-Object { 
            (Get-Content $_.FullName -Raw) -match $mapping.Pattern 
        }
    
    return $files
}

function Update-ComponentImport {
    param(
        [string]$FilePath,
        [string]$Component,
        [bool]$DryRunMode
    )
    
    $mapping = $componentMappings[$Component]
    $oldImport = $mapping.Old
    $newImport = $mapping.New
    
    if ($DryRunMode) {
        Write-Host "  [DRY RUN] Would update: $FilePath" -ForegroundColor Gray
        Write-Host "    $oldImport -> $newImport" -ForegroundColor Gray
    } else {
        try {
            $content = Get-Content $FilePath -Raw
            $newContent = $content -replace [regex]::Escape($oldImport), $newImport
            
            if ($content -ne $newContent) {
                Set-Content -Path $FilePath -Value $newContent -NoNewline
                Write-Host "  [✓] Updated: $FilePath" -ForegroundColor Green
                return $true
            } else {
                Write-Host "  [Skip] No changes needed: $FilePath" -ForegroundColor Gray
                return $false
            }
        } catch {
            Write-Host "  [✗] Error updating: $FilePath" -ForegroundColor Red
            Write-Host "    Error: $($_.Exception.Message)" -ForegroundColor Red
            return $false
        }
    }
    
    return $true
}

function Migrate-Component {
    param([string]$Component)
    
    Write-Host "`n=== Migrating $Component ===" -ForegroundColor Cyan
    
    $files = Get-FilesToMigrate -Component $Component
    
    if ($files.Count -eq 0) {
        Write-Host "No files found using $Component" -ForegroundColor Yellow
        return @{ Total = 0; Updated = 0; Skipped = 0 }
    }
    
    Write-Host "Found $($files.Count) file(s) to update" -ForegroundColor Green
    Write-Host ""
    
    $updated = 0
    $skipped = 0
    
    foreach ($file in $files) {
        $relativePath = $file.FullName -replace [regex]::Escape((Get-Location).Path + '\'), ''
        
        if (Update-ComponentImport -FilePath $file.FullName -Component $Component -DryRunMode $DryRun) {
            if (-not $DryRun) {
                $updated++
            }
        } else {
            $skipped++
        }
    }
    
    return @{
        Total = $files.Count
        Updated = $updated
        Skipped = $skipped
    }
}

# Main execution
Show-Banner

if (-not ($DryRun -or $Execute)) {
    Write-Host "Please specify -DryRun or -Execute flag" -ForegroundColor Red
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Cyan
    Write-Host "  .\migrate-imports.ps1 -ComponentName PrimaryButton -DryRun" -ForegroundColor Gray
    Write-Host "  .\migrate-imports.ps1 -ComponentName PrimaryButton -Execute" -ForegroundColor Gray
    Write-Host "  .\migrate-imports.ps1 -All -Execute" -ForegroundColor Gray
    exit 1
}

if ($DryRun) {
    Write-Host "Running in DRY RUN mode (no files will be modified)" -ForegroundColor Yellow
    Write-Host ""
}

$results = @{}
$totalStats = @{ Total = 0; Updated = 0; Skipped = 0 }

if ($ComponentName -eq 'All') {
    $componentMappings.Keys | ForEach-Object {
        $stats = Migrate-Component -Component $_
        $results[$_] = $stats
        $totalStats.Total += $stats.Total
        $totalStats.Updated += $stats.Updated
        $totalStats.Skipped += $stats.Skipped
    }
} else {
    $stats = Migrate-Component -Component $ComponentName
    $results[$ComponentName] = $stats
    $totalStats = $stats
}

# Summary
Write-Host "`n╔════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║              Migration Summary                 ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$results.GetEnumerator() | ForEach-Object {
    $component = $_.Key
    $stats = $_.Value
    
    if ($stats.Total -gt 0) {
        Write-Host "$component:" -ForegroundColor White
        Write-Host "  Total files: $($stats.Total)" -ForegroundColor Gray
        
        if (-not $DryRun) {
            Write-Host "  Updated: $($stats.Updated)" -ForegroundColor Green
            Write-Host "  Skipped: $($stats.Skipped)" -ForegroundColor Gray
        }
        Write-Host ""
    }
}

Write-Host "Total Summary:" -ForegroundColor White
Write-Host "  Total files affected: $($totalStats.Total)" -ForegroundColor Gray

if (-not $DryRun) {
    Write-Host "  Successfully updated: $($totalStats.Updated)" -ForegroundColor Green
    Write-Host "  Skipped: $($totalStats.Skipped)" -ForegroundColor Gray
    
    Write-Host "`n[✓] Migration complete!" -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Cyan
    Write-Host "  1. Run tests: pnpm test" -ForegroundColor Gray
    Write-Host "  2. Run E2E tests: pnpm test:e2e" -ForegroundColor Gray
    Write-Host "  3. Start dev server: pnpm dev" -ForegroundColor Gray
    Write-Host "  4. Verify all pages work correctly" -ForegroundColor Gray
} else {
    Write-Host "`nThis was a DRY RUN - no files were modified" -ForegroundColor Yellow
    Write-Host "Run with -Execute flag to apply changes" -ForegroundColor Yellow
}

Write-Host ""
