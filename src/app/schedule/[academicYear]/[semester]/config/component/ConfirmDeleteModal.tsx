import { AiOutlineClose } from "react-icons/ai";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import PrimaryButton from "@/components/mui/PrimaryButton";
import { closeSnackbar, enqueueSnackbar } from "notistack";

// Server Actions
import { deleteTimeslotsByTermAction } from "@/features/timeslot/application/actions/timeslot.actions";

import type { ModalCloseHandler } from "@/types/events";

type props = {
  closeModal: ModalCloseHandler;
  academicYear: number;
  semester: number;
  mutate: () => void;
};

function ConfirmDeleteModal({
  closeModal,
  academicYear,
  semester,
  mutate,
}: props) {
  const confirmed = () => {
    void removeMultiData();
  };
  const cancel = () => {
    closeModal();
  };
  //Function ตัวนี้ใช้ลบข้อมูลหนึ่งตัวพร้อมกันหลายตัวจากการติ๊ก checkbox
  const removeMultiData = async () => {
    const loadbar = enqueueSnackbar("กำลังลบข้อมูล", {
      variant: "info",
      persist: true,
    });

    try {
      const result = await deleteTimeslotsByTermAction({
        AcademicYear: academicYear,
        Semester: `SEMESTER_${semester}` as "SEMESTER_1" | "SEMESTER_2",
      });

      if (!result.success) {
        const errorMessage =
          typeof result.error === "string"
            ? result.error
            : result.error?.message || "Unknown error";
        throw new Error(errorMessage);
      }

      closeSnackbar(loadbar);
      enqueueSnackbar("ลบข้อมูลสำเร็จ", { variant: "success" });
      mutate();
      closeModal();
    } catch (err: unknown) {
      closeSnackbar(loadbar);
      enqueueSnackbar(
        "ลบข้อมูลไม่สำเร็จ " +
          (err instanceof Error ? err.message : "Unknown error"),
        {
          variant: "error",
        },
      );
    }
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
