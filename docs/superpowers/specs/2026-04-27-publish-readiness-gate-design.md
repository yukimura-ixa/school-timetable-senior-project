# Publish Readiness Gate — Design Spec

**Date:** 2026-04-27  
**Issue:** #131 (sub-task 3)  
**Status:** Approved

---

## Overview

Surface the existing publish-readiness backend gate as a visible, always-present UX on the semester config page. Admins see a collapsible readiness checklist before attempting to publish, and can force-publish with a required reason when checks fail.

---

## Background & Gap

The server already blocks publish when `checkPublishReadiness` returns issues (incomplete grades or MOE violations), unless `force: true` is passed. However:

- `ConfigStatusBadge` confirm dialog shows zero readiness info
- Errors land in a dismissable snackbar with no detail
- No `force` override surface exists in the UI
- Admins discover problems only after clicking Confirm

---

## Architecture

```
Config Page (status === "DRAFT")
├── ConfigStatusBadge          ← unchanged
└── PublishReadinessCard       ← NEW
    ├── Collapsed: status chip (ready / N issues) + spinner during load
    └── Expanded: per-check rows + "เผยแพร่" button
        └── PublishConfirmDialog  ← NEW
            ├── Ready path: simple confirm
            └── Issues path: issue list + required reason field + "บังคับเผยแพร่"
```

`ConfigStatusBadge`, `checkPublishReadiness`, and `publish-readiness.service.ts` are unchanged.

---

## Components

### `PublishReadinessCard`

**Path:** `src/features/config/presentation/components/PublishReadinessCard.tsx`

- MUI `Accordion`, collapsed by default
- **Header:** readiness chip — `✅ พร้อมเผยแพร่` (green) or `⚠️ มีปัญหา N รายการ` (orange) — with spinner while loading
- **Expanded body:** vertical checklist:
  - `✅ / ❌` ชั้นเรียนครบทุกคาบ — if failed, sub-rows per grade ("ม.1/1: 23/30 คาบ")
  - `✅ / ❌` หลักสูตรผ่าน MoE — if failed, sub-rows per program
- **Footer:** `<Button variant="contained">เผยแพร่</Button>` — always enabled (override path handles issues)
- Fetches `getPublishReadinessAction({ configId })` on mount via `useTransition`
- Error state: "ไม่สามารถโหลดข้อมูลได้" + retry button

**Props:**
```typescript
type Props = {
  configId: string;
  onStatusChange?: () => void;
};
```

---

### `PublishConfirmDialog`

**Path:** `src/features/config/presentation/components/PublishConfirmDialog.tsx`

Receives `readinessResult` from card (no re-fetch).

**Ready path** (`status === "ready"`):
- Title: "ยืนยันการเผยแพร่"
- Body: "ตารางเรียนนี้พร้อมเผยแพร่แล้ว ครูและนักเรียนจะมองเห็น"
- Actions: Cancel / Confirm

**Issues path** (`status !== "ready"`):
- Title: "เผยแพร่โดยมีปัญหาที่ยังไม่แก้ไข"
- Body: MUI `Alert severity="warning"` listing all issues
- Required field: `TextField` label "เหตุผลในการเผยแพร่" (min 10 chars, shows helper text)
- Actions: Cancel / "บังคับเผยแพร่" (disabled until reason ≥ 10 chars)
- Calls `updateConfigStatusAction({ configId, status: "PUBLISHED", force: true, reason })`

Both paths call `onStatusChange()` + `router.refresh()` on success, `enqueueSnackbar` on error.

---

## API Changes

### New server action

Added to `src/features/config/application/actions/config-lifecycle.actions.ts`:

```typescript
export const getPublishReadinessAction = createAction(
  v.object({ configId: v.string() }),
  async ({ configId }) => getPublishReadiness(configId),
);
```

### Schema update

`UpdateConfigStatusSchema` in `src/features/config/application/schemas/config-lifecycle.schemas.ts`:

```typescript
// Add optional fields (server already reads them):
force: v.optional(v.boolean()),
reason: v.optional(v.string()),
```

---

## Config Page Integration

`src/app/schedule/[academicYear]/[semester]/config/page.tsx`:

- Render `<PublishReadinessCard configId={configId} onStatusChange={...} />` when `status === "DRAFT"`
- Positioned below the existing status section, above the main config form

---

## Error Handling

| Scenario | Behaviour |
|---|---|
| `getPublishReadinessAction` fails | Card shows error state + retry button |
| `updateConfigStatusAction` fails | `enqueueSnackbar` error (existing pattern) |
| Override reason < 10 chars | "บังคับเผยแพร่" button disabled (client-only) |
| Readiness loads while accordion closed | Chip in header still updates |

---

## Testing

### Unit (vitest)

- `PublishReadinessCard`: ready → green chip; incomplete → orange chip + grade sub-rows; loading → spinner; error → error state
- `PublishConfirmDialog`: ready path renders simple confirm; issues path disables button until reason ≥ 10 chars; calls action with `force: true` + reason

### E2E (Playwright)

- Happy path: all checks pass → confirm → status becomes PUBLISHED
- Blocked path: incomplete grades → override reason required → force publish succeeds
- Gated by `E2E_PUBLISH_GATE=true` env flag (same pattern as conflict E2E)

---

## Out of Scope

- Changing the 30% completeness threshold for `canTransitionStatus` (separate tuning decision)
- Readiness panel for LOCKED transition (locks have different semantics)
- Persisting override reason to DB (server receives it but does not store it in MVP)
