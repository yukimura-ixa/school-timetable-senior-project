"use client";

/**
 * Table Search - Client Component with debouncing
 * Can work with either URL-based routing or callback-based updates
 */

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, Close } from "./Icons";

type Props = {
  initialValue?: string;
  placeholder?: string;
  /** Client-side callback function for search changes */
  onSearch?: (value: string) => void;
};

export function TableSearch({
  initialValue = "",
  placeholder = "ค้นหา...",
  onSearch,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(initialValue);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearch) {
        // Client-side callback mode (no URL updates)
        onSearch(searchValue.trim());
      } else {
        // URL-based routing mode
        const current = (searchParams.get("search") || "").trim();
        const next = (searchValue || "").trim();

        // Avoid redundant navigation that can cause scroll reset loops
        if (current === next) return;

        const params = new URLSearchParams(searchParams.toString());
        if (next) {
          params.set("search", next);
          params.delete("page"); // Reset to page 1 on search
        } else {
          params.delete("search");
        }

        // Use replace to avoid stacking history and reduce scroll jank
        router.replace(`${pathname}?${params.toString()}`);
      }
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
    // Intentionally exclude router/searchParams identity to prevent infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue, pathname, onSearch]);

  const handleClear = () => {
    setSearchValue("");
  };

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        placeholder={placeholder}
        className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        aria-label="Search"
        suppressHydrationWarning
      />
      {searchValue && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600"
          aria-label="Clear search"
        >
          <Close className="h-5 w-5 text-gray-400" />
        </button>
      )}
    </div>
  );
}
