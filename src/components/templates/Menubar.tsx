"use client";
import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  managementMenu,
  scheduleMenu,
  othersMenu,
  // @ts-expect-error - JS module without types
} from "@/raw-data/menubar-data";
import { IoIosArrowDown } from "react-icons/io";
import { usePathname } from "next/navigation";
import { useUIStore } from "@/stores/uiStore";

function Menubar() {
  const { sidebarOpen } = useUIStore();
  const pathName = usePathname();
  const [indexPoint, setIndexPoint] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [linkSelected, setLinkSelected] = useState<string>(pathName);

  // Extract current term from URL if present
  const currentTerm = useMemo(() => {
    // Match patterns like /schedule/2567/1/* or /dashboard/2567/1/*
    const match = pathName.match(/\/(schedule|dashboard)\/(25\d{2})\/(\d)/);
    if (!match) return null;
    return { year: match[2], semester: match[3] };
  }, [pathName]);
  return (
    <>
      {pathName === "/signin" ? null : (
        <aside
          className={`flex flex-col gap-8 flex-shrink-0 min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 border-r border-gray-200 shadow-lg transition-all duration-300 ease-in-out overflow-hidden
            ${sidebarOpen ? "w-[270px] px-5 py-8" : "w-0 px-0 py-8 border-none"}
            ${sidebarOpen ? "fixed inset-y-0 left-0 z-40 md:relative md:z-auto" : ""}
          `}
        >
          {/* management */}
          <div className="flex flex-col w-full gap-1 h-fit border-b border-gray-200 pb-4">
            <p className="text-gray-700 mb-3 font-bold text-sm uppercase tracking-wider select-none">
              การจัดการข้อมูล
            </p>
            {managementMenu.map((item: any, index: number) => {
              return (
                <React.Fragment key={item.id}>
                  {item.link === linkSelected ? (
                    <Link
                      href={item.link}
                      onClick={() => setLinkSelected(item.link)}
                      className={`group flex items-center w-full gap-3 h-[45px] px-4 rounded-lg cursor-pointer bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md transform scale-105 transition-all duration-300`}
                      style={{
                        marginBottom:
                          index === managementMenu.length - 1 ? "10px" : 0,
                      }}
                    >
                      <item.IconStyle.Icon className={`w-5 h-5 fill-white`} />
                      <p className="text-md font-medium">{item.title}</p>
                    </Link>
                  ) : (
                    <Link
                      href={item.link}
                      onClick={() => setLinkSelected(item.link)}
                      className={`group flex items-center w-full gap-3 h-[45px] px-4 rounded-lg cursor-pointer text-gray-600 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 hover:text-cyan-600 hover:shadow-sm transition-all duration-300`}
                      style={{
                        marginBottom:
                          index === managementMenu.length - 1 ? "10px" : 0,
                      }}
                    >
                      <item.IconStyle.Icon
                        className={`w-5 h-5 group-hover:fill-cyan-600 transition-colors duration-300`}
                      />
                      <p className="text-md font-medium">{item.title}</p>
                    </Link>
                  )}
                </React.Fragment>
              );
            })}
          </div>
          {/* schedule */}
          <div className="flex flex-col w-full gap-1 h-fit border-b border-gray-200 pb-4 select-none">
            <p className="text-gray-700 mb-3 font-bold text-sm uppercase tracking-wider select-none">
              ตารางสอน
            </p>
            {scheduleMenu.map((item: any, index: number) => {
              // For dynamic links (จัดตารางสอน), use current semester if available
              const linkHref =
                item.dynamicLink && currentTerm
                  ? `/schedule/${currentTerm.year}/${currentTerm.semester}/arrange`
                  : item.link || "/dashboard";

              const isSelected = linkHref === linkSelected;

              return (
                <React.Fragment key={item.id}>
                  <>
                    {isSelected ? (
                      <Link
                        href={linkHref}
                        onClick={() => setLinkSelected(linkHref)}
                        className={`group flex items-center w-full gap-3 h-[45px] px-4 rounded-lg cursor-pointer bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md transform scale-105 transition-all duration-300`}
                        style={{
                          marginBottom:
                            index === scheduleMenu.length - 1 ? "10px" : 0,
                        }}
                      >
                        <item.IconStyle.Icon className={`w-5 h-5 fill-white`} />
                        <p className="text-md font-medium">{item.title}</p>
                      </Link>
                    ) : (
                      <Link
                        href={linkHref}
                        onClick={() => setLinkSelected(linkHref)}
                        className={`group flex items-center w-full gap-3 h-[45px] px-4 rounded-lg cursor-pointer text-gray-600 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 hover:text-cyan-600 hover:shadow-sm transition-all duration-300`}
                        style={{
                          marginBottom:
                            index === scheduleMenu.length - 1 ? "10px" : 0,
                        }}
                      >
                        <item.IconStyle.Icon
                          className={`w-5 h-5 group-hover:fill-cyan-600 transition-colors duration-300`}
                        />
                        <p className="text-md font-medium">{item.title}</p>
                      </Link>
                    )}
                  </>
                </React.Fragment>
              );
            })}
          </div>
          {/* others */}
          {/* <div className="flex flex-col w-full h-fit border-b gap-1 border-[#C8C9CD]">
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
          </div> */}
        </aside>
      )}
    </>
  );
}

export default Menubar;
