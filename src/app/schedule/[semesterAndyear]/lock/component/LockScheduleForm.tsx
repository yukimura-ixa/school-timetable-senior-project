import React, { useEffect, useReducer, useMemo } from "react";
import { AiOutlineClose } from "react-icons/ai";
import SelectDayOfWeek from "./SelectDayOfWeek";
import SelectSubject from "./SelectSubject";
import SelectMultipleTimeSlot from "./SelectMultipleTimeSlot";
import SelectTeacher from "./SelectTeacher";
import SelectedClassRoom from "./SelectedClassRoom";
import SelectRoomName from "./SelectRoomName";
import { useParams } from "next/navigation";
import { useRoomAvailability } from "@/hooks/useRoomAvailability";
import type {
  room,
  semester,
  subject,
  teacher,
  timeslot,
} from "@/prisma/generated/client";
import { dayOfWeekThai } from "@/models/dayofweek-thai";
import { createLockAction } from "@/features/lock/application/actions/lock.actions";
import { closeSnackbar, enqueueSnackbar } from "notistack";
import { useTeachers } from "@/hooks";

import type { ModalCloseHandler, InputChangeHandler } from "@/types/events";
import type { SubjectWithResponsibilities } from "@/types/lock-schedule";

type Props = {
  closeModal: ModalCloseHandler;
  data?: LockScheduleData;
  mutate: () => void;
};

type LockScheduleData = {
  SubjectCode: string;
  SubjectName: string;
  DayOfWeek: string;
  timeslots: string[];
  teachers: teacher[];
  GradeIDs: string[];
  room: room | null;
  subject: SubjectWithResponsibilities | null;
};

type IsEmptyData = {
  Subject: boolean;
  DayOfWeek: boolean;
  timeslots: boolean;
  teachers: boolean;
  GradeIDs: boolean;
  // room: boolean;
};

type Action =
  | { type: "SET_SUBJECT"; payload: SubjectWithResponsibilities }
  | { type: "SET_DAY_OF_WEEK"; payload: string }
  | { type: "SET_TIME_SLOT"; payload: string[] }
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
    subject: null,
  },
  isEmptyData: {
    Subject: false,
    DayOfWeek: false,
    timeslots: false,
    teachers: false,
    GradeIDs: false,
    // room: false,
  },
};

const reducer = (state: typeof initialState, action: Action) => {
  switch (action.type) {
    case "SET_SUBJECT":
      return {
        ...state,
        lockScheduleData: {
          ...state.lockScheduleData,
          SubjectName: action.payload?.SubjectName || "",
          SubjectCode: action.payload?.SubjectCode || "",
          subject: action.payload,
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
  const teacherData = useTeachers();
  const params = useParams();
  const semesterAndyear = params.semesterAndyear as string | undefined; // pattern e.g. 1-2567
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    lockScheduleData: {
      ...initialState.lockScheduleData,
      ...data,
      DayOfWeek: data?.DayOfWeek || "",
    },
  });

  const { lockScheduleData, isEmptyData } = state;

  // Derive academic year / semester from route param for fetching locked schedules
  const derivedTerm = useMemo(() => {
    if (!semesterAndyear) return null;
    const parts = semesterAndyear.split("-");
    if (parts.length !== 2) return null;
    const semPart = parts[0];
    const yearNum = Number(parts[1]);
    if (!yearNum || (semPart !== "1" && semPart !== "2")) return null;
    const semEnum: semester = semPart === "1" ? "SEMESTER_1" : "SEMESTER_2";
    return { academicYear: yearNum, semester: semEnum };
  }, [semesterAndyear]);

  // Shared availability hook (centralized logic)
  const { availabilityMap } = useRoomAvailability({
    academicYear: derivedTerm?.academicYear,
    semester: derivedTerm?.semester,
    selectedTimeslots: lockScheduleData.timeslots,
    enabled: !!derivedTerm,
  });

  const timeSlotHandleChange: InputChangeHandler = (e) => {
    const value = e.target.value;
    console.log(value);
    const timeSlot = [...lockScheduleData.timeslots];
    dispatch({
      type: "SET_TIME_SLOT",
      payload: timeSlot.includes(value)
        ? timeSlot.filter((item) => item !== value)
        : [...timeSlot, value],
    });
  };

  const classRoomHandleChange = (value: string) => {
    const grade = [...lockScheduleData.GradeIDs];
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
        // room: lockScheduleData.room.RoomID === -1,
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
    // lockScheduleData.room,
  ]);

  useEffect(() => {
    dispatch({
      type: "SET_DAY_OF_WEEK",
      payload: initialState.lockScheduleData.DayOfWeek,
    });
    dispatch({
      type: "SET_TIME_SLOT",
      payload: initialState.lockScheduleData.timeslots,
    });
    dispatch({
      type: "SET_GRADE",
      payload: initialState.lockScheduleData.GradeIDs,
    });
  }, [lockScheduleData.subject]);
  const handleConfirm = () => {
    const cond =
      isEmptyData.Subject ||
      isEmptyData.DayOfWeek ||
      isEmptyData.timeslots ||
      isEmptyData.teachers ||
      isEmptyData.GradeIDs;
    // isEmptyData.room;
    if (cond) {
      validateData();
      enqueueSnackbar("กรุณากรอกข้อมูลให้ครบถ้วน", { variant: "warning" });
      return;
    }

    if (!data) {
      addLockSchedule(lockScheduleData);
    } else {
      editLockSchedule(lockScheduleData);
    }
  };

  const setTeacherList = (value: teacher[]) => {
    console.log(value);
    dispatch({ type: "SET_TEACHERS", payload: value });
  };

  const handleAddTeacherList = (value: teacher) => {
    const teacherList = [...lockScheduleData.teachers];
    teacherList.push(value);
    dispatch({ type: "SET_TEACHERS", payload: teacherList });
  };

  const removeTeacherFromList = (value: teacher) => {
    const teacherList = [...lockScheduleData.teachers];
    const index = teacherList.indexOf(value);
    teacherList.splice(index, 1);
    dispatch({ type: "SET_TEACHERS", payload: teacherList });
  };

  const handleSubjectChange = (value: SubjectWithResponsibilities) => {
    // console.log(value);
    const resps = value.teachers_responsibility;
    const teacherIDs = new Set(resps.map((item) => item.TeacherID));
    const teacherFilter = teacherData.data.filter((item) =>
      teacherIDs.has(item.TeacherID),
    );
    setTeacherList(teacherFilter);
    dispatch({ type: "SET_SUBJECT", payload: value });
  };

  const handleDayChange = (value: string) => {
    dispatch({ type: "SET_DAY_OF_WEEK", payload: value });
    dispatch({ type: "SET_TIME_SLOT", payload: [] });
  };

  const handleRoomChange = (value: room) => {
    dispatch({ type: "SET_ROOM_NAME", payload: value });
  };

  const addLockSchedule = async (data: LockScheduleData) => {
    closeModal();
    const loadbar = enqueueSnackbar("กำลังเพิ่มคาบล็อก", {
      variant: "info",
      persist: true,
    });

    try {
      // Transform data to match createLockAction schema
      const lockInput = {
        SubjectCode: data.SubjectCode,
        timeslots: data.timeslots,
        GradeIDs: data.GradeIDs,
        RespIDs: data.teachers.map((t) => t.TeacherID),
        RoomID: data.room?.RoomID || null,
      };

      await createLockAction(lockInput);
      closeSnackbar(loadbar);
      enqueueSnackbar("เพิ่มข้อมูลคาบล็อกสำเร็จ", { variant: "success" });
      mutate();
    } catch (error: unknown) {
      closeSnackbar(loadbar);
      enqueueSnackbar(
        "เกิดข้อผิดพลาดในการเพิ่มข้อมูลคาบล็อก: " +
          (error instanceof Error ? error.message : "Unknown error"),
        {
          variant: "error",
        },
      );
      console.error(error);
    }
  };

  const editLockSchedule = (data: LockScheduleData) => {
    console.log(data);
  };

  return (
    <>
      <div
        style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
        className="z-40 flex w-full h-screen items-center justify-center fixed left-0 top-0"
      >
        <div
          className={`relative flex flex-col w-[831px] h-fit overflow-hidden p-12 gap-10 bg-white rounded`}
        >
          {/* Content */}
          <div className="flex w-full h-auto justify-between items-center">
            <p className="text-xl select-none">เพิ่มวิชาล็อก</p>
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
            <SelectTeacher
              teachers={lockScheduleData.teachers}
              subject={lockScheduleData.subject ?? undefined}
              setTeacherList={setTeacherList}
              required={isEmptyData.teachers}
            />
            <SelectDayOfWeek
              dayOfWeek={lockScheduleData.DayOfWeek}
              handleDayChange={handleDayChange}
              required={isEmptyData.DayOfWeek}
            />
            <SelectMultipleTimeSlot
              subject={lockScheduleData.subject ?? undefined}
              timeSlotHandleChange={timeSlotHandleChange}
              checkedCondition={lockScheduleData.timeslots}
              required={isEmptyData.timeslots}
              daySelected={lockScheduleData.DayOfWeek}
            />
            <SelectRoomName
              roomName={lockScheduleData.room?.RoomName ?? ""}
              handleRoomChange={handleRoomChange}
              availabilityMap={availabilityMap}
              showAvailability
            />
            <SelectedClassRoom
              teachers={lockScheduleData.teachers}
              subject={lockScheduleData.subject ?? undefined}
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
