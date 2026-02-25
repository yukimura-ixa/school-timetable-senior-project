/**
 * Skeleton placeholder for timetable grid views (all-timeslot, teacher-table, student-table).
 * Pure Tailwind — no client JS needed. Renders during SSR streaming.
 */
export function TimetableGridSkeleton({
  rows = 8,
  cols = 5,
}: {
  rows?: number;
  cols?: number;
}) {
  const dayHeaders = ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์"];

  return (
    <div className="w-full overflow-x-auto animate-pulse">
      <div className="min-w-[640px]">
        {/* Header row */}
        <div
          className="grid gap-2 mb-2"
          style={{ gridTemplateColumns: `60px repeat(${cols}, 1fr)` }}
        >
          <div className="h-10" /> {/* Period column spacer */}
          {Array.from({ length: cols }, (_, i) => (
            <div
              key={i}
              className="h-10 bg-gray-200 rounded flex items-center justify-center"
            >
              <span className="text-gray-300 text-sm">
                {dayHeaders[i] || ""}
              </span>
            </div>
          ))}
        </div>

        {/* Data rows */}
        {Array.from({ length: rows }, (_, rowIdx) => (
          <div
            key={rowIdx}
            className="grid gap-2 mb-2"
            style={{ gridTemplateColumns: `60px repeat(${cols}, 1fr)` }}
          >
            <div className="h-16 bg-gray-100 rounded flex items-center justify-center">
              <div className="h-4 w-6 bg-gray-200 rounded" />
            </div>
            {Array.from({ length: cols }, (_, colIdx) => (
              <div
                key={colIdx}
                className="h-16 bg-gray-100 rounded border border-gray-200"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
