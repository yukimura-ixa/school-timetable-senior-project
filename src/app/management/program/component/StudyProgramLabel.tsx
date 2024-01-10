import TextField from "@/components/elements/input/field/TextField";
import React from "react";

type Props = { required: boolean };

const StudyProgramLabel = (props: Props) => {
  return (
    <div className="flex justify-between items-center">
      <div className="text-sm flex gap-1 items-center">
        <p>ชื่อหลักสูตร</p>
        <p className="text-red-500">*</p>
        {/* {props.required ? (
        <div className="ml-3 flex gap-2 px-2 py-1 w-fit items-center bg-red-100 rounded">
          <BsInfo className="bg-red-500 rounded-full fill-white" />
          <p className="text-red-500 text-sm">ต้องการ</p>
        </div>
      ) : null} */}
      </div>
      <TextField
        width={275}
        height="auto"
        placeHolder=""
        value={""}
        // borderColor={
        //   isEmptyData && teacher.Firstname.length == 0 ? "#F96161" : ""
        // }
        // handleChange={(e: any) => {
        //   let value: string = e.target.value;
        //   setTeachers(() =>
        //     teachers.map((item, ind) =>
        //       index === ind ? { ...item, Firstname: value } : item
        //     )
        //   );
        // }}
        disabled={false}
      />
    </div>
  );
};

export default StudyProgramLabel;
