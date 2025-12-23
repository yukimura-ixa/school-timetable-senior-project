import { Suspense } from "react";
import type { Metadata } from "next";
import {
  QuickStatsCards,
  QuickStatsCardsSkeleton,
} from "./_components/QuickStats";
import { MiniCharts, MiniChartsSkeleton } from "./_components/MiniCharts";
import { DataTableSection } from "./_components/DataTableSection";
import { CurrentSemesterBadge } from "./_components/CurrentSemesterBadge";
import { AnimatedHeroBackground } from "./_components/AnimatedHeroBackground";
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
  const { getTeacherCount, getPaginatedTeachers } =
    await import("@/lib/public/teachers");
  const { getClassCount, getPaginatedClasses } =
    await import("@/lib/public/classes");

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
    <main className="min-h-screen bg-slate-50">
      {/* Premium Hero Section with Animated Background */}
      <section className="relative overflow-hidden min-h-[400px] flex items-center">
        {/* Animated gradient mesh background */}
        <AnimatedHeroBackground />

        {/* Glassmorphism overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/20 via-transparent to-slate-50" />

        {/* Content */}
        <div className="relative z-10 container mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-16">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-6">
              {/* Main heading with gradient text */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
                <span className="bg-gradient-to-r from-white via-blue-100 to-emerald-200 bg-clip-text text-transparent">
                  ระบบตารางเรียน
                </span>
                <br />
                <span className="bg-gradient-to-r from-emerald-300 via-cyan-200 to-blue-200 bg-clip-text text-transparent">
                  ตารางสอน
                </span>
              </h1>
              <p className="text-lg md:text-xl text-slate-300 max-w-xl">
                สร้างและจัดการตารางเรียนตารางสอนสำหรับสถาบันการศึกษา
                ค้นหาและดูตารางเรียนของครูผู้สอนและชั้นเรียนได้ทันที
              </p>
              {/* Current semester badge */}
              <CurrentSemesterBadge />
            </div>

            {/* CTA Buttons with glassmorphism */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/signin"
                prefetch={false}
                data-testid="sign-in-button"
                className="group relative inline-flex items-center justify-center rounded-xl px-8 py-4 text-base font-bold transition-all duration-300 bg-white/95 text-slate-900 shadow-lg shadow-white/20 hover:shadow-xl hover:shadow-white/30 hover:scale-105 hover:-translate-y-1"
              >
                <span className="mr-2">🔐</span>
                Admin Login
              </Link>
              {currentConfigId && (
                <Link
                  href={`/teachers/607/${currentConfigId}`}
                  prefetch={false}
                  className="group relative inline-flex items-center justify-center rounded-xl border-2 border-white/30 backdrop-blur-sm px-8 py-4 text-base font-semibold text-white transition-all duration-300 hover:bg-white/10 hover:border-white/50 hover:scale-105 hover:-translate-y-1"
                >
                  <span className="mr-2">📋</span>
                  ดูตารางสอนตัวอย่าง
                </Link>
              )}
            </div>
          </div>
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
