import { describe, it, expect } from "vitest";
import { toUnplacedSubject } from "../responsibility-mapping";

/**
 * Regression for c6r / task 6ri: required periods come from the assigned
 * TeachHour (set during the assign step), NOT Math.ceil(credit). The
 * per-teacher solver path was fixed in 6ri; the whole-school route used the
 * stale credit-based count, so a 0.5-credit subject with TeachHour 5 was
 * treated as needing 1 period and the grid could never be filled.
 */
describe("toUnplacedSubject", () => {
  const base = {
    RespID: 7,
    SubjectCode: "ท31101",
    GradeID: "M4-1",
    subject: { SubjectName: "ภาษาไทย" },
    gradelevel: { Year: 4, Number: 1 },
  };

  it("uses TeachHour for periodsPerWeek, not the subject credit", () => {
    const result = toUnplacedSubject({ ...base, TeachHour: 5 }, 1);
    expect(result.periodsPerWeek).toBe(5);
    expect(result.periodsAlreadyPlaced).toBe(1);
    expect(result.respId).toBe(7);
    expect(result.subjectCode).toBe("ท31101");
    expect(result.gradeName).toBe("4/1");
  });

  it("falls back to placeholders when subject/gradelevel relations are missing", () => {
    const result = toUnplacedSubject(
      {
        RespID: 9,
        SubjectCode: "ค31101",
        GradeID: "M4-2",
        TeachHour: 3,
        subject: null,
        gradelevel: null,
      },
      0,
    );
    expect(result.periodsPerWeek).toBe(3);
    expect(result.subjectName).toBe("ไม่ระบุ");
    expect(result.gradeName).toBe("M4-2");
  });
});
