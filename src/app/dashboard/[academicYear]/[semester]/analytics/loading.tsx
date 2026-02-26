export default function AnalyticsLoading() {
  return (
    <div className="animate-pulse space-y-6 p-6">
      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 w-full rounded-lg bg-gray-200" />
        ))}
      </div>
      
      {/* Large chart area */}
      <div className="h-64 w-full rounded-lg bg-gray-200" />
      
      {/* Additional charts */}
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-48 w-full rounded-lg bg-gray-200" />
        ))}
      </div>
    </div>
  );
}
