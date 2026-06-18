import { describe, expect, it, vi } from "vitest";
/**
 * @vitest-environment happy-dom
 */
import { render, screen } from "@testing-library/react";
import { MiniCharts } from "@/app/(public)/_components/MiniCharts";

vi.mock("@/lib/public/stats", () => ({
  getPeriodLoadPerDay: vi.fn(),
  getRoomOccupancy: vi.fn(),
}));

vi.mock("@/app/(public)/_components/Charts", () => ({
  PeriodLoadChart: () => <div data-testid="period-chart" />,
  RoomOccupancyGrid: () => <div data-testid="room-grid" />,
}));

import { getPeriodLoadPerDay, getRoomOccupancy } from "@/lib/public/stats";

const mockedGetPeriodLoadPerDay = vi.mocked(getPeriodLoadPerDay);
const mockedGetRoomOccupancy = vi.mocked(getRoomOccupancy);

describe("MiniCharts empty state", () => {
  it("shows empty placeholders when chart datasets are unavailable", async () => {
    mockedGetPeriodLoadPerDay.mockResolvedValue([]);
    mockedGetRoomOccupancy.mockResolvedValue([]);

    render(await MiniCharts());

    expect(screen.getAllByRole("status")).toHaveLength(2);
    expect(screen.getByText("ยังไม่มีข้อมูลคาบเรียนสำหรับแสดงผล")).toBeInTheDocument();
    expect(screen.getByText("ยังไม่มีข้อมูลการใช้ห้องเรียนสำหรับแสดงผล")).toBeInTheDocument();
  });

  it("renders charts when datasets exist", async () => {
    mockedGetPeriodLoadPerDay.mockResolvedValue([
      { day: "จันทร์", periods: 20 },
      { day: "อังคาร", periods: 24 },
    ]);
    mockedGetRoomOccupancy.mockResolvedValue([
      { day: "จันทร์", period: 1, occupancyPercent: 40 },
    ]);

    render(await MiniCharts());

    expect(screen.queryByText("ยังไม่มีข้อมูลคาบเรียนสำหรับแสดงผล")).not.toBeInTheDocument();
    expect(screen.queryByText("ยังไม่มีข้อมูลการใช้ห้องเรียนสำหรับแสดงผล")).not.toBeInTheDocument();
    expect(screen.getByTestId("period-chart")).toBeInTheDocument();
    expect(screen.getByTestId("room-grid")).toBeInTheDocument();
  });
});
