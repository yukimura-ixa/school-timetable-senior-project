import Dropdown from "@/components/elements/input/selected_input/Dropdown";
import React from "react";

type Props = {};

function SelectTeacher({}: Props) {
  return (
    <>
      <div className="flex w-full items-center justify-between h-fit p-4 border border-[#EDEEF3]">
        <p>เลือกครู</p>
        <Dropdown
          width={300}
          data={["Hi"]}
          placeHolder="อเนก ประสงค์ - คณิตศาสตร์"
          renderItem={({data}) => (<>{data}</>)}
          currentValue={undefined}
          handleChange={undefined}
          searchFunciton={undefined}
        />
      </div>
    </>
  );
}

export default SelectTeacher;
