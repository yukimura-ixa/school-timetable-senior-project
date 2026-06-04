import React, { useEffect, useReducer } from "react";
import { AiOutlineClose, AiOutlineLock, AiOutlineCheck } from "react-icons/ai";
import SelectDayOfWeek from "./SelectDayOfWeek";
import SelectSubject from "./SelectSubject";
import SelectMultipleTimeSlot from "./SelectMultipleTimeSlot";
import SelectTeacher from "./SelectTeacher";
import SelectedClassRoom from "./SelectedClassRoom";
import SelectRoomName from "./SelectRoomName";
import { useParams } from "next/navigation";
import { useRoomAvailability } from "@/hooks/useRoomAvailability";
import type { room, semester, teacher } from "@/prisma/generated/client";
import { createLockAction } from "@/features/lock/application/actions/lock.actions";
import { closeSnackbar, enqueueSnackbar } from "notistack";
import { useTeachers } from "@/hooks";

import type { ModalCloseHandler, InputChangeHandler } from "@/types/events";
import type { SubjectWithResponsibilities } from "@/types/lock-schedule";
import { isValidLockTimeslotSelection } from "@/features/lock/domain/lock-timeslot-rules";

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

// A lock is 1 period, or exactly 2 consecutive (adjacent, same-day) periods.
// Empty, >2, or a non-adjacent/cross-day pair are invalid. See jfs.
function computeEmptyData(data: LockScheduleData): IsEmptyData {
  return {
    Subject: data.SubjectCode.length === 0,
    DayOfWeek: data.DayOfWeek.length === 0,
    timeslots: !isValidLockTimeslotSelection(data.timeslots),
    teachers: data.teachers.length === 0,
    GradeIDs: data.GradeIDs.length === 0,
  };
}

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
  // Extract year and semester from new route params
  const academicYear = params.academicYear
    ? parseInt(params.academicYear as string, 10)
    : null;
  const semester = params.semester
    ? parseInt(params.semester as string, 10)
    : null;
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
  const derivedTerm = (() => {
    if (!academicYear || !semester) return null;
    if (semester !== 1 && semester !== 2) return null;
    const semEnum: semester = semester === 1 ? "SEMESTER_1" : "SEMESTER_2";
    return { academicYear, semester: semEnum };
  })();

  // Shared availability hook (centralized logic)
  const { availabilityMap } = useRoomAvailability({
    academicYear: derivedTerm?.academicYear,
    semester: derivedTerm?.semester,
    selectedTimeslots: lockScheduleData.timeslots,
    enabled: !!derivedTerm,
  });

  const timeSlotHandleChange: InputChangeHandler = (e) => {
    const value = e.target.value;
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

  useEffect(() => {
    dispatch({
      type: "SET_IS_EMPTY_DATA",
      payload: computeEmptyData(lockScheduleData),
    });
  }, [lockScheduleData]);

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
      dispatch({
        type: "SET_IS_EMPTY_DATA",
        payload: computeEmptyData(lockScheduleData),
      });
      enqueueSnackbar("กรุณากรอกข้อมูลให้ครบถ้วน", { variant: "warning" });
      return;
    }

    if (!data) {
      void addLockSchedule(lockScheduleData);
    } else {
      editLockSchedule(lockScheduleData);
    }
  };

  const setTeacherList = (value: teacher[]) => {
    dispatch({ type: "SET_TEACHERS", payload: value });
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
    void data;
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeModal]);

  // Required-field readiness, derived from existing validation flags (true = invalid/empty).
  const requiredChecks = [
    isEmptyData.Subject,
    isEmptyData.teachers,
    isEmptyData.DayOfWeek,
    isEmptyData.timeslots,
    isEmptyData.GradeIDs,
  ];
  const totalRequired = requiredChecks.length;
  const completedRequired = requiredChecks.filter((invalid) => !invalid).length;
  const isComplete = completedRequired === totalRequired;

  return (
    <div className="fixed left-0 top-0 z-[60] flex h-screen w-full items-center justify-center bg-black/60 backdrop-blur-sm animate-ds-fade-in">
      <button
        type="button"
        aria-label="ปิด"
        onClick={closeModal}
        className="absolute inset-0 h-full w-full cursor-default"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lock-form-title"
        className="relative mx-4 flex max-h-[90vh] w-full max-w-[831px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl animate-ds-scale-in"
      >
        {/* Header — gradient band with padlock glyph */}
        <header className="relative shrink-0 overflow-hidden bg-ds-gradient-ocean px-8 py-6">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-16 size-40 rounded-full bg-white/10 blur-2xl"
          />
          <div className="relative flex items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/20 ring-1 ring-white/30 backdrop-blur-sm">
              <AiOutlineLock className="text-2xl text-white" />
            </div>
            <div className="min-w-0">
              <p
                id="lock-form-title"
                className="select-none text-xl font-semibold leading-tight text-white"
              >
                เพิ่มวิชาล็อก
              </p>
              <p className="mt-0.5 select-none text-sm text-white/80">
                กำหนดวิชา วัน คาบ ครู ห้อง และชั้นเรียนที่ต้องการล็อก
              </p>
            </div>
            <button
              type="button"
              aria-label="ปิด"
              onClick={closeModal}
              className="ml-auto rounded-lg p-2 text-white/80 transition hover:bg-white/20 hover:text-white"
            >
              <AiOutlineClose className="text-lg" />
            </button>
          </div>
        </header>

        {/* Body — scrollable field stack */}
        <div className="flex-1 overflow-y-auto bg-ds-slate-50 px-8 py-6">
          <div className="flex flex-col gap-5">
            <SelectSubject
              currentValue={`${
                lockScheduleData.SubjectCode === ""
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
        </div>

        {/* Footer — readiness indicator + actions */}
        <footer className="flex shrink-0 items-center justify-between gap-4 border-t border-ds-slate-200 bg-white px-8 py-5">
          <div className="flex items-center gap-2 text-sm">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isComplete ? "bg-ds-emerald" : "bg-ds-amber"
              }`}
            />
            <span className="text-ds-slate-600">
              {isComplete
                ? "ข้อมูลครบถ้วน"
                : `กรอกแล้ว ${completedRequired}/${totalRequired} ช่องที่จำเป็น`}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-lg px-5 py-2.5 text-sm font-medium text-ds-slate-600 transition hover:bg-ds-slate-100"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className={`inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold transition active:scale-[0.98] ${
                isComplete
                  ? "bg-ds-gradient-primary text-white shadow-ds-blue hover:brightness-110"
                  : "bg-ds-slate-200 text-ds-slate-600 hover:bg-ds-slate-300"
              }`}
            >
              <AiOutlineCheck className="text-base" />
              ยืนยัน
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default LockScheduleForm;
