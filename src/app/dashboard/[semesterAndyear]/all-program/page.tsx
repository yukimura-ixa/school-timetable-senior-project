"use client";
import { useGradeLevelData } from "@/app/_hooks/gradeLevelData";
import Loading from "@/app/loading";
import Dropdown from "@/components/elements/input/selected_input/Dropdown";
import PrimaryButton from "@/components/elements/static/PrimaryButton";
import { fetcher } from "@/libs/axios";
import { subjectCreditTitles } from "@/models/credit-titles";
import { useParams } from "next/navigation";
import React, { Fragment, useState } from "react";
import useSWR from "swr";
import ExportAllProgram from "./function/ExportAllProgram";

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
    return gradeID == ""
      ? ""
      : `ม.${gradeID[0]}/${parseInt(gradeID.substring(1))}`;
  };
  const primarySubjectData = () => {
    if (!programOfGrade.isLoading) {
      return programOfGrade.data.subjects.filter(
        (item) => item.Category == "พื้นฐาน",
      );
    } else {
      return [];
    }
  };
  const extraSubjectData = () => {
    if (!programOfGrade.isLoading) {
      return programOfGrade.data.subjects.filter(
        (item) => item.Category == "เพิ่มเติม",
      );
    } else {
      return [];
    }
  };
  const activitiesSubjectData = () => {
    if (!programOfGrade.isLoading) {
      return programOfGrade.data.subjects.filter(
        (item) => item.Category == "กิจกรรมพัฒนาผู้เรียน",
      );
    } else {
      return [];
    }
  };
  const TableHead = (): JSX.Element => (
    <tr className="bg-emerald-200 h-10">
      <th className="">
        <p>ลำดับ</p>
      </th>
      <th className="">
        <p>รหัสวิชา</p>
      </th>
      <th className="">
        <p>ชื่อวิชา</p>
      </th>
      <th className="">
        <p>หน่วยกิต</p>
      </th>
      <th className="">
        <p>ครูผู้สอน</p>
      </th>
    </tr>
  );
  const CategoryTablerow = (props): JSX.Element => (
    <tr className="h-10 bg-blue-100">
      <td></td>
      <td></td>
      <td>
        <p className="font-bold">{props.categoryName}</p>
      </td>
      <td></td>
      <td></td>
    </tr>
  );
  const SubjectDataRow = (props): JSX.Element =>
    props.data.map((item, index) => (
      <Fragment key={`${programOfGrade.data.GradeID}-${item.SubjectCode}`}>
        <DataList
          index={props.indexStart + index}
          SubjectCode={item.SubjectCode}
          SubjectName={item.SubjectName}
          Credit={item.Credit}
          TeacherFullName={
            item.teachers.length !== 0 ? item.teachers[0].TeacherFullName : ""
          }
        />
      </Fragment>
    ));
  const DataList = (props): JSX.Element => (
    <tr className="h-10" style={{backgroundColor : props.index % 2 == 0 ? "#f0f0f0" : "white" }}>
      <td className="text-center">
        <p>{props.index}</p>
      </td>
      <td className="text-center">
        <p>{props.SubjectCode}</p>
      </td>
      <td className="">
        <p>{props.SubjectName}</p>
      </td>
      <td className="text-center">
        <p>{subjectCreditTitles[props.Credit]}</p>
      </td>
      <td className="">
        <p>{props.TeacherFullName}</p>
      </td>
    </tr>
  );
  return (
    <>
      {programOfGrade.isLoading || gradeLevelData.isLoading ? (
        <Loading />
      ) : (
        <div className="flex flex-col gap-3">
          <div className="w-full flex justify-between items-center">
            <div onClick={() => console.log(programOfGrade)}>
              เลือกชั้นเรียน
            </div>
            <Dropdown
              width={300}
              data={gradeLevelData.data.map((item) => item.GradeID)}
              renderItem={({ data }) => (
                <>
                  <li>
                    <p>
                      ม.{data[0]}/{parseInt(data.substring(1))}
                    </p>
                  </li>
                </>
              )}
              currentValue={convertDropdownItem(currentGradeID)}
              handleChange={(item) => setCurrentGradeID(item)}
              searchFunciton={undefined}
            />
          </div>
          <div className="w-full items-center flex justify-end">
            <PrimaryButton
              handleClick={() =>
                ExportAllProgram(
                  programOfGrade.data,
                  setCurrentGradeID,
                  semester,
                  academicYear,
                )
              }
              title={"นำออกเป็น Excel"}
              color={"info"}
              Icon={undefined}
              reverseIcon={false}
              isDisabled={programOfGrade.isLoading}
            />
          </div>
          {currentGradeID !== "" && (
            <>
              <table>
                <TableHead />
                <CategoryTablerow categoryName={`วิชาพิ้นฐาน`} />
                <SubjectDataRow data={primarySubjectData()} indexStart={1} />
                <CategoryTablerow categoryName={`วิชาเพิ่มเติม`} />
                <SubjectDataRow data={extraSubjectData()} indexStart={primarySubjectData().length + 1} />
                <CategoryTablerow categoryName={`กิจกรรมพัฒนาผู้เรียน`} />
                <SubjectDataRow data={activitiesSubjectData()} indexStart={primarySubjectData().length + extraSubjectData().length + 1} />
              </table>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default page;
