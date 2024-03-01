"use client";
import { usePathname } from "next/navigation";
import React from "react";
import Menubar from "./Menubar";
import DashboardMenubar from "./DashboardMenubar";
import Schedule from "@/app/schedule/[semesterAndyear]/page";

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
          {!pathName.match("/select-semester") ? <DashboardMenubar /> : null}
          <span className="w-[1190px] h-auto px-16 py-2">{props.children}</span>
        </>
      ) : (pathName.match('/arrange') || pathName.match('/assign') || pathName.match('/lock') || pathName.match('/config')) ? 
        <>
          <Menubar />
          <span className="flex flex-col w-[1190px] h-auto px-16 py-2">
            <Schedule />
            {props.children}
          </span>
        </> 
        : (
        <>
          <Menubar />
          <span className="flex flex-col w-[1190px] h-auto px-16 py-2">
            {props.children}
          </span>
        </>
      )}
    </>
  );
}

export default Content;
