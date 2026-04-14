import { describe, expect, it, vi, beforeEach } from "vitest";
/**
 * @vitest-environment happy-dom
 */
import { fireEvent, render, screen } from "@testing-library/react";
import SelectSemesterPage from "@/app/dashboard/page";

const pushMock = vi.fn();
const deferredTracking = (() => {
  let resolve: (() => void) | undefined;
  const promise = new Promise<void>((res) => {
    resolve = res;
  });
  return { promise, resolve: () => resolve?.() };
})();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    useSession: () => ({
      data: { user: { role: "admin" } },
    }),
  },
}));

vi.mock("@/lib/authz", () => ({
  normalizeAppRole: (role: string) => role,
  isAdminRole: (role: string) => role === "admin",
}));

vi.mock("@/features/semester/application/actions/semester.actions", () => ({
  getRecentSemestersAction: vi.fn().mockResolvedValue({ success: true, data: [] }),
  getPinnedSemestersAction: vi.fn().mockResolvedValue({ success: true, data: [] }),
  getSemestersAction: vi.fn().mockResolvedValue({
    success: true,
    data: [
      {
        configId: "1-2568",
        academicYear: 2568,
        semester: 1,
        status: "DRAFT",
        configCompleteness: 80,
        isPinned: false,
      },
    ],
  }),
  trackSemesterAccessAction: vi.fn().mockImplementation(() => deferredTracking.promise),
}));

vi.mock("@/app/dashboard/_components/SemesterCard", () => ({
  SemesterCard: ({ semester, onSelect }: { semester: { configId: string }; onSelect: (s: unknown) => void }) => (
    <button onClick={() => onSelect(semester)}>select-semester</button>
  ),
}));

vi.mock("@/app/dashboard/_components/SemesterFilters", () => ({
  SemesterFilters: () => <div>filters</div>,
}));

vi.mock("@/app/dashboard/_components/CreateSemesterWizard", () => ({
  CreateSemesterWizard: () => null,
}));

vi.mock("@/app/dashboard/_components/CopySemesterModal", () => ({
  CopySemesterModal: () => null,
}));

vi.mock("@/app/dashboard/_components/SemesterExportButton", () => ({
  SemesterExportButton: () => null,
}));

vi.mock("@/app/dashboard/_components/SemesterAnalyticsDashboard", () => ({
  SemesterAnalyticsDashboard: () => <div>analytics</div>,
}));

vi.mock("@/app/dashboard/_components/SemesterSectionSkeleton", () => ({
  SemesterSectionSkeleton: () => <div>section-skeleton</div>,
}));

vi.mock("@/app/dashboard/_components/SemesterFiltersSkeleton", () => ({
  SemesterFiltersSkeleton: () => <div>filters-skeleton</div>,
}));

vi.mock("@/app/dashboard/_components/SemesterAnalyticsDashboardSkeleton", () => ({
  SemesterAnalyticsDashboardSkeleton: () => <div>analytics-skeleton</div>,
}));

vi.mock("@/components/elements/SkipLink", () => ({
  SkipLink: () => null,
}));

describe("SelectSemesterPage navigation performance", () => {
  beforeEach(() => {
    pushMock.mockClear();
  });

  it("navigates immediately without waiting for semester access tracking", async () => {
    render(<SelectSemesterPage />);

    const selectButton = await screen.findByRole("button", {
      name: "select-semester",
    });

    fireEvent.click(selectButton);

    expect(pushMock).toHaveBeenCalledWith("/dashboard/2568/1/student-table");
  });
});
