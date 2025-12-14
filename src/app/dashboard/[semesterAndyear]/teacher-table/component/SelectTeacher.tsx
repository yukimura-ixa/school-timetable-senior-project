import { useTeachers } from "@/hooks";
import Loading from "@/app/loading";
import Dropdown from "@/components/elements/input/selected_input/Dropdown";
import ErrorState from "@/components/mui/ErrorState";
import React, { useEffect, useState } from "react";
import type { teacher } from "@/prisma/generated/client";

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
      className="flex h-fit w-full items-center justify-between border border-[#EDEEF3] p-4"
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
          return (
            <li>
              <p>{`${t.Prefix ?? ""}${t.Firstname ?? ""} ${t.Lastname ?? ""}`}</p>
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
