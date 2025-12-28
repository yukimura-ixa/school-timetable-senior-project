# Track Specification: Comprehensive Bug Hunting and Exploratory Testing

## Goal
To rigorously assess the current stability and correctness of the School Timetable Management System by combining automated regression testing with structured exploratory testing. The primary objective is to identify, document, and triage bugs, specifically focusing on regressions from recent refactors and edge cases in business logic.

## Scope
### In-Scope
1.  **Automated Regression:** Execution and analysis of the existing Playwright E2E test suite and Vitest unit tests.
2.  **Core Workflow Verification:** Manual exploratory testing of:
    -   Subject Assignment (Assigning subjects to classes).
    -   Schedule Arrangement (Drag-and-drop interface, conflict detection).
    -   Constraint Management (Teacher/Room locks).
3.  **Compliance Testing:** Verification of Thai MOE validation rules (credit calculations, learning area constraints).
4.  **Output Verification:** Testing the fidelity and correctness of PDF and Excel exports.
5.  **Reporting:** Documentation of all findings, including reproduction steps and severity assessments.

### Out-of-Scope
-   Implementation of new features.
-   Fixing of non-trivial bugs (bugs will be logged, not necessarily fixed in this track).
-   Performance optimization (unless critical performance bugs are found).

## Success Criteria
-   [ ] A comprehensive test execution report from the CI/CD pipeline (or local equivalent).
-   [ ] A validated list of critical and high-priority bugs with reproduction steps.
-   [ ] Verification that major user flows (Assign -> Arrange -> Export) are functional.
-   [ ] Confirmation that MOE validation logic correctly flags invalid curriculum structures.

## References
-   `product.md` (Core Objectives)
-   `AGENTS.md` (MOE Compliance Rules)
