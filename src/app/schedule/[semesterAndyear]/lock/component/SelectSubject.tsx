import { useSubjectData } from "@/app/_hooks/subjectData";
import Dropdown from "@/components/elements/input/selected_input/Dropdown";
import { subject } from "@prisma/client";
import React, { useEffect, useState } from "react";
import { BsInfo } from "react-icons/bs";

type Props = {
  currentValue: string;
  handleSubjectChange: any;
  required:boolean;
};

function SelectSubject(props: Props) {
  const {data, isLoading, error, mutate} = useSubjectData();
  const [subject, setSubject] = useState<subject[]>([]);
  const [subjectFilter, setSubjectFilter] = useState<subject[]>([]);
  const [searchText, setSearchText] = useState("");
  useEffect(() => {
    if(!isLoading){
      setSubject(() => data);
      setSubjectFilter(() => data);
    }
  }, [isLoading])
  const searchHandle = (event: any) => {
    let text = event.target.value;
    setSearchText(text);
    searchName(text);
  };
  const searchName = (name: string) => {
    //อันนี้แค่ทดสอบเท่านั่น ยังคนหาได้ไม่สุด เช่น ค้นหาแบบตัด case sensitive ยังไม่ได้
    let res = subjectFilter.filter((item) =>
      `${item.SubjectCode} ${item.SubjectName}`.match(name)
    );
    setSubject(res);
  };
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
          data={subject}
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
          searchFunciton={searchHandle}
        />
      </div>
    </>
  );
}

export default SelectSubject;
