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
};

export function DataTableSection({
  initialTab = "teachers",
  totalTeachers,
  totalClasses,
  teachersData,
  classesData,
}: Props) {
  // All state is local - no URL manipulation
  const [activeTab, setActiveTab] = useState<TabValue>(initialTab);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Store fetched data
  const [teachersState] = useState(teachersData);
  const [classesState] = useState(classesData);

  const totalItems = activeTab === "teachers" ? totalTeachers : totalClasses;
  const totalPages = Math.ceil(totalItems / 25);
  
  // Filter data based on search query
  const filteredTeachers = useMemo(() => {
    if (!searchQuery) return teachersState.data;
    const query = searchQuery.toLowerCase();
    return teachersState.data.filter(teacher => 
      teacher.name.toLowerCase().includes(query) ||
      (teacher.department && teacher.department.toLowerCase().includes(query))
    );
  }, [teachersState.data, searchQuery]);

  const filteredClasses = useMemo(() => {
    if (!searchQuery) return classesState.data;
    const query = searchQuery.toLowerCase();
    return classesState.data.filter(cls => 
      cls.gradeId.toLowerCase().includes(query) ||
      cls.homeroomTeacher?.toLowerCase().includes(query)
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
  const actualTotalItems = activeTab === "teachers" ? filteredTeachers.length : filteredClasses.length;
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <nav className="-mb-px flex space-x-8" role="tablist">
          <button
            onClick={() => handleTabChange("teachers")}
            data-testid="teachers-tab"
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
            data-testid="classes-tab"
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

      {/* Search Bar */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <TableSearch
          key={activeTab} // Reset search when tab changes
          initialValue={searchQuery}
          onSearch={handleSearch}
          placeholder={
            activeTab === "teachers"
              ? "ค้นหาครู (ชื่อ, ภาควิชา)..."
              : "ค้นหาชั้นเรียน (เช่น M.1)..."
          }
        />
      </div>

      {/* Table Content */}
      <div className="px-6 py-4 min-h-[400px]">
        {activeTab === "teachers" ? (
          <TeachersTableClient
            data={currentTeachers}
            search={searchQuery}
            data-testid="teacher-list"
          />
        ) : (
          <ClassesTableClient
            data={currentClasses}
            search={searchQuery}
            data-testid="class-list"
          />
        )}
      </div>

      {/* Pagination */}
      {actualTotalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
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
  onPageChange 
}: { 
  currentPage: number; 
  totalPages: number; 
  totalItems: number;
  onPageChange: (page: number) => void;
}) {
  const ChevronLeft = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
  
  const ChevronRight = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );

  return (
    <div
      className="flex items-center justify-between bg-white px-4 py-3 sm:px-6 rounded-lg border border-gray-200"
      role="navigation"
      aria-label="Pagination"
    >
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            แสดง{" "}
            <span className="font-medium">{(currentPage - 1) * 25 + 1}</span> ถึง{" "}
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
              aria-label="Previous page"
            >
              <ChevronLeft />
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
                  aria-label={`Page ${page}`}
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
              aria-label="Next page"
            >
              <ChevronRight />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
