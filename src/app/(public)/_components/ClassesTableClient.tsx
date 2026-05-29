"use client";

/**
 * ClassesTableClient - Client Component
 * Renders the class list as a responsive PersonCard grid.
 * Filtering/sorting/pagination are owned by the parent DataTableSection;
 * this component is a pure display of the current page slice.
 */

import { PersonCard } from "@/components/public/PersonCard";
import type { PublicClass } from "@/lib/public/classes";

type Props = {
  data: PublicClass[];
  search?: string;
  "data-testid"?: string;
  configId?: string; // e.g. "1-2567" for building term-specific public schedule links
};

// Normalize grade identifier for URL usage.
// - If already numeric (e.g. "303"), return as-is.
// - If formatted label (e.g. "ม.3/3"), derive numeric code (e.g. "303").
const toNumericGradeId = (gradeId: string): string => {
  if (!gradeId) return gradeId;
  if (/^\d+$/.test(gradeId)) return gradeId;
  const match = gradeId.match(/(\d+)[^\d]+(\d+)/) ?? [];
  if (!match) return gradeId;
  const year = Number.parseInt(match[1] ?? "", 10);
  const section = Number.parseInt(match[2] ?? "", 10);
  if (Number.isNaN(year) || Number.isNaN(section)) return gradeId;
  return `${year}${section.toString().padStart(2, "0")}`;
};

const parseConfigId = (
  configId?: string,
): { academicYear: string; semester: string } | null => {
  if (!configId) return null;
  const match = /^(1|2)-(\d{4})$/.exec(configId);
  const semester = match?.[1];
  const academicYear = match?.[2];
  if (!semester || !academicYear) return null;
  return { academicYear, semester };
};

export function ClassesTableClient({
  data,
  search,
  "data-testid": testId,
  configId,
}: Props) {
  const term = parseConfigId(configId);

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12" data-testid={testId}>
        <p className="text-gray-500 text-lg">
          {search
            ? `ไม่พบชั้นเรียนที่ค้นหา "${search}"`
            : "ไม่มีข้อมูลชั้นเรียน"}
        </p>
      </div>
    );
  }

  return (
    <div
      data-testid={testId}
      className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
    >
      {data.map((cls) => (
        <PersonCard
          key={cls.gradeId}
          id={cls.gradeId}
          primary={`ม.${cls.year}/${cls.section}`}
          secondary={`${cls.homeroomTeacher || "—"} · ${cls.weeklyHours} คาบ`}
          monogram={{ kind: "grade", year: cls.year }}
          accentClass="text-accent-class"
          href={
            term
              ? `/classes/${toNumericGradeId(cls.gradeId)}/${term.academicYear}/${term.semester}`
              : `/dashboard`
          }
        />
      ))}
    </div>
  );
}
