export default function ResetPasswordLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md animate-pulse space-y-6 rounded-lg bg-white p-8 shadow-lg">
        {/* Title */}
        <div className="mx-auto h-8 w-48 rounded bg-gray-200" />
        
        {/* New password input */}
        <div className="space-y-2">
          <div className="h-4 w-32 rounded bg-gray-200" />
          <div className="h-10 w-full rounded bg-gray-200" />
        </div>
        
        {/* Confirm password input */}
        <div className="space-y-2">
          <div className="h-4 w-32 rounded bg-gray-200" />
          <div className="h-10 w-full rounded bg-gray-200" />
        </div>
        
        {/* Submit button */}
        <div className="h-10 w-full rounded bg-gray-300" />
      </div>
    </div>
  );
}
