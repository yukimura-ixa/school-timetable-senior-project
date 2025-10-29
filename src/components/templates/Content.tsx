"use client";
import { usePathname } from "next/navigation";
import Menubar from "./Menubar";
import DashboardMenubar from "./DashboardMenubar";

type Props = {
  children: React.ReactNode;
};

function Content(props: Props) {
  const pathName = usePathname();
  return (
    <>
      <div
        className={`flex justify-center ${
          pathName.match("/dashboard/select-semester")
            ? "w-full"
            : pathName === "/"
            ? "w-full"
            : "w-full max-w-7xl mx-auto"
        } h-auto`}
      >
        {pathName === "/" ? (
          props.children
        ) : pathName === "/signin" ? (
          <span className="w-full h-auto">{props.children}</span>
        ) : pathName.match("/dashboard") ? (
          <>
            {!pathName.match("/select-semester") ? (
              <>
                <DashboardMenubar />
                <span className="flex flex-col w-[1024px] min-[1440px]:w-[1190px] h-auto px-16 py-2">
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
      </div>
    </>
  );
}

export default Content;
