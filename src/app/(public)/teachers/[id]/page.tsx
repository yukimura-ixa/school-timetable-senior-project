import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowBack } from "@mui/icons-material";
import { getPublicTeacherById, getTeacherSchedule } from "@/lib/public/teachers";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
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

  const [teacher, schedules] = await Promise.all([
    getPublicTeacherById(teacherId),
    getTeacherSchedule(teacherId),
  ]);

  if (!teacher) {
    notFound();
  }

  // Group schedules by day
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
    {} as Record<string, typeof schedules>
  );

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Back Link */}
        <Link
          href="/?tab=teachers"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
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

        {/* Schedule Grid */}
        {schedules.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-500 text-lg">ไม่มีตารางสอนในภาคเรียนนี้</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {(["MON", "TUE", "WED", "THU", "FRI"] as const).map((day) => (
              <div key={day} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-blue-600 text-white px-4 py-3 font-semibold text-center">
                  {dayNames[day]}
                </div>
                <div className="p-2 space-y-2">
                  {schedulesByDay[day]?.map((schedule) => {
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
                          ม.{schedule.gradelevel.Year}/{schedule.gradelevel.Number}
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
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => window.print()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            พิมพ์ตารางสอน
          </button>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          
          main {
            padding: 0 !important;
          }
          
          a, button {
            display: none !important;
          }
          
          .grid {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </main>
  );
}
