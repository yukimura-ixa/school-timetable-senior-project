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
  /**
   * Static bg-* class for the left accent stripe (e.g. "bg-accent-teacher").
   * Passed as a literal so Tailwind can see it; omit to hide the stripe.
   */
  stripeClass?: string;
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
  stripeClass,
  adminOverlay,
  testId = "person-card",
}: PersonCardProps) {
  const initial = monogram?.kind === "grade" ? gradeMonogram(monogram.year) : extractMonogram(primary);
  const gradient = monogramGradient(id);
  return (
    <article
      data-testid={testId}
      className="group relative flex items-center gap-2.5 overflow-hidden rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      {stripeClass && (
        <span aria-hidden className={`absolute inset-y-0 left-0 w-1 ${stripeClass}`} />
      )}
      <div
        aria-hidden
        className="flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
        style={{ background: gradient }}
      >
        {initial}
      </div>
      <div className="min-w-0 flex-1">
        {/* Stretched link: the whole card is the click target, so the name and
            metric keep the full remaining width instead of competing with a
            separate action label. */}
        <Link
          href={href}
          prefetch={false}
          aria-label={`เปิดตารางของ ${primary}`}
          className="block truncate text-sm font-semibold text-slate-900 before:absolute before:inset-0"
        >
          {primary}
        </Link>
        <div className="truncate text-xs tabular-nums text-slate-500">{secondary}</div>
      </div>
      <span aria-hidden className={`shrink-0 text-sm font-semibold ${accentClass}`}>
        →
      </span>
      {adminOverlay && (
        <div className="pointer-events-none absolute right-2 top-2 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
          {adminOverlay}
        </div>
      )}
    </article>
  );
}
