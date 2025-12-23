/**
 * Public data access layer for classes (grade levels)
 * Security: Class-level data only, no individual student PII
 *
 * MIGRATED: Now uses publicDataRepository instead of direct Prisma queries
 * @see src/lib/infrastructure/repositories/public-data.repository.ts
 */

import {
  extractDayFromTimeslotId,
  extractPeriodFromTimeslotId,
} from "@/utils/timeslot-id";
import { semester } from "@/prisma/generated/client";
import { publicDataRepository } from "@/lib/infrastructure/repositories/public-data.repository";
import type { PublicGradeLevel } from "@/lib/infrastructure/repositories/public-data.repository";

// Legacy type for backward compatibility
export type PublicClass = {
  gradeId: string; // e.g., "M.1/1"
  year: number; // e.g., 1 (M.1)
  section: number; // e.g., 1
  subjectCount: number;
  weeklyHours: number;
  homeroomTeacher?: string;
  primaryRoom?: string;
};

// Re-export repository type
export type { PublicGradeLevel };

/**
 * Helper to get current term info from stats
 */
async function getCurrentTermInfo(): Promise<{
  academicYear: number;
  semester: semester;
} | null> {
  try {
    const stats = await publicDataRepository.getQuickStats();

    if (stats.currentTerm === "N/A") {
      return null;
    }

    // Extract academic year and semester from current term
    const termMatch = stats.currentTerm.match(/ปีการศึกษา (\d+)/);
    const semesterMatch = stats.currentTerm.match(/ภาคเรียนที่ (\d+)/);

    if (!termMatch?.[1] || !semesterMatch?.[1]) {
      return null;
    }

    const academicYear = parseInt(termMatch[1], 10);
    const semesterValue =
      semesterMatch[1] === "1" ? semester.SEMESTER_1 : semester.SEMESTER_2;

    return { academicYear, semester: semesterValue };
  } catch (err) {
    console.warn(
      "[PublicClasses] getCurrentTermInfo error:",
      (err as Error).message,
    );
    return null;
  }
}

/**
 * Map PublicGradeLevel to legacy PublicClass format for backward compatibility
 */
function mapToPublicClass(
  gradeLevel: PublicGradeLevel,
): PublicClass & PublicGradeLevel {
  return {
    ...gradeLevel,
    section: gradeLevel.number, // Alias for backward compatibility
    weeklyHours: 0, // Not available in new format, would need separate query
  };
}

/**
 * Map legacy sortBy to repository sortBy
 */
function mapSortBy(
  sortBy?: "grade" | "hours" | "subjects",
): "year" | "number" | "students" | undefined {
  switch (sortBy) {
    case "grade":
      return "year";
    case "subjects":
      return undefined; // Not supported in repository yet
    case "hours":
      return undefined; // Not supported in repository yet
    default:
      return undefined;
  }
}

/**
 * Get classes with public-safe data and schedule statistics
 * Uses Next.js fetch cache with 60s revalidation
 *
 * MIGRATED: Now uses repository pattern
 */
export async function getPublicClasses(
  searchQuery?: string,
  sortBy?: "grade" | "hours" | "subjects",
  sortOrder?: "asc" | "desc",
): Promise<(PublicClass & PublicGradeLevel)[]> {
  try {
    const termInfo = await getCurrentTermInfo();

    if (!termInfo) {
      return [];
    }

    const gradeLevels = await publicDataRepository.findPublicGradeLevels({
      academicYear: termInfo.academicYear,
      semester: termInfo.semester,
      searchQuery,
      sortBy: mapSortBy(sortBy),
      sortOrder,
    });

    // Apply client-side sorting for unsupported sort options
    const results = gradeLevels.map(mapToPublicClass);

    if (sortBy && (sortBy === "hours" || sortBy === "subjects")) {
      results.sort((a, b) => {
        const direction = sortOrder === "desc" ? -1 : 1;
        if (sortBy === "hours") {
          return (a.weeklyHours - b.weeklyHours) * direction;
        } else {
          return (a.subjectCount - b.subjectCount) * direction;
        }
      });
    }

    return results;
  } catch (err) {
    console.warn(
      "[PublicClasses] getPublicClasses error:",
      (err as Error).message,
    );
    return [];
  }
}

/**
 * Get paginated classes
 *
 * MIGRATED: Uses getPublicClasses which now uses repository
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
 *
 * MIGRATED: Now uses repository pattern
 */
export async function getClassCount() {
  try {
    return await publicDataRepository.countGradeLevels();
  } catch (err) {
    console.warn(
      "[PublicClasses] getClassCount fallback to 0:",
      (err as Error).message,
    );
    return 0;
  }
}

/**
 * Get schedule for a specific class/grade for the current term
 */
export async function getClassSchedule(gradeId: string) {
  try {
    const termInfo = await getCurrentTermInfo();

    if (!termInfo) return [];

    const schedules = await publicDataRepository.findClassSchedule(
      gradeId,
      termInfo.academicYear,
      termInfo.semester,
    );

    type Schedule = (typeof schedules)[number];

    // Normalize and sort (defensive: Prisma already ordered)
    // Helper to get sort key
    const getSortKey = (id: string) => {
      const d = extractDayFromTimeslotId(id);
      const p = extractPeriodFromTimeslotId(id);
      if (!d) return 9900 + p;
      const dayOrder: Record<string, number> = {
        MON: 0,
        TUE: 1,
        WED: 2,
        THU: 3,
        FRI: 4,
        SAT: 5,
        SUN: 6,
      };
      return (dayOrder[d] ?? 99) * 100 + p;
    };

    // Normalize and sort (defensive: Prisma already ordered)
    return schedules.sort((a: Schedule, b: Schedule) => {
      return getSortKey(a.TimeslotID) - getSortKey(b.TimeslotID);
    });
  } catch (err) {
    console.warn(
      "[PublicClasses] getClassSchedule error:",
      (err as Error).message,
    );
    return [];
  }
}
