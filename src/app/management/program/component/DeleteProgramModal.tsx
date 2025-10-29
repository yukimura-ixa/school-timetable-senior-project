import PrimaryButton from "@/components/mui/PrimaryButton";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import { deleteProgramAction } from "@/features/program/application/actions/program.actions";
import { closeSnackbar, enqueueSnackbar } from "notistack";
type props = {
  closeModal: any;
  deleteData: any;
  mutate: Function;
};

function DeleteProgramModal({ closeModal, deleteData, mutate }: props) {
  const confirmed = () => {
    removeData(deleteData);
    closeModal();
  };
  const cancel = () => {
    closeModal();
  };
  const removeData = async (ProgramID: string) => {
    const loadbar = enqueueSnackbar("กำลังลบข้อมูล", {
      variant: "info",
      persist: true,
    });
    
    try {
      const result = await deleteProgramAction({ programId: ProgramID });
      
      if (!result.success) {
        const errorMessage = typeof result.error === 'string' 
          ? result.error 
          : result.error?.message || "Unknown error";
        throw new Error(errorMessage);
      }
      
      closeSnackbar(loadbar);
      enqueueSnackbar("ลบข้อมูลสำเร็จ", { variant: "success" });
      mutate();
    } catch (error: any) {
      closeSnackbar(loadbar);
      enqueueSnackbar("เกิดข้อผิดพลาดในการลบข้อมูล: " + (error.message || "Unknown error"), {
        variant: "error",
      });
      console.error(error);
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
            <p className="text-lg select-none">
              คุณต้องการลบข้อมูลหลักสูตร <b>{deleteData.ProgramName}</b>{" "}
              ใช่หรือไม่
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
export default DeleteProgramModal;
