import type { Metadata } from "next";
import { Suspense } from "react";
import { dashboardRepository } from "@/features/dashboard/infrastructure/repositories/dashboard.repository";
import {
  calculateTotalScheduledHours,
  countTeachersWithSchedules,
  countClassCompletion,
  calculateTeacherWorkload,
  calculateSubjectDistribution,
  detectConflicts,
} from "@/features/dashboard/domain/services/dashboard-stats.service";
import { getPublishReadiness } from "@/features/config/application/services/publish-readiness-query.service";
import type { semester } from "@/prisma/generated/client";
import {
  PublishReadinessCard,
  ReadinessIssues,
} from "../../_components/PublishReadiness";
import TeacherWorkloadChart from "../../_components/TeacherWorkloadChart";
import SubjectDistributionChart from "../../_components/SubjectDistributionChart";

export const metadata: Metadata = {
  title: "Dashboard - ภาพรวมภาคเรียน",
  description: "ภาพรวมข้อมูลตารางเรียนและสถิติของภาคเรียน",
};

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ academicYear: string; semester: string }>;
}) {
  const { academicYear: yearStr, semester: semStr } = await params;

  const year = parseInt(yearStr, 10);
  const semester = parseInt(semStr, 10) as 1 | 2;
  const semesterAndyear = `${semester}-${year}`;

  // Validate that year is a valid number
  if (isNaN(year) || year < 2500 || year > 2600) {
    return (
      <div className="p-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <h2 className="text-red-800 font-semibold">ข้อผิดพลาด</h2>
          <p className="text-red-600">ปีการศึกษาไม่ถูกต้อง ({yearStr})</p>
          <p className="mt-2 text-sm text-red-500">
            กรุณาเลือกภาคเรียนจากหน้าหลัก
          </p>
        </div>
      </div>
    );
  }

  // Validate semester
  if (semester !== 1 && semester !== 2) {
    return (
      <div className="p-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <h2 className="text-red-800 font-semibold">ข้อผิดพลาด</h2>
          <p className="text-red-600">ภาคเรียนไม่ถูกต้อง ({semStr})</p>
        </div>
      </div>
    );
  }

  const semesterEnum = `SEMESTER_${semester}` as semester;

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header - loads immediately */}
      <Suspense fallback={<HeaderSkeleton />}>
        <DashboardHeader
          semester={semester}
          year={year}
          semesterAndyear={semesterAndyear}
        />
      </Suspense>

      {/* Readiness Issues - loads independently */}
      <Suspense fallback={null}>
        <ReadinessSection semesterAndyear={semesterAndyear} />
      </Suspense>

      {/* Quick Stats - loads independently */}
      <Suspense fallback={<StatsSkeleton />}>
        <QuickStats
          semesterAndyear={semesterAndyear}
          year={year}
          semesterEnum={semesterEnum}
        />
      </Suspense>

      {/* Quick Actions - renders immediately (no data needed) */}
      <QuickActions year={year} semester={semester} />

      {/* Charts - loads independently */}
      <Suspense fallback={<ChartsSkeleton />}>
        <ChartsSection year={year} semesterEnum={semesterEnum} />
      </Suspense>

      {/* Health Indicators - loads independently */}
      <Suspense fallback={null}>
        <HealthIndicators
          semesterAndyear={semesterAndyear}
          year={year}
          semesterEnum={semesterEnum}
        />
      </Suspense>

      {/* Summary Info - loads independently */}
      <Suspense fallback={<SummarySkeleton />}>
        <SummaryInfo
          semesterAndyear={semesterAndyear}
          year={year}
          semesterEnum={semesterEnum}
        />
      </Suspense>
    </div>
  );
}

// Loading Skeletons
function HeaderSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-8 w-64 bg-gray-200 rounded" />
      <div className="h-4 w-32 bg-gray-200 rounded mt-2" />
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm animate-pulse"
        >
          <div className="h-4 w-20 bg-gray-200 rounded" />
          <div className="h-8 w-16 bg-gray-200 rounded mt-2" />
          <div className="h-3 w-32 bg-gray-200 rounded mt-1" />
        </div>
      ))}
    </div>
  );
}

function ChartsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm animate-pulse"
        >
          <div className="h-6 w-40 bg-gray-200 rounded mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((j) => (
              <div key={j} className="h-12 bg-gray-100 rounded" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function SummarySkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm animate-pulse">
      <div className="h-6 w-32 bg-gray-200 rounded mb-4" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="text-center">
            <div className="h-8 w-12 bg-gray-200 rounded mx-auto" />
            <div className="h-3 w-16 bg-gray-200 rounded mx-auto mt-2" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Server Component sections loaded with Suspense
async function DashboardHeader({
  semester,
  year,
  semesterAndyear,
}: {
  semester: number;
  year: number;
  semesterAndyear: string;
}) {
  // Fetch only config for status
  const config = await dashboardRepository.getConfig(semesterAndyear);

  return (
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
  );
}

async function ReadinessSection({
  semesterAndyear,
}: {
  semesterAndyear: string;
}) {
  const readiness = await getPublishReadiness(semesterAndyear);

  if (!readiness || readiness.status === "ready") return null;

  return <ReadinessIssues issues={readiness.issues} />;
}

async function QuickStats({
  semesterAndyear,
  year,
  semesterEnum,
}: {
  semesterAndyear: string;
  year: number;
  semesterEnum: semester;
}) {
  const [schedules, grades, quickStats, readiness] = await Promise.all([
    dashboardRepository.getScheduleStatsData(year, semesterEnum),
    dashboardRepository.getGradesBasic(),
    dashboardRepository.getQuickStats(semesterAndyear, year, semesterEnum),
    getPublishReadiness(semesterAndyear),
  ]);

  const totalScheduledHours = calculateTotalScheduledHours(schedules);
  const { withSchedules, withoutSchedules } = countTeachersWithSchedules(
    schedules,
    quickStats.teacherCount,
  );
  const classCompletion = countClassCompletion(
    schedules,
    grades,
    quickStats.timeslotCount,
  );

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="จำนวนครู"
        value={quickStats.teacherCount}
        subtitle={`สอน: ${withSchedules} | ยังไม่มีตาราง: ${withoutSchedules}`}
        icon="👨‍🏫"
        color="blue"
      />
      <StatCard
        title="จำนวนชั้นเรียน"
        value={quickStats.gradeCount}
        subtitle={`เต็ม: ${classCompletion.full} | บางส่วน: ${classCompletion.partial}`}
        icon="🎓"
        color="green"
      />
      <StatCard
        title="คาบสอนที่จัดแล้ว"
        value={totalScheduledHours}
        subtitle={`จาก ${quickStats.gradeCount * quickStats.timeslotCount} คาบทั้งหมด`}
        icon="📅"
        color="purple"
      />
      {readiness && <PublishReadinessCard readiness={readiness} />}
    </div>
  );
}

function QuickActions({
  year,
  semester,
}: {
  year: number;
  semester: number;
}) {
  const basePath = `/dashboard/${year}/${semester}`;
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">เมนูด่วน</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <QuickActionButton
          href={`${basePath}/teacher-table`}
          icon="👨‍🏫"
          label="ตารางสอนครู"
        />
        <QuickActionButton
          href={`${basePath}/student-table`}
          icon="🎓"
          label="ตารางเรียนนักเรียน"
        />
        <QuickActionButton
          href={`${basePath}/all-timeslot`}
          icon="⏰"
          label="จัดการคาบเรียน"
        />
        <QuickActionButton
          href={`${basePath}/all-program`}
          icon="📚"
          label="หลักสูตร"
        />
        <QuickActionButton
          href={`${basePath}/conflicts`}
          icon="⚠️"
          label="ตรวจสอบความซ้ำซ้อน"
        />
        <QuickActionButton
          href={`/schedule/${year}/${semester}/lock`}
          icon="🔒"
          label="ล็อกคาบเรียน"
        />
        <QuickActionButton
          href={`${basePath}/analytics`}
          icon="📊"
          label="วิเคราะห์ข้อมูล"
        />
      </div>
    </div>
  );
}

async function ChartsSection({
  year,
  semesterEnum,
}: {
  year: number;
  semesterEnum: semester;
}) {
  const [schedules, teachers, subjects] = await Promise.all([
    dashboardRepository.getScheduleStatsData(year, semesterEnum),
    dashboardRepository.getTeachersBasic(),
    dashboardRepository.getSubjectsBasic(),
  ]);
  const teacherWorkload = calculateTeacherWorkload(schedules, teachers);
  const subjectDistribution = calculateSubjectDistribution(schedules, subjects);
  const topTeacherWorkload = teacherWorkload.slice(0, 10);
  const topSubjectDistribution = subjectDistribution.slice(0, 10);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <TeacherWorkloadChart workload={topTeacherWorkload} />
      <SubjectDistributionChart distribution={topSubjectDistribution} />
    </div>
  );
}

async function HealthIndicators({
  semesterAndyear,
  year,
  semesterEnum,
}: {
  semesterAndyear: string;
  year: number;
  semesterEnum: semester;
}) {
  const [schedules, grades, quickStats] = await Promise.all([
    dashboardRepository.getScheduleStatsData(year, semesterEnum),
    dashboardRepository.getGradesBasic(),
    dashboardRepository.getQuickStats(semesterAndyear, year, semesterEnum),
  ]);
  const { withoutSchedules } = countTeachersWithSchedules(
    schedules,
    quickStats.teacherCount,
  );
  const classCompletion = countClassCompletion(
    schedules,
    grades,
    quickStats.timeslotCount,
  );
  const conflicts = detectConflicts(schedules);
  const totalConflicts =
    conflicts.teacherConflicts +
    conflicts.classConflicts +
    conflicts.roomConflicts;

  // Only show if there are issues
  if (
    withoutSchedules === 0 &&
    classCompletion.partial === 0 &&
    classCompletion.none === 0 &&
    totalConflicts === 0
  ) {
    return null;
  }

  return (
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
  );
}

async function SummaryInfo({
  semesterAndyear,
  year,
  semesterEnum,
}: {
  semesterAndyear: string;
  year: number;
  semesterEnum: semester;
}) {
  const quickStats = await dashboardRepository.getQuickStats(
    semesterAndyear,
    year,
    semesterEnum,
  );

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">ข้อมูลสรุป</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <InfoItem label="ครูทั้งหมด" value={quickStats.teacherCount} />
        <InfoItem label="ชั้นเรียน" value={quickStats.gradeCount} />
        <InfoItem label="วิชา" value={quickStats.subjectCount} />
        <InfoItem label="คาบเรียน" value={quickStats.timeslotCount} />
        <InfoItem label="ตารางที่จัด" value={quickStats.scheduleCount} />
        <InfoItem
          label="ความรับผิดชอบ"
          value={quickStats.responsibilityCount}
        />
      </div>
    </div>
  );
}

// Reusable components
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

function InfoItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-xs text-gray-600">{label}</p>
    </div>
  );
}
