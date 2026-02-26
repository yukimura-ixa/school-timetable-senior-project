"use client";

/**
 * Table Pagination - Client Component
 */

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "./Icons";

type Props = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
};

export function TablePagination({
  currentPage,
  totalPages,
  totalItems,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div
      className="flex items-center justify-between bg-white px-4 py-3 sm:px-6 rounded-lg border border-gray-200"
      role="navigation"
      aria-label="การแบ่งหน้า"
    >
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ก่อนหน้า
        </button>
        <button
          onClick={() => goToPage(currentPage + 1)}
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
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="หน้าก่อนหน้า"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            {[...Array(Math.min(totalPages, 5))].map((_, idx) => {
              const page = idx + 1;
              return (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
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
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="หน้าถัดไป"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
