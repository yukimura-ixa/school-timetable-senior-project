import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import ArrowBack from "@mui/icons-material/ArrowBack";
import { semester as SemesterEnum, type timeslot } from '@/prisma/generated/client';;
import prisma from "@/lib/prisma";
import * as classRepository from "@/features/class/infrastructure/repositories/class.repository";

// Utility: Parse configId (e.g. 1-2567) into academicYear + semester enum
function parseConfigId(configId: string): { academicYear: number; semesterEnum: 'SEMESTER_1' | 'SEMESTER_2' } | null {
  const match = /^(1|2)-(\d{4})$/.exec(configId);
  if (!match) return null;
  const [, sem, year] = match;
  const semesterEnum = sem === '1' ? 'SEMESTER_1' : 'SEMESTER_2';
  return { academicYear: parseInt(year!, 10), semesterEnum };
}

type PageProps = {
  params: Promise<{ gradeId: string; semesterAndyear: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { gradeId, semesterAndyear } = await params;
  const parsed = parseConfigId(semesterAndyear);
  if (!parsed) return { title: "ไม่พบข้อมูล" };
  
  const gradeLevel = await prisma.gradelevel.findUnique({
    where: { GradeID: gradeId },
  });
  if (!gradeLevel) return { title: "ไม่พบข้อมูล" };
  
  return {
    title: `ตารางเรียน - ม.${gradeLevel.Year}/${gradeLevel.Number}`,
    description: `ดูตารางเรียนของชั้น ม.${gradeLevel.Year}/${gradeLevel.Number}`,
  };
}

const dayNames: Record<string, string> = {
  MON: "จันทร์",
  TUE: "อังคาร",
  WED: "พุธ",
  THU: "พฤหัสบดี",
  FRI: "ศุกร์",
};

const dayOrder = ["MON", "TUE", "WED", "THU", "FRI"] as const;

export default async function ClassScheduleByTermPage({ params }: PageProps) {
  const { gradeId, semesterAndyear } = await params;
  const parsed = parseConfigId(semesterAndyear);
  if (!parsed) notFound();
  const { academicYear, semesterEnum } = parsed;

  // Fetch grade level info
  const gradeLevel = await prisma.gradelevel.findUnique({
    where: { GradeID: gradeId },
  });
  if (!gradeLevel) notFound();

  // Fetch class schedules for this grade and term
  const semesterValue = semesterEnum === 'SEMESTER_1' ? SemesterEnum.SEMESTER_1 : SemesterEnum.SEMESTER_2;
  const schedules = await classRepository.findByGrade(
    gradeId,
    academicYear,
    semesterValue
  );

  // Get all timeslots for this term to build grid structure
  const timeslots = await prisma.timeslot.findMany({
    where: {
      AcademicYear: academicYear,
      Semester: semesterValue,
    },
    orderBy: [
      { DayOfWeek: 'asc' },
      { StartTime: 'asc' },
    ],
  });

  // Extract slot numbers and create mapping
  const parseSlotNumber = (timeslotId: string): number => {
    const rawNumber = Number.parseInt(timeslotId.substring(10), 10);
    return Number.isNaN(rawNumber) ? 0 : rawNumber;
  };

  const slotNumbers = Array.from(
    new Set<number>(timeslots.map((t: timeslot) => parseSlotNumber(t.TimeslotID)))
  ).sort((a: number, b: number) => a - b);

  // Build schedule lookup by timeslot ID
  const scheduleLookup = new Map<string, typeof schedules[0]>();
  schedules.forEach((s) => {
    scheduleLookup.set(s.timeslot.TimeslotID, s);
  });

  // Build time range for each slot number
  const slotTimeRanges = new Map<number, { start: string; end: string }>();
  timeslots.forEach((t: timeslot) => {
    const slotNum = parseSlotNumber(t.TimeslotID);
    if (!slotTimeRanges.has(slotNum)) {
      const startTime = new Date(t.StartTime);
      const endTime = new Date(t.EndTime);
      slotTimeRanges.set(slotNum, {
        start: startTime.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }),
        end: endTime.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }),
      });
    }
  });

  // Build grid data: day x slot
  const gridData: Record<string, Map<number, typeof schedules[0] | null>> = {};
  dayOrder.forEach((day) => {
    gridData[day] = new Map();
    slotNumbers.forEach((slotNum: number) => {
      const timeslotForDaySlot = timeslots.find(
        (t: timeslot) => t.DayOfWeek === day && parseSlotNumber(t.TimeslotID) === slotNum
      );
      if (timeslotForDaySlot) {
        gridData[day]!.set(slotNum, scheduleLookup.get(timeslotForDaySlot.TimeslotID) || null);
      } else {
        gridData[day]!.set(slotNum, null);
      }
    });
  });

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
            ตารางเรียน <span data-testid="class-name">ม.{gradeLevel.Year}/{gradeLevel.Number}</span>
          </h1>
          <p className="text-xs md:text-sm text-gray-500 mt-2">
            ภาคเรียนที่ {semesterAndyear.split('-')[0]} ปีการศึกษา {semesterAndyear.split('-')[1]}
          </p>
        </div>

        {/* Schedule Table */}
        {schedules.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 md:p-12 text-center">
            <p className="text-gray-500 text-base md:text-lg">ไม่มีตารางเรียนในภาคเรียนนี้</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto print:shadow-none">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-2 md:px-4 py-2 text-xs md:text-sm font-semibold text-gray-700 w-20 md:w-24">
                    คาบ/วัน
                  </th>
                  {dayOrder.map((day) => (
                    <th
                      key={day}
                      className="border border-gray-300 px-2 md:px-4 py-2 text-xs md:text-sm font-semibold text-white bg-green-600"
                    >
                      {dayNames[day]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {slotNumbers.map((slotNum: number) => {
                  const timeRange = slotTimeRanges.get(slotNum);
                  return (
                    <tr key={slotNum} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-2 md:px-3 py-2 text-center bg-gray-50">
                        <div className="text-xs md:text-sm font-semibold text-gray-900">คาบ {slotNum}</div>
                        {timeRange && (
                          <div className="text-[10px] md:text-xs text-gray-600 mt-1">
                            {timeRange.start}-{timeRange.end}
                          </div>
                        )}
                      </td>
                      {dayOrder.map((day) => {
                        const schedule = gridData[day]!.get(slotNum);
                        return (
                          <td
                            key={`${day}-${slotNum}`}
                            className="border border-gray-300 px-2 md:px-3 py-2 align-top"
                          >
                            {schedule ? (
                              <div className="text-xs md:text-sm">
                                <div className="font-semibold text-gray-900 mb-1">
                                  {schedule.subject.SubjectName}
                                </div>
                                <div className="text-gray-600">
                                  {schedule.subject.SubjectCode}
                                </div>
                                {schedule.room && (
                                  <div className="text-gray-500 mt-1">ห้อง {schedule.room.RoomName}</div>
                                )}
                                {schedule.teachers_responsibility.length > 0 && (
                                  <div className="text-gray-500 mt-1 text-[10px] md:text-xs">
                                    {schedule.teachers_responsibility.map((tr) => `${tr.teacher.Prefix}${tr.teacher.Firstname} ${tr.teacher.Lastname}`).join(', ')}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-xs md:text-sm text-gray-400 text-center">-</div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Print Button */}
        <div className="mt-4 md:mt-6 flex justify-center print:hidden">
          <button
            onClick={() => window.print()}
            className="bg-green-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg hover:bg-green-700 transition-colors font-medium text-sm md:text-base"
          >
            พิมพ์ตารางเรียน
          </button>
        </div>
      </div>
    </main>
  );
}
