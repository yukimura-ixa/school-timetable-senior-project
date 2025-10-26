"use client";
import { useGradeLevelData } from "@/app/_hooks/gradeLevelData";
import Loading from "@/app/loading";
import Dropdown from "@/components/elements/input/selected_input/Dropdown";
import PrimaryButton from "@/components/mui/PrimaryButton";
import { fetcher } from "@/libs/axios";
import { subjectCreditTitles } from "@/models/credit-titles";
import { useParams } from "next/navigation";
import React, { Fragment, useState, type JSX } from "react";
import useSWR from "swr";
import ExportAllProgram from "./function/ExportAllProgram";
import { subjectCreditValues } from "@/models/credit-value";
import { isUndefined } from "swr/_internal";

type Props = {};

const page = (props: Props) => {
  const params = useParams();
  const [semester, academicYear] = (params.semesterAndyear as string).split(
    "-",
  ); //from "1-2566" to ["1", "2566"]
  
  // Ensure semester and academicYear are defined
  if (!semester || !academicYear) {
    return <Loading />;
  }
  
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
  const convertDropdownItem = (gradeID: string) => {
    return gradeID == ""
      ? ""
      : `ม.${gradeID[0]}/${parseInt(gradeID.substring(1))}`;
  };
  const primarySubjectData = () => {
    if (!programOfGrade.isLoading) {
      return sortSubjectCategory(programOfGrade.data.subjects.filter(
        (item: any) => item.Category == "พื้นฐาน",
      ));
    } else {
      return [];
    }
  };
  const extraSubjectData = () => {
    if (!programOfGrade.isLoading) {
      return sortSubjectCategory(programOfGrade.data.subjects.filter(
        (item: any) => item.Category == "เพิ่มเติม",
      ));
    } else {
      return [];
    }
  };
  const activitiesSubjectData = () => {
    if (!programOfGrade.isLoading) {
      return sortSubjectCategory(programOfGrade.data.subjects.filter(
        (item: any) => item.Category == "กิจกรรมพัฒนาผู้เรียน",
      ));
    } else {
      return [];
    }
  };
  const TableHead = (): JSX.Element => (
    <>
    <tr className="bg-emerald-300 h-10 text-center font-bold">
      <td colSpan={5}>โครงสร้างหลักสูตร มัธยมศึกษาปีที่ {currentGradeID[0]}/{parseInt(currentGradeID.substring(1))} ภาคเรียนที่ {semester} ปีการศึกษา {academicYear}</td>
    </tr>
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
    </>
  );
  const CategoryTablerow = (props: any): JSX.Element => (
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
  const SubjectDataRow = (props: any): JSX.Element =>
    props.data.map((item: any, index: number) => (
      <Fragment key={`${programOfGrade.data.GradeID}-${item.SubjectCode}`}>
        <DataList
          index={props.indexStart + index}
          SubjectCode={item.SubjectCode}
          SubjectName={item.SubjectName}
          Credit={item.Credit}
          Category={item.Category}
          TeacherFullName={
            item.teachers.length == 1 ? item.teachers[0].TeacherFullName : ""
          }
        />
      </Fragment>
    ));
  const DataList = (props: any): JSX.Element => (
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
        <p>{props.Category == "กิจกรรมพัฒนาผู้เรียน" ? "" : subjectCreditTitles[props.Credit]}</p>
      </td>
      <td className="">
        <p>{props.TeacherFullName}</p>
      </td>
    </tr>
  );
  const SumCredit = (props: any): JSX.Element => (
    <tr className="h-10 bg-cyan-100">
      <td></td>
      <td></td>
      <td className="font-bold">{props.title}</td>
      <td className="text-center font-bold">{props.credit.toFixed(1)}</td>
      <td className="text-left font-bold">หน่วยกิต</td>
    </tr>
  )
  const getSumCreditValue = () => {
    if (!programOfGrade.isLoading) {
      return programOfGrade.data.subjects.filter(
        (item: any) => item.Category !== "กิจกรรมพัฒนาผู้เรียน",
      ).reduce((a: number, b: any) => a + (subjectCreditValues[b.Credit] ?? 0), 0);
    } else {
      return 0;
    }
  }
  const sortSubjectCategory = (data: any[]) => {
    //ท ค ว ส พ ศ ก อ
    let SubjectCodeVal: Record<string, number> = {"ท" : 1, "ค" : 2, "ว" : 3, "ส" : 4, "พ" : 5, "ศ" : 6, "ก" : 7, "อ" : 8}
    let sortedData = data.sort((a: any, b: any) => {
      let getVal = (sCode: string) => {
        return isUndefined(SubjectCodeVal[sCode]) ? 9 : (SubjectCodeVal[sCode] ?? 9)
      }
      if(getVal(a.SubjectCode[0]) < getVal(b.SubjectCode[0])){
        return -1;
      }
      if(getVal(a.SubjectCode[0]) > getVal(b.SubjectCode[0])){
        return 1;
      }
      return 0
    })
    return sortedData;
  }
  return (
    <>
      {programOfGrade.isLoading || gradeLevelData.isLoading ? (
        <Loading />
      ) : (
        <div className="flex flex-col gap-3">
          <div className="w-full flex justify-between items-center">
            <div>
              เลือกชั้นเรียน
            </div>
            <Dropdown
              width={300}
              data={gradeLevelData.data.map((item) => item.GradeID)}
              renderItem={({ data }: { data: any }) => (
                <>
                  <li>
                    <p>
                      ม.{data[0]}/{parseInt(data.substring(1))}
                    </p>
                  </li>
                </>
              )}
              placeHolder="เลือกชั้นเรียน"
              currentValue={convertDropdownItem(currentGradeID)}
              handleChange={(item: any) => setCurrentGradeID(item)}
              searchFunction={undefined}
            />
          </div>
          <div style={{display : currentGradeID == "" ? "none" : 'flex'}} className="w-full items-center flex justify-end">
            <PrimaryButton
              handleClick={() =>
                ExportAllProgram(
                  programOfGrade.data,
                  currentGradeID,
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
                <CategoryTablerow categoryName={`สาระการเรียนรู้พิ้นฐาน`} />
                <SubjectDataRow data={primarySubjectData()} indexStart={1} />
                <SumCredit title={"รวมหน่วยกิตสาระการเรียนรู้พิ้นฐาน"} credit={primarySubjectData().reduce((a, b) => a + subjectCreditValues[b.Credit], 0)}/>
                <CategoryTablerow categoryName={`สาระการเรียนรู้เพิ่มเติม`} />
                <SubjectDataRow data={extraSubjectData()} indexStart={primarySubjectData().length + 1} />
                <SumCredit title={"รวมหน่วยกิตสาระการเรียนรู้เพิ่มเติม"} credit={extraSubjectData().reduce((a, b) => a + subjectCreditValues[b.Credit], 0)}/>
                <CategoryTablerow categoryName={`กิจกรรมพัฒนาผู้เรียน`} />
                <SubjectDataRow data={activitiesSubjectData()} indexStart={primarySubjectData().length + extraSubjectData().length + 1} />
                <SumCredit title={"รวมหน่วยกิตทั้งหมด"} credit={getSumCreditValue()}/>
              </table>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default page;
