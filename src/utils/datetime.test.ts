import { describe, expect, it } from "vitest";
import {
  formatBangkokDateTime,
  formatBangkokTime,
  getBangkokGregorianYear,
  getBangkokThaiBuddhistYear,
} from "@/utils/datetime";

/**
 * @vitest-environment node
 */

describe("datetime utils", () => {
  it("formats Bangkok datetime deterministically from ISO", () => {
    expect(formatBangkokDateTime("2025-01-01T00:00:00.000Z")).toBe(
      "01/01/2025 07:00",
    );
  });

  it("formats Bangkok time deterministically from Date", () => {
    expect(formatBangkokTime(new Date("2025-01-01T12:34:00.000Z"))).toBe(
      "19:34",
    );
  });

  it("calculates Bangkok year independent of runtime timezone", () => {
    // 2024-12-31 18:00Z == 2025-01-01 01:00 Asia/Bangkok
    const iso = "2024-12-31T18:00:00.000Z";
    expect(getBangkokGregorianYear(iso)).toBe(2025);
    expect(getBangkokThaiBuddhistYear(iso)).toBe(2568);
  });
});
