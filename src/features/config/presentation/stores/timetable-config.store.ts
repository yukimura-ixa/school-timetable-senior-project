/**
 * Presentation Layer: Timetable Configuration Store
 *
 * Centralized state management for timetable configuration UI.
 * Uses Zustand with Immer for immutable state updates.
 *
 * @module timetable-config.store
 */

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import {
  ConfigData,
  DEFAULT_CONFIG,
  CONFIG_CONSTRAINTS,
  generateTimeslotRange,
} from "@/features/config/domain/constants/config.constants";
import { getBangkokThaiBuddhistYear } from "@/utils/datetime";

/**
 * Validation errors keyed by field name
 */
export type ValidationErrors = Record<string, string>;

/**
 * Config mode: create (new), edit (modifying), view (readonly)
 */
export type ConfigMode = "create" | "edit" | "view";

/**
 * Store state interface
 */
interface ConfigStoreState {
  // Core state
  config: ConfigData;
  mode: ConfigMode;
  validationErrors: ValidationErrors;
  isLoading: boolean;
  isDirty: boolean;

  // Computed/derived state
  breakSlotOptions: number[];
  hasErrors: boolean;

  // Actions
  loadConfig: (data: ConfigData) => void;
  updateField: <K extends keyof ConfigData>(
    field: K,
    value: ConfigData[K],
  ) => void;
  setMode: (mode: ConfigMode) => void;
  validateConfig: () => boolean;
  resetToDefault: (academicYear: number, semester: string) => void;
  setLoading: (loading: boolean) => void;
  clearErrors: () => void;
}

/**
 * Validate config data and return errors
 */
function validateConfigData(config: ConfigData): ValidationErrors {
  const errors: ValidationErrors = {};

  // Validate slot count
  const slotCount = config.slots?.length ?? 0;
  if (slotCount < CONFIG_CONSTRAINTS.TIMESLOT_PER_DAY.min) {
    errors.timeslotPerDay = `จำนวนคาบต้องไม่น้อยกว่า ${CONFIG_CONSTRAINTS.TIMESLOT_PER_DAY.min} คาบ`;
  }
  if (slotCount > CONFIG_CONSTRAINTS.TIMESLOT_PER_DAY.max) {
    errors.timeslotPerDay = `จำนวนคาบต้องไม่เกิน ${CONFIG_CONSTRAINTS.TIMESLOT_PER_DAY.max} คาบ`;
  }

  // Validate StartTime format
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!timeRegex.test(config.StartTime)) {
    errors.startTime = "รูปแบบเวลาไม่ถูกต้อง (ต้องเป็น HH:MM)";
  }

  return errors;
}

/**
 * Timetable configuration store
 */
export const useConfigStore = create<ConfigStoreState>()(
  immer((set, get) => ({
    // Initial state
    config: {
      ...DEFAULT_CONFIG,
      AcademicYear: getBangkokThaiBuddhistYear(), // Default to current Buddhist year
      Semester: "SEMESTER_1",
    },
    mode: "create",
    validationErrors: {},
    isLoading: false,
    isDirty: false,
    breakSlotOptions: generateTimeslotRange(DEFAULT_CONFIG.slots.length),
    hasErrors: false,

    // Load config from server
    loadConfig: (data) =>
      set((state) => {
        state.config = data;
        state.mode = "view";
        state.isDirty = false;
        // Re-validate on load so stale rows surface immediately.
        state.validationErrors = validateConfigData(data);
        state.breakSlotOptions = generateTimeslotRange(data.slots?.length ?? 0);
      }),

    // Update single field
    updateField: (field, value) =>
      set((state) => {
        state.config[field] = value;
        state.isDirty = true;

        // Auto-adjust slot options if the slots array changes
        if (field === "slots" && Array.isArray(value)) {
          state.breakSlotOptions = generateTimeslotRange(value.length);
        }

        // Re-validate
        state.validationErrors = validateConfigData(state.config);
        state.hasErrors = Object.keys(state.validationErrors).length > 0;
      }),


    // Set mode
    setMode: (mode) =>
      set((state) => {
        state.mode = mode;
        if (mode === "view") {
          state.isDirty = false;
        }
      }),

    // Validate and return success
    validateConfig: () => {
      const errors = validateConfigData(get().config);
      set((state) => {
        state.validationErrors = errors;
        state.hasErrors = Object.keys(errors).length > 0;
      });
      return Object.keys(errors).length === 0;
    },

    // Reset to default values
    resetToDefault: (academicYear, semester) =>
      set((state) => {
        state.config = {
          ...DEFAULT_CONFIG,
          AcademicYear: academicYear,
          Semester: semester,
        };
        state.isDirty = true;
        state.validationErrors = {};
        state.hasErrors = false;
        state.breakSlotOptions = generateTimeslotRange(
          DEFAULT_CONFIG.slots.length,
        );
      }),

    // Set loading state
    setLoading: (loading) =>
      set((state) => {
        state.isLoading = loading;
      }),

    // Clear all errors
    clearErrors: () =>
      set((state) => {
        state.validationErrors = {};
        state.hasErrors = false;
      }),
  })),
);

/**
 * Selector hooks for common computed values
 */
export const useConfigData = () => useConfigStore((state) => state.config);
export const useConfigMode = () => useConfigStore((state) => state.mode);
export const useConfigErrors = () =>
  useConfigStore((state) => state.validationErrors);
export const useConfigDirty = () => useConfigStore((state) => state.isDirty);
export const useConfigLoading = () =>
  useConfigStore((state) => state.isLoading);
