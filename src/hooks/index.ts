/**
 * Shared hooks for data fetching across the application.
 * These hooks use SWR for caching and server actions for data loading.
 */

export { useGradeLevels } from './use-grade-levels'
export { useSubjects } from './use-subjects'
export { useTimeslots } from './use-timeslots'
export { useTeacherAssignments } from './use-teacher-assignments'
export { useLockedSchedules } from './use-locked-schedules'
export { useClassSchedules } from './use-class-schedules'
export { useTeachers } from './use-teachers'
export { useRooms } from './use-rooms'
export { useSemesterSync } from './useSemesterSync'
