import Dropdown from "@/components/elements/input/selected_input/Dropdown";
import React from "react";
import { BsInfo } from "react-icons/bs";

type Props = {
  data: any;
  currentValue: string;
  handleSubjectChange: any;
  searchHandle: any;
  required:boolean;
};

function SelectSubject(props: Props) {
  return (
    <>
      <div className="flex justify-between w-full items-center">
        <div className="text-sm flex gap-1 items-center">
          <p>วิชา</p>
          <p className="text-red-500">*</p>
          {props.required ? (
          <div className="ml-3 flex gap-2 px-2 py-1 w-fit items-center bg-red-100 rounded">
            <BsInfo className="bg-red-500 rounded-full fill-white" />
            <p className="text-red-500 text-sm">ต้องการ</p>
          </div>
          ) : null}
        </div>
        <Dropdown
          data={props.data}
          renderItem={({ data }): JSX.Element => (
            <li className="w-full text-sm">
              {data.SubjectCode} {data.SubjectName}
            </li>
          )}
          width={300}
          height={40}
          currentValue={props.currentValue}
          placeHolder={"ตัวเลือก"}
          handleChange={props.handleSubjectChange}
          useSearchBar={true}
          searchFunciton={props.searchHandle}
        />
      </div>
    </>
  );
}

export default SelectSubject;
