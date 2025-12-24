import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ArrowBack from "@mui/icons-material/ArrowBack";
import { Suspense } from "react";
import {
  getPublicTeacherById,
  getTeacherSchedule,
} from "@/lib/public/teachers";
import { PrintButton } from "../../_components/PrintButton";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const teacherId = parseInt(id);

  if (isNaN(teacherId)) {
    return { title: "ไม่พบข้อมูล" };
  }

  const teacher = await getPublicTeacherById(teacherId);

  if (!teacher) {
    return { title: "ไม่พบข้อมูล" };
  }

  return {
    title: `ตารางสอน - ${teacher.name}`,
    description: `ดูตารางสอนของ${teacher.name} ภาควิชา${teacher.department}`,
  };
}

export default async function TeacherSchedulePage({ params }: PageProps) {
  const { id } = await params;
  const teacherId = parseInt(id);

  if (isNaN(teacherId)) {
    notFound();
  }

  return (
    <Suspense fallback={<TeacherScheduleFallback />}>
      <TeacherScheduleContent teacherId={teacherId} />
    </Suspense>
  );
}

type TeacherScheduleContentProps = {
  teacherId: number;
};

type TeacherSchedule = Awaited<ReturnType<typeof getTeacherSchedule>>[number];

async function TeacherScheduleContent({
  teacherId,
}: TeacherScheduleContentProps) {
  const [teacher, schedules] = await Promise.all([
    getPublicTeacherById(teacherId),
    getTeacherSchedule(teacherId),
  ]);

  if (!teacher) {
    notFound();
  }

  const dayNames: Record<string, string> = {
    MON: "จันทร์",
    TUE: "อังคาร",
    WED: "พุธ",
    THU: "พฤหัสบดี",
    FRI: "ศุกร์",
  };

  const schedulesByDay = schedules.reduce(
    (acc, schedule) => {
      const day = schedule.timeslot.DayOfWeek;
      if (!acc[day]) acc[day] = [];
      acc[day].push(schedule);
      return acc;
    },
    {} as Record<string, typeof schedules>,
  );

  const flatSchedules = schedules
    .map((s) => ({
      ...s,
      start: new Date(s.timeslot.StartTime),
      end: new Date(s.timeslot.EndTime),
    }))
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  return (
    <main className="min-h-screen bg-gray-50 py-8 print:p-0 print:bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Back Link */}
        <Link
          href="/?tab=teachers"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 print:hidden"
        >
          <ArrowBack className="w-5 h-5" />
          กลับไปหน้าแรก
        </Link>

        {/* Teacher Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {teacher.name}
          </h1>
          <p className="text-gray-600">ภาควิชา{teacher.department}</p>
        </div>

        {/* Schedule Table (visible, satisfies grid assertion even when empty) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto mb-6">
          <table
            className="min-w-full border-collapse"
            data-testid="schedule-grid"
            role="table"
          >
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="border border-gray-300 px-3 py-2 text-sm">
                  วัน
                </th>
                <th className="border border-gray-300 px-3 py-2 text-sm">
                  เวลา
                </th>
                <th className="border border-gray-300 px-3 py-2 text-sm">
                  วิชา
                </th>
                <th className="border border-gray-300 px-3 py-2 text-sm">
                  ชั้นเรียน
                </th>
                <th className="border border-gray-300 px-3 py-2 text-sm">
                  ห้อง
                </th>
              </tr>
            </thead>
            <tbody>
              {flatSchedules.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="border border-gray-200 px-4 py-6 text-center text-gray-500"
                    data-testid="schedule-empty"
                  >
                    ไม่มีตารางสอนในภาคเรียนนี้
                  </td>
                </tr>
              ) : (
                flatSchedules.map((schedule) => (
                  <tr key={schedule.ClassID} className="hover:bg-gray-50">
                    <td className="border border-gray-200 px-3 py-2 text-sm">
                      {dayNames[schedule.timeslot.DayOfWeek] ??
                        schedule.timeslot.DayOfWeek}
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-sm">
                      {schedule.start.toLocaleTimeString("th-TH", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      -{" "}
                      {schedule.end.toLocaleTimeString("th-TH", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-sm">
                      {schedule.subject.SubjectName}
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-sm">
                      ม.{schedule.gradelevel.Year}/{schedule.gradelevel.Number}
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-sm">
                      {schedule.room?.RoomName ?? "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Existing per-day cards for readability */}
        {schedules.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-500 text-lg">ไม่มีตารางสอนในภาคเรียนนี้</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 print:break-inside-avoid">
            {(["MON", "TUE", "WED", "THU", "FRI"] as const).map((day) => (
              <div
                key={day}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden print:shadow-none"
              >
                <div className="bg-blue-600 text-white px-4 py-3 font-semibold text-center print:bg-blue-600 print:text-white">
                  {dayNames[day]}
                </div>
                <div className="p-2 space-y-2">
                  {schedulesByDay[day]?.map((schedule: TeacherSchedule) => {
                    const startTime = new Date(schedule.timeslot.StartTime);
                    const endTime = new Date(schedule.timeslot.EndTime);

                    return (
                      <div
                        key={schedule.ClassID}
                        className="border border-gray-200 rounded p-3 hover:shadow-md transition-shadow"
                      >
                        <div className="text-xs text-gray-600 mb-1">
                          {startTime.toLocaleTimeString("th-TH", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          -{" "}
                          {endTime.toLocaleTimeString("th-TH", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        <div className="font-semibold text-sm text-gray-900 mb-1">
                          {schedule.subject.SubjectName}
                        </div>
                        <div className="text-xs text-gray-600">
                          ม.{schedule.gradelevel.Year}/
                          {schedule.gradelevel.Number}
                        </div>
                        {schedule.room && (
                          <div className="text-xs text-gray-600 mt-1">
                            ห้อง: {schedule.room.RoomName}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {!schedulesByDay[day] && (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      ไม่มีคาบสอน
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Print Button */}
        <div className="mt-6 flex justify-center print:hidden">
          <PrintButton />
        </div>
      </div>
    </main>
  );
}

function TeacherScheduleFallback() {
  return (
    <main className="min-h-screen bg-gray-50 py-8 print:p-0 print:bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="h-6 w-48 rounded bg-gray-200 animate-pulse" />
          <div className="mt-3 h-4 w-64 rounded bg-gray-200 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 print:break-inside-avoid">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden print:shadow-none"
            >
              <div className="h-8 bg-gray-200 animate-pulse" />
              <div className="p-2 space-y-3">
                {Array.from({ length: 3 }).map((__, slotIndex) => (
                  <div
                    key={slotIndex}
                    className="h-12 rounded border border-dashed border-gray-200 bg-gray-50"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}


