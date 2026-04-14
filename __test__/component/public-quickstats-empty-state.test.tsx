import { describe, expect, it, vi } from "vitest";
/**
 * @vitest-environment happy-dom
 */
import { render, screen } from "@testing-library/react";
import { QuickStatsCardsClient } from "@/app/(public)/_components/QuickStatsClient";

vi.mock("@/app/(public)/_components/AnimatedCounter", () => ({
  AnimatedCounter: ({ value }: { value: number }) => <span>{value}</span>,
}));

describe("QuickStatsCardsClient empty state", () => {
  it("shows data unavailable status when all public stats are unavailable", () => {
    render(
      <QuickStatsCardsClient
        stats={{
          totalTeachers: 0,
          totalClasses: 0,
          totalRooms: 0,
          totalSubjects: 0,
          totalPrograms: 0,
          periodsPerDay: 0,
          currentTerm: "N/A",
          lastUpdated: "N/A",
        }}
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      "ข้อมูลสาธารณะยังไม่พร้อมใช้งาน",
    );
  });

  it("does not show data unavailable status when term data is available", () => {
    render(
      <QuickStatsCardsClient
        stats={{
          totalTeachers: 10,
          totalClasses: 8,
          totalRooms: 5,
          totalSubjects: 12,
          totalPrograms: 3,
          periodsPerDay: 7,
          currentTerm: "ภาคเรียนที่ 1/2568",
          lastUpdated: "11 เม.ย. 2569",
        }}
      />,
    );

    expect(
      screen.queryByText("ข้อมูลสาธารณะยังไม่พร้อมใช้งาน"),
    ).not.toBeInTheDocument();
  });
});
