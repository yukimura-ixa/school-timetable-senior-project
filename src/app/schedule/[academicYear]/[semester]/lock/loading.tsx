export default function LockScheduleLoading() {
  return (
    <div className="flex flex-col gap-4 p-6 animate-pulse">
      {/* Title + toggle */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-56 bg-gray-200 rounded" />
        <div className="flex gap-2">
          <div className="h-9 w-20 bg-gray-200 rounded" />
          <div className="h-9 w-20 bg-gray-200 rounded" />
        </div>
      </div>
      {/* 2x2 card grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="h-5 w-24 bg-gray-200 rounded mb-3" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-100 rounded" />
              <div className="h-4 w-3/4 bg-gray-100 rounded" />
              <div className="h-4 w-1/2 bg-gray-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
