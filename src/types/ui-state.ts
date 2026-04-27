/**
 * UI State Types
 *
 * Minimal type definitions for UI components.
 * Most schedule-related types live in schedule.types.ts.
 */

export interface SelectOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface RoomSelectOption extends SelectOption<number> {
  building: string;
  floor: string;
}
