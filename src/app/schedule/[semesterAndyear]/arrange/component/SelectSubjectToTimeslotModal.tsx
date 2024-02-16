import { useGradeLevelData } from "@/app/_hooks/gradeLevelData";
import { useRoomData } from "@/app/_hooks/roomData";
import Dropdown from "@/components/elements/input/selected_input/Dropdown";
import React, { useEffect, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";

type Props = {
  addSubjectToSlot: any; //ฟังก์ชั่นเพิ่มวิชา
  cancelAddRoom: any //เมื่อกดยกเลิก
  payload: any; //ข้อมูลทั้งหมดที่ส่งมาจากต้นทาง
};

function SelectSubjectToTimeslotModal(props: Props): JSX.Element {
  const payload = props.payload;
  const [RoomID, setRoomID] = useState("");
  const [validateIsPass, setValidateIsPass] = useState(false);
  // const gradeLevelData = useGradeLevelData();
  const roomData = useRoomData();
  const confirm = () => { //ถ้ากดยืนยัน
    if (RoomID == "") { //เช็คว่ามีการเลือกห้องยังถ้ายังก็แจ้งเตือน
      setValidateIsPass(true);
    } else { //ถ้าเลือกห้องแล้ว
      props.addSubjectToSlot(
        { ...payload.selectedSubject, RoomID: RoomID },
        payload.timeslotID
      )
    }
  };
  return (
    <>
      <div
        style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
        className="z-40 flex w-full h-screen items-center justify-center fixed left-0 top-0"
      >
        <div className="flex flex-col w-[580px] h-fit p-7 gap-10 bg-white rounded">
          {/* Content */}
          <div className="flex w-full h-auto justify-between items-center">
            <div className="flex gap-3 items-center">
              <b
                className="text-lg select-none"
              >
                จัดวิชาเรียนลงในคาบ
              </b>
              {validateIsPass ? (
                <p className="text-xs text-red-500">
                  โปรดเลือกห้องเรียน
                </p>
              ) : null}
            </div>
            <AiOutlineClose
              className="cursor-pointer"
              onClick={() => props.cancelAddRoom(payload.selectedSubject, payload.timeslotID)}
            />
          </div>
          <div className="flex flex-col gap-3 p-4 w-full h-fit border border-[#EDEEF3]">
            <div className="flex justify-between items-center w-full">
              <div className="flex gap-1 items-center">
                <p>เลือกสถานที่เรียน</p>
              </div>
              <Dropdown
                width={250}
                data={roomData.data.map((grade) => grade.RoomName)}
                placeHolder="โปรดเลือก"
                renderItem={({ data }) => (
                  <>
                    <p>{data}</p>
                  </>
                )}
                currentValue={RoomID}
                handleChange={(data) => setRoomID(() => data)}
                searchFunciton={undefined}
              />
            </div>
          </div>
          <div className="flex w-full items-end justify-end gap-4">
            <button
              onClick={() => props.cancelAddRoom(payload.selectedSubject, payload.timeslotID)}
              className="w-[100px] h-[45px] rounded bg-red-100 text-red-500"
            >
              ยกเลิก
            </button>
            <button
              onClick={confirm}
              className="w-[100px] h-[45px] rounded bg-blue-100 text-blue-500"
            >
              บันทึก
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default SelectSubjectToTimeslotModal;
