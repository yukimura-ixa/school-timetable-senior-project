import SearchBar from "@/components/elements/input/field/SearchBar";
import Dropdown from "@/components/elements/input/selected_input/Dropdown";
import MiniButton from "@/components/elements/static/MiniButton";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";

type Props = {
  closeModal: any;
  confirmChange: any;
};

function AddLockSchduleModal({ closeModal, confirmChange }: Props) {
  const [subject, setSubject] = useState([]);
  const [subjectFilter, setSubjectFilter] = useState([]);
  const [teacher, setTeacher] = useState([]);
  const [teacherFilter, setTeacherFilter] = useState([]);
  const [allClassRoom, setAllClassRoom] = useState([{Year : 1, rooms : []}, {Year : 2, rooms : []}, {Year : 3, rooms : []}, {Year : 4, rooms : []}, {Year : 5, rooms : []}, {Year : 6, rooms : []}])
  const [searchText, setSearchText] = useState("");
  useEffect(() => {
    const getData = () => {
      axios
        .get("http://localhost:3000/api/subject_lock_schedule")
        .then((res) => {
          let data = res.data;
          setSubject(() => data), setSubjectFilter(() => data);
        })
        .catch((err) => console.log(err));
        axios.get('http://localhost:3000/api/classroom_of_allclass')
        .then((res) => {
          let data = res.data;
          setAllClassRoom(() => data)
        })
        .catch((err) => console.log(err))
        // axios.get('http://localhost:3000/api/teacher')
        // .then((res) => {
        //   let data = res.data;
        //   setTeacher(() => data)
        //   setTeacherFilter(() => data)
        // })
        // .catch((err) => console.log(err))
    };
    return () => getData();
  }, []);
  const [validate, setValidate] = useState({
    Subject : false,
    DayOfWeek : false,
    timeSlotID : false,
    Teachers : false,
    ClassRooms : false
  })
  const [lockScheduleData, setLockScheduledata] = useState({
    Subject: {
      SubjectID: null,
      SubjectCode: "",
      SubjectName: "",
    },
    DayOfWeek: "",
    timeSlotID: [],
    Teachers: [
      {
        TeacherID: null,
        FirstName: "",
        LastName: "",
        Department: "",
      },
    ],
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
  const addItemAndCloseModal = () => {
    // เดี๋ยวค่อยมา validate
    confirmChange(lockScheduleData);
    closeModal()
  }
  const handleSubjectChange = (value: any) => {
    setLockScheduledata(() => ({
      ...lockScheduleData,
      Subject: value,
    }));
  }
  const handleDayChange = (value: string) => {
    setLockScheduledata(() => ({
      ...lockScheduleData,
      DayOfWeek: value,
    }));
  }
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
          <div className="flex w-full h-auto justify-between items-center" onClick={() => console.log(teacher)}>
            <p
              className="text-xl select-none"
            >
              เพิ่มวิชาล็อก
            </p>
            <AiOutlineClose className="cursor-pointer" onClick={closeModal} />
          </div>
          <div className="flex flex-col gap-5 p-4 w-full h-[550px] overflow-y-scroll border border-[#EDEEF3]">
            {/* select subject */}
            <div className="flex justify-between w-full items-center">
              <div className="text-sm flex gap-1"><p>วิชา</p><p className="text-red-500">*</p></div>
              <Dropdown
                data={subject}
                renderItem={({ data }): JSX.Element => (
                  <li className="w-full text-sm">
                    {data.SubjectCode} {data.SubjectName}
                  </li>
                )}
                width={300}
                height={40}
                currentValue={`${
                  lockScheduleData.Subject.SubjectCode == ""
                    ? ""
                    : `${lockScheduleData.Subject.SubjectCode} ${lockScheduleData.Subject.SubjectName}`
                }`}
                placeHolder={"ตัวเลือก"}
                handleChange={handleSubjectChange}
                useSearchBar={true}
                searchFunciton={searchHandle}
              />
            </div>
            {/* select day of week */}
            <div className="flex justify-between w-full items-center">
            <div className="text-sm flex gap-1"><p>วัน</p><p className="text-red-500">*</p></div>
              <Dropdown
                data={[
                  "จันทร์",
                  "อังคาร",
                  "พุธ",
                  "พฤหัสบดี",
                  "ศุกร์",
                  "เสาร์",
                  "อาทิตย์",
                ]}
                renderItem={({ data }): JSX.Element => (
                  <li className="w-full text-sm">{data}</li>
                )}
                width={200}
                height={40}
                currentValue={lockScheduleData.DayOfWeek}
                placeHolder={"ตัวเลือก"}
                handleChange={handleDayChange}
              />
            </div>
            {/* select multiple choice of time slot */}
            <div className="flex justify-between w-full">
              <div className="text-sm flex gap-1"><p>คาบที่</p><p className="text-red-500">*</p></div>
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-3 w-[230px]">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => (
                    <React.Fragment key={`slot${item}`}>
                      <input
                        type="checkbox"
                        value={item}
                        name={`checkboxTimeSlot`}
                        onChange={timeSlotHandleChange}
                        checked={lockScheduleData.timeSlotID.includes(item)}
                      />
                      <label>{item}</label>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
            {/* select teacher */}
            <div className="flex flex-col gap-5 justify-between w-full">
              <div className="flex justify-between items-center relative">
                <div className="text-sm flex gap-1"><p>เลือกครู</p><p className="text-red-500">*</p></div>
                <SearchBar
                  width={276}
                  height={45}
                  placeHolder="ค้นหาชื่อคุณครู"
                />
                {/* <div className="absolute w-[276px] h-5 p-4 bg-white drop-shadow-sm border"></div> */}
              </div>
              <div className="flex flex-wrap gap-3 justify-end">
                {[
                  "ครูอัครเดช - ภาษาไทย",
                  "ครูอเนก - คณิตศาสตร์",
                  "ครูสมชาย - สังคมศึกษา",
                ].map((item) => (
                  <React.Fragment key={`teacher${item}`}>
                    <MiniButton isSelected={true} title={item} border={true} />
                  </React.Fragment>
                ))}
              </div>
            </div>
            {/* select grade for choose classroom */}
            <div className="flex flex-col gap-3 justify-between w-full">
              <div className="text-sm flex gap-2">
                <div className="text-sm flex gap-1"><p>เลือกห้องเรียน</p><p className="text-red-500">*</p></div>
                <p className="text-blue-500">(คลิกที่ห้องเรียนเพื่อเลือก)</p>
              </div>
              {[1, 2, 3, 4, 5, 6].map((grade) => (
                <React.Fragment key={`selectGrade${grade}`}>
                  <div className="flex justify-between p-2 w-full h-fit border border-[#EDEEF3] items-center">
                    <p>{`ม.${grade}`}</p>
                    {/* <CheckBox label={`ม.${grade}`} /> */}
                    <div className="flex flex-wrap w-1/2 justify-end gap-3">
                      {allClassRoom.filter(item => item.Year == grade)[0].rooms.map((classroom:any) => (
                        <React.Fragment key={classroom}>
                          <MiniButton
                            titleColor={
                              lockScheduleData.Grade.filter(
                                (item) => item.Year == grade
                              )[0].ClassRooms.includes(
                                parseInt(
                                  `${grade}${
                                    classroom < 10 ? `0${classroom}` : classroom
                                  }`
                                )
                              )
                                ? "#008022"
                                : "#222222"
                            }
                            borderColor={
                              lockScheduleData.Grade.filter(
                                (item) => item.Year == grade
                              )[0].ClassRooms.includes(
                                parseInt(
                                  `${grade}${
                                    classroom < 10 ? `0${classroom}` : classroom
                                  }`
                                )
                              )
                                ? "#abffc1"
                                : "#888888"
                            }
                            buttonColor={
                              lockScheduleData.Grade.filter(
                                (item) => item.Year == grade
                              )[0].ClassRooms.includes(
                                parseInt(
                                  `${grade}${
                                    classroom < 10 ? `0${classroom}` : classroom
                                  }`
                                )
                              )
                                ? "#abffc1"
                                : "#ffffff"
                            }
                            border={true}
                            title={`ม.${grade}/${classroom}`}
                            handleClick={() => {
                              classRoomHandleChange(
                                `${grade}${
                                  classroom < 10 ? `0${classroom}` : classroom
                                }`
                              );
                            }}
                          />
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
          <span className="flex w-full justify-end">
            <button onClick={() => {
              addItemAndCloseModal();
            }} className="w-[75px] h-[45px] bg-blue-500 hover:bg-blue-600 duration-300 p-3 rounded text-white text-sm">
              ยืนยัน
            </button>
          </span>
        </div>
      </div>
    </>
  );
}

export default AddLockSchduleModal;
