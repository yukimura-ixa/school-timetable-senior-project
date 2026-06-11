# Architecture And Next.js Patterns

## Feature Structure
Feature-first under `src/features/<domain>/`:
- `application/actions`
- `application/queries`
- `domain/services`
- `domain/repositories`
- `infrastructure`
- `presentation`

## Next.js Defaults
- Prefer Server Components.
- `"use client"` only when interaction or browser API need it.
- Data fetching in Server Actions + route handlers when fit.

## Role-Critical Flows
Protect Admin, Teacher, Student views when change:
- schedule arrangement
- teaching assignment
- export + reporting behavior
- permissions + auth gates