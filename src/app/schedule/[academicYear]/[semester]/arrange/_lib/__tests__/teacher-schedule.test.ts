import { describe, it, expect } from "vitest";
import { teacherScheduleKey } from "../teacher-schedule";

describe("teacherScheduleKey", () => {
  it("returns null when teacher is missing or non-numeric", () => {
    expect(teacherScheduleKey(null, "2568", "1")).toBeNull();
    expect(teacherScheduleKey("abc", "2568", "1")).toBeNull();
  });

  it("builds the schedule URL for a numeric teacher id", () => {
    expect(teacherScheduleKey("12", "2568", "1")).toBe(
      "/api/schedule/teacher/12?year=2568&semester=1",
    );
  });
});
