export default function AssignLoading() {
  return (
    <div className="flex h-full gap-4">
      {/* Sidebar skeleton */}
      <div className="h-full w-80 animate-pulse rounded-lg bg-gray-200" />
      
      {/* Timetable grid skeleton */}
      <div className="flex-1 animate-pulse space-y-4">
        <div className="h-10 w-full rounded bg-gray-200" />
        <div className="grid grid-cols-6 gap-2">
          {Array.from({ length: 48 }).map((_, i) => (
            <div key={i} className="h-20 rounded bg-gray-200" />
          ))}
        </div>
      </div>
    </div>
  );
}
