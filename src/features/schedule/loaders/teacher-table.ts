import "server-only";
import {
  loadTeacherScheduleView,
  type TeacherScheduleView,
} from "./teacher-schedule";

export type BulkTeacherView = {
  academicYear: number;
  semNum: number;
  teachers: TeacherScheduleView[];
};

/**
 * Loads each selected teacher's schedule for the admin bulk-print route.
 * requirePublished:false — admins may bulk-print DRAFT terms. Order follows
 * the given ids.
 */
export async function loadBulkTeacherView(
  teacherIds: number[],
  academicYear: number,
  semNum: number,
): Promise<BulkTeacherView> {
  const teachers = await Promise.all(
    teacherIds.map((id) =>
      loadTeacherScheduleView(id, academicYear, semNum, {
        requirePublished: false,
      }),
    ),
  );
  return { academicYear, semNum, teachers };
}
