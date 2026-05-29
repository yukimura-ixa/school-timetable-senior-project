import Link from "next/link";
import { extractMonogram, monogramGradient, gradeMonogram } from "@/lib/ui/monogram";

export type PersonCardProps = {
  /** Stable identifier — used for the gradient hash. */
  id: number | string;
  /** Primary heading. For teachers: full name. For classes: ม.{Year}/{Number}. */
  primary: string;
  /** Secondary line under the heading, e.g. "คณิตศาสตร์ · 22 คาบ". */
  secondary: string;
  /** Link target — page that the action arrow opens. */
  href: string;
  /**
   * For teachers, leave undefined → extractMonogram(primary).
   * For classes, pass { kind: "grade", year } → "ม.{year}".
   */
  monogram?: { kind: "grade"; year: number };
  /** Per-surface accent token — text-accent-teacher | text-accent-class. */
  accentClass: string;
  /** Optional admin row-overlay slot (edit / lock). */
  adminOverlay?: React.ReactNode;
  /** data-testid override; defaults to "person-card". */
  testId?: string;
};

export function PersonCard({
  id,
  primary,
  secondary,
  href,
  monogram,
  accentClass,
  adminOverlay,
  testId = "person-card",
}: PersonCardProps) {
  const initial = monogram?.kind === "grade" ? gradeMonogram(monogram.year) : extractMonogram(primary);
  const gradient = monogramGradient(id);
  return (
    <article
      data-testid={testId}
      className="group relative flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div
        aria-hidden
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
        style={{ background: gradient }}
      >
        {initial}
      </div>
      <div className="min-w-0 flex-1">
        <Link
          href={href}
          prefetch={false}
          className={`block truncate text-sm font-semibold text-slate-900 hover:${accentClass}`}
        >
          {primary}
        </Link>
        <div className="truncate text-xs text-slate-500">{secondary}</div>
      </div>
      <Link
        href={href}
        prefetch={false}
        aria-label={`เปิดตารางของ ${primary}`}
        className={`shrink-0 text-xs font-medium ${accentClass}`}
      >
        ตาราง →
      </Link>
      {adminOverlay && (
        <div className="pointer-events-none absolute right-2 top-2 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
          {adminOverlay}
        </div>
      )}
    </article>
  );
}
