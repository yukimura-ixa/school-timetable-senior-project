import React, { Fragment, use, useEffect, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import SelectedClassRoom from "./SelectedClassRoom";
import SelectSubjects from "./SelectSubjects";
import StudyProgramLabel from "./StudyProgramLabel";
import type { program, subject } from "@/prisma/generated/client";
import { semester } from "@/prisma/generated/client";
import YearSemester from "./YearSemester";
import { closeSnackbar, enqueueSnackbar } from "notistack";

// Server Actions
import { updateProgramAction } from "@/features/program/application/actions/program.actions";

// Extended program type with relations for form data
type ProgramFormData = {
  ProgramID: number;
  ProgramName: string;
  Semester: semester;
  AcademicYear: number;
  gradelevel: Array<{ GradeID: string; [key: string]: unknown }>;
  subject: subject[];
};

type Props = {
  closeModal: () => void;
  mutate: () => void | Promise<void>;
  editData: ProgramFormData;
};

function EditStudyProgramModal({ closeModal, mutate, editData }: Props) {
  // Ensure AcademicYear exists in editData
  const currentThaiYear = new Date().getFullYear() + 543;
  const [newProgramData, setNewProgramData] = useState({
    ...editData,
    AcademicYear: editData?.AcademicYear || currentThaiYear,
  });
  const editProgram = async (program: ProgramFormData) => {
    const loadbar = enqueueSnackbar("กำลังแก้ไขข้อมูล", {
      variant: "info",
      persist: true,
    });
    console.log(program);
    closeModal();

    try {
      const result = await updateProgramAction({
        ProgramID: program.ProgramID,
        ProgramName: program.ProgramName,
        Semester: program.Semester,
        AcademicYear: program.AcademicYear,
        gradelevel: program.gradelevel.map((g: { GradeID: string }) => ({
          GradeID: g.GradeID,
        })),
        subject: program.subject.map((s: subject) => ({
          SubjectCode: s.SubjectCode,
        })),
      });

      if (!result.success) {
        const errorMessage =
          typeof result.error === "string"
            ? result.error
            : result.error?.message || "Unknown error";
        throw new Error(errorMessage);
      }

      mutate();
      enqueueSnackbar("แก้ไขหลักสูตรสำเร็จ", { variant: "success" });
      closeSnackbar(loadbar);
    } catch (error: any) {
      closeSnackbar(loadbar);
      enqueueSnackbar(
        "เกิดข้อผิดพลาดในการแก้ไขหลักสูตร: " +
          (error.message || "Unknown error"),
        { variant: "error" },
      );
    }
  };

  const [isEmptyData, setIsEmptyData] = useState({
    ProgramName: false,
    Semester: false,
    gradelevel: false,
    subject: false,
  });

  const validateData = () => {
    setIsEmptyData(() => ({
      ProgramName: newProgramData.ProgramName.length == 0,
      // Semester is always valid in edit mode (comes from existing program data)
      Semester: false,
      gradelevel: newProgramData.gradelevel.length == 0,
      subject: newProgramData.subject.length == 0,
    }));
  };
  const classRoomHandleChange = (value: {
    GradeID: string;
    [key: string]: unknown;
  }) => {
    const removeDulpItem = newProgramData.gradelevel.filter(
      (item: { GradeID: string; [key: string]: unknown }) =>
        item.GradeID != value.GradeID,
    ); //ตัวนี้ไว้ใช้กับเงื่อนไขตอนกดเลือกห้องเรียน ถ้ากดห้องที่เลือกแล้วจะลบออก
    setNewProgramData(() => ({
      ...newProgramData,
      gradelevel:
        newProgramData.gradelevel.filter(
          (item: { GradeID: string; [key: string]: unknown }) =>
            item.GradeID === value.GradeID, //เช็คเงื่อนไขว่าถ้ากดเพิ่มเข้ามาแล้วยังไม่เคยเพิ่มห้องเรียนนี้มาก่อนจะเพิ่มเข้าไปใหม่ ถ้ามีแล้วก็ลบห้องนั้นออก
        ).length === 0
          ? [...newProgramData.gradelevel, value]
          : [...removeDulpItem],
    }));
  };
  useEffect(() => {
    const validate = () => {
      validateData();
    };
    return validate();
  }, [
    newProgramData.ProgramName,
    newProgramData.Semester,
    newProgramData.gradelevel,
    newProgramData.subject,
  ]);

  const handleSelectSemester = (value: keyof typeof semester) => {
    setNewProgramData(() => ({
      ...newProgramData,
      Semester: semester[value],
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
      subject: [
        ...newProgramData.subject.filter(
          (item: subject, ind: number) => ind != index,
        ),
      ],
    }));
  };
  const addItemAndCloseModal = () => {
    const cond =
      isEmptyData.ProgramName ||
      isEmptyData.gradelevel ||
      isEmptyData.subject ||
      isEmptyData.Semester;
    console.log(cond);
    if (cond) {
      validateData();
    } else {
      editProgram(newProgramData);
    }
  };
  return (
    <>
      <div
        style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
        className="z-40 flex w-full h-screen items-center justify-center fixed left-0 top-0"
      >
        <div
          className={`relative flex flex-col w-[831px] h-5/6 overflow-hidden p-12 gap-10 bg-white rounded`}
        >
          {/* Content */}
          <div className="flex w-full h-auto justify-between items-center">
            <p className="text-xl select-none">แก้ไขหลักสูตร</p>
            <AiOutlineClose className="cursor-pointer" onClick={closeModal} />
          </div>
          <div className="flex flex-col gap-5 p-4 w-full h-auto overflow-y-scroll border border-[#EDEEF3]">
            <StudyProgramLabel
              required={isEmptyData.ProgramName}
              title={newProgramData.ProgramName}
              handleChange={(e: any) => {
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

export default EditStudyProgramModal;
