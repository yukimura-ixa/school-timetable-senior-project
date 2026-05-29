"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export type SortOption = { value: string; label: string };

export type ListToolbarProps = {
  placeholder: string;
  sortOptions: SortOption[];
  defaultSort: string;
  /** Total items currently matching — surfaced as a count. */
  matchCount: number;
  /** Optional callback for opening the mobile filter drawer. */
  onOpenFilters?: () => void;
};

export function ListToolbar({
  placeholder,
  sortOptions,
  defaultSort,
  matchCount,
  onOpenFilters,
}: ListToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");

  useEffect(() => {
    const t = setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      if (q === "") next.delete("q");
      else next.set("q", q);
      next.delete("page");
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    }, 250);
    return () => clearTimeout(t);
    // intentionally only depends on q
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const sort = params.get("sort") ?? defaultSort;
  function setSort(v: string) {
    const next = new URLSearchParams(params.toString());
    if (v === defaultSort) next.delete("sort");
    else next.set("sort", v);
    next.delete("page");
    router.push(`${pathname}?${next.toString()}`);
  }

  return (
    <div
      data-testid="list-toolbar"
      className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-2"
    >
      {onOpenFilters && (
        <button
          type="button"
          onClick={onOpenFilters}
          className="rounded-md border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 md:hidden"
        >
          ตัวกรอง
        </button>
      )}
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        className="flex-1 rounded-md bg-slate-100 px-3 py-2 text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
      <select
        value={sort}
        onChange={(e) => setSort(e.target.value)}
        className="rounded-md border border-slate-200 bg-white px-2 py-2 text-xs"
        aria-label="เรียง"
      >
        {sortOptions.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <span className="ml-auto text-xs text-slate-500">{matchCount} รายการ</span>
    </div>
  );
}
