"use client";
import { usePathname } from "next/navigation";
import React from "react";
import Menubar from "./Menubar";
import DashboardMenubar from "./DashboardMenubar";
import Dropdown from "../elements/input/selected_input/Dropdown";

type Props = {
  children: React.ReactNode;
};

function Content(props: Props) {
  const pathName = usePathname();
  return (
    <>
      {pathName == "/" ? (
        <span className="flex w-full justify-center h-auto">{props.children}</span>
      ) : pathName == "/signin" ? (
        <span className="w-full h-auto">{props.children}</span>
      ) : pathName.match("/dashboard") ? (
        <>
          <DashboardMenubar />
          <span className="w-[1190px] h-auto px-16 py-2">{props.children}</span>
        </>
      ) : (
        <>
          <Menubar />
          <span className="flex flex-col w-[1190px] h-auto px-16 py-2">
            {/* <div className="flex w-full h-16 border-b items-center justify-between">
              <p>ปีการศึกษา</p>
              <Dropdown
                data={[2565, 2566, 2567, 2568]}
                renderItem={({data}) => (<p>{data}</p>)}
                currentValue={2566}
                handleChange={undefined}
                width={150}
                // searchFunciton={undefined}
              />
            </div> */}
            {props.children}
          </span>
        </>
      )}
    </>
  );
}

export default Content;
