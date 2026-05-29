import { useTeachers } from "@/hooks";
import Loading from "@/app/loading";
import Dropdown from "@/components/elements/input/selected_input/Dropdown";
import ErrorState from "@/components/mui/ErrorState";
import React, { useEffect, useState } from "react";
import type { teacher } from "@/prisma/generated/client";
import { extractMonogram, monogramGradient } from "@/lib/ui/monogram";

type Props = {
  setTeacherID: (teacherId: number | null) => void;
  currentTeacher?: Partial<teacher> | null;
  disabled?: boolean;
};

const formatTeacherName = (teacher?: Partial<teacher> | null) => {
  if (!teacher) {
    return "";
  }

  const prefix = teacher.Prefix ?? "";
  const firstname = teacher.Firstname ?? "";
  const lastname = teacher.Lastname ?? "";

  return `${prefix}${firstname}${firstname && lastname ? " " : ""}${lastname}`.trim();
};

function SelectTeacher({
  setTeacherID,
  currentTeacher = null,
  disabled = false,
}: Props) {
  const allTeacher = useTeachers();
  const [teacher, setTeacher] = useState<string>(
    formatTeacherName(currentTeacher),
  );

  useEffect(() => {
    setTeacher(formatTeacherName(currentTeacher));
  }, [currentTeacher]);

  if (allTeacher.isLoading) {
    return <Loading />;
  }

  if (allTeacher.error) {
    return <ErrorState message="ไม่สามารถโหลดรายชื่อครูได้" />;
  }

  return (
    <div
      className="flex h-fit w-full items-center justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      style={{
        opacity: disabled ? 0.6 : 1,
        pointerEvents: disabled ? "none" : "auto",
      }}
    >
      <p>เลือกครู</p>
      <Dropdown
        width={300}
        data={allTeacher.data}
        testId="teacher-select"
        getItemId={(item) => (item as Partial<teacher>).TeacherID ?? ""}
        placeHolder="ตัวเลือก"
        renderItem={({ data }: { data: unknown }) => {
          const t = data as Partial<teacher>;
          const fullName = `${t.Prefix ?? ""}${t.Firstname ?? ""} ${t.Lastname ?? ""}`;
          return (
            <li className="flex items-center gap-2">
              <span
                aria-hidden
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-bold text-white"
                style={{ background: monogramGradient(t.TeacherID ?? fullName) }}
              >
                {extractMonogram(`${t.Prefix ?? ""}${t.Firstname ?? ""}`)}
              </span>
              <p>{fullName}</p>
            </li>
          );
        }}
        currentValue={teacher}
        handleChange={(data: unknown) => {
          if (disabled) return;
          const t = data as Partial<teacher>;
          setTeacher(
            `${t.Prefix ?? ""}${t.Firstname ?? ""} ${t.Lastname ?? ""}`,
          );
          setTeacherID(t.TeacherID ?? null);
        }}
        searchFunction={undefined}
      />
    </div>
  );
}

export default SelectTeacher;
