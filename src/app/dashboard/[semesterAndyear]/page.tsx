//
import type { Metadata } from "next";
import { dashboardRepository } from "@/features/dashboard/infrastructure/repositories/dashboard.repository";
import {
  calculateTotalScheduledHours,
  calculateCompletionRate,
  countTeachersWithSchedules,
  countClassCompletion,
  calculateTeacherWorkload,
  calculateSubjectDistribution,
  detectConflicts,
} from "@/features/dashboard/domain/services/dashboard-stats.service";
import { getPublishReadiness } from "@/features/config/application/services/publish-readiness-query.service";
import type { semester } from '@/prisma/generated/client';;
import { PublishReadinessCard, ReadinessIssues } from "../../_components/PublishReadiness";

export const metadata: Metadata = {
  title: "Dashboard - ภาพรวมภาคเรียน",
  description: "ภาพรวมข้อมูลตารางเรียนและสถิติของภาคเรียน",
};

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ semesterAndyear: string }>;
}) {
  const { semesterAndyear } = await params;
  
  // Validate and parse semester and year
  const [semester, academicYear] = semesterAndyear.split("-");
  
  if (!semester || !academicYear) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-semibold">ข้อผิดพลาด</h2>
          <p className="text-red-600">รูปแบบข้อมูลภาคเรียนและปีการศึกษาไม่ถูกต้อง</p>
        </div>
      </div>
    );
  }
  
  const year = parseInt(academicYear);
  const semesterEnum = `SEMESTER_${semester}` as semester;

  // Fetch all dashboard data in parallel
  const [dashboardData, readiness] = await Promise.all([
    dashboardRepository.getDashboardData(
      semesterAndyear,
      year,
      semesterEnum
    ),
    getPublishReadiness(semesterAndyear)
  ]);

  const {
    config,
    schedules,
    teachers,
    grades,
    timeslots,
    subjects,
    responsibilities,
  } = dashboardData;

  // Calculate statistics
  const totalScheduledHours = calculateTotalScheduledHours(schedules);
  const completionRate = calculateCompletionRate(
    schedules,
    grades.length,
    timeslots.length
  );
  const { withSchedules, withoutSchedules } = countTeachersWithSchedules(
    schedules,
    teachers
  );
  const classCompletion = countClassCompletion(
    schedules,
    grades,
    timeslots.length
  );
  const conflicts = detectConflicts(schedules);
  const totalConflicts =
    conflicts.teacherConflicts +
    conflicts.classConflicts +
    conflicts.roomConflicts;

  const teacherWorkload = calculateTeacherWorkload(schedules, teachers);
  const subjectDistribution = calculateSubjectDistribution(schedules, subjects);

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard - ภาพรวมภาคเรียน
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            ภาคเรียนที่ {semester}/{year}
          </p>
        </div>
        {config && (
          <div className="rounded-lg bg-blue-50 px-4 py-2">
            <span className="text-sm font-medium text-blue-700">
              สถานะ:{" "}
              {config.status === "DRAFT"
                ? "ร่าง"
                : config.status === "PUBLISHED"
                  ? "เผยแพร่แล้ว"
                  : config.status === "LOCKED"
                    ? "ล็อค"
                    : "เก็บถาวร"}
            </span>
          </div>
        )}
      </div>

      {readiness && readiness.status !== 'ready' && (
        <ReadinessIssues issues={readiness.issues} />
      )}

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="จำนวนครู"
          value={teachers.length}
          subtitle={`สอน: ${withSchedules} | ยังไม่มีตาราง: ${withoutSchedules}`}
          icon="👨‍🏫"
          color="blue"
        />
        <StatCard
          title="จำนวนชั้นเรียน"
          value={grades.length}
          subtitle={`เต็ม: ${classCompletion.full} | บางส่วน: ${classCompletion.partial}`}
          icon="🎓"
          color="green"
        />
        <StatCard
          title="คาบสอนที่จัดแล้ว"
          value={totalScheduledHours}
          subtitle={`จาก ${grades.length * timeslots.length} คาบทั้งหมด`}
          icon="📅"
          color="purple"
        />
        {readiness && <PublishReadinessCard readiness={readiness} />}
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          เมนูด่วน
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <QuickActionButton
            href={`/dashboard/${semesterAndyear}/teacher-table`}
            icon="👨‍🏫"
            label="ตารางสอนครู"
          />
          <QuickActionButton
            href={`/dashboard/${semesterAndyear}/student-table`}
            icon="🎓"
            label="ตารางเรียนนักเรียน"
          />
          <QuickActionButton
            href={`/dashboard/${semesterAndyear}/all-timeslot`}
            icon="⏰"
            label="จัดการคาบเรียน"
          />
          <QuickActionButton
            href={`/dashboard/${semesterAndyear}/all-program`}
            icon="📚"
            label="หลักสูตร"
          />
          <QuickActionButton
            href={`/dashboard/${semesterAndyear}/conflicts`}
            icon="⚠️"
            label="ตรวจสอบความซ้ำซ้อน"
          />
          <QuickActionButton
            href={`/schedule/${semesterAndyear}/lock`}
            icon="🔒"
            label="ล็อกคาบเรียน"
          />
          <QuickActionButton
            href={`/dashboard/${semesterAndyear}/analytics`}
            icon="📊"
            label="วิเคราะห์ข้อมูล"
          />
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Teacher Workload Chart */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            ภาระงานสอน (Top 10 ครู)
          </h2>
          <div className="space-y-3">
            {teacherWorkload.slice(0, 10).map((workload) => (
              <div key={workload.teacherId} className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {workload.teacherName}
                  </p>
                  <p className="text-xs text-gray-500">{workload.department}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {workload.scheduledHours}
                    </p>
                    <p className="text-xs text-gray-500">คาบ</p>
                  </div>
                  <div className="h-2 w-20 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full bg-blue-600"
                      style={{ width: `${Math.min(workload.utilizationRate, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          {teacherWorkload.length === 0 && (
            <p className="text-center text-sm text-gray-500">
              ยังไม่มีข้อมูลตารางสอน
            </p>
          )}
        </div>

        {/* Subject Distribution Chart */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            การกระจายวิชา (Top 10 วิชา)
          </h2>
          <div className="space-y-3">
            {subjectDistribution.slice(0, 10).map((subject) => (
              <div key={subject.subjectCode} className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {subject.subjectName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {subject.subjectCode} • {subject.classCount} ชั้นเรียน
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {subject.totalHours}
                    </p>
                    <p className="text-xs text-gray-500">
                      {subject.percentage}%
                    </p>
                  </div>
                  <div className="h-2 w-20 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full bg-green-600"
                      style={{ width: `${Math.min(subject.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          {subjectDistribution.length === 0 && (
            <p className="text-center text-sm text-gray-500">
              ยังไม่มีข้อมูลตารางเรียน
            </p>
          )}
        </div>
      </div>

      {/* Health Indicators */}
      {(withoutSchedules > 0 ||
        classCompletion.partial > 0 ||
        classCompletion.none > 0 ||
        totalConflicts > 0) && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-yellow-900">
            ⚠️ ประเด็นที่ต้องดำเนินการ
          </h2>
          <div className="space-y-2">
            {withoutSchedules > 0 && (
              <div className="flex items-start gap-2 rounded-lg bg-white p-3">
                <span className="text-lg">👨‍🏫</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    มีครู {withoutSchedules} คน ที่ยังไม่มีตารางสอน
                  </p>
                  <p className="text-xs text-gray-600">
                    ควรจัดตารางให้ครูทุกคนมีภาระงานสอน
                  </p>
                </div>
              </div>
            )}
            {classCompletion.none > 0 && (
              <div className="flex items-start gap-2 rounded-lg bg-white p-3">
                <span className="text-lg">🎓</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    มีชั้นเรียน {classCompletion.none} ชั้น ที่ยังไม่มีตารางเลย
                  </p>
                  <p className="text-xs text-gray-600">
                    ควรเริ่มจัดตารางให้ชั้นเรียนเหล่านี้
                  </p>
                </div>
              </div>
            )}
            {classCompletion.partial > 0 && (
              <div className="flex items-start gap-2 rounded-lg bg-white p-3">
                <span className="text-lg">📋</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    มีชั้นเรียน {classCompletion.partial} ชั้น ที่ตารางยังไม่เต็ม
                  </p>
                  <p className="text-xs text-gray-600">
                    ควรจัดตารางให้ครบทุกคาบเรียน
                  </p>
                </div>
              </div>
            )}
            {totalConflicts > 0 && (
              <div className="flex items-start gap-2 rounded-lg bg-white p-3">
                <span className="text-lg">⚠️</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    พบข้อขัดแย้ง {totalConflicts} รายการ
                  </p>
                  <p className="text-xs text-gray-600">
                    ครู: {conflicts.teacherConflicts} • ชั้นเรียน:{" "}
                    {conflicts.classConflicts} • ห้องเรียน:{" "}
                    {conflicts.roomConflicts}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Summary Info */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          ข้อมูลสรุป
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <InfoItem label="ครูทั้งหมด" value={teachers.length} />
          <InfoItem label="ชั้นเรียน" value={grades.length} />
          <InfoItem label="วิชา" value={subjects.length} />
          <InfoItem label="คาบเรียน" value={timeslots.length} />
          <InfoItem label="ตารางที่จัด" value={schedules.length} />
          <InfoItem label="ความรับผิดชอบ" value={responsibilities.length} />
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({
  title,
  value,
  subtitle,
  icon,
  color,
}: {
  title: string;
  value: number | string;
  subtitle: string;
  icon: string;
  color: "blue" | "green" | "purple" | "red";
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-green-50 text-green-600 border-green-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
    red: "bg-red-50 text-red-600 border-red-200",
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-lg border ${colorClasses[color]}`}
        >
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );
}

// Quick Action Button Component
function QuickActionButton({
  href,
  icon,
  label,
}: {
  href: string;
  icon: string;
  label: string;
}) {
  return (
    <a
      href={href}
      className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-4 transition-colors hover:border-blue-300 hover:bg-blue-50"
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-center text-sm font-medium text-gray-700">
        {label}
      </span>
    </a>
  );
}

// Info Item Component
function InfoItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-xs text-gray-600">{label}</p>
    </div>
  );
}
