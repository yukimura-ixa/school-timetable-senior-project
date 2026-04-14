# Coding Standards

## Type Safety
- Avoid `any`, unsafe casts, and hidden side effects.
- Prefer explicit domain types from Prisma schema and Valibot validation.
- Choose small pure functions over clever abstractions.

## Validation And Return Shapes
- Use Valibot for input validation.
- Prefer explicit result forms:
  - `{ success: true, data }`
  - `{ success: false, error }`

## State And Data
- Use Zustand for complex client UI state.
- Use SWR or equivalent for remote data caching patterns.

## Refactor Discipline
- Keep changes minimal and behavior-preserving unless the task explicitly requires behavior change.
- Update references when renaming or restructuring symbols.
