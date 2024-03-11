import React from "react";
import { AiOutlineClose } from "react-icons/ai";
// import { Teacher } from "../model/teacher";
import api from "@/libs/axios";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import PrimaryButton from "@/components/elements/static/PrimaryButton";
import { closeSnackbar, enqueueSnackbar } from "notistack";
type props = {
  closeModal: any;
  academicYear: string;
  semester: string;
  mutate: Function;
};

function ConfirmDeleteModal({
  closeModal,
  academicYear,
  semester,
  mutate,
}: props) {
  const confirmed = () => {
    removeMultiData();
    closeModal();
  };
  const cancel = () => {
    closeModal();
  };
  //Function ตัวนี้ใช้ลบข้อมูลหนึ่งตัวพร้อมกันหลายตัวจากการติ๊ก checkbox
  const removeMultiData = () => {
    const loadbar = enqueueSnackbar("กำลังลบข้อมูล", {
      variant: "info",
      persist: true,
    });
    const response = api
      .delete("/timeslot", {
        data: { academicYear: academicYear, Semester: "SEMESTER_" + semester },
      })
      .then(() => {
        closeSnackbar(loadbar);
        enqueueSnackbar("ลบข้อมูลสำเร็จ", { variant: "success" });
        mutate();
      })
      .catch((err) => {
        closeSnackbar(loadbar);
        enqueueSnackbar("ลบข้อมูลไม่สำเร็จ " + err.response.data.error, {
          variant: "error",
        });
      });
  };
  return (
    <>
      <div
        style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
        className="z-40 flex w-full h-screen items-center justify-center fixed left-0 top-0"
      >
        <div className="flex flex-col w-fit h-fit p-7 gap-10 bg-white rounded">
          {/* Content */}
          <div className="flex w-full h-auto justify-between items-center">
            <p className="text-lg select-none">ลบข้อมูล</p>
            <AiOutlineClose className="cursor-pointer" onClick={cancel} />
          </div>
          <div className="flex w-full h-auto justify-between items-center">
            <p className="text-lg select-none font-bold">
              คุณต้องการลบตารางสอนเทอม {semester} ปีการศึกษา {academicYear}{" "}
              ใช่หรือไม่
            </p>
          </div>
          <span className="w-full flex gap-3 justify-end h-11">
            <PrimaryButton
              handleClick={cancel}
              title={"ยกเลิก"}
              color={"danger"}
              Icon={<CloseIcon />}
            />
            <PrimaryButton
              handleClick={confirmed}
              title={"ยืนยัน"}
              color={"success"}
              Icon={<CheckIcon />}
            />
          </span>
        </div>
      </div>
    </>
  );
}
export default ConfirmDeleteModal;
