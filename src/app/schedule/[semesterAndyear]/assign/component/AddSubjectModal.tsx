import Dropdown from "@/components/elements/input/selected_input/Dropdown";
import React, { Fragment, useEffect, useState, type JSX } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { TbTrash } from "react-icons/tb";
import type { subject } from '@/prisma/generated/client';
import { subject_credit } from '@/models/credit-value';
import { SubjectCategory } from '@/models/subject-category';
import Loading from "@/app/loading";
import { useParams, useSearchParams } from "next/navigation";
import { subjectCreditValues } from "@/models/credit-value";
import useSWR from "swr";

import { useSemesterSync } from "@/hooks";
import { getSubjectsByGradeAction } from "@/features/subject/application/actions/subject.actions";
import type { ModalCloseHandler, InputChangeHandler } from "@/types/events";

type SubjectAssignment = subject & {
  TeachHour?: number;
  AcademicYear?: number;
  Semester?: string;
  GradeID?: string;
  TeacherID?: number;
};

type Props = {
  closeModal: ModalCloseHandler;
  addSubjectToClass: (subjects: SubjectAssignment[]) => void;
  classRoomData: { Year: number; GradeID: string; Number: number };
  currentSubject: SubjectAssignment[];
  subjectByGradeID: SubjectAssignment[];
};

function AddSubjectModal(props: Props) {
  const [subject, setSubject] = useState<subject[]>([]); //เก็บรายวิชาที่ fetch มา
  const [subjectFilter, setSubjectFilter] = useState<subject[]>([]); //กรองรายวิชาที่ค้นหาเพื่อนำมาแสดง
  const [searchText, setSearchText] = useState<string>(""); //เก็บtextค้นหารายวิชา
  const [subjectList, setSubjectList] = useState<SubjectAssignment[]>([]); //เก็บวิชาที่เพิ่มใหม่
  const [currentSubject, setCurrentSubject] = useState<SubjectAssignment[]>(
    props.currentSubject || [],
  ); //รายวิชาทั้งหมดที่เคยมี
  const [subjectByGradeID, setSubjectByGradeID] = useState<SubjectAssignment[]>(
    props.subjectByGradeID || [],
  ); //รายวิชาของชั้นเรียนทีส่งมา
  const params = useParams();
  const { semester, academicYear } = useSemesterSync(params.semesterAndyear as string);
  
  const { data, isLoading, isValidating } = useSWR(
    props.classRoomData?.GradeID
      ? ['subjects-by-grade', props.classRoomData.GradeID]
      : null,
    async ([, gradeId]) => {
      return await getSubjectsByGradeAction({ GradeID: gradeId });
    },
    {
      //refreshInterval: 15000,
      revalidateOnMount: true,
    },
  ); //เรียกข้อมูลวิชาทั้งหมดของชั้นเรียนที่ส่งมา
  const searchTeacherID = useSearchParams().get("TeacherID");
  useEffect(() => {
    if (!isValidating && data && 'success' in data && data.success && data.data) {
      const subjects = data.data;
      setSubject(subjects);
      const filterData = subjects.filter(
        (item) =>
          !subjectByGradeID
            .map((item) => item.SubjectCode)
            .includes(item.SubjectCode) &&
          !subjectByGradeID
            .map((item) => item.SubjectName)
            .includes(item.SubjectName),
      ); //filterData มาตอนแรกเลยจะกรองวิชาที่เคยมีแล้วออกไปจาก dropdown โดยเช็คจากชื่อวิชาและรหัสวิชา
      setSubject(filterData);
      setSubjectFilter(filterData); //ที่set ทั้งสองตัวแปรเพราะว่าอันนึงไว้แสดง อันนึงไว้ search หาข้อมูลแล้วนำมา set ข้อมูลให้ตัวแปร subject เรื่อยๆ
    }
  }, [isValidating]);
  useEffect(() => {
    //กรองวิชาที่เคยมีอยู่แล้วออกไปจาก dropdown โดยเช็คจากชื่อวิชาและรหัสวิชา
    if (!data || !('success' in data) || !data.success || !data.data) return;
    const subjects = data.data;
    const filterDataR1 = subjects.filter(
      (item) =>
        !subjectByGradeID
          .map((item) => item.SubjectCode)
          .includes(item.SubjectCode) &&
        !subjectByGradeID
          .map((item) => item.SubjectName)
          .includes(item.SubjectName),
    );
    const filterDataR2 = filterDataR1.filter(
      (item) =>
        !subjectList
          .map((item) => item.SubjectCode)
          .includes(item.SubjectCode) &&
        !subjectList.map((item) => item.SubjectName).includes(item.SubjectName),
    ); //R1 กับ R2 คือไร R1 คือกรองกับวิชาที่เคยเพิ่มอยู่แล้วตั้งแต่แรก R2 คือเมื่อเพิ่มวิชาไปใหม่ก็เอามากรองด้วย ไม่ให้ dropdown มีวิชาซ้ำจากรายวิชาที่แสดงอยู่บน modal
    setSubjectFilter(filterDataR2);
    setSubject(filterDataR2);
  }, [subjectList, currentSubject]); //useEffect นี้จะทำงานก็ต่อเมื่อมีการเพิ่มหรือลบวิชาอะไรซักอันนึง
  const addSubjectToList = (item: SubjectAssignment) => {
    setSubjectList(() => [...subjectList, item]);
  };
  const removeFromSubjectList = (index: number) => {
    setSubjectList(() => subjectList.filter((item, ind) => ind != index));
  };
  const removeCurrentSubject = (subject: SubjectAssignment) => {
    // การลบวิชาที่เคยมีอยู่แล้วออกไป ทำไมถึงต้องทำอะไรกับตัวแปรตั้งสองตัว??
    // currentSubject จะเก็บวิชาทั้งหมดตั้งแต่มอหนึ่งถึงหก
    // subjectByGradeID จะเก็บวิชาของมอนั้นๆ
    // เราจะแยกให้ byGradeID เป็นตัวนำมาแสดงในหน้าเว็บและ current จะเป็นตัวหลักเพื่อไปอัปเดตข้อมูลกับหน้ามอบหมาย
    // พอกดลบวิชาปัจจุบัน เราจะทำการหา index เพื่อใช้ลบข้อมูลโดยที่จะให้ทั้งสองอาร์เรย์นั้นลบข้อมูลพร้อมกันและสัมพันธ์กันเพื่อลบข้อมูลออกไป
    const indexMain = currentSubject.indexOf(subject);
    const indexSub = subjectByGradeID.indexOf(subject);
    setCurrentSubject(() =>
      currentSubject.filter((item, ind) => ind != indexMain),
    );
    setSubjectByGradeID(() =>
      subjectByGradeID.filter((item, ind) => ind != indexSub),
    );
  };
  const confirmToAddSubjectToClass = () => {
    //check ว่าถ้าเลือกวิชาครบแล้วให้เพิ่มลงชั้นเรียน
    const mergeCurrentAndNewSubjects = [...currentSubject, ...subjectList];
    if (!findNullData()) {
      props.addSubjectToClass(mergeCurrentAndNewSubjects);
      props.closeModal();
    }
  };
  const findNullData = (): boolean => {
    const findNull = subjectList.map((item) => item.SubjectCode);
    return findNull.includes("");
  };
  const searchName = (name: string) => {
    //อันนี้แค่ทดสอบเท่านั่น ยังคนหาได้ไม่สุด เช่น ค้นหาแบบตัด case sensitive ยังไม่ได้
    const res = subjectFilter.filter((item) =>
      `${item.SubjectCode} - ${item.SubjectName}`.match(name),
    );
    setSubject(res);
  };
  const searchHandle: InputChangeHandler = (event) => {
    const text = event.target.value;
    setSearchText(text);
    searchName(text);
  };
  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <div
          style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
          className="z-40 flex w-full h-screen items-center justify-center fixed left-0 top-0"
        >
          <div className="flex flex-col w-[550px] h-auto p-[50px] gap-8 bg-white rounded">
            {/* Content */}
            <div className="flex flex-col w-full gap-3 h-auto">
              <div className="flex justify-between">
                <p
                  className="text-lg select-none"
                  onClick={() => console.log(subjectList)}
                >
                  เลือกวิชาที่รับผิดชอบ
                </p>
                <AiOutlineClose
                  className="cursor-pointer"
                  onClick={props.closeModal}
                />
              </div>
              <p className="text-xs text-gray-300">
                เลือกวิชาเรียนที่ต้องสอนในห้อง ม.{props.classRoomData.Year}/
                {props.classRoomData.GradeID.toString()[2]}
              </p>
            </div>
            {/* กดเพื้อเพิ่มวิชา */}
            <div className="flex flex-col gap-3">
              <u
                className="text-sm text-blue-500 cursor-pointer"
                onClick={() =>
                  addSubjectToList(
                    //Add default value to array
                    {
                      AcademicYear: parseInt(academicYear),
                      GradeID: props.classRoomData.GradeID,
                      Semester: `SEMESTER_${semester}` as any,
                      SubjectCode: "",
                      SubjectName: "",
                      Credit: "CREDIT_10" as subject_credit,
                      TeacherID: searchTeacherID ? parseInt(searchTeacherID) : undefined,
                      Category: SubjectCategory.CORE,
                      LearningArea: null,
                      ActivityType: null,
                      IsGraded: true,
                      Description: "",
                    },
                  )
                }
              >
                เพิ่มวิชา
              </u>
            </div>
            <div className="flex flex-col gap-3">
              {subjectByGradeID.map((subject, index) => (
                <Fragment
                  key={`current${subject.SubjectCode}${subject.Semester}${subject.AcademicYear}`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex w-[250px] h-fit p-3 items-center border rounded bg-gray-100">
                      <p className="text-sm text-gray-500 select-none">
                        {subject.SubjectCode} - {subject.SubjectName}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <p className="text-sm text-gray-500">
                        จำนวน {subject.Credit ? (subjectCreditValues[subject.Credit] ?? 0) * 2 : 0} คาบ
                      </p>
                      <TbTrash
                        onClick={() => removeCurrentSubject(subject)}
                        size={20}
                        className="text-red-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </Fragment>
              ))}
              {subjectList.map((item, index) => (
                <Fragment key={`${item.SubjectCode} ${index}`}>
                  {/* List วิชาต่างๆ */}
                  <div className="flex justify-between items-center">
                    <Dropdown
                      data={subject}
                      renderItem={({ data }: { data: unknown }): JSX.Element => {
                        const subjectData = data as subject;
                        return (
                          <li className="text-sm">
                            {subjectData.SubjectCode} - {subjectData.SubjectName}
                          </li>
                        );
                      }}
                      width={250}
                      height={"fit-content"}
                      currentValue={`${
                        item.SubjectCode === ""
                          ? ""
                          : `${item.SubjectCode} - ${item.SubjectName}`
                      }`}
                      placeHolder="เลือกวิชา"
                      handleChange={(item: unknown) => {
                        const subjectItem = item as subject;
                        setSubjectList((prevList) =>
                          prevList.map((listItem, ind) =>
                            ind === index 
                              ? {
                                  ...listItem,
                                  SubjectCode: subjectItem.SubjectCode,
                                  SubjectName: subjectItem.SubjectName,
                                  Credit: subjectItem.Credit,
                                }
                              : listItem,
                          ),
                        );
                      }}
                      useSearchBar={true}
                      searchFunction={searchHandle}
                    />
                    <div className="flex justify-between gap-5 items-center">
                      <div className="flex gap-3">
                        <p className="text-sm text-gray-500">
                          จำนวน {item.Credit ? (subjectCreditValues[item.Credit] ?? 0) * 2 : "0"}{" "}
                          คาบ
                        </p>
                        <TbTrash
                          onClick={() => removeFromSubjectList(index)}
                          size={20}
                          className="text-red-500 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </Fragment>
              ))}
            </div>
            <span className="w-full flex justify-between items-center">
              {findNullData() ? (
                <p className="text-red-500 text-sm">
                  *โปรดเลือกข้อมูลให้ครบถ้วน
                </p>
              ) : (
                <p></p>
              )}
              <button
                onClick={() => confirmToAddSubjectToClass()}
                className=" w-[100px] bg-green-100 hover:bg-green-200 duration-500 text-green-600 py-2 px-4 rounded"
              >
                ยืนยัน
              </button>
            </span>
          </div>
        </div>
      )}
    </>
  );
}

export default AddSubjectModal;
