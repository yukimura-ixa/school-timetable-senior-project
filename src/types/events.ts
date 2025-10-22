/**
 * React Event Handler Types
 * 
 * Standardized event handler types for React components.
 * Replaces `any` types in event handlers throughout the application.
 * 
 * Created: Week 8 - Type Safety Improvements
 * Usage: Import and use instead of `any` for event handlers
 */

import type {
  ChangeEvent,
  MouseEvent,
  FormEvent,
  FocusEvent,
  KeyboardEvent,
  DragEvent,
  ClipboardEvent,
} from 'react';

// ============================================================================
// Modal Event Handlers
// ============================================================================

/**
 * Generic modal close handler (no parameters)
 */
export type ModalCloseHandler = () => void;

/**
 * Generic modal confirm handler with typed data
 */
export type ModalConfirmHandler<T> = (data: T) => Promise<void> | void;

/**
 * Modal handler that can either close or confirm
 */
export type ModalActionHandler<T> = {
  onClose: ModalCloseHandler;
  onConfirm: ModalConfirmHandler<T>;
};

// ============================================================================
// Input Event Handlers
// ============================================================================

/**
 * Generic input change handler
 */
export type InputChangeHandler = (event: ChangeEvent<HTMLInputElement>) => void;

/**
 * Textarea change handler
 */
export type TextAreaChangeHandler = (event: ChangeEvent<HTMLTextAreaElement>) => void;

/**
 * Select/dropdown change handler
 */
export type SelectChangeHandler = (event: ChangeEvent<HTMLSelectElement>) => void;

/**
 * Generic form element change handler (input, select, textarea)
 */
export type FormElementChangeHandler = (
  event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
) => void;

/**
 * Change handler with typed value (for custom components)
 */
export type ValueChangeHandler<T> = (value: T) => void;

/**
 * Change handler with both event and value
 */
export type DetailedChangeHandler<T> = (value: T, event: ChangeEvent<HTMLInputElement>) => void;

// ============================================================================
// Button/Click Event Handlers
// ============================================================================

/**
 * Button click handler
 */
export type ButtonClickHandler = (event: MouseEvent<HTMLButtonElement>) => void;

/**
 * Generic element click handler
 */
export type ClickHandler<T extends HTMLElement = HTMLElement> = (event: MouseEvent<T>) => void;

/**
 * Click handler that prevents default and stops propagation
 */
export type ControlledClickHandler = (event: MouseEvent) => void;

/**
 * Click handler with typed data payload
 */
export type DataClickHandler<T> = (data: T, event: MouseEvent) => void;

// ============================================================================
// Form Event Handlers
// ============================================================================

/**
 * Form submit handler
 */
export type FormSubmitHandler = (event: FormEvent<HTMLFormElement>) => void;

/**
 * Async form submit handler
 */
export type AsyncFormSubmitHandler = (event: FormEvent<HTMLFormElement>) => Promise<void>;

/**
 * Form submit handler with typed form data
 */
export type TypedFormSubmitHandler<T> = (data: T, event: FormEvent<HTMLFormElement>) => void;

/**
 * Form reset handler
 */
export type FormResetHandler = (event: FormEvent<HTMLFormElement>) => void;

// ============================================================================
// Focus Event Handlers
// ============================================================================

/**
 * Input focus handler
 */
export type FocusHandler = (event: FocusEvent<HTMLInputElement>) => void;

/**
 * Input blur handler
 */
export type BlurHandler = (event: FocusEvent<HTMLInputElement>) => void;

/**
 * Generic element focus/blur handler
 */
export type FocusBlurHandler<T extends HTMLElement = HTMLElement> = (event: FocusEvent<T>) => void;

// ============================================================================
// Keyboard Event Handlers
// ============================================================================

/**
 * Generic keyboard event handler
 */
export type KeyboardEventHandler<T extends HTMLElement = HTMLElement> = (event: KeyboardEvent<T>) => void;

/**
 * Key press handler with key filtering
 */
export type KeyPressHandler = (key: string, event: KeyboardEvent) => void;

/**
 * Enter key handler (common pattern)
 */
export type EnterKeyHandler = () => void;

// ============================================================================
// Drag & Drop Event Handlers
// ============================================================================

/**
 * Drag start handler
 */
export type DragStartHandler<T = unknown> = (data: T, event: DragEvent) => void;

/**
 * Drag over handler
 */
export type DragOverHandler = (event: DragEvent) => void;

/**
 * Drop handler with typed data
 */
export type DropHandler<T = unknown> = (data: T, event: DragEvent) => void;

/**
 * Drag end handler
 */
export type DragEndHandler = (event: DragEvent) => void;

// ============================================================================
// Clipboard Event Handlers
// ============================================================================

/**
 * Copy handler
 */
export type CopyHandler = (event: ClipboardEvent) => void;

/**
 * Paste handler
 */
export type PasteHandler = (event: ClipboardEvent) => void;

/**
 * Paste handler with typed data extraction
 */
export type TypedPasteHandler<T> = (data: T, event: ClipboardEvent) => void;

// ============================================================================
// Custom Component Event Handlers
// ============================================================================

/**
 * Generic data change handler (for custom components like AutoComplete)
 */
export type DataChangeHandler<T> = (value: T | null) => void;

/**
 * Multi-select change handler
 */
export type MultiSelectChangeHandler<T> = (values: T[]) => void;

/**
 * Checkbox change handler (returns boolean)
 */
export type CheckboxChangeHandler = (checked: boolean, event: ChangeEvent<HTMLInputElement>) => void;

/**
 * Radio button change handler
 */
export type RadioChangeHandler = (value: string, event: ChangeEvent<HTMLInputElement>) => void;

/**
 * Range/slider change handler
 */
export type RangeChangeHandler = (value: number, event: ChangeEvent<HTMLInputElement>) => void;

/**
 * File input change handler
 */
export type FileChangeHandler = (files: FileList | null, event: ChangeEvent<HTMLInputElement>) => void;

/**
 * Date/time picker change handler
 */
export type DateTimeChangeHandler = (date: Date | null) => void;

/**
 * Color picker change handler
 */
export type ColorChangeHandler = (color: string) => void;

// ============================================================================
// Search & Filter Handlers
// ============================================================================

/**
 * Search input handler
 */
export type SearchHandler = (searchTerm: string) => void;

/**
 * Filter change handler
 */
export type FilterChangeHandler<T> = (filterValue: T) => void;

/**
 * Sort handler with direction
 */
export type SortHandler = (field: string, direction: 'asc' | 'desc') => void;

// ============================================================================
// Pagination Handlers
// ============================================================================

/**
 * Page change handler
 */
export type PageChangeHandler = (page: number) => void;

/**
 * Page size change handler
 */
export type PageSizeChangeHandler = (pageSize: number) => void;

// ============================================================================
// CRUD Operation Handlers
// ============================================================================

/**
 * Create handler with typed data
 */
export type CreateHandler<T> = (data: T) => Promise<void> | void;

/**
 * Update handler with typed data
 */
export type UpdateHandler<T> = (id: string | number, data: Partial<T>) => Promise<void> | void;

/**
 * Delete handler
 */
export type DeleteHandler = (id: string | number) => Promise<void> | void;

/**
 * Bulk delete handler
 */
export type BulkDeleteHandler = (ids: (string | number)[]) => Promise<void> | void;

// ============================================================================
// Async Action Handlers
// ============================================================================

/**
 * Generic async action handler
 */
export type AsyncActionHandler = () => Promise<void>;

/**
 * Async action with payload
 */
export type AsyncActionWithPayloadHandler<T> = (payload: T) => Promise<void>;

/**
 * Action handler with success/error callbacks
 */
export type ActionHandlerWithCallbacks<T> = (
  data: T,
  onSuccess?: () => void,
  onError?: (error: Error) => void
) => Promise<void>;

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Make event handler optional
 */
export type OptionalEventHandler<T> = T | undefined;

/**
 * Handler that can be sync or async
 */
export type MaybeAsyncHandler<T extends (...args: any[]) => any> = (
  ...args: Parameters<T>
) => ReturnType<T> | Promise<Awaited<ReturnType<T>>>;
