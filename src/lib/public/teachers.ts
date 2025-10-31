/**
 * Public data access layer for teachers
 * Security: Strict field whitelisting, NO PII (email)
 */

import prisma from "@/lib/prisma";
import type { Prisma } from "../../../prisma/generated";

export type PublicTeacher = {
  teacherId: number;
  name: string;
  department: string;
  subjectCount: number;
  weeklyHours: number;
  utilization: number; // percentage based on max hours (e.g., 40)
};

// Typed shape for teachers + responsibilities using Prisma payload
type TeacherWithResponsibilities = Prisma.teacherGetPayload<{
  include: {
    teachers_responsibility: {
      select: {
        SubjectCode: true;
        TeachHour: true;
      };
    };
  };
}>;

const MAX_WEEKLY_HOURS = 40;

/**
 * Get teachers with public-safe data and teaching statistics
 * Uses Next.js fetch cache with 60s revalidation
 */
export async function getPublicTeachers(
  searchQuery?: string,
  sortBy?: "name" | "hours" | "utilization",
  sortOrder?: "asc" | "desc",
) : Promise<PublicTeacher[]> {
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
      const teachers = (await prisma.teacher.findMany({
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
      })) as TeacherWithResponsibilities[];

    // Map to public view model (excluding Email for PII protection)
    const publicTeachers: PublicTeacher[] = teachers.map((teacher) => {
      const uniqueSubjects = new Set(
        teacher.teachers_responsibility.map((r) => r.SubjectCode),
      );
      const totalHours = teacher.teachers_responsibility.reduce(
        (sum, r) => sum + r.TeachHour,
        0,
      );

      const prefix = teacher.Prefix ?? "";

      return {
        teacherId: teacher.TeacherID,
        name: `${prefix}${teacher.Firstname} ${teacher.Lastname}`,
        department: teacher.Department ?? "",
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
}): Promise<{
  data: PublicTeacher[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}> {
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
export async function getTeacherCount(): Promise<number> {
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
export async function getTopTeachersByUtilization(limit = 5): Promise<PublicTeacher[]> {
  try {
    const teachers = await getPublicTeachers(undefined, "utilization", "desc");
    return teachers.slice(0, limit);
  } catch {
    return [];
  }
}

/**
 * Get a single teacher by ID with public-safe data
 */
export async function getPublicTeacherById(teacherId: number): Promise<{
  teacherId: number;
  name: string;
  department: string | null;
} | null> {
  try {
    const teacher = await prisma.teacher.findUnique({
      where: { TeacherID: teacherId },
      select: {
        TeacherID: true,
        Prefix: true,
        Firstname: true,
        Lastname: true,
        Department: true,
      },
    });

    if (!teacher) return null;

    return {
      teacherId: teacher.TeacherID,
      name: `${teacher.Prefix}${teacher.Firstname} ${teacher.Lastname}`,
      department: teacher.Department,
    };
  } catch (err) {
    console.warn("[PublicTeachers] getPublicTeacherById error:", (err as Error).message);
    return null;
  }
}

/**
 * Get teacher's schedule for current semester
 */
export async function getTeacherSchedule(teacherId: number) {
  try {
    // Get current academic term
    const config = await prisma.table_config.findFirst({
      orderBy: { AcademicYear: "desc" },
      select: { AcademicYear: true, Semester: true },
    });

    if (!config) return [];

    // Get teacher's responsibilities for this term
    const responsibilities = await prisma.teachers_responsibility.findMany({
      where: {
        TeacherID: teacherId,
        AcademicYear: config.AcademicYear,
        Semester: config.Semester,
      },
      include: {
        class_schedule: {
          include: {
            timeslot: true,
            subject: {
              select: {
                SubjectCode: true,
                SubjectName: true,
              },
            },
            gradelevel: {
              select: {
                GradeID: true,
                Year: true,
                Number: true,
              },
            },
            room: {
              select: {
                RoomID: true,
                RoomName: true,
                Building: true,
              },
            },
          },
        },
      },
    });

    // Flatten to class schedules
    const schedules = responsibilities.flatMap((resp) => resp.class_schedule);

    // Sort by day and time
    return schedules.sort((a, b) => {
      const dayOrder = { MON: 0, TUE: 1, WED: 2, THU: 3, FRI: 4 };
      const dayDiff = dayOrder[a.timeslot.DayOfWeek as keyof typeof dayOrder] - 
                      dayOrder[b.timeslot.DayOfWeek as keyof typeof dayOrder];
      if (dayDiff !== 0) return dayDiff;
      
      return a.timeslot.StartTime < b.timeslot.StartTime ? -1 : 1;
    });
  } catch (err) {
    console.warn("[PublicTeachers] getTeacherSchedule error:", (err as Error).message);
    return [];
  }
}
