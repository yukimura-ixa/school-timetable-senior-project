import React, { useEffect, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import SelectedClassRoom from "./SelectedClassRoom";
import SelectSubjects from "./SelectSubjects";
import StudyProgramLabel from "./StudyProgramLabel";
import type { program, subject } from "@/prisma/generated/client";
import { updateProgramAction } from "@/features/program/application/actions/program.actions";

// Legacy form data type (program with relations)
type LegacyProgramData = program & {
  gradelevel?: Array<{ GradeID: string }>;
  subject?: subject[];
};

type Props = {
  data: LegacyProgramData;
  closeModal: () => void;
  mutate: () => void | Promise<void>;
};

function EditStudyProgramModal({ data, closeModal, mutate }: Props) {
  const [programData, setProgramData] = useState(data);
  const [isEmptyData, setIsEmptyData] = useState({
    ProgramName: false,
    gradelevel: false,
    subject: false,
  });
  const classRoomHandleChange = (value: { GradeID: string }) => {
    const gradelevelArr = programData.gradelevel || [];
    const removeDulpItem = gradelevelArr.filter(
      (item) => item.GradeID !== value.GradeID,
    ); //ตัวนี้ไว้ใช้กับเงื่อนไขตอนกดเลือกห้องเรียน ถ้ากดห้องที่เลือกแล้วจะลบออก
    setProgramData(() => ({
      ...programData,
      gradelevel:
        gradelevelArr.filter(
          (item) => item.GradeID === value.GradeID, //เช็คเงื่อนไขว่าถ้ากดเพิ่มเข้ามาแล้วยังไม่เคยเพิ่มห้องเรียนนี้มาก่อนจะเพิ่มเข้าไปใหม่ ถ้ามีแล้วก็ลบห้องนั้นออก
        ).length === 0
          ? [...gradelevelArr, value]
          : [...removeDulpItem],
    }));
  };
  const validateData = React.useCallback(() => {
    setIsEmptyData(() => ({
      ProgramName: programData.ProgramName.length === 0,
      gradelevel: (programData.gradelevel || []).length === 0,
      subject: (programData.subject || []).length === 0,
    }));
  }, [programData]);
  useEffect(() => {
    validateData();
  }, [validateData]);
  const editProgram = async (program: program) => {
    try {
      const result = await updateProgramAction({ programs: [program] });

      if (!result.success) {
        const errorMessage =
          typeof result.error === "string"
            ? result.error
            : result.error?.message || "Unknown error";
        throw new Error(errorMessage);
      }

      await mutate();
    } catch (error: unknown) {
      console.error("Failed to update program:", error);
      throw error;
    }
  };
  const editItemAndCloseModal = async () => {
    const cond =
      isEmptyData.ProgramName || isEmptyData.gradelevel || isEmptyData.subject;
    if (cond) {
      validateData();
    } else {
      await editProgram(programData);
      closeModal();
    }
  };
  const removeSubjectFromList = (index: number) => {
    setProgramData(() => ({
      ...programData,
      subject: [
        ...(programData.subject || []).filter(
          (_item, ind) => ind !== index,
        ),
      ],
    }));
  };
  const handleAddSubjectList = (subject: subject) => {
    setProgramData(() => ({
      ...programData,
      subject: [...(programData.subject || []), subject],
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
            <p className="text-xl select-none">แก้ไขหลักสูตร</p>
            <AiOutlineClose className="cursor-pointer" onClick={closeModal} />
          </div>
          <div className="flex flex-col gap-5 p-4 w-full h-auto overflow-y-scroll border border-[#EDEEF3]">
            <StudyProgramLabel
              required={false}
              title={programData.ProgramName}
              handleChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const value: string = e.target.value;
                setProgramData(() => ({
                  ...programData,
                  ProgramName: value,
                }));
              }}
            />
            <SelectSubjects
              subjectSelected={programData.subject || []}
              addSubjectFunction={handleAddSubjectList}
              removeSubjectFunction={removeSubjectFromList}
              required={isEmptyData.subject}
            />
            <SelectedClassRoom
              Grade={programData.gradelevel || []}
              classRoomHandleChange={classRoomHandleChange}
              required={isEmptyData.gradelevel}
            />
          </div>
          <span className="flex w-full justify-end">
            <button
              onClick={() => {
                void editItemAndCloseModal();
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
