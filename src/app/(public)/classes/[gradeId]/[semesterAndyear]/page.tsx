import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import ArrowBack from "@mui/icons-material/ArrowBack";
import type { timeslot, semester } from "@/prisma/generated/client";
import { PrintButton } from "@/app/(public)/_components/PrintButton";
import prisma from "@/lib/prisma";
import * as classRepository from "@/features/class/infrastructure/repositories/class.repository";
import { extractPeriodFromTimeslotId } from "@/utils/timeslot-id";

// Utility: Parse configId (e.g. 1-2567) into academicYear + semester enum
function parseConfigId(
  configId: string,
): { academicYear: number; semesterEnum: "SEMESTER_1" | "SEMESTER_2" } | null {
  const match = /^(1|2)-(\d{4})$/.exec(configId);
  if (!match) return null;
  const [, sem, year] = match;
  const semesterEnum = sem === "1" ? "SEMESTER_1" : "SEMESTER_2";
  return { academicYear: parseInt(year!, 10), semesterEnum };
}

type PageProps = {
  params: Promise<{ gradeId: string; semesterAndyear: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { gradeId, semesterAndyear } = await params;
  const parsed = parseConfigId(semesterAndyear);
  if (!parsed) return { title: "ไม่พบข้อมูล" };

  // Support both GradeID (M1-1) format
  const gradeLevel = await prisma.gradelevel.findFirst({
    where: {
      GradeID: gradeId,
    },
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

  // Fetch grade level info - support both GradeID (M1-1) and numeric (101) formats
  let gradeLevel = await prisma.gradelevel.findFirst({
    where: {
      GradeID: gradeId,
    },
  });

  // If not found, try converting numeric ID to GradeID format
  if (!gradeLevel && /^\d{3}$/.test(gradeId)) {
    // Convert numeric format (e.g., "101") to GradeID (e.g., "M1-1")
    const year = Math.floor(parseInt(gradeId, 10) / 100);
    const section = parseInt(gradeId, 10) % 100;
    const convertedGradeId = `M${year}-${section}`;

    gradeLevel = await prisma.gradelevel.findFirst({
      where: {
        GradeID: convertedGradeId,
      },
    });
  }

  if (!gradeLevel) notFound();

  // Fetch class schedules for this grade and term
  // Note: semesterEnum is already typed as "SEMESTER_1" | "SEMESTER_2" from parseConfigId
  const semesterValue: semester = semesterEnum;
  const schedules = await classRepository.findByGrade(
    gradeLevel.GradeID,
    academicYear,
    semesterValue,
  );

  // Get all timeslots for this term to build grid structure
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
  const scheduleLookup = new Map<string, (typeof schedules)[0]>();
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
          timeZone: "Asia/Bangkok",
        }),
        end: endTime.toLocaleTimeString("th-TH", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Asia/Bangkok",
        }),
      });
    }
  });

  // Build grid data: day x slot
  const gridData: Record<
    string,
    Map<number, (typeof schedules)[0] | null>
  > = {};
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
            ภาคเรียนที่ {semesterAndyear.split("-")[0]} ปีการศึกษา{" "}
            {semesterAndyear.split("-")[1]}
          </p>
        </div>

        {/* Schedule Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 print:shadow-none">
          <div className="overflow-x-auto">
            <table
              className="min-w-full border-collapse"
              data-testid="schedule-grid"
              role="table"
            >
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
                {slotNumbers.length === 0 ? (
                  <tr>
                    <td
                      className="border border-gray-200 px-4 py-6 text-center text-sm md:text-base text-gray-500"
                      colSpan={dayOrder.length + 1}
                      data-testid="schedule-empty"
                    >
                      ไม่มีตารางเรียนในภาคเรียนนี้
                    </td>
                  </tr>
                ) : (
                  slotNumbers.map((slotNum: number) => {
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
                                    {schedule.subject.SubjectCode}
                                  </div>
                                  {schedule.room && (
                                    <div className="text-gray-500 mt-1">
                                      ห้อง {schedule.room.RoomName}
                                    </div>
                                  )}
                                  {schedule.teachers_responsibility.length >
                                    0 && (
                                    <div className="text-gray-500 mt-1 text-[10px] md:text-xs">
                                      {schedule.teachers_responsibility
                                        .map(
                                          (tr) =>
                                            `${tr.teacher.Prefix}${tr.teacher.Firstname} ${tr.teacher.Lastname}`,
                                        )
                                        .join(", ")}
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
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Print Button */}
        <div className="mt-4 md:mt-6 flex justify-center print:hidden">
          <PrintButton />
        </div>
      </div>
    </main>
  );
}
