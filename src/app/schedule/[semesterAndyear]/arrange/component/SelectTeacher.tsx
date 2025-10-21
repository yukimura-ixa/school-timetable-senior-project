"use client"
import { useTeacherData } from "@/app/_hooks/teacherData";
import Loading from "@/app/loading";
import Dropdown from "@/components/elements/input/selected_input/Dropdown";
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";

type Props = {
  setTeacherID: Function;
  currentTeacher : any;
};

function SelectTeacher({setTeacherID, currentTeacher = {}}: Props) {
  const pathName = usePathname();
  const allTeacher = useTeacherData();
  const router = useRouter();
  const current = currentTeacher
  const [teacher, setTeacher] = useState(Object.keys(currentTeacher).length !== 0 ? `${current.Prefix}${current.Firstname} ${current.Lastname}` : "")
  const pushLink = (tID) => {
    router.push(
      `${pathName}/?TeacherID=${tID}`
    );
  }
  return (
    <>
      {allTeacher.isLoading ? <Loading />
      :
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
        />
      </div>
      }
    </>
  );
}

export default SelectTeacher;
