"use client";
import { useTeacherData } from "@/app/_hooks/teacherData";
import { fetcher } from "@/libs/axios";
import { dayOfWeekTextColor } from "@/models/dayofWeek-textColor";
import { dayOfWeekColor } from "@/models/dayofweek-color";
import { dayOfWeekThai } from "@/models/dayofweek-thai";
import { useParams, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import useSWR from "swr";
import TableHead from "./component/TableHead";
import TableBody from "./component/TableBody";
import TeacherList from "./component/TeacherList";
import HeightIcon from "@mui/icons-material/Height";
import PrimaryButton from "@/components/elements/static/PrimaryButton";
import ExcelJS from "exceljs";
import TableResult from "./component/TableResult";
const AllTimeslot = () => {
  const params = useParams();
  const [semester, academicYear] = (params.semesterAndyear as string).split(
    "-",
  ); //from "1-2566" to ["1", "2566"]
  const allTeacher = useTeacherData();
  const [timeSlotData, setTimeSlotData] = useState({
    AllData: [], //ใช้กับตารางด้านล่าง
    SlotAmount: [],
    DayOfWeek: [],
  });
  const [classData, setClassData] = useState([]);
  const fetchTimeSlot = useSWR(
    () =>
      `/timeslot?AcademicYear=` +
      academicYear +
      `&Semester=SEMESTER_` +
      semester,
    fetcher,
    { revalidateOnFocus: false },
  );
  const fetchAllClassData = useSWR(
    () =>
      `/class/summary?AcademicYear=` +
      academicYear +
      `&Semester=SEMESTER_` +
      semester,
    fetcher,
    { revalidateOnFocus: false },
  );
  const excelExport = () => {
    const workbook = new ExcelJS.Workbook(); //create workbook
    const sheet = workbook.addWorksheet("My Sheet"); //add worksheet to created workbook
    // sheet.getCell("A1").font = { bold: true,}; //set font bold to A1
    const row1 = sheet.getCell("A1");
    const rows = sheet.getRow(2); //select row2
    const row3 = sheet.getRow(3); //select row3
    const timeslotCol = [
      "",
      "",
      ...timeSlotData.DayOfWeek.flatMap((item) =>
        timeSlotData.SlotAmount.map((num) => num),
      ),
    ]; //slot col for mon-fri
    const columns = ["ที่", "ผู้สอน"]; //col for teacher list
    rows.values = columns; //set col for teacher list
    let startMerge = 3; //initial value of day map col
    for (let i = 0; i < 5; i++) {
      //ตรงนี้จะ merge cell ในแถวที่ 2 เข้าด้วยกันโดยการ getColumn ด้วย index เพื่อเอาตัวอักษรมา เช่น sheet.getColumn(3).letter จะ = C
      //ที่นี่เราจะหาระยะห่างตามจำนวนคาบ เช่น มี 8 คาบ ต้อง merge C2 ถึง J2 ก็จะหา letter ปลายทางโดยนำ startMerge + slotLength
      //พอ merge เสร็จแล้วก็จะ getCell ที่อยู่ในระยะนั้นๆเพื่อใส่ค่าของวันลงไป
      let slotLength = timeSlotData.SlotAmount.length - 1; //ที่ -1 เพราะว่าถ้าไม่ลบมันจะไปเกยของวันอื่น
      sheet.mergeCells(
        `${sheet.getColumn(startMerge).letter}2:${
          sheet.getColumn(startMerge + slotLength).letter
        }2`,
      );
      sheet.getCell(`${sheet.getColumn(startMerge).letter}2`).value =
        timeSlotData.DayOfWeek[i].Day;
      startMerge += slotLength + 1;
    }
    let slotLength = timeSlotData.SlotAmount.length * 5; //find last column has value
    sheet.getCell(`${sheet.getColumn(slotLength + 3).letter}2`).value = "รวม"; //add value to last col
    row3.values = timeslotCol; // add slot map to row no. 3
    //merge cell
    sheet.mergeCells(
      `${sheet.getColumn(slotLength + 3).letter}2:${
        sheet.getColumn(slotLength + 3).letter
      }3`,
    );
    sheet.mergeCells(
      `${sheet.getColumn(1).letter}1:${
        sheet.getColumn(slotLength + 3).letter
      }1`,
    );
    sheet.mergeCells("A2:A3");
    sheet.mergeCells("B2:B3");

    //สร้าง key ของ column ขึ้นมาพร้อมกับกำหนด width ให้ col
    const keyColumn = [
      { key: "order", width: 5 },
      { key: "teacherName", width: 35 },
      ...timeSlotData.DayOfWeek.flatMap((item) =>
        timeSlotData.SlotAmount.map((num) => ({
          key: `${item.Day}-${num}`,
          width: 12,
        })),
      ),
      { key: "result", width: 5 },
    ];
    sheet.columns = keyColumn;
    console.log(keyColumn);
    const unLockObject = (obj, dataCount) => {
      //from [{"mon-1" : ""}, {"mon-2" : ""}] to {"mon-1" : "", "mon-2" : ""} จะเอาไป spread ใน jsonData ถ้าไม่คัดแบบนี้จะเป็น object ซ้อน object
      let a = {};
      for (let i = 0; i < dataCount; i++) {
        a = { ...a, ...obj[i] };
      }
      return a;
    };
    const convertClass = (GradeID: string) => {
      return `${GradeID[0]}/${GradeID.substring(2)}`;
    };
    const jsonData = [
      ...allTeacher.data.map((tch, index) => {
        let mapKey = timeSlotData.DayOfWeek.flatMap((day) =>
          timeSlotData.SlotAmount.flatMap((num) => {
            let filterClass = classData.filter(
              (item) =>
                item.subject.teachers_responsibility
                  .map((tid) => tid.TeacherID)
                  .includes(tch.TeacherID) &&
                dayOfWeekThai[item.timeslot.DayOfWeek] == day.Day &&
                parseInt(item.timeslot.TimeslotID.substring(10)) == num,
            );
            let obj = {};
            let keyname = `${day.Day}-${num}`;
            obj[keyname] =
              filterClass.length == 0
                ? ""
                : `${convertClass(filterClass[0].GradeID)} ${
                    filterClass[0].SubjectCode
                  }`;
            return obj;
          }),
        );
        return {
          order: index + 1,
          teacherName: `${tch.Prefix}${tch.Firstname} ${tch.Lastname}`,
          ...unLockObject(mapKey, mapKey.length),
          result: classData.filter((item) =>
            item.subject.teachers_responsibility
              .map((tid) => tid.TeacherID)
              .includes(tch.TeacherID),
          ).length,
        };
      }),
    ];
    console.log(jsonData);
    sheet.addRows(jsonData, "i");
    rows.eachCell(function (cell) {
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
      };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "fff9fb97" },
        bgColor: { argb: "fff9fb97" },
      };
    });
    row3.eachCell(function (cell) {
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
      };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "fff9fb97" },
        bgColor: { argb: "fff9fb97" },
      };
    });
    sheet.eachRow(function (row, rowNumber) {
      row.font = { name: "TH SarabunPSK", size: rowNumber == 1 ? 18 : 14 };
      row.height = rowNumber == 1 ? 30 : rowNumber >= 3 ? 25 : 20;
      row.eachCell(function (cell, colNumber) {
        if (colNumber >= 3 && colNumber <= slotLength + 3)
          cell.alignment = {
            vertical: "middle",
            horizontal: "center",
          };
        if (rowNumber >= 1) {
          row.getCell(colNumber).border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        }
      });
    });
    row1.value = `ตารางรวม ภาคเรียนที่ ${semester} ปีการศึกษา ${academicYear}`;
    /* The commented code block you provided is attempting to write the Excel workbook data to a buffer,
create a Blob from that data, and then generate a download link for the user to download the Excel
file. Here is a breakdown of the steps: */
    workbook.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheet.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      (anchor.href = url), (anchor.download = "downloaxcell.xlsx");
      anchor.click();
      window.URL.revokeObjectURL(url);
    });
  };
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
      let slotAmount = data
        .filter((item) => item.DayOfWeek == "MON") //filter ข้อมูลตัวอย่างเป้นวันจันทร์ เพราะข้อมูลเหมือนกันหมด
        .map((item, index) => index + 1); //ใช้สำหรับ map หัวตารางในเว็บ จะ map จาก data เป็น number of array => [1, 2, 3, 4, 5, 6, 7]
      setTimeSlotData(() => ({
        AllData: data.map((data) => ({ ...data, subject: {} })),
        SlotAmount: slotAmount,
        DayOfWeek: dayofweek,
      }));
    }
  }
  function fetchClassData() {
    if (!fetchAllClassData.isValidating) {
      const data = fetchAllClassData.data;
      setClassData(data);
    }
  }
  useEffect(() => {
    if (!fetchTimeSlot.isLoading) {
      fetchTimeslotData();
    }
    if (!fetchAllClassData.isLoading) {
      fetchClassData();
      console.log(fetchAllClassData.data);
    }
  }, [fetchTimeSlot.isLoading, fetchAllClassData.data]);
  return (
    <>
      <div className="relative w-full h-[650px] overflow-x-hidden overflow-y-scroll border rounded p-2">
        {!fetchTimeSlot.isLoading && (
          <div className="flex">
            <TeacherList teachers={allTeacher.data} />
            <div className="w-full h-full cursor-move  overflow-x-scroll">
              <table>
                <TableHead
                  days={timeSlotData.DayOfWeek}
                  slotAmount={timeSlotData.SlotAmount}
                />
                <TableBody
                  teachers={allTeacher.data}
                  classData={classData}
                  slotAmount={timeSlotData.SlotAmount}
                  days={timeSlotData.DayOfWeek}
                />
              </table>
            </div>
            <TableResult teachers={allTeacher.data} classData={classData} />
          </div>
        )}
      </div>
      <div className="w-full h-10 flex justify-between mt-3">
        <PrimaryButton
          handleClick={excelExport}
          title={"นำออกเป็น Excel"}
          color={"secondary"}
          Icon={undefined}
          reverseIcon={false}
          isDisabled={false}
        />
        <div className="w-full flex justify-end items-center gap-3 mt-3 cursor-default">
          <div className="w-[75px] h-[35px] border rounded p-2 flex gap-1 items-center justify-start">
            <p className="text-xs text-gray-400">Left Shift</p>
          </div>
          <p className="text-sm text-gray-400">+</p>
          <div className="w-[75px] h-[35px] border rounded p-2 flex gap-1 items-center justify-start">
            <p className="text-xs text-gray-400">Scroll</p>
            <HeightIcon color="action" />
          </div>
          <p className="text-sm text-gray-400">=</p>
          <p className="text-sm text-gray-400">
            เลื่อนดูเนื้อหาแนวนอน (สำหรับคอม)
          </p>
        </div>
      </div>
    </>
  );
};

export default AllTimeslot;
