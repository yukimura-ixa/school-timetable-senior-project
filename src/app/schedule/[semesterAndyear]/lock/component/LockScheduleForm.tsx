import React, { useEffect, useReducer } from "react";
import { AiOutlineClose } from "react-icons/ai";
import SelectDayOfWeek from "./SelectDayOfWeek";
import SelectSubject from "./SelectSubject";
import SelectMultipleTimeSlot from "./SelectMultipleTimeSlot";
import SelectTeacher from "./SelectTeacher";
import SelectedClassRoom from "./SelectedClassRoom";
import SelectRoomName from "./SelectRoomName";
import type { room, teacher, timeslot } from "@prisma/client";
import { dayOfWeekThai } from "@/models/dayofweek-thai";
import api from "@/libs/axios";
import { enqueueSnackbar } from "notistack";
//TODO: เช็คหน่วยกิตวิชาล็อกคาบ
type Props = {
  closeModal: any;
  data?: any;
  mutate: Function;
};

type LockScheduleData = {
  SubjectCode: string;
  SubjectName: string;
  DayOfWeek: string;
  timeslots: timeslot[];
  teachers: teacher[];
  GradeIDs: string[];
  room: room;
};

type IsEmptyData = {
  Subject: boolean;
  DayOfWeek: boolean;
  timeslots: boolean;
  teachers: boolean;
  GradeIDs: boolean;
  room: boolean;
};

type Action =
  | { type: "SET_SUBJECT"; payload: any }
  | { type: "SET_DAY_OF_WEEK"; payload: string }
  | { type: "SET_TIME_SLOT"; payload: timeslot[] }
  | { type: "SET_TEACHERS"; payload: teacher[] }
  | { type: "SET_GRADE"; payload: string[] }
  | { type: "SET_ROOM_NAME"; payload: room | null }
  | { type: "SET_IS_EMPTY_DATA"; payload: IsEmptyData };

const initialState: {
  lockScheduleData: LockScheduleData;
  isEmptyData: IsEmptyData;
} = {
  lockScheduleData: {
    SubjectCode: "",
    SubjectName: "",
    DayOfWeek: "",
    timeslots: [],
    teachers: [],
    GradeIDs: [],
    room: { RoomID: -1, RoomName: "", Building: "", Floor: "" },
  },
  isEmptyData: {
    Subject: false,
    DayOfWeek: false,
    timeslots: false,
    teachers: false,
    GradeIDs: false,
    room: false,
  },
};

const reducer = (state: typeof initialState, action: Action) => {
  switch (action.type) {
    case "SET_SUBJECT":
      return {
        ...state,
        lockScheduleData: {
          ...state.lockScheduleData,
          SubjectName: action.payload.SubjectName,
          SubjectCode: action.payload.SubjectCode,
        },
      };
    case "SET_DAY_OF_WEEK":
      return {
        ...state,
        lockScheduleData: {
          ...state.lockScheduleData,
          DayOfWeek: action.payload,
        },
      };
    case "SET_TIME_SLOT":
      return {
        ...state,
        lockScheduleData: {
          ...state.lockScheduleData,
          timeslots: action.payload,
        },
      };
    case "SET_TEACHERS":
      return {
        ...state,
        lockScheduleData: {
          ...state.lockScheduleData,
          teachers: action.payload,
        },
      };
    case "SET_GRADE":
      return {
        ...state,
        lockScheduleData: {
          ...state.lockScheduleData,
          GradeIDs: action.payload,
        },
      };
    case "SET_ROOM_NAME":
      return {
        ...state,
        lockScheduleData: {
          ...state.lockScheduleData,
          room: action.payload,
        },
      };
    case "SET_IS_EMPTY_DATA":
      return {
        ...state,
        isEmptyData: action.payload,
      };
    default:
      return state;
  }
};

function LockScheduleForm({ closeModal, data, mutate }: Props) {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    lockScheduleData: {
      ...initialState.lockScheduleData,
      ...data,
      DayOfWeek: dayOfWeekThai[data?.timeslots[0].DayOfWeek] || "",
    },
  });

  const { lockScheduleData, isEmptyData } = state;

  const timeSlotHandleChange = (e: any) => {
    let value = e.target.value;
    console.log(value);
    let timeSlot = [...lockScheduleData.timeslots];
    dispatch({
      type: "SET_TIME_SLOT",
      payload: timeSlot.includes(value)
        ? timeSlot.filter((item) => item != value)
        : [...timeSlot, value],
    });
  };

  const classRoomHandleChange = (value: any) => {
    let grade = [...lockScheduleData.GradeIDs];
    if (!lockScheduleData.GradeIDs.includes(value)) {
      grade.push(value);
    } else {
      grade.splice(grade.indexOf(value), 1);
    }
    dispatch({ type: "SET_GRADE", payload: grade });
  };

  const validateData = () => {
    dispatch({
      type: "SET_IS_EMPTY_DATA",
      payload: {
        Subject: lockScheduleData.SubjectCode.length === 0,
        DayOfWeek: lockScheduleData.DayOfWeek.length === 0,
        timeslots:
          lockScheduleData.timeslots.length === 0 ||
          lockScheduleData.timeslots.length > 2,
        teachers: lockScheduleData.teachers.length === 0,
        room: lockScheduleData.room === null,
        GradeIDs: lockScheduleData.GradeIDs.length === 0,
      },
    });
  };

  useEffect(() => {
    const validate = () => {
      validateData();
    };
    return validate();
  }, [
    lockScheduleData.SubjectName,
    lockScheduleData.SubjectCode,
    lockScheduleData.DayOfWeek,
    lockScheduleData.timeslots,
    lockScheduleData.teachers,
    lockScheduleData.GradeIDs,
    lockScheduleData.room,
  ]);

  const handleConfirm = () => {
    let cond =
      isEmptyData.Subject ||
      isEmptyData.DayOfWeek ||
      isEmptyData.timeslots ||
      isEmptyData.teachers ||
      isEmptyData.GradeIDs ||
      isEmptyData.room;
    if (cond) {
      validateData();
      enqueueSnackbar("กรุณากรอกข้อมูลให้ครบถ้วน", { variant: "error" });
      return;
    }

    if (!data) {
      addLockSchedule(lockScheduleData);
    } else {
      editLockSchedule(lockScheduleData);
    }
  };

  const handleAddTeacherList = (value: teacher) => {
    let teacherList = [...lockScheduleData.teachers];
    teacherList.push(value);
    dispatch({ type: "SET_TEACHERS", payload: teacherList });
  };

  const removeTeacherFromList = (value: teacher) => {
    let teacherList = [...lockScheduleData.teachers];
    let index = teacherList.indexOf(value);
    teacherList.splice(index, 1);
    dispatch({ type: "SET_TEACHERS", payload: teacherList });
  };

  const handleSubjectChange = (value: any) => {
    dispatch({ type: "SET_SUBJECT", payload: value });
  };

  const handleDayChange = (value: string) => {
    dispatch({ type: "SET_DAY_OF_WEEK", payload: value });
    dispatch({ type: "SET_TIME_SLOT", payload: [] });
  };

  const handleRoomChange = (value: room) => {
    dispatch({ type: "SET_ROOM_NAME", payload: value });
  };

  const addLockSchedule = async (data: any) => {
    try {
      const response = await api.post("/lock", data);
      enqueueSnackbar("กำลังเพิ่มข้อมูล", { variant: "info" });
      closeModal();
      if (response.status === 200) {
        enqueueSnackbar("เพิ่มข้อมูลคาบล็อกสำเร็จ", { variant: "success" });
        mutate();
      }
      console.log(response);
    } catch (error) {
      console.log(error);
      enqueueSnackbar("เกิดข้อผิดพลาดในการเพิ่มข้อมูลคาบล็อก", {
        variant: "error",
      });
    }
  };

  const editLockSchedule = (data: any) => {
    console.log(data);
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
            <p className="text-xl select-none">เพิ่มวิชาล็อก</p>
            <AiOutlineClose className="cursor-pointer" onClick={closeModal} />
          </div>
          <div className="flex flex-col gap-5 p-4 w-full h-[550px] overflow-y-scroll border border-[#EDEEF3]">
            <SelectDayOfWeek
              dayOfWeek={lockScheduleData.DayOfWeek}
              handleDayChange={handleDayChange}
              required={isEmptyData.DayOfWeek}
            />
            <SelectMultipleTimeSlot
              timeSlotHandleChange={timeSlotHandleChange}
              checkedCondition={lockScheduleData.timeslots}
              required={isEmptyData.timeslots}
              daySelected={lockScheduleData.DayOfWeek}
            />
            <SelectTeacher
              teacherSelected={lockScheduleData.teachers}
              addTeacherFunction={handleAddTeacherList}
              removeTeacherFunction={removeTeacherFromList}
              required={isEmptyData.teachers}
            />
            <SelectSubject
              teachers={lockScheduleData.teachers}
              currentValue={`${
                lockScheduleData.SubjectCode == ""
                  ? ""
                  : `${lockScheduleData.SubjectCode} ${lockScheduleData.SubjectName}`
              }`}
              handleSubjectChange={handleSubjectChange}
              required={isEmptyData.Subject}
            />
            <SelectRoomName
              roomName={lockScheduleData.room.RoomName}
              handleRoomChange={handleRoomChange}
              required={isEmptyData.room}
            />
            <SelectedClassRoom
              Grade={lockScheduleData.GradeIDs}
              classRoomHandleChange={classRoomHandleChange}
              required={isEmptyData.GradeIDs}
            />
          </div>
          <span className="flex w-full justify-end">
            <button
              onClick={() => {
                handleConfirm();
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

export default LockScheduleForm;
