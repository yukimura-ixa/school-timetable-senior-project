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
  updateBreakSlot: (level: "Junior" | "Senior", slot: number) => void;
  updateMiniBreak: (field: "Duration" | "SlotNumber", value: number) => void;
  toggleMiniBreak: () => void;
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

  // Validate TimeslotPerDay
  if (config.TimeslotPerDay < CONFIG_CONSTRAINTS.TIMESLOT_PER_DAY.min) {
    errors.timeslotPerDay = `จำนวนคาบต้องไม่น้อยกว่า ${CONFIG_CONSTRAINTS.TIMESLOT_PER_DAY.min} คาบ`;
  }
  if (config.TimeslotPerDay > CONFIG_CONSTRAINTS.TIMESLOT_PER_DAY.max) {
    errors.timeslotPerDay = `จำนวนคาบต้องไม่เกิน ${CONFIG_CONSTRAINTS.TIMESLOT_PER_DAY.max} คาบ`;
  }

  // Validate Duration
  if (config.Duration < CONFIG_CONSTRAINTS.DURATION.min) {
    errors.duration = `ระยะเวลาคาบต้องไม่น้อยกว่า ${CONFIG_CONSTRAINTS.DURATION.min} นาที`;
  }
  if (config.Duration > CONFIG_CONSTRAINTS.DURATION.max) {
    errors.duration = `ระยะเวลาคาบต้องไม่เกิน ${CONFIG_CONSTRAINTS.DURATION.max} นาที`;
  }

  // Validate StartTime format
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!timeRegex.test(config.StartTime)) {
    errors.startTime = "รูปแบบเวลาไม่ถูกต้อง (ต้องเป็น HH:MM)";
  }

  // Validate BreakTimeslots
  if (config.BreakTimeslots.Junior > config.TimeslotPerDay) {
    errors.breakSlotJunior = "คาบพักมัธยมต้นต้องไม่เกินจำนวนคาบทั้งหมด";
  }
  if (config.BreakTimeslots.Senior > config.TimeslotPerDay) {
    errors.breakSlotSenior = "คาบพักมัธยมปลายต้องไม่เกินจำนวนคาบทั้งหมด";
  }

  // Warn if break slots are the same (not an error, but worth noting)
  if (config.BreakTimeslots.Junior === config.BreakTimeslots.Senior) {
    errors.breakSlotWarning = "คาบพักมัธยมต้นและมัธยมปลายซ้ำกัน";
  }

  // Validate MiniBreak
  if (config.HasMinibreak) {
    if (config.MiniBreak.SlotNumber > config.TimeslotPerDay) {
      errors.miniBreakSlot = "คาบพักเบรกต้องไม่เกินจำนวนคาบทั้งหมด";
    }
    if (
      config.MiniBreak.Duration < CONFIG_CONSTRAINTS.MINI_BREAK_DURATION.min
    ) {
      errors.miniBreakDuration = `ระยะเวลาพักเบรกต้องไม่น้อยกว่า ${CONFIG_CONSTRAINTS.MINI_BREAK_DURATION.min} นาที`;
    }
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
    breakSlotOptions: generateTimeslotRange(DEFAULT_CONFIG.TimeslotPerDay),
    hasErrors: false,

    // Load config from server
    loadConfig: (data) =>
      set((state) => {
        state.config = data;
        state.mode = "view";
        state.isDirty = false;
        state.validationErrors = {};
        state.breakSlotOptions = generateTimeslotRange(data.TimeslotPerDay);
      }),

    // Update single field
    updateField: (field, value) =>
      set((state) => {
        state.config[field] = value;
        state.isDirty = true;

        // Auto-adjust break slots if TimeslotPerDay changes
        if (field === "TimeslotPerDay" && typeof value === "number") {
          state.breakSlotOptions = generateTimeslotRange(value);

          // Clamp break slots to new max
          if (state.config.BreakTimeslots.Junior > value) {
            state.config.BreakTimeslots.Junior = value;
          }
          if (state.config.BreakTimeslots.Senior > value) {
            state.config.BreakTimeslots.Senior = value;
          }
          if (state.config.MiniBreak.SlotNumber > value) {
            state.config.MiniBreak.SlotNumber = Math.min(2, value);
          }
        }

        // Auto-sync BreakDuration with Duration
        if (field === "Duration" && typeof value === "number") {
          state.config.BreakDuration = value;
        }

        // Re-validate
        state.validationErrors = validateConfigData(state.config);
        state.hasErrors = Object.keys(state.validationErrors).length > 0;
      }),

    // Update break timeslot for specific level
    updateBreakSlot: (level, slot) =>
      set((state) => {
        state.config.BreakTimeslots[level] = slot;
        state.isDirty = true;
        state.validationErrors = validateConfigData(state.config);
        state.hasErrors = Object.keys(state.validationErrors).length > 0;
      }),

    // Update mini break settings
    updateMiniBreak: (field, value) =>
      set((state) => {
        state.config.MiniBreak[field] = value;
        state.isDirty = true;
        state.validationErrors = validateConfigData(state.config);
        state.hasErrors = Object.keys(state.validationErrors).length > 0;
      }),

    // Toggle mini break on/off
    toggleMiniBreak: () =>
      set((state) => {
        state.config.HasMinibreak = !state.config.HasMinibreak;
        state.isDirty = true;
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
          DEFAULT_CONFIG.TimeslotPerDay,
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
