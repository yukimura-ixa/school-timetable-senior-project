import { Suspense } from "react";
import type { Metadata } from "next";
import { QuickStatsCards, QuickStatsCardsSkeleton } from "./_components/QuickStats";
import { MiniCharts, MiniChartsSkeleton } from "./_components/MiniCharts";
import { DataTableSection } from "./_components/DataTableSection";
import { CurrentSemesterBadge } from "./_components/CurrentSemesterBadge";
import Link from "next/link";
import { authWithDevBypass as auth } from "@/lib/auth";
import { getQuickStats } from "@/lib/public/stats";

export const metadata: Metadata = {
  title: "ระบบตารางเรียนตารางสอน - หน้าแรก",
  description: "ดูตารางเรียนตารางสอนของครูและนักเรียน สามารถค้นหาและดูข้อมูลครูผู้สอนและชั้นเรียนได้ทันที",
};

// NOTE: Static page - all interactivity handled client-side
// No search params needed, all state managed in DataTableSection

export default async function HomePage() {
  // SECURITY: Extract only non-sensitive user data for client serialization
  // Use IIFE to avoid keeping full session object in scope (RSC serialization issue)
  const userInfo = await (async () => {
    const sessionData = await auth();
    if (!sessionData?.user) return null;
    return {
      name: sessionData.user.name,
      role: sessionData.user.role,
      // email explicitly excluded - PII must not be serialized to client
    };
  })();
  
  // Import data fetching functions
  const { getTeacherCount, getPaginatedTeachers } = await import("@/lib/public/teachers");
  const { getClassCount, getPaginatedClasses } = await import("@/lib/public/classes");
  
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
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-4">
              ระบบตารางเรียนตารางสอน
              </h1>
              {/* Show current semester badge if one is selected */}
              <CurrentSemesterBadge />
            </div>
            {userInfo ? (
              <div className="flex items-center gap-3 mt-1">
                <div className="text-right">
                  <div className="text-sm font-medium text-white">
                    {userInfo.name || "ผู้ใช้งาน"}
                  </div>
                  <div className="text-xs text-blue-100">
                    {userInfo.role === "admin" ? "ผู้ดูแลระบบ" : 
                     userInfo.role === "teacher" ? "ครูผู้สอน" : 
                     "นักเรียน"}
                  </div>
                </div>
                <Link
                  href="/dashboard/select-semester"
                  prefetch={false}
                  data-testid="admin-dashboard-button"
                  className="inline-flex items-center gap-2 rounded-md bg-white/10 px-4 py-2 text-sm font-medium text-white shadow-sm ring-1 ring-white/30 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-700 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  กลับสู่หน้าจัดการ
                </Link>
              </div>
            ) : (
              <Link
                href="/signin"
                prefetch={false}
                data-testid="sign-in-button"
                className="mt-1 inline-flex items-center rounded-md bg-white/10 px-4 py-2 text-sm font-medium text-white shadow-sm ring-1 ring-white/30 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-700"
              >
                Admin Login
              </Link>
            )}
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
          <p>
            © 2024 ระบบตารางเรียนตารางสอน - สร้างด้วย Next.js และ Prisma
          </p>
        </div>
      </footer>
    </main>
  );
}
