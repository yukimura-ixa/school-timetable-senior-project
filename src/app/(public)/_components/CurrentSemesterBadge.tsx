"use client";

import { useEffect, useState } from "react";
import { useSemesterStore } from "@/stores/semesterStore";

/**
 * CurrentSemesterBadge
 * 
 * Displays the currently selected semester from global state (if any).
 * Useful for showing users which semester data they're viewing.
 * 
 * Shows on public homepage as a visual indicator of active semester.
 */
export function CurrentSemesterBadge() {
  const { semester, academicYear } = useSemesterStore();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by waiting for client mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until mounted (localStorage only available client-side)
  if (!mounted) {
    return null;
  }

  // Only show badge if semester is selected
  if (!semester || !academicYear) {
    return null;
  }

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm ring-1 ring-white/30 text-white">
      <svg 
        className="w-4 h-4" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
        />
      </svg>
      <span className="text-sm font-medium">
        ภาคเรียน {semester}/{academicYear}
      </span>
    </div>
  );
}
