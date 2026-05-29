import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import ArrowBack from "@mui/icons-material/ArrowBack";
import { publicDataRepository } from "@/lib/infrastructure/repositories/public-data.repository";
import type { semester } from "@/prisma/generated/client";
import { getTimetableConfig } from "@/lib/timetable-config";
import type { BreakDefinition } from "@/features/timeslot/domain/models/break.types";
import { TimeslotGrid, type ScheduleCell } from "@/components/schedule/TimeslotGrid";


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

type ResponsibilityWithSchedules = Awaited<
  ReturnType<typeof publicDataRepository.findTeacherResponsibilities>
>[number];

type PublicScheduleEntry = NonNullable<
  ResponsibilityWithSchedules["class_schedule"]
>[number];

export default async function TeacherScheduleByTermPage({ params }: PageProps) {
  const { id, academicYear: yearStr, semester: semStr } = await params;
  const teacherId = parseInt(id, 10);
  if (isNaN(teacherId)) notFound();
  const academicYear = parseInt(yearStr, 10);
  const semNum = parseInt(semStr, 10);
  const semesterEnum = semNum === 1 ? "SEMESTER_1" : semNum === 2 ? "SEMESTER_2" : null;
  if (!semesterEnum || isNaN(academicYear)) notFound();

  // Fetch teacher info and schedule data
  const teacher = await publicDataRepository.findPublicTeacherById(
    teacherId,
    academicYear,
    semesterEnum,
  );
  if (!teacher) notFound();

  // Get responsibilities to build schedule grid
  const responsibilities =
    await publicDataRepository.findTeacherResponsibilities(
      teacherId,
      academicYear,
      semesterEnum,
    );
  const schedules: PublicScheduleEntry[] = responsibilities.flatMap(
    (resp) => resp.class_schedule ?? [],
  );

  // Get all timeslots + break config for this term to build the grid
  const semesterValue: semester = semesterEnum;
  const timeslots = await publicDataRepository.findTimeslotsByTerm(academicYear, semesterValue);
  const config = await getTimetableConfig(academicYear, semesterValue);
  const breakDefs: BreakDefinition[] = config.breakDefinitions ?? [];

  const cellsByTimeslotId = new Map<string, ScheduleCell>();
  for (const s of schedules) {
    cellsByTimeslotId.set(s.timeslot.TimeslotID, {
      timeslotId: s.timeslot.TimeslotID,
      subjectCode: s.subject.SubjectCode,
      subjectName: s.subject.SubjectName,
      gradeLabel: `ม.${s.gradelevel.Year}/${s.gradelevel.Number}`,
      roomLabel: s.room?.RoomName ?? undefined,
    });
  }

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
            {teacher.name}
          </p>
          <p className="text-sm text-gray-600">
            ภาควิชา: {teacher.department || "-"}
          </p>
          <p className="text-sm text-gray-600">
            ภาคเรียนที่ {semesterEnum === "SEMESTER_1" ? "1" : "2"}{" "}
            ปีการศึกษา {academicYear}
          </p>
        </div>
      </div>

      {/* Schedule Grid */}
      <TimeslotGrid
        timeslots={timeslots}
        breakDefs={breakDefs}
        view={{ mode: "teacher" }}
        cellsByTimeslotId={cellsByTimeslotId}
        show={{ grade: true, room: true }}
      />

      {/* Print instructions */}
      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
        <p className="font-medium mb-1">หมายเหตุ:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>ใช้ฟังก์ชัน Print ของเบราว์เซอร์เพื่อพิมพ์ตารางนี้</li>
          <li>แนะนำให้ใช้แนวกระดาษแบบ Landscape (แนวนอน)</li>
        </ul>
      </div>
    </div>
  );
}
