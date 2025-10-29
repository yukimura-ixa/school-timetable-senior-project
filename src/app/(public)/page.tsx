import { Suspense } from "react";
import type { Metadata } from "next";
import { QuickStatsCards, QuickStatsCardsSkeleton } from "./_components/QuickStats";
import { MiniCharts, MiniChartsSkeleton } from "./_components/MiniCharts";
import { TabNavigation } from "./_components/TabNavigation";
import { TableSearch } from "./_components/TableSearch";
import { PublicTeachersTable, PublicTeachersTableSkeleton } from "./_components/PublicTeachersTable";
import { PublicClassesTable, PublicClassesTableSkeleton } from "./_components/PublicClassesTable";
import { TablePagination } from "./_components/TablePagination";
import { getTeacherCount } from "@/lib/public/teachers";
import { getClassCount } from "@/lib/public/classes";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ระบบตารางเรียนตารางสอน - หน้าแรก",
  description: "ดูตารางเรียนตารางสอนของครูและนักเรียน สามารถค้นหาและดูข้อมูลครูผู้สอนและชั้นเรียนได้ทันที",
};

// Homepage data changes infrequently (per semester), revalidate every 30 days
// NOTE: Temporarily disabling revalidate during build investigation
// export const revalidate = 60 * 60 * 24 * 30; // 30 days

type PageProps = {
  searchParams: Promise<{
    tab?: "teachers" | "classes";
    page?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }>;
};

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const activeTab = params.tab || "teachers";
  const currentPage = parseInt(params.page || "1");
  const search = params.search || "";

  const totalTeachers = await getTeacherCount();
  const totalClasses = await getClassCount();
  
  const totalItems = activeTab === "teachers" ? totalTeachers : totalClasses;
  const totalPages = Math.ceil(totalItems / 25);

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
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          ภาพรวมการใช้งาน
        </h2>
        <Suspense fallback={<MiniChartsSkeleton />}>
          <MiniCharts />
        </Suspense>
      </section>

      <section className="container mx-auto px-4 mb-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 bg-white px-6 py-4">
            <TabNavigation />
          </div>

          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <TableSearch
              initialValue={search}
              placeholder={
                activeTab === "teachers"
                  ? "ค้นหาครู (ชื่อ, ภาควิชา)..."
                  : "ค้นหาชั้นเรียน (เช่น M.1)..."
              }
            />
          </div>

          <div className="px-6 py-4">
            {activeTab === "teachers" ? (
              <Suspense fallback={<PublicTeachersTableSkeleton />}>
                <PublicTeachersTable 
                  searchParams={{
                    page: params.page,
                    search: params.search,
                    sortBy: params.sortBy as "name" | "hours" | "utilization" | undefined,
                    sortOrder: params.sortOrder,
                  }}
                />
              </Suspense>
            ) : (
              <Suspense fallback={<PublicClassesTableSkeleton />}>
                <PublicClassesTable 
                  searchParams={{
                    page: params.page,
                    search: params.search,
                    sortBy: params.sortBy as "grade" | "hours" | "subjects" | undefined,
                    sortOrder: params.sortOrder,
                  }}
                />
              </Suspense>
            )}
          </div>

          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
              />
            </div>
          )}
        </div>
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
