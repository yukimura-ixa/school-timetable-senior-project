"use client";
import { usePathname } from "next/navigation";
import Menubar from "./Menubar";
import DashboardMenubar from "./DashboardMenubar";

type Props = {
  children: React.ReactNode;
};

function Content(props: Props) {
  const pathName = usePathname();
  // /dashboard is the semester selection page (full width)
  // /dashboard/[semesterAndYear]/* are dashboard sub-pages (with menu)
  const isSemesterSelectionPage = pathName === "/dashboard";
  
  // Check if current path is a public route (teacher/class schedule)
  const isPublicRoute =
    pathName.startsWith("/teachers/") || pathName.startsWith("/classes/");

  return (
    <>
      <div
        className={`flex justify-center ${
          isSemesterSelectionPage
            ? "w-full"
            : pathName === "/" || isPublicRoute
              ? "w-full"
              : "w-full max-w-7xl mx-auto"
        } h-auto`}
      >
        {pathName === "/" || isPublicRoute ? (
          props.children
        ) : pathName === "/signin" ? (
          <span className="w-full h-auto" data-testid="app-content">
            {props.children}
          </span>
        ) : pathName.match("/dashboard") ? (
          <>
            {!isSemesterSelectionPage ? (
              <>
                <DashboardMenubar />
                <span
                  className="flex flex-col w-[1024px] min-[1440px]:w-[1190px] h-auto px-16 py-2"
                  data-testid="app-content"
                >
                  {props.children}
                </span>
              </>
            ) : (
              <span
                className="flex flex-col w-full min-[1440px]:w-[1440px] h-auto px-5 py-2"
                data-testid="app-content"
              >
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
            <span
              className="flex flex-col w-[1024px] min-[1440px]:w-[1190px] h-auto px-16 py-2"
              data-testid="app-content"
            >
              {props.children}
            </span>
          </>
        ) : (
          <>
            <Menubar />
            <span
              className="flex flex-col w-[1024px] min-[1440px]:w-[1190px] h-auto px-16 py-2"
              data-testid="app-content"
            >
              {props.children}
            </span>
          </>
        )}
      </div>
    </>
  );
}

export default Content;
