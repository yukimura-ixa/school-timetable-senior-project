"use client"
import { useTeachers } from "@/hooks";
import Dropdown from "@/components/elements/input/selected_input/Dropdown";
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";

type Props = {
  setTeacherID: Function;
  currentTeacher : any;
};

function SelectTeacher({setTeacherID, currentTeacher = {}}: Props) {
  const pathName = usePathname();
  const allTeacher = useTeachers();
  const router = useRouter();
  const current = currentTeacher
  const [teacher, setTeacher] = useState(Object.keys(currentTeacher).length !== 0 ? `${current.Prefix}${current.Firstname} ${current.Lastname}` : "")
  const pushLink = (tID: number) => {
    router.push(
      `${pathName}/?TeacherID=${tID}`
    );
  }
  return (
    <>
      <div className="flex w-full items-center justify-between h-fit p-4 border border-[#EDEEF3]">
        <p>เลือกคุณครู</p>
        <Dropdown
          width={300}
          data={allTeacher.data}
          placeHolder="ตัวเลือก"
          renderItem={({data}: { data: any }) => (<li><p>{`${data.Prefix}${data.Firstname} ${data.Lastname}`}</p></li>)}
          currentValue={teacher}
          handleChange={(data: any) => {
            setTeacher(`${data.Prefix}${data.Firstname} ${data.Lastname}`)
            setTeacherID(data.TeacherID)
            pushLink(data.TeacherID)
          }}
          searchFunction={undefined}
          data-testid="teacher-selector"
        />
      </div>
    </>
  );
}

export default SelectTeacher;
