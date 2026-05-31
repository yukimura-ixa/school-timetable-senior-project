import type { Page } from "@playwright/test";

type Timeslot = { TimeslotID: string; Breaktime: string };
type Entry = { TimeslotID: string };

/**
 * Resolve a timeslot that is BOTH non-break and unoccupied for the given grade.
 *
 * The arrange grid is teacher-scoped, so "empty for the selected teacher" does
 * not imply "free for the grade" — the class_schedule unique key is
 * (TimeslotID, GradeID). Cross-reference /api/timeslots (for break state, the
 * authoritative `Breaktime === "NOT_BREAK"` check mirrors getCellState) with
 * /api/schedule/class/[gradeId] (the grade's occupied slots) so a subsequent
 * placement actually creates instead of hitting the unique constraint, and the
 * grid renders it as a placed cell (break cells show "พัก" with no controls).
 */
export async function getGradeFreeTimeslot(
  page: Page,
  gradeId: string,
  year: number | string,
  semester: number | string,
): Promise<string> {
  const [tsRes, schedRes] = await Promise.all([
    page.request.get(`/api/timeslots?year=${year}&semester=${semester}`),
    page.request.get(
      `/api/schedule/class/${encodeURIComponent(gradeId)}?year=${year}&semester=${semester}`,
    ),
  ]);
  if (!tsRes.ok()) throw new Error(`GET /api/timeslots ${tsRes.status()}`);
  if (!schedRes.ok()) {
    throw new Error(`GET /api/schedule/class/${gradeId} ${schedRes.status()}`);
  }

  const timeslots: Timeslot[] = (await tsRes.json()).data ?? [];
  const occupied = new Set<string>(
    (((await schedRes.json()).data ?? []) as Entry[]).map((e) => e.TimeslotID),
  );

  const free = timeslots.find(
    (ts) => ts.Breaktime === "NOT_BREAK" && !occupied.has(ts.TimeslotID),
  );
  if (!free) {
    throw new Error(`No non-break, grade-free timeslot for grade ${gradeId}`);
  }
  return free.TimeslotID;
}
