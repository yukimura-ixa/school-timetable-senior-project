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
