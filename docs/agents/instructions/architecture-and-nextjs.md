# Architecture And Next.js Patterns

## Feature Structure
Use feature-first organization under `src/features/<domain>/`:
- `application/actions`
- `application/queries`
- `domain/services`
- `domain/repositories`
- `infrastructure`
- `presentation`

## Next.js Defaults
- Prefer Server Components.
- Use `"use client"` only when interaction or browser APIs require it.
- Keep data fetching in Server Actions and route handlers when suitable.

## Role-Critical Flows
Protect behavior across Admin, Teacher, and Student views when changing:
- schedule arrangement
- teaching assignment
- export and reporting behavior
- permissions and auth gates
