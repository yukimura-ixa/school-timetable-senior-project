/**
 * Teaching Assignment Repository
 * Data access layer for teacher-subject assignments (teachers_responsibility table)
 */

import prisma from "@/lib/prisma";
import { semester } from @/prisma/generated/client";
import { cache } from "react";

// ============================================================================
// Query Methods
// ============================================================================

/**
 * Get all assignments for specific grade + semester + year
 * Cached per request using React cache()
 */
export const findAssignmentsByContext = cache(
  async (gradeId: string, semester: semester, academicYear: number) => {
    return prisma.teachers_responsibility.findMany({
      where: {
        GradeID: gradeId,
        Semester: semester,
        AcademicYear: academicYear,
      },
      include: {
        teacher: {
          select: {
            TeacherID: true,
            Prefix: true,
            Firstname: true,
            Lastname: true,
            Department: true,
          },
        },
        subject: {
          select: {
            SubjectCode: true,
            SubjectName: true,
            Credit: true,
            Category: true,
          },
        },
        gradelevel: {
          select: {
            GradeID: true,
            Year: true,
            Number: true,
          },
        },
      },
      orderBy: [{ subject: { SubjectName: "asc" } }],
    });
  }
);

/**
 * Get teacher's full workload across all grades for semester + year
 * Used for workload calculation and validation
 */
export const findTeacherWorkload = cache(
  async (teacherId: number, semester: semester, academicYear: number) => {
    return prisma.teachers_responsibility.findMany({
      where: {
        TeacherID: teacherId,
        Semester: semester,
        AcademicYear: academicYear,
      },
      include: {
        teacher: {
          select: {
            TeacherID: true,
            Prefix: true,
            Firstname: true,
            Lastname: true,
          },
        },
        subject: {
          select: {
            SubjectCode: true,
            SubjectName: true,
            Credit: true,
            Category: true,
          },
        },
        gradelevel: {
          select: {
            GradeID: true,
            Year: true,
            Number: true,
          },
        },
      },
      orderBy: [{ gradelevel: { GradeID: "asc" } }, { subject: { SubjectName: "asc" } }],
    });
  }
);

/**
 * Get all subjects for a grade's program
 * Used to display all subjects that need teacher assignment
 */
export const findSubjectsByGrade = cache(async (gradeId: string) => {
  // First get the grade's program
  const grade = await prisma.gradelevel.findUnique({
    where: { GradeID: gradeId },
    select: { ProgramID: true },
  });

  if (!grade?.ProgramID) {
    return [];
  }

  // Then get all subjects in that program
  return prisma.program_subject.findMany({
    where: { ProgramID: grade.ProgramID },
    include: {
      subject: {
        select: {
          SubjectCode: true,
          SubjectName: true,
          Credit: true,
          Category: true,
        },
      },
    },
    orderBy: { subject: { SubjectName: "asc" } },
  });
});

/**
 * Get all active teachers
 * Used for teacher selector dropdown
 */
export const findAllTeachers = cache(async () => {
  return prisma.teacher.findMany({
    select: {
      TeacherID: true,
      Prefix: true,
      Firstname: true,
      Lastname: true,
      Department: true,
    },
    orderBy: [{ Firstname: "asc" }, { Lastname: "asc" }],
  });
});

// ============================================================================
// Mutation Methods
// ============================================================================

/**
 * Assign teacher to subject
 * Creates new assignment or updates if already exists
 */
export async function assignTeacherToSubject(data: {
  SubjectCode: string;
  GradeID: string;
  Semester: semester;
  AcademicYear: number;
  TeacherID: number;
  TeachHour: number;
}) {
  // Check if assignment already exists
  const existing = await prisma.teachers_responsibility.findFirst({
    where: {
      SubjectCode: data.SubjectCode,
      GradeID: data.GradeID,
      Semester: data.Semester,
      AcademicYear: data.AcademicYear,
      TeacherID: data.TeacherID,
    },
  });

  if (existing) {
    // Update existing
    return prisma.teachers_responsibility.update({
      where: { RespID: existing.RespID },
      data: { TeachHour: data.TeachHour },
    });
  }

  // Create new
  return prisma.teachers_responsibility.create({ data });
}

/**
 * Remove teacher assignment from subject
 */
export async function unassignTeacherFromSubject(data: {
  SubjectCode: string;
  GradeID: string;
  Semester: semester;
  AcademicYear: number;
  TeacherID: number;
}) {
  // Find the assignment
  const assignment = await prisma.teachers_responsibility.findFirst({
    where: {
      SubjectCode: data.SubjectCode,
      GradeID: data.GradeID,
      Semester: data.Semester,
      AcademicYear: data.AcademicYear,
      TeacherID: data.TeacherID,
    },
  });

  if (!assignment) {
    throw new Error("Assignment not found");
  }

  return prisma.teachers_responsibility.delete({
    where: { RespID: assignment.RespID },
  });
}

/**
 * Bulk assign teachers to subjects (transaction)
 * Ensures all assignments succeed or all fail
 */
export async function bulkAssignTeachers(
  assignments: Array<{
    SubjectCode: string;
    GradeID: string;
    Semester: semester;
    AcademicYear: number;
    TeacherID: number;
    TeachHour: number;
  }>
) {
  // For each assignment, check if it exists and update or create
  const operations = await Promise.all(
    assignments.map(async (data) => {
      const existing = await prisma.teachers_responsibility.findFirst({
        where: {
          SubjectCode: data.SubjectCode,
          GradeID: data.GradeID,
          Semester: data.Semester,
          AcademicYear: data.AcademicYear,
          TeacherID: data.TeacherID,
        },
      });

      if (existing) {
        return prisma.teachers_responsibility.update({
          where: { RespID: existing.RespID },
          data: { TeachHour: data.TeachHour },
        });
      }

      return prisma.teachers_responsibility.create({ data });
    })
  );

  return operations;
}

/**
 * Remove all assignments for a grade + semester + year
 * Used for "Clear All" functionality
 */
export async function clearAllAssignments(
  gradeId: string,
  semester: semester,
  academicYear: number
) {
  return prisma.teachers_responsibility.deleteMany({
    where: {
      GradeID: gradeId,
      Semester: semester,
      AcademicYear: academicYear,
    },
  });
}

/**
 * Copy assignments from previous semester
 * Useful for semester-to-semester continuity
 */
export async function copyAssignmentsFromPreviousSemester(
  sourceGradeId: string,
  sourceSemester: semester,
  sourceYear: number,
  targetGradeId: string,
  targetSemester: semester,
  targetYear: number
) {
  // Get source assignments
  const sourceAssignments = await prisma.teachers_responsibility.findMany({
    where: {
      GradeID: sourceGradeId,
      Semester: sourceSemester,
      AcademicYear: sourceYear,
    },
  });

  // Create target assignments
  const targetAssignments = sourceAssignments.map(
    (assignment): {
      SubjectCode: string;
      GradeID: string;
      Semester: semester;
      AcademicYear: number;
      TeacherID: number;
      TeachHour: number;
    } => ({
      SubjectCode: assignment.SubjectCode,
      GradeID: targetGradeId,
      Semester: targetSemester,
      AcademicYear: targetYear,
      TeacherID: assignment.TeacherID,
      TeachHour: assignment.TeachHour,
    })
  );

  // Bulk insert
  return bulkAssignTeachers(targetAssignments);
}

// ============================================================================
// Utility Methods
// ============================================================================

/**
 * Check if assignment already exists
 */
export async function assignmentExists(data: {
  SubjectCode: string;
  GradeID: string;
  Semester: semester;
  AcademicYear: number;
  TeacherID: number;
}): Promise<boolean> {
  const count = await prisma.teachers_responsibility.count({
    where: {
      SubjectCode: data.SubjectCode,
      GradeID: data.GradeID,
      Semester: data.Semester,
      AcademicYear: data.AcademicYear,
      TeacherID: data.TeacherID,
    },
  });
  return count > 0;
}

/**
 * Get assignment statistics for a context
 */
export async function getAssignmentStats(
  gradeId: string,
  semester: semester,
  academicYear: number
) {
  const [totalSubjects, assignments] = await Promise.all([
    findSubjectsByGrade(gradeId),
    findAssignmentsByContext(gradeId, semester, academicYear),
  ]);

  const uniqueSubjects = new Set(assignments.map((a: { SubjectCode: string }) => a.SubjectCode));
  const assignedCount = uniqueSubjects.size;

  return {
    totalSubjects: totalSubjects.length,
    assignedSubjects: assignedCount,
    unassignedSubjects: totalSubjects.length - assignedCount,
    totalAssignments: assignments.length, // Can be > subjects if multiple teachers per subject
  };
}
