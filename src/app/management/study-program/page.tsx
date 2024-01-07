"use client"
import MiniButton from '@/components/elements/static/MiniButton';
import React, { useState } from 'react'
import { MdAddCircle } from 'react-icons/md';
import { TbSettings, TbTrash } from 'react-icons/tb';
import AddStudyProgramModal from './component/AddStudyProgramModal';
import EditStudyProgramModal from './component/EditStudyProgramModal';

type Props = {}

function StudyProgram (props: Props) {
    const [addLockScheduleModalActive, SetAddLockSchduleModalActive] =
    useState<boolean>(false);

  const [editLockScheduleModalActive, SetEditLockSchduleModalActive] =
    useState<boolean>(false);
  const [lockScheduleData, setLockScheduledata] = useState([
    {
      StudyProgramName: "หลักสูตร ม.1",
      Subjects: [
        {
          SubjectID: "ว21202",
          SubjectName: "วิทยาศาสตร์เพิ่มเติม"
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
          ClassRooms: [101, 102, 103, 104],
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
      StudyProgramName: "หลักสูตร ม.4 ศิลป์-ภาษาจีน",
      Subjects: [
        {
          SubjectID: "ว31202",
          SubjectName: "โลก และ ดาราศาสตร์"
        },
        {
          SubjectID: "ค31101",
          SubjectName: "คณิตศาสตร์"
        },
        {
          SubjectID: "จ31102",
          SubjectName: "ภาษาจีน"
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
          ClassRooms: [],
        },
        {
          Year: 4,
          ClassRooms: [407],
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
        <AddStudyProgramModal
          closeModal={() => SetAddLockSchduleModalActive(false)}
          confirmChange={addLockSchedule}
        />
      ) : null}
      {editLockScheduleModalActive ? (
        <EditStudyProgramModal
          lockSchedule={editSchedule}
          closeModal={() => SetEditLockSchduleModalActive(false)}
          confirmChange={editLockSchedule}
        />
      ) : null}
      <div className="w-full flex flex-wrap gap-4 py-4 justify-between">
        {lockScheduleData.map((item, index) => (
          <React.Fragment
            key={`${item.StudyProgramName}${index}`}
          >
            <div className="relative flex flex-col cursor-pointer p-4 gap-4 w-[49%] h-[214px] border border-[#EDEEF3] rounded">
              <div className="flex items-center gap-3">
                <p className='text-lg font-bold'>{item.StudyProgramName}</p>
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
                <TbTrash size={24} className="text-red-500 absolute right-6 cursor-pointer hover:bg-gray-100 duration-300" />
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
              {/* ครูที่เลือก */}
              <div className="flex flex-row justify-between items-center">
                <p className="text-gray-500 text-sm">รายวิชา</p>
                <div className="flex flex-wrap w-[365px] h-fit gap-2">
                  {item.Subjects.map((subject, index) => (
                    <React.Fragment key={`${subject.SubjectID}${index}`}>
                      {index < 3 ? (
                        <MiniButton
                          // width={54}
                          height={25}
                          border={true}
                          borderColor="#c7c7c7"
                          titleColor="#4F515E"
                          title={`${subject.SubjectID}`}
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

export default StudyProgram;