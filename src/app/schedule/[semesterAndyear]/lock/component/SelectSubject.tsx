import Dropdown from "@/components/elements/input/selected_input/Dropdown";
import { CircularProgress } from "@mui/material";
import { useParams } from "next/navigation";
import React, { useEffect, useState, type JSX } from "react";
import { BsInfo } from "react-icons/bs";
import useSWR from "swr";

import { useSemesterSync } from "@/hooks";
import { getLockedRespsAction } from "@/features/assign/application/actions/assign.actions";
import type { InputChangeHandler } from "@/types/events";
import type { SubjectWithResponsibilities } from "@/types/lock-schedule";
import type { ActionResult } from "@/shared/lib/action-wrapper";

type Props = {
  currentValue: string;
  handleSubjectChange: (value: SubjectWithResponsibilities) => void;
  required: boolean;
};

function SelectSubject(props: Props) {
  const params = useParams();
  const { semester, academicYear } = useSemesterSync(params.semesterAndyear as string);
  
  const respData = useSWR(
    semester && academicYear
      ? ['locked-subjects', semester, academicYear]
      : null,
    async ([, sem, year]) => {
      return await getLockedRespsAction({
        Semester: `SEMESTER_${sem}` as 'SEMESTER_1' | 'SEMESTER_2',
        AcademicYear: parseInt(year),
      });
    },
    {
      //refreshInterval: 15000,
      revalidateOnMount: true,
    },
  );
  const [subject, setSubject] = useState<SubjectWithResponsibilities[]>([]);
  const [subjectFilter, setSubjectFilter] = useState<SubjectWithResponsibilities[]>([]);
  
  useEffect(() => {
    const result = respData.data as ActionResult<SubjectWithResponsibilities[]> | undefined;
    if (result?.success && result.data) {
      setSubject(result.data);
      setSubjectFilter(result.data);
    }
  }, [respData.isValidating, respData.data]);
  
  const searchHandle: InputChangeHandler = (event) => {
    const text = event.target.value;
    searchName(text);
  };
  
  const searchName = (name: string) => {
    const res = subjectFilter.filter((item) =>
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
