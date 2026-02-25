import { TimetableGridSkeleton } from "@/components/feedback/TimetableGridSkeleton";

export default function StudentTableLoading() {
  return (
    <div className="flex flex-col gap-4 p-6 animate-pulse">
      {/* Grade/classroom selector */}
      <div className="flex gap-3">
        <div className="h-14 w-48 bg-gray-200 rounded" />
        <div className="h-14 w-48 bg-gray-200 rounded" />
      </div>
      {/* Timetable grid */}
      <TimetableGridSkeleton rows={8} cols={5} />
      {/* Export buttons */}
      <div className="flex gap-3">
        <div className="h-10 w-36 bg-gray-200 rounded" />
        <div className="h-10 w-36 bg-gray-200 rounded" />
      </div>
    </div>
  );
}
