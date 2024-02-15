import { useGradeLevelData } from "@/app/_hooks/gradeLevelData";
import { useRoomData } from "@/app/_hooks/roomData";
import Dropdown from "@/components/elements/input/selected_input/Dropdown";
import React, { useEffect, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";

type Props = {
  CloseModal: any;
  AddSubjectToSlot: any; //ฟังก์ชั่นเพิ่มวิชา
  timeSlotID: any; //ไอดีของช่องตาราง
  subjects: any; //ข้อมูลวิชาทั้งหมด
  fromDnd: boolean; //ถ้าเพิ่มวิชาจากการ Drag and drop
  subjectSelected: object; //ในเคสที่ลากวิชาลงมาจะใส่วิชามาด้วย
  setIsDragState: any; //ถ้ามีการกดเพิ่มหรือยกเลิกให้แก้ state กลับเป็น false
  returnSubject: any; //ถ้ามีการยกเลิกการทำรายการจาการ Drag จะทำการคืนวิชาเข้าช่องรวมวิชา
  removeSubjectSelected: any; //ลบวิชาเมื่อมีการเลือกวิชาและกดยืนยัน
  removeSubjectFromSlot: any;
};

function SelectSubjectToTimeslotModal(props: Props): JSX.Element {
  const [subjectSelected, setSubjectSelected] = useState(props.subjectSelected);
  const [RoomID, setRoomID] = useState("");
  const [validateIsPass, setValidateIsPass] = useState(false);
  // const gradeLevelData = useGradeLevelData();
  const roomData = useRoomData();
  const saveData = () => {
    if (RoomID == "") {
      setValidateIsPass(true);
    } else {
      props.AddSubjectToSlot(
        { ...subjectSelected, RoomID: RoomID },
        props.timeSlotID
      ),
      props.setIsDragState(),
      props.removeSubjectSelected();
    }
  };
  const cancel = () => { //ถ้ากดปิด modal หรือกดยกเลิก
    props.CloseModal(), //ทำการปิดหน้าต่างเล็ก
    props.setIsDragState(), //set เป็น false เพื่อกลับเป็น default
    Object.keys(subjectSelected).length != 0 && props.fromDnd //เช็คว่าถ้ามีวิชาที่เลือกมาจากการ Drag แล้วกดยกเลิก จะให้คืนวิชาลงกล่อง
      ? props.returnSubject(subjectSelected)
      : null;
    props.fromDnd ? props.removeSubjectFromSlot(props.timeSlotID, props.subjectSelected) : null //เช็คว่าถ้าลากวิชามาแล้วกดยกเลิกให้ทำการนำวิชาออกจาก slot
  }
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
                // onClick={() => console.log(selected)}
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
              onClick={cancel}
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
              onClick={cancel}
              className="w-[100px] h-[45px] rounded bg-red-100 text-red-500"
            >
              ยกเลิก
            </button>
            <button
              onClick={saveData}
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
