import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminRole, normalizeAppRole } from "@/lib/authz";
import { loadAllTimeslotView } from "@/features/schedule/loaders/all-timeslot";
import { buildTimeSlotData } from "@/features/schedule/all-timeslot-data";
import { AllTimeslotGrid } from "@/app/dashboard/[academicYear]/[semester]/all-timeslot/component/AllTimeslotGrid";
import { PrintShell } from "@/components/print/PrintShell";

type Params = { academicYear: string; semester: string };

export default async function AllTimeslotPrintPage({
  params,
}: {
  params: Promise<Params>;
}) {
  // Admin-only: /print/* is public at the middleware layer (see src/proxy.ts).
  // This route self-enforces admin auth — non-admin sessions get 404.
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !isAdminRole(normalizeAppRole(session.user?.role))) {
    notFound();
  }

  const { academicYear, semester } = await params;
  const view = await loadAllTimeslotView(
    parseInt(academicYear, 10),
    parseInt(semester, 10),
  );
  const timeSlotData = buildTimeSlotData(view.timeslots, view.slots);

  const title = `ตารางสอนรวม — ภาคเรียนที่ ${view.semNum}/${view.academicYear}`;
  return (
    <PrintShell title={title} orientation="landscape">
      <div data-testid="schedule-grid" className="print-card print-fit">
        <AllTimeslotGrid
          days={timeSlotData.DayOfWeek}
          columns={timeSlotData.Columns}
          teachers={view.teachers}
          classData={view.classSchedules}
        />
      </div>
    </PrintShell>
  );
}
