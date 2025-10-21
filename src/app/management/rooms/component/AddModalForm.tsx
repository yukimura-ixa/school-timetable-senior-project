import React, { useState } from "react";
import TextField from "@/components/mui/TextField";
import { AiOutlineClose } from "react-icons/ai";
import MiniButton from "@/components/elements/static/MiniButton";
import NumberField from "@/components/elements/input/field/NumberField";
import CustomTextField from "@/components/elements/input/field/TextField";
import { TbTrash } from "react-icons/tb";
import { BsInfo } from "react-icons/bs";
import api from "@/libs/axios";
import type { room } from "@prisma/client";
import PrimaryButton from "@/components/mui/PrimaryButton";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import { closeSnackbar, enqueueSnackbar } from "notistack";
type props = {
  closeModal: any;
  mutate: Function;
};
function AddModalForm({ closeModal, mutate }: props) {

  const addData = async (data: room[]) => {
    console.log(data);
    const loadbar = enqueueSnackbar("กำลังเพิ่มข้อมูลสถานที่เรียน", {
      variant: "info",
      persist: true,
    });
    const response = await api
      .post("/room", data)
      .then(() => {
        closeSnackbar(loadbar);
        enqueueSnackbar("เพิ่มข้อมูลสถานที่เรียนสำเร็จ", {
          variant: "success",
        });
        mutate();
      })
      .catch((error) => {
        closeSnackbar(loadbar);
        enqueueSnackbar(
          "เพิ่มข้อมูลสถานที่เรียนไม่สำเร็จ " + error.respnse.data,
          {
            variant: "error",
          },
        );
        console.log(error);
      });
    console.log(response);
  };
  const [isEmptyData, setIsEmptyData] = useState(false);
  const [rooms, setRooms] = useState<room[]>([
    {
      RoomID: null,
      RoomName: "",
      Building: "",
      Floor: undefined,
    },
  ]);
  const addList = () => {
    let struct: room = {
      RoomID: null,
      RoomName: "",
      Building: "",
      Floor: undefined,
    };
    setRooms(() => [...rooms, struct]);
  };
  const removeList = (index: number): void => {
    let copyArray = [...rooms];
    copyArray.splice(index, 1);
    setRooms(() => copyArray);
  };
  const isValidData = (): boolean => {
    let isValid = true;
    rooms.forEach((data) => {
      if (data.RoomName == "" || data.Building == "" || !data.Floor) {
        setIsEmptyData(true);
        isValid = false;
      }
    });
    return isValid;
  };
  const handleSubmit = () => {
    if (isValidData()) {
      addData(rooms);
      closeModal();
    }
  };
  const cancel = () => {
    closeModal();
  };
  return (
    <>
      <div
        style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
        className="z-40 flex w-full h-screen items-center justify-center fixed left-0 top-0"
      >
        <div
          className={`relative flex flex-col w-fit ${
            rooms.length > 5 ? "h-[700px]" : "h-auto"
          } overflow-y-scroll overflow-x-hidden p-12 gap-10 bg-white rounded`}
        >
          {/* Content */}
          <div className="flex w-full h-auto justify-between items-center">
            <p className="text-lg select-none">เพิ่มห้องเรียน</p>
            <AiOutlineClose className="cursor-pointer" onClick={closeModal} />
          </div>
          <div className="flex justify-between items-center">
            <MiniButton
              title="เพิ่มรายการ"
              titleColor="#000000"
              buttonColor="#FFFFFF"
              width={100}
              height={30}
              border={true}
              hoverable={true}
              borderColor="#222222"
              isSelected={false}
              handleClick={addList}
            />
          </div>
          {/* inputfield */}
          <div className="flex flex-col gap-3">
            {rooms.map((room, index) => (
              <React.Fragment key={`AddData${index + 1}`}>
                <div
                  className={`flex flex-row gap-3 items-center ${
                    index == rooms.length - 1 ? "" : "mt-8"
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
                      value={room.RoomName}
                      borderColor={
                        isEmptyData && room.RoomName.length == 0
                          ? "#F96161"
                          : ""
                      }
                      disabled={false} handleChange={(e: any) => {
                        let value: string = e.target.value;
                        setRooms(() =>
                          rooms.map((item, ind) =>
                            index === ind ? { ...item, RoomName: value } : item,
                          ),
                        );
                      }}
                    />
                    {isEmptyData && room.RoomName.length == 0 ? (
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
                      placeHolder="ex. 3"
                      label={`อาคาร (Building):`}
                      value={room.Building}
                      borderColor={
                        isEmptyData && room.Building.length == 0
                          ? "#F96161"
                          : ""
                      }
                      disabled={false} handleChange={(e: any) => {
                        let value: string = e.target.value;
                        setRooms(() =>
                          rooms.map((item, ind) =>
                            index === ind ? { ...item, Building: value } : item,
                          ),
                        );
                      }}
                    />
                    {isEmptyData && room.Building.length == 0 ? (
                      <div className="absolute left-0 bottom-[-35px] flex gap-2 px-2 py-1 w-fit items-center bg-red-100 rounded">
                        <BsInfo className="bg-red-500 rounded-full fill-white" />
                        <p className="text-red-500 text-sm">ต้องการ</p>
                      </div>
                    ) : null}
                  </div>
                  <div className="relative flex flex-col gap-2">
                    <CustomTextField
                      disabled={false}
                      width="auto"
                      height="auto"
                      label={`ชั้น (Floor):`}
                      placeHolder="ex. 5"
                      value={room.Floor}
                      borderColor={
                        isEmptyData && (!room.Floor || room.Floor.trim() === "")
                          ? "#F96161"
                          : ""
                      }
                      handleChange={(e: any) => {
                        let value: string = e.target.value;
                        setRooms(() =>
                          rooms.map((item, ind) =>
                            index === ind ? { ...item, Floor: value } : item,
                          ),
                        );
                      }}
                    />
                    {isEmptyData && (!room.Floor || room.Floor === "") ? (
                      <div className="absolute left-0 bottom-[-35px] flex gap-2 px-2 py-1 w-fit items-center bg-red-100 rounded">
                        <BsInfo className="bg-red-500 rounded-full fill-white" />
                        <p className="text-red-500 text-sm">ต้องการ</p>
                      </div>
                    ) : null}
                  </div>
                  {rooms.length > 1 ? (
                    <TbTrash
                      size={20}
                      className="mt-6 text-red-400 cursor-pointer"
                      onClick={() => removeList(index)}
                    />
                  ) : null}
                </div>
              </React.Fragment>
            ))}
          </div>
          <span className="w-full flex justify-end mt-5 gap-3 h-11">
            <PrimaryButton
              handleClick={cancel}
              title={"ยกเลิก"}
              color={"danger"}
              Icon={<CloseIcon />} reverseIcon={false} isDisabled={false}
            />
            <PrimaryButton
              handleClick={handleSubmit}
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

export default AddModalForm;
