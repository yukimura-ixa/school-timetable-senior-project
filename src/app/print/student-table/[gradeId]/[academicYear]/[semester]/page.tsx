import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminRole, normalizeAppRole } from "@/lib/authz";
import { loadClassScheduleView } from "@/features/schedule/loaders/class-schedule";
import { PrintShell } from "@/components/print/PrintShell";
import { TimeslotGrid } from "@/components/schedule/TimeslotGrid";

type Params = { gradeId: string; academicYear: string; semester: string };

export default async function StudentTableClassPrintPage({
  params,
}: {
  params: Promise<Params>;
}) {
  // Admin-only: /print/* is public at the middleware layer (see src/proxy.ts).
  // This route self-enforces admin auth — non-admin sessions get 404 (don't
  // leak existence of admin-only print routes).
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !isAdminRole(normalizeAppRole(session.user?.role))) {
    notFound();
  }

  const { gradeId, academicYear, semester } = await params;
  // requirePublished:false — admins may print DRAFT terms.
  const view = await loadClassScheduleView(
    gradeId,
    parseInt(academicYear, 10),
    parseInt(semester, 10),
    { requirePublished: false },
  );

  const title = `ตารางเรียน ม.${view.gradeLevel.Year}/${view.gradeLevel.Number} — ภาคเรียนที่ ${view.semNum}/${view.academicYear}`;
  return (
    <PrintShell title={title} orientation="landscape">
      <div className="print-card print-fit">
        <TimeslotGrid
          timeslots={view.timeslots}
          slots={view.slots}
          breakGroups={view.breakGroups}
          view={{ mode: "class", gradeId: view.gradeLevel.GradeID, groupNames: view.groupNames }}
          cellsByTimeslotId={view.cellsByTimeslotId}
          show={{ teacher: true, room: true }}
        />
      </div>
    </PrintShell>
  );
}
