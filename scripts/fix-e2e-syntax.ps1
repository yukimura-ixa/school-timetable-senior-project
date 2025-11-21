$files = Get-ChildItem -Path "e2e" -Filter "*.spec.ts" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    # We want to match literal "`n" (backtick n)
    # In PowerShell string, backtick is escape char. To get literal backtick, use ``
    $target = "``n    const { page } = authenticatedAdmin;"
    
    if ($content.Contains($target)) {
        Write-Host "Fixing $($file.Name)"
        $content = $content.Replace($target, "`r`n    const { page } = authenticatedAdmin;")
        Set-Content $file.FullName $content
    }
}
