import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminRole, normalizeAppRole } from "@/lib/authz";
import { loadBulkTeacherView } from "@/features/schedule/loaders/teacher-table";
import { PrintShell } from "@/components/print/PrintShell";
import { TimeslotGrid } from "@/components/schedule/TimeslotGrid";

type Params = { academicYear: string; semester: string };
type Search = { ids?: string };

export default async function TeacherTablePrintPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}) {
  // Admin-only: /print/* is public at the middleware layer (see src/proxy.ts).
  // This route self-enforces admin auth — non-admin sessions get 404.
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !isAdminRole(normalizeAppRole(session.user?.role))) {
    notFound();
  }

  const { academicYear, semester } = await params;
  const { ids } = await searchParams;
  const teacherIds = (ids ?? "")
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n));
  if (teacherIds.length === 0) notFound();

  // requirePublished:false — admins may bulk-print DRAFT terms.
  const view = await loadBulkTeacherView(
    teacherIds,
    parseInt(academicYear, 10),
    parseInt(semester, 10),
  );

  const title = `ตารางสอน (รวม) — ภาคเรียนที่ ${view.semNum}/${view.academicYear}`;
  return (
    <PrintShell title={title} orientation="landscape">
      <div className="print-bulk">
        {view.teachers.map((t) => (
          <div key={t.teacher.teacherId} className="print-card print-fit">
            <h2 className="print-title">{t.teacher.name}</h2>
            <TimeslotGrid
              timeslots={t.timeslots}
              slots={t.slots}
              breakGroups={t.breakGroups}
              view={{ mode: "teacher" }}
              cellsByTimeslotId={t.cellsByTimeslotId}
              show={{ grade: true, room: true }}
            />
          </div>
        ))}
      </div>
    </PrintShell>
  );
}
