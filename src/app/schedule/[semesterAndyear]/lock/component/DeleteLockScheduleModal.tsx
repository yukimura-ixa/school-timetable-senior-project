import PrimaryButton from "@/components/mui/PrimaryButton";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import api from "@/libs/axios";
import { enqueueSnackbar } from "notistack";
type props = {
  closeModal: any;
  deleteData: any;
  mutate: Function;
};

function DeleteLockScheduleModal({ closeModal, deleteData, mutate }: props) {
  const confirmed = () => {
    deleteLockSchedule(deleteData);
    closeModal();
  };
  const cancel = () => {
    closeModal();
  };

  const deleteLockSchedule = async (data: any) => {
    const deleteData = data.ClassIDs;
    try {
      const response = await api.delete("/lock", { data: deleteData });
      if (response.status === 200) {
        mutate();
        enqueueSnackbar("ลบข้อมูลคาบล็อกสำเร็จ", { variant: "success" });
      }
      console.log(response);
    } catch (err) {
      console.log(err);
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
          {/* <div className="flex w-full h-auto justify-between items-center"></div> */}
          <div className="flex w-full h-auto justify-between items-center">
            <p className="text-lg select-none font-bold">
              คุณต้องการลบข้อมูลคาบล็อก{" "}
              <i>
                {deleteData.SubjectCode} - {deleteData.SubjectName}
              </i>{" "}
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
export default DeleteLockScheduleModal;
