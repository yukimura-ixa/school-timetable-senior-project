export default function AllProgramLoading() {
  return (
    <div className="animate-pulse space-y-4 p-6">
      {/* Title bar */}
      <div className="h-10 w-64 rounded bg-gray-200" />
      
      {/* Table skeleton */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        {/* Table header */}
        <div className="grid grid-cols-4 gap-4 border-b bg-gray-100 p-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-6 rounded bg-gray-200" />
          ))}
        </div>
        
        {/* Table rows */}
        {Array.from({ length: 5 }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid grid-cols-4 gap-4 border-b p-4"
          >
            {Array.from({ length: 4 }).map((_, colIndex) => (
              <div key={colIndex} className="h-6 rounded bg-gray-200" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
