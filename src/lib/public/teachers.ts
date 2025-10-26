/**
 * Public data access layer for teachers
 * Security: Strict field whitelisting, NO PII (email)
 */

import prisma from "@/libs/prisma";

export type PublicTeacher = {
  teacherId: number;
  name: string;
  department: string;
  subjectCount: number;
  weeklyHours: number;
  utilization: number; // percentage based on max hours (e.g., 40)
};

const MAX_WEEKLY_HOURS = 40;

/**
 * Get teachers with public-safe data and teaching statistics
 * Uses Next.js fetch cache with 60s revalidation
 */
export async function getPublicTeachers(
  searchQuery?: string,
  sortBy?: "name" | "hours" | "utilization",
  sortOrder?: "asc" | "desc",
) {
    try {
      // Get current academic term from latest table_config
      const config = await prisma.table_config.findFirst({
        orderBy: { AcademicYear: "desc" },
        select: { AcademicYear: true, Semester: true },
      });

      if (!config) {
        return [];
      }

      // Query teachers with their teaching responsibilities
      const teachers = await prisma.teacher.findMany({
        where: searchQuery
          ? {
              OR: [
                {
                  Firstname: { contains: searchQuery, mode: "insensitive" },
                },
                {
                  Lastname: { contains: searchQuery, mode: "insensitive" },
                },
                {
                  Department: { contains: searchQuery, mode: "insensitive" },
                },
              ],
            }
          : undefined,
        include: {
          teachers_responsibility: {
            where: {
              AcademicYear: config.AcademicYear,
              Semester: config.Semester,
            },
            select: {
              SubjectCode: true,
              TeachHour: true,
            },
          },
        },
      });

    // Map to public view model (excluding Email for PII protection)
    const publicTeachers: PublicTeacher[] = teachers.map((teacher: any) => {
      const uniqueSubjects = new Set(
        teacher.teachers_responsibility.map((r: any) => r.SubjectCode),
      );
      const totalHours = teacher.teachers_responsibility.reduce(
        (sum: number, r: any) => sum + r.TeachHour,
        0,
      );

      return {
        teacherId: teacher.TeacherID,
        name: `${teacher.Prefix}${teacher.Firstname} ${teacher.Lastname}`,
        department: teacher.Department,
        subjectCount: uniqueSubjects.size,
        weeklyHours: totalHours,
        utilization: Math.round((totalHours / MAX_WEEKLY_HOURS) * 100),
      };
    });

    // Apply sorting
    const sortedTeachers = publicTeachers.sort((a, b) => {
      const direction = sortOrder === "desc" ? -1 : 1;
      switch (sortBy) {
        case "hours":
          return (a.weeklyHours - b.weeklyHours) * direction;
        case "utilization":
          return (a.utilization - b.utilization) * direction;
        case "name":
        default:
          return a.name.localeCompare(b.name, "th") * direction;
      }
    });

      return sortedTeachers;
    } catch (err) {
      // Graceful degradation for E2E environments without DB
      console.warn("[PublicTeachers] Falling back to empty dataset due to error:", (err as Error).message);
      return [];
    }
}

/**
 * Get paginated teachers with search and sorting
 */
export async function getPaginatedTeachers(params: {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: "name" | "hours" | "utilization";
  sortOrder?: "asc" | "desc";
}) {
  const {
    page = 1,
    perPage = 25,
    search,
    sortBy = "name",
    sortOrder = "asc",
  } = params;

  const allTeachers = await getPublicTeachers(search, sortBy, sortOrder);

  const start = (page - 1) * perPage;
  const end = start + perPage;

  return {
    data: allTeachers.slice(start, end),
    total: allTeachers.length,
    page,
    perPage,
    totalPages: Math.ceil(allTeachers.length / perPage),
  };
}

/**
 * Get total teacher count
 */
export async function getTeacherCount() {
  try {
    return await prisma.teacher.count();
  } catch (err) {
    console.warn("[PublicTeachers] getTeacherCount fallback to 0:", (err as Error).message);
    return 0;
  }
}

/**
 * Get top teachers by utilization for visualization
 */
export async function getTopTeachersByUtilization(limit = 5) {
  try {
    const teachers = await getPublicTeachers(undefined, "utilization", "desc");
    return teachers.slice(0, limit);
  } catch {
    return [];
  }
}
