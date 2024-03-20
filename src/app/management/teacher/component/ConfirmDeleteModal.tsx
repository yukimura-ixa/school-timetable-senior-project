import { AiOutlineClose } from "react-icons/ai";
import api from "@/libs/axios";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import PrimaryButton from "@/components/elements/static/PrimaryButton";
import { closeSnackbar, enqueueSnackbar } from "notistack";
import type { teacher } from "@prisma/client";
type props = {
  closeModal: any;
  teacherData: teacher[];
  checkedList: any;
  clearCheckList: any;
  dataAmount: number;
  mutate: Function;
};

function ConfirmDeleteModal({
  closeModal,
  teacherData,
  checkedList,
  dataAmount,
  clearCheckList,
  mutate,
}: props) {
  const confirmed = () => {
    removeMultiData(teacherData, checkedList);
    closeModal();
  };
  const cancel = () => {
    if (dataAmount === 1) {
      clearCheckList();
    }
    closeModal();
  };
  //Function ตัวนี้ใช้ลบข้อมูลหนึ่งตัวพร้อมกันหลายตัวจากการติ๊ก checkbox
  const removeMultiData = async (data: teacher[], checkedList) => {
    const loadbar = enqueueSnackbar("กำลังลบข้อมูลครู", {
      variant: "info",
      persist: true,
    });
    const deleteData = data
      .filter((item, index) => checkedList.includes(item.TeacherID))
      .map((item) => item.TeacherID);

    const response = await api
      .delete("/teacher", {
        data: deleteData,
      })
      .then(() => {
        closeSnackbar(loadbar);
        enqueueSnackbar("ลบข้อมูลครูสำเร็จ", { variant: "success" });
        mutate();
      })
      .catch((error) => {
        closeSnackbar(loadbar);
        enqueueSnackbar("ลบข้อมูลครูไม่สำเร็จ " + error.respnse.data, {
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
