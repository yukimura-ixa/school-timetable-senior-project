import { describe, it, expect } from "vitest";
import {
  buildTimetableConfigData,
  isConfigData,
} from "@/features/config/domain/types/config-data.types";

/**
 * c6r: the create-semester wizard stored Config as `{}` (the timeslot shape was
 * only fed to generateTimeslots, never persisted), so the config page reported
 * "unrecognized format" and the per-grade break guard had nothing to parse.
 * buildTimetableConfigData reshapes the wizard input into the canonical
 * `slots` Config and validates it, so an unparseable shape can never be stored.
 */
describe("buildTimetableConfigData", () => {
  it("builds a valid, parseable ConfigData from wizard timeslot input", () => {
    const result = buildTimetableConfigData({
      Days: ["MON", "TUE", "WED", "THU", "FRI"],
      StartTime: "08:30",
      slots: [{ duration: 50 }, { duration: 50 }, { duration: 50, breakGroups: ["junior"] }],
    });
    expect(result).not.toBeNull();
    expect(isConfigData(result)).toBe(true);
    expect(result?.slots).toHaveLength(3);
  });

  it("returns null for a non-HH:MM StartTime (schema requires 5 chars)", () => {
    expect(
      buildTimetableConfigData({ Days: ["MON"], StartTime: "8:30", slots: [{ duration: 50 }] }),
    ).toBeNull();
  });

  it("returns null when slots are missing or invalid", () => {
    expect(
      buildTimetableConfigData({ Days: ["MON"], StartTime: "08:30", slots: undefined }),
    ).toBeNull();
  });
});
