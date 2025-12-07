# CI Monitoring & Analysis - Complete Setup Guide

**Date:** December 7, 2025  
**Status:** ✅ Complete and Operational  
**Tool Location:** `scripts/monitor-ci.ps1`

---

## What Was Created

### 1. **CI Monitoring Script** (`scripts/monitor-ci.ps1`)
A PowerShell script that:
- Lists recent GitHub Actions workflow runs
- Identifies failed runs automatically
- Downloads test artifacts from failed runs
- Analyzes and reports findings
- Generates comprehensive reports

**Features:**
- ✅ Uses GitHub CLI (no token needed if already authenticated)
- ✅ Handles in-progress, passed, and failed runs
- ✅ Batch download of artifacts
- ✅ Automatic report generation
- ✅ Colorized output for easy reading

### 2. **Documentation Files**

#### `docs/CI_MONITORING_QUICK_START.md`
One-page quick reference for using the monitoring tool

#### `docs/CI_MONITORING_ANALYSIS_2025-12-07.md`
Comprehensive analysis guide with:
- Current CI status
- Failed run analysis
- Recovery procedures
- Common issues & solutions
- Performance metrics

---

## Current CI Status

### Summary (Last 5 Runs)
- **Total:** 5 runs analyzed
- **Passed:** 3 ✅
- **Failed:** 1 ❌
- **In Progress:** 1 ⏳

### Failed Run
- **Run #204** - CI (failure)
- Created: 2025-12-07 14:28:18
- Action: Needs investigation

### Recent Successes
- Run #147 - Smoke Tests ✅
- Run #265 - Push on main ✅
- Run #264 - Push on main ✅

---

## How to Use

### Quick Status Check (5 seconds)
```bash
# View last 5 runs
pwsh scripts/monitor-ci.ps1 -MaxRuns 5 -NoDownload
```

### Investigate Failed Runs (1 minute)
```bash
# Download artifacts from failed runs
pwsh scripts/monitor-ci.ps1

# This will:
# 1. List all recent runs
# 2. Download artifacts from failed runs
# 3. Generate analysis report
# 4. Show next steps
```

### Watch CI Progress
```bash
# Check every 30 seconds in a loop
while ($true) {
    Clear-Host
    pwsh scripts/monitor-ci.ps1 -MaxRuns 3 -NoDownload
    Write-Host "Updated: $(Get-Date)"
    Start-Sleep -Seconds 30
}
```

### Deep Analysis
```bash
# Download all artifacts (passed and failed)
pwsh scripts/monitor-ci.ps1 -DownloadAll -MaxRuns 10

# Review reports
ls ci-analysis/CI_ANALYSIS_REPORT_*.txt
cat ci-analysis/CI_ANALYSIS_REPORT_*.txt | head -50
```

---

## Command Reference

| Command | Purpose | Speed |
|---------|---------|-------|
| `pwsh scripts/monitor-ci.ps1 -NoDownload` | Check status only | 5s |
| `pwsh scripts/monitor-ci.ps1 -MaxRuns 1` | Latest run details | 10s |
| `pwsh scripts/monitor-ci.ps1` | Download failed artifacts | 30-60s |
| `pwsh scripts/monitor-ci.ps1 -DownloadAll` | Download all artifacts | 1-2m |
| `pwsh scripts/monitor-ci.ps1 -MaxRuns 20` | Analyze last 20 | 20s |

---

## Workflow Integration

### Before Starting Work
```bash
pwsh scripts/monitor-ci.ps1 -MaxRuns 1 -NoDownload
# Ensures CI was passing on your base branch
```

### After Pushing Changes
```bash
# Wait ~2 minutes for CI to run, then check
pwsh scripts/monitor-ci.ps1 -MaxRuns 1 -NoDownload

# If failed, download artifacts
pwsh scripts/monitor-ci.ps1
```

### Daily Standup
```bash
pwsh scripts/monitor-ci.ps1 -MaxRuns 5 -NoDownload
# Get overview of last 5 runs
```

### Before Release
```bash
pwsh scripts/monitor-ci.ps1 -MaxRuns 20 -NoDownload
# Ensure last 20 runs are all passing
```

---

## Output Files

### Location: `ci-analysis/`
```
ci-analysis/
├── CI_ANALYSIS_REPORT_*.txt      # Summary reports (multiple)
├── run-204/                      # Artifacts from run #204
├── run-385/                      # Artifacts from run #385
└── [other run directories]
```

### Report Format
Each report includes:
- Summary (total, passed, failed, in progress)
- Failed runs list
- Next steps
- Usage examples
- Timestamp

---

## Understanding the Output

### Status Indicators
```
✅ [SUCCESS]     - Run completed successfully
❌ [FAILURE]     - Run failed (will download artifacts)
⏳ [IN PROGRESS]  - Waiting for completion
⏭️  Skipping...   - Using --NoDownload flag
```

### Run Information
```
Run #204 - CI
Status: failure
Created: 2025-12-07 14:28:18
URL: https://github.com/.../actions/runs/20005656723
```

---

## Common Tasks

### Find a Specific Run
```bash
# Show last 20 runs
pwsh scripts/monitor-ci.ps1 -MaxRuns 20 -NoDownload | grep "Run #"

# Example output:
# ❌ [FAILURE] CI (Run #204)
# ⏳ [IN PROGRESS] E2E Tests (Run #386)
# ✅ [SUCCESS] Smoke Tests (Run #147)
```

### Get Detailed Failure Info
```bash
# Download artifacts
pwsh scripts/monitor-ci.ps1 -MaxRuns 1

# View reports
cat ci-analysis/CI_ANALYSIS_REPORT_*.txt | tail -50

# Search for error messages
grep -r "error\|failed\|ERROR\|FAIL" ci-analysis --include="*.txt"
```

### Monitor Live Progress
```bash
# Simple live watch (every 10 seconds)
while ($true) {
    Clear-Host
    Write-Host "CI Status at $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Cyan
    Write-Host ""
    pwsh scripts/monitor-ci.ps1 -MaxRuns 3 -NoDownload
    Start-Sleep -Seconds 10
}
```

### Export Report to File
```bash
# Save for later review
pwsh scripts/monitor-ci.ps1 -NoDownload | Tee-Object "ci-status-$(Get-Date -Format 'yyyyMMdd-HHmmss').txt"
```

---

## Troubleshooting

### Script Not Found
```bash
# Verify script exists
Test-Path scripts/monitor-ci.ps1  # Should return True

# Run from correct directory
cd b:\Dev\school-timetable-senior-project
pwsh scripts/monitor-ci.ps1
```

### "GitHub CLI not found"
```bash
# Check if gh is installed
gh --version

# If not, install from https://cli.github.com/

# On Windows via chocolatey:
choco install gh
```

### "Bad credentials" (Old error)
```bash
# Authenticate with GitHub CLI
gh auth login
# Follow prompts to complete authentication
```

### No Artifacts Downloaded
```bash
# Verify gh CLI access
gh repo view yukimura-ixa/school-timetable-senior-project

# If no artifacts, run might be in progress
# Check GitHub UI: https://github.com/yukimura-ixa/school-timetable-senior-project/actions
```

---

## Next Steps

### Immediate (Today)
- [x] Script created and tested ✅
- [x] Documentation written ✅
- [ ] Monitor current failed run #204
- [ ] Check if recent package cleanup affected CI
- [ ] Verify local tests pass

### This Week
- [ ] Fix CI failures
- [ ] Ensure all runs pass
- [ ] Document any edge cases
- [ ] Set up automated alerts (optional)

### Ongoing
- [ ] Run `monitor-ci.ps1` weekly to check health
- [ ] Keep artifacts for at least 1 week for debugging
- [ ] Review and optimize slow test runs
- [ ] Monitor for flaky tests

---

## Integration with Other Tools

### Git Integration
```bash
# After checking CI status
git log --oneline -5  # See recent commits

# Before pushing
pwsh scripts/monitor-ci.ps1 -MaxRuns 1 -NoDownload
git push  # Only if passing
```

### Local Testing
```bash
# Run same tests locally as CI does
pnpm run lint           # ESLint checks
pnpm run typecheck      # TypeScript
pnpm test               # Unit tests
pnpm test:e2e:manual    # E2E tests
pnpm test:smoke         # Smoke tests
```

### GitHub Actions UI
```bash
# For detailed logs, visit:
https://github.com/yukimura-ixa/school-timetable-senior-project/actions

# Script provides direct links in output
```

---

## Performance Notes

### Script Execution Times
- **Status check only:** ~5 seconds
- **Single run analysis:** ~10 seconds
- **Multiple runs (5):** ~20-30 seconds
- **Download artifacts (1-4 runs):** ~30-60 seconds
- **Full analysis (10 runs):** ~1-2 minutes

### Network Considerations
- GitHub CLI uses authenticated requests (fast)
- Artifact downloads depend on file sizes
- Reports are generated locally (instant)

---

## Security Notes

- ✅ No credentials stored in script
- ✅ Uses GitHub CLI authentication
- ✅ Read-only operations (no modifications)
- ✅ Artifacts stored locally only
- ✅ Safe to run in pipelines or scheduled tasks

---

## Example Output

```
🚀 CI Monitoring Tool - Starting...
Repository: yukimura-ixa/school-timetable-senior-project
Output Directory: ci-analysis
Download on failure: Enabled

✅ Using GitHub CLI: gh version 2.80.0 (2025-09-23)

📋 Fetching recent workflow runs...
✅ Found 10 recent workflow runs

❌ [FAILURE] CI (Run #204)
   Created: 2025-12-07 14:28:18
   ⚠️  This run FAILED

✅ [SUCCESS] Smoke Tests (Run #147)
   Created: 2025-12-07 14:28:18

✅ [SUCCESS] Push on main (Run #265)
   Created: 2025-12-07 14:28:17

📥 Downloading artifacts for 1 failed run(s)...

📦 Processing: CI (Run #204)
   ✅ Artifacts downloaded successfully
   📁 Location: ci-analysis/run-204

✅ Monitoring complete!
📄 Report saved to: ci-analysis\CI_ANALYSIS_REPORT_25681207-213249.txt
📁 Artifacts directory: B:\Dev\school-timetable-senior-project\ci-analysis

⚠️  ACTION REQUIRED: 1 failed run(s) detected!
```

---

## Documentation Map

- **Quick Start:** `docs/CI_MONITORING_QUICK_START.md`
- **Analysis Guide:** `docs/CI_MONITORING_ANALYSIS_2025-12-07.md`
- **This Guide:** This file (in setup documentation)
- **Script:** `scripts/monitor-ci.ps1`

---

## Support & Feedback

### If You Need Help
1. Check the Quick Start guide
2. Review the Analysis guide
3. Visit GitHub Actions UI directly
4. Check script's `-Help` parameter

### To Report Issues
```bash
# Provide this information:
pwsh scripts/monitor-ci.ps1 -MaxRuns 1 -NoDownload | Tee-Object "issue-report.txt"
# Attach issue-report.txt to bug report
```

---

**Created:** December 7, 2025  
**Status:** Production Ready  
**Maintenance:** Low - Script is self-contained  
**Last Updated:** December 7, 2025 21:32:49 UTC
