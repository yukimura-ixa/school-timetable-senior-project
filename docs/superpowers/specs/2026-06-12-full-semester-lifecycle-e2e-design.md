# Full Semester Lifecycle E2E — Cross-Role Scenarios

Date: 2026-06-12. Approved via brainstorming session.

## Goal

Cover the real user lifecycle across all three personas: admin authors and publishes a term; teacher verifies own schedule (logged in + public view); student verifies class schedule (public, no login). Today only the admin persona has journey coverage (`e2e/full-user-journey.spec.ts`).

## Constraints (verified against repo)

- Publish is impossible against the default 18-grade demo seed; only the publish-happy project (`playwright.config.publish-happy.ts` + its globalSetup mini-seed) reaches a publishable config. Real PUBLISHED state exists only there.
- Only one auth user is seeded (`admin@school.local`). `e2e.teacher@school.ac.th` exists as a `teacher` domain row with a pinned fixture (`ค21201` / M1-1 / 1-2568) but has no login.
- Student persona = public `(public)/classes` routes; teacher public persona = `(public)/teachers`. No student accounts exist by design.

## Scenario A — published-term cross-role verification

File: `e2e/27-published-cross-role.spec.ts`, runs under the publish-happy config, serial, after (or extending) the existing publish flow.

1. (existing flow) Admin: readiness gate → publish → PUBLISHED badge.
2. Teacher logged in: sign in as `e2e.teacher@school.ac.th`, open dashboard teacher-table, assert own published schedule renders the pinned fixture.
3. Teacher public: `(public)/teachers/[id]` shows the same schedule without auth.
4. Student public: `(public)/classes/...` for M1-1 shows the published entry.
5. Negative: teacher session is blocked from `/management` (role gate).

Precondition check during implementation: publish-happy mini-seed must contain the `e2e.teacher` fixture and M1-1; extend that globalSetup if absent.

## Scenario B — draft-visibility journey

File: `e2e/28-draft-role-visibility.spec.ts`, main suite, default seed. Lean: does NOT re-test wizard/CRUD/arrange (covered by `full-user-journey.spec.ts`). Tests the role boundary around unpublished data:

1. Admin: seeded 2568 term is in a non-published state.
2. Public routes: that term's schedule is absent from `(public)/teachers` and `(public)/classes` — students never see drafts.
3. Teacher login: dashboard accessible; draft visibility asserted to match actual product behavior (verify code first, then assert reality).
4. Teacher blocked from `/management` and arrange routes.

## Infrastructure changes

- `prisma/seed.ts`: seed a better-auth teacher user — email `e2e.teacher@school.ac.th`, password `TEACHER_PASSWORD ?? "teacher123"`, role `teacher`, linked to the existing teacher row. Mirrors the existing admin auth seeding; runs in both demo and clean seed paths.
- Teacher login helper for specs (fresh browser context; no global storage state needed).
- `.env.test`: add `TEACHER_PASSWORD`.

## Out of scope

- Mid-semester change flows (teacher swap, room change) — separate scenario set.
- Export verification (covered by `e2e/06-export`).
- Performance assertions.

## Risks

- Publish-happy mini-seed gaps → extend its globalSetup (known, planned).
- `(public)` route filtering of unpublished terms is assumed but unverified → read the route/repository code before writing Scenario B assertions; if drafts are in fact publicly visible, that is a product bug to file, not an assertion to encode.
