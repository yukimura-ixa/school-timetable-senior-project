import React from "react";
import {
  Lock as LockIcon,
  Block as BlockIcon,
  EmojiEvents as ActivityIcon,
} from "@mui/icons-material";
import type { GroupedLockedSchedule } from "@/features/lock/domain/services/lock-validation.service";

// Shared lock-type classification consumed by the calendar view, list view,
// and the page legend so a lock looks identical regardless of which surface
// renders it. Colors are aligned to the app theme palette (error / slate /
// secondary) rather than the ad-hoc hexes the two views used to carry
// independently.
//
// Note: EXAM type intentionally omitted — exam scheduling uses the dedicated
// "Exam Arrange Mode" feature.
export type LockType = "SUBJECT" | "BLOCK" | "ACTIVITY";

export interface LockTypeConfig {
  /** Readable text color (dark end of the family). */
  color: string;
  /** Faint tint for filled cells / card surfaces. */
  bgColor: string;
  /** Accent border and legend dot. */
  borderColor: string;
  icon: React.ReactElement;
  label: string;
}

export const LOCK_TYPE_CONFIG: Record<LockType, LockTypeConfig> = {
  SUBJECT: {
    color: "#B91C1C", // error.dark
    bgColor: "rgba(239, 68, 68, 0.08)", // error.main @ 8%
    borderColor: "#EF4444", // error.main
    icon: <LockIcon fontSize="small" />,
    label: "วิชาเรียน",
  },
  BLOCK: {
    color: "#475569", // slate.600
    bgColor: "rgba(100, 116, 139, 0.08)", // slate.500 @ 8%
    borderColor: "#94A3B8", // slate.400
    icon: <BlockIcon fontSize="small" />,
    label: "บล็อกเวลา",
  },
  ACTIVITY: {
    color: "#7E22CE", // secondary.dark
    bgColor: "rgba(168, 85, 247, 0.08)", // secondary.main @ 8%
    borderColor: "#A855F7", // secondary.main
    icon: <ActivityIcon fontSize="small" />,
    label: "กิจกรรม",
  },
};

// Heuristic classification. Activities carry "กิจกรรม" in their name; a lock
// with no real subject code is a bare time block; everything else is a subject.
export function getLockType(lock: GroupedLockedSchedule): LockType {
  if (lock.SubjectName && lock.SubjectName.includes("กิจกรรม")) return "ACTIVITY";
  if (!lock.SubjectCode || lock.SubjectCode === "-") return "BLOCK";
  return "SUBJECT";
}

// The signature: reserved time is "crossed out" with a faint diagonal hatch,
// the way you'd score through a block on a paper planner. Open cells stay
// clean, so blocked vs. free reads instantly across the whole grid.
export function reservedHatch(borderColor: string): string {
  return `repeating-linear-gradient(45deg, transparent 0 7px, ${hexToRgba(
    borderColor,
    0.14,
  )} 7px 8px)`;
}

function hexToRgba(hex: string, alpha: number): string {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
