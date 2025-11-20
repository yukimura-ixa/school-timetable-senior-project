import Dropdown from "@/components/elements/input/selected_input/Dropdown";
import { dayOfWeekThai } from "@/models/dayofweek-thai";
import { CircularProgress } from "@mui/material";
import type { room } from '@/prisma/generated/client';;
import React, { useState, type JSX } from "react";
import { AiOutlineClose } from "react-icons/ai";
import useSWR from "swr";

import { getAvailableRoomsAction } from "@/features/room/application/actions/room.actions";
import type { SubjectData } from "@/types/schedule.types";

type SubjectPayload = {
  timeslotID: string;
  selectedSubject: SubjectData | null;
};

type Props = {
  // ฟังก์ชั่นเพิ่มวิชา: ใส่ subject พร้อมข้อมูลห้อง และ TimeslotID
  addSubjectToSlot: (subject: SubjectData, timeSlotID: string) => void;
  // เมื่อกดยกเลิก: ส่งค่าที่เลือกไว้ (หรือ null) และ TimeslotID กลับไป
  cancelAddRoom: (subject: SubjectData | null, timeSlotID: string) => void;
  // ข้อมูลทั้งหมดที่ส่งมาจากต้นทาง
  payload: SubjectPayload;
};

function SelectSubjectToTimeslotModal(props: Props): JSX.Element {
  const payload = props.payload;
  const [RoomName, setRoomName] = useState("");
  const [room, setRoom] = useState<room>();
  const [validateIsPass, setValidateIsPass] = useState(false);
  // const gradeLevelData = useGradeLevelData();
  const roomData = useSWR(
    payload?.timeslotID ? ["available-rooms", payload.timeslotID] as const : null,
    async ([, timeslotID]: readonly ["available-rooms", string]) => {
      return await getAvailableRoomsAction({ TimeslotID: timeslotID });
    },
    {
      //refreshInterval: 15000,
      revalidateOnMount: true,
    },
  );
  const confirm = () => {
    //ถ้ากดยืนยัน
    if (RoomName === "" || !payload.selectedSubject) {
      //เช็คว่ามีการเลือกห้องยังถ้ายังก็แจ้งเตือน
      setValidateIsPass(true);
    } else {
      //ถ้าเลือกห้องแล้ว
      const newSubject: SubjectData = {
        ...payload.selectedSubject,
        roomName: RoomName,
        room: room ?? null,
      };
      props.addSubjectToSlot(newSubject, payload.timeslotID);
    }
  };
  const dataDetails = (type: string) => {
    const timeslotID = payload.timeslotID;
    const subject = payload.selectedSubject;
    const timeSlotDetails = `เทอม ${
      timeslotID[0]
    } ปีการศึกษา ${timeslotID.substring(2, 6)} - วัน${
      dayOfWeekThai[timeslotID.substring(7, 10)]
    } คาบ${timeslotID[timeslotID.length - 1]}`;
    const subjectDetails = subject
      ? `${subject.subjectCode} ${subject.subjectName} 
      ม.${subject.gradeID?.[0] ?? ""}/${parseInt(subject.gradeID?.substring(1) ?? "0")}`
      : "";
    return type === "TIMESLOT" ? timeSlotDetails : subjectDetails;
  };
  return (
    <>
      <div
        style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
        className="z-40 flex w-full h-screen items-center justify-center fixed left-0 top-0"
      >
        <div className="flex flex-col w-[580px] h-fit p-7 gap-6 bg-white rounded">
          {/* Content */}
          <div className="flex flex-col w-full h-auto gap-3">
            <div className="flex justify-between items-center">
              <div className="flex gap-3 items-center">
                <b
                  className="text-lg select-none"
                  onClick={() => console.log(payload)}
                >
                  จัดวิชาเรียนลงในคาบ
                </b>
                {validateIsPass ? (
                  <p className="text-xs text-red-500">โปรดเลือกห้องเรียน</p>
                ) : null}
              </div>
              <AiOutlineClose
                className="cursor-pointer"
                onClick={() =>
                  props.cancelAddRoom(
                    payload.selectedSubject,
                    payload.timeslotID,
                  )
                }
              />
            </div>
            <div>
              <p>{dataDetails("TIMESLOT")}</p>
              <b>{dataDetails("SUBJECT")}</b>
            </div>
          </div>
          <div className="flex flex-col gap-3 p-4 w-full h-fit border border-[#EDEEF3]">
            <div className="flex justify-between items-center w-full">
              <div className="flex gap-1 items-center">
                <p>เลือกสถานที่เรียน</p>
              </div>
              {roomData.data && 'success' in roomData.data && roomData.data.success && roomData.data.data ? (
                <Dropdown
                  width={250}
                  data={(roomData.data.data as { RoomID: number; RoomName: string; Building: string; Floor: string }[]).map((rm) => rm.RoomName)}
                  placeHolder="โปรดเลือก"
                  renderItem={({ data }: { data: unknown }) => (
                    <>
                      <p>{data as string}</p>
                    </>
                  )}
                  currentValue={RoomName}
                  handleChange={(data: unknown) => {
                    const roomName = data as string;
                    setRoomName(roomName);
                    const rooms = roomData.data && 'data' in roomData.data ? (roomData.data.data as { RoomID: number; RoomName: string; Building: string; Floor: string }[]) : [];
                    setRoom(rooms.find((r) => r.RoomName === roomName));
                  }}
                  searchFunction={undefined}
                />
              ) : (
                <CircularProgress />
              )}
            </div>
          </div>
          <div className="flex w-full items-end justify-end gap-4">
            <button
              onClick={() =>
                props.cancelAddRoom(payload.selectedSubject, payload.timeslotID)
              }
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
