# Assign + Arrange Redesign — Design

**Date:** 2026-05-30
**Status:** Approved (design phase)
**Scope:** Visual + structural redesign of the schedule `assign` and `arrange` features, plus theme-consistency bug fixes. Desktop-only. No new backend scheduling logic.

## Context

Both features are functional with sound Next.js 16 architecture (assign = RSC prefetch + Suspense; arrange = parallel routes `@grid`/`@palette`/`@inspector`/`@header`/`@modal` + dnd-kit). The project ships a strong design system in `src/app/theme.ts` (Sarabun + Inter, gradient pill buttons, glassmorphic Paper/Dialog, slate scale, blue-500 primary), but these two features barely consume it — they render flat default MUI, and the assign skeleton actively contradicts the theme with a hardcoded purple gradient.

Three concrete bugs were found during review (see §1). The user chose: theme adoption + bug fixes for both features, and a structural redesign of arrange.

## Decisions (from brainstorming)

- **Arrange layout:** sticky palette rail (option B), not the current stacked layout.
- **Device target:** desktop-only. No responsive rail→drawer collapse.
- **Inspector contents:** progress + remaining-per-subject + conflicts. Conflicts are **reuse-only** (surface existing auto-arrange failures; no real-time manual-drop conflict engine).
- **Grid treatment:** themed cells, clock times in headers, full Thai day names, icon + color for cell state.

## 1. Theme bug fixes

**Files:** `src/app/theme.ts`, `src/types/mui.d.ts`

`mui.d.ts:26` declares `lighter?: string` as optional on every `PaletteColor`, so `success.lighter` and `error.lighter` typecheck — but `theme.ts` only sets `lighter` on `primary`. At runtime they resolve to `undefined`.

Consequences:
- `@grid/page.tsx:84` — placed-cell green fill (`success.lighter`) never renders; a scheduled period is distinguished only by border color.
- `@grid/page.tsx:109` — remove-button hover (`error.lighter`) has no background.

**Fix:** add `lighter` tokens to `success` (`#ECFDF5`) and `error` (`#FEF2F2`) in `theme.ts`. One line each. This unblocks the grid cell tint used in §2.

## 2. Arrange — structural redesign

### Layout (`arrange/layout.tsx`)
Replace the stacked `Stack` (grid full-width on top, palette + inspector 50/50 below) with a two-column flex:
- Left: sticky palette rail (~320px, `position: sticky`, top offset below the header slot).
- Right: grid (fills remaining width) with the inspector strip full-width directly beneath it.
- Remove the `Grid container 6/6` row. The empty-state branch (no responsibilities) is unchanged.

Source (palette) and target (grid) now sit side-by-side → short drags.

### Grid (`@grid/page.tsx`)
Keep the semantic `<table>` (correct for tabular timetable data, a11y-friendly).
- **Headers:** period number + clock time (`StartTime`–`EndTime`, already in the `Timeslot` data).
- **Day labels:** full Thai names (จันทร์, อังคาร, …) replacing single chars.
- **Cell states** — color **plus** a non-color cue (WCAG 1.4.1):
  - Placed: green tint (`success.lighter`) + `success.main` border + ✓ + subject name + grade/room chips.
  - Empty: dashed divider border + "คาบว่าง".
  - Drop-target (`isOver`): blue tint (`primary.lighter`) + "⤓ วางที่นี่".
  - Break: grey (`action`) + "พัก".
- Theme the chips and container (no raw inline default styling where a theme token exists).

### Inspector (`@inspector/page.tsx`)
Becomes a three-widget strip beneath the grid:
1. **ความคืบหน้า (progress):** placed periods vs required total + percentage bar. Required = sum of `TeachHour` across the selected teacher's responsibilities.
2. **วิชาที่ยังไม่ได้จัด (remaining):** per-subject periods still to place.
3. **ข้อขัดแย้ง (conflicts):** reuse-only — surfaces auto-arrange failures already returned by `autoArrangeAction`. No client-side manual-drop conflict evaluation.

Inspector shifts from a static server component to a client component fed by the same schedule data the grid loads.

### Palette (`PaletteClient.tsx`)
- Style as the sticky rail; add an unplaced-count indicator.
- Add a dnd-kit `DragOverlay` for a real drag preview (today: `isDragging` opacity 0.5 only).

### Shared data
Inspector and grid both need the teacher's schedule + timeslots. Lift the SWR fetch into a shared client hook so they don't double-fetch. This is the main architectural change beyond styling.

## 3. Assign — fixes + theme

**Files:** `assign/page.tsx`, `assign/component/QuickAssignmentPanel.tsx`, `assign/component/ShowTeacherData.tsx`

- Replace the purple-gradient skeleton (`assign/page.tsx:18`, hardcoded `#667eea`/`#764ba2`) with a neutral skeleton matching the real `ShowTeacherData` shape.
- Remove the dead edit path in `QuickAssignmentPanel`: `handleSaveEdit`, `editingId`, `editingHours`, and the unused `_onAssignmentUpdated` prop (feature disabled).
- De-duplicate emoji + MUI icon in Alerts (`QuickAssignmentPanel.tsx:518/533/546`) — keep the icon, drop inline ✅⚠✓• which render inconsistently across Thai system fonts.
- Adopt theme surfaces (glass `Paper`, themed `Card`); buttons already inherit the gradient globally.

## 4. Testing

- Unit tests: inspector progress math (placed vs required) and the grid cell state → presentation mapping.
- Gates: `pnpm build`, `pnpm typecheck`, `pnpm lint`.
- Manual UI verification via the `browser_eval` MCP tool (curl misses hydration/runtime JS per project rules).
- Note: visual e2e (`e2e/visual/critical-ui.spec.ts`) only screenshots `header--` tests on arrange sub-pages — it does not snapshot the grid body, so grid changes rely on build + unit tests + manual verify.

## Out of scope

- Real-time manual-drop conflict detection.
- Mobile/tablet responsive layout for arrange.
- Changes to auto-arrange solver logic.
- The `lock`, `config`, `generate`, `curriculum` schedule sub-pages.
