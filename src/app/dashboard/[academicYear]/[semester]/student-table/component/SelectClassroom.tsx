import Loading from "@/app/loading";
import Dropdown from "@/components/elements/input/selected_input/Dropdown";
import ErrorState from "@/components/mui/ErrorState";
import type { gradelevel } from "@/prisma/generated/client";
import React, { useEffect, useMemo, useState } from "react";
import { formatGradeDisplay, formatGradeIdDisplay } from "@/utils/grade-display";

type Props = {
  setGradeID: (gradeId: string | null) => void;
  currentGrade: string | null;
  gradeLevels: gradelevel[];
  isLoading: boolean;
  error?: unknown;
};

const formatGradeLabel = (gradeId: string | null) => {
  if (!gradeId) {
    return "";
  }

  try {
    return formatGradeIdDisplay(gradeId);
  } catch {
    return gradeId;
  }
};

const formatGradeFromLevel = (grade: gradelevel) => {
  const formatted = formatGradeLabel(grade.GradeID);
  if (formatted !== grade.GradeID) {
    return formatted;
  }

  const rawYear = grade.Year;
  const section = grade.Number;
  if (Number.isFinite(rawYear) && Number.isFinite(section) && section >= 1) {
    const thaiYear = rawYear >= 7 && rawYear <= 12 ? rawYear - 6 : rawYear;
    if (thaiYear >= 1 && thaiYear <= 6) {
      return formatGradeDisplay(thaiYear, section);
    }
  }

  return grade.GradeID;
};

function SelectClassRoom({
  setGradeID,
  currentGrade,
  gradeLevels,
  isLoading,
  error,
}: Props) {
  const validGradeLevels = useMemo(
    () =>
      gradeLevels.filter(
        (grade) =>
          Number.isFinite(grade.Year) &&
          grade.Year >= 1 &&
          Number.isFinite(grade.Number) &&
          grade.Number >= 1,
      ),
    [gradeLevels],
  );
  const [classRoom, setClassRoom] = useState<string>(
    formatGradeLabel(currentGrade),
  );

  useEffect(() => {
    setClassRoom(formatGradeLabel(currentGrade));
  }, [currentGrade]);

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorState message="ไม่สามารถโหลดข้อมูลระดับชั้นได้" />;
  }

  return (
    <div className="flex w-full items-center justify-between h-fit rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p>เลือกชั้นเรียน</p>
      <Dropdown
        width={300}
        data={validGradeLevels}
        placeHolder="ตัวเลือก"
        renderItem={({ data }: { data: unknown }) => {
          const g = data as gradelevel;
          return (
            <li>
              <p>{formatGradeFromLevel(g)}</p>
            </li>
          );
        }}
        currentValue={classRoom}
        handleChange={(data: unknown) => {
          const g = data as gradelevel;
          const gradeId = g.GradeID;
          setClassRoom(formatGradeFromLevel(g));
          setGradeID(gradeId);
        }}
        searchFunction={undefined}
      />
    </div>
  );
}

export default SelectClassRoom;
