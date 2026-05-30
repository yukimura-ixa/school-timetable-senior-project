"use client";

/**
 * DataTableSection - Client Component
 *
 * Handles tab navigation, search, pagination, and table rendering
 * entirely on the client side without page refreshes or URL changes.
 */

import { useState, useRef } from "react";
import { TeachersTableClient } from "./TeachersTableClient";
import { ClassesTableClient } from "./ClassesTableClient";
import {
  FilterSidebar,
  type FilterFacet,
} from "@/components/public/FilterSidebar";
import { ListToolbar } from "@/components/public/ListToolbar";
import type { PublicTeacher } from "@/lib/public/teachers";
import type { PublicClass } from "@/lib/public/classes";

type TabValue = "teachers" | "classes";

type TeachersResult = {
  data: PublicTeacher[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

type ClassesResult = {
  data: PublicClass[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

type Props = {
  initialTab?: TabValue;
  totalTeachers: number;
  totalClasses: number;
  teachersData: TeachersResult;
  classesData: ClassesResult;
  currentConfigId?: string; // e.g. "1-2567" for building public schedule links
};

export function DataTableSection({
  initialTab = "teachers",
  // totalTeachers & totalClasses retained for future stats expansions (unused currently)
  totalTeachers: _totalTeachers,
  totalClasses: _totalClasses,
  teachersData,
  classesData,
  currentConfigId,
}: Props) {
  const TEACHER_DEFAULT_SORT = "name";
  const CLASS_DEFAULT_SORT = "grade";

  // All state is local - no URL manipulation (deliberate: the landing keeps
  // browser history clean and shares no filter state via the address bar).
  const [activeTab, setActiveTab] = useState<TabValue>(initialTab);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [facetValue, setFacetValue] = useState("");
  const [sortValue, setSortValue] = useState(
    initialTab === "teachers" ? TEACHER_DEFAULT_SORT : CLASS_DEFAULT_SORT,
  );
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Store fetched data
  const [teachersState] = useState(teachersData);
  const [classesState] = useState(classesData);

  // Facets are computed from the full (unfiltered) dataset so counts are stable.
  const teacherFacet: FilterFacet = (() => {
    const counts = new Map<string, number>();
    for (const t of teachersState.data) {
      const k = t.department || "ไม่ระบุ";
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    return {
      key: "dept",
      label: "ภาควิชา",
      options: [...counts.entries()]
        .sort((a, b) => a[0].localeCompare(b[0], "th"))
        .map(([value, count]) => ({ value, label: value, count })),
    };
  })();

  const classFacet: FilterFacet = (() => {
    const counts = new Map<number, number>();
    for (const c of classesState.data)
      counts.set(c.year, (counts.get(c.year) ?? 0) + 1);
    return {
      key: "year",
      label: "ระดับชั้น",
      options: [...counts.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([year, count]) => ({
          value: String(year),
          label: `ม.${year}`,
          count,
        })),
    };
  })();

  // Filter + facet + sort
  const filteredTeachers = (() => {
    const query = searchQuery.toLowerCase();
    let xs = teachersState.data;
    if (query) {
      xs = xs.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          (t.department && t.department.toLowerCase().includes(query)),
      );
    }
    if (facetValue)
      xs = xs.filter((t) => (t.department || "ไม่ระบุ") === facetValue);
    return [...xs].sort((a, b) => {
      if (sortValue === "hours") return b.weeklyHours - a.weeklyHours;
      if (sortValue === "subjects") return b.subjectCount - a.subjectCount;
      return a.name.localeCompare(b.name, "th");
    });
  })();

  const filteredClasses = (() => {
    const query = searchQuery.toLowerCase();
    let xs = classesState.data;
    if (query) {
      xs = xs.filter(
        (cls) =>
          cls.gradeId.toLowerCase().includes(query) ||
          cls.homeroomTeacher?.toLowerCase().includes(query),
      );
    }
    if (facetValue) xs = xs.filter((cls) => String(cls.year) === facetValue);
    return [...xs].sort((a, b) => {
      if (sortValue === "hours") return b.weeklyHours - a.weeklyHours;
      if (sortValue === "subjects") return b.subjectCount - a.subjectCount;
      if (a.year !== b.year) return a.year - b.year;
      return a.section - b.section;
    });
  })();

  // Get current page data
  const currentTeachers = (() => {
    const start = (currentPage - 1) * 25;
    return filteredTeachers.slice(start, start + 25);
  })();

  const currentClasses = (() => {
    const start = (currentPage - 1) * 25;
    return filteredClasses.slice(start, start + 25);
  })();

  // Recalculate total pages based on filtered data
  const actualTotalItems =
    activeTab === "teachers" ? filteredTeachers.length : filteredClasses.length;
  const actualTotalPages = Math.ceil(actualTotalItems / 25);

  const activeFacet = activeTab === "teachers" ? teacherFacet : classFacet;
  const sortOptions =
    activeTab === "teachers"
      ? [
          { value: "name", label: "ชื่อ ก-ฮ" },
          { value: "hours", label: "คาบมากสุด" },
          { value: "subjects", label: "วิชามากสุด" },
        ]
      : [
          { value: "grade", label: "ตามชั้น" },
          { value: "hours", label: "คาบมากสุด" },
          { value: "subjects", label: "วิชามากสุด" },
        ];

  // Refs for keyboard navigation between tabs (WAI-ARIA tabs pattern)
  const teachersTabRef = useRef<HTMLButtonElement>(null);
  const classesTabRef = useRef<HTMLButtonElement>(null);

  // Tab change handler - instant, no URL changes
  const handleTabChange = (tab: TabValue) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchQuery("");
    setFacetValue("");
    setSortValue(
      tab === "teachers" ? TEACHER_DEFAULT_SORT : CLASS_DEFAULT_SORT,
    );
    setDrawerOpen(false);
  };

  // Left/Right arrow keys move focus between tabs and activate the focused tab
  // (ARIA "automatic activation" pattern).
  const handleTabKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const nextTab: TabValue = activeTab === "teachers" ? "classes" : "teachers";
    handleTabChange(nextTab);
    const nextRef = nextTab === "teachers" ? teachersTabRef : classesTabRef;
    nextRef.current?.focus();
  };

  // Page change handler - no URL changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearch = (search: string) => {
    setSearchQuery(search);
    setCurrentPage(1);
  };

  const handleFacet = (value: string) => {
    setFacetValue(value);
    setCurrentPage(1);
    setDrawerOpen(false);
  };

  const handleSortChange = (value: string) => {
    setSortValue(value);
    setCurrentPage(1);
  };

  return (
    <div className="bg-white/40 backdrop-blur-xl rounded-2xl sm:rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-white/60 overflow-hidden transition-all duration-500 hover:shadow-[0_20px_80px_rgba(0,0,0,0.05)]">
      {/* Tab Navigation */}
      <div className="border-b border-slate-200/50 bg-white/30 px-4 sm:px-6 md:px-8 pt-4 sm:pt-6">
        <nav className="-mb-px flex space-x-6 sm:space-x-12" role="tablist">
          <button
            ref={teachersTabRef}
            onClick={() => handleTabChange("teachers")}
            onKeyDown={handleTabKeyDown}
            id="teachers-tab"
            data-testid="teachers-tab"
            className={`
              relative whitespace-nowrap pb-6 px-1 font-bold text-base
              transition-all duration-300
              ${
                activeTab === "teachers"
                  ? "text-blue-600"
                  : "text-slate-400 hover:text-slate-600"
              }
            `}
            role="tab"
            aria-selected={activeTab === "teachers"}
            aria-controls="teachers-panel"
            tabIndex={activeTab === "teachers" ? 0 : -1}
          >
            <span>ครู</span>
            {activeTab === "teachers" && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" />
            )}
          </button>
          <button
            ref={classesTabRef}
            onClick={() => handleTabChange("classes")}
            onKeyDown={handleTabKeyDown}
            id="classes-tab"
            data-testid="classes-tab"
            className={`
              relative whitespace-nowrap pb-6 px-1 font-bold text-base
              transition-all duration-300
              ${
                activeTab === "classes"
                  ? "text-blue-600"
                  : "text-slate-400 hover:text-slate-600"
              }
            `}
            role="tab"
            aria-selected={activeTab === "classes"}
            aria-controls="classes-panel"
            tabIndex={activeTab === "classes" ? 0 : -1}
          >
            <span>ชั้นเรียน</span>
            {activeTab === "classes" && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" />
            )}
          </button>
        </nav>
      </div>

      {/* Toolbar: search + sort + count + mobile filter trigger */}
      <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 bg-white/20">
        <ListToolbar
          placeholder={
            activeTab === "teachers"
              ? "ค้นหาครูที่ต้องการ เช่น ชื่อจริง, ภาควิชา..."
              : "ค้นหาชั้นเรียนที่ต้องการ เช่น M.1/2..."
          }
          sortOptions={sortOptions}
          searchValue={searchQuery}
          onSearchChange={handleSearch}
          sort={sortValue}
          onSortChange={handleSortChange}
          matchCount={actualTotalItems}
          onOpenFilters={() => setDrawerOpen(true)}
        />
      </div>

      {/* Content: faceted sidebar + card grid */}
      <div className="px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8 min-h-[300px] sm:min-h-[400px]">
        <div className="flex gap-4 md:gap-6">
          <FilterSidebar
            facet={activeFacet}
            value={facetValue}
            onChange={handleFacet}
          />

          {drawerOpen && (
            <div
              className="fixed inset-0 z-40 md:hidden"
              onClick={() => setDrawerOpen(false)}
            >
              <div className="absolute inset-0 bg-slate-900/40" />
              <div
                className="absolute left-0 top-0 h-full w-72 bg-white p-3 overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <FilterSidebar
                  facet={activeFacet}
                  value={facetValue}
                  onChange={handleFacet}
                  drawer
                />
              </div>
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div
              id="teachers-panel"
              role="tabpanel"
              aria-labelledby="teachers-tab"
              tabIndex={0}
              hidden={activeTab !== "teachers"}
            >
              {activeTab === "teachers" && (
                <TeachersTableClient
                  data={currentTeachers}
                  search={searchQuery}
                  data-testid="teacher-list"
                  configId={currentConfigId}
                />
              )}
            </div>
            <div
              id="classes-panel"
              role="tabpanel"
              aria-labelledby="classes-tab"
              tabIndex={0}
              hidden={activeTab !== "classes"}
            >
              {activeTab === "classes" && (
                <ClassesTableClient
                  data={currentClasses}
                  search={searchQuery}
                  data-testid="class-list"
                  configId={currentConfigId}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {actualTotalPages > 1 && (
        <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 bg-white/30 border-t border-slate-100">
          <ClientPagination
            currentPage={currentPage}
            totalPages={actualTotalPages}
            totalItems={actualTotalItems}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Client-side pagination component that doesn't use URL params
 */
function ClientPagination({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}) {
  // Inline SVG elements instead of creating components during render
  const chevronLeftIcon = (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 19l-7-7 7-7"
      />
    </svg>
  );
  const chevronRightIcon = (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5l7 7-7 7"
      />
    </svg>
  );

  return (
    <div
      className="flex items-center justify-between bg-white px-4 py-3 sm:px-6 rounded-lg border border-gray-200"
      role="navigation"
      aria-label="การแบ่งหน้า"
    >
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ก่อนหน้า
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ถัดไป
        </button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            แสดง{" "}
            <span className="font-medium">{(currentPage - 1) * 25 + 1}</span>{" "}
            ถึง{" "}
            <span className="font-medium">
              {Math.min(currentPage * 25, totalItems)}
            </span>{" "}
            จาก <span className="font-medium">{totalItems}</span> รายการ
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="หน้าก่อนหน้า"
            >
              {chevronLeftIcon}
            </button>
            {[...Array(Math.min(totalPages, 5))].map((_, idx) => {
              const page = idx + 1;
              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    currentPage === page
                      ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                      : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                  }`}
                  aria-label={`หน้า ${page}`}
                  aria-current={currentPage === page ? "page" : undefined}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="หน้าถัดไป"
            >
              {chevronRightIcon}
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
