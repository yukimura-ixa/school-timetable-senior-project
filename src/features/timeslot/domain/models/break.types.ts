/**
 * Domain types for the customizable break system.
 * Break definitions are stored in table_config.Config JSON.
 * Break groups are stored in the break_group DB table.
 */

/** A single break definition in the config JSON */
export type BreakDefinition = {
  id: string;
  label: string;
  slotNumber: number;
  duration: number;
  color: string;
  groups: string[]; // break_group.Name refs, or ["*"] for all
};

export type BreakGroup = {
  name: string;       // break_group.Name — referenced by BreakDefinition.groups
  label: string;      // break_group.Label
  color: string;      // break_group.Color
  gradeIds: string[]; // break_group_grade.GradeID[]
};

/** Default break groups preset */
export const DEFAULT_BREAK_GROUPS = [
  { Name: "junior", Label: "ม.ต้น (ม.1-3)", Color: "#4CAF50" },
  { Name: "senior", Label: "ม.ปลาย (ม.4-6)", Color: "#2196F3" },
] as const;

/** Default break definitions preset */
export const DEFAULT_BREAK_DEFINITIONS: BreakDefinition[] = [
  { id: "lunch-junior", label: "พักเที่ยง ม.ต้น", slotNumber: 4, duration: 50, color: "#4CAF50", groups: ["junior"] },
  { id: "lunch-senior", label: "พักเที่ยง ม.ปลาย", slotNumber: 5, duration: 50, color: "#2196F3", groups: ["senior"] },
];

/** Grade IDs for default junior group */
export const DEFAULT_JUNIOR_GRADES = [
  "M1-1", "M1-2", "M1-3", "M2-1", "M2-2", "M2-3", "M3-1", "M3-2", "M3-3",
];

/** Grade IDs for default senior group */
export const DEFAULT_SENIOR_GRADES = [
  "M4-1", "M4-2", "M4-3", "M5-1", "M5-2", "M5-3", "M6-1", "M6-2", "M6-3",
];
