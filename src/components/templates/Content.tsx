"use client";
import { useParams, usePathname } from "next/navigation";
import React from "react";
import Menubar from "./Menubar";
import DashboardMenubar from "./DashboardMenubar";
import Schedule from "@/app/schedule/[semesterAndyear]/page";
import Header from "@/app/dashboard/[semesterAndyear]/Header";

type Props = {
  children: React.ReactNode;
};

function Content(props: Props) {
  const pathName = usePathname();
  return (
    <>
      <main className={`flex justify-center ${pathName.match('/dashboard/select-semester') ? "w-full" : "w-[1280px] xl:w-full"} h-auto`}>
        {pathName == "/" ? (
          <span className="flex w-full justify-center h-auto">
            {props.children}
          </span>
        ) : pathName == "/signin" ? (
          <span className="w-full h-auto">{props.children}</span>
        ) : pathName.match("/dashboard") ? (
          <>
            {!pathName.match("/select-semester") ? (
              <>
                <DashboardMenubar />
                <span className="flex flex-col w-[1024px] min-[1440px]:w-[1190px] h-auto px-16 py-2">
                  {!pathName.match("/select-semester") ? <Header /> : null}
                  {props.children}
                </span>
              </>
            ) : (
              <span className="flex flex-col w-full min-[1440px]:w-[1440px] h-auto px-5 py-2">
                {props.children}
              </span>
            )}
          </>
        ) : pathName.match("/arrange") ||
          pathName.match("/assign") ||
          pathName.match("/lock") ||
          pathName.match("/config") ? (
          <>
            <Menubar />
            <span className="flex flex-col w-[1024px] min-[1440px]:w-[1190px] h-auto px-16 py-2">
              <Schedule />
              {props.children}
            </span>
          </>
        ) : (
          <>
            <Menubar />
            <span className="flex flex-col w-[1024px] min-[1440px]:w-[1190px] h-auto px-16 py-2">
              {props.children}
            </span>
          </>
        )}
      </main>
    </>
  );
}

export default Content;
