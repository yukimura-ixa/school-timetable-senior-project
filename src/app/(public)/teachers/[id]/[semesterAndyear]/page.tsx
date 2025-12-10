import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import ArrowBack from "@mui/icons-material/ArrowBack";
import { publicDataRepository } from "@/lib/infrastructure/repositories/public-data.repository";
import {
  semester as SemesterEnum,
  type timeslot,
} from "@/prisma/generated/client";
import prisma from "@/lib/prisma";

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
  params: Promise<{ id: string; semesterAndyear: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id, semesterAndyear } = await params;
  const teacherId = parseInt(id, 10);
  if (isNaN(teacherId)) return { title: "ไม่พบข้อมูล" };
  const parsed = parseConfigId(semesterAndyear);
  if (!parsed) return { title: "ไม่พบข้อมูล" };
  const teacher = await publicDataRepository.findPublicTeacherById(
    teacherId,
    parsed.academicYear,
    parsed.semesterEnum,
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
  const { id, semesterAndyear } = await params;
  const teacherId = parseInt(id, 10);
  if (isNaN(teacherId)) notFound();
  const parsed = parseConfigId(semesterAndyear);
  if (!parsed) notFound();
  const { academicYear, semesterEnum } = parsed;

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
  const semesterValue =
    semesterEnum === "SEMESTER_1"
      ? SemesterEnum.SEMESTER_1
      : SemesterEnum.SEMESTER_2;
  const timeslots = await prisma.timeslot.findMany({
    where: {
      AcademicYear: academicYear,
      Semester: semesterValue,
    },
    orderBy: [{ DayOfWeek: "asc" }, { StartTime: "asc" }],
  });

  // Extract slot numbers and create mapping
  const parseSlotNumber = (timeslotId: string): number => {
    const rawNumber = Number.parseInt(timeslotId.substring(10), 10);
    return Number.isNaN(rawNumber) ? 0 : rawNumber;
  };

  const slotNumbers = Array.from(
    new Set<number>(
      timeslots.map((t: timeslot) => parseSlotNumber(t.TimeslotID)),
    ),
  ).sort((a: number, b: number) => a - b);
  const noSlots = slotNumbers.length === 0;
  const displaySlotNumbers = noSlots ? [1] : slotNumbers;

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
    displaySlotNumbers.forEach((slotNum: number) => {
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
            ภาคเรียนที่ {parsed.semesterEnum === "SEMESTER_1" ? "1" : "2"}{" "}
            ปีการศึกษา {parsed.academicYear}
          </p>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table
            className="min-w-full border-collapse"
            data-testid="schedule-grid"
            role="table"
          >
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="border border-gray-300 px-2 py-2 text-sm">
                คาบ/เวลา
              </th>
              {dayOrder.map((day) => (
                <th
                  key={day}
                  className="border border-gray-300 px-2 py-2 text-sm"
                >
                  {dayNames[day]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {noSlots ? (
              <tr>
                <td
                  className="border border-gray-200 px-4 py-6 text-center text-sm text-gray-500"
                  colSpan={dayOrder.length + 1}
                  data-testid="schedule-empty"
                >
                  ไม่มีตารางสอนในภาคเรียนนี้
                </td>
              </tr>
            ) : (
              displaySlotNumbers.map((slotNum: number) => {
                const timeRange = slotTimeRanges.get(slotNum);
                return (
                  <tr key={slotNum} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-2 py-2 text-center text-sm font-medium whitespace-nowrap">
                      คาบ {slotNum}
                      {timeRange && (
                        <div className="text-xs text-gray-500">
                          {timeRange.start} - {timeRange.end}
                        </div>
                      )}
                    </td>
                    {dayOrder.map((day) => {
                      const schedule = gridData[day]!.get(slotNum);
                      return (
                        <td
                          key={day}
                          className="border border-gray-300 px-2 py-2 text-sm align-top"
                        >
                          {schedule ? (
                            <div className="space-y-1">
                              <div className="font-medium text-gray-900">
                                {schedule.subject.SubjectName}
                              </div>
                              <div className="text-xs text-gray-600">
                                ({schedule.subject.SubjectCode})
                              </div>
                              <div className="text-xs text-gray-600">
                                ม.{schedule.gradelevel.Year}/
                                {schedule.gradelevel.Number}
                              </div>
                              {schedule.room && (
                                <div className="text-xs text-gray-500">
                                  ห้อง: {schedule.room.RoomName}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-xs text-gray-400 text-center">
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
