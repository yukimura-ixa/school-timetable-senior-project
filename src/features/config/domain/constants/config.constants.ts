/**
 * Domain Layer: Timetable Configuration Constants
 *
 * Centralized constraints and defaults for timetable configuration.
 * These values enforce MOE curriculum standards and system limitations.
 *
 * @module config.constants
 */

/**
 * Configuration constraints for timetable setup
 */
export const CONFIG_CONSTRAINTS = {
  /** Number of timeslots per day */
  TIMESLOT_PER_DAY: {
    min: 7,
    max: 10,
    default: 8,
    label: "จำนวนคาบต่อวัน",
  },

  /** Duration of each timeslot in minutes */
  DURATION: {
    min: 30,
    max: 120,
    default: 50,
    step: 5,
    label: "ระยะเวลาต่อคาบ (นาที)",
  },

  /** Break duration in minutes */
  BREAK_DURATION: {
    min: 30,
    max: 120,
    default: 50,
    step: 5,
    label: "ระยะเวลาพักเที่ยง (นาที)",
  },

  /** Mini break duration in minutes */
  MINI_BREAK_DURATION: {
    min: 5,
    max: 20,
    default: 10,
    step: 5,
    label: "ระยะเวลาพักเบรก (นาที)",
  },

  /** Start time */
  START_TIME: {
    default: "08:30",
    earliest: "07:00",
    latest: "09:00",
    label: "เวลาเริ่มเรียน",
  },

  /** Academic year */
  ACADEMIC_YEAR: {
    min: 2500,
    max: 2700,
    label: "ปีการศึกษา",
  },
} as const;

/**
 * Default days of the week for timetable
 */
export const DEFAULT_DAYS = ["MON", "TUE", "WED", "THU", "FRI"] as const;

/**
 * Default configuration for new timetable setup
 */
export const DEFAULT_CONFIG = {
  Days: ["MON", "TUE", "WED", "THU", "FRI"],
  StartTime: "08:30" as string,
  BreakDuration: 50 as number,
  BreakTimeslots: {
    Junior: 4, // ม.1-3 break at period 4
    Senior: 5, // ม.4-6 break at period 5
  },
  Duration: 50 as number,
  TimeslotPerDay: 8 as number,
  MiniBreak: {
    Duration: 10 as number,
    SlotNumber: 2, // Mini break after period 2
  },
  HasMinibreak: false as boolean,
};

/**
 * Validation messages for config fields
 */
export const CONFIG_VALIDATION_MESSAGES = {
  TIMESLOT_PER_DAY: {
    MIN: `จำนวนคาบต้องไม่น้อยกว่า ${CONFIG_CONSTRAINTS.TIMESLOT_PER_DAY.min} คาบ`,
    MAX: `จำนวนคาบต้องไม่เกิน ${CONFIG_CONSTRAINTS.TIMESLOT_PER_DAY.max} คาบ`,
  },
  DURATION: {
    MIN: `ระยะเวลาคาบต้องไม่น้อยกว่า ${CONFIG_CONSTRAINTS.DURATION.min} นาที`,
    MAX: `ระยะเวลาคาบต้องไม่เกิน ${CONFIG_CONSTRAINTS.DURATION.max} นาที`,
  },
  BREAK_SLOT: {
    INVALID: "คาบพักต้องอยู่ภายในจำนวนคาบทั้งหมด",
    SAME: "คาบพักมัธยมต้นและมัธยมปลายไม่ควรซ้ำกัน",
  },
  START_TIME: {
    INVALID: "รูปแบบเวลาไม่ถูกต้อง (ต้องเป็น HH:MM)",
    OUT_OF_RANGE: "เวลาเริ่มควรอยู่ระหว่าง 07:00-09:00",
  },
} as const;

/**
 * Helper to generate array of timeslot numbers
 * @example generateTimeslotRange(8) // [1, 2, 3, 4, 5, 6, 7, 8]
 */
export function generateTimeslotRange(count: number): number[] {
  return Array.from({ length: count }, (_, i) => i + 1);
}

/**
 * Type-safe config data based on default config
 */
export type ConfigData = {
  Days: string[];
  AcademicYear: number;
  Semester: string;
  StartTime: string;
  BreakDuration: number;
  BreakTimeslots: {
    Junior: number;
    Senior: number;
  };
  Duration: number;
  TimeslotPerDay: number;
  MiniBreak: {
    Duration: number;
    SlotNumber: number;
  };
  HasMinibreak: boolean;
};
