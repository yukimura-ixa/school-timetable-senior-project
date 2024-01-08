import SearchBar from "@/components/elements/input/field/SearchBar";
import MiniButton from "@/components/elements/static/MiniButton";
import React, { Fragment, use, useEffect, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import SelectedClassRoom from "./SelectedClassRoom";
import SelectSubjects from "./SelectSubjects";
import StudyProgramLabel from "./StudyProgramLabel";
import { useGradeLevelData } from "../../_hooks/gradeLevelData";
import { useSubjectData } from "../../_hooks/subjectData";

type Props = {
  closeModal: any;
  mutate: Function;
};

function AddStudyProgramModal({ closeModal, mutate }: Props) {

  const gradelevel = useGradeLevelData();
  const allClassRoom = gradelevel.data;
  const subjectData = useSubjectData();
  
  const [subject, setSubject] = useState([]);
  const [subjectFilter, setSubjectFilter] = useState([]);
  const [teacherFilter, setTeacherFilter] = useState([]);

  const [newProgramData, setNewProgramData] = useState({
    ProgramName: "",
    gradelevel: [
      {
        GradeID: "",
      },
    ],
    subject: [
      {
        SubjectCode: "",
      },
    ],
  });

  const addProgram = (program: any) => {};

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
  const searchTeacher = (name: string) => {
    //อันนี้แค่ทดสอบเท่านั่น ยังคนหาได้ไม่สุด เช่น ค้นหาแบบตัด case sensitive ยังไม่ได้
    let res = teacherFilter.filter((item) =>
      `${item.Firstname} ${item.Lastname} - ${item.Department}`.match(name)
    );
    setTeacher(res);
  };
  const searchHandleSubject = (event: any) => {
    let text = event.target.value;
    setSearchTextSubject(text);
    searchTeacher(text);
  };

  const classRoomHandleChange = (value: any) => {
    console.log(value);
    // let grade = [...lockScheduleData.Grade];
    // setLockScheduledata(() => ({
    //   ...lockScheduleData,
    //   Grade: grade.map((item) =>
    //     item.Year == parseInt(value[0]) //ถ้าชั้นปีที่กดเท่ากับ 1 ก็จะอัปเดตของปีนั้นๆ
    //       ? {
    //           ...item,
    //           ClassRooms: item.ClassRooms.includes(parseInt(value))
    //             ? item.ClassRooms.filter((item) => item != parseInt(value))
    //             : [...item.ClassRooms, parseInt(value)].sort(),
    //         }
    //       : item
    //   ),
    // })
    // );
  };
  const validateData = () => {
    setIsEmptyData(() => ({
      ProgramName: newProgramData.ProgramName.length == 0,
      gradelevel: newProgramData.gradelevel.length == 0,
      subject: newProgramData.subject.length == 0,
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
            <StudyProgramLabel required={false} />
            <SelectSubjects
              data={subject} //props ทุกตัวค่อยมาแก้
              subjectSelected={newProgramData.subject}
              addSubjectFunction={handleAddTeacherList}
              removeSubjectFunction={removeTeacherFromList}
              searchHandleSubject={searchHandleSubject}
              searchTextSubject={searchTextSubject}
              required={isEmptyData.subject}
            />
            <SelectedClassRoom
              allClassRoom={allClassRoom}
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
