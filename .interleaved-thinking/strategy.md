# Strategy: Analyze CI/Test Errors

## Objective
Analyze the timeout errors in `schedule-assignment.spec.ts` to identify the root cause.

## Process

### Gate 1: Logs Located
- List the `test-results` directory to identify the specific artifact folders for the failed tests.
- Look for folders matching `tests-admin-schedule-assig-...`.

### Gate 2: Error Extracted
- Read `error-context.md` (if available) or checking the main log output again for specific stack traces.
- If screenshots are present (as png), I cannot "read" them visually but I can confirm their existence and timestamp to verify the test actually ran and produced artifacts.
- Focus on the `Call log` in the error message to see *exactly* what step timed out.

### Gate 3: Root Cause Hypothesized
- Compare the failed locator with the code state.
- Determine if the issue is:
    - **Selector Mismatch:** The element changed (e.g. MUI classes).
    - **Timing/Performance:** The element didn't render in time (30s).
    - **Logic Error:** The drag source/target logic is flawed.

## Execution Loops
1. **Locate**: `list_directory("test-results/artifacts")`
2. **Extract**: `read_file(...)` on relevant log/md files.
3. **Analyze**: Reason about the findings.
