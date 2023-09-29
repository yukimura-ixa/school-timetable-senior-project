import React, { useState } from "react";

//SVG Icon
import arrowdownIcon from "../../../../public/svg/arrowdown.svg";
//Image Next
import Image from "next/image";

interface Dropdown{
    data: any[]; //ข้อมูลที่เป็น Array ทุกชนิด
    renderItem: Function; //ส่ง Component ผ่าน props
    width: string|number;
    height: string|number;
    currentValue: string; //ค่าปัจจุบันที่ Dropdown ได้ทำการเลือก
    placeHolder: string; //ตอนยังไม่เลือกค่าให้ใส่อะไรมาก็ได้ default คือ "Options"
    handleChange: Function; //ฟังก์ชั่นที่ส่งมาให้สำหรับกดเลือกค่าใน Dropdown
}
function Dropdown({
    data,
    renderItem: ItemElement, //ทำการ Map ให้เป็นชื่อที่ขึ้นต้นด้วย Capital letter
    width='100%',
    height='auto',
    currentValue,
    placeHolder="Options",
    handleChange
}): JSX.Element {
  //Toggle สำหรับกดเปิด-ปิด Dropdown default is false
  const [isHidden, setIsHidden] = useState(false);
  return (
    <div className="relative">
      <div
        className="
        relative
        flex 
        justify-between 
        items-center 
        border-[1px] 
        px-[15px] py-[10px]
        cursor-pointer
        select-none
        gap-[10px]
        hover:bg-slate-100
        duration-300
        z-50
        "
        //กดเพื่อ set state toggle dropdown
        onClick={() => setIsHidden(!isHidden)} //กดปุ๊ปจะเซ็ทค่าเป็นค่าตรงข้ามกับ boolean ปัจจุบัน ด้วยนิเสธ '!'
        style={{
            width: width,
            height: height,
        }}
      >
        <div className="w-full flex justify-left"
        //กำหนดสีของ Placeholder เป็นสีเทากลางๆ แต่ถ้าเลือกค่าแล้ว text จะเป็นสีดำ
        style={{color : typeof currentValue === 'undefined' ? "#676E85" : "#000"}}
        >
            {/* ถ้าไม่มีการใส่ currentValue เข้ามา จะสั่งให้วาง placeHolder เอาไว้ */}
            {typeof currentValue === 'undefined' ? placeHolder : currentValue}
        </div>
        <Image
        className={`
            duration-300
            ${isHidden ? null : 'rotate-180'}
        `}
        src={arrowdownIcon} alt="arrowicon" />
      </div>
      {/* ถ้าข้อมูลที่ส่งมามี Array.length เท่ากับ 0 จะไม่แสดง Dropdown List เมื่อกด Dropdown */}
      {data.length === 0 ? null : (
        <div
          className={`
            absolute
            flex
            flex-col
            justify-left
            items-center
            border-[1px]
            cursor-pointer
            select-none
            mt-1
            bg-white
            overflow-y-scroll
            gap-2
            duration-300
            transition-all ease-out
            ${isHidden ? `scale-y-0 translate-y-[-75px]` : null} 
            `} //เช็คสถานะของ isHidden เพื่อเปิด Dropdown List
          style={{
            width: width,
            height: data.length < 3 ? 'auto' : 150, //ถ้าข้อมูลเกิน 3 ชุด จะสั่งให้ fixed ความสูงไว้ที่ 150 แล้ว scroll เอา
          }}
        >
          {data.map((item:any, index:number) => {
            return (
              <div
                className={`
                  w-[100%]
                  bg-white
                  flex
                  justify-left
                  items-center
                  px-[15px] py-[10px] 
                  hover:bg-[#EAF2FF]
                  hover:text-[#3B8FEE]
                `}
                key={`${item}(${index})`}
                onClick={() => {setIsHidden(true), handleChange(item)}} 
                //เมื่อกดเลือกข้อมูลใน List Dropdown จะพับกลับขึ้นไปแล้วเรียก handleChange
                //ที่ส่งผ่าน props มาตอนแรก เพื่อส่งชุดข้อมูลที่เลือกกลับไป setState ที่ต้องการ
              >
                {/* Component ที่ส่งมาให้ใช้งาน รับ props เป็น data */}
                <ItemElement data={item} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Dropdown;
