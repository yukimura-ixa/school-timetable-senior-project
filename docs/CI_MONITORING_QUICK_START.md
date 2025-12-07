# CI Monitoring Quick Start Guide

## TL;DR - Get CI Status Right Now

```bash
# Check last 10 runs (no downloads)
pwsh scripts/monitor-ci.ps1 -MaxRuns 10 -NoDownload

# Download artifacts from failed runs
pwsh scripts/monitor-ci.ps1

# Watch live on GitHub
https://github.com/yukimura-ixa/school-timetable-senior-project/actions
```

---

## What This Tool Does

The `scripts/monitor-ci.ps1` script:
1. ✅ Lists recent GitHub Actions workflow runs
2. ✅ Identifies failed runs
3. ✅ Downloads test artifacts automatically
4. ✅ Generates analysis report
5. ✅ Provides recovery steps

---

## Common Commands

### View Status (Safe, Read-Only)
```bash
# Check last 10 completed runs
pwsh scripts/monitor-ci.ps1 -NoDownload

# Check last 5 runs
pwsh scripts/monitor-ci.ps1 -MaxRuns 5 -NoDownload

# Show detailed report
cat ci-analysis/CI_ANALYSIS_REPORT_*.txt | head -50
```

### Download & Analyze Failed Artifacts
```bash
# Auto-download failed run artifacts
pwsh scripts/monitor-ci.ps1 -MaxRuns 10

# Download to custom directory
pwsh scripts/monitor-ci.ps1 -MaxRuns 5 -OutputDir "ci-analysis/latest"

# Download all (including passed)
pwsh scripts/monitor-ci.ps1 -DownloadAll
```

### Find Specific Information
```bash
# List all downloaded files
ls -Recurse ci-analysis -File

# View a specific report
cat ci-analysis/CI_ANALYSIS_REPORT_*.txt

# Search for errors
grep -r "error\|failed\|failed\|fatal" ci-analysis --include="*.txt" --include="*.log"
```

---

## Script Output Explained

### Status Indicators
- ✅ `[SUCCESS]` - Run completed successfully
- ❌ `[FAILURE]` - Run failed (artifacts will be downloaded)
- ⏳ `[IN PROGRESS]` - Waiting for run to complete
- ⏭️ `Skipping artifact download` - Using `-NoDownload` flag

### Report Structure
```
SUMMARY
  ├─ Total Runs Analyzed
  ├─ Passed / Failed / In Progress
  └─ Artifacts Downloaded: Yes/No

FAILED RUNS
  └─ Details of each failed run
     ├─ Run ID
     ├─ Name (CI, E2E Tests, Smoke Tests)
     ├─ Status (failure, etc)
     ├─ Created timestamp
     └─ GitHub URL

NEXT STEPS
  └─ Recommended actions to fix
```

---

## Troubleshooting the Monitoring Tool

### "Bad credentials" Error
- Ensure GitHub CLI is authenticated: `gh auth status`
- Sign in: `gh auth login`

### "Unknown JSON field" Error
- The script uses the correct field names for your gh CLI version
- Update gh: `gh upgrade`

### No Artifacts Downloaded
- Run might be in progress (check output for ⏳)
- Run might not have generated artifacts
- Check the GitHub UI directly for more details

### Permission Issues
- Ensure you have access to the repository
- Check: `gh repo view yukimura-ixa/school-timetable-senior-project`

---

## When to Use This Tool

| Situation | Command | Note |
|-----------|---------|------|
| **Quick status check** | `pwsh scripts/monitor-ci.ps1 -NoDownload` | 5-10 seconds |
| **Investigate failure** | `pwsh scripts/monitor-ci.ps1 -MaxRuns 1` | Downloads latest |
| **Batch download** | `pwsh scripts/monitor-ci.ps1 -MaxRuns 10` | All recent failed |
| **Deep dive** | `pwsh scripts/monitor-ci.ps1 -DownloadAll` | All runs |
| **Live monitoring** | Visit GitHub Actions UI | Browser-based |

---

## Recovery Workflow

### 1. Run the monitor
```bash
pwsh scripts/monitor-ci.ps1
```

### 2. Review the report
```bash
cat ci-analysis/CI_ANALYSIS_REPORT_*.txt
```

### 3. Check failed run details
- Click the GitHub URL from the report
- Or visit: https://github.com/yukimura-ixa/school-timetable-senior-project/actions

### 4. Run tests locally
```bash
# Lint & Type Check
pnpm run lint
pnpm run typecheck

# Unit Tests
pnpm test

# E2E Tests (if DB available)
pnpm test:e2e:manual

# Smoke Tests
pnpm test:smoke
```

### 5. Fix and commit
```bash
# Make fixes
git add .
git commit -m "fix: [description of fix]"
git push origin main
```

### 6. Verify new run passes
```bash
# Monitor new run
pwsh scripts/monitor-ci.ps1 -MaxRuns 1 -NoDownload
```

---

## Output Directory Structure

After running the tool:
```
ci-analysis/
├── run-204/                    # Artifacts from failed run #204
│   └── [artifact files]
├── run-37/                     # Artifacts from failed run #37
│   └── [artifact files]
├── CI_ANALYSIS_REPORT_*.txt    # Summary report
└── CI_ANALYSIS_REPORT_*.txt    # Additional reports
```

---

## Integration with Your Workflow

### Before Starting Work
```bash
# Check if CI is passing
pwsh scripts/monitor-ci.ps1 -MaxRuns 1 -NoDownload
```

### After Pushing Changes
```bash
# Wait a minute, then check status
pwsh scripts/monitor-ci.ps1 -MaxRuns 1 -NoDownload

# If failed, download artifacts
pwsh scripts/monitor-ci.ps1
```

### Daily Standup
```bash
# Get full status
pwsh scripts/monitor-ci.ps1 -NoDownload
```

---

## Tips & Tricks

### Fastest Check
```bash
gh run list --repo yukimura-ixa/school-timetable-senior-project --limit 3
```

### Pretty Report
```bash
pwsh scripts/monitor-ci.ps1 -NoDownload | tee ci-status.txt
cat ci-status.txt
```

### Continuous Monitoring
```bash
# Watch in a terminal loop (every 30 seconds)
while ($true) {
    Clear-Host
    pwsh scripts/monitor-ci.ps1 -MaxRuns 5 -NoDownload
    Write-Host "Updated at $(Get-Date)"
    Start-Sleep -Seconds 30
}
```

### Export Report
```bash
# Save report to file
pwsh scripts/monitor-ci.ps1 | Tee-Object "CI_Report_$(Get-Date -Format 'yyyyMMdd_HHmmss').txt"
```

---

## Need Help?

### Check Script Help
```bash
Get-Help b:\Dev\school-timetable-senior-project\scripts\monitor-ci.ps1 -Full
```

### View GitHub Actions Documentation
- GitHub Actions: https://docs.github.com/en/actions
- gh CLI: https://cli.github.com/

### Review Recent CI Issues
- Check: `docs/CI_MONITORING_ANALYSIS_2025-12-07.md`
- Check: `MIGRATION_SUMMARY.md` for past issues

---

**Last Updated:** December 7, 2025  
**Script Location:** `scripts/monitor-ci.ps1`  
**Documentation:** `docs/CI_MONITORING_ANALYSIS_2025-12-07.md`
