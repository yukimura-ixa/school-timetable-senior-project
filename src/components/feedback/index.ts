/**
 * Feedback Components - Barrel Export
 * 
 * Import all feedback components from one place:
 * import { EmptyState, TimetableGridSkeleton, ErrorDisplay } from '@/components/feedback';
 * 
 * Created: October 22, 2025
 */

// Loading States
export {
  TimetableGridSkeleton,
  SubjectListSkeleton,
  TeacherListSkeleton,
  PageLoadingSkeleton,
  TableSkeleton,
  FormSkeleton,
  CardSkeleton,
} from './LoadingStates';

// Empty States
export {
  EmptyState,
  NoTimetableEmptyState,
  NoTeachersEmptyState,
  NoSubjectsEmptyState,
  NoAssignmentsEmptyState,
  NoSearchResultsEmptyState,
  NoDataEmptyState,
  NoConflictsEmptyState,
  NoRoomsEmptyState,
  NoLockedSchedulesEmptyState,
  PermissionDeniedEmptyState,
  NetworkErrorEmptyState,
  ComingSoonEmptyState,
} from './EmptyStates';
