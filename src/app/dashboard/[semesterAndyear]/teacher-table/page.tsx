"use client";
import { useParams, usePathname, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import TimeSlot from "./component/Timeslot";
import SelectTeacher from "./component/SelectTeacher";
import { fetcher } from "@/libs/axios";
import { dayOfWeekTextColor } from "@/models/dayofWeek-textColor";
import { dayOfWeekColor } from "@/models/dayofweek-color";
import { dayOfWeekThai } from "@/models/dayofweek-thai";
import useSWR from "swr";
import Loading from "@/app/loading";
import PrimaryButton from "@/components/elements/static/PrimaryButton";
import { ExportTeacherTable } from "../all-timeslot/functions/ExportTeacherTable";
import { useReactToPrint } from "react-to-print";
type Props = {};

function page({}: Props) {
  // TODO: เช็คคาบพัก
  const params = useParams();
  const [semester, academicYear] = (params.semesterAndyear as string).split(
    "-",
  ); //from "1-2566" to ["1", "2566"]
  const [searchTeacherID, setSearchTeacherID] = useState(null);
  const [timeSlotData, setTimeSlotData] = useState({
    AllData: [], //ใช้กับตารางด้านล่าง
    SlotAmount: [],
    DayOfWeek: [],
    BreakSlot: [],
  });
  const [classData, setClassData] = useState([]);
  const fetchAllClassData = useSWR(
    () =>
      !!searchTeacherID &&
      `/class?AcademicYear=${academicYear}&Semester=SEMESTER_${semester}&TeacherID=${searchTeacherID}`,
    fetcher,
    { revalidateOnFocus: false },
  );
  const fetchTimeSlot = useSWR(
    () =>
      `/timeslot?AcademicYear=` +
      academicYear +
      `&Semester=SEMESTER_` +
      semester,
    fetcher,
    { revalidateOnFocus: false },
  );
  function fetchTimeslotData() {
    if (!fetchTimeSlot.isValidating) {
      let data = fetchTimeSlot.data;
      let dayofweek = data
        .map((day) => day.DayOfWeek)
        .filter(
          (item, index) =>
            data.map((day) => day.DayOfWeek).indexOf(item) === index,
        )
        .map((item) => ({
          Day: dayOfWeekThai[item],
          TextColor: dayOfWeekTextColor[item],
          BgColor: dayOfWeekColor[item],
        })); //filter เอาตัวซ้ำออก ['MON', 'MON', 'TUE', 'TUE'] => ['MON', 'TUE'] แล้วก็ map เป็นชุดข้อมูล object
      let breakTime = data
        .filter(
          (item) =>
            (item.Breaktime == "BREAK_BOTH" ||
              item.Breaktime == "BREAK_JUNIOR" ||
              item.Breaktime == "BREAK_SENIOR") &&
            item.DayOfWeek == "MON", //filter ข้อมูลตัวอย่างเป้นวันจันทร์ เพราะข้อมูลเหมือนกันหมด
        )
        .map((item) => ({
          TimeslotID: item.TimeslotID,
          Breaktime: item.Breaktime,
          SlotNumber: parseInt(item.TimeslotID.substring(10)),
        })); //เงื่อนไขที่ใส่คือเอาคาบพักออกมา
      let slotAmount = data
        .filter((item) => item.DayOfWeek == "MON") //filter ข้อมูลตัวอย่างเป้นวันจันทร์ เพราะข้อมูลเหมือนกันหมด
        .map((item, index) => index + 1); //ใช้สำหรับ map หัวตารางในเว็บ จะ map จาก data เป็น number of array => [1, 2, 3, 4, 5, 6, 7]
      setTimeSlotData(() => ({
        AllData: data.map((data) => ({ ...data, subject: {} })),
        SlotAmount: slotAmount,
        DayOfWeek: dayofweek,
        BreakSlot: breakTime,
      }));
    }
  }
  function fetchClassData() {
    if (!fetchAllClassData.isValidating && !!searchTeacherID) {
      const data = fetchAllClassData.data;
      setTimeSlotData(() => ({
        ...timeSlotData,
        AllData: timeSlotData.AllData.map((item) => ({
          ...item,
          subject: data.map((id) => id.TimeslotID).includes(item.TimeslotID)
            ? data.filter((id) => id.TimeslotID == item.TimeslotID)[0]
            : {},
        })),
      }));
      setClassData(data);
    }
  }
  useEffect(() => {
    if (!fetchTimeSlot.isLoading) {
      fetchTimeslotData();
    }
    if (!fetchAllClassData.isLoading && !!searchTeacherID) {
      fetchClassData();
    }
  }, [fetchTimeSlot.isLoading, fetchAllClassData.isLoading]);
  const setTeacherID = (id: number) => {
    setSearchTeacherID(id);
  };
  const fetchTeacherDatabyID = useSWR(
    //ข้อมูลหลักที่ fetch มาจาก api
    () => !!searchTeacherID && `/teacher?TeacherID=` + searchTeacherID,
    fetcher,
  );
  const ref = useRef<HTMLDivElement>();
  const generatePDF = useReactToPrint({
    content: () => ref.current,
    documentTitle: "ตารางสอน",
    // onAfterPrint : () => alert("เรียบร้อย")
  });
  const [isPDFExport, setIsPDFExport] = useState(false);
  const ExportToPDF = () => {
    setIsPDFExport(true);
    setTimeout(() => {
      generatePDF();
      setIsPDFExport(false);
    }, 1);
  };
  return (
    <>
      <div className="flex flex-col gap-3">
        {fetchTeacherDatabyID.isLoading || fetchTimeSlot.isLoading || fetchAllClassData.isLoading ? (
          <Loading />
        ) : (
          <>
            <SelectTeacher
              setTeacherID={setTeacherID}
              currentTeacher={fetchTeacherDatabyID.data}
            />
            {!!searchTeacherID && (
              <>
                <div className="flex w-full gap-3 justify-end">
                  <PrimaryButton
                    handleClick={() => {
                      ExportTeacherTable(
                        timeSlotData,
                        [fetchTeacherDatabyID.data],
                        classData,
                        semester,
                        academicYear,
                      );
                    }}
                    title={"นำออกเป็น Excel"}
                    color={""}
                    Icon={undefined}
                    reverseIcon={false}
                    isDisabled={fetchAllClassData.isLoading}
                  />
                  <PrimaryButton
                    handleClick={ExportToPDF}
                    title={"นำออกเป็น PDF"}
                    color={""}
                    Icon={undefined}
                    reverseIcon={false}
                    isDisabled={fetchAllClassData.isLoading}
                  />
                </div>
                <TimeSlot timeSlotData={timeSlotData} />
                <div
                  ref={ref}
                  className="p-10 flex flex-col items-center justify-center mt-5"
                  style={{ display: isPDFExport ? "flex" : "none" }}
                >
                  <div className="flex gap-10 mb-8">
                    <p>
                      ตารางสอน{" "}
                      {`${fetchTeacherDatabyID.data.Prefix}${fetchTeacherDatabyID.data.Firstname} ${fetchTeacherDatabyID.data.Lastname}`}
                    </p>
                    <p>ภาคเรียนที่ {`${semester}/${academicYear}`}</p>
                  </div>
                  <TimeSlot timeSlotData={timeSlotData} />
                  <div className="flex gap-2 mt-8">
                    <p>ลงชื่อ..............................รองผอ.วิชาการ</p>
                    <p>ลงชื่อ..............................ผู้อำนวยการ</p>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default page;
