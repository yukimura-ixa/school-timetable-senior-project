import type { Metadata } from "next";
import Link from "next/link";
import ArrowBack from "@mui/icons-material/ArrowBack";
import type { semester } from "@/prisma/generated/client";
import { PrintButton } from "@/app/(public)/_components/PrintButton";
import { publicDataRepository } from "@/lib/infrastructure/repositories/public-data.repository";
import { TimeslotGrid } from "@/components/schedule/TimeslotGrid";
import { loadClassScheduleView } from "@/features/schedule/loaders/class-schedule";


type PageProps = {
  params: Promise<{ gradeId: string; academicYear: string; semester: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { gradeId, academicYear: yearStr, semester: semStr } = await params;
  const academicYear = parseInt(yearStr, 10);
  const semNum = parseInt(semStr, 10);
  const semesterEnum = semNum === 1 ? "SEMESTER_1" : semNum === 2 ? "SEMESTER_2" : null;
  const parsed = semesterEnum && !isNaN(academicYear) ? { academicYear, semesterEnum } : null;
  if (!parsed) return { title: "ไม่พบข้อมูล" };

  // Support both GradeID (M1-1) and numeric (101) formats
  const gradeLevel = await publicDataRepository.findGradeByIdOrNumeric(gradeId);
  if (!gradeLevel) return { title: "ไม่พบข้อมูล" };

  if (
    !(await publicDataRepository.isTermPublished(
      academicYear,
      parsed.semesterEnum as semester,
    ))
  ) {
    return { title: "ไม่พบข้อมูล" };
  }

  return {
    title: `ตารางเรียน - ม.${gradeLevel.Year}/${gradeLevel.Number}`,
    description: `ดูตารางเรียนของชั้น ม.${gradeLevel.Year}/${gradeLevel.Number}`,
  };
}

export default async function ClassScheduleByTermPage({ params }: PageProps) {
  const { gradeId, academicYear: yearStr, semester: semStr } = await params;
  const view = await loadClassScheduleView(gradeId, parseInt(yearStr, 10), parseInt(semStr, 10));

  return (
    <main className="min-h-screen bg-gray-50 py-4 md:py-8 print:p-0 print:bg-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
        <Link
          href={`/?tab=classes`}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4 md:mb-6 print:hidden"
        >
          <ArrowBack className="w-5 h-5" />
          กลับไปหน้าแรก
        </Link>

        {/* Class Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 mb-4 md:mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            ตารางเรียน{" "}
            <span data-testid="class-name">
              ม.{view.gradeLevel.Year}/{view.gradeLevel.Number}
            </span>
          </h1>
          <p className="text-xs md:text-sm text-gray-500 mt-2">
            ภาคเรียนที่ {semStr} ปีการศึกษา{" "}
            {yearStr}
          </p>
        </div>

        {/* Schedule Grid */}
        <TimeslotGrid
          timeslots={view.timeslots}
          slots={view.slots}
          breakGroups={view.breakGroups}
          view={{ mode: "class", gradeId: view.gradeLevel.GradeID, groupNames: view.groupNames }}
          cellsByTimeslotId={view.cellsByTimeslotId}
          show={{ teacher: true, room: true }}
        />

        {/* Print Button */}
        <div className="mt-4 md:mt-6 flex justify-center print:hidden">
          <PrintButton pdfUrl={`/print/classes/${gradeId}/${yearStr}/${semStr}/pdf`} />
        </div>
      </div>
    </main>
  );
}
