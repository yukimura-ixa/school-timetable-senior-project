"use client";

/**
 * Tab Navigation - Client Component
 * Manages tab state and updates URL
 */

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";

type TabValue = "teachers" | "classes";

export function TabNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabValue>("teachers");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "teachers" || tab === "classes") {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: TabValue) => {
    if (tab === activeTab) return; // no-op if unchanged
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    params.delete("page"); // Reset pagination
    // Use replace to avoid stacking history and reduce scroll jank
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8" role="tablist">
        <button
          onClick={() => handleTabChange("teachers")}
          className={`
            whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
            transition-colors
            ${
              activeTab === "teachers"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }
          `}
          role="tab"
          aria-selected={activeTab === "teachers"}
          aria-controls="teachers-panel"
        >
          ครู (Teachers)
        </button>
        <button
          onClick={() => handleTabChange("classes")}
          className={`
            whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
            transition-colors
            ${
              activeTab === "classes"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }
          `}
          role="tab"
          aria-selected={activeTab === "classes"}
          aria-controls="classes-panel"
        >
          ชั้นเรียน (Classes)
        </button>
      </nav>
    </div>
  );
}
