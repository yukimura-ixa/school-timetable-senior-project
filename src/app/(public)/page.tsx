import { Suspense } from "react";
import type { Metadata } from "next";
import {
  QuickStatsCards,
  QuickStatsCardsSkeleton,
} from "./_components/QuickStats";
import { MiniCharts, MiniChartsSkeleton } from "./_components/MiniCharts";
import { DataTableSection } from "./_components/DataTableSection";
import { CurrentSemesterBadge } from "./_components/CurrentSemesterBadge";
import Link from "next/link";
import { getQuickStats } from "@/lib/public/stats";

export const metadata: Metadata = {
  title: "ระบบตารางเรียนตารางสอน - หน้าแรก",
  description:
    "ดูตารางเรียนตารางสอนของครูและนักเรียน สามารถค้นหาและดูข้อมูลครูผู้สอนและชั้นเรียนได้ทันที",
};

// NOTE: Static page - all interactivity handled client-side
// No search params needed, all state managed in DataTableSection

export default async function HomePage() {
  // Import data fetching functions
  const { getTeacherCount, getPaginatedTeachers } = await import(
    "@/lib/public/teachers"
  );
  const { getClassCount, getPaginatedClasses } = await import(
    "@/lib/public/classes"
  );

  // Fetch counts for pagination
  const totalTeachers = await getTeacherCount();
  const totalClasses = await getClassCount();

  // Fetch ALL data for client-side filtering and pagination
  const teachersData = await getPaginatedTeachers({
    page: 1,
    search: "",
    sortBy: "name",
    sortOrder: "asc",
    perPage: totalTeachers, // Fetch all teachers
  });

  const classesData = await getPaginatedClasses({
    page: 1,
    search: "",
    sortBy: "grade",
    sortOrder: "asc",
    perPage: totalClasses, // Fetch all classes
  });

  // Derive current configId (semester-year) for public navigation
  const stats = await getQuickStats();
  let currentConfigId: string | null = null;
  if (stats.currentTerm && stats.currentTerm !== "N/A") {
    const termMatch = stats.currentTerm.match(/ปีการศึกษา (\d+)/);
    const semesterMatch = stats.currentTerm.match(/ภาคเรียนที่ (\d+)/);
    if (termMatch?.[1] && semesterMatch?.[1]) {
      const academicYear = termMatch[1];
      const semesterNumeric = semesterMatch[1];
      currentConfigId = `${semesterNumeric}-${academicYear}`; // e.g. 1-2567
    }
  }

  return (
    // Responsive width layout: container with max-width, centered
    <main className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-14">
        <div className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <div className="@container flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold leading-tight md:text-4xl">
                ระบบตารางเรียนตารางสอน
              </h1>
              <p className="text-lg text-blue-100">
                สร้างและจัดการตารางเรียนตารางสอนสำหรับสถาบันการศึกษา
              </p>
              {/* Show current semester badge if one is selected */}
              <CurrentSemesterBadge />
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/signin"
                prefetch={false}
                data-testid="sign-in-button"
                className="inline-flex items-center justify-center rounded-md bg-white text-blue-800 px-4 py-2 text-sm font-semibold shadow-sm transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-700"
              >
                Admin Login
              </Link>
              <Link
                href="/teachers/1-2567"
                prefetch={false}
                className="inline-flex items-center justify-center rounded-md border border-white/40 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-700"
              >
                ดูตารางสอนตัวอย่าง
              </Link>
            </div>
          </div>
          <p className="text-xl text-blue-100">
            ค้นหาและดูตารางเรียนของครูผู้สอนและชั้นเรียนได้ทันที
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl -mt-8 mb-8">
        <div>
          <Suspense fallback={<QuickStatsCardsSkeleton />}>
            <QuickStatsCards />
          </Suspense>
        </div>
      </section>

      <section className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl mb-12">
        <DataTableSection
          totalTeachers={totalTeachers}
          totalClasses={totalClasses}
          teachersData={teachersData}
          classesData={classesData}
          currentConfigId={currentConfigId || undefined}
        />
      </section>

      <section className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          ภาพรวมการใช้งาน
        </h2>
        <Suspense fallback={<MiniChartsSkeleton />}>
          <MiniCharts />
        </Suspense>
      </section>

      <footer className="bg-white border-t border-gray-200 py-8 mt-12">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl text-center text-gray-600">
          <p>© 2024 ระบบตารางเรียนตารางสอน - สร้างด้วย Next.js และ Prisma</p>
        </div>
      </footer>
    </main>
  );
}
