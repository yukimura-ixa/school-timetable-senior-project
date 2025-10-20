import SearchBar from "@/components/mui/SearchBar";
import MiniButton from "@/components/elements/static/MiniButton";
import { subject, teacher } from "@prisma/client";
import React, { Fragment, useEffect, useState } from "react";
import { BsInfo } from "react-icons/bs";

type Props = {
  subject: any;
  setTeacherList: any;
  required: boolean;
  teachers: teacher[];
};

function SelectTeacher(props: Props) {
  return (
    <>
      <div className="flex flex-col gap-5 justify-between w-full">
        <div className="flex justify-between items-center relative">
          <div className="text-sm flex gap-1 items-center">
            <p>ครู</p>
            <p className="text-red-500">*</p>
            {props.required ? (
              <div className="ml-3 flex gap-2 px-2 py-1 w-fit items-center bg-red-100 rounded">
                <BsInfo className="bg-red-500 rounded-full fill-white" />
                <p className="text-red-500 text-sm">ต้องการ</p>
              </div>
            ) : null}
          </div>
          {!props.subject ? (
            <div className="flex flex-wrap gap-3 w-[230px] relative">
              <p className="text-sm text-red-500 absolute right-0">
                *กรุณาเลือกวิชา
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3 justify-end">
              {props.teachers.map((item, index) => (
                <Fragment key={`teacherSelected${item.TeacherID}`}>
                  <MiniButton
                    handleClick={undefined}
                    title={`${item.Firstname} - ${item.Department}`}
                    border={true}
                    buttonColor={""}
                    titleColor={""}
                    width={""}
                    height={""}
                    borderColor={""}
                    hoverable={false}
                  />
                </Fragment>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default SelectTeacher;
