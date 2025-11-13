import React from "react";
import { AiOutlineClose } from "react-icons/ai";
import PrimaryButton from "@/components/mui/PrimaryButton";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import { deleteRoomsAction } from "@/features/room/application/actions/room.actions";
import { room } from "@/prisma/generated";
import { closeSnackbar, enqueueSnackbar } from "notistack";
type props = {
  closeModal: any;
  deleteData: any;
  clearCheckList: any;
  dataAmount: number;
  checkedList: any;
  mutate: Function;
  openSnackBar?: any;
};

function ConfirmDeleteModal({
  closeModal,
  deleteData,
  dataAmount,
  clearCheckList,
  checkedList,
  mutate,
}: props) {
  const confirmed = () => {
    removeMultiData(deleteData, checkedList);
    closeModal();
  };
  const cancel = () => {
    if (dataAmount === 1) {
      clearCheckList();
    }
    closeModal();
  };
  const removeMultiData = async (data: room[], checkedList: number[]) => {
    const loadbar = enqueueSnackbar("กำลังลบข้อมูลสถานที่เรียน", {
      variant: "info",
      persist: true,
    });
    
    const deleteData = data
      .filter((item, _index) => checkedList.includes(item.RoomID))
      .map((item) => item.RoomID);

    try {
      const result = await deleteRoomsAction({ roomIds: deleteData });
      
      if (!result.success) {
        const errorMessage = typeof result.error === 'string' 
          ? result.error 
          : result.error?.message || "Unknown error";
        throw new Error(errorMessage);
      }
      
      closeSnackbar(loadbar);
      enqueueSnackbar("ลบข้อมูลสถานที่เรียนสำเร็จ", { variant: "success" });
      mutate();
    } catch (error: any) {
      closeSnackbar(loadbar);
      enqueueSnackbar("ลบข้อมูลสถานที่เรียนไม่สำเร็จ " + (error.message || "Unknown error"), {
        variant: "error",
      });
      console.error(error);
    }

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
