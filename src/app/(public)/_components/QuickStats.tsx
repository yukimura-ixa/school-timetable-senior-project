/**
 * Quick Stats Cards - Server Component
 * Fetches data and passes to client component for animated rendering
 */

import { getQuickStats } from "@/lib/public/stats";
import { QuickStatsCardsClient } from "./QuickStatsClient";

export async function QuickStatsCards() {
  const stats = await getQuickStats();

  return <QuickStatsCardsClient stats={stats} />;
}

/**
 * Loading skeleton for stats cards
 */
export function QuickStatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 md:p-8 animate-pulse"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="h-3 sm:h-4 bg-gray-200 rounded w-16 sm:w-20 mb-2 sm:mb-3"></div>
              <div className="h-6 sm:h-8 bg-gray-300 rounded w-12 sm:w-16"></div>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      ))}
      <div className="col-span-2 md:col-span-3 bg-gray-200 rounded-lg p-4 sm:p-6 animate-pulse">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <div className="h-3 sm:h-4 bg-gray-300 rounded w-24 sm:w-32 mb-2"></div>
            <div className="h-5 sm:h-6 bg-gray-400 rounded w-36 sm:w-48"></div>
          </div>
          <div>
            <div className="h-3 sm:h-4 bg-gray-300 rounded w-20 sm:w-24 mb-2"></div>
            <div className="h-4 sm:h-5 bg-gray-400 rounded w-32 sm:w-40"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
