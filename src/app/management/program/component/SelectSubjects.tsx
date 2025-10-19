import MiniButton from "@/components/elements/static/MiniButton";
import React, { Fragment, useEffect, useState } from "react";
import { BsInfo } from "react-icons/bs";
import { subject } from "@prisma/client";
import Dropdown from "@/components/elements/input/selected_input/Dropdown";
import { CircularProgress } from "@mui/material";
import useSWR from "swr";
import { fetcher } from "@/libs/axios";

type Props = {
  subjectSelected: any;
  addSubjectFunction: any;
  removeSubjectFunction: any;
  required: boolean;
};

function SelectSubjects(props: Props) {
  const subjectData = useSWR("/subject/notInPrograms", fetcher, {
    // refreshInterval: 15000,
    revalidateOnMount: true,

  });
  const [subjectFilter, setSubjectFilter] = useState<subject[]>([]);

  useEffect(() => {
    const propsSubjectCodes = props.subjectSelected.map(
      (item) => item.SubjectCode,
    );
    if (!subjectData.isValidating) {
      const notDuplicate = subjectData.data.filter(
        (item) => !propsSubjectCodes.includes(item.SubjectCode),
      );

      setSubjectFilter(() => notDuplicate);
    }
  }, [props.subjectSelected, subjectData.isValidating]);

  const searchHandle = (event: React.ChangeEvent<HTMLInputElement>) => {
    // search คำที่พิมพ์ในช่องค้นหา
    const text = event.target.value;
    const newData = subjectFilter.filter((item) => {
      const itemData = `${item.SubjectCode} ${item.SubjectName}`;
      const textData = text.toLowerCase();
      return itemData.toLowerCase().match(textData);
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
          <div className="flex flex-row justify-between gap-3">
            {!subjectData.data ? (
              <CircularProgress />
            ) : (
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
                searchFunction={searchHandle}
              />
            )}
          </div>
        </div>
        <div className="max-h-20 overflow-y-scroll">
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
      </div>
    </>
  );
}

export default SelectSubjects;
