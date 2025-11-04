/**
 * Public data access layer for teachers
 * Security: Strict field whitelisting, NO PII (email)
 * 
 * MIGRATED: Now uses publicDataRepository instead of direct Prisma queries
 * @see src/lib/infrastructure/repositories/public-data.repository.ts
 */

import { publicDataRepository } from "@/lib/infrastructure/repositories/public-data.repository";
import type { PublicTeacher } from "@/lib/infrastructure/repositories/public-data.repository";

// Re-export type for backward compatibility
export type { PublicTeacher };

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Extract academic year and semester from term string
 * Format: "ภาคเรียนที่ 1 ปีการศึกษา 2567"
 */
async function getCurrentTermInfo(): Promise<{
  academicYear: number;
  semester: string;
} | null> {
  try {
    const config = await publicDataRepository.getQuickStats();
    
    if (!config || config.currentTerm === 'N/A') {
      return null;
    }

    // Extract academic year and semester from current term
    const termMatch = config.currentTerm.match(/ปีการศึกษา (\d+)/);
    const semesterMatch = config.currentTerm.match(/ภาคเรียนที่ (\d+)/);
    
    if (!termMatch?.[1] || !semesterMatch?.[1]) {
      return null;
    }

    const academicYear = parseInt(termMatch[1], 10);
    const semester = semesterMatch[1] === '1' ? 'SEMESTER_1' : 'SEMESTER_2';

    return { academicYear, semester };
  } catch (err) {
    console.warn("[PublicTeachers] getCurrentTermInfo error:", (err as Error).message);
    return null;
  }
}

// ============================================================================
// Public API Functions
// ============================================================================

/**
 * Get teachers with public-safe data and teaching statistics
 * Uses Next.js fetch cache with 60s revalidation
 * 
 * MIGRATED: Now uses repository pattern
 */
export async function getPublicTeachers(
  searchQuery?: string,
  sortBy?: "name" | "hours" | "utilization",
  sortOrder?: "asc" | "desc",
): Promise<PublicTeacher[]> {
    try {
      const termInfo = await getCurrentTermInfo();
      
      if (!termInfo) {
        return [];
      }

      // Use repository to fetch teachers
      return await publicDataRepository.findPublicTeachers({
        academicYear: termInfo.academicYear,
        semester: termInfo.semester,
        searchQuery,
        sortBy,
        sortOrder,
      });
    } catch (err) {
      console.warn("[PublicTeachers] getPublicTeachers error:", (err as Error).message);
      return [];
    }
}

/**
 * Get paginated teachers with search and sorting
 * 
 * MIGRATED: Uses getPublicTeachers which now uses repository
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
 * 
 * MIGRATED: Now uses repository pattern
 */
export async function getTeacherCount(): Promise<number> {
  try {
    return await publicDataRepository.countTeachers();
  } catch (err) {
    console.warn("[PublicTeachers] getTeacherCount fallback to 0:", (err as Error).message);
    return 0;
  }
}

/**
 * Get top teachers by utilization for visualization
 * 
 * MIGRATED: Uses getPublicTeachers which now uses repository
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
 * 
 * MIGRATED: Now uses repository pattern
 */
export async function getPublicTeacherById(teacherId: number): Promise<{
  teacherId: number;
  name: string;
  department: string | null;
} | null> {
  try {
    const termInfo = await getCurrentTermInfo();
    
    if (!termInfo) {
      return null;
    }

    const teacher = await publicDataRepository.findPublicTeacherById(
      teacherId,
      termInfo.academicYear,
      termInfo.semester
    );

    if (!teacher) return null;

    // Return simplified format for backward compatibility
    return {
      teacherId: teacher.teacherId,
      name: teacher.name,
      department: teacher.department || null,
    };
  } catch (err) {
    console.warn("[PublicTeachers] getPublicTeacherById error:", (err as Error).message);
    return null;
  }
}

/**
 * Get teacher's schedule for current semester
 * 
 * MIGRATED: Now uses repository pattern
 */
export async function getTeacherSchedule(teacherId: number) {
  try {
    const termInfo = await getCurrentTermInfo();
    
    if (!termInfo) {
      return [];
    }

    // Get teacher's responsibilities for this term
    const responsibilities = await publicDataRepository.findTeacherResponsibilities(
      teacherId,
      termInfo.academicYear,
      termInfo.semester
    );

    // Flatten to class schedules
    const schedules = responsibilities.flatMap((resp: any) => resp.class_schedule || []);

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
