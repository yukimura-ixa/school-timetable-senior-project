import { loadClassScheduleView } from "@/features/schedule/loaders/class-schedule";
import { PrintShell } from "@/components/print/PrintShell";
import { TimeslotGrid } from "@/components/schedule/TimeslotGrid";

type Params = { gradeId: string; academicYear: string; semester: string };

export default async function ClassPrintPage({ params }: { params: Promise<Params> }) {
  const { gradeId, academicYear, semester } = await params;
  const view = await loadClassScheduleView(gradeId, parseInt(academicYear, 10), parseInt(semester, 10));
  const title = `ตารางเรียน ม.${view.gradeLevel.Year}/${view.gradeLevel.Number} — ภาคเรียนที่ ${view.semNum}/${view.academicYear}`;
  return (
    <PrintShell title={title} orientation="portrait">
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
