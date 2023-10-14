"use client";
import MiniButton from "@/components/elements/static/MiniButton";
import { useRouter } from "next/navigation";
import React, {useState} from "react";
import { TbArrowBackUp } from "react-icons/tb";
import { IoIosArrowDown, IoMdAdd, IoMdAddCircle } from "react-icons/io";
import SelectClassRoomModal from "../component/SelectClassRoomModal";
type Props = {
  backPage: Function;
};

const ClassroomResponsibility = (props: Props) => {
  const router = useRouter();
  const [classRoomModalActive, setClassRoomModalActive] = useState<boolean>(false) //เปิด modal สำหรับเลือกชั้นเรียนที่รับผิดชอบ
  const [classRoomList, setClassRoomList] = useState<string[]>(["ม.2", "ม.3", "ม.5"]) //ชั้นเรียนที่รับผิดชอบของคุณครูคนนั้นๆ
  const changeClassList = (item: string[]) => {
    setClassRoomList(() => item);
    setClassRoomModalActive(false)
} 
  return (
    <>
       {classRoomModalActive ? <SelectClassRoomModal confirmChange={changeClassList} closeModal={() => setClassRoomModalActive(false)} classList={classRoomList}/> : null}
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
            {["ม.2", "ม.3", "ม.5"].map((item) => (
              <React.Fragment key={item}>
                <MiniButton
                  width={45}
                  height={25}
                  border={true}
                  borderColor="#c7c7c7"
                  title={item}
                />
              </React.Fragment>
            ))}
          </div>
        </div>
        {/* Map ชั้นเรียนของอาจารย์คนนั้นๆที่ต้องรับผิดชอบ */}
        {["ม.2", "ม.3", "ม.5"].map((gradeLevel) => (
          <React.Fragment key={`${gradeLevel} sadas`}>
            <div className="flex w-full h-[55px] justify-between items-center border border-[#EDEEF3] p-4">
              <div className="flex items-center gap-6">
                <p className="text-md">{gradeLevel}</p>
                <IoIosArrowDown size={20} />
              </div>
              <div className="flex flex-row justify-between items-center gap-5">
                <div className="flex gap-4">
                  {/* Map ห้องเรียนข้องแต่ละชั้นเรียน */}
                  {["1", "3", "4", "6"].map((room) => (
                    <React.Fragment key={room}>
                      <MiniButton
                        height={30}
                        border={true}
                        borderColor="#EDEEF3"
                        titleColor="#4F515E"
                        title={`${gradeLevel.substring(2)}/${room}`}
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
