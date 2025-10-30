import { useTeachers } from "@/hooks";
import Loading from "@/app/loading";
import Dropdown from "@/components/elements/input/selected_input/Dropdown";
import ErrorState from "@/components/mui/ErrorState";
import React, { useEffect, useState } from "react";

type Props = {
  setTeacherID: (teacherId: number | null) => void;
  currentTeacher?: Record<string, any>;
};

const formatTeacherName = (teacher?: Record<string, any>) => {
  if (!teacher || Object.keys(teacher).length === 0) {
    return "";
  }

  const prefix = teacher.Prefix ?? "";
  const firstname = teacher.Firstname ?? "";
  const lastname = teacher.Lastname ?? "";

  return `${prefix}${firstname}${firstname && lastname ? " " : ""}${lastname}`.trim();
};

function SelectTeacher({ setTeacherID, currentTeacher = {} }: Props) {
  const allTeacher = useTeachers();
  const [teacher, setTeacher] = useState<string>(formatTeacherName(currentTeacher));

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
    <div className="flex h-fit w-full items-center justify-between border border-[#EDEEF3] p-4">
      <p>เลือกครู</p>
      <Dropdown
        width={300}
        data={allTeacher.data}
        placeHolder="ตัวเลือก"
        renderItem={({ data }: { data: Record<string, any> }) => (
          <li>
            <p>{`${data.Prefix}${data.Firstname} ${data.Lastname}`}</p>
          </li>
        )}
        currentValue={teacher}
        handleChange={(data: Record<string, any>) => {
          setTeacher(`${data.Prefix}${data.Firstname} ${data.Lastname}`);
          setTeacherID(data.TeacherID ?? null);
        }}
        searchFunction={undefined}
      />
    </div>
  );
}

export default SelectTeacher;
