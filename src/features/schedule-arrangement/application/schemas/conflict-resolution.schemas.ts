/**
 * Valibot schema for the suggestResolutionAction server action.
 *
 * Admin-only action: validates the shape of the attempted arrangement so the
 * resolver receives well-formed input. Semester is restricted to SEMESTER_1 or
 * SEMESTER_2 per the project's domain contract.
 */

import * as v from "valibot";

export const suggestResolutionSchema = v.object({
  AcademicYear: v.pipe(
    v.number(),
    v.minValue(2500, "ปีการศึกษาต้องไม่ต่ำกว่า 2500"),
    v.maxValue(3000, "ปีการศึกษาต้องไม่เกิน 3000"),
  ),
  Semester: v.picklist(["SEMESTER_1", "SEMESTER_2"], "เทอมไม่ถูกต้อง"),
  attempt: v.object({
    timeslotId: v.pipe(v.string(), v.minLength(1)),
    subjectCode: v.pipe(v.string(), v.minLength(1)),
    gradeId: v.pipe(v.string(), v.minLength(1)),
    teacherId: v.optional(v.pipe(v.number(), v.minValue(1))),
    roomId: v.optional(
      v.union([v.pipe(v.number(), v.minValue(1)), v.null()]),
    ),
    academicYear: v.pipe(v.number(), v.minValue(2500), v.maxValue(3000)),
    semester: v.picklist(["SEMESTER_1", "SEMESTER_2"]),
    classId: v.optional(v.pipe(v.number(), v.minValue(1))),
  }),
});

export type SuggestResolutionInput = v.InferInput<
  typeof suggestResolutionSchema
>;
