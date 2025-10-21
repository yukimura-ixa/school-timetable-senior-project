import React, { Fragment, useEffect, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import SelectDayOfWeek from "./SelectDayOfWeek";
import SelectSubject from "./SelectSubject";
import SelectMultipleTimeSlot from "./SelectMultipleTimeSlot";
import SelectTeacher from "./SelectTeacher";
import SelectedClassRoom from "./SelectedClassRoom";
import SelectRoomName from "./SelectRoomName";
import type { room, teacher } from "@prisma/client";

type Props = {
  closeModal: any;
  confirmChange: any;
};

function AddLockScheduleModal({ closeModal, confirmChange }: Props) {
  const [lockScheduleData, setLockScheduledata] = useState<any>({
    Subject: {
      SubjectCode: "",
      SubjectName: "",
      Credit: null,
      Category: "",
      ProgramID: null,
    },
    DayOfWeek: "",
    timeSlotID: [],
    Teachers: [],
    Grade: [],
    RoomName: null,
  });
  const [isEmptyData, setIsEmptyData] = useState({
    Subject: false,
    DayOfWeek: false,
    timeSlotID: false,
    Teachers: false,
    ClassRooms: false,
    RoomName: false,
  });
  const timeSlotHandleChange = (e: any) => {
    let value = e.target.value;
    let timeSlot = [...lockScheduleData.timeSlotID];
    setLockScheduledata(() => ({
      ...lockScheduleData,
      timeSlotID: timeSlot.includes(parseInt(value))
        ? timeSlot.filter((item) => item !== parseInt(value))
        : [...timeSlot, parseInt(value)].sort((a, b) => a - b),
    }));
    console.log(timeSlot);
  };
  const classRoomHandleChange = (value: any) => {
    let grade = [...lockScheduleData.Grade];
    if (!lockScheduleData.Grade.includes(value)) {
      grade.push(value);
    } else {
      grade.splice(grade.indexOf(value), 1);
    }
    setLockScheduledata(() => ({
      ...lockScheduleData,
      Grade: grade,
    }));
  };
  const validateData = () => {
    setIsEmptyData(() => ({
      Subject: lockScheduleData.Subject.SubjectCode.length == 0,
      DayOfWeek: lockScheduleData.DayOfWeek.length == 0,
      timeSlotID:
        lockScheduleData.timeSlotID.length == 0 ||
        lockScheduleData.timeSlotID.length > 2 ||
        lockScheduleData.timeSlotID.reduce((a, b) => Math.abs(a - b), 0) > 1,
      Teachers: lockScheduleData.Teachers.length == 0,
      RoomName: lockScheduleData.RoomName == null,
      ClassRooms: lockScheduleData.Grade.length == 0,
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
  const addItemAndCloseModal = () => {
    let cond =
      isEmptyData.Subject ||
      isEmptyData.DayOfWeek ||
      isEmptyData.timeSlotID ||
      isEmptyData.Teachers ||
      isEmptyData.ClassRooms ||
      isEmptyData.RoomName;
    if (cond) {
      validateData();
    } else {
      // confirmChange(lockScheduleData);
      // closeModal();
      console.log(lockScheduleData);
    }
  };
  // ใช้สลับสับเปลี่ยนข้อมูลกับ component ย่อย //
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
  const handleRoomChange = (value: room) => {
    setLockScheduledata(() => ({
      ...lockScheduleData,
      RoomName: value.RoomName,
    }));
  };
  const handleAddTeacherList = (teacher: teacher) => {
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
  // ใช้สลับสับเปลี่ยนข้อมูลกับ component ย่อย //
  return (
    <>
      <div
        style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
        className="z-40 flex w-full h-[500px] bg-red-200 items-center justify-center fixed left-0 top-0"
      >
        <div
          className={`relative flex flex-col w-[831px] h-fit overflow-y-scroll overflow-x-hidden p-12 gap-10 bg-white rounded`}
        >
          {/* Content */}
          <div className="flex w-full h-auto justify-between items-center">
            <p className="text-xl select-none">เพิ่มวิชาล็อก</p>
            <AiOutlineClose className="cursor-pointer" onClick={closeModal} />
          </div>
          <div className="flex flex-col gap-5 p-4 w-full h-[550px] overflow-y-scroll border border-[#EDEEF3]">
            <SelectSubject
              currentValue={`${
                lockScheduleData.Subject.SubjectCode == ""
                  ? ""
                  : `${lockScheduleData.Subject.SubjectCode} ${lockScheduleData.Subject.SubjectName}`
              }`}
              handleSubjectChange={handleSubjectChange}
              required={isEmptyData.Subject}
            />
            <SelectDayOfWeek
              dayOfWeek={lockScheduleData.DayOfWeek}
              handleDayChange={handleDayChange}
              required={isEmptyData.DayOfWeek}
            />
            <SelectMultipleTimeSlot
              subject={lockScheduleData.Subject}
              timeSlotHandleChange={timeSlotHandleChange}
              checkedCondition={lockScheduleData.timeSlotID}
              required={isEmptyData.timeSlotID}
              daySelected={lockScheduleData.DayOfWeek}
            />
            <SelectRoomName
              roomName={lockScheduleData.RoomName}
              handleRoomChange={handleRoomChange}
            />
            <SelectTeacher
              subject={lockScheduleData.Subject}
              setTeacherList={null}
              required={isEmptyData.Teachers}
              teachers={lockScheduleData.Teachers}
            />
            <SelectedClassRoom
              teachers={lockScheduleData.Teachers}
              Grade={lockScheduleData.Grade}
              subject={lockScheduleData.Subject}
              classRoomHandleChange={classRoomHandleChange}
              required={isEmptyData.ClassRooms}
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

export default AddLockScheduleModal;
