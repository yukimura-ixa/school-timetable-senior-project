import { Suspense } from "react";
import type { Metadata } from "next";
import { QuickStatsCards, QuickStatsCardsSkeleton } from "./_components/QuickStats";
import { MiniCharts, MiniChartsSkeleton } from "./_components/MiniCharts";
import { DataTableSection } from "./_components/DataTableSection";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ระบบตารางเรียนตารางสอน - หน้าแรก",
  description: "ดูตารางเรียนตารางสอนของครูและนักเรียน สามารถค้นหาและดูข้อมูลครูผู้สอนและชั้นเรียนได้ทันที",
};

// NOTE: Static page - all interactivity handled client-side
// No search params needed, all state managed in DataTableSection

export default async function HomePage() {
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

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-start justify-between">
            <h1 className="text-4xl font-bold mb-4">
            ระบบตารางเรียนตารางสอน
            </h1>
            <Link
              href="/signin"
              prefetch={false}
              className="mt-1 inline-flex items-center rounded-md bg-white/10 px-4 py-2 text-sm font-medium text-white shadow-sm ring-1 ring-white/30 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-700"
            >
              Admin Login
            </Link>
          </div>
          <p className="text-xl text-blue-100">
            ค้นหาและดูตารางเรียนของครูผู้สอนและชั้นเรียนได้ทันที
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 -mt-8 mb-8">
        <Suspense fallback={<QuickStatsCardsSkeleton />}>
          <QuickStatsCards />
        </Suspense>
      </section>

      <section className="container mx-auto px-4 mb-12">
        <DataTableSection
          totalTeachers={totalTeachers}
          totalClasses={totalClasses}
          teachersData={teachersData}
          classesData={classesData}
        />
      </section>

      <section className="container mx-auto px-4 mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          ภาพรวมการใช้งาน
        </h2>
        <Suspense fallback={<MiniChartsSkeleton />}>
          <MiniCharts />
        </Suspense>
      </section>

      <footer className="bg-white border-t border-gray-200 py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>
            © 2024 ระบบตารางเรียนตารางสอน - สร้างด้วย Next.js และ Prisma
          </p>
        </div>
      </footer>
    </main>
  );
}
