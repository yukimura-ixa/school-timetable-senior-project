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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-20 mb-3"></div>
              <div className="h-8 bg-gray-300 rounded w-16"></div>
            </div>
            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      ))}
      <div className="bg-gray-200 rounded-lg p-6 md:col-span-2 lg:col-span-3 animate-pulse">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
            <div className="h-6 bg-gray-400 rounded w-48"></div>
          </div>
          <div>
            <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
            <div className="h-5 bg-gray-400 rounded w-40"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
