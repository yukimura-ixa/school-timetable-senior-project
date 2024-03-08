import { useGradeLevelData } from "@/app/_hooks/gradeLevelData";
import Loading from "@/app/loading";
import Dropdown from "@/components/elements/input/selected_input/Dropdown";
import React, { useState } from "react";

type Props = {
  setGradeID: Function;
  currentClassRoom: any
};

function SelectClassRoom(props: Props) {
  // TODO: รอได้ get class api แล้วค่อยทำ current
  const allClassRoom = useGradeLevelData()
  const current = props.currentClassRoom
  const [classRoom, setClassRoom] = useState(`ม.1/1`)
  return (
    <>
      {allClassRoom.isLoading ? <Loading /> :
        <div className="flex w-full items-center justify-between h-fit p-4 border border-[#EDEEF3]">
        <p>เลือกห้องเรียน</p>
        <Dropdown
          width={300}
          data={allClassRoom.data}
          placeHolder="ตัวเลือก"
          renderItem={({data}) => (<li><p>{`ม.${data.GradeID[0]}/${parseInt(data.GradeID.substring(1))}`}</p></li>)}
          currentValue={classRoom}
          handleChange={(data) => {
            setClassRoom(`ม.${data.GradeID[0]}/${parseInt(data.GradeID.substring(1))}`)
            props.setGradeID(data.GradeID)
          }}
          searchFunciton={undefined}
        />
      </div>
      }
    </>
  );
}

export default SelectClassRoom;
