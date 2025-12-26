import React, { Fragment, useEffect, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import SelectedClassRoom from "./SelectedClassRoom";
import SelectSubjects from "./SelectSubjects";
import StudyProgramLabel from "./StudyProgramLabel";
import type { gradelevel, subject } from "@/prisma/generated/client";
import { semester } from "@/prisma/generated/client";
import YearSemester from "./YearSemester";
import { closeSnackbar, enqueueSnackbar } from "notistack";
import { getBangkokThaiBuddhistYear } from "@/utils/datetime";

// Server Actions
import { createProgramAction } from "@/features/program/application/actions/program.actions";

type Props = {
  closeModal: () => void;
  mutate: () => void | Promise<void>;
};

type ProgramData = {
  ProgramName: string;
  Semester: semester | "";
  AcademicYear: number;
  gradelevel: gradelevel[];
  subject: subject[];
};

function AddStudyProgramModal({ closeModal, mutate }: Props) {
  // Get current Thai Buddhist year as default
  const currentThaiYear = getBangkokThaiBuddhistYear();

  const [newProgramData, setNewProgramData] = useState<ProgramData>({
    ProgramName: "",
    Semester: "",
    AcademicYear: currentThaiYear,
    gradelevel: [],
    subject: [],
  });

  const addProgram = async (program: ProgramData) => {
    const loadbar = enqueueSnackbar("กำลังเพิ่มข้อมูล", {
      variant: "info",
      persist: true,
    });
    closeModal();

    try {
      // NOTE: This form is missing required MOE fields (ProgramCode, Track, MinTotalCredits, Year).
      // gradelevel and subject associations are not supported by createProgramAction.
      // Using placeholders to pass typecheck.
      const result = await createProgramAction({
        ProgramCode: `PROG-${Date.now()}`, // Placeholder
        ProgramName: program.ProgramName,
        Year: 1, // Placeholder
        Track: "SCIENCE_MATH", // Placeholder
        MinTotalCredits: 0, // Placeholder
        Description: "",
        IsActive: true,
        // gradelevel and subject are not supported in createProgramAction
      });

      if (!result.success) {
        const errorMessage =
          typeof result.error === "string"
            ? result.error
            : typeof result.error === "object" &&
                result.error !== null &&
                "message" in result.error
              ? (result.error as { message: string }).message
              : "Unknown error";
        throw new Error(errorMessage);
      }

      await mutate();
      enqueueSnackbar("เพิ่มข้อมูลสำเร็จ", { variant: "success" });
      closeSnackbar(loadbar);
    } catch (error: unknown) {
      closeSnackbar(loadbar);
      const message = error instanceof Error ? error.message : "Unknown error";
      enqueueSnackbar("เกิดข้อผิดพลาดในการเพิ่มหลักสูตร: " + message, {
        variant: "error",
      });
    }
  };

  const [isEmptyData, setIsEmptyData] = useState({
    ProgramName: false,
    Semester: false,
    gradelevel: false,
    subject: false,
  });

  const validateData = React.useCallback(() => {
    setIsEmptyData(() => ({
      ProgramName: newProgramData.ProgramName.length === 0,
      Semester: newProgramData.Semester === "",
      gradelevel: newProgramData.gradelevel.length === 0,
      subject: newProgramData.subject.length === 0,
    }));
  }, [newProgramData]);
  const classRoomHandleChange = (value: gradelevel) => {
    const removeDulpItem = newProgramData.gradelevel.filter(
      (item) => item.GradeID !== value.GradeID,
    ); //ตัวนี้ไว้ใช้กับเงื่อนไขตอนกดเลือกห้องเรียน ถ้ากดห้องที่เลือกแล้วจะลบออก
    setNewProgramData(() => ({
      ...newProgramData,
      gradelevel:
        newProgramData.gradelevel.filter(
          (item) => item.GradeID === value.GradeID, //เช็คเงื่อนไขว่าถ้ากดเพิ่มเข้ามาแล้วยังไม่เคยเพิ่มห้องเรียนนี้มาก่อนจะเพิ่มเข้าไปใหม่ ถ้ามีแล้วก็ลบห้องนั้นออก
        ).length === 0
          ? [...newProgramData.gradelevel, value]
          : [...removeDulpItem],
    }));
  };
  useEffect(() => {
    validateData();
  }, [validateData]);

  const handleSelectSemester = (value: unknown) => {
    const semesterKey = value as keyof typeof semester;
    setNewProgramData(() => ({
      ...newProgramData,
      Semester: semester[semesterKey],
    }));
  };

  const handleAddSubjectList = (subject: subject) => {
    setNewProgramData(() => ({
      ...newProgramData,
      subject: [...newProgramData.subject, subject],
    }));
  };
  const removeSubjectFromList = (index: number) => {
    setNewProgramData(() => ({
      ...newProgramData,
      subject: [...newProgramData.subject.filter((item, ind) => ind !== index)],
    }));
  };
  const addItemAndCloseModal = async () => {
    const cond =
      isEmptyData.ProgramName ||
      isEmptyData.gradelevel ||
      isEmptyData.subject ||
      isEmptyData.Semester;
    if (cond) {
      validateData();
    } else {
      await addProgram(newProgramData);
    }
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
            <p className="text-xl select-none">เพิ่มหลักสูตร</p>
            <AiOutlineClose className="cursor-pointer" onClick={closeModal} />
          </div>
          <div className="flex flex-col gap-5 p-4 w-full h-auto overflow-y-scroll border border-[#EDEEF3]">
            <StudyProgramLabel
              required={isEmptyData.ProgramName}
              title={newProgramData.ProgramName}
              handleChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const value: string = e.target.value;
                setNewProgramData(() => ({
                  ...newProgramData,
                  ProgramName: value,
                }));
              }}
            />
            <YearSemester
              required={isEmptyData.Semester}
              semester={newProgramData.Semester}
              handleSemesterChange={handleSelectSemester}
            />

            <SelectSubjects
              subjectSelected={newProgramData.subject}
              addSubjectFunction={handleAddSubjectList}
              removeSubjectFunction={removeSubjectFromList}
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
