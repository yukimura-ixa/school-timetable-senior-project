import MiniButton from "@/components/elements/static/MiniButton";
import React, { useState } from "react";

import { AiOutlineClose } from 'react-icons/ai';
type props = {
  closeModal: any;
  classList: string[];
  confirmChange: any;
};
function SelectClassModal({ closeModal, classList, confirmChange }: props) {
    //เลือกชั้นเรียนที่รับผิดชอบแล้ว
    const [selectedClassList, setSelectedClassList] = useState<string[]>(classList.map(item => `ม.${item.Year}`));
    //ชั้นเรียนที่ยังไม่เลือก
    const [unSelectedClassList, setUnSelectedClassList] = useState<string[]>([
        "ม.1", "ม.2", "ม.3", "ม.4", "ม.5", "ม.6"
    ].filter((item) => !selectedClassList.includes(item)));
    const addSelectedClassList = (item:string) => {
        //ตัวแปร newList จะเพิ่มของใหม่ลงไปพร้อมกับ sort แล้ว set state
        let newList = [...selectedClassList, item].sort((a, b) => a.localeCompare(b))
        setSelectedClassList(() => newList)
        //จากนั้น copy ตัวที่จะลบมาไว้ แล้ว Splice ออกโดยการใช้ indexOf เพื่อเช็ค index ของไอเทม
        let unSelected = [...unSelectedClassList]
        unSelected.splice(unSelectedClassList.indexOf(item), 1)
        //วาง array ที่ลบแล้วลงไป
        setUnSelectedClassList(() => unSelected)
    }
    const removeSelectedClassList = (item:string) => {
        //ทำงานเหมือนกันกับ addSelectedClassList
        let newList = [...unSelectedClassList, item].sort((a, b) => a.localeCompare(b))
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
                <p className="text-lg select-none">ระดับชั้นที่รับผิดชอบ</p>
                <AiOutlineClose className="cursor-pointer" onClick={closeModal} />
            </div>
            <p className="text-xs text-gray-300">คลิกจากกรอบด้านล่างเพื่อเลือกขึ้นมาด้านบน</p> 
          </div>
          {/* ระดับชั้นที่เลือกแล้ว */}
          <div className="flex flex-col gap-3">
            <p className="text-sm text-gray-500">ระดับชั้นที่เลือกแล้ว</p>
            <div className={`flex items-center flex-wrap gap-4 w-full ${selectedClassList.length === 0 ? "h-[45px]" : null} border border-gray-300 px-3 py-3 rounded`}>
                {selectedClassList.map((item) => (
                    <React.Fragment key={item}>
                        <MiniButton handleClick={() => removeSelectedClassList(item)} height={25} border={true} isSelected={true} borderColor="#c7c7c7" title={item} />
                    </React.Fragment>
                ))}
            </div>
          </div>
          {/* เลือกระดับชั้นจากที่นี่ */}
          <div className="flex flex-col gap-3">
            <p className="text-sm text-gray-500">เลือกระดับชั้นจากที่นี่</p>
            <div className={`flex items-center flex-wrap gap-4 w-full ${unSelectedClassList.length === 0 ? "h-[45px]" : null} border border-gray-300 px-3 py-3 rounded`}>
                {unSelectedClassList.map((item) => (
                    <React.Fragment key={item}>
                        <MiniButton handleClick={() => addSelectedClassList(item)} width={45} height={25} border={true} borderColor="#c7c7c7" title={item} />
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

export default SelectClassModal;
