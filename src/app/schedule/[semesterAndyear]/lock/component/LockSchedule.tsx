"use client";
import MiniButton from "@/components/elements/static/MiniButton";
import React, { Fragment, useEffect, useState } from "react";
import { MdAddCircle } from "react-icons/md";
import { TbSettings, TbTrash } from "react-icons/tb";
import AddLockScheduleModal from "./AddLockScheduleModal";
import EditLockScheduleModal from "./EditLockScheduleModal";
import { useParams, useSearchParams } from "next/navigation";
import useSWR from "swr";
import { fetcher } from "@/libs/axios";
import Loading from "@/app/loading";
import { dayOfWeekThai } from "@/models/dayofweek-thai";

type Props = {};

function LockSchedule(props: Props) {
  const [addLockScheduleModalActive, SetAddLockSchduleModalActive] =
    useState<boolean>(false);

  const [editLockScheduleModalActive, SetEditLockSchduleModalActive] =
    useState<boolean>(false);
  const params = useParams();
  const [semester, academicYear] = (params.semesterAndyear as string).split(
    "-"
  ); //from "1-2566" to ["1", "2566"]
  const lockData = useSWR(
    //ข้อมูลหลักที่ fetch มาจาก api
    () => `/lock?Semester=SEMESTER_${semester}&AcademicYear=${academicYear}`,
    fetcher
  );
  useEffect(() => {
    if(!lockData.isLoading){
      setLockScheduledata(() => lockData.data)
    }
  }, [lockData.isLoading])
  const [lockScheduleData, setLockScheduledata] = useState([
    {
      SubjectCode: "", SubjectName: "",
      RoomID: null,
      teachers: [
        {
          TeacherID: null,
          Prefix: "",
          Firstname: "",
          Lastname: "",
          Department: "",
        },
      ],
      GradeIDs: [],
      timeslots: [
        {
          TimeslotID: "",
          AcademicYear: null,
          Semester: "",
          StartTime: "",
          EndTime: "",
          Breaktime: "",
          DayOfWeek: ""
        },
      ],
      ClassIDs : [""],
      room: {
        RoomID: null,
        RoomName: "",
        Building: "",
        Floor: ""
    }
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
      {lockData.isLoading ? <Loading /> :
      <div className="w-full flex flex-wrap gap-4 py-4 justify-between">
        {lockScheduleData.map((item, index) => (
          <Fragment
            key={`${item.SubjectCode}${item.DayOfWeek}`}
          >
            <div className="relative flex flex-col cursor-pointer p-4 gap-4 w-[49%] h-fit bg-white hover:bg-slate-50 duration-300 drop-shadow rounded">
              <div className="flex justify-between items-center gap-3">
                <p className="text-lg font-medium">
                   {item.SubjectCode} - {item.SubjectName}
                </p>
                <div className="flex gap-3">
                  {/* ปิดทำการ */}
                  {/* <div
                    onClick={() => {
                      SetEditLockSchduleModalActive(true);
                      setEditSchedule(item);
                      setEditScheduleIndex(index);
                      setEditSchedule(item);
                    }}
                    className="cursor-pointer hover:bg-gray-100 duration-300 rounded p-1 flex-end"
                  >
                    <TbSettings size={24} className="fill-[#EDEEF3]" />
                  </div> */}
                  <div
                    onClick={() => {
                      SetEditLockSchduleModalActive(true);
                      setEditScheduleIndex(index);
                      setEditSchedule(item);
                    }}
                    className="cursor-pointer hover:bg-gray-100 duration-300 rounded p-1 flex-end"
                  >
                    <TbTrash size={24} className="text-red-500" />
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-500">สถานที่ : {item.room.RoomName}</p>
              <p className="text-sm text-gray-500">คาบที่ : {item.timeslots.map(item => item.TimeslotID.substring(item.TimeslotID.length - 1)).join(",")}</p>
              <p className="text-sm text-gray-500">
                  วัน : {dayOfWeekThai[item.timeslots[0].DayOfWeek]}
              </p>
              {/* ชั้นเรียนที่กำหนดให้คาบล็อก */}
              <div className="flex flex-row justify-between items-center">
                <p className="text-gray-500 text-sm">ชั้นเรียน</p>
                <div className="flex flex-wrap w-[365px] h-fit gap-2">
                  {item.GradeIDs.map((grade, index) => (
                    <Fragment key={`sadasdas${index}`}>
                        <MiniButton
                          width={54}
                          height={25}
                          border={true}
                          borderColor="#c7c7c7"
                          titleColor="#4F515E"
                          title={`ม.${grade.toString()[0]}/${
                            grade.toString()[2]
                          }`}
                        />
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
                    </Fragment>
                  ))}
                </div>
              </div>
              {/* ครูที่เลือก */}
              <div className="flex flex-row justify-between items-center">
                <p className="text-gray-500 text-sm">ครูผู้สอน</p>
                <div className="flex flex-wrap w-[365px] h-fit gap-2">
                  {item.teachers.map((teacher, index) => (
                    <Fragment key={`${teacher.TeacherID}${index}`}>
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
                    </Fragment>
                  ))}
                </div>
              </div>
            </div>
          </Fragment>
        ))}
        <div
          onClick={() => SetAddLockSchduleModalActive(true)}
          className="flex justify-center cursor-pointer items-center p-4 gap-3 w-[49%] h-[214px] border border-[#EDEEF3] rounded hover:bg-gray-100 duration-300"
        >
          <MdAddCircle size={24} className="fill-gray-500" />
          <p className="text-lg font-bold">เพิ่มคาบล็อก</p>
        </div>
      </div>
      }
    </>
  );
}

export default LockSchedule;
