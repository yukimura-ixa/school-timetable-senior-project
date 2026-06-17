import { loadTeacherScheduleView } from "@/features/schedule/loaders/teacher-schedule";
import { PrintShell } from "@/components/print/PrintShell";
import { TimeslotGrid } from "@/components/schedule/TimeslotGrid";

type Params = { id: string; academicYear: string; semester: string };

export default async function TeacherPrintPage({ params }: { params: Promise<Params> }) {
  const { id, academicYear, semester } = await params;
  const view = await loadTeacherScheduleView(
    parseInt(id, 10),
    parseInt(academicYear, 10),
    parseInt(semester, 10),
  );
  const title = `ตารางสอน ${view.teacher.name} — ภาคเรียนที่ ${view.semNum}/${view.academicYear}`;
  return (
    <PrintShell title={title} orientation="landscape">
      <div className="print-card print-fit">
        <TimeslotGrid
          timeslots={view.timeslots}
          slots={view.slots}
          breakGroups={view.breakGroups}
          view={{ mode: "teacher" }}
          cellsByTimeslotId={view.cellsByTimeslotId}
          show={{ grade: true, room: true }}
        />
      </div>
    </PrintShell>
  );
}
