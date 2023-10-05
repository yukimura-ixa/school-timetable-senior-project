"use client";
import Image from "next/image";
import React, { useState } from "react";
import Link from "next/link";
import {
  managementMenu,
  scheduleMenu,
  othersMenu,
} from "@/raw-data/menubar-data";
import arrow from "@/svg/arrow/arrowdown.svg";
import { IoIosArrowDown } from 'react-icons/io'
function Menubar() {
  const [indexPoint, setIndexPoint] = useState<number>(-1);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // const [linkSelected, setLinkSelected] = useState<string>('/management/teacher');
  return (
    <>
      <aside className="flex flex-col gap-8 w-[250px] h-screen px-5 py-8 bg-[#F1F3F9]">
        {/* management */}
        <div className="flex flex-col w-full gap-1 h-fit border-b border-[#C8C9CD]">
          <p className="text-[#4F4F4F] mb-2 font-bold select-none">การจัดการข้อมูล</p>
          {managementMenu.map((item, index) => (
            <React.Fragment key={item.id}>
              <Link href={item.link}
                className={`hoverfill flex items-center w-full gap-5 h-[45px] p-[10px] cursor-pointer hover:border-r-8 hover:border-cyan-600 text-[#4F4F4F] hover:bg-cyan-400 hover:text-white duration-500`}
                style={{
                  marginBottom: index == managementMenu.length - 1 ? "10px" : 0,
                }}
              >
                <item.IconStyle.Icon className={`iconhover`} />
                <p className="text-md">{item.title}</p>
              </Link>
            </React.Fragment>
          ))}
        </div>
        {/* schedule */}
        <div className="flex flex-col w-full gap-2 h-fit border-b border-[#C8C9CD] select-none hover:text-white">
          <p className="text-[#4F4F4F] mb-2 font-bold select-none">ตารางสอน</p>
          {scheduleMenu.map((item, index) => (
            <React.Fragment key={item.id}>
              <div className="w-full flex flex-col relative">
                <div
                  className="flex items-center justify-between w-full gap-5 h-[45px] p-[10px] cursor-pointer texthover hover:bg-cyan-400 duration-500"
                  onClick={() => {
                    setIndexPoint(index),
                      setIsOpen(index === indexPoint ? !isOpen : true);
                  }}
                >
                  <div className="flex gap-5 justify-between w-full items-center">
                    <span className="flex items-center justify-start gap-5">
                      <item.IconStyle.Icon className={`fill-[#4f4f4f] changetext`} />
                      <p className="text-md text-[#4F4F4F] changetext">{item.title}</p>
                    </span>
                    <IoIosArrowDown className="fill-[#4f4f4f] changetext" />
                  </div>
                </div>
                {/* select semester */}
                <div
                  className={`flex flex-col items-end w-full duration-500 ease-out transition-transform
                    ${indexPoint === index && isOpen
                      ? null
                      : "hidden"
                    }`}
                >
                  <div className="w-[165px] px-3 py-2 cursor-pointer hover:bg-cyan-400 duration-500 semester-text">
                    <p className="text-md text-[#4f4f4f]">เทอม 1</p>
                  </div>
                  <div className="w-[165px] px-3 py-2 cursor-pointer hover:bg-cyan-400 duration-500 semester-text">
                    <p className="text-md text-[#4f4f4f]">เทอม 2</p>
                  </div>
                </div>
              </div>
            </React.Fragment>
          ))}
          <div className="mb-[10px]"></div>
        </div>
        {/* others */}
        <div className="flex flex-col w-full h-fit border-b gap-1 border-[#C8C9CD]">
          <p className="text-[#4F4F4F] mb-2 font-bold select-none">อื่นๆ</p>
          {othersMenu.map((item, index) => (
            <React.Fragment key={item.id}>
              <div
                className={`hoverfill hover:border-r-8 hover:border-cyan-600 hover:bg-cyan-400 hover:text-white flex items-center w-full gap-5 h-[45px] p-[10px] cursor-pointer text-[#4F4F4F] duration-500`}
                style={{
                  marginBottom: index == othersMenu.length - 1 ? "10px" : 0,
                }}
              >
                <item.IconStyle.Icon className={`iconhover`} />
                <p className="text-md ">{item.title}</p>
              </div>
            </React.Fragment>
          ))}
        </div>
      </aside>
    </>
  );
}

export default Menubar;
