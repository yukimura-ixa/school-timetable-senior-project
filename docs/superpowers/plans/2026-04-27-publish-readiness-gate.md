# Publish Readiness Gate — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Surface the existing server-side publish-readiness gate as a visible, collapsible UX panel on the semester config page, with an admin force-override path.

**Architecture:** New `PublishReadinessCard` (accordion) + `PublishConfirmDialog` components placed on the config page. Card fetches readiness via a new `getPublishReadinessAction` server action. Dialog handles both the happy path (simple confirm) and the issues path (force + required reason). `ConfigStatusBadge` and all domain services remain unchanged.

**Tech Stack:** Next.js 16 App Router, MUI v6 (Accordion, Dialog, Alert, TextField, Chip), Valibot, Vitest + Testing Library (happy-dom), `notistack` for snackbars.

---

## File Map

| Action | Path | Responsibility |
|--------|------|---------------|
| Modify | `src/features/config/application/actions/config-lifecycle.actions.ts` | Add `getPublishReadinessAction` export |
| Create | `src/features/config/presentation/components/PublishConfirmDialog.tsx` | Confirm dialog — ready path + issues path with override reason |
| Create | `src/features/config/presentation/components/PublishReadinessCard.tsx` | Collapsible accordion with checklist + Publish button |
| Create | `src/features/config/presentation/components/__tests__/PublishConfirmDialog.test.tsx` | Unit tests for dialog |
| Create | `src/features/config/presentation/components/__tests__/PublishReadinessCard.test.tsx` | Unit tests for card |
| Modify | `src/app/schedule/[academicYear]/[semester]/config/page.tsx` | Add `status` to response type + mount `PublishReadinessCard` |
| Create | `e2e/specs/publish-readiness-gate.spec.ts` | E2E gated by `E2E_PUBLISH_GATE=true` |

---

## Task 1: Add `getPublishReadinessAction` server action

**Files:**
- Modify: `src/features/config/application/actions/config-lifecycle.actions.ts`

- [ ] **Step 1: Add the action**

Open `src/features/config/application/actions/config-lifecycle.actions.ts`. Add this import at the top (after the existing `getPublishReadiness` import):

```typescript
// already imported: import { getPublishReadiness } from "../services/publish-readiness-query.service";
```

Add this export at the bottom of the file:

```typescript
/**
 * Get publish readiness result for a config (client-callable)
 */
export const getPublishReadinessAction = createAction(
  v.object({ configId: v.string() }),
  async ({ configId }: { configId: string }) => {
    return getPublishReadiness(configId);
  },
);
```

- [ ] **Step 2: Verify typecheck passes**

```bash
pnpm typecheck
```

Expected: 0 new errors (pre-existing 14 `lock` test errors are unchanged).

- [ ] **Step 3: Commit**

```bash
git add src/features/config/application/actions/config-lifecycle.actions.ts
git commit -m "feat(publish-gate): add getPublishReadinessAction server action"
```

---

## Task 2: Create `PublishConfirmDialog` with tests

**Files:**
- Create: `src/features/config/presentation/components/__tests__/PublishConfirmDialog.test.tsx`
- Create: `src/features/config/presentation/components/PublishConfirmDialog.tsx`

- [ ] **Step 1: Write failing tests**

Create `src/features/config/presentation/components/__tests__/PublishConfirmDialog.test.tsx`:

```typescript
// @vitest-environment happy-dom
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { PublishConfirmDialog } from "../PublishConfirmDialog";
import type { PublishReadinessResult } from "@/features/config/domain/types/publish-readiness-types";

vi.mock("notistack", () => ({
  enqueueSnackbar: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock(
  "@/features/config/application/actions/config-lifecycle.actions",
  () => ({
    updateConfigStatusAction: vi.fn(() =>
      Promise.resolve({ success: true, data: {} }),
    ),
  }),
);

const readyResult: PublishReadinessResult = {
  status: "ready",
  issues: [],
  details: { incompleteGrades: [], moeValidationResults: [] },
};

const incompleteResult: PublishReadinessResult = {
  status: "incomplete",
  issues: ["ชั้น ม.1/1: ยังไม่ครบ (10/30 คาบ)", "ชั้น ม.2/1: ยังไม่ครบ (5/30 คาบ)"],
  details: { incompleteGrades: [], moeValidationResults: [] },
};

describe("PublishConfirmDialog", () => {
  it("renders simple confirm for ready status", () => {
    render(
      <PublishConfirmDialog
        open
        configId="1-2567"
        readinessResult={readyResult}
        onClose={vi.fn()}
        onStatusChange={vi.fn()}
      />,
    );
    expect(screen.getByText("ยืนยันการเผยแพร่")).toBeDefined();
    expect(screen.queryByText("บังคับเผยแพร่")).toBeNull();
    expect(screen.getByTestId("confirm-publish-btn")).toBeDefined();
  });

  it("renders issue list and override field for incomplete status", () => {
    render(
      <PublishConfirmDialog
        open
        configId="1-2567"
        readinessResult={incompleteResult}
        onClose={vi.fn()}
        onStatusChange={vi.fn()}
      />,
    );
    expect(screen.getByText("เผยแพร่โดยมีปัญหาที่ยังไม่แก้ไข")).toBeDefined();
    expect(screen.getByText(/ม.1\/1/)).toBeDefined();
    expect(screen.getByTestId("override-reason-input")).toBeDefined();
    expect(screen.getByTestId("force-publish-btn")).toBeDefined();
  });

  it("disables force-publish button when reason is empty", () => {
    render(
      <PublishConfirmDialog
        open
        configId="1-2567"
        readinessResult={incompleteResult}
        onClose={vi.fn()}
        onStatusChange={vi.fn()}
      />,
    );
    const btn = screen.getByTestId("force-publish-btn") as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it("disables force-publish button when reason is under 10 chars", () => {
    render(
      <PublishConfirmDialog
        open
        configId="1-2567"
        readinessResult={incompleteResult}
        onClose={vi.fn()}
        onStatusChange={vi.fn()}
      />,
    );
    const input = screen.getByTestId("override-reason-input").querySelector("input")!;
    fireEvent.change(input, { target: { value: "short" } });
    const btn = screen.getByTestId("force-publish-btn") as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it("enables force-publish button when reason >= 10 chars", () => {
    render(
      <PublishConfirmDialog
        open
        configId="1-2567"
        readinessResult={incompleteResult}
        onClose={vi.fn()}
        onStatusChange={vi.fn()}
      />,
    );
    const input = screen.getByTestId("override-reason-input").querySelector("input")!;
    fireEvent.change(input, { target: { value: "เหตุผลที่ยาวพอ123" } });
    const btn = screen.getByTestId("force-publish-btn") as HTMLButtonElement;
    expect(btn.disabled).toBe(false);
  });

  it("calls updateConfigStatusAction with force:true on force publish", async () => {
    const { updateConfigStatusAction } = await import(
      "@/features/config/application/actions/config-lifecycle.actions"
    );
    const onStatusChange = vi.fn();
    render(
      <PublishConfirmDialog
        open
        configId="1-2567"
        readinessResult={incompleteResult}
        onClose={vi.fn()}
        onStatusChange={onStatusChange}
      />,
    );
    const input = screen.getByTestId("override-reason-input").querySelector("input")!;
    fireEvent.change(input, { target: { value: "เหตุผลที่ยาวพอ123" } });
    fireEvent.click(screen.getByTestId("force-publish-btn"));
    await vi.waitFor(() => {
      expect(updateConfigStatusAction).toHaveBeenCalledWith({
        configId: "1-2567",
        status: "PUBLISHED",
        force: true,
        reason: "เหตุผลที่ยาวพอ123",
      });
    });
  });
});
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
pnpm test src/features/config/presentation/components/__tests__/PublishConfirmDialog.test.tsx
```

Expected: FAIL — `Cannot find module '../PublishConfirmDialog'`

- [ ] **Step 3: Create the component**

Create `src/features/config/presentation/components/PublishConfirmDialog.tsx`:

```typescript
"use client";

import React, { useState, useTransition } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  TextField,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { useRouter } from "next/navigation";
import { updateConfigStatusAction } from "@/features/config/application/actions/config-lifecycle.actions";
import type { PublishReadinessResult } from "@/features/config/domain/types/publish-readiness-types";

type Props = {
  open: boolean;
  configId: string;
  readinessResult: PublishReadinessResult;
  onClose: () => void;
  onStatusChange?: () => void;
};

export function PublishConfirmDialog({
  open,
  configId,
  readinessResult,
  onClose,
  onStatusChange,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [overrideReason, setOverrideReason] = useState("");

  const isReady = readinessResult.status === "ready";
  const isOverrideValid = overrideReason.trim().length >= 10;

  const handleClose = () => {
    setOverrideReason("");
    onClose();
  };

  const handlePublish = (force = false) => {
    startTransition(async () => {
      const result = await updateConfigStatusAction({
        configId,
        status: "PUBLISHED",
        ...(force ? { force: true, reason: overrideReason.trim() } : {}),
      });

      if (result.success) {
        enqueueSnackbar("เผยแพร่ตารางสำเร็จ", { variant: "success" });
        onStatusChange?.();
        router.refresh();
        handleClose();
      } else {
        enqueueSnackbar(result.error?.message ?? "เกิดข้อผิดพลาด", {
          variant: "error",
        });
      }
    });
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isReady ? "ยืนยันการเผยแพร่" : "เผยแพร่โดยมีปัญหาที่ยังไม่แก้ไข"}
      </DialogTitle>

      <DialogContent>
        {isReady ? (
          <Typography>
            ตารางเรียนนี้พร้อมเผยแพร่แล้ว ครูและนักเรียนจะมองเห็น
          </Typography>
        ) : (
          <>
            <Alert severity="warning" sx={{ mb: 2 }}>
              พบปัญหาที่ยังไม่แก้ไข กรุณาตรวจสอบก่อนเผยแพร่
            </Alert>
            <List dense disablePadding sx={{ mb: 2 }}>
              {readinessResult.issues.map((issue, i) => (
                <ListItem key={i} disablePadding sx={{ py: 0.25 }}>
                  <ListItemText
                    primary={`• ${issue}`}
                    primaryTypographyProps={{ variant: "body2" }}
                  />
                </ListItem>
              ))}
            </List>
            <TextField
              inputProps={{ "data-testid": "override-reason-input" }}
              data-testid="override-reason-input"
              label="เหตุผลในการเผยแพร่"
              placeholder="ระบุเหตุผลที่ต้องการเผยแพร่ (อย่างน้อย 10 ตัวอักษร)"
              fullWidth
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              helperText={
                overrideReason.length > 0 && !isOverrideValid
                  ? `ต้องการอีก ${10 - overrideReason.trim().length} ตัวอักษร`
                  : " "
              }
              error={overrideReason.length > 0 && !isOverrideValid}
              multiline
              rows={2}
            />
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={isPending}>
          ยกเลิก
        </Button>
        {isReady ? (
          <Button
            data-testid="confirm-publish-btn"
            variant="contained"
            onClick={() => handlePublish(false)}
            disabled={isPending}
          >
            ยืนยัน
          </Button>
        ) : (
          <Button
            data-testid="force-publish-btn"
            variant="contained"
            color="warning"
            onClick={() => handlePublish(true)}
            disabled={!isOverrideValid || isPending}
          >
            บังคับเผยแพร่
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
pnpm test src/features/config/presentation/components/__tests__/PublishConfirmDialog.test.tsx
```

Expected: All 6 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/config/presentation/components/PublishConfirmDialog.tsx \
        src/features/config/presentation/components/__tests__/PublishConfirmDialog.test.tsx
git commit -m "feat(publish-gate): add PublishConfirmDialog with ready/override paths"
```

---

## Task 3: Create `PublishReadinessCard` with tests

**Files:**
- Create: `src/features/config/presentation/components/__tests__/PublishReadinessCard.test.tsx`
- Create: `src/features/config/presentation/components/PublishReadinessCard.tsx`

- [ ] **Step 1: Write failing tests**

Create `src/features/config/presentation/components/__tests__/PublishReadinessCard.test.tsx`:

```typescript
// @vitest-environment happy-dom
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { PublishReadinessCard } from "../PublishReadinessCard";

const mockGetAction = vi.fn();

vi.mock(
  "@/features/config/application/actions/config-lifecycle.actions",
  () => ({
    getPublishReadinessAction: (...args: unknown[]) => mockGetAction(...args),
    updateConfigStatusAction: vi.fn(() =>
      Promise.resolve({ success: true, data: {} }),
    ),
  }),
);

vi.mock("notistack", () => ({ enqueueSnackbar: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

const readyResult = {
  success: true,
  data: {
    status: "ready",
    issues: [],
    details: { incompleteGrades: [], moeValidationResults: [] },
  },
};

const incompleteResult = {
  success: true,
  data: {
    status: "incomplete",
    issues: ["ชั้น ม.1/1: ยังไม่ครบ (10/30 คาบ)"],
    details: { incompleteGrades: [], moeValidationResults: [] },
  },
};

const errorResult = { success: false, error: { message: "Server error" } };

describe("PublishReadinessCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows green chip when ready", async () => {
    mockGetAction.mockResolvedValue(readyResult);
    render(<PublishReadinessCard configId="1-2567" />);
    await waitFor(() => {
      expect(screen.getByTestId("readiness-chip")).toBeDefined();
      expect(screen.getByText("พร้อมเผยแพร่")).toBeDefined();
    });
  });

  it("shows orange chip with issue count when incomplete", async () => {
    mockGetAction.mockResolvedValue(incompleteResult);
    render(<PublishReadinessCard configId="1-2567" />);
    await waitFor(() => {
      expect(screen.getByText(/มีปัญหา 1 รายการ/)).toBeDefined();
    });
  });

  it("shows error state when action fails", async () => {
    mockGetAction.mockResolvedValue(errorResult);
    render(<PublishReadinessCard configId="1-2567" />);
    await waitFor(() => {
      expect(screen.getByTestId("readiness-error")).toBeDefined();
    });
  });

  it("retries fetch when retry button clicked", async () => {
    mockGetAction
      .mockResolvedValueOnce(errorResult)
      .mockResolvedValueOnce(readyResult);
    render(<PublishReadinessCard configId="1-2567" />);
    await waitFor(() => screen.getByTestId("readiness-error"));
    fireEvent.click(screen.getByTestId("retry-btn"));
    await waitFor(() => {
      expect(mockGetAction).toHaveBeenCalledTimes(2);
    });
  });

  it("expands to show checklist rows on accordion click", async () => {
    mockGetAction.mockResolvedValue(readyResult);
    render(<PublishReadinessCard configId="1-2567" />);
    await waitFor(() => screen.getByTestId("readiness-chip"));
    fireEvent.click(screen.getByTestId("readiness-accordion-summary"));
    expect(screen.getByTestId("checklist-grades")).toBeDefined();
    expect(screen.getByTestId("checklist-moe")).toBeDefined();
  });

  it("shows publish button in expanded body", async () => {
    mockGetAction.mockResolvedValue(readyResult);
    render(<PublishReadinessCard configId="1-2567" />);
    await waitFor(() => screen.getByTestId("readiness-chip"));
    fireEvent.click(screen.getByTestId("readiness-accordion-summary"));
    expect(screen.getByTestId("open-publish-dialog-btn")).toBeDefined();
  });
});
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
pnpm test src/features/config/presentation/components/__tests__/PublishReadinessCard.test.tsx
```

Expected: FAIL — `Cannot find module '../PublishReadinessCard'`

- [ ] **Step 3: Create the component**

Create `src/features/config/presentation/components/PublishReadinessCard.tsx`:

```typescript
"use client";

import React, { useState, useTransition, useCallback } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import RefreshIcon from "@mui/icons-material/Refresh";
import { getPublishReadinessAction } from "@/features/config/application/actions/config-lifecycle.actions";
import type { PublishReadinessResult } from "@/features/config/domain/types/publish-readiness-types";
import { PublishConfirmDialog } from "./PublishConfirmDialog";

type Props = {
  configId: string;
  onStatusChange?: () => void;
};

export function PublishReadinessCard({ configId, onStatusChange }: Props) {
  const [readiness, setReadiness] = useState<PublishReadinessResult | null>(null);
  const [fetchError, setFetchError] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const fetchReadiness = useCallback(() => {
    setFetchError(false);
    startTransition(async () => {
      const result = await getPublishReadinessAction({ configId });
      if (result.success && result.data) {
        setReadiness(result.data);
      } else {
        setFetchError(true);
      }
    });
  }, [configId]);

  // Fetch on first mount
  React.useEffect(() => {
    fetchReadiness();
  }, [fetchReadiness]);

  const issueCount = readiness?.issues.length ?? 0;
  const isReady = readiness?.status === "ready";

  const renderChip = () => {
    if (isPending) {
      return <CircularProgress size={16} />;
    }
    if (fetchError) {
      return (
        <Chip
          data-testid="readiness-chip"
          label="โหลดไม่สำเร็จ"
          color="default"
          size="small"
          icon={<ErrorIcon />}
        />
      );
    }
    if (!readiness) return <CircularProgress size={16} />;
    return (
      <Chip
        data-testid="readiness-chip"
        label={isReady ? "พร้อมเผยแพร่" : `มีปัญหา ${issueCount} รายการ`}
        color={isReady ? "success" : "warning"}
        size="small"
        icon={isReady ? <CheckCircleIcon /> : <ErrorIcon />}
      />
    );
  };

  return (
    <>
      <Accordion defaultExpanded={false} disableGutters>
        <AccordionSummary
          data-testid="readiness-accordion-summary"
          expandIcon={<ExpandMoreIcon />}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography variant="body2" fontWeight={500}>
              ความพร้อมในการเผยแพร่
            </Typography>
            {renderChip()}
          </Box>
        </AccordionSummary>

        <AccordionDetails>
          {fetchError ? (
            <Box
              data-testid="readiness-error"
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <Typography variant="body2" color="error">
                ไม่สามารถโหลดข้อมูลได้
              </Typography>
              <Button
                data-testid="retry-btn"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={fetchReadiness}
              >
                ลองใหม่
              </Button>
            </Box>
          ) : (
            <>
              <List dense disablePadding>
                <ListItem
                  data-testid="checklist-grades"
                  disablePadding
                  sx={{ py: 0.5 }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    {readiness?.details.incompleteGrades.length === 0 ? (
                      <CheckCircleIcon color="success" fontSize="small" />
                    ) : (
                      <ErrorIcon color="warning" fontSize="small" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary="ชั้นเรียนครบทุกคาบ"
                    primaryTypographyProps={{ variant: "body2" }}
                  />
                </ListItem>

                {readiness?.details.incompleteGrades.map((g) => (
                  <ListItem key={g.gradeName} disablePadding sx={{ pl: 4, py: 0.25 }}>
                    <ListItemText
                      primary={`${g.gradeName}: ${g.scheduledHours}/${g.requiredHours} คาบ`}
                      primaryTypographyProps={{ variant: "caption", color: "text.secondary" }}
                    />
                  </ListItem>
                ))}

                <ListItem
                  data-testid="checklist-moe"
                  disablePadding
                  sx={{ py: 0.5 }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    {readiness?.details.moeValidationResults.every((r) => r.isValid) ? (
                      <CheckCircleIcon color="success" fontSize="small" />
                    ) : (
                      <ErrorIcon color="warning" fontSize="small" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary="หลักสูตรผ่าน MoE"
                    primaryTypographyProps={{ variant: "body2" }}
                  />
                </ListItem>
              </List>

              <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                <Button
                  data-testid="open-publish-dialog-btn"
                  variant="contained"
                  size="small"
                  disabled={!readiness}
                  onClick={() => setDialogOpen(true)}
                >
                  เผยแพร่
                </Button>
              </Box>
            </>
          )}
        </AccordionDetails>
      </Accordion>

      {readiness && (
        <PublishConfirmDialog
          open={dialogOpen}
          configId={configId}
          readinessResult={readiness}
          onClose={() => setDialogOpen(false)}
          onStatusChange={() => {
            onStatusChange?.();
            fetchReadiness();
          }}
        />
      )}
    </>
  );
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
pnpm test src/features/config/presentation/components/__tests__/PublishReadinessCard.test.tsx
```

Expected: All 6 tests PASS.

- [ ] **Step 5: Run full test suite to check for regressions**

```bash
pnpm test
```

Expected: All pre-existing tests continue to pass. Total count should be ≥ 571 + 12 new.

- [ ] **Step 6: Commit**

```bash
git add src/features/config/presentation/components/PublishReadinessCard.tsx \
        src/features/config/presentation/components/__tests__/PublishReadinessCard.test.tsx
git commit -m "feat(publish-gate): add PublishReadinessCard accordion component"
```

---

## Task 4: Wire into config page + wire in ConfigStatusBadge

**Files:**
- Modify: `src/app/schedule/[academicYear]/[semester]/config/page.tsx`

The config page is a client component (`TimetableConfigValue`). The SWR fetch at `/api/schedule-config/${academicYear}/${semester}` returns a `table_config` record from `semesterRepository.findByYearAndSemester`, which includes `status` (it's a full Prisma record). The local `TableConfigResponse` type just needs `status` added.

- [ ] **Step 1: Add `status` to the response type and compute `configId`**

In `src/app/schedule/[academicYear]/[semester]/config/page.tsx`, update the `TableConfigResponse` type (around line 62):

```typescript
// Before:
type TableConfigResponse = {
  ConfigID: string;
  AcademicYear: number;
  Semester: string;
  Config: unknown;
} | null;

// After:
type TableConfigResponse = {
  ConfigID: string;
  AcademicYear: number;
  Semester: string;
  Config: unknown;
  status: "DRAFT" | "PUBLISHED" | "LOCKED" | "ARCHIVED";
} | null;
```

- [ ] **Step 2: Import the new components**

At the top of `src/app/schedule/[academicYear]/[semester]/config/page.tsx`, add imports:

```typescript
import { PublishReadinessCard } from "@/features/config/presentation/components/PublishReadinessCard";
import { ConfigStatusBadge } from "@/app/schedule/[academicYear]/[semester]/config/_components/ConfigStatusBadge";
```

- [ ] **Step 3: Render the panel in the JSX**

In `TimetableConfigValue`, add the panel at the top of the returned JSX — before the `<span className="flex flex-col gap-3 my-5 px-3">` that holds the timeslot config fields. Also compute `configId`:

Find the block around line 300 where the component returns JSX. Add the panel immediately after the loading/error guards and before the main `<span>`:

```typescript
// Compute configId — same formula used throughout the codebase
const configId = academicYear && semester ? `${semester}-${academicYear}` : null;
const configStatus = tableConfig.data?.status ?? "DRAFT";

// ... existing JSX ...
return (
  <>
    {isCopying ? <Loading /> : null}
    {tableConfig.error ? (
      <div className="mx-3 mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        โหลดข้อมูลตั้งค่าตารางไม่สำเร็จ แสดงค่าเริ่มต้นให้ก่อน
      </div>
    ) : null}
    {/* Status badge always shown; readiness card only for DRAFT */}
    {configId && (
      <Box sx={{ mx: 1.5, mb: 2 }}>
        <ConfigStatusBadge
          configId={configId}
          currentStatus={configStatus}
          completeness={0}
          onStatusChange={() => tableConfig.mutate()}
        />
        {configStatus === "DRAFT" && (
          <Box sx={{ mt: 1.5 }}>
            <PublishReadinessCard
              configId={configId}
              onStatusChange={() => tableConfig.mutate()}
            />
          </Box>
        )}
      </Box>
    )}
    {/* ... rest of existing JSX unchanged ... */}
```

Also add `Box` to the MUI imports at the top of the file (if not already present):

```typescript
import { Box } from "@mui/material";
```

- [ ] **Step 4: Typecheck**

```bash
pnpm typecheck
```

Expected: 0 new errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/schedule/[academicYear]/[semester]/config/page.tsx
git commit -m "feat(publish-gate): wire PublishReadinessCard and ConfigStatusBadge into config page"
```

---

## Task 5: E2E tests (gated)

**Files:**
- Create: `e2e/specs/publish-readiness-gate.spec.ts`

- [ ] **Step 1: Check how existing gated E2E specs are structured**

```bash
grep -n "E2E_CONFLICT_EXTENDED\|test.skip\|process.env" e2e/specs/conflict-resolution.spec.ts | head -10
```

Note the gate pattern — use the same approach.

- [ ] **Step 2: Create E2E spec**

Create `e2e/specs/publish-readiness-gate.spec.ts`:

```typescript
import { test, expect } from "@playwright/test";

const GATE = process.env.E2E_PUBLISH_GATE === "true";

test.describe("Publish Readiness Gate", () => {
  test.beforeEach(async ({ page }) => {
    if (!GATE) test.skip();
    // Navigate to a DRAFT semester config page
    // Assumes E2E seed creates a DRAFT semester at year=2567, semester=1
    await page.goto("/schedule/2567/1/config");
    await page.waitForLoadState("networkidle");
  });

  test("shows readiness accordion on config page", async ({ page }) => {
    await expect(page.getByTestId("readiness-accordion-summary")).toBeVisible();
  });

  test("expands accordion and shows checklist", async ({ page }) => {
    await page.getByTestId("readiness-accordion-summary").click();
    await expect(page.getByTestId("checklist-grades")).toBeVisible();
    await expect(page.getByTestId("checklist-moe")).toBeVisible();
  });

  test("happy path: ready config publishes successfully", async ({ page }) => {
    // This test requires a seed where all grades are complete and MOE passes
    // Skip if not set up
    if (process.env.E2E_PUBLISH_GATE_READY !== "true") test.skip();
    await page.getByTestId("readiness-accordion-summary").click();
    await page.getByTestId("open-publish-dialog-btn").click();
    await expect(page.getByText("ยืนยันการเผยแพร่")).toBeVisible();
    await page.getByTestId("confirm-publish-btn").click();
    await expect(page.getByText("เผยแพร่ตารางสำเร็จ")).toBeVisible();
  });

  test("blocked path: incomplete config shows override reason field", async ({ page }) => {
    // This test requires a seed where grades are incomplete
    if (process.env.E2E_PUBLISH_GATE_INCOMPLETE !== "true") test.skip();
    await page.getByTestId("readiness-accordion-summary").click();
    await page.getByTestId("open-publish-dialog-btn").click();
    await expect(page.getByText("เผยแพร่โดยมีปัญหาที่ยังไม่แก้ไข")).toBeVisible();
    const btn = page.getByTestId("force-publish-btn");
    await expect(btn).toBeDisabled();
    await page.getByTestId("override-reason-input").locator("input").fill("เหตุผลที่ยาวพอ123");
    await expect(btn).toBeEnabled();
    await btn.click();
    await expect(page.getByText("เผยแพร่ตารางสำเร็จ")).toBeVisible();
  });
});
```

- [ ] **Step 3: Commit**

```bash
git add e2e/specs/publish-readiness-gate.spec.ts
git commit -m "test(publish-gate): add E2E spec gated by E2E_PUBLISH_GATE=true"
```

---

## Task 6: Final quality check

- [ ] **Step 1: Run full test suite**

```bash
pnpm test
```

Expected: All tests pass. Count ≥ 583 (571 pre-existing + 12 new unit tests).

- [ ] **Step 2: Typecheck**

```bash
pnpm typecheck
```

Expected: 0 new errors.

- [ ] **Step 3: Lint**

```bash
pnpm lint
```

Expected: 0 errors.

- [ ] **Step 4: Push**

```bash
git pull --rebase origin main
git push
```
