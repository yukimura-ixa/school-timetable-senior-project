"use client";
import { usePathname } from "next/navigation";
import Menubar from "./Menubar";
import DashboardMenubar from "./DashboardMenubar";
import { useUIStore } from "@/stores/uiStore";
import { authClient } from "@/lib/auth-client";

type Props = {
  children: React.ReactNode;
};

function Content(props: Props) {
  const pathName = usePathname();
  const { sidebarOpen, isHydrated } = useUIStore();
  const { data: session } = authClient.useSession();

  // /dashboard is the semester selection page (full width)
  const isSemesterSelectionPage = pathName === "/dashboard";

  // Check if current path is a public route (teacher/class schedule)
  const isPublicRoute =
    pathName.startsWith("/teachers/") || pathName.startsWith("/classes/");

  // Pages that don't have a sidebar
  const isNoSidebarPage =
    pathName === "/" || isPublicRoute || pathName === "/signin";

  // Pages that use DashboardMenubar
  const isDashboardSubPage =
    pathName.startsWith("/dashboard/") && !isSemesterSelectionPage;

  // Pages that use Menubar
  const isManagementPage =
    pathName.match("/arrange") ||
    pathName.match("/assign") ||
    pathName.match("/lock") ||
    pathName.match("/config") ||
    pathName.startsWith("/management");

  // Hydration-safe: avoid SSR/client mismatch by only rendering the sidebar
  // after Zustand has rehydrated on the client.
  const showSidebar =
    isHydrated && !!session && !isNoSidebarPage && !isSemesterSelectionPage;
  const sidebarComponent = isDashboardSubPage ? (
    <DashboardMenubar />
  ) : isManagementPage ? (
    <Menubar />
  ) : (
    <Menubar />
  );

  return (
    <div className="flex w-full h-auto min-h-screen bg-gray-50/30">
      {showSidebar && sidebarComponent}
      <main
        className={`flex-1 flex flex-col items-center transition-all duration-300 ease-in-out ${
          showSidebar && sidebarOpen ? "pl-0" : "pl-0"
        }`}
        data-testid="app-content-wrapper"
      >
        <div
          className={`w-full flex-1 flex flex-col ${
            isNoSidebarPage || isSemesterSelectionPage
              ? "w-full"
              : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          } py-4 transition-all duration-300 ease-in-out`}
          data-testid="app-content"
        >
          {props.children}
        </div>
      </main>
    </div>
  );
}

export default Content;
