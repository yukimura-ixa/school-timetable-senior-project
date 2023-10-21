import SearchBar from "@/components/elements/input/field/SearchBar";
import MiniButton from "@/components/elements/static/MiniButton";
import axios from "axios";
import React, { Fragment, useEffect, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import SelectDayOfWeek from "./SelectDayOfWeek";
import SelectSubject from "./SelectSubject";
import SelectMultipleTimeSlot from "./SelectMultipleTimeSlot";
import SelectTeacher from "./SelectTeacher";
import SelectedClassRoom from "./SelectedClassRoom";

type Props = {
  closeModal: any;
  confirmChange: any;
};

function AddLockSchduleModal({ closeModal, confirmChange }: Props) {
  const [subject, setSubject] = useState([]);
  const [subjectFilter, setSubjectFilter] = useState([]);
  const [teacher, setTeacher] = useState([]);
  const [teacherFilter, setTeacherFilter] = useState([]);
  const [allClassRoom, setAllClassRoom] = useState([
    { Year: 1, rooms: [] },
    { Year: 2, rooms: [] },
    { Year: 3, rooms: [] },
    { Year: 4, rooms: [] },
    { Year: 5, rooms: [] },
    { Year: 6, rooms: [] },
  ]);
  const [lockScheduleData, setLockScheduledata] = useState({
    Subject: {
      SubjectID: null,
      SubjectCode: "",
      SubjectName: "",
    },
    DayOfWeek: "",
    timeSlotID: [],
    Teachers: [],
    Grade: [
      {
        Year: 1,
        ClassRooms: [],
      },
      {
        Year: 2,
        ClassRooms: [],
      },
      {
        Year: 3,
        ClassRooms: [],
      },
      {
        Year: 4,
        ClassRooms: [],
      },
      {
        Year: 5,
        ClassRooms: [],
      },
      {
        Year: 6,
        ClassRooms: [],
      },
    ],
  });
  useEffect(() => {
    const getData = () => {
      axios
        .get("http://localhost:3000/api/subject_lock_schedule")
        .then((res) => {
          let data = res.data;
          setSubject(() => data), setSubjectFilter(() => data);
        })
        .catch((err) => console.log(err));
      axios
        .get("http://localhost:3000/api/classroom_of_allclass")
        .then((res) => {
          let data = res.data;
          setAllClassRoom(() => data);
        })
        .catch((err) => console.log(err));
      axios
        .get("http://localhost:3000/api/teacher")
        .then((res) => {
          let data = res.data;
          setTeacher(() => data);
          setTeacherFilter(() => data);
        })
        .catch((err) => console.log(err));
    };
    return () => getData();
  }, []);
  // const [validate, setValidate] = useState({
  //   Subject: false,
  //   DayOfWeek: false,
  //   timeSlotID: false,
  //   Teachers: false,
  //   ClassRooms: false,
  // });
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
  const [searchTextTeacher, setSearchTextTeacher] = useState("");
  const searchTeacher = (name: string) => {
    //อันนี้แค่ทดสอบเท่านั่น ยังคนหาได้ไม่สุด เช่น ค้นหาแบบตัด case sensitive ยังไม่ได้
    let res = teacherFilter.filter((item) =>
      `${item.Firstname} ${item.Lastname} - ${item.Department}`.match(name)
    );
    setTeacher(res);
  };
  const searchHandleTeacher = (event: any) => {
    let text = event.target.value;
    setSearchTextTeacher(text);
    searchTeacher(text);
  };
  const timeSlotHandleChange = (e: any) => {
    console.log(e.target.value);
    let timeSlot = [...lockScheduleData.timeSlotID];
    setLockScheduledata(() => ({
      ...lockScheduleData,
      timeSlotID: timeSlot.includes(parseInt(e.target.value))
        ? timeSlot.filter((item) => item !== parseInt(e.target.value))
        : [...timeSlot, parseInt(e.target.value)].sort(),
    }));
  };
  const classRoomHandleChange = (value: any) => {
    let grade = [...lockScheduleData.Grade];
    setLockScheduledata(() => ({
      ...lockScheduleData,
      Grade: grade.map((item) =>
        item.Year == parseInt(value[0]) //ถ้าชั้นปีที่กดเท่ากับ 1 ก็จะอัปเดตของปีนั้นๆ
          ? {
              ...item,
              ClassRooms: item.ClassRooms.includes(parseInt(value))
                ? item.ClassRooms.filter((item) => item != parseInt(value))
                : [...item.ClassRooms, parseInt(value)].sort(),
            }
          : item
      ),
    }));
  };
  const [validateMsg, setValidateMsg] = useState({
    SubjectMsg : "",
    DayOfWeekMsg : "",
    TimeSlotMsg : "",
    TeacherMsg : "",
    ClassRoomMsg : "",
  })
  const addItemAndCloseModal = () => {
    // เดี๋ยวค่อยมา validate
    let mapGrade = [...lockScheduleData.Grade.map(item => item.ClassRooms)]
    let findTrue = mapGrade.map(item => item.length > 0 && true).filter(item => item == true)[0]
    let cond = lockScheduleData.Subject.SubjectID == null || lockScheduleData.DayOfWeek.length == 0 || lockScheduleData.timeSlotID.length == 0 || lockScheduleData.Teachers.length == 0 || !findTrue
    if(cond){
      alert("ใส่ครบยังจ๊ะ")
    }
    else{
      confirmChange(lockScheduleData);
      closeModal();
    }
  };
  const handleSubjectChange = (value: any) => {
    setLockScheduledata(() => ({
      ...lockScheduleData,
      Subject: value,
    }));
  };
  const handleDayChange = (value: string) => {
    setLockScheduledata(() => ({
      ...lockScheduleData,
      DayOfWeek: value,
    }));
  };
  const handleAddTeacherList = (teacher: any) => {
    setLockScheduledata(() => ({
      ...lockScheduleData,
      Teachers: [...lockScheduleData.Teachers, teacher],
    }));
    setSearchTextTeacher("");
  };
  const removeTeacherFromList = (index: number) => {
    setLockScheduledata(() => ({
      ...lockScheduleData,
      Teachers: [
        ...lockScheduleData.Teachers.filter((item, ind) => ind != index),
      ],
    }));
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
          <div
            className="flex w-full h-auto justify-between items-center"
            onClick={() => console.log(validateMsg)}
          >
            <p className="text-xl select-none">เพิ่มวิชาล็อก</p>
            <AiOutlineClose className="cursor-pointer" onClick={closeModal} />
          </div>
          <div className="flex flex-col gap-5 p-4 w-full h-[550px] overflow-y-scroll border border-[#EDEEF3]">
            <SelectSubject
              data={subject}
              currentValue={`${
                lockScheduleData.Subject.SubjectCode == ""
                  ? ""
                  : `${lockScheduleData.Subject.SubjectCode} ${lockScheduleData.Subject.SubjectName}`
              }`}
              handleSubjectChange={handleSubjectChange}
              searchHandle={searchHandle}
            />
            <SelectDayOfWeek
              dayOfWeek={lockScheduleData.DayOfWeek}
              handleDayChange={handleDayChange}
            />
            <SelectMultipleTimeSlot
              timeSlotHandleChange={timeSlotHandleChange}
              checkedCondition={lockScheduleData.timeSlotID}
            />
            <SelectTeacher
              data={teacher}
              teacherSelected={lockScheduleData.Teachers}
              addTeacherFunction={handleAddTeacherList}
              removeTeacherFunction={removeTeacherFromList}
              searchHandleTeacher={searchHandleTeacher}
              searchTextTeacher={searchTextTeacher}
            />
            <SelectedClassRoom
              allClassRoom={allClassRoom}
              Grade={lockScheduleData.Grade}
              classRoomHandleChange={classRoomHandleChange}
            />
          </div>
          <span className="flex w-full justify-end">
            <button
              onClick={() => {
                addItemAndCloseModal();
              }}
              className="w-[75px] h-[45px] bg-blue-500 hover:bg-blue-600 duration-300 p-3 rounded text-white text-sm"
            >
              ยืนยัน
            </button>
          </span>
        </div>
      </div>
    </>
  );
}

export default AddLockSchduleModal;
