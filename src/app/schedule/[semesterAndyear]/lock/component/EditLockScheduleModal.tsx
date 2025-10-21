import SearchBar from "@/components/mui/SearchBar";
import MiniButton from "@/components/elements/static/MiniButton";
import axios from "axios";
import React, { Fragment, useEffect, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import SelectDayOfWeek from "./SelectDayOfWeek";
import SelectSubject from "./SelectSubject";
import SelectMultipleTimeSlot from "./SelectMultipleTimeSlot";
import SelectTeacher from "./SelectTeacher";
import SelectedClassRoom from "./SelectedClassRoom";
import SelectRoomName from "./SelectRoomName";
import { dayOfWeekThai } from "@/models/dayofweek-thai";

type Props = {
  lockSchedule: any;
  closeModal: any;
  confirmChange: any;
};

function EditLockScheduleModal({
  lockSchedule,
  closeModal,
  confirmChange,
}: Props) {
  const [lockScheduleData, setLockScheduledata] = useState(lockSchedule);

  const [isEmptyData, setIsEmptyData] = useState({
    Subject: false,
    DayOfWeek: false,
    timeSlotID: false,
    Teachers: false,
    ClassRooms: false,
    RoomName : false,
  });
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
  const validateData = () => {
    setIsEmptyData(() => ({
      Subject: lockScheduleData.SubjectCode.length == 0,
      DayOfWeek: dayOfWeekThai[lockScheduleData.timeslots[0].DayOfWeek].length == 0,
      timeSlotID: lockScheduleData.timeslots.length == 0,
      Teachers: lockScheduleData.teachers.length == 0,
      RoomName : lockScheduleData.room.RoomName == null,
      ClassRooms: lockScheduleData.GradeIDs.length == 0
    }));
  };
  useEffect(() => {
    const validate = () => {
      validateData();
    };
    return validate();
  }, [
    lockScheduleData.Subject,
    lockScheduleData.DayOfWeek,
    lockScheduleData.timeSlotID,
    lockScheduleData.Teachers,
    lockScheduleData.Grade,
    lockScheduleData.RoomName,
  ]);
  const editItemAndCloseModal = () => {
    let cond =
      isEmptyData.Subject ||
      isEmptyData.DayOfWeek ||
      isEmptyData.timeSlotID ||
      isEmptyData.Teachers ||
      isEmptyData.RoomName ||
      isEmptyData.ClassRooms;
    if (cond) {
      validateData();
    } else {
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
  const handleRoomChange = (value: string) => {
    setLockScheduledata(() => ({
      ...lockScheduleData,
      RoomName: value,
    }));
  };
  const handleAddTeacherList = (teacher: any) => {
    setLockScheduledata(() => ({
      ...lockScheduleData,
      Teachers: [...lockScheduleData.Teachers, teacher],
    }));
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
          <div className="flex w-full h-auto justify-between items-center">
            <p className="text-xl select-none" onClick={() => console.log(lockScheduleData)}>เพิ่มวิชาล็อก</p>
            <AiOutlineClose className="cursor-pointer" onClick={closeModal} />
          </div>
          <div className="flex flex-col gap-5 p-4 w-full h-[550px] overflow-y-scroll border border-[#EDEEF3]">
            <SelectSubject
              currentValue={`${
                lockScheduleData.SubjectCode == ""
                  ? ""
                  : `${lockScheduleData.SubjectCode} ${lockScheduleData.SubjectName}`
              }`}
              handleSubjectChange={handleSubjectChange}
              required={isEmptyData.Subject}
            />
            <SelectDayOfWeek
              dayOfWeek={dayOfWeekThai[lockScheduleData.timeslots[0].DayOfWeek]}
              handleDayChange={handleDayChange}
              required={isEmptyData.DayOfWeek}
            />
            <SelectMultipleTimeSlot
              subject={{
                SubjectCode: lockScheduleData.SubjectCode || "",
                SubjectName: lockScheduleData.SubjectName || "",
                Credit: null,
                Category: "",
                ProgramID: null,
              } as any}
              timeSlotHandleChange={timeSlotHandleChange}
              checkedCondition={lockScheduleData.timeslots.map(item => item.TimeslotID.substring(item.TimeslotID.length - 1))}
              required={isEmptyData.timeSlotID}
              daySelected={dayOfWeekThai[lockScheduleData.timeslots[0].DayOfWeek]}
            />
            <SelectRoomName
              roomName={lockScheduleData.room.RoomName}
              handleRoomChange={handleRoomChange}
            />
            <SelectTeacher
              subject={{
                SubjectCode: lockScheduleData.SubjectCode || "",
                SubjectName: lockScheduleData.SubjectName || "",
                Credit: null,
                Category: "",
                ProgramID: null,
              } as any}
              setTeacherList={null}
              required={isEmptyData.Teachers}
              teachers={lockScheduleData.teachers}
            />
            {/* <SelectedClassRoom
              Grade={lockScheduleData.GradeIDs}
              classRoomHandleChange={classRoomHandleChange}
              required={isEmptyData.ClassRooms}
            /> */}
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

export default EditLockScheduleModal;
