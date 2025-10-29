import Dropdown from "@/components/elements/input/selected_input/Dropdown";
import { fetcher } from "@/libs/axios";
import { CircularProgress } from "@mui/material";
import type { subject } from "@/prisma/generated";
import { useParams } from "next/navigation";
import React, { useEffect, useState, type JSX } from "react";
import { BsInfo } from "react-icons/bs";
import useSWR from "swr";

import type { InputChangeHandler } from "@/types/events";
import type { SubjectWithResponsibilities } from "@/types/lock-schedule";

type Props = {
  currentValue: string;
  handleSubjectChange: (value: SubjectWithResponsibilities) => void;
  required: boolean;
};

function SelectSubject(props: Props) {
  const params = useParams();
  const [semester, academicYear] = (params.semesterAndyear as string).split(
    "-",
  ); //from "1-2566" to ["1", "2566"]
  const respData = useSWR(
    `assign/getLockedResp?Semester=${semester}&AcademicYear=${academicYear}`,
    fetcher,
    {
      //refreshInterval: 15000,
      revalidateOnMount: true,
    },
  );
  const [subject, setSubject] = useState<SubjectWithResponsibilities[]>([]);
  const [subjectFilter, setSubjectFilter] = useState<SubjectWithResponsibilities[]>([]);
  const [searchText, setSearchText] = useState("");
  useEffect(() => {
    if (respData.data) {
      setSubject(() => respData.data);
      setSubjectFilter(() => respData.data);
    }
  }, [respData.isValidating]);
  const searchHandle: InputChangeHandler = (event) => {
    let text = event.target.value;
    setSearchText(text);
    searchName(text);
  };
  const searchName = (name: string) => {

    let res = subjectFilter.filter((item) =>
      `${item.SubjectCode} ${item.SubjectName}`.match(name),
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
        {!respData.isValidating ? (
          <Dropdown
            data={subject}
            renderItem={({ data }: { data: SubjectWithResponsibilities }): JSX.Element => (
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
            searchFunction={searchHandle}
          />
        ) : (
          <CircularProgress size={20} />
        )}
      </div>
    </>
  );
}

export default SelectSubject;
