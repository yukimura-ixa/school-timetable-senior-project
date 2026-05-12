import type { semester } from "@/prisma/generated/client";

type SourceAssignmentRow = {
  RespID: number;
  GradeID: string;
  SubjectCode: string;
  TeacherID: number;
  TeachHour: number;
  AcademicYear: number;
  Semester: semester;
};

type TargetAssignmentRow = {
  GradeID: string;
  SubjectCode: string;
  TeacherID: number;
  TeachHour: number;
  AcademicYear: number;
  Semester: semester;
};

export function mapAssignmentsForTarget(
  sourceRows: SourceAssignmentRow[],
  target: { academicYear: number; semester: semester },
): TargetAssignmentRow[] {
  return sourceRows.map((row) => ({
    GradeID: row.GradeID,
    SubjectCode: row.SubjectCode,
    TeacherID: row.TeacherID,
    TeachHour: row.TeachHour,
    AcademicYear: target.academicYear,
    Semester: target.semester,
  }));
}
