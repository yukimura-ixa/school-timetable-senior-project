import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminRole, normalizeAppRole } from "@/lib/authz";
import { loadStudentTableView } from "@/features/schedule/loaders/student-table";
import { PrintShell } from "@/components/print/PrintShell";
import { TimeslotGrid } from "@/components/schedule/TimeslotGrid";

type Params = { academicYear: string; semester: string };

export default async function StudentTablePrintPage({
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

  const { academicYear, semester } = await params;
  const view = await loadStudentTableView(
    parseInt(academicYear, 10),
    parseInt(semester, 10),
  );

  const title = `ตารางเรียนรวม — ภาคเรียนที่ ${view.semNum}/${view.academicYear}`;
  return (
    <PrintShell title={title} orientation="portrait">
      <div className="print-card print-fit">
        <TimeslotGrid
          timeslots={view.timeslots}
          slots={view.slots}
          breakGroups={view.breakGroups}
          view={{ mode: "all" }}
          cellsByTimeslotId={view.cellsByTimeslotId}
          show={{ teacher: true, room: true, grade: true }}
        />
      </div>
    </PrintShell>
  );
}
