export default function ConflictsLoading() {
  return (
    <div className="flex flex-col gap-4 p-6 animate-pulse">
      {/* Summary card */}
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <div className="h-6 w-40 bg-gray-200 rounded mb-3" />
        <div className="flex gap-4">
          <div className="h-8 w-24 bg-gray-100 rounded-full" />
          <div className="h-8 w-24 bg-gray-100 rounded-full" />
          <div className="h-8 w-24 bg-gray-100 rounded-full" />
        </div>
      </div>
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-gray-200 pb-1">
        <div className="h-10 w-28 bg-gray-200 rounded-t" />
        <div className="h-10 w-28 bg-gray-100 rounded-t" />
        <div className="h-10 w-28 bg-gray-100 rounded-t" />
      </div>
      {/* Table skeleton */}
      <div className="space-y-2">
        {/* Header */}
        <div className="grid grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-gray-200 rounded" />
          ))}
        </div>
        {/* Rows */}
        {[1, 2, 3, 4, 5].map((row) => (
          <div key={row} className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((col) => (
              <div key={col} className="h-12 bg-gray-100 rounded" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
