export default function TeacherAssignmentLoading() {
  return (
    <div className="animate-pulse space-y-4 p-6">
      {/* Grade selector */}
      <div className="h-14 w-full max-w-xs rounded bg-gray-200" />
      
      {/* Table skeleton */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        {/* Table header */}
        <div className="grid grid-cols-5 gap-4 border-b bg-gray-100 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-6 rounded bg-gray-200" />
          ))}
        </div>
        
        {/* Table rows */}
        {Array.from({ length: 6 }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid grid-cols-5 gap-4 border-b p-4"
          >
            {Array.from({ length: 5 }).map((_, colIndex) => (
              <div key={colIndex} className="h-6 rounded bg-gray-200" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
