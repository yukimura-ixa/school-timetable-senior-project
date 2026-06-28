import { describe, it, expect } from "vitest";
import { buildActionItems, type ActionItemInputs } from "./action-items.service";

const baseInputs = (overrides: Partial<ActionItemInputs> = {}): ActionItemInputs => ({
  year: 2568,
  semester: 1,
  conflicts: { teacherConflicts: 0, classConflicts: 0, roomConflicts: 0 },
  completion: { full: 10, partial: 0, none: 0 },
  teachers: { withSchedules: 20, withoutSchedules: 0 },
  readiness: { status: "ready", issues: [], details: { incompleteGrades: [], moeValidationResults: [] } },
  ...overrides,
});

describe("buildActionItems", () => {
  it("returns no items when everything is healthy", () => {
    expect(buildActionItems(baseInputs())).toEqual([]);
  });

  it("emits a publish blocker (error, first) when readiness is not ready", () => {
    const items = buildActionItems(
      baseInputs({
        readiness: {
          status: "incomplete",
          issues: ["ขาดข้อมูลครูประจำชั้น 2 ห้อง"],
          details: { incompleteGrades: [], moeValidationResults: [] },
        },
      }),
    );
    expect(items[0]).toMatchObject({
      id: "publish",
      severity: "error",
      detail: "ขาดข้อมูลครูประจำชั้น 2 ห้อง",
      href: "/schedule/2568/1/publish",
    });
  });

  it("ignores readiness when status is ready or unknown", () => {
    expect(buildActionItems(baseInputs({ readiness: { status: "unknown", issues: [], details: { incompleteGrades: [], moeValidationResults: [] } } }))).toEqual([]);
  });

  it("emits a conflicts row (error) summing all conflict types", () => {
    const items = buildActionItems(baseInputs({ conflicts: { teacherConflicts: 2, classConflicts: 1, roomConflicts: 0 } }));
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ id: "conflicts", severity: "error", title: "พบข้อขัดแย้ง 3 รายการ", href: "/dashboard/2568/1/conflicts" });
  });

  it("emits an incomplete-classes row (warning) summing none + partial", () => {
    const items = buildActionItems(baseInputs({ completion: { full: 4, partial: 3, none: 2 } }));
    expect(items[0]).toMatchObject({ id: "classes", severity: "warning", title: "5 ชั้นเรียนตารางยังไม่ครบ", href: "/dashboard/2568/1/student-table" });
  });

  it("emits a teachers-without-schedule row (info)", () => {
    const items = buildActionItems(baseInputs({ teachers: { withSchedules: 18, withoutSchedules: 2 } }));
    expect(items[0]).toMatchObject({ id: "teachers", severity: "info", title: "ครู 2 คนยังไม่มีตารางสอน", href: "/dashboard/2568/1/teacher-table" });
  });

  it("orders items error → warning → info", () => {
    const items = buildActionItems(
      baseInputs({
        readiness: { status: "moe-failed", issues: ["x"], details: { incompleteGrades: [], moeValidationResults: [] } },
        conflicts: { teacherConflicts: 1, classConflicts: 0, roomConflicts: 0 },
        completion: { full: 1, partial: 1, none: 0 },
        teachers: { withSchedules: 1, withoutSchedules: 1 },
      }),
    );
    expect(items.map((i) => i.id)).toEqual(["publish", "conflicts", "classes", "teachers"]);
    expect(items.map((i) => i.severity)).toEqual(["error", "error", "warning", "info"]);
  });
});
