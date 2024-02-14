import MiniButton from "@/components/elements/static/MiniButton";
import React, { Fragment, useEffect, useState } from "react";
import { BsInfo } from "react-icons/bs";
import { subject } from "@prisma/client";
import Dropdown from "@/components/elements/input/selected_input/Dropdown";

type Props = {
  subjectData: subject[];
  subjectSelected: any;
  addSubjectFunction: any;
  removeSubjectFunction: any;
  required: boolean;
};

function SelectSubjects(props: Props) {
  const [subjectFilter, setSubjectFilter] = useState<subject[]>(
    props.subjectData
  );

  const searchHandle = (event: React.ChangeEvent<HTMLInputElement>) => {
    // search คำที่พิมพ์ในช่องค้นหา
    const text = event.target.value;
    const newData = props.subjectData.filter((item) => {
      const itemData = `${item.SubjectCode} ${item.SubjectName}`;
      const textData = text.toLowerCase();
      return itemData.toLowerCase().indexOf(textData) > -1;
    });
    setSubjectFilter(newData);
  };

  return (
    <>
      <div className="flex flex-col gap-5 justify-between w-full">
        <div className="flex justify-between items-center relative">
          <div className="text-sm flex gap-1 items-center">
            <p>เลือกวิชา</p>
            <p className="text-red-500">*</p>
            {props.required ? (
              <div className="ml-3 flex gap-2 px-2 py-1 w-fit items-center bg-red-100 rounded">
                <BsInfo className="bg-red-500 rounded-full fill-white" />
                <p className="text-red-500 text-sm">ต้องการ</p>
              </div>
            ) : null}
          </div>
          {/* <SearchBar
            width={276}
            height={45}
            placeHolder="ค้นหาวิชา"
            handleChange={props.searchHandleSubject}
          />
          <div
            className={`${
              props.searchTextSubject.length == 0 ? "hidden" : null
            } absolute right-0 top-11 flex flex-col w-[276px] h-fit bg-white drop-shadow-sm border`}
          >
            <div className="w-full flex flex-col gap-1">
              {props.subjectData
                .filter((item) => !props.subjectSelected.includes(item))
                .map((item) => (
                  <Fragment key={`searchsubject-${item.SubjectCode}`}>
                    <li
                      onClick={() => props.addSubjectFunction(item)}
                      className="flex h-[60px] items-center hover:bg-cyan-100 hover:text-cyan-600 p-3 cursor-pointer duration-300"
                    >
                      <p className="text-sm">
                        {item.SubjectCode} - {item.SubjectName}
                      </p>
                    </li>
                  </Fragment>
                ))}
            </div>
          </div> */}
          <div className="flex flex-row justify-between gap-3">
            <Dropdown
              data={subjectFilter}
              renderItem={({ data }) => (
                <li className="w-full text-sm">
                  {data.SubjectCode} - {data.SubjectName}
                </li>
              )}
              width={276}
              height="45"
              currentValue={""}
              handleChange={(data: any) => {
                props.addSubjectFunction(data);
              }}
              placeHolder="เลือกวิชา"
              useSearchBar={true}
              searchFunciton={searchHandle}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-3 justify-end">
          {props.subjectSelected.map((item, index) => (
            <Fragment key={`subjectSelected${item.SubjectCode}`}>
              <MiniButton
                handleClick={() => props.removeSubjectFunction(index)}
                isSelected={true}
                title={`${item.SubjectCode} - ${item.SubjectName}`}
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
      </div>
    </>
  );
}

export default SelectSubjects;
