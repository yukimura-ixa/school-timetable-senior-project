import { TimetableGridSkeleton } from "@/components/feedback/TimetableGridSkeleton";

export default function AllTimeslotLoading() {
  return (
    <div className="flex flex-col gap-4 p-6 animate-pulse">
      {/* Title */}
      <div className="h-8 w-48 bg-gray-200 rounded" />
      {/* Action buttons */}
      <div className="flex gap-3">
        <div className="h-10 w-32 bg-gray-200 rounded" />
        <div className="h-10 w-32 bg-gray-200 rounded" />
      </div>
      {/* Timetable grid */}
      <TimetableGridSkeleton rows={8} cols={5} />
    </div>
  );
}
