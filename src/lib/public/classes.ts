/**
 * Public data access layer for classes (grade levels)
 * Security: Class-level data only, no individual student PII
 */

import prisma from "@/libs/prisma";

export type PublicClass = {
  gradeId: string; // e.g., "M.1/1"
  year: number; // e.g., 1 (M.1)
  section: number; // e.g., 1
  subjectCount: number;
  weeklyHours: number;
  homeroomTeacher?: string;
  primaryRoom?: string;
};

/**
 * Get classes with public-safe data and schedule statistics
 * Uses Next.js fetch cache with 60s revalidation
 */
export async function getPublicClasses(
  searchQuery?: string,
  sortBy?: "grade" | "hours" | "subjects",
  sortOrder?: "asc" | "desc",
) {
    // Get current academic term from latest table_config
    const config = await prisma.table_config.findFirst({
      orderBy: { AcademicYear: "desc" },
      select: { AcademicYear: true, Semester: true },
    });

    if (!config) {
      return [];
    }

    // Query grade levels with their schedules
    const gradeLevels = await prisma.gradelevel.findMany({
      where: searchQuery
        ? {
            GradeID: { contains: searchQuery, mode: "insensitive" },
          }
        : undefined,
      select: {
        GradeID: true,
        Year: true,
        Number: true,
        class_schedule: {
          where: {
            timeslot: {
              AcademicYear: config.AcademicYear,
              Semester: config.Semester,
            },
          },
          select: {
            SubjectCode: true,
            RoomID: true,
            timeslot: {
              select: {
                TimeslotID: true,
              },
            },
          },
        },
        teachers_responsibility: {
          where: {
            AcademicYear: config.AcademicYear,
            Semester: config.Semester,
          },
          select: {
            teacher: {
              select: {
                Prefix: true,
                Firstname: true,
                Lastname: true,
              },
            },
          },
          take: 1, // Get one representative teacher (homeroom concept)
        },
      },
    });

    // Map to public view model
    const publicClasses: PublicClass[] = gradeLevels.map((grade) => {
      const uniqueSubjects = new Set(
        grade.class_schedule.map((s) => s.SubjectCode),
      );
      const weeklyHours = grade.class_schedule.length; // Each schedule entry is one period

      // Find most common room (primary classroom)
      const roomCounts = grade.class_schedule.reduce(
        (acc, s) => {
          acc[s.RoomID] = (acc[s.RoomID] || 0) + 1;
          return acc;
        },
        {} as Record<number, number>,
      );
      const primaryRoomId =
        Object.entries(roomCounts).sort(([, a], [, b]) => b - a)[0]?.[0];

      // Get homeroom teacher (first from responsibilities)
      const homeroomTeacher = grade.teachers_responsibility[0]?.teacher;

      return {
        gradeId: grade.GradeID,
        year: grade.Year,
        section: grade.Number,
        subjectCount: uniqueSubjects.size,
        weeklyHours,
        homeroomTeacher: homeroomTeacher
          ? `${homeroomTeacher.Prefix}${homeroomTeacher.Firstname} ${homeroomTeacher.Lastname}`
          : undefined,
        primaryRoom: primaryRoomId ? `Room ${primaryRoomId}` : undefined,
      };
    });

    // Apply sorting
    const sortedClasses = publicClasses.sort((a, b) => {
      const direction = sortOrder === "desc" ? -1 : 1;
      switch (sortBy) {
        case "hours":
          return (a.weeklyHours - b.weeklyHours) * direction;
        case "subjects":
          return (a.subjectCount - b.subjectCount) * direction;
        case "grade":
        default:
          return a.gradeId.localeCompare(b.gradeId, "th") * direction;
      }
    });

    return sortedClasses;
}

/**
 * Get paginated classes
 */
export async function getPaginatedClasses(params: {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: "grade" | "hours" | "subjects";
  sortOrder?: "asc" | "desc";
}) {
  const {
    page = 1,
    perPage = 25,
    search,
    sortBy = "grade",
    sortOrder = "asc",
  } = params;

  const allClasses = await getPublicClasses(search, sortBy, sortOrder);

  const start = (page - 1) * perPage;
  const end = start + perPage;

  return {
    data: allClasses.slice(start, end),
    total: allClasses.length,
    page,
    perPage,
    totalPages: Math.ceil(allClasses.length / perPage),
  };
}

/**
 * Get total class count
 */
export async function getClassCount() {
  return await prisma.gradelevel.count();
}
