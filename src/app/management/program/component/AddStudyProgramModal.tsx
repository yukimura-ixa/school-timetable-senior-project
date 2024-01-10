import React, { Fragment, use, useEffect, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import SelectedClassRoom from "./SelectedClassRoom";
import SelectSubjects from "./SelectSubjects";
import StudyProgramLabel from "./StudyProgramLabel";
import api from "@/libs/axios";
import { program, subject } from "@prisma/client";

type Props = {
  closeModal: any;
  mutate: Function;
};

function AddStudyProgramModal({ closeModal, mutate }: Props) {
  const [subject, setSubject] = useState([]);
  const [subjectFilter, setSubjectFilter] = useState([]);
  const [teacherFilter, setTeacherFilter] = useState([]);

  const [newProgramData, setNewProgramData] = useState({
    ProgramName: "",
    gradelevel: [],
    subject: [],
  });
  const addProgram = async (program: program) => {
    const response = await api.post("/program", program);
    if (response.status === 200) {
      mutate();
    }
  };

  const [isEmptyData, setIsEmptyData] = useState({
    ProgramName: false,
    gradelevel: false,
    subject: false,
  });
  const [searchText, setSearchText] = useState("");
  const searchName = (name: string) => {
    //อันนี้แค่ทดสอบเท่านั่น ยังคนหาได้ไม่สุด เช่น ค้นหาแบบตัด case sensitive ยังไม่ได้
    let res = subjectFilter.filter((item) =>
      `${item.SubjectCode} ${item.SubjectName}`.match(name)
    );
    setSubject(res);
  };
  const searchHandle = (event: any) => {
    let text = event.target.value;
    setSearchText(text);
    searchName(text);
  };
  const [searchTextSubject, setSearchTextSubject] = useState("");
  const searchSubject = (name: string) => {
    //อันนี้แค่ทดสอบเท่านั่น ยังคนหาได้ไม่สุด เช่น ค้นหาแบบตัด case sensitive ยังไม่ได้
    let res = subjectFilter.filter((item) =>
      `${item.SubjectCode} - ${item.SubjectName}`.match(name)
    );
    setSubject(res);
  };
  const searchHandleSubject = (event: any) => {
    let text = event.target.value;
    setSearchTextSubject(text);
    searchSubject(text);
  };
  const validateData = () => {
    setIsEmptyData(() => ({
      ProgramName: newProgramData.ProgramName.length == 0,
      gradelevel: newProgramData.gradelevel.length == 0,
      subject: newProgramData.subject.length == 0,
    }));
  };
  const classRoomHandleChange = (value: any) => {
    let removeDulpItem = newProgramData.gradelevel.filter(
      (item) => item.GradeID != value.GradeID
    ); //ตัวนี้ไว้ใช้กับเงื่อนไขตอนกดเลือกห้องเรียน ถ้ากดห้องที่เลือกแล้วจะลบออก
    setNewProgramData(() => ({
      ...newProgramData,
      gradelevel:
        newProgramData.gradelevel.filter(
          (item) => item.GradeID === value.GradeID //เช็คเงื่อนไขว่าถ้ากดเพิ่มเข้ามาแล้วยังไม่เคยเพิ่มห้องเรียนนี้มาก่อนจะเพิ่มเข้าไปใหม่ ถ้ามีแล้วก็ลบห้องนั้นออก
        ).length === 0
          ? [...newProgramData.gradelevel, value]
          : [...removeDulpItem],
    }));
  };
  useEffect(() => {
    const validate = () => {
      validateData();
    };
    return validate();
  }, [
    newProgramData.ProgramName,
    newProgramData.gradelevel,
    newProgramData.subject,
  ]);
  const handleAddSubjectList = (subject: subject) => {
    setNewProgramData(() => ({
      ...newProgramData,
      subject: [...newProgramData.subject, subject],
    }));
    setSearchTextSubject("");
  };
  const removeSubjectFromList = (index: number) => {
    setNewProgramData(() => ({
      ...newProgramData,
      subject: [...newProgramData.subject.filter((item, ind) => ind != index)],
    }));
  };
  const addItemAndCloseModal = () => {
    let cond =
      isEmptyData.ProgramName || isEmptyData.gradelevel || isEmptyData.subject;
    if (cond) {
      validateData();
    } else {
      addProgram(newProgramData);
      closeModal();
      mutate();
    }
  };
  return (
    <>
      <div
        style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
        className="z-40 flex w-full h-screen items-center justify-center fixed left-0 top-0"
      >
        <div
          className={`relative flex flex-col w-[831px] h-fit overflow-y-scroll overflow-x-hidden p-12 gap-10 bg-white rounded`}
        >
          {/* Content */}
          <div className="flex w-full h-auto justify-between items-center">
            <p className="text-xl select-none">เพิ่มหลักสูตร</p>
            <AiOutlineClose className="cursor-pointer" onClick={closeModal} />
          </div>
          <div className="flex flex-col gap-5 p-4 w-full h-auto overflow-y-scroll border border-[#EDEEF3]">
            <StudyProgramLabel
              required={false}
              title={newProgramData.ProgramName}
              handleChange={(e: any) => {
                let value: string = e.target.value;
                setNewProgramData(() => ({
                  ...newProgramData,
                  ProgramName : value
                }));
              }}
            />
            <SelectSubjects
              subjectSelected={newProgramData.subject}
              addSubjectFunction={handleAddSubjectList}
              removeSubjectFunction={removeSubjectFromList}
              searchHandleSubject={searchHandleSubject}
              searchTextSubject={searchTextSubject}
              required={isEmptyData.subject}
            />
            <SelectedClassRoom
              Grade={newProgramData.gradelevel}
              classRoomHandleChange={classRoomHandleChange}
              required={isEmptyData.gradelevel}
            />
          </div>
          <span className="flex w-full justify-end">
            <button
              onClick={() => {
                addItemAndCloseModal();
              }}
              className="w-[75px] h-[45px] bg-blue-100 hover:bg-blue-200 duration-300 p-3 rounded text-blue-600 text-sm"
            >
              ยืนยัน
            </button>
          </span>
        </div>
      </div>
    </>
  );
}

export default AddStudyProgramModal;
