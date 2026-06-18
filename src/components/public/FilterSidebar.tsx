"use client";

export type FilterFacet = {
  key: string;       // e.g. "dept" or "year"
  label: string;     // e.g. "ภาควิชา"
  options: Array<{ value: string; label: string; count: number }>;
};

export type FilterSidebarProps = {
  facet: FilterFacet;
  /** Currently selected value ("" = ทั้งหมด). Controlled by the parent. */
  value: string;
  /** Called with the new selection ("" clears the filter). */
  onChange: (value: string) => void;
  /** Set true on mobile drawer wrapper; default = static sidebar. */
  drawer?: boolean;
};

export function FilterSidebar({ facet, value, onChange, drawer = false }: FilterSidebarProps) {
  const total = facet.options.reduce((acc, o) => acc + o.count, 0);

  return (
    <nav
      aria-label={facet.label}
      data-testid="filter-sidebar"
      className={
        drawer
          ? "w-full"
          : "sticky top-4 hidden h-fit w-60 shrink-0 rounded-xl border border-slate-200 bg-white p-3 md:block"
      }
    >
      <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
        {facet.label}
      </div>
      <button
        type="button"
        onClick={() => onChange("")}
        className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors ${
          value === ""
            ? "border-l-2 border-slate-900 bg-white font-semibold text-slate-900"
            : "border-l-2 border-transparent text-slate-600 hover:bg-slate-100"
        }`}
      >
        <span>ทั้งหมด</span>
        <span className="text-xs text-slate-500">{total}</span>
      </button>
      <ul className="mt-1 space-y-0.5">
        {facet.options.map((o) => (
          <li key={o.value}>
            <button
              type="button"
              onClick={() => onChange(o.value)}
              className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors ${
                value === o.value
                  ? "bg-blue-50 font-semibold text-blue-700"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span className="truncate">{o.label}</span>
              <span className="text-xs text-slate-500">{o.count}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
