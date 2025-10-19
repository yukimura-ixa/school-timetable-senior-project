import React, { useState } from "react";

//SVG Icon
import arrowdownIcon from "@/svg/arrow/arrowdown.svg";
//Image Next
import Image from "next/image";
import SearchBar from "@/components/elements/input/field/SearchBar";

interface DropdownProps {
  data: Array<unknown>;
  renderItem: React.ComponentType<{ data: unknown }>;
  width?: string | number | null;
  height?: string | number;
  currentValue?: string;
  placeHolder?: string;
  handleChange: (item: unknown, index: number) => void;
  useSearchBar?: boolean;
  searchFunciton?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  borderColor?: string;
}

function Dropdown({
  data,
  renderItem: ItemElement, //ทำการ Map ให้เป็นชื่อที่ขึ้นต้นด้วย Capital letter
  width = null,
  height = "auto",
  currentValue,
  placeHolder = "Options",
  handleChange,
  useSearchBar = false,
  searchFunciton,
  borderColor = "",
}: DropdownProps): JSX.Element {
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
        border
        rounded
        bg-white
        px-[15px] py-[10px]
        cursor-pointer
        select-none
        gap-5
        hover:bg-slate-100
        duration-300
        "
        //กดเพื่อ set state toggle dropdown
        onClick={() => setIsHidden(!isHidden)} //กดปุ๊ปจะเซ็ทค่าเป็นค่าตรงข้ามกับ boolean ปัจจุบัน ด้วยนิเสธ '!'
        style={{
          width: width === null ? "fit-content" : width,
          height: height,
          borderColor: `${borderColor}`,
        }}
      >
        <div
          className="flex justify-left text-sm"
          //กำหนดสีของ Placeholder เป็นสีเทากลางๆ แต่ถ้าเลือกค่าแล้ว text จะเป็นสีดำ
          style={{
            color:
              typeof currentValue === "undefined" || currentValue === ""
                ? "#676E85"
                : "#000",
          }}
        >
          {/* ถ้าไม่มีการใส่ currentValue เข้ามา จะสั่งให้วาง placeHolder เอาไว้ */}
          {typeof currentValue === "undefined" ||
          currentValue === "" ||
          currentValue == null
            ? placeHolder
            : typeof width === "number" && width < 200
              ? currentValue.length > 15
                ? `${currentValue.substring(0, 10)}...`
                : currentValue
              : currentValue}
        </div>
        <Image
          className={`
            duration-300
            ${isHidden ? "rotate-180" : ""}
        `}
          src={arrowdownIcon}
          alt="arrowicon"
        />
      </div>
      {/* ถ้าข้อมูลที่ส่งมามี Array.length เท่ากับ 0 จะไม่แสดง Dropdown List เมื่อกด Dropdown */}
      <div
        className={`
            absolute
            flex
            z-20
            flex-col
            justify-left
            border
            cursor-pointer
            overflow-hidden
            select-none
            mt-1
            bg-white
            gap-3
            ${useSearchBar ? "pt-5" : ""}
            overflow-y-scroll
            duration-300
            transition-all ease-out
            ${isHidden ? "" : `scale-y-0 translate-y-[-75px]`} 
            `} //เช็คสถานะของ isHidden เพื่อเปิด Dropdown List
        style={{
          width: width === null ? "fit-content" : width,
          height: data.length < 3 ? "auto" : 150, //ถ้าข้อมูลเกิน 3 ชุด จะสั่งให้ fixed ความสูงไว้ที่ 150 แล้ว scroll เอา
        }}
      >
        {useSearchBar && searchFunciton ? (
          <SearchBar height="auto" fill="#FFFFFF" handleChange={searchFunciton} />
        ) : null}
        {data.length === 0 ? (
          <div
            className={`
            w-[100%]
            bg-white
            flex
            justify-center
            items-center
            px-[15px] py-[10px]
            cursor-default
          `}
          >
            <p className="text-gray-400 text-sm">ไม่พบข้อมูล</p>
          </div>
        ) : (
          <div className="bg-white">
            {data.map((item, index: number) => {
              return (
                <ul
                  className={`
                    w-[100%]
                    h-auto
                    bg-white
                    flex
                    justify-left
                    items-center
                    px-[15px] py-[10px] 
                    hover:bg-cyan-50
                    hover:text-cyan-500
                  `}
                  key={`${String(item)}(${index})`}
                  onClick={() => {
                    setIsHidden(false);
                    handleChange(item, index);
                  }}
                  //เมื่อกดเลือกข้อมูลใน List Dropdown จะพับกลับขึ้นไปแล้วเรียก handleChange
                  //ที่ส่งผ่าน props มาตอนแรก เพื่อส่งชุดข้อมูลที่เลือกกลับไป setState ที่ต้นการ
                >
                  {/* Component ที่ส่งมาให้ใช้งาน รับ props เป็น data */}
                  <ItemElement data={item} />
                </ul>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dropdown;
