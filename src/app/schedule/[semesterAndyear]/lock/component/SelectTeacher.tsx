import SearchBar from "@/components/mui/SearchBar";
import MiniButton from "@/components/elements/static/MiniButton";
import React, { Fragment, useEffect, useState } from "react";
import { BsInfo } from "react-icons/bs";

import type { subject, teacher } from "@/prisma/generated";

type Props = {
  subject?: subject;
  setTeacherList?: (teachers: teacher[]) => void;
  required?: boolean;
  teachers?: teacher[];
  teacherSelected?: teacher[];
  addTeacherFunction?: (teacher: teacher) => void;
  removeTeacherFunction?: (index: number) => void;
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
              {props.teachers?.map((item, index) => (
                <Fragment key={`teacherSelected${item.TeacherID}`}>
                  <MiniButton
                    handleClick={() => {}}
                    title={`${item.Firstname} - ${item.Department}`}
                    border={true}
                    buttonColor="#ffffff"
                    titleColor="#222222"
                    width="fit-content"
                    height={30}
                    borderColor="#888888"
                    isSelected={false}
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
