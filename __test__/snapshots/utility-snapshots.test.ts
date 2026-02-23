/**
 * Snapshot Tests – Utility Functions
 *
 * Inline snapshots for pure utility output so any change to shapes,
 * labels, or formatting triggers a diff.
 */

import {
  parseTimeslotId,
  generateTimeslotId,
  extractConfigIdFromTimeslotId,
} from "@/utils/timeslot-id";

import {
  formatGradeDisplay,
  formatGradeIdDisplay,
  parseGradeId,
  generateGradeId,
} from "@/utils/grade-display";

import {
  arrayToCSV,
  formatSemester,
  formatStatusThai,
} from "@/utils/export.utils";

// ---------- TimeslotID ----------

describe("TimeslotID snapshots", () => {
  it("parseTimeslotId returns structured object", () => {
    expect(parseTimeslotId("1-2567-MON1")).toMatchInlineSnapshot(`
      {
        "academicYear": 2567,
        "day": "MON",
        "period": 1,
        "raw": "1-2567-MON1",
        "semester": 1,
      }
    `);
  });

  it("parseTimeslotId for semester 2", () => {
    expect(parseTimeslotId("2-2568-FRI8")).toMatchInlineSnapshot(`
      {
        "academicYear": 2568,
        "day": "FRI",
        "period": 8,
        "raw": "2-2568-FRI8",
        "semester": 2,
      }
    `);
  });

  it("parseTimeslotId returns null for invalid input", () => {
    expect(parseTimeslotId("invalid")).toMatchInlineSnapshot(`null`);
  });

  it("generateTimeslotId produces correct format", () => {
    expect(generateTimeslotId(1, 2567, "MON", 1)).toMatchInlineSnapshot(
      `"1-2567-MON1"`,
    );
  });

  it("extractConfigIdFromTimeslotId strips day+period", () => {
    expect(extractConfigIdFromTimeslotId("1-2567-MON1")).toMatchInlineSnapshot(
      `"1-2567"`,
    );
  });
});

// ---------- Grade Display ----------

describe("Grade Display snapshots", () => {
  it("formatGradeDisplay", () => {
    expect(formatGradeDisplay(1, 1)).toMatchInlineSnapshot(`"ม.1/1"`);
    expect(formatGradeDisplay(6, 15)).toMatchInlineSnapshot(`"ม.6/15"`);
  });

  it("formatGradeIdDisplay – canonical M{year}-{section}", () => {
    expect(formatGradeIdDisplay("M1-1")).toMatchInlineSnapshot(`"ม.1/1"`);
    expect(formatGradeIdDisplay("M2-5")).toMatchInlineSnapshot(`"ม.2/5"`);
  });

  it("formatGradeIdDisplay – Thai format passthrough", () => {
    expect(formatGradeIdDisplay("ม.3/2")).toMatchInlineSnapshot(`"ม.3/2"`);
  });

  it("formatGradeIdDisplay – legacy numeric format", () => {
    expect(formatGradeIdDisplay("101")).toMatchInlineSnapshot(`"ม.1/1"`);
  });

  it("formatGradeIdDisplay – empty string", () => {
    expect(formatGradeIdDisplay("")).toMatchInlineSnapshot(`""`);
  });

  it("parseGradeId returns structured object", () => {
    expect(parseGradeId("M1-1")).toMatchInlineSnapshot(`
      {
        "section": 1,
        "year": 1,
      }
    `);
    expect(parseGradeId("M6-15")).toMatchInlineSnapshot(`
      {
        "section": 15,
        "year": 6,
      }
    `);
  });

  it("generateGradeId", () => {
    expect(generateGradeId(1, 1)).toMatchInlineSnapshot(`"M1-1"`);
    expect(generateGradeId(6, 15)).toMatchInlineSnapshot(`"M6-15"`);
  });
});

// ---------- Export Utilities ----------

describe("Export utility snapshots", () => {
  it("arrayToCSV with headers", () => {
    const data = [
      { id: 1, name: "สมชาย", dept: "คณิต" },
      { id: 2, name: "สมหญิง", dept: "วิทย์" },
    ];
    const headers = {
      id: "รหัส",
      name: "ชื่อ",
      dept: "แผนก",
    } as Record<string, string>;

    expect(arrayToCSV(data, headers)).toMatchInlineSnapshot(`
      "รหัส,ชื่อ,แผนก
      1,สมชาย,คณิต
      2,สมหญิง,วิทย์"
    `);
  });

  it("arrayToCSV with values containing commas and quotes", () => {
    const data = [{ note: 'He said "hello"', list: "a,b,c" }];
    expect(arrayToCSV(data)).toMatchInlineSnapshot(`
      "note,list
      "He said ""hello""","a,b,c""
    `);
  });

  it("arrayToCSV returns empty for empty array", () => {
    expect(arrayToCSV([])).toMatchInlineSnapshot(`""`);
  });

  it("formatSemester", () => {
    expect(formatSemester(1, 2567)).toMatchInlineSnapshot(`"1/2567"`);
    expect(formatSemester("SEMESTER_2", 2568)).toMatchInlineSnapshot(
      `"2/2568"`,
    );
  });

  it("formatStatusThai", () => {
    expect(formatStatusThai("DRAFT")).toMatchInlineSnapshot(`"แบบร่าง"`);
    expect(formatStatusThai("PUBLISHED")).toMatchInlineSnapshot(`"เผยแพร่"`);
    expect(formatStatusThai("LOCKED")).toMatchInlineSnapshot(`"ล็อก"`);
    expect(formatStatusThai("ARCHIVED")).toMatchInlineSnapshot(`"เก็บถาวร"`);
  });
});
