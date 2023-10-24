"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  dashboardMenu,
  scheduleMenu,
  othersMenu,
} from "@/raw-data/menubar-data";
import { IoIosArrowDown } from "react-icons/io";
import { usePathname } from "next/navigation";
function DashboardMenubar() {
  const pathName = usePathname();
  const [indexPoint, setIndexPoint] = useState<number>(-1);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [linkSelected, setLinkSelected] = useState<string>(pathName);
  return (
    <>
      {pathName == "/signin" ? null : (
        <aside className="flex flex-col gap-8 w-[270px] min-h-screen px-5 py-8 bg-[#F1F3F9]">
          {/* management */}
          <div className="flex flex-col w-full gap-1 h-fit border-b border-[#C8C9CD]">
            <p className="text-[#4F4F4F] mb-2 font-bold select-none">
              การจัดการข้อมูล
            </p>
            {dashboardMenu.map((item, index) => {
              return (
                <React.Fragment key={item.id}>
                  {item.link === linkSelected ? (
                    <Link
                      href={item.link}
                      onClick={() => setLinkSelected(item.link)}
                      className={`hoverfill flex items-center w-full gap-5 h-[45px] p-[10px] cursor-pointer border-r-8 border-cyan-600 bg-cyan-100 text-cyan-600 duration-500`}
                      style={{
                        marginBottom:
                          index == dashboardMenu.length - 1 ? "10px" : 0,
                      }}
                    >
                      <item.IconStyle.Icon className={`fill-[#0891B2]`} />
                      <p className="text-md">{item.title}</p>
                    </Link>
                  ) : (
                    <Link
                      href={item.link}
                      onClick={() => setLinkSelected(item.link)}
                      className={`hoverfill flex items-center w-full gap-5 h-[45px] p-[10px] cursor-pointer text-[#4F4F4F] hover:bg-cyan-100 hover:text-cyan-600 duration-500`}
                      style={{
                        marginBottom:
                          index == dashboardMenu.length - 1 ? "10px" : 0,
                      }}
                    >
                      <item.IconStyle.Icon className={`iconhover`} />
                      <p className="text-md">{item.title}</p>
                    </Link>
                  )}
                </React.Fragment>
              );
            })}
          </div>
          {/* others */}
          <div className="flex flex-col w-full h-fit border-b gap-1 border-[#C8C9CD]">
            <p className="text-[#4F4F4F] mb-2 font-bold select-none">อื่นๆ</p>
            {othersMenu.map((item, index) => (
              <React.Fragment key={item.id}>
                {item.link === linkSelected ? (
                  <div
                    onClick={() => setLinkSelected(item.link)}
                    className={`border-r-8 border-cyan-600 bg-cyan-100 text-cyan-600 flex items-center w-full gap-5 h-[45px] p-[10px] cursor-pointer duration-500`}
                    style={{
                      marginBottom: index == othersMenu.length - 1 ? "10px" : 0,
                    }}
                  >
                    <item.IconStyle.Icon className={`iconhover`} />
                    <p className="text-md ">{item.title}</p>
                  </div>
                ) : (
                  <div
                    onClick={() => setLinkSelected(item.link)}
                    className={`hoverfill hover:border-r-8 hover:border-cyan-600 hover:bg-cyan-100 hover:text-cyan-600 flex items-center w-full gap-5 h-[45px] p-[10px] cursor-pointer text-[#4F4F4F] duration-500`}
                    style={{
                      marginBottom: index == othersMenu.length - 1 ? "10px" : 0,
                    }}
                  >
                    <item.IconStyle.Icon className={`iconhover`} />
                    <p className="text-md ">{item.title}</p>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </aside>
      )}
    </>
  );
}

export default DashboardMenubar;
