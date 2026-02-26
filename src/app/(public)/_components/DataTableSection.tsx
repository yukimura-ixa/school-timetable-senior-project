"use client";

/**
 * DataTableSection - Client Component
 *
 * Handles tab navigation, search, pagination, and table rendering
 * entirely on the client side without page refreshes or URL changes.
 */

import { useState, useMemo } from "react";
import { TableSearch } from "./TableSearch";
import { TeachersTableClient } from "./TeachersTableClient";
import { ClassesTableClient } from "./ClassesTableClient";
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
  // All state is local - no URL manipulation
  const [activeTab, setActiveTab] = useState<TabValue>(initialTab);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  // Store fetched data
  const [teachersState] = useState(teachersData);
  const [classesState] = useState(classesData);

  // totalItems/totalPages removed; pagination is derived from filtered lists below

  // Filter data based on search query
  const filteredTeachers = useMemo(() => {
    if (!searchQuery) return teachersState.data;
    const query = searchQuery.toLowerCase();
    return teachersState.data.filter(
      (teacher) =>
        teacher.name.toLowerCase().includes(query) ||
        (teacher.department &&
          teacher.department.toLowerCase().includes(query)),
    );
  }, [teachersState.data, searchQuery]);

  const filteredClasses = useMemo(() => {
    if (!searchQuery) return classesState.data;
    const query = searchQuery.toLowerCase();
    return classesState.data.filter(
      (cls) =>
        cls.gradeId.toLowerCase().includes(query) ||
        cls.homeroomTeacher?.toLowerCase().includes(query),
    );
  }, [classesState.data, searchQuery]);

  // Get current page data
  const currentTeachers = useMemo(() => {
    const start = (currentPage - 1) * 25;
    const end = start + 25;
    return filteredTeachers.slice(start, end);
  }, [filteredTeachers, currentPage]);

  const currentClasses = useMemo(() => {
    const start = (currentPage - 1) * 25;
    const end = start + 25;
    return filteredClasses.slice(start, end);
  }, [filteredClasses, currentPage]);

  // Recalculate total pages based on filtered data
  const actualTotalItems =
    activeTab === "teachers" ? filteredTeachers.length : filteredClasses.length;
  const actualTotalPages = Math.ceil(actualTotalItems / 25);

  // Tab change handler - instant, no URL changes
  const handleTabChange = (tab: TabValue) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setCurrentPage(1); // Reset to first page
    setSearchQuery(""); // Clear search when switching tabs
  };

  // Page change handler - no URL changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Search handler - no URL changes
  const handleSearch = (search: string) => {
    setSearchQuery(search);
    setCurrentPage(1); // Reset to first page
  };

  return (
    <div className="bg-white/40 backdrop-blur-xl rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-white/60 overflow-hidden transition-all duration-500 hover:shadow-[0_20px_80px_rgba(0,0,0,0.05)]">
      {/* Tab Navigation */}
      <div className="border-b border-slate-200/50 bg-white/30 px-8 pt-6">
        <nav className="-mb-px flex space-x-12" role="tablist">
          <button
            onClick={() => handleTabChange("teachers")}
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
          >
            <span>ครู</span>
            {activeTab === "teachers" && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" />
            )}
          </button>
          <button
            onClick={() => handleTabChange("classes")}
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
          >
            <span>ชั้นเรียน</span>
            {activeTab === "classes" && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" />
            )}
          </button>
        </nav>
      </div>

      {/* Search Bar - Modern styled area */}
      <div className="px-8 py-8 bg-white/20">
        <div className="max-w-2xl">
          <TableSearch
            key={activeTab} // Reset search when tab changes
            initialValue={searchQuery}
            onSearch={handleSearch}
            placeholder={
              activeTab === "teachers"
                ? "ค้นหาครูที่ต้องการ เช่น ชื่อจริง, ภาควิชา..."
                : "ค้นหาชั้นเรียนที่ต้องการ เช่น M.1/2..."
            }
          />
        </div>
      </div>

      {/* Table Content */}
      <div className="px-8 pb-8 min-h-[400px]">
        <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-white/60 shadow-sm overflow-hidden">
          {activeTab === "teachers" ? (
            <TeachersTableClient
              data={currentTeachers}
              search={searchQuery}
              data-testid="teacher-list"
              configId={currentConfigId}
            />
          ) : (
            <ClassesTableClient
              data={currentClasses}
              search={searchQuery}
              data-testid="class-list"
              configId={currentConfigId}
            />
          )}
        </div>
      </div>

      {/* Pagination */}
      {actualTotalPages > 1 && (
        <div className="px-8 py-6 bg-white/30 border-t border-slate-100">
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
