import MiniButton from "@/components/elements/static/MiniButton";
import React, { Fragment, useEffect, useState } from "react";
import { BsInfo } from "react-icons/bs";
import type { subject } from "@/prisma/generated/client";
import Dropdown from "@/components/elements/input/selected_input/Dropdown";
import { CircularProgress } from "@mui/material";
import useSWR from "swr";

// Server Actions
import { getSubjectsAction } from "@/features/subject/application/actions/subject.actions";

type Props = {
  subjectSelected: any;
  addSubjectFunction: any;
  removeSubjectFunction: any;
  required: boolean;
  searchHandleSubject?: any;
  searchTextSubject?: string;
};

function SelectSubjects(props: Props) {
  const subjectData = useSWR(
    "subjects-not-in-programs",
    async () => {
      try {
        const result = await getSubjectsAction({});
        if (!result.success) {
          throw new Error(result.error?.message ?? "Failed to fetch subjects");
        }
        // Filter subjects that are not already in programs
        // Note: Original endpoint was /subject/notInPrograms which filtered on backend
        // For now we return all subjects and filter on client side
        return result.data || [];
      } catch (error) {
        console.error("Error fetching subjects:", error);
        return [];
      }
    },
    {
      revalidateOnMount: true,
    },
  );
  const [subjectFilter, setSubjectFilter] = useState<subject[]>([]);

  useEffect(() => {
    const propsSubjectCodes = props.subjectSelected.map(
      (item: any) => item.SubjectCode,
    );
    if (!subjectData.isValidating && subjectData.data) {
      const notDuplicate = subjectData.data.filter(
        (item: subject) => !propsSubjectCodes.includes(item.SubjectCode),
      );

      setSubjectFilter(() => notDuplicate);
    }
  }, [props.subjectSelected, subjectData.isValidating, subjectData.data]);

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
                renderItem={({ data }: { data: any }) => (
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
            {props.subjectSelected.map((item: any, index: number) => (
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
