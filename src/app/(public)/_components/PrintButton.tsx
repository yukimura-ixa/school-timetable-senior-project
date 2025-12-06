"use client";

/**
 * PrintButton - Client Component for print functionality
 *
 * Needed because onClick handlers cannot be used in Server Components.
 */
export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
    >
      พิมพ์ตารางสอน
    </button>
  );
}
