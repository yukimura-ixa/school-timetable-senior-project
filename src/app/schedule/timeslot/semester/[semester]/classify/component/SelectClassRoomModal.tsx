import MiniButton from "@/components/elements/static/MiniButton";
import axios from "axios";
import React, { useEffect, useState } from "react";

import { AiOutlineClose } from 'react-icons/ai';
type props = {
  closeModal: any;
  classList: number[];
  confirmChange: any;
};
function SelectClassRoomModal({ closeModal, classList, confirmChange }: props) {
    useEffect(() => {
      const getData = () => {
      axios.get('http://localhost:3000/api/classroom_of_allclass')
      .then((res) => {
        let data = res.data;
        setUnSelectedList(() => data.filter((item) => item.Year == 2)[0].rooms.filter((item) => !selectedList.includes(item)))
        console.log(data);
      })
      .catch((err) => console.log(err))
      }
      return () => getData();
    }, [])
    //เลือกห้องเรียนที่รับผิดชอบแล้ว
    const [selectedList, setSelectedList] = useState<number[]>(classList);
    //ห้องเรียนที่ยังไม่เลือก
    const [unSelectedList, setUnSelectedList] = useState<number[]>([]);
    const addSelectedList = (item:number) => {
        //ตัวแปร newList จะเพิ่มของใหม่ลงไปพร้อมกับ sort แล้ว set state
        let newList = [...selectedList, item].sort();
        setSelectedList(() => newList)
        //จากนั้น copy ตัวที่จะลบมาไว้ แล้ว Splice ออกโดยการใช้ indexOf เพื่อเช็ค index ของไอเทม
        let unSelected = [...unSelectedList]
        unSelected.splice(unSelectedList.indexOf(item), 1)
        //วาง array ที่ลบแล้วลงไป
        setUnSelectedList(() => unSelected)
    }
    const removeSelectedList = (item:number) => {
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
        style={{ backgroundColor: "rgba(0,0,0,0.75" }}
        className="z-40 flex w-full h-screen items-center justify-center fixed left-0 top-0"
      >
        <div className="flex flex-col w-[550px] h-auto p-[50px] gap-8 bg-white rounded">
          {/* Content */}
          <div className="flex flex-col w-full gap-3 h-auto">
            <div className="flex justify-between">
                <p className="text-lg select-none" onClick={() => console.log(unSelectedList)}>เลือกห้องเรียน</p>
                <AiOutlineClose className="cursor-pointer" onClick={closeModal} />
            </div>
            <p className="text-xs text-gray-300">เลือกห้องเรียนของคุณครูที่รับผิดชอบในห้องนั้นๆ</p> 
          </div>
          {/* ระดับชั้นที่เลือกแล้ว */}
          <div className="flex flex-col gap-3">
            <p className="text-sm text-gray-500">ห้องเรียนที่เลือกแล้ว (ม.2)</p>
            <div className={`flex items-center flex-wrap gap-4 w-full ${selectedList.length === 0 ? "h-[45px]" : null} border border-gray-300 px-3 py-3 rounded`}>
                {selectedList.map((item) => (
                    <React.Fragment key={item}>
                        <MiniButton handleClick={() => removeSelectedList(item)} height={25} border={true} isSelected={true} borderColor="#c7c7c7" title={`ม.2/${item}`} />
                    </React.Fragment>
                ))}
            </div>
          </div>
          {/* เลือกระดับชั้นจากที่นี่ */}
          <div className="flex flex-col gap-3">
            <p className="text-sm text-gray-500">เลือกห้องได้จากที่นี่ (ม.2)</p>
            <div className={`flex items-center flex-wrap gap-4 w-full ${unSelectedList.length === 0 ? "h-[45px]" : null} border border-gray-300 px-3 py-3 rounded`}>
                {unSelectedList.map((item) => (
                    <React.Fragment key={item}>
                        <MiniButton handleClick={() => addSelectedList(item)} height={25} border={true} borderColor="#c7c7c7" title={`ม.2/${item}`} />
                    </React.Fragment>
                ))}
            </div>
          </div>
          <span className="w-full flex justify-end">
              {/* <Button title="ยืนยัน" width={150} handleClick={handleSubmit} /> */}
              <button onClick={() => confirmChange(selectedList)} className=" w-[100px] bg-green-500 hover:bg-green-600 duration-500 text-white py-2 px-4 rounded">
                ยืนยัน
              </button>
          </span>
        </div>
      </div>
    </>
  );
}

export default SelectClassRoomModal;
