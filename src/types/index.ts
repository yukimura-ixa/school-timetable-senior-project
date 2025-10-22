/**
 * Centralized Type Exports
 * 
 * Re-exports all type definitions for easy importing throughout the application.
 * 
 * Created: Week 8 - Type Safety Improvements
 * Usage: import { ConflictError, LockSchedule, SubjectData } from '@/types'
 */

// Error Types
export type {
  ConflictType,
  ConflictingSchedule,
  ConflictError,
  ValidationError,
  AuthorizationError,
  NotFoundError,
  DatabaseError,
  LockedScheduleError,
  UnknownError,
  ServerActionError,
} from './errors';

export {
  isConflictError,
  isValidationError,
  isAuthorizationError,
  isNotFoundError,
  isLockedScheduleError,
  isServerActionError,
  createConflictError,
  createValidationError,
  createAuthorizationError,
  createNotFoundError,
  createLockedScheduleError,
  createDatabaseError,
} from './errors';

// Lock Schedule Types
export type {
  LockScheduleFormData,
  LockSchedule,
  LockScheduleListItem,
  AddLockScheduleModalProps,
  EditLockScheduleModalProps,
  DeleteLockScheduleModalProps,
  LockScheduleFormState,
  LockScheduleFormAction,
  LockScheduleCreateResponse,
  LockScheduleUpdateResponse,
  LockScheduleDeleteResponse,
  LockScheduleListResponse,
} from './lock-schedule';

// UI State Types
export type {
  SubjectData,
  TimeslotData,
  TimeslotWithRelations,
  TimeSlotGridData,
  ArrangementUIState,
  TeacherResponsibilityWithRelations,
  TeacherResponsibilityFormData,
  ClassScheduleSummary,
  TeacherScheduleSummary,
  TimetableConfig,
  TimetableConfigFormData,
  SelectOption,
  TeacherSelectOption,
  RoomSelectOption,
  SubjectSelectOption,
  DragSourceData,
  DropTargetData,
  DragEventData,
  FilterState,
  PaginationState,
  PaginatedResponse,
} from './ui-state';

// Event Handler Types
export type {
  // Modal Handlers
  ModalCloseHandler,
  ModalConfirmHandler,
  ModalActionHandler,
  
  // Input Handlers
  InputChangeHandler,
  TextAreaChangeHandler,
  SelectChangeHandler,
  FormElementChangeHandler,
  ValueChangeHandler,
  DetailedChangeHandler,
  
  // Click Handlers
  ButtonClickHandler,
  ClickHandler,
  ControlledClickHandler,
  DataClickHandler,
  
  // Form Handlers
  FormSubmitHandler,
  AsyncFormSubmitHandler,
  TypedFormSubmitHandler,
  FormResetHandler,
  
  // Focus Handlers
  FocusHandler,
  BlurHandler,
  FocusBlurHandler,
  
  // Keyboard Handlers
  KeyboardEventHandler,
  KeyPressHandler,
  EnterKeyHandler,
  
  // Drag & Drop Handlers
  DragStartHandler,
  DragOverHandler,
  DropHandler,
  DragEndHandler,
  
  // Clipboard Handlers
  CopyHandler,
  PasteHandler,
  TypedPasteHandler,
  
  // Custom Component Handlers
  DataChangeHandler,
  MultiSelectChangeHandler,
  CheckboxChangeHandler,
  RadioChangeHandler,
  RangeChangeHandler,
  FileChangeHandler,
  DateTimeChangeHandler,
  ColorChangeHandler,
  
  // Search & Filter Handlers
  SearchHandler,
  FilterChangeHandler,
  SortHandler,
  
  // Pagination Handlers
  PageChangeHandler,
  PageSizeChangeHandler,
  
  // CRUD Handlers
  CreateHandler,
  UpdateHandler,
  DeleteHandler,
  BulkDeleteHandler,
  
  // Async Handlers
  AsyncActionHandler,
  AsyncActionWithPayloadHandler,
  ActionHandlerWithCallbacks,
  
  // Utility Types
  OptionalEventHandler,
  MaybeAsyncHandler,
} from './events';

// Re-export Prisma types for convenience
export type {
  class_schedule,
  gradelevel,
  room,
  subject,
  teacher,
  timeslot,
  teachers_responsibility,
  program,
  semester,
  day_of_week,
  breaktime,
  subject_credit,
  table_config,
} from '@prisma/client';
