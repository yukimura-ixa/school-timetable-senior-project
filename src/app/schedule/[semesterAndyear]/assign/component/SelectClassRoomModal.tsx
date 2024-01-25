import { useTeacherData } from "@/app/_hooks/teacherData";
import MiniButton from "@/components/elements/static/MiniButton";
import axios from "axios";
import React, { Fragment, useEffect, useState } from "react";
import type { gradelevel } from "@prisma/client";

import { AiOutlineClose } from 'react-icons/ai';
import { useGradeLevelData } from "@/app/_hooks/gradeLevelData";
type props = {
  closeModal: any;
  classList: string[];
  confirmChange: any;
  year:number
};
function SelectClassRoomModal({ closeModal, classList, confirmChange, year }: props) {
    const { data, isLoading, error, mutate } = useGradeLevelData();
    // useEffect(() => {
    //   const getData = () => {
    //     axios.get('http://localhost:3000/api/classroom_of_allclass')
    //     .then((res) => {
    //       let data = res.data;
    //       setUnSelectedList(() => data.filter((item) => item.Year == year)[0].rooms.filter((item) => !classList.includes(item)))
    //       console.log(data.filter((item) => item.Year == year)[0].rooms.filter((item) => !classList.includes(item)))
    //     })
    //     .catch((err) => console.log(err))
    //   }
    //   return () => getData();
    // }, [])
    //เลือกห้องเรียนที่รับผิดชอบแล้ว
    const [selectedList, setSelectedList] = useState<string[]>(classList);
    //ห้องเรียนที่ยังไม่เลือก
    const [unSelectedList, setUnSelectedList] = useState(data.filter((item) => !selectedList.map(item => item.GradeID).includes(item.GradeID) && item.Year == year));
    const addSelectedList = (item:string) => {
        //ตัวแปร newList จะเพิ่มของใหม่ลงไปพร้อมกับ sort แล้ว set state
        let newList = [...selectedList, item].sort();
        setSelectedList(() => newList)
        //จากนั้น copy ตัวที่จะลบมาไว้ แล้ว Splice ออกโดยการใช้ indexOf เพื่อเช็ค index ของไอเทม
        let unSelected = [...unSelectedList]
        unSelected.splice(unSelectedList.indexOf(item), 1)
        //วาง array ที่ลบแล้วลงไป
        setUnSelectedList(() => unSelected)
    }
    const removeSelectedList = (item:string) => {
        //ทำงานเหมือนกันกับ addSelectedClassList
        let newList = [...unSelectedList, item].sort();
        setUnSelectedList(() => newList)
        let selected = [...selectedList]
        selected.splice(selectedList.indexOf(item), 1)
        setSelectedList(() => selected)
    }
  return (
    <>
      <div
        style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
        className="z-40 flex w-full h-screen items-center justify-center fixed left-0 top-0"
      >
        <div className="flex flex-col w-[550px] h-auto p-[50px] gap-8 bg-white rounded">
          {/* Content */}
          <div className="flex flex-col w-full gap-3 h-auto">
            <div className="flex justify-between">
                <p className="text-lg select-none" onClick={() => {console.log(data, unSelectedList)}}>เลือกห้องเรียน</p>
                <AiOutlineClose className="cursor-pointer" onClick={closeModal} />
            </div>
            <p className="text-xs text-gray-300">เลือกห้องเรียนของคุณครูที่รับผิดชอบในห้องนั้นๆ</p> 
          </div>
          {/* ระดับชั้นที่เลือกแล้ว */}
          <div className="flex flex-col gap-3">
            <p className="text-sm text-gray-500">ห้องเรียนที่เลือกแล้ว (ม.{year})</p>
            <div className={`flex items-center flex-wrap gap-4 w-full ${selectedList.length === 0 ? "h-[45px]" : null} border border-gray-300 px-3 py-3 rounded`}>
                {selectedList.map((item) => (
                    <Fragment key={item}>
                        <MiniButton handleClick={() => removeSelectedList(item)} height={25} border={true} isSelected={true} borderColor="#c7c7c7" title={`ม.${item.GradeID.substring(0, 1)}/${item.GradeID.substring(2)}`} />
                    </Fragment>
                ))}
            </div>
          </div>
          {/* เลือกระดับชั้นจากที่นี่ */}
          <div className="flex flex-col gap-3">
            <p className="text-sm text-gray-500">เลือกห้องได้จากที่นี่ (ม.{year})</p>
            <div className={`flex items-center flex-wrap gap-4 w-full ${unSelectedList.length === 0 ? "h-[45px]" : null} border border-gray-300 px-3 py-3 rounded`}>
                {unSelectedList.map((item) => (
                    <Fragment key={item}>
                        <MiniButton handleClick={() => addSelectedList(item)} height={25} border={true} borderColor="#c7c7c7" title={`ม.${item.GradeID.substring(0, 1)}/${item.GradeID.substring(2)}`} />
                    </Fragment>
                ))}
            </div>
          </div>
          <span className="w-full flex justify-end">
              <button onClick={() => confirmChange(selectedList.map((item) => parseInt(`${year}${item < 10 ? `0${item}` : item}`)), year)} className=" w-[100px] bg-green-100 hover:bg-green-200 duration-500 text-green-600 py-2 px-4 rounded">
                ยืนยัน
              </button>
          </span>
        </div>
      </div>
    </>
  );
}

export default SelectClassRoomModal;
