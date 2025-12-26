import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import ArrowBack from "@mui/icons-material/ArrowBack";
import { publicDataRepository } from "@/lib/infrastructure/repositories/public-data.repository";
import type { timeslot, semester } from "@/prisma/generated/client";
import prisma from "@/lib/prisma";
import { PrintButton } from "@/app/(public)/_components/PrintButton";
import { extractPeriodFromTimeslotId } from "@/utils/timeslot-id";

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
  const semesterEnum =
    semNum === 1 ? "SEMESTER_1" : semNum === 2 ? "SEMESTER_2" : null;
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

const dayNames: Record<string, string> = {
  MON: "จันทร์",
  TUE: "อังคาร",
  WED: "พุธ",
  THU: "พฤหัสบดี",
  FRI: "ศุกร์",
};

const dayOrder = ["MON", "TUE", "WED", "THU", "FRI"] as const;

export default async function TeacherScheduleByTermPage({ params }: PageProps) {
  const { id, academicYear: yearStr, semester: semStr } = await params;
  const teacherId = parseInt(id, 10);
  if (isNaN(teacherId)) notFound();
  const academicYear = parseInt(yearStr, 10);
  const semNum = parseInt(semStr, 10);
  const semesterEnum =
    semNum === 1 ? "SEMESTER_1" : semNum === 2 ? "SEMESTER_2" : null;
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

  // Get all timeslots for this term to build grid structure
  // Note: semesterEnum is already typed as "SEMESTER_1" | "SEMESTER_2" from parseConfigId
  const semesterValue: semester = semesterEnum;
  const timeslots = await prisma.timeslot.findMany({
    where: {
      AcademicYear: academicYear,
      Semester: semesterValue,
    },
    orderBy: [{ DayOfWeek: "asc" }, { StartTime: "asc" }],
  });

  // Extract slot numbers and create mapping
  const parseSlotNumber = extractPeriodFromTimeslotId;

  const slotNumbers = Array.from(
    new Set<number>(
      timeslots.map((t: timeslot) => parseSlotNumber(t.TimeslotID)),
    ),
  ).sort((a: number, b: number) => a - b);

  // Build schedule lookup by timeslot ID
  const scheduleLookup = new Map<string, PublicScheduleEntry>();
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
        start: startTime.toLocaleTimeString("th-TH", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        end: endTime.toLocaleTimeString("th-TH", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    }
  });

  // Build grid data: day x slot
  const gridData: Record<string, Map<number, PublicScheduleEntry | null>> = {};
  dayOrder.forEach((day) => {
    gridData[day] = new Map();
    slotNumbers.forEach((slotNum: number) => {
      const timeslotForDaySlot = timeslots.find(
        (t: timeslot) =>
          t.DayOfWeek === day && parseSlotNumber(t.TimeslotID) === slotNum,
      );
      if (timeslotForDaySlot) {
        gridData[day]!.set(
          slotNum,
          scheduleLookup.get(timeslotForDaySlot.TimeslotID) || null,
        );
      } else {
        gridData[day]!.set(slotNum, null);
      }
    });
  });

  return (
    <main className="min-h-screen bg-gray-50 py-4 md:py-8 print:p-0 print:bg-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
        <Link
          href={`/?tab=teachers`}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4 md:mb-6 print:hidden"
        >
          <ArrowBack className="w-5 h-5" />
          กลับไปหน้าแรก
        </Link>

        {/* Teacher Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 mb-4 md:mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {teacher.name}
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            ภาควิชา{teacher.department || "-"}
          </p>
          <p className="text-xs md:text-sm text-gray-500 mt-2">
            ภาคเรียนที่ {semNum} ปีการศึกษา {academicYear}
          </p>
        </div>

        {/* Schedule Table - Desktop */}
        {schedules.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 md:p-12 text-center">
            <p className="text-gray-500 text-base md:text-lg">
              ไม่มีตารางสอนในภาคเรียนนี้
            </p>
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
                      className="border border-gray-300 px-2 md:px-4 py-2 text-xs md:text-sm font-semibold text-white bg-blue-600"
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
                        <div className="text-xs md:text-sm font-semibold text-gray-900">
                          คาบ {slotNum}
                        </div>
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
                                  ม.{schedule.gradelevel.Year}/
                                  {schedule.gradelevel.Number}
                                </div>
                                {schedule.room && (
                                  <div className="text-gray-500 mt-1">
                                    ห้อง {schedule.room.RoomName}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-xs md:text-sm text-gray-400 text-center">
                                -
                              </div>
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
          <PrintButton />
        </div>
      </div>
    </main>
  );
}
