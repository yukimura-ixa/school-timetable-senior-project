"use client";
import { useGradeLevelData } from "@/app/_hooks/gradeLevelData";
import Loading from "@/app/loading";
import Dropdown from "@/components/elements/input/selected_input/Dropdown";
import { fetcher } from "@/libs/axios";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import useSWR from "swr";

type Props = {};

const page = (props: Props) => {
  const params = useParams();
  const [semester, academicYear] = (params.semesterAndyear as string).split(
    "-",
  ); //from "1-2566" to ["1", "2566"]
  const gradeLevelData = useGradeLevelData();
  const [currentGradeID, setCurrentGradeID] = useState("");
  const programOfGrade = useSWR(
    () =>
    currentGradeID !== "" &&
      `/program/programOfGrade?GradeID=` +
      currentGradeID +
      `&AcademicYear=` +
      academicYear +
      `&Semester=SEMESTER_` +
      semester,
    fetcher,
    { revalidateOnFocus: false },
  );
  const convertDropdownItem = (gradeID) => {
    return gradeID == "" ? "" : `ม.${gradeID[0]}/${parseInt(gradeID.substring(1))}`
  }
  return (
    <>
      {programOfGrade.isLoading || gradeLevelData.isLoading ? (
        <Loading />
      ) : (
        <>
        <div className="w-full flex justify-between p-3 items-center">
            <div onClick={() => console.log(currentGradeID)}>เลือกชั้นเรียน</div>
            <Dropdown
            width={300}
            data={gradeLevelData.data.map(item => item.GradeID)}
            renderItem={({data}) => <><li><p>ม.{data[0]}/{parseInt(data.substring(1))}</p></li></>}
            currentValue={convertDropdownItem(currentGradeID)}
            handleChange={(item) => setCurrentGradeID(item)}
            searchFunciton={undefined}
            />
        </div>
        {currentGradeID !== "" && 
        <>
            <div className="w-full h-10 border mt-6"></div>
        </>
        }
        </>
      )}
    </>
  );
};

export default page;
