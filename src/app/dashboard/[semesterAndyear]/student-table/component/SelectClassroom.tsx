import Dropdown from "@/components/elements/input/selected_input/Dropdown";
import React from "react";

type Props = {};

function SelectClassRoom({}: Props) {
  return (
    <>
      <div className="flex w-full items-center justify-between h-fit p-4 border border-[#EDEEF3]">
        <p>เลือกห้องเรียน</p>
        <Dropdown
          width={300}
          data={["ม.3/2", "ม.4/1", "ม.5/3", "ม.6/4"]}
          placeHolder="ม.6/4"
          renderItem={({data}) => (<>{data}</>)}
          currentValue={undefined}
          handleChange={undefined}
          searchFunciton={undefined}
        />
      </div>
    </>
  );
}

export default SelectClassRoom;
