"use client";

export type SortOption = { value: string; label: string };

export type ListToolbarProps = {
  placeholder: string;
  sortOptions: SortOption[];
  /** Controlled search text. */
  searchValue: string;
  onSearchChange: (value: string) => void;
  /** Controlled sort key. */
  sort: string;
  onSortChange: (value: string) => void;
  /** Total items currently matching — surfaced as a count. */
  matchCount: number;
  /** Optional callback for opening the mobile filter drawer. */
  onOpenFilters?: () => void;
};

export function ListToolbar({
  placeholder,
  sortOptions,
  searchValue,
  onSearchChange,
  sort,
  onSortChange,
  matchCount,
  onOpenFilters,
}: ListToolbarProps) {
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
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 rounded-md bg-slate-100 px-3 py-2 text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value)}
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
