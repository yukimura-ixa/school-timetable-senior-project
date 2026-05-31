export type Timeslot = {
  TimeslotID: string;
  DayOfWeek: string;
  Period: number;
  StartTime: string | Date;
  EndTime: string | Date;
  Breaktime: string;
};

export type ScheduleEntry = {
  ClassID: number;
  TimeslotID: string;
  SubjectCode: string;
  GradeID: string;
  RoomID: number;
  subject: { SubjectName: string };
  gradelevel: { GradeName: string };
  room: { RoomName: string } | null;
  /** Only present in the class (grade) view — who teaches this placement. */
  teacherName?: string;
};

export const jsonFetcher = (url: string) => fetch(url).then((r) => r.json());

export function timeslotsKey(year: string, semester: string): string {
  return `/api/timeslots?year=${year}&semester=${semester}`;
}

export function teacherScheduleKey(
  teacher: string | null,
  year: string,
  semester: string,
): string | null {
  if (!teacher || !/^\d+$/.test(teacher)) return null;
  return `/api/schedule/teacher/${teacher}?year=${year}&semester=${semester}`;
}

export function classScheduleKey(
  grade: string | null,
  year: string,
  semester: string,
): string | null {
  if (!grade) return null;
  return `/api/schedule/class/${encodeURIComponent(grade)}?year=${year}&semester=${semester}`;
}
