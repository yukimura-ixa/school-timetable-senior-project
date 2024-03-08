import { useTeacherData } from "@/app/_hooks/teacherData";
import Loading from "@/app/loading";
import Dropdown from "@/components/elements/input/selected_input/Dropdown";
import React, { useState } from "react";

type Props = {
  setTeacherID: Function;
  currentTeacher : any;
};

function SelectTeacher(props: Props) {
  const allTeacher = useTeacherData();
  const current = props.currentTeacher
  const [teacher, setTeacher] = useState(`${current.Prefix}${current.Firstname} ${current.Lastname}`)
  return (
    <>
      {allTeacher.isLoading ? <Loading />
      :
      <div className="flex w-full items-center justify-between h-fit p-4 border border-[#EDEEF3]">
        <p>เลือกครู</p>
        <Dropdown
          width={300}
          data={allTeacher.data}
          placeHolder="ตัวเลือก"
          renderItem={({data}) => (<li><p>{`${data.Prefix}${data.Firstname} ${data.Lastname}`}</p></li>)}
          currentValue={teacher}
          handleChange={(data) => {
            setTeacher(`${data.Prefix}${data.Firstname} ${data.Lastname}`)
            props.setTeacherID(data.TeacherID)
          }}
          searchFunciton={undefined}
        />
      </div>
      }
    </>
  );
}

export default SelectTeacher;
