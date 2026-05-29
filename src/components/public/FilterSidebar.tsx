"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export type FilterFacet = {
  key: string;       // e.g. "dept" or "year"
  label: string;     // e.g. "ภาควิชา"
  options: Array<{ value: string; label: string; count: number }>;
};

export type FilterSidebarProps = {
  facet: FilterFacet;
  /** Set true on mobile drawer wrapper; default = static sidebar. */
  drawer?: boolean;
};

export function FilterSidebar({ facet, drawer = false }: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const active = params.get(facet.key) ?? "";

  function select(value: string) {
    const next = new URLSearchParams(params.toString());
    if (value === "") next.delete(facet.key);
    else next.set(facet.key, value);
    next.delete("page"); // reset paging when filter changes
    router.push(`${pathname}?${next.toString()}`);
  }

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
        onClick={() => select("")}
        className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors ${
          active === ""
            ? "bg-blue-50 font-semibold text-blue-700"
            : "text-slate-700 hover:bg-slate-50"
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
              onClick={() => select(o.value)}
              className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors ${
                active === o.value
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
