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
    expect(screen.getByTestId("force-publish-btn")).toBeDisabled();
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
    expect(screen.getByTestId("force-publish-btn")).toBeDisabled();
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
    expect(screen.getByTestId("force-publish-btn")).toBeEnabled();
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
