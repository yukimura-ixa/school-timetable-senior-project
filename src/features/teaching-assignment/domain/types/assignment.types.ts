/**
 * Domain Types for Teaching Assignment Feature
 *
 * These types are derived from Prisma queries with specific include/select shapes
 */

import { Prisma } from "@/prisma/generated/client";

/**
 * Assignment with related teacher, subject, and grade level data
 * Matches the return type of findAssignmentsByContext()
 */
export type AssignmentWithRelations = Prisma.teachers_responsibilityGetPayload<{
  include: {
    teacher: {
      select: {
        TeacherID: true;
        Prefix: true;
        Firstname: true;
        Lastname: true;
        Department: true;
      };
    };
    subject: {
      select: {
        SubjectCode: true;
        SubjectName: true;
        Credit: true;
        Category: true;
      };
    };
    gradelevel: {
      select: {
        GradeID: true;
        Year: true;
        Number: true;
      };
    };
  };
}>;

/**
 * Program subject with related subject data
 * Matches the return type of findSubjectsByGrade()
 */
export type ProgramSubjectWithSubject = Prisma.program_subjectGetPayload<{
  include: {
    subject: {
      select: {
        SubjectCode: true;
        SubjectName: true;
        Credit: true;
        Category: true;
      };
    };
  };
}>;

/**
 * Basic assignment fields for copying/transforming
 */
export type AssignmentCore = {
  SubjectCode: string;
  GradeID: string;
  Semester: "SEMESTER_1" | "SEMESTER_2";
  AcademicYear: number;
  TeacherID: number;
  TeachHour: number;
};

/**
 * Teacher with assignment statistics
 * Used in teacher list views with assignment counts
 */
export type TeacherWithAssignmentStats = {
  TeacherID: number;
  Prefix: string;
  Firstname: string;
  Lastname: string;
  Department: string;
  assignmentCount: number;
  totalHours: number;
};
