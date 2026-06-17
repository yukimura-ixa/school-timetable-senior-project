import type { timeslot } from "@/prisma/generated/client";
import type { SlotConfig, BreakGroup } from "@/features/timeslot/domain/models/break.types";
import { buildGridRows, type ViewMode } from "@/lib/ui/break-rows";
import { subjectColors } from "@/lib/ui/subject-color";

const dayOrder = ["MON", "TUE", "WED", "THU", "FRI"] as const;
const dayNames: Record<(typeof dayOrder)[number], string> = {
  MON: "จันทร์",
  TUE: "อังคาร",
  WED: "พุธ",
  THU: "พฤหัสบดี",
  FRI: "ศุกร์",
};

export type ScheduleCell = {
  timeslotId: string;
  subjectCode: string;
  subjectName: string;
  gradeLabel?: string;     // e.g. ม.1/1 — for teacher view
  teacherLabel?: string;   // e.g. นายสมชาย — for class view
  roomLabel?: string;
  isLocked?: boolean;
};

export type TimeslotGridProps = {
  timeslots: timeslot[];
  slots: SlotConfig[];
  breakGroups: BreakGroup[];
  view: ViewMode;
  /** subjectCode → cell metadata, keyed by TimeslotID */
  cellsByTimeslotId: Map<string, ScheduleCell>;
  /** Show extra columns per cell */
  show?: { room?: boolean; grade?: boolean; teacher?: boolean };
};

export function TimeslotGrid({
  timeslots,
  slots,
  breakGroups,
  view,
  cellsByTimeslotId,
  show = {},
}: TimeslotGridProps) {
  const rows = buildGridRows(timeslots, slots, breakGroups, view);

  if (rows.length === 0) {
    return (
      <div
        data-testid="schedule-empty"
        className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500"
      >
        ไม่มีตารางในภาคเรียนนี้
      </div>
    );
  }

  return (
    <div className="timeslot-grid overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table
        className="min-w-full border-collapse"
        data-testid="schedule-grid"
      >
        <thead>
          <tr className="bg-slate-900 text-white">
            <th className="w-16 border-r border-slate-700 px-2 py-1.5 text-[11px] font-semibold">
              วัน \ คาบ
            </th>
            {rows.map((row, idx) => {
              if (row.kind === "break") {
                const labels = row.defs.map((d) => d.label).join(" · ");
                const accent = row.defs[0]?.color ?? "#94a3b8";
                const breakTime = row.slots[0]
                  ? formatTimeRange(row.slots[0])
                  : null;
                return (
                  <th
                    key={`bh-${row.slotNumber}-${idx}`}
                    className="whitespace-nowrap border-x-2 border-x-slate-300 bg-slate-800 px-1.5 py-1.5 text-[10px] font-medium"
                    style={{ borderTop: `3px solid ${accent}` }}
                    title={labels}
                  >
                    <div>พัก</div>
                    {breakTime && (
                      <div className="text-[9px] font-normal tabular-nums text-slate-300">
                        {breakTime}
                      </div>
                    )}
                  </th>
                );
              }
              const timeFromFirst = row.slots[0]
                ? formatTimeRange(row.slots[0])
                : null;
              return (
                <th
                  key={`ph-${row.period}`}
                  className="border-r border-slate-700 px-1.5 py-1.5 text-[11px] font-semibold"
                >
                  <div>คาบ {row.period}</div>
                  {timeFromFirst && (
                    <div className="text-[9px] font-normal tabular-nums text-slate-300">
                      {timeFromFirst}
                    </div>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {dayOrder.map((day) => (
            <tr key={day} className="hover:bg-slate-50">
              <td className="border-b border-slate-200 bg-slate-100 px-2 py-1 text-center align-middle text-xs font-semibold text-slate-900">
                {dayNames[day]}
              </td>
              {rows.map((row, idx) => {
                if (row.kind === "break") {
                  return (
                    <td
                      key={`break-${day}-${row.slotNumber}-${idx}`}
                      data-testid="break-cell"
                      className="timeslot-break-cell border-x-2 border-b border-x-slate-300 border-b-slate-200"
                    />
                  );
                }
                const ts = row.slots.find((s) => s.DayOfWeek === day);
                const cell = ts
                  ? cellsByTimeslotId.get(ts.TimeslotID)
                  : undefined;
                const colors = cell ? subjectColors(cell.subjectCode) : null;
                // Teacher view shows the grade; class view shows the teacher.
                // Only one is ever passed via `show`, so merge it onto the code
                // line to keep cells compact without losing context.
                const context = cell
                  ? show.grade
                    ? cell.gradeLabel
                    : show.teacher
                      ? cell.teacherLabel
                      : undefined
                  : undefined;
                return (
                  <td
                    key={`${day}-${row.period}`}
                    className="timeslot-cell border-b border-slate-200 px-1.5 py-1 align-top"
                    style={
                      cell && colors
                        ? {
                            backgroundColor: colors.bg,
                            borderLeft: `3px solid ${colors.stripe}`,
                          }
                        : undefined
                    }
                  >
                    {cell && colors ? (
                      <div className="space-y-0.5">
                        <div className="flex items-start gap-1">
                          <span
                            className="text-[11px] font-semibold leading-tight"
                            style={{ color: colors.text }}
                          >
                            {cell.subjectName}
                          </span>
                          {cell.isLocked && (
                            <span
                              className="shrink-0 rounded-sm bg-amber-100 px-1 text-[8px] font-semibold text-amber-800"
                              title="ล็อกแล้ว"
                              aria-label="ล็อกแล้ว"
                            >
                              ล็อก
                            </span>
                          )}
                        </div>
                        <div className="text-[9px] leading-tight tabular-nums text-slate-500">
                          {cell.subjectCode}
                          {context ? ` · ${context}` : ""}
                        </div>
                        {show.room && cell.roomLabel && (
                          <div className="text-[9px] leading-tight text-slate-400">
                            {cell.roomLabel}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center text-xs text-slate-300">—</div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatTimeRange(t: timeslot): string {
  const opts: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Bangkok",
  };
  return `${new Date(t.StartTime).toLocaleTimeString("th-TH", opts)}-${new Date(t.EndTime).toLocaleTimeString("th-TH", opts)}`;
}
