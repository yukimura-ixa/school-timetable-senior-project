"use client";

/**
 * TeachersTableClient - Client Component
 * Renders the teacher list as a responsive PersonCard grid.
 * Filtering/sorting/pagination are owned by the parent DataTableSection;
 * this component is a pure display of the current page slice.
 */

import { PersonCard } from "@/components/public/PersonCard";
import type { PublicTeacher } from "@/lib/public/teachers";

type Props = {
  data: PublicTeacher[];
  search?: string;
  "data-testid"?: string;
  configId?: string; // e.g. "1-2567" for building term-specific public schedule links
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

export function TeachersTableClient({
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
          {search ? `ไม่พบครูที่ค้นหา "${search}"` : "ไม่มีข้อมูลครู"}
        </p>
      </div>
    );
  }

  return (
    <div
      data-testid={testId}
      className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {data.map((teacher) => (
        <PersonCard
          key={teacher.teacherId}
          id={teacher.teacherId}
          primary={teacher.name}
          secondary={`${teacher.department || "ไม่ระบุ"} · ${teacher.weeklyHours} คาบ`}
          href={
            term
              ? `/teachers/${teacher.teacherId}/${term.academicYear}/${term.semester}`
              : `/teachers/${teacher.teacherId}`
          }
          accentClass="text-accent-teacher"
          stripeClass="bg-accent-teacher"
        />
      ))}
    </div>
  );
}
