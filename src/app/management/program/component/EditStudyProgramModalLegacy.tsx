import React, { Fragment, useEffect, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import SelectedClassRoom from "./SelectedClassRoom";
import SelectSubjects from "./SelectSubjects";
import StudyProgramLabel from "./StudyProgramLabel";
import { program, subject } from "@prisma/client";
import api from "@/libs/axios";


type Props = {
  data: any;
  closeModal: any;
  mutate: any;
};

function EditStudyProgramModal({
  data,
  closeModal,
  mutate
}: Props) {
  const [subject, setSubject] = useState([]);
  const [subjectFilter, setSubjectFilter] = useState([]);
  const [programData, setProgramData] = useState(data);
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
  const classRoomHandleChange = (value: any) => {
    let removeDulpItem = programData.gradelevel.filter(
      (item) => item.GradeID != value.GradeID
    ); //ตัวนี้ไว้ใช้กับเงื่อนไขตอนกดเลือกห้องเรียน ถ้ากดห้องที่เลือกแล้วจะลบออก
    setProgramData(() => ({
      ...programData,
      gradelevel:
        programData.gradelevel.filter(
          (item) => item.GradeID === value.GradeID //เช็คเงื่อนไขว่าถ้ากดเพิ่มเข้ามาแล้วยังไม่เคยเพิ่มห้องเรียนนี้มาก่อนจะเพิ่มเข้าไปใหม่ ถ้ามีแล้วก็ลบห้องนั้นออก
        ).length === 0
          ? [...programData.gradelevel, value]
          : [...removeDulpItem],
    }));
  };
  const validateData = () => {
    setIsEmptyData(() => ({
      ProgramName: programData.ProgramName.length == 0,
      gradelevel: programData.gradelevel.length == 0,
      subject: programData.subject.length == 0,
    }));
  };
  useEffect(() => {
    const validate = () => {
      validateData();
    };
    return validate();
  }, [
    programData.ProgramName,
    programData.gradelevel,
    programData.subject,
  ]);
  const editProgram = async (program: program) => {
    const response = await api.put("/program", program);
    if (response.status === 200) {
      mutate();
    }
  };
  const editItemAndCloseModal = () => {
    let cond = isEmptyData.ProgramName || isEmptyData.gradelevel || isEmptyData.subject;
    if (cond) {
      validateData();
    } else {
      editProgram(data)
      closeModal();
      mutate();
      console.log(programData);
    }
  };
  const removeSubjectFromList = (index: number) => {
    setProgramData(() => ({
      ...programData,
      subject: [...programData.subject.filter((item, ind) => ind != index)],
    }));
  };
  const handleAddSubjectList = (subject: subject) => {
    setProgramData(() => ({
      ...programData,
      subject: [...programData.subject, subject],
    }));
    setSearchTextSubject("");
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
            <p className="text-xl select-none">แก้ไขหลักสูตร</p>
            <AiOutlineClose className="cursor-pointer" onClick={closeModal} />
          </div>
          <div className="flex flex-col gap-5 p-4 w-full h-auto overflow-y-scroll border border-[#EDEEF3]">
            <StudyProgramLabel
                required={false}
                title={programData.ProgramName}
                handleChange={(e: any) => {
                  let value: string = e.target.value;
                  setProgramData(() => ({
                    ...programData,
                    ProgramName : value
                  }));
                }}
            />
            <SelectSubjects
              subjectSelected={programData.subject}
              addSubjectFunction={handleAddSubjectList}
              removeSubjectFunction={removeSubjectFromList}
              searchHandleSubject={searchHandleSubject}
              searchTextSubject={searchTextSubject}
              required={isEmptyData.subject}
            />
            <SelectedClassRoom
              Grade={programData.gradelevel}
              classRoomHandleChange={classRoomHandleChange}
              required={isEmptyData.gradelevel}
            />
          </div>
          <span className="flex w-full justify-end">
            <button
              onClick={() => {
                editItemAndCloseModal();
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

export default EditStudyProgramModal;
