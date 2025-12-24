"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { usePathname, useRouter } from "next/navigation";
import LogoutIcon from "@mui/icons-material/Logout";
import { authClient } from "@/lib/auth-client";
import { normalizeAppRole } from "@/lib/authz";
import { useUIStore } from "@/stores/uiStore";
import MenuIcon from "@mui/icons-material/Menu";
import { IconButton } from "@mui/material";

const FALLBACK_USER_ICON = "/svg/user/usericon.svg";
import { SemesterSelector } from "./SemesterSelector";

function Navbar() {
  const { toggleSidebar, isHydrated } = useUIStore();
  const { data: session, isPending } = authClient.useSession();
  const pathName = usePathname();
  const router = useRouter();
  const [isHoverPhoto, setIsHoverPhoto] = useState<boolean>(false);

  // Cache session to prevent flashing "Loading..." on route changes
  const [cachedSession, setCachedSession] = useState<typeof session>(null);

  // Cache session after first successful fetch
  useEffect(() => {
    if (session && !isPending) {
      setCachedSession(session);
    }
  }, [session, isPending]);

  // Use cached session if available, otherwise use live session
  const displaySession = cachedSession || session;
  const hydratedSession = isHydrated ? displaySession : null;
  const hydratedRole = normalizeAppRole(hydratedSession?.user?.role);

  // Only show loading on initial mount (no cached session yet)
  const showLoading = !isHydrated || (!cachedSession && isPending);
  return (
    <>
      {pathName === "/signin" || pathName === "/" ? null : (
        <nav className="sticky top-0 z-50 flex w-full justify-center border-b border-white/20 bg-white/70 backdrop-blur-md shadow-sm transition-all duration-300">
          <div className="flex w-full xl:w-[1440px] h-full justify-between items-center px-6 py-2.5">
            {/* Leftside */}
            <span className="flex w-fit items-center gap-6">
              <div className="flex items-center gap-4">
                <IconButton
                  onClick={toggleSidebar}
                  edge="start"
                  sx={{
                    color: "text.secondary",
                    "&:hover": {
                      bgcolor: "action.hover",
                      transform: "scale(1.05)",
                    },
                    transition: "all 0.2s",
                  }}
                  aria-label="เมนู"
                >
                  <MenuIcon />
                </IconButton>
                <Link href={"/"} className="group flex items-center gap-2">
                  <div className="p-1 px-2 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 shadow-sm group-hover:shadow-md transition-all duration-300">
                    <h1 className="text-sm md:text-base font-bold text-white tracking-tight">
                      PT
                    </h1>
                  </div>
                  <h1 className="hidden sm:block text-lg font-extrabold cursor-pointer bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-cyan-600 transition-all duration-300">
                    Phrasongsa Timetable
                  </h1>
                </Link>
              </div>

              <ul className="hidden md:flex items-center gap-2">
                {hydratedRole === "admin" && (
                  <li>
                    <Link
                      href="/management"
                      className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                        pathName.startsWith("/management")
                          ? "bg-blue-600/10 text-blue-600"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      จัดการ
                    </Link>
                  </li>
                )}
                <li>
                  <Link
                    href="/dashboard"
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                      pathName.startsWith("/dashboard") &&
                      !pathName.includes("/profile")
                        ? "bg-blue-600/10 text-blue-600"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    สรุปข้อมูล
                  </Link>
                </li>
              </ul>
            </span>

            {/* Rightside */}
            <div className="flex items-center gap-6">
              {/* Semester Selector */}
              {hydratedSession && (
                <div className="hidden sm:block">
                  <SemesterSelector />
                </div>
              )}

              {/* User Info & Actions */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-3 pl-3 pr-1 py-1 bg-white/40 border border-white/50 backdrop-blur-sm rounded-full shadow-sm hover:shadow-md transition-all duration-300 group">
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center gap-3"
                  >
                    <div className="flex flex-col text-right hidden lg:flex">
                      <p className="font-bold text-xs text-slate-800 leading-tight">
                        {showLoading
                          ? "กำลังโหลด..."
                          : (hydratedSession?.user?.name ?? "ผู้ใช้งาน")}
                      </p>
                      <p className="text-[10px] font-medium text-slate-500 flex items-center justify-end gap-1">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isPending
                              ? "bg-slate-300 animate-pulse"
                              : hydratedRole === "admin"
                                ? "bg-purple-500"
                                : hydratedRole === "teacher"
                                  ? "bg-blue-500"
                                  : "bg-green-500"
                          }`}
                        />
                        {showLoading
                          ? "..."
                          : hydratedSession && hydratedRole
                            ? hydratedRole === "admin"
                              ? "ผู้ดูแลระบบ"
                              : hydratedRole === "teacher"
                                ? "คุณครู"
                                : "นักเรียน"
                            : "ไม่ระบุ"}
                      </p>
                    </div>
                    <div
                      className="relative rounded-full ring-2 ring-white shadow-sm group-hover:ring-blue-100 transition-all duration-300 shrink-0"
                      onMouseEnter={() => setIsHoverPhoto(true)}
                      onMouseLeave={() => setIsHoverPhoto(false)}
                    >
                      <Image
                        className={`rounded-full ${
                          isHoverPhoto ? "opacity-85" : "opacity-100"
                        } transition-opacity duration-300`}
                        width={36}
                        height={36}
                        src={hydratedSession?.user?.image ?? FALLBACK_USER_ICON}
                        alt="profile_pic"
                        priority
                      />
                    </div>
                  </Link>

                  {/* Logout Button */}
                  {hydratedSession && (
                    <IconButton
                      onClick={async () => {
                        await authClient.signOut({
                          fetchOptions: {
                            onSuccess: () => {
                              router.push("/signin");
                            },
                          },
                        });
                      }}
                      size="small"
                      sx={{
                        color: "slate.400",
                        "&:hover": {
                          color: "error.main",
                          bgcolor: "error.lighter",
                          transform: "rotate(90deg)",
                        },
                        transition: "all 0.3s",
                      }}
                      aria-label="ออกจากระบบ"
                    >
                      <LogoutIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  )}
                </div>
              </div>
            </div>
          </div>
        </nav>
      )}
    </>
  );
}

export default Navbar;
