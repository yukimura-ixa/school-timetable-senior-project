"use client";
import React, { useState } from "react";
import Link from "next/link";
// @ts-expect-error - JS module without types
import { showTimetableMenu } from "@/raw-data/menubar-data";
import { usePathname } from "next/navigation";
function DashboardMenubar() {
  const pathName = usePathname();
  // State placeholders removed: component no longer depends on semester params

  const [linkSelected, setLinkSelected] = useState<string>(pathName);
  const makePath = (link: string): string => {
    const splitLink = link.split("/");
    return `${splitLink[1]}`;
  };
  return (
    <>
      {pathName === "/signin" ? null : (
        <aside className="flex flex-col gap-8 w-[270px] flex-shrink-0 min-h-screen px-5 py-8 bg-gradient-to-b from-gray-50 to-gray-100 border-r border-gray-200 shadow-lg">
          {/* management */}
          {/* <div className="flex flex-col w-full gap-1 h-fit border-b border-[#C8C9CD]">
            <p className="text-[#4F4F4F] mb-2 font-bold select-none">
              สรุปข้อมูล
            </p>
            {dashboardMenu.map((item, index) => {
              return (
                <React.Fragment key={item.id}>
                  {makePath(item.link) === linkSelected ? (
                    <Link
                      href={makePath(item.link)}
                      onClick={() => setLinkSelected(makePath(item.link))}
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
                      href={makePath(item.link)}
                      onClick={() => setLinkSelected(makePath(item.link))}
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
          </div> */}
          <div className="flex flex-col w-full gap-1 h-fit border-b border-gray-200 pb-4">
            <p className="text-gray-700 mb-3 font-bold text-sm uppercase tracking-wider select-none">
              แสดงข้อมูล
            </p>
            {showTimetableMenu.map((item: any, index: number) => {
              return (
                <React.Fragment key={item.id}>
                  {makePath(item.link) === linkSelected ? (
                    <Link
                      href={makePath(item.link)}
                      onClick={() => setLinkSelected(makePath(item.link))}
                      className={`group flex items-center w-full gap-3 h-[45px] px-4 rounded-lg cursor-pointer bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md transform scale-105 transition-all duration-300`}
                      style={{
                        marginBottom:
                          index === showTimetableMenu.length - 1 ? "10px" : 0,
                      }}
                    >
                      <item.IconStyle.Icon className={`w-5 h-5 fill-white`} />
                      <p className="text-md font-medium">{item.title}</p>
                    </Link>
                  ) : (
                    <Link
                      href={makePath(item.link)}
                      onClick={() => setLinkSelected(makePath(item.link))}
                      className={`group flex items-center w-full gap-3 h-[45px] px-4 rounded-lg cursor-pointer text-gray-600 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 hover:text-cyan-600 hover:shadow-sm transition-all duration-300`}
                      style={{
                        marginBottom:
                          index === showTimetableMenu.length - 1 ? "10px" : 0,
                      }}
                    >
                      <item.IconStyle.Icon className={`w-5 h-5 group-hover:fill-cyan-600 transition-colors duration-300`} />
                      <p className="text-md font-medium">{item.title}</p>
                    </Link>
                  )}
                </React.Fragment>
              );
            })}
          </div>
          {/* others */}
          {/* <div className="flex flex-col w-full h-fit border-b gap-1 border-[#C8C9CD]">
            <p className="text-[#4F4F4F] mb-2 font-bold select-none">อื่นๆ</p>
            {othersMenu.map((item, index) => (
              <React.Fragment key={item.id}>
                {makePath(item.link) === linkSelected ? (
                  <Link
                    href={makePath(item.link)}
                    onClick={() => setLinkSelected(makePath(item.link))}
                    className={`border-r-8 border-cyan-600 bg-cyan-100 text-cyan-600 flex items-center w-full gap-5 h-[45px] p-[10px] cursor-pointer duration-500`}
                    style={{
                      marginBottom: index == othersMenu.length - 1 ? "10px" : 0,
                    }}
                  >
                    <item.IconStyle.Icon className={`iconhover`} />
                    <p className="text-md ">{item.title}</p>
                  </Link>
                ) : (
                  <Link
                    href={makePath(item.link)}
                    onClick={() => setLinkSelected(makePath(item.link))}
                    className={`hoverfill hover:border-r-8 hover:border-cyan-600 hover:bg-cyan-100 hover:text-cyan-600 flex items-center w-full gap-5 h-[45px] p-[10px] cursor-pointer text-[#4F4F4F] duration-500`}
                    style={{
                      marginBottom: index == othersMenu.length - 1 ? "10px" : 0,
                    }}
                  >
                    <item.IconStyle.Icon className={`iconhover`} />
                    <p className="text-md ">{item.title}</p>
                  </Link>
                )}
              </React.Fragment>
            ))}
          </div> */}
        </aside>
      )}
    </>
  );
}

export default DashboardMenubar;
