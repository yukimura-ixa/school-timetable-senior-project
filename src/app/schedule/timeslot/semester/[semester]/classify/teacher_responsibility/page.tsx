"use client";
import MiniButton from "@/components/elements/static/MiniButton";
import { useRouter } from "next/navigation";
import React, {useEffect, useState} from "react";
import { TbArrowBackUp } from "react-icons/tb";
import { IoIosArrowDown, IoMdAdd, IoMdAddCircle } from "react-icons/io";
import SelectClassRoomModal from "../component/SelectClassRoomModal";
import AddSubjectModal from "../component/AddSubjectModal";
type Props = {
  backPage: Function;
};

const ClassroomResponsibility = (props: Props) => {
  const allClassRoom:any = [
    {
      gradeLevel : 2,
      classRoom : [202, 203, 204]
    },
    {
      gradeLevel : 4,
      classRoom : [402, 404, 407]
    },
    {
      gradeLevel : 5,
      classRoom : [501, 502, 505]
    },
  ]
  const router = useRouter();
  const [classRoomModalActive, setClassRoomModalActive] = useState<boolean>(false) //เปิด modal สำหรับเลือกชั้นเรียนที่รับผิดชอบ
  const [addSubjectModalActive, setAddSubjectModalActive] = useState<boolean>(false) //เปิด modal สำหรับเลือกชั้นเรียนที่รับผิดชอบ
  // const [selectedClass, setSelectedClass] = useState<number>(2); //เซ็ทไว้ดึงข้อมูลห้องเรียนทั้งหมดว่ามีกี่ห้อง -> ส่งไปที่ Modal
  const [classRoomList, setClassRoomList] = useState<number[]>([1, 4, 9]) //ชั้นเรียนที่รับผิดชอบของคุณครูคนนั้นๆ
  const changeClassList = (item: number[]) => {
    setClassRoomList(() => item);
    setClassRoomModalActive(false)
  }
  // const addSubjectToClassRoom = (item:any) => {

  // }
  return (
    <>
       {classRoomModalActive ? <SelectClassRoomModal confirmChange={changeClassList} closeModal={() => setClassRoomModalActive(false)} classList={classRoomList}/> : null}
       {addSubjectModalActive ? <AddSubjectModal closeModal={() => setAddSubjectModalActive(false)} /> : null}
      <div className="flex w-full h-[80px] justify-between items-center border-b border-[#EDEEF3] mb-7">
        <h1 className="text-lg flex items-center gap-3">
          เลือกห้องเรียน{" "}
          <p className="text-gray-500 text-xs">(ครูอัครเดช ภาษาไทย)</p>
        </h1>
        <div
          onClick={() => {
            router.back();
          }}
          className="flex gap-2 items-center justify-between cursor-pointer"
        >
          <TbArrowBackUp size={30} className="text-gray-700" />
          <p className="text-sm text-gray-500">ย้อนกลับ</p>
        </div>
      </div>
      <span className="flex flex-col gap-4">
        <div className="flex w-full h-[55px] justify-between items-center">
          <div className="flex items-center gap-4">
            <p className="text-md">ชั้นเรียนที่รับผิดชอบ</p>
          </div>
          <div className="flex flex-row gap-3">
            {allClassRoom.map((item:any) => (
              <React.Fragment key={`${item.gradeLevel}`}>
                <MiniButton
                  width={45}
                  height={25}
                  border={true}
                  borderColor="#c7c7c7"
                  title={`ม.${item.gradeLevel}`}
                />
              </React.Fragment>
            ))}
          </div>
        </div>
        {/* Map ชั้นเรียนของอาจารย์คนนั้นๆที่ต้องรับผิดชอบ */}
        {allClassRoom.map((item:any) => (
          <React.Fragment key={`Matthayom${item.gradeLevel}`}>
            <div className="flex w-full h-[55px] justify-between items-center border border-[#EDEEF3] p-4 cursor-pointer hover:bg-gray-100 duration-300">
              <div className="flex items-center gap-6">
                <p className="text-md">ม.{item.gradeLevel}</p>
                <IoIosArrowDown size={20} />
              </div>
              <div className="flex flex-row justify-between items-center gap-5">
                <div className="flex gap-4">
                  {/* Map ห้องเรียนข้องแต่ละชั้นเรียน */}
                  {item.classRoom.map((room:any) => (
                    <React.Fragment key={room}>
                      <MiniButton
                        height={30}
                        border={true}
                        borderColor="#EDEEF3"
                        titleColor="#4F515E"
                        handleClick={() => setAddSubjectModalActive(true)}
                        title={`ม.${room.toString().substring(0, 1)}/${room.toString().substring(2)}`}
                      />
                    </React.Fragment>
                  ))}
                </div>
                <IoMdAddCircle onClick={() => setClassRoomModalActive(true)} size={24} className="fill-gray-500 cursor-pointer" />
              </div>
            </div>
          </React.Fragment>
        ))}
      </span>
    </>
  );
};

export default ClassroomResponsibility;
