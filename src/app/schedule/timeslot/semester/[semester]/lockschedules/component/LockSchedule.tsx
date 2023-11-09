"use client";
import MiniButton from "@/components/elements/static/MiniButton";
import React, { useState } from "react";
import { MdAddCircle } from "react-icons/md";
import { TbSettings } from "react-icons/tb";
import AddLockScheduleModal from "./AddLockScheduleModal";
import EditLockScheduleModal from "./EditLockScheduleModal";

type Props = {};

function LockSchedule(props: Props) {
  const [addLockScheduleModalActive, SetAddLockSchduleModalActive] =
    useState<boolean>(false);

  const [editLockScheduleModalActive, SetEditLockSchduleModalActive] =
    useState<boolean>(false);
  const [lockScheduleData, setLockScheduledata] = useState([
    {
      Subject: { SubjectID: 52, SubjectCode: "ก23202", SubjectName: "ชุมนุม" },
      DayOfWeek: "อังคาร",
      timeSlotID: [7, 8],
      RoomName : 423,
      Teachers: [
        {
          TeacherID: 88,
          Firstname: "อเนก",
          Lastname: "ประสงค์",
          Department: "คณิตศาสตร์",
        },
        {
          TeacherID: 1,
          Firstname: "อัครเดช",
          Lastname: "ปัญญาเลิศ",
          Department: "ภาษาไทย",
        },
      ],
      Grade: [
        {
          Year: 1,
          ClassRooms: [],
        },
        {
          Year: 2,
          ClassRooms: [],
        },
        {
          Year: 3,
          ClassRooms: [301, 303, 305],
        },
        {
          Year: 4,
          ClassRooms: [],
        },
        {
          Year: 5,
          ClassRooms: [],
        },
        {
          Year: 6,
          ClassRooms: [],
        },
      ],
    },
    {
      Subject: {
        SubjectID: 38,
        SubjectCode: "ก22922",
        SubjectName: "ลูกเสือ/ยุวกาชาด",
      },
      DayOfWeek: "จันทร์",
      timeSlotID: [8, 9],
      RoomName : 125,
      Teachers: [
        {
          TeacherID: 25,
          Firstname: "อำนวย",
          Lastname: "ความสะดวก",
          Department: "ศิลปะ",
        },
        {
          TeacherID: 96,
          Firstname: "ชาคริต",
          Lastname: "จะพักคิดถึงคิดแคท",
          Department: "การงานอาชีพและเทคโนโลยี",
        },
      ],
      Grade: [
        {
          Year: 1,
          ClassRooms: [],
        },
        {
          Year: 2,
          ClassRooms: [201, 202, 203, 204, 205],
        },
        {
          Year: 3,
          ClassRooms: [],
        },
        {
          Year: 4,
          ClassRooms: [],
        },
        {
          Year: 5,
          ClassRooms: [],
        },
        {
          Year: 6,
          ClassRooms: [],
        },
      ],
    },
  ]);

  const [editSchedule, setEditSchedule] = useState({});
  const [editScheduleIndex, setEditScheduleIndex] = useState<number>(null);
  const addLockSchedule = (locksche: any) => {
    console.log(locksche);
    setLockScheduledata(() => [...lockScheduleData, locksche]);
  };
  const editLockSchedule = (item: any) => {
    const temp = [...lockScheduleData];
    temp[editScheduleIndex] = item;
    setLockScheduledata(temp);
  };
  return (
    <>
      {addLockScheduleModalActive ? (
        <AddLockScheduleModal
          closeModal={() => SetAddLockSchduleModalActive(false)}
          confirmChange={addLockSchedule}
        />
      ) : null}
      {editLockScheduleModalActive ? (
        <EditLockScheduleModal
          lockSchedule={editSchedule}
          closeModal={() => SetEditLockSchduleModalActive(false)}
          confirmChange={editLockSchedule}
        />
      ) : null}
      <div className="w-full flex flex-wrap gap-4 py-4 justify-between">
        {lockScheduleData.map((item, index) => (
          <React.Fragment
            key={`${item.Subject.SubjectCode}${item.DayOfWeek}${item.timeSlotID}`}
          >
            <div className="relative flex flex-col cursor-pointer p-4 gap-4 w-[49%] h-[214px] border border-[#EDEEF3] rounded">
              <div className="flex items-center gap-3">
                <p className="text-lg font-medium">
                  วัน{item.DayOfWeek} - {item.Subject.SubjectName} คาบ{" "}
                  {item.timeSlotID.join(",")}
                </p>
                <p>ห้อง {item.RoomName}</p>
                <div
                  onClick={() => {
                    SetEditLockSchduleModalActive(true);
                    setEditScheduleIndex(index);
                    setEditSchedule(item);
                  }}
                  className="cursor-pointer hover:bg-gray-100 duration-300 rounded p-1"
                >
                  <TbSettings size={24} className="fill-[#EDEEF3]" />
                </div>
              </div>
              {/* Tooltips */}
              <div
                className={`hidden duration-300 absolute top-[55%] right-[-25px] rounded flex flex-wrap justify-center w-[200px] gap-2 h-fit p-2 drop-shadow-md bg-white`}
              >
                {[
                  201, 202, 301, 302, 303, 304, 305, 306, 303, 304, 305, 306,
                ].map((item, index) => (
                  <React.Fragment key={`${item} ${index}`}>
                    <p className="text-[#4F515E]">
                      ม.{item.toString().substring(0, 1)}/
                      {item.toString().substring(2)}
                    </p>
                  </React.Fragment>
                ))}
              </div>
              {/* ชั้นเรียนที่กำหนดให้คาบล็อก */}
              <div className="flex flex-row justify-between items-center">
                <p className="text-gray-500 text-sm">ชั้นเรียน</p>
                <div className="flex flex-wrap w-[365px] h-fit gap-2">
                  {item.Grade.map((grade, index) => (
                    <React.Fragment key={`${grade.Year}${index}`}>
                      {grade.ClassRooms.map((room) => (
                        <React.Fragment key={`${room}`}>
                          <MiniButton
                            width={54}
                            height={25}
                            border={true}
                            borderColor="#c7c7c7"
                            titleColor="#4F515E"
                            title={`ม.${room.toString()[0]}/${
                              room.toString()[2]
                            }`}
                          />
                        </React.Fragment>
                      ))}
                      {/* {index < 9 ? (
                        <MiniButton
                          width={54}
                          height={25}
                          border={true}
                          borderColor="#c7c7c7"
                          titleColor="#4F515E"
                          title={`ม.${item.toString().substring(0, 1)}/${item
                            .toString()
                            .substring(2)}`}
                        />
                      ) : index < 10 ? (
                        <div
                          onMouseEnter={() => {}}
                          onMouseLeave={() => {}}
                          className="hover:bg-gray-100 duration-300 w-[45px] h-[25px] border rounded text-center border-[#c7c7c7] text-[#4F515E]"
                        >
                          <p>...</p>
                        </div>
                      ) : null} */}
                    </React.Fragment>
                  ))}
                </div>
              </div>
              {/* Tooltips */}
              {/* <div
                className={`hidden duration-300 absolute bottom-[-180px] right-[-50px] rounded flex flex-wrap justify-start w-[200px] gap-2 h-fit p-2 drop-shadow-md bg-white`}
              >
                {[
                  "ครูอเนก - คณิตศาสตร์",
                  "ครูอำนวย - ศิลปะ",
                  "ครูชาคริต - การงานอาชีพ",
                  "ครูอเนก - คณิตศาสตร์",
                  "ครูอำนวย - ศิลปะ",
                  "ครูชาคริต - การงานอาชีพ",
                ].map((item) => (
                  <>
                    <p className="text-[#4F515E]">{item}</p>
                  </>
                ))}
              </div> */}
              {/* ครูที่เลือก */}
              <div className="flex flex-row justify-between items-center">
                <p className="text-gray-500 text-sm">ครูผู้สอน</p>
                <div className="flex flex-wrap w-[365px] h-fit gap-2">
                  {item.Teachers.map((teacher, index) => (
                    <React.Fragment key={`${teacher.TeacherID}${index}`}>
                      {index < 3 ? (
                        <MiniButton
                          // width={54}
                          height={25}
                          border={true}
                          borderColor="#c7c7c7"
                          titleColor="#4F515E"
                          title={`${teacher.Firstname} - ${
                            teacher.Department.length > 10
                              ? `${teacher.Department.substring(0, 10)}...`
                              : teacher.Department
                          }`}
                        />
                      ) : index < 4 ? (
                        <div className="hover:bg-gray-100 duration-300 w-[100px] h-[25px] border rounded text-center border-[#c7c7c7] text-[#4F515E]">
                          <p>...</p>
                        </div>
                      ) : null}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </React.Fragment>
        ))}
        <div
          onClick={() => SetAddLockSchduleModalActive(true)}
          className="flex justify-center cursor-pointer items-center p-4 gap-3 w-[49%] h-[214px] border border-[#EDEEF3] rounded hover:bg-gray-100 duration-300"
        >
          <MdAddCircle size={24} className="fill-gray-500" />
          <p className="text-lg font-bold">เพิ่มคาบล็อก</p>
        </div>
      </div>
    </>
  );
}

export default LockSchedule;
