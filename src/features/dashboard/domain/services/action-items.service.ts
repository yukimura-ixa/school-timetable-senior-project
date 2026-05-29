/**
 * Action-first dashboard worklist builder.
 * Pure view-model: maps already-computed dashboard stats into an ordered list
 * of actionable issues. Severity order is the insertion order: error → warning → info.
 */
import type { PublishReadinessResult } from "@/features/config/domain/types/publish-readiness-types";

export type ActionSeverity = "error" | "warning" | "info";

export interface ActionItem {
  id: string;
  severity: ActionSeverity;
  title: string;
  detail: string;
  href: string;
}

export interface ActionItemInputs {
  year: number;
  semester: number;
  conflicts: { teacherConflicts: number; classConflicts: number; roomConflicts: number };
  completion: { full: number; partial: number; none: number };
  teachers: { withSchedules: number; withoutSchedules: number };
  readiness: PublishReadinessResult | null;
}

export function buildActionItems(inputs: ActionItemInputs): ActionItem[] {
  const { year, semester, conflicts, completion, teachers, readiness } = inputs;
  const base = `/dashboard/${year}/${semester}`;
  const items: ActionItem[] = [];

  if (readiness && readiness.status !== "ready" && readiness.status !== "unknown") {
    items.push({
      id: "publish",
      severity: "error",
      title: "ยังเผยแพร่ไม่ได้",
      detail: readiness.issues[0] ?? `${readiness.issues.length} ประเด็นที่ต้องแก้`,
      href: `/schedule/${year}/${semester}/lock`,
    });
  }

  const totalConflicts =
    conflicts.teacherConflicts + conflicts.classConflicts + conflicts.roomConflicts;
  if (totalConflicts > 0) {
    items.push({
      id: "conflicts",
      severity: "error",
      title: `พบข้อขัดแย้ง ${totalConflicts} รายการ`,
      detail: `ครู ${conflicts.teacherConflicts} · ชั้นเรียน ${conflicts.classConflicts} · ห้องเรียน ${conflicts.roomConflicts}`,
      href: `${base}/conflicts`,
    });
  }

  const incompleteClasses = completion.none + completion.partial;
  if (incompleteClasses > 0) {
    items.push({
      id: "classes",
      severity: "warning",
      title: `${incompleteClasses} ชั้นเรียนตารางยังไม่ครบ`,
      detail: `ยังไม่มีตารางเลย ${completion.none} · ไม่เต็ม ${completion.partial}`,
      href: `${base}/student-table`,
    });
  }

  if (teachers.withoutSchedules > 0) {
    items.push({
      id: "teachers",
      severity: "info",
      title: `ครู ${teachers.withoutSchedules} คนยังไม่มีตารางสอน`,
      detail: "ควรจัดภาระงานสอนให้ครบ",
      href: `${base}/teacher-table`,
    });
  }

  return items;
}
