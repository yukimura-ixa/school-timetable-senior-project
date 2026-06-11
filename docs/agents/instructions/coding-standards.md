# Coding Standards

## Type Safety
- No `any`, no unsafe casts, no hidden side effects.
- Explicit domain types from Prisma schema + Valibot validation.
- Small pure functions beat clever abstractions.

## Validation And Return Shapes
- Valibot for input validation.
- Explicit result forms:
  - `{ success: true, data }`
  - `{ success: false, error }`

## State And Data
- Zustand for complex client UI state.
- SWR or equivalent for remote data caching.

## Refactor Discipline
- Changes minimal + behavior-preserving unless task require behavior change.
- Rename/restructure symbol → update refs.