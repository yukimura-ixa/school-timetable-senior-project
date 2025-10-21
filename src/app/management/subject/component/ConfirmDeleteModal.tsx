import React, { useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import PrimaryButton from "@/components/mui/PrimaryButton";
import { subject } from "@prisma/client";
import api from "@/libs/axios";
import { closeSnackbar, enqueueSnackbar } from "notistack";
type props = {
  closeModal: any;
  deleteData?: any;
  clearCheckList?: any;
  dataAmount?: number;
  subjectData: subject[];
  checkedList: any;
  mutate: Function;
};

function ConfirmDeleteModal({
  closeModal,
  deleteData,
  dataAmount,
  clearCheckList,
  subjectData,
  checkedList,
  mutate,
}: props) {
  const confirmed = () => {
    removeMultiData(subjectData, checkedList);
    closeModal();
  };
  const cancel = () => {
    if (dataAmount === 1) {
      clearCheckList();
    }
    closeModal();
  };
  const removeMultiData = async (data: subject[], checkedList) => {
    const loadbar = enqueueSnackbar("กำลังลบข้อมูล", {
      variant: "info",
      persist: true,
    });
    const deleteData = data
      .filter((item, index) => checkedList.includes(item.SubjectCode))
      .map((item) => item.SubjectCode);

    const response = await api
      .delete("/subject", {
        data: deleteData,
      })
      .then(() => {
        closeSnackbar(loadbar);
        enqueueSnackbar("ลบข้อมูลวิชาสำเร็จ", { variant: "success" });
        mutate();
      })
      .catch((error) => {
        closeSnackbar(loadbar);
        enqueueSnackbar("ลบข้อมูลวิชาไม่สำเร็จ " + error.response.data, {
          variant: "error",
        });
        console.log(error);
      });

    console.log(response);
    clearCheckList();
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
              คุณต้องการลบข้อมูลที่เลือกทั้งหมด {dataAmount} รายการใช่หรือไม่
            </p>
          </div>
          <span className="w-full flex gap-3 justify-end h-11">
            <PrimaryButton
              handleClick={cancel}
              title={"ยกเลิก"}
              color={"danger"}
              Icon={<CloseIcon />} reverseIcon={false} isDisabled={false}
            />
            <PrimaryButton
              handleClick={confirmed}
              title={"ยืนยัน"}
              color={"success"}
              Icon={<CheckIcon />} reverseIcon={false} isDisabled={false}
            />
          </span>
        </div>
      </div>
    </>
  );
}
export default ConfirmDeleteModal;
