import Dropdown from "@/components/elements/input/selected_input/Dropdown";
import { fetcher } from "@/libs/axios";
import { CircularProgress } from "@mui/material";
import { subject } from "@prisma/client";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { BsInfo } from "react-icons/bs";
import useSWR from "swr";

type Props = {
  currentValue: string;
  handleSubjectChange: any;
  required: boolean;
  teachers: any;
};

function SelectSubject(props: Props) {
  const params = useParams();
  const [semester, academicYear] = (params.semesterAndyear as string).split(
    "-"
  ); //from "1-2566" to ["1", "2566"]; //from "1-2566" to ["1", "2566"]
  const teacherIDs = props.teachers.map((teacher) => teacher.TeacherID);
  const teacherIDpath = teacherIDs.join("&TeacherID=");
  const respData = useSWR(
    teacherIDs.length > 0
      ? `assign/getLockedResp?Semester=${semester}&AcademicYear=${academicYear}&TeacherID=${teacherIDpath}`
      : [],
    fetcher
  );
  const [subject, setSubject] = useState<subject[]>([]);
  const [subjectFilter, setSubjectFilter] = useState<subject[]>([]);
  const [searchText, setSearchText] = useState("");
  useEffect(() => {
    if (respData.data) {
      setSubject(() => respData.data);
      setSubjectFilter(() => respData.data);
    }
  }, [respData.isValidating, teacherIDs]);
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
        {teacherIDs.length == 0 ? (
          <p className="text-sm text-red-500">*กรุณาเลือกครู</p>
        ) : !respData.isValidating ? (
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
        ) : (
          <CircularProgress size={20} />
        )}
      </div>
    </>
  );
}

export default SelectSubject;
