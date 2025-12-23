import { AiOutlineClose } from "react-icons/ai";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import PrimaryButton from "@/components/mui/PrimaryButton";
import { closeSnackbar, enqueueSnackbar } from "notistack";
import type { teacher } from "@/prisma/generated/client";

// Server Actions
import { deleteTeachersAction } from "@/features/teacher/application/actions/teacher.actions";

type props = {
  closeModal: () => void;
  teacherData: teacher[];
  checkedList: number[];
  clearCheckList: () => void;
  dataAmount: number;
  mutate: () => void;
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
  const removeMultiData = async (data: teacher[], checkedList: number[]) => {
    const loadbar = enqueueSnackbar("กำลังลบข้อมูลครู", {
      variant: "info",
      persist: true,
    });
    const deleteData = data
      .filter((item, index) => checkedList.includes(item.TeacherID))
      .map((item) => item.TeacherID);

    try {
      // Schema expects number[] directly
      const result = await deleteTeachersAction(deleteData);

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

      closeSnackbar(loadbar);
      enqueueSnackbar("ลบข้อมูลครูสำเร็จ", { variant: "success" });
      mutate();
    } catch (error: unknown) {
      closeSnackbar(loadbar);
      const message = error instanceof Error ? error.message : "Unknown error";
      enqueueSnackbar("ลบข้อมูลครูไม่สำเร็จ: " + message, {
        variant: "error",
      });
      console.log(error);
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
              Icon={<CloseIcon />}
              reverseIcon={false}
              isDisabled={false}
            />
            <PrimaryButton
              handleClick={confirmed}
              title={"ยืนยัน"}
              color={"success"}
              Icon={<CheckIcon />}
              reverseIcon={false}
              isDisabled={false}
            />
          </span>
        </div>
      </div>
    </>
  );
}
export default ConfirmDeleteModal;
