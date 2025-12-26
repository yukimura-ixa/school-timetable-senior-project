"use client";
import { useTeachers } from "@/hooks";
import Dropdown from "@/components/elements/input/selected_input/Dropdown";
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";

import type { teacher } from "@/prisma/generated/client";

type Props = {
  setTeacherID: (id: number) => void;
  currentTeacher: teacher | Record<string, never>;
  disabled?: boolean;
};

function SelectTeacher({
  setTeacherID,
  currentTeacher = {},
  disabled = false,
}: Props) {
  const pathName = usePathname();
  const allTeacher = useTeachers();
  const router = useRouter();
  const current = currentTeacher;
  const [teacher, setTeacher] = useState(
    Object.keys(currentTeacher).length !== 0
      ? `${current.Prefix}${current.Firstname} ${current.Lastname}`
      : "",
  );
  const pushLink = (tID: number) => {
    router.push(`${pathName}/?TeacherID=${tID}`);
  };
  return (
    <>
      <div
        className="flex w-full items-center justify-between h-fit p-4 border border-[#EDEEF3]"
        style={{
          opacity: disabled ? 0.6 : 1,
          pointerEvents: disabled ? "none" : "auto",
        }}
      >
        <p>เลือกคุณครู</p>
        <Dropdown
          width={300}
          data={allTeacher.data}
          placeHolder="ตัวเลือก"
          renderItem={({ data }: { data: teacher }) => (
            <li>
              <p>{`${data.Prefix}${data.Firstname} ${data.Lastname}`}</p>
            </li>
          )}
          currentValue={teacher}
          handleChange={(data: teacher) => {
            if (disabled) return; // Prevent changes when disabled
            setTeacher(`${data.Prefix}${data.Firstname} ${data.Lastname}`);
            setTeacherID(data.TeacherID);
            pushLink(data.TeacherID);
          }}
          searchFunction={undefined}
          data-testid="teacher-selector"
          getItemId={(item: teacher) => item.TeacherID} // Extract TeacherID for stable E2E selectors
        />
      </div>
    </>
  );
}

export default SelectTeacher;
