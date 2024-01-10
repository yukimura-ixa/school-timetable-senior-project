"use client";
import MiniButton from "@/components/elements/static/MiniButton";
import React, { useState, Fragment } from "react";
import { MdAddCircle } from "react-icons/md";
import { TbSettings, TbTrash } from "react-icons/tb";
import AddStudyProgramModal from "./component/AddStudyProgramModal";
import EditStudyProgramModal from "./component/EditStudyProgramModal";
import { useProgramData } from "../_hooks/programData";
import type { program } from "@prisma/client";
import { useGradeLevelData } from "../_hooks/gradeLevelData";
import { useSubjectData } from "../_hooks/subjectData";

type Props = {};

function StudyProgram(props: Props) {
  const [addProgramModalActive, setAddProgramModalActive] =
    useState<boolean>(false);

  const [editProgramModalActive, setEditProgramModalActive] =
    useState<boolean>(false);

  const { data, isLoading, error, mutate } = useProgramData();

  const [editProgram, setEditProgram] = useState({});
  const [editProgramIndex, setEditProgramIndex] = useState<number>(null);

  return (
    <>
      {addProgramModalActive ? (
        <AddStudyProgramModal
          closeModal={() => setAddProgramModalActive(false)}
          mutate={mutate}
        />
      ) : null}
      {editProgramModalActive ? (
        <EditStudyProgramModal
          closeModal={() => setEditProgramModalActive(false)}
          mutate={mutate}
          data={editProgram}
        />
      ) : null}
      <div className="w-full flex flex-wrap gap-4 py-4 justify-between">
        {data.map((item, index) => (
          <Fragment key={`${item.ProgramName}${index}`}>
            <div className="relative flex flex-col cursor-pointer p-4 gap-4 w-[49%] h-[214px] border border-[#EDEEF3] rounded">
              <div className="flex items-center gap-3">
                <p className="text-lg font-bold">{item.ProgramName}</p>
                {/* <div className="cursor-pointer hover:bg-gray-100 duration-300 rounded p-1"></div> */}
                <div className="flex gap-3 w-full justify-end">
                  <TbSettings
                    size={24}
                    className="fill-[#EDEEF3]"
                    onClick={() => {
                      setEditProgramModalActive(true);
                      setEditProgramIndex(index);
                      setEditProgram(item);
                    }}
                  />
                  <TbTrash
                    size={24}
                    className="text-red-500 right-6 cursor-pointer hover:bg-gray-100 duration-300"
                  />
                </div>
              </div>
              {/* ชั้นเรียนที่กำหนดให้คาบล็อก */}
              <div className="flex flex-row justify-between items-center">
                <p className="text-gray-500 text-sm">ชั้นเรียน</p>
                <div className="flex flex-wrap w-[365px] h-fit gap-2">
                  {item.gradelevel.map((grade, index) => (
                    <Fragment key={`${grade.GradeID}`}>
                      <MiniButton
                        width={54}
                        height={25}
                        border={true}
                        borderColor="#c7c7c7"
                        titleColor="#4F515E"
                        title={`ม.${grade.Year}/${grade.Number}`}
                        buttonColor={""}
                        isSelected={false}
                        handleClick={undefined}
                        hoverable={false}
                      />
                      {/* {index < 9 ? (
                        <MiniButton
                          width={54}
                          height={25}
                          border={true}
                          borderColor="#c7c7c7"
                          titleColor="#4F515E"
                          title={`ม.${item.toString().substring(0, 1)}/${item
                            .toString()
                            .substring(2)}`}
                        />
                      ) : index < 10 ? (
                        <div
                          onMouseEnter={() => {}}
                          onMouseLeave={() => {}}
                          className="hover:bg-gray-100 duration-300 w-[45px] h-[25px] border rounded text-center border-[#c7c7c7] text-[#4F515E]"
                        >
                          <p>...</p>
                        </div>
                      ) : null} */}
                    </Fragment>
                  ))}
                </div>
              </div>
              {/* ครูที่เลือก */}
              <div className="flex flex-row justify-between items-center">
                <p className="text-gray-500 text-sm">รายวิชา</p>
                <div className="flex flex-wrap w-[365px] h-fit gap-2">
                  {item.subject.map((subject, index) => (
                    <Fragment key={`${subject.SubjectCode}`}>
                      {index < 3 ? (
                        <MiniButton
                          // width={54}
                          height={25}
                          border={true}
                          borderColor="#c7c7c7"
                          titleColor="#4F515E"
                          title={`${subject.SubjectCode}`}
                          buttonColor={""}
                          width={""}
                          isSelected={false}
                          handleClick={undefined}
                          hoverable={false}
                        />
                      ) : index < 4 ? (
                        <div className="hover:bg-gray-100 duration-300 w-[100px] h-[25px] border rounded text-center border-[#c7c7c7] text-[#4F515E]">
                          <p>...</p>
                        </div>
                      ) : null}
                    </Fragment>
                  ))}
                </div>
              </div>
            </div>
          </Fragment>
        ))}
        <div
          onClick={() => setAddProgramModalActive(true)}
          className="flex justify-center cursor-pointer items-center p-4 gap-3 w-[49%] h-[214px] border border-[#EDEEF3] rounded hover:bg-gray-100 duration-300"
        >
          <MdAddCircle size={24} className="fill-gray-500" />
          <p className="text-lg font-bold">เพิ่มหลักสูตร</p>
        </div>
      </div>
    </>
  );
}

export default StudyProgram;
