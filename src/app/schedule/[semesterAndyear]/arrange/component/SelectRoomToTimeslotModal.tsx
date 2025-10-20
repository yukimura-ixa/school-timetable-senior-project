import Dropdown from "@/components/elements/input/selected_input/Dropdown";
import { fetcher } from "@/libs/axios";
import { dayOfWeekThai } from "@/models/dayofweek-thai";
import { CircularProgress } from "@mui/material";
import { room } from "@prisma/client";
import React, { useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import useSWR from "swr";

type Props = {
  addSubjectToSlot: any; //ฟังก์ชั่นเพิ่มวิชา
  cancelAddRoom: any; //เมื่อกดยกเลิก
  payload: any; //ข้อมูลทั้งหมดที่ส่งมาจากต้นทาง
};

function SelectSubjectToTimeslotModal(props: Props): JSX.Element {
  const payload = props.payload;
  const [RoomName, setRoomName] = useState("");
  const [room, setRoom] = useState<room>();
  const [validateIsPass, setValidateIsPass] = useState(false);
  // const gradeLevelData = useGradeLevelData();
  const roomData = useSWR(
    `room/availableRooms?TimeslotID=` + payload.timeslotID,
    fetcher,
    {
      //refreshInterval: 15000,
      revalidateOnMount: true,
    },
  );
  const confirm = () => {
    //ถ้ากดยืนยัน
    if (RoomName == "") {
      //เช็คว่ามีการเลือกห้องยังถ้ายังก็แจ้งเตือน
      setValidateIsPass(true);
    } else {
      //ถ้าเลือกห้องแล้ว
      props.addSubjectToSlot(
        { ...payload.selectedSubject, RoomName: RoomName, room: room },
        payload.timeslotID,
      );
    }
  };
  const dataDetails = (type: string) => {
    let timeslotID = payload.timeslotID;
    let subject = payload.selectedSubject;
    let timeSlotDetails = `เทอม ${
      timeslotID[0]
    } ปีการศึกษา ${timeslotID.substring(2, 6)} - วัน${
      dayOfWeekThai[timeslotID.substring(7, 10)]
    } คาบ${timeslotID[timeslotID.length - 1]}`;
    let subjectDetails = `${subject.SubjectCode} ${subject.SubjectName} 
      ม.${subject.GradeID[0]}/${
        parseInt(subject.GradeID.substring(1, 2)) < 10
          ? subject.GradeID[2]
          : subject.GradeID.substring(1, 2)
      }`;
    return type == "TIMESLOT" ? timeSlotDetails : subjectDetails;
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
              {roomData.data ? (
                <Dropdown
                  width={250}
                  data={roomData.data.map((grade) => grade.RoomName)}
                  placeHolder="โปรดเลือก"
                  renderItem={({ data }: { data: any }) => (
                    <>
                      <p>{data}</p>
                    </>
                  )}
                  currentValue={RoomName}
                  handleChange={(data) => {
                    setRoomName(data as string);
                    setRoom(
                      roomData.data.find((room) => room.RoomName == data),
                    );
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
