import React, { useState } from "react";

//Image component from next
import Image from "next/image";

//Import functions
import { hexToRGB } from "@/app/functions/componentFunctions";

// ใช้กับ props ที่รับมาให้ component
interface ButtonData {
  icon: string; //SVG
  title: string; //Label
  buttonColor: string; //สีปุ่ม
  titleColor: string; //สีข้อความ
  fontSize: number; //ขนาดข้อความ
  fontWeight: number; //ความหนาของข้อความ
  width: number | string; //ความกว้างปุ่ม ใส่ได้ทั้งค่าตัวเลขและ ค่าเปอร์เซ็นเป็น string ex '75%'
  height: number | string; //เช่นเดียวกันกับความกว้าง
  disabled: boolean; //ล็อคปุ่มไม่ให้ใช้
  handleClick; //รับฟังก์ชั่นเพื่อใช้กับ onClick
}
function Button({
  //ตรงนี้คือ Property ทั้งหมดที่สามารถรับเข้ามาได้พร้อมกับกำหนดค่าเริ่มต้น
  icon = "",
  title = "",
  buttonColor = "#2F80ED",
  titleColor = "#FFF",
  fontSize = 16,
  fontWeight = 300,
  width=null,
  height = 0,
  disabled = false,
  handleClick,
}: ButtonData): JSX.Element {
  const [isHover, setIsHover] = useState(false); //Hover state ใช้กับปุ่ม
  // interface สำหรับเก็บค่า object property rgb จากการคืนค่าของฟังก์ชัน hexToRGB
  interface buttonColor {
    r: number;
    g: number;
    b: number;
  }
  //เก็บค่าสี RGB ของปุ่ม
  const buttonRGB: buttonColor = hexToRGB(buttonColor);
  //เก็บค่าสี RGB ของข้อความ
  const titleRGB: buttonColor = hexToRGB(titleColor);
  //style property ใช้เก็บค่าของ component props (ใส่ใน tailwind ไม่ได้ง่ะ ;-;)
  const buttonStyleProperty: object = {
    backgroundColor: isHover
      ? `rgb(${buttonRGB.r - 10}, ${buttonRGB.g - 10}, ${buttonRGB.b - 10})`
      : `rgb(${buttonRGB.r}, ${buttonRGB.g}, ${buttonRGB.b})`,
    color: `rgb(${titleRGB.r}, ${titleRGB.g}, ${titleRGB.b})`,
    width: width === null ? 'fit-content' : width,
    height: height === 0 ? 45 : height,
    opacity: disabled ? 0.5 : 1,
  };
  //style property ใช้เก็บค่าของ component props (ใส่ใน tailwind ไม่ได้ง่ะ ;-;)
  return (
    <>
      {/* 
        เช็คปุ่ม disabled ถ้ามีการส่ง property disabled เป็น true
        ปุ่มจะถูกปิดการใช้งาน 
        ถ้าไม่ส่งอะไรมา (default is false) หรือส่ง false ผ่าน prop ปุ่มจะกดได้ปกติ
       */}
      {disabled ? (
        <button
          className={`flex items-center justify-center p-3 rounded ${
            disabled ? null : "cursor-pointer"
          } select-none`}
          style={buttonStyleProperty}
        >
          <div className="flex gap-[10px]">
            {icon === "" ? null : <Image src={icon} alt="iconfromprops" />}
            {title === "" ? (
              <p className="text-sm">Button</p>
            ) : (
              <p className="text-sm">{title}</p>
            )}
          </div>
        </button>
      ) : (
        <button
          className={`flex items-center justify-center px-[15px] py-[10px] rounded ${
            disabled ? null : "cursor-pointer duration-300"
          } select-none`}
          style={buttonStyleProperty}
          onClick={handleClick}
          onMouseEnter={() => setIsHover(true)}
          onMouseLeave={() => setIsHover(false)}
        >
          <div className="flex gap-[10px]">
            {icon === "" ? null : <Image src={icon} alt="icon" />}
            {title === "" ? (
              <p className="text-sm">Button</p>
            ) : (
              <p className="text-sm">{title}</p>
            )}
          </div>
        </button>
      )}
    </>
  );
}

export default Button;
