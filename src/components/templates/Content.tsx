"use client";
import { usePathname } from "next/navigation";
import React from "react";
import Menubar from "./Menubar";
import DashboardMenubar from "./DashboardMenubar";

type Props = {
  children: React.ReactNode;
};

function Content(props: Props) {
  const pathName = usePathname();
  return (
    <>
      {pathName == "/signin" ? (
        <span className="w-full h-auto">{props.children}</span>
      ) 
      : pathName.match("/dashboard") ? (
        <>
          <DashboardMenubar/>
          <span className="w-[1190px] h-auto px-16 py-2">{props.children}</span>
        </>
      ) 
      : (
        <>
          <Menubar />
          <span className="w-[1190px] h-auto px-16 py-2">{props.children}</span>
        </>
      )}
    </>
  );
}

export default Content;
