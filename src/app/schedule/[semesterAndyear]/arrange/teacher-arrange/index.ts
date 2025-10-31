/**
 * Teacher Arrange Module Exports
 * 
 * Centralized exports for hooks and components used in teacher schedule arrangement.
 * 
 * @module teacher-arrange
 */

// Hooks
export { useTeacherSchedule } from './hooks/useTeacherSchedule';
export type {
  UseTeacherScheduleParams,
  UseTeacherScheduleResult,
  ClassScheduleWithRelations,
} from './hooks/useTeacherSchedule';

// Components
export { LockedScheduleList, LockedScheduleListCompact } from './components/LockedScheduleList';
export type {
  LockedScheduleItem,
  LockedScheduleListProps,
} from './components/LockedScheduleList';
