# Product Guidelines: School Timetable Management System

## Development Philosophy
- **Clean Architecture:** Maintain a strict separation of concerns using the established feature-first structure (Domain, Application, Infrastructure, Presentation).
- **Server Actions First:** Utilize Next.js Server Actions as the primary mechanism for data mutations and fetching, ensuring a consistent and type-safe data flow.
- **Pure Business Logic:** Aim to keep core scheduling and validation logic in pure service functions, decoupled from external dependencies like the database or UI frameworks.

## Quality Standards
- **Testing Strategy:**
    - **E2E (Playwright):** Mandatory coverage for critical user journeys, including scheduling, conflict detection, and document exports.
    - **Unit (Vitest):** Focused testing on complex domain logic, specifically Thai MOE compliance and scheduling algorithms.
- **CI-First Workflow:** GitHub Actions is the ultimate source of truth for code quality. Local testing should be targeted, with the full suite validated in CI.
- **Validation:** Mandatory use of `Valibot` schemas for all data entry points (Server Actions and forms) to ensure data integrity.

## Technical Conventions
- **Standardized Identifiers:** Strictly enforce the canonical formats for `ConfigID` (`SEMESTER-YEAR`) and `TimeslotID` (`SEMESTER-YEAR-DAYPERIOD`) across the entire stack.
- **Standardized Responses:** All Server Actions must return data using the `ActionResult<T>` pattern for predictable and uniform error handling.
- **State Management:** Use Zustand for managing global client-side state, particularly for cross-component synchronization of the active semester.

## UI/UX Standards
- **Material Design:** Follow Material Design principles using MUI v7 components to ensure a professional and consistent interface.
- **Platform Optimization:**
    - **Desktop-First:** Design complex administrative and scheduling interfaces for high-density desktop displays.
    - **Mobile-Responsive:** Ensure public-facing schedule views are fully accessible and readable on mobile devices.
