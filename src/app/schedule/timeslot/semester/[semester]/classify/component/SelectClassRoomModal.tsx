import MiniButton from "@/components/elements/static/MiniButton";
import React, { useState } from "react";

import { AiOutlineClose } from 'react-icons/ai';
type props = {
  closeModal: any;
  classList: number[];
  confirmChange: any;
};
function SelectClassRoomModal({ closeModal, classList, confirmChange }: props) {
    //เลือกชั้นเรียนที่รับผิดชอบแล้ว
    const [selectedClassList, setSelectedClassList] = useState<number[]>(classList);
    //ชั้นเรียนที่ยังไม่เลือก
    const [unSelectedClassList, setUnSelectedClassList] = useState<number[]>([
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12
    ].filter((item) => !selectedClassList.includes(item)));
    const addSelectedClassList = (item:number) => {
        //ตัวแปร newList จะเพิ่มของใหม่ลงไปพร้อมกับ sort แล้ว set state
        let newList = [...selectedClassList, item].sort();
        setSelectedClassList(() => newList)
        //จากนั้น copy ตัวที่จะลบมาไว้ แล้ว Splice ออกโดยการใช้ indexOf เพื่อเช็ค index ของไอเทม
        let unSelected = [...unSelectedClassList]
        unSelected.splice(unSelectedClassList.indexOf(item), 1)
        //วาง array ที่ลบแล้วลงไป
        setUnSelectedClassList(() => unSelected)
    }
    const removeSelectedClassList = (item:number) => {
        //ทำงานเหมือนกันกับ addSelectedClassList
        let newList = [...unSelectedClassList, item].sort();
        setUnSelectedClassList(() => newList)
        let selected = [...selectedClassList]
        selected.splice(selectedClassList.indexOf(item), 1)
        setSelectedClassList(() => selected)
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
                <p className="text-lg select-none">เลือกห้องเรียน</p>
                <AiOutlineClose className="cursor-pointer" onClick={closeModal} />
            </div>
            <p className="text-xs text-gray-300">เลือกห้องเรียนของคุณครูที่รับผิดชอบในห้องนั้นๆ</p> 
          </div>
          {/* ระดับชั้นที่เลือกแล้ว */}
          <div className="flex flex-col gap-3">
            <p className="text-sm text-gray-500">ห้องเรียนที่เลือกแล้ว (ม.2)</p>
            <div className={`flex items-center flex-wrap gap-4 w-full ${selectedClassList.length === 0 ? "h-[45px]" : null} border border-gray-300 px-3 py-3 rounded`}>
                {selectedClassList.map((item) => (
                    <React.Fragment key={item}>
                        <MiniButton handleClick={() => removeSelectedClassList(item)} height={25} border={true} isSelected={true} borderColor="#c7c7c7" title={`ม.2/${item}`} />
                    </React.Fragment>
                ))}
            </div>
          </div>
          {/* เลือกระดับชั้นจากที่นี่ */}
          <div className="flex flex-col gap-3">
            <p className="text-sm text-gray-500">เลือกห้องได้จากที่นี่ (ม.2)</p>
            <div className={`flex items-center flex-wrap gap-4 w-full ${unSelectedClassList.length === 0 ? "h-[45px]" : null} border border-gray-300 px-3 py-3 rounded`}>
                {unSelectedClassList.map((item) => (
                    <React.Fragment key={item}>
                        <MiniButton handleClick={() => addSelectedClassList(item)} height={25} border={true} borderColor="#c7c7c7" title={`ม.2/${item}`} />
                    </React.Fragment>
                ))}
            </div>
          </div>
          <span className="w-full flex justify-end">
              {/* <Button title="ยืนยัน" width={150} handleClick={handleSubmit} /> */}
              <button onClick={() => confirmChange(selectedClassList)} className=" w-[100px] bg-green-500 hover:bg-green-600 duration-500 text-white py-2 px-4 rounded">
                ยืนยัน
              </button>
          </span>
        </div>
      </div>
    </>
  );
}

export default SelectClassRoomModal;
