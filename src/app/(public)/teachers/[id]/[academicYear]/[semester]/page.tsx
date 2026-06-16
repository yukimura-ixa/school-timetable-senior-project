import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import ArrowBack from "@mui/icons-material/ArrowBack";
import { publicDataRepository } from "@/lib/infrastructure/repositories/public-data.repository";
import { TimeslotGrid } from "@/components/schedule/TimeslotGrid";
import { loadTeacherScheduleView } from "@/features/schedule/loaders/teacher-schedule";
import { PrintButton } from "../../../../_components/PrintButton";

type PageProps = {
  params: Promise<{ id: string; academicYear: string; semester: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id, academicYear: yearStr, semester: semStr } = await params;
  const teacherId = parseInt(id, 10);
  if (isNaN(teacherId)) return { title: "ไม่พบข้อมูล" };
  const academicYear = parseInt(yearStr, 10);
  const semNum = parseInt(semStr, 10);
  const semesterEnum = semNum === 1 ? "SEMESTER_1" : semNum === 2 ? "SEMESTER_2" : null;
  if (!semesterEnum || isNaN(academicYear)) return { title: "ไม่พบข้อมูล" };
  if (!(await publicDataRepository.isTermPublished(academicYear, semesterEnum))) {
    return { title: "ไม่พบข้อมูล" };
  }
  const teacher = await publicDataRepository.findPublicTeacherById(
    teacherId,
    academicYear,
    semesterEnum,
  );
  if (!teacher) return { title: "ไม่พบข้อมูล" };
  return {
    title: `ตารางสอน - ${teacher.name}`,
    description: `ดูตารางสอนของ${teacher.name} ภาควิชา${teacher.department || "-"}`,
  };
}

export default async function TeacherScheduleByTermPage({ params }: PageProps) {
  const { id, academicYear: yearStr, semester: semStr } = await params;
  const teacherId = parseInt(id, 10);
  if (isNaN(teacherId)) notFound();

  const view = await loadTeacherScheduleView(
    teacherId,
    parseInt(yearStr, 10),
    parseInt(semStr, 10),
  );

  const pdfUrl = `/print/teachers/${id}/${yearStr}/${semStr}/pdf`;

  return (
    <div className="container mx-auto max-w-7xl p-4 space-y-4">
      {/* Back button */}
      <div className="flex items-center gap-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
        >
          <ArrowBack fontSize="small" />
          กลับหน้าแรก
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">ตารางสอน</h1>
        <div className="text-gray-700">
          <p className="font-medium" data-testid="teacher-name">
            {view.teacher.name}
          </p>
          <p className="text-sm text-gray-600">
            ภาควิชา: {view.teacher.department || "-"}
          </p>
          <p className="text-sm text-gray-600">
            ภาคเรียนที่ {view.semNum} ปีการศึกษา {view.academicYear}
          </p>
        </div>
      </div>

      {/* Schedule Grid */}
      <TimeslotGrid
        timeslots={view.timeslots}
        slots={view.slots}
        breakGroups={view.breakGroups}
        view={{ mode: "teacher" }}
        cellsByTimeslotId={view.cellsByTimeslotId}
        show={{ grade: true, room: true }}
      />

      {/* Print Button */}
      <div className="flex justify-end print:hidden">
        <PrintButton pdfUrl={pdfUrl} />
      </div>
    </div>
  );
}
