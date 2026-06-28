export default function PublishLoading() {
  return (
    <div className="flex flex-col gap-4 p-6 animate-pulse">
      <div className="h-7 w-48 bg-gray-200 rounded" />
      <div className="h-4 w-80 bg-gray-100 rounded" />
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <div className="h-5 w-40 bg-gray-200 rounded mb-3" />
        <div className="space-y-2">
          <div className="h-4 w-full bg-gray-100 rounded" />
          <div className="h-4 w-2/3 bg-gray-100 rounded" />
        </div>
      </div>
    </div>
  );
}
