"use client";
import { useParams, usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Link } from "@mui/material";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import { fetcher } from "@/libs/axios";
import useSWR from "swr";

function Schedule() {
  const pathName = usePathname();
  const router = useRouter();
  const params = useParams();
  const [semester, academicYear] = (params.semesterAndyear as string).split(
    "-",
  ); //from "1-2566" to ["1", "2566"]
  const path = pathName.substring(0, 16);
  const [isSetTimeslot, setIsSetTimeslot] = useState(false); //ตั้งค่าไปแล้วจะ = true
  const tableConfig = useSWR(
    "/config/getConfig?AcademicYear=" +
      academicYear +
      "&Semester=SEMESTER_" +
      semester,
    fetcher,
  );
  useEffect(() => {
    setIsSetTimeslot(() => tableConfig.data != undefined);
  }, [tableConfig.isValidating, tableConfig.data]);

  const [tabSelect, setTabSelect] = useState("");
  return (
    <>
      <div className="w-full flex justify-between items-center py-6">
        <h1 className="text-xl font-bold">
          ตารางสอน ภาคเรียนที่ {semester} ปีการศึกษา {academicYear}
        </h1>
        <Link
          className="flex gap-3 items-center justify-between cursor-pointer"
          href={"/schedule/select-semester"}
        >
          <KeyboardBackspaceIcon className="fill-gray-500" />
          <p className="select-none text-gray-500 text-sm">เปลี่ยนภาคเรียน</p>
        </Link>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex pt-5 w-full h-fit border-b">
          <button
            onClick={() => {
              router.replace(`${path}/config`), setTabSelect(() => "config");
            }}
            className={`flex w-fit h-[60px] ${
              tabSelect == "config" ? "bg-gray-100" : "bg-white"
            } items-center px-3 cursor-pointer focus:outline-none`}
          >
            <p>ตั้งค่าตารางสอน</p>
          </button>
          <button
            disabled={!isSetTimeslot}
            onClick={() => {
              router.replace(`${path}/assign`), setTabSelect(() => "assign");
            }}
            className={`flex w-fit h-[60px] ${
              tabSelect == "assign" ? "bg-gray-100" : "bg-white"
            } items-center px-3  focus:outline-none ${
              !isSetTimeslot ? "text-gray-500" : "cursor-pointer"
            }`}
          >
            <p>มอบหมายวิชาเรียน</p>
          </button>
          <button
            disabled={!isSetTimeslot}
            onClick={() => {
              router.replace(`${path}/lock`), setTabSelect(() => "lock");
            }}
            className={`flex gap-3 w-fit h-[60px] ${
              tabSelect == "lock" ? "bg-gray-100" : "bg-white"
            } items-center px-3  focus:outline-none ${
              !isSetTimeslot ? "text-gray-500" : "cursor-pointer"
            }`}
          >
            <p>ล็อกคาบสอน</p>
          </button>
          <button
            disabled={!isSetTimeslot}
            onClick={() => {
              router.replace(`${path}/arrange/teacher-arrange`), setTabSelect(() => "arrange");
            }}
            className={`flex w-fit h-[60px] ${
              tabSelect == "arrange" ? "bg-gray-100" : "bg-white"
            } items-center px-3  focus:outline-none ${
              !isSetTimeslot ? "text-gray-500" : "cursor-pointer"
            }`}
          >
            <p>จัดตารางสอน</p>
          </button>
        </div>
      </div>
    </>
  );
}

export default Schedule;
