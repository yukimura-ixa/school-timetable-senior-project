# Track Plan: Comprehensive Bug Hunting and Exploratory Testing

## Phase 1: Baseline Establishment & Automated Regression ✅ COMPLETED 2025-01-07
- [x] Task: Execute Full E2E Test Suite
    - [x] Subtask: Run `pnpm test:e2e` (or equivalent) to execute all Playwright tests.
    - [x] Subtask: Analyze the test report and identify any immediate regressions.
    - [x] Subtask: Save the test report as a baseline artifact.
    
    **Results (2025-01-07):**
    - 339 passed, 66 failed, 170 skipped, 1 flaky
    - Total duration: 30.6 minutes
    - Auth setup: FIXED (session persistence now working)
    - Saved to: `e2e-full-run.txt`
    
    **Failure Categories:**
    - Visual/Screenshot tests (~12 failures) - screenshot baseline drift
    - Profile page tests (~5 failures) - profile page functionality issues
    - Public schedule pages (~20 failures) - route/rendering issues
    - Performance tests (~7 failures) - timing thresholds (env-specific)
    - Other specific tests (~22 failures) - individual test issues
    
- [x] Task: Execute Unit Test Suite
    - [x] Subtask: Run `pnpm test:unit` to verify domain logic and validation rules.
    - [x] Subtask: Identify any failures in MOE compliance logic.
    
    **Results:** 361 passed, 1 skipped, 26.05s duration - ALL GREEN ✅
    
- [x] Task: Conductor - User Manual Verification 'Baseline Establishment & Automated Regression' (Protocol in workflow.md)

## Phase 2: Exploratory Testing - Core Workflows
- [ ] Task: Test "Subject Assignment" Flow
    - [ ] Subtask: Attempt to assign subjects to various classes (Grade 7-12).
    - [ ] Subtask: Verify that assigned subjects appear correctly in the arrangement view.
    - [ ] Subtask: Test edge cases: assigning more subjects than available periods.
- [ ] Task: Test "Schedule Arrangement" & Conflict Detection
    - [ ] Subtask: Use the drag-and-drop interface to move class slots.
    - [ ] Subtask: Intentionally create conflicts (double-book teacher, double-book room) and verify visual alerts/blocking.
    - [ ] Subtask: Test the "Lock" functionality for specific slots.
- [ ] Task: Conductor - User Manual Verification 'Exploratory Testing - Core Workflows' (Protocol in workflow.md)

## Phase 3: Compliance & Output Verification
- [ ] Task: Verify Thai MOE Validation Logic
    - [ ] Subtask: Create a test scenario with invalid credits/hours for a specific learning area.
    - [ ] Subtask: Verify that the system flags this as a violation preventing publication (if applicable) or showing a warning.
    - [ ] Subtask: Verify correct Subject Code parsing for new entries.
- [ ] Task: Test Export Functionality
    - [ ] Subtask: Generate PDF schedules for a specific class and a specific teacher.
    - [ ] Subtask: Generate the full Excel export.
    - [ ] Subtask: Inspect generated files for layout issues, missing data, or font rendering problems (Thai language support).
- [ ] Task: Conductor - User Manual Verification 'Compliance & Output Verification' (Protocol in workflow.md)

## Phase 4: Triage & Reporting
- [ ] Task: Compile Bug Report
    - [ ] Subtask: Aggregate all findings from automated and manual tests.
    - [ ] Subtask: Categorize bugs by severity (Critical, High, Medium, Low).
- [ ] Task: Create GitHub Issues
    - [ ] Subtask: For every confirmed bug, create a detailed GitHub issue with reproduction steps.
    - [ ] Subtask: Link issues to this track for future reference.
- [ ] Task: Conductor - User Manual Verification 'Triage & Reporting' (Protocol in workflow.md)
