import { describe, it, expect } from "vitest";

import { resolveTemplate, type ApplyTemplateInput } from "./lock-template.service";
import type { LockTemplate } from "../models/lock-template.model";

const makeTemplate = (
  timeslotFilter: LockTemplate["config"]["timeslotFilter"],
): LockTemplate => ({
  id: "test-template",
  name: "ทดสอบ",
  nameEn: "Test",
  description: "test",
  icon: "🧪",
  category: "activity",
  config: {
    subjectCode: "ACT-TEST",
    subjectName: "กิจกรรมทดสอบ",
    roomId: null,
    roomName: "ห้องทดสอบ",
    gradeFilter: { type: "all" },
    timeslotFilter,
  },
});

const makeInput = (
  template: LockTemplate,
  timeslots: ApplyTemplateInput["availableTimeslots"],
): ApplyTemplateInput => ({
  template,
  academicYear: 2568,
  semester: "SEMESTER_1",
  configId: "1-2568",
  availableGrades: [{ GradeID: "M1-1", GradeName: "ม.1/1", Level: 1 }],
  availableTimeslots: timeslots,
  availableRooms: [{ RoomID: 1, Name: "ห้องทดสอบ" }],
  availableSubjects: [{ SubjectID: "ACT-TEST", Name_TH: "กิจกรรมทดสอบ" }],
  availableResponsibilities: [
    { RespID: 1, SubjectCode: "ACT-TEST", TeacherID: 1 },
  ],
});

describe("resolveTemplate timeslot matching", () => {
  it("matches by period index embedded in TimeslotID", () => {
    const template = makeTemplate({ days: ["FRI"], periods: [8, 9] });
    const input = makeInput(template, [
      { TimeslotID: "1-2568-FRI7", Day: "FRI", Breaktime: "NOT_BREAK" },
      { TimeslotID: "1-2568-FRI8", Day: "FRI", Breaktime: "NOT_BREAK" },
      { TimeslotID: "1-2568-FRI9", Day: "FRI", Breaktime: "NOT_BREAK" },
      { TimeslotID: "1-2568-MON8", Day: "MON", Breaktime: "NOT_BREAK" },
    ]);

    const { locks, errors } = resolveTemplate(input);

    expect(errors).toEqual([]);
    expect(locks.map((l) => l.TimeslotID).sort()).toEqual([
      "1-2568-FRI8",
      "1-2568-FRI9",
    ]);
  });

  it("allDay matches every non-break slot of the selected days", () => {
    const template = makeTemplate({ days: ["MON"], periods: [], allDay: true });
    const input = makeInput(template, [
      { TimeslotID: "1-2568-MON1", Day: "MON", Breaktime: "NOT_BREAK" },
      { TimeslotID: "1-2568-MON2", Day: "MON", Breaktime: "NOT_BREAK" },
      { TimeslotID: "1-2568-MON3", Day: "MON", Breaktime: "BREAK" },
      { TimeslotID: "1-2568-TUE1", Day: "TUE", Breaktime: "NOT_BREAK" },
    ]);

    const { locks, errors } = resolveTemplate(input);

    expect(errors).toEqual([]);
    expect(locks.map((l) => l.TimeslotID).sort()).toEqual([
      "1-2568-MON1",
      "1-2568-MON2",
    ]);
  });

  it("never locks break slots even when their period is listed", () => {
    const template = makeTemplate({ days: ["MON"], periods: [3, 4] });
    const input = makeInput(template, [
      { TimeslotID: "1-2568-MON3", Day: "MON", Breaktime: "BREAK" },
      { TimeslotID: "1-2568-MON4", Day: "MON", Breaktime: "NOT_BREAK" },
    ]);

    const { locks } = resolveTemplate(input);

    expect(locks.map((l) => l.TimeslotID)).toEqual(["1-2568-MON4"]);
  });

  it("errors when no timeslot matches the criteria", () => {
    const template = makeTemplate({ days: ["SAT"], periods: [1] });
    const input = makeInput(template, [
      { TimeslotID: "1-2568-MON1", Day: "MON", Breaktime: "NOT_BREAK" },
    ]);

    const { locks, errors } = resolveTemplate(input);

    expect(locks).toEqual([]);
    expect(errors).toContain("ไม่พบคาบเรียนที่ตรงกับเกณฑ์");
  });
});
