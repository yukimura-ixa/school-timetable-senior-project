import { AiOutlineClose } from "react-icons/ai";
import PrimaryButton from "@/components/mui/PrimaryButton";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import type { gradelevel } from "@/prisma/generated/client";
import { deleteGradeLevelsAction } from "@/features/gradelevel/application/actions/gradelevel.actions";
import { closeSnackbar, enqueueSnackbar } from "notistack";
type props = {
  closeModal: () => void;
  deleteData: gradelevel[];
  clearCheckList: () => void;
  dataAmount: number;
  checkedList: string[];
  mutate: () => void;
};

function ConfirmDeleteModal({
  closeModal,
  deleteData,
  dataAmount,
  clearCheckList,
  checkedList,
  mutate,
}: props) {
  const confirmed = async () => {
    await removeMultiData(deleteData, checkedList);
    closeModal();
  };
  const cancel = () => {
    if (dataAmount === 1) {
      clearCheckList();
    }
    closeModal();
  };
  const removeMultiData = async (data: gradelevel[], checkedList: string[]) => {
    const loadbar = enqueueSnackbar("กำลังลบข้อมูลชั้นเรียน", {
      variant: "info",
      persist: true,
    });

    const deleteData = data
      .filter((item) => checkedList.includes(item.GradeID))
      .map((item) => item.GradeID);

    try {
      // The action expects string[], not { gradeIds: string[] } based on schema
      // Need to verifying action signature.
      // createAction wrapper usually takes single input.
      // deleteGradeLevelsSchema is v.array(v.string())
      // So input should be string[]
      const result = await deleteGradeLevelsAction(deleteData);

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
      enqueueSnackbar("ลบข้อมูลชั้นเรียนสำเร็จ", { variant: "success" });
      mutate();
    } catch (error: unknown) {
      closeSnackbar(loadbar);
      const message = error instanceof Error ? error.message : "Unknown error";
      enqueueSnackbar("ลบข้อมูลชั้นเรียนไม่สำเร็จ " + message, {
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
