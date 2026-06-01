import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import ArrowBack from "@mui/icons-material/ArrowBack";
import type { semester } from "@/prisma/generated/client";
import { PrintButton } from "@/app/(public)/_components/PrintButton";
import { publicDataRepository } from "@/lib/infrastructure/repositories/public-data.repository";
import * as classRepository from "@/features/class/infrastructure/repositories/class.repository";
import { getTimetableConfig } from "@/lib/timetable-config";
import type { BreakDefinition } from "@/features/timeslot/domain/models/break.types";
import { getBreakContextAction } from "@/features/timeslot/application/actions/timeslot.actions";
import { buildGradeGroupIndex } from "@/utils/break-utils";
import { TimeslotGrid, type ScheduleCell } from "@/components/schedule/TimeslotGrid";


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

  return {
    title: `ตารางเรียน - ม.${gradeLevel.Year}/${gradeLevel.Number}`,
    description: `ดูตารางเรียนของชั้น ม.${gradeLevel.Year}/${gradeLevel.Number}`,
  };
}

export default async function ClassScheduleByTermPage({ params }: PageProps) {
  const { gradeId, academicYear: yearStr, semester: semStr } = await params;
  const academicYear = parseInt(yearStr, 10);
  const semNum = parseInt(semStr, 10);
  const semesterEnum = semNum === 1 ? "SEMESTER_1" : semNum === 2 ? "SEMESTER_2" : null;
  if (!semesterEnum || isNaN(academicYear)) notFound();

  // Fetch grade level info - support both GradeID (M1-1) and numeric (101) formats
  const gradeLevel = await publicDataRepository.findGradeByIdOrNumeric(gradeId);
  if (!gradeLevel) notFound();

  // Fetch class schedules for this grade and term
  // Note: semesterEnum is already typed as "SEMESTER_1" | "SEMESTER_2" from parseConfigId
  const semesterValue: semester = semesterEnum;
  const schedules = await classRepository.findByGrade(
    gradeLevel.GradeID,
    academicYear,
    semesterValue,
  );

  // Get all timeslots + break config for this term to build the grid
  const timeslots = await publicDataRepository.findTimeslotsByTerm(academicYear, semesterValue);
  const config = await getTimetableConfig(academicYear, semesterValue);
  const breakDefs: BreakDefinition[] = config.breakDefinitions ?? [];

  const breakContextResult = await getBreakContextAction({
    AcademicYear: academicYear,
    Semester: semesterValue,
  });
  const breakGroups = breakContextResult.success ? (breakContextResult.data?.groups ?? []) : [];
  const groupNames = [...(buildGradeGroupIndex(breakGroups).get(gradeLevel.GradeID) ?? [])];

  const cellsByTimeslotId = new Map<string, ScheduleCell>();
  for (const s of schedules) {
    cellsByTimeslotId.set(s.timeslot.TimeslotID, {
      timeslotId: s.timeslot.TimeslotID,
      subjectCode: s.subject.SubjectCode,
      subjectName: s.subject.SubjectName,
      teacherLabel:
        s.teachers_responsibility
          .map((tr) => `${tr.teacher.Prefix}${tr.teacher.Firstname} ${tr.teacher.Lastname}`)
          .join(", ") || undefined,
      roomLabel: s.room?.RoomName ?? undefined,
    });
  }

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
              ม.{gradeLevel.Year}/{gradeLevel.Number}
            </span>
          </h1>
          <p className="text-xs md:text-sm text-gray-500 mt-2">
            ภาคเรียนที่ {semStr} ปีการศึกษา{" "}
            {yearStr}
          </p>
        </div>

        {/* Schedule Grid */}
        <TimeslotGrid
          timeslots={timeslots}
          breakDefs={breakDefs}
          view={{ mode: "class", gradeId: gradeLevel.GradeID, groupNames }}
          cellsByTimeslotId={cellsByTimeslotId}
          show={{ teacher: true, room: true }}
        />

        {/* Print Button */}
        <div className="mt-4 md:mt-6 flex justify-center print:hidden">
          <PrintButton />
        </div>
      </div>
    </main>
  );
}
