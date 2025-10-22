"use client";
import MiniButton from "@/components/elements/static/MiniButton";
import React, { useState, Fragment } from "react";
import { MdAddCircle } from "react-icons/md";
import { TbSettings, TbTrash } from "react-icons/tb";
import type { program } from "@prisma/client";
import Loading from "@/app/loading";
import { useProgramData } from "@/app/_hooks/programData";
import AddStudyProgramModal from "../component/AddStudyProgramModal";
import EditStudyProgramModal from "../component/EditStudyProgramModal";
import { useParams } from "next/navigation";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import Link from "next/link";
import { semesterThai } from "@/models/semester-thai";
import { useConfirmDialog } from "@/components/dialogs";
import api from "@/libs/axios";
import { closeSnackbar, enqueueSnackbar } from "notistack";
type Props = {};

function StudyProgram(props: Props) {
  const params = useParams(); //get params
  const [addProgramModalActive, setAddProgramModalActive] =
    useState<boolean>(false);

  const [editProgramModalActive, setEditProgramModalActive] =
    useState<boolean>(false);

  const { confirm, dialog } = useConfirmDialog();

  const { data, isLoading, error, mutate } = useProgramData(
    params.year.toString(),
  );

  const [editProgram, setEditProgram] = useState({});
  const [editProgramIndex, setEditProgramIndex] = useState<number>(null);

  const handleDeleteProgram = async (programData: program) => {
    const confirmed = await confirm({
      title: "ลบข้อมูลหลักสูตร",
      message: `คุณต้องการลบข้อมูลหลักสูตร "${programData.ProgramName}" ใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้`,
      variant: "danger",
      confirmText: "ลบ",
      cancelText: "ยกเลิก",
    });

    if (!confirmed) return;

    const loadbar = enqueueSnackbar("กำลังลบข้อมูลหลักสูตร", {
      variant: "info",
      persist: true,
    });

    try {
      await api.delete("/program", { data: programData.ProgramID });
      closeSnackbar(loadbar);
      enqueueSnackbar("ลบข้อมูลหลักสูตรสำเร็จ", { variant: "success" });
      mutate();
    } catch (error: any) {
      closeSnackbar(loadbar);
      enqueueSnackbar(
        "ลบข้อมูลหลักสูตรไม่สำเร็จ: " + (error.response?.data || error.message),
        { variant: "error" }
      );
      console.error(error);
    }
  };

  // const testAddProgram = (newProgram) => {
  //   setMockupData(() => [...mockUpData, newProgram]);
  // };

  return (
    <>
      {dialog}
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
          editData={editProgram}
        />
      ) : null}

      {/* <AllStudyProgram /> */}
      <div className="flex justify-between my-4">
        <h1 className="text-xl font-bold">
          หลักสูตรมัธยมศึกษาปีที่ {params.year}
        </h1>
        <Link
          href={"/management/program"}
          className="flex gap-3 cursor-pointer"
        >
          <KeyboardBackspaceIcon />
          <p className="text-sm">ย้อนกลับ</p>
        </Link>
      </div>
      <div className="w-full flex flex-wrap gap-4 py-4 justify-between">
        {isLoading ? ( //if data fetch is unsuccessed -> show loading component
          <Loading /> //Loading component
        ) : (
          data.map((item, index) => (
            <Fragment key={`${item.ProgramName}${index}`}>
              <div className="relative flex flex-col cursor-pointer p-4 gap-4 w-[49%] h-[214px] border border-[#EDEEF3] rounded">
                <div className="flex items-center gap-3">
                  <p className="text-lg font-bold w-full">{item.ProgramName}</p>
                  {/* <div className="cursor-pointer hover:bg-gray-100 duration-300 rounded p-1"></div> */}
                  <div className="flex gap-3  justify-end">
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
                      onClick={() => handleDeleteProgram(item)}
                    />
                  </div>
                </div>
                <div className="flex flex-row justify-between items-center">
                  <p className="text-gray-500 text-sm">เทอม</p>
                  <div className="flex flex-wrap w-[365px] h-fit gap-2">
                    <p className="text-gray-500 text-sm">
                      {semesterThai[item.Semester]}
                    </p>
                  </div>
                </div>
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
                          buttonColor={"primary"}
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
                {/* ชั้นที่เลือก */}
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
                            buttonColor="#1976d2"
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
          ))
        )}
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
