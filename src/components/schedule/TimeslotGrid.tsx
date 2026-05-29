import type { timeslot } from "@/prisma/generated/client";
import type { BreakDefinition } from "@/features/timeslot/domain/models/break.types";
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
  breakDefs: BreakDefinition[];
  view: ViewMode;
  /** subjectCode → cell metadata, keyed by TimeslotID */
  cellsByTimeslotId: Map<string, ScheduleCell>;
  /** Show extra columns per cell */
  show?: { room?: boolean; grade?: boolean; teacher?: boolean };
};

export function TimeslotGrid({
  timeslots,
  breakDefs,
  view,
  cellsByTimeslotId,
  show = {},
}: TimeslotGridProps) {
  const rows = buildGridRows(timeslots, breakDefs, view);

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
        role="table"
      >
        <thead>
          <tr className="bg-slate-900 text-white">
            <th className="border-r border-slate-700 px-2 py-2 text-xs font-semibold w-20">
              คาบ
            </th>
            {dayOrder.map((day) => (
              <th
                key={day}
                className="border-r border-slate-700 px-2 py-2 text-xs font-semibold"
              >
                {dayNames[day]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => {
            if (row.kind === "break") {
              const labels = row.defs.map((d) => d.label).join(" · ");
              const accent = row.defs[0]?.color ?? "#94a3b8";
              return (
                <tr
                  key={`break-${row.slotNumber}-${idx}`}
                  className="bg-slate-50"
                  data-testid="break-row"
                >
                  <td
                    colSpan={dayOrder.length + 1}
                    className="border-b border-slate-200 px-3 py-1.5 text-center text-xs italic text-slate-600"
                    style={{ borderLeft: `4px solid ${accent}` }}
                  >
                    — {labels} —
                  </td>
                </tr>
              );
            }
            // teaching row
            const timeFromFirst = row.slots[0]
              ? formatTimeRange(row.slots[0])
              : null;
            return (
              <tr key={`p-${row.period}`} className="hover:bg-slate-50/60">
                <td className="border-b border-slate-200 bg-slate-50 px-2 py-2 text-center align-top">
                  <div className="text-sm font-semibold text-slate-900">
                    คาบ {row.period}
                  </div>
                  {timeFromFirst && (
                    <div className="text-[10px] text-slate-500">
                      {timeFromFirst}
                    </div>
                  )}
                </td>
                {dayOrder.map((day) => {
                  const ts = row.slots.find((s) => s.DayOfWeek === day);
                  const cell = ts ? cellsByTimeslotId.get(ts.TimeslotID) : undefined;
                  return (
                    <td
                      key={day}
                      className="timeslot-cell border-b border-slate-200 px-2 py-2 align-top"
                      style={
                        cell
                          ? {
                              backgroundColor: subjectColors(cell.subjectCode).bg,
                              borderLeft: `3px solid ${subjectColors(cell.subjectCode).stripe}`,
                            }
                          : undefined
                      }
                    >
                      {cell ? (
                        <div className="space-y-0.5">
                          <div
                            className="text-xs font-semibold"
                            style={{ color: subjectColors(cell.subjectCode).text }}
                          >
                            {cell.subjectName}
                          </div>
                          <div className="text-[10px] text-slate-600">
                            ({cell.subjectCode})
                          </div>
                          {show.grade && cell.gradeLabel && (
                            <div className="text-[10px] text-slate-700">
                              {cell.gradeLabel}
                            </div>
                          )}
                          {show.teacher && cell.teacherLabel && (
                            <div className="text-[10px] text-slate-700">
                              {cell.teacherLabel}
                            </div>
                          )}
                          {show.room && cell.roomLabel && (
                            <div className="text-[10px] text-slate-500">
                              {cell.roomLabel}
                            </div>
                          )}
                          {cell.isLocked && (
                            <div
                              className="mt-0.5 inline-block rounded-sm bg-amber-100 px-1 text-[9px] font-semibold text-amber-800"
                              title="ล็อกแล้ว"
                              aria-label="ล็อกแล้ว"
                            >
                              ล็อก
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
            );
          })}
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
