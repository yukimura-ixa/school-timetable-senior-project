import { useGradeLevelData } from "@/app/_hooks/gradeLevelData";
import Loading from "@/app/loading";
import Dropdown from "@/components/elements/input/selected_input/Dropdown";
import React, { useState } from "react";
import { isNull } from "util";

type Props = {
  setGradeID: Function;
  currentGrade : any;
};

function SelectClassRoom({setGradeID, currentGrade = {}}: Props) {
  const gradeLevelData = useGradeLevelData();
  const current = currentGrade
  const [classRoom, setClassRoom] = useState(isNull(current) ? "" : `ม.${current[0]}/${parseInt(current.substring(1))}`)
  return (
    <>
      {gradeLevelData.isLoading ? <Loading />
      :
      <div className="flex w-full items-center justify-between h-fit p-4 border border-[#EDEEF3]">
        <p onClick={() => console.log(classRoom)}>เลือกชั้นเรียน</p>
        <Dropdown
          width={300}
          data={gradeLevelData.data}
          placeHolder="ตัวเลือก"
          renderItem={({data}) => (<li><p>{`ม.${data.GradeID[0]}/${parseInt(data.GradeID.substring(1))}`}</p></li>)}
          currentValue={classRoom}
          handleChange={(data) => {
            setClassRoom(`ม.${data.GradeID[0]}/${parseInt(data.GradeID.substring(1))}`)
            setGradeID(data.GradeID)
          }}
          searchFunciton={undefined}
        />
      </div>
      }
    </>
  );
}

export default SelectClassRoom;
