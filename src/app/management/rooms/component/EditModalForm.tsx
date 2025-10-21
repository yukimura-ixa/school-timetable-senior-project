import NumberField from "@/components/elements/input/field/NumberField";
import TextField from "@/components/mui/TextField";
import PrimaryButton from "@/components/mui/PrimaryButton";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import React, { useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { BsInfo } from "react-icons/bs";
import api from "@/libs/axios";
import type { room } from "@prisma/client";
import { closeSnackbar, enqueueSnackbar } from "notistack";

type props = {
  closeModal: any;
  data: any;
  clearCheckList: any;
  mutate: Function;
  openSnackBar?: any;
};

function EditModalForm({ closeModal, data, clearCheckList, mutate }: props) {
  const [editData, setEditData] = useState<room[]>(data);
  const [isEmptyData, setIsEmptyData] = useState(false);
  const isValidData = (): boolean => {
    let isValid = true;
    editData.forEach((data) => {
      if (
        data.RoomName == "" ||
        data.Building == "" ||
        !data.Floor
      ) {
        setIsEmptyData(true);
        isValid = false;
      }
    });
    return isValid;
  };
  const confirmed = () => {
    if (isValidData()) {
      editMultiData(editData);
      closeModal();
    }
  };
  const cancelEdit = () => {
    if (data.length === 1) {
      clearCheckList();
    }
    closeModal();
  };
  const editMultiData = async (data: any) => {
    const loadbar = enqueueSnackbar("กำลังแก้ไขข้อมูลชั้นเรียน", {
      variant: "info",
      persist: true,
    });

    console.log(data);
    const response = await api
      .put("/room", data)
      .then(() => {
        closeSnackbar(loadbar);
        enqueueSnackbar("แก้ไขข้อมูลสถานที่เรียนสำเร็จ", {
          variant: "success",
        });
        mutate();
      })
      .catch((error) => {
        closeSnackbar(loadbar);
        enqueueSnackbar(
          "แก้ไขข้อมูลสถานที่เรียนไม่สำเร็จ " + error.respnse.data,
          {
            variant: "error",
          },
        );
        console.log(error);
      });

    //clear checkbox
    clearCheckList();
    console.log(response);
  };
  return (
    <>
      <div
        style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
        className="z-40 flex w-full h-screen items-center justify-center fixed left-0 top-0"
      >
        <div
          className={`relative flex flex-col w-fit ${
            data.length > 5 ? "h-[700px]" : "h-auto"
          } overflow-y-scroll overflow-x-hidden p-12 gap-10 bg-white rounded`}
        >
          {/* Content */}
          <div className="flex w-full h-auto justify-between items-center">
            <p className="text-lg select-none">แก้ไขข้อมูล</p>
            <AiOutlineClose className="cursor-pointer" onClick={cancelEdit} />
          </div>
          {editData.map((item: any, index: number) => (
            <React.Fragment key={`Edit${index}`}>
              <div
                className={`flex flex-row gap-3 items-center ${
                  index == 0 ? "" : "mt-2"
                }`}
              >
                <div className="flex flex-col items-center justify-center mr-5">
                  <p className="text-sm font-bold">รายการที่</p>
                  <p>{index + 1}</p>
                </div>
                <div className="relative flex flex-col gap-2">
                  <TextField
                    width="auto"
                    height="auto"
                    label={`ชื่อห้อง (RoomName):`}
                    placeHolder="ex. คอม1"
                    value={item.RoomName}
                    borderColor={
                      isEmptyData && item.RoomName.length == 0 ? "#F96161" : ""
                    }
                    disabled={false} handleChange={(e: any) => {
                      let value: string = e.target.value;
                      setEditData(() =>
                        editData.map((item, ind) =>
                          index === ind ? { ...item, RoomName: value } : item,
                        ),
                      );
                    }}
                  />
                  {isEmptyData && item.RoomName.length == 0 ? (
                    <div className="absolute left-0 bottom-[-35px] flex gap-2 px-2 py-1 w-fit items-center bg-red-100 rounded">
                      <BsInfo className="bg-red-500 rounded-full fill-white" />
                      <p className="text-red-500 text-sm">ต้องการ</p>
                    </div>
                  ) : null}
                </div>
                <div className="relative flex flex-col gap-2">
                  <TextField
                    width="auto"
                    height="auto"
                    label={`อาคาร (Building):`}
                    placeHolder="ex. 3"
                    value={item.Building}
                    borderColor={
                      isEmptyData && item.Building.length == 0 ? "#F96161" : ""
                    }
                    disabled={false} handleChange={(e: any) => {
                      let value: string = e.target.value;
                      setEditData(() =>
                        editData.map((item, ind) =>
                          index === ind ? { ...item, Building: value } : item,
                        ),
                      );
                    }}
                  />
                  {isEmptyData && item.Building.length == 0 ? (
                    <div className="absolute left-0 bottom-[-35px] flex gap-2 px-2 py-1 w-fit items-center bg-red-100 rounded">
                      <BsInfo className="bg-red-500 rounded-full fill-white" />
                      <p className="text-red-500 text-sm">ต้องการ</p>
                    </div>
                  ) : null}
                </div>
                <div className="relative flex flex-col gap-2">
                  <NumberField
                    width="auto"
                    height="auto"
                    label={`ชั้น (Floor):`}
                    placeHolder="ex. 5"
                    value={item.Floor}
                    borderColor={
                      isEmptyData && !item.Floor
                        ? "#F96161"
                        : ""
                    }
                    disabled={false}
                    handleChange={(e: any) => {
                      let value: number = parseInt(e.target.value, 10) || 0;
                      setEditData(() =>
                        editData.map((item, ind) =>
                          index === ind ? { ...item, Floor: value } : item,
                        ),
                      );
                    }}
                  />
                  {isEmptyData && !item.Floor ? (
                    <div className="absolute left-0 bottom-[-35px] flex gap-2 px-2 py-1 w-fit items-center bg-red-100 rounded">
                      <BsInfo className="bg-red-500 rounded-full fill-white" />
                      <p className="text-red-500 text-sm">ต้องการ</p>
                    </div>
                  ) : null}
                </div>
              </div>
            </React.Fragment>
          ))}
          <span className="w-full flex gap-3 justify-end mt-5 h-11">
            <PrimaryButton
              handleClick={cancelEdit}
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
export default EditModalForm;
