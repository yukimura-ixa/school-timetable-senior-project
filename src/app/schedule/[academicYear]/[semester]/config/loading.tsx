export default function ConfigLoading() {
  return (
    <div className="mx-auto max-w-2xl animate-pulse space-y-4 p-6">
      {/* Card header */}
      <div className="mb-6 h-8 w-48 rounded bg-gray-200" />
      
      {/* Form field placeholders */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-32 rounded bg-gray-200" />
          <div className="h-10 w-full rounded bg-gray-200" />
        </div>
      ))}
      
      {/* Button */}
      <div className="mt-6 h-10 w-32 rounded bg-gray-300" />
    </div>
  );
}
