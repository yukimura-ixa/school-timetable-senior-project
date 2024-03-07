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
  // TODO: คาบล็อกแสดงเป็นตัวอักษรสีแดง
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
  const excelTableExport = () => {
    // row.getCell(colNumber).border = {
    //   top: { style: "thin" },
    //   left: { style: "thin" },
    //   bottom: { style: "thin" },
    //   right: { style: "thin" },
    // };
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("My Sheet", {pageSetup :{paperSize: 9, orientation:'landscape'}}); //add worksheet to created workbook
    const generateTableHead = [
      "ชั่วโมงที่",
      ...timeSlotData.SlotAmount.map((item) => item),
    ];
    const alignCell = (v:string, h:string): object => {
      return {
        vertical: v,
        horizontal: h,
      };
    }
    let slotLength = timeSlotData.SlotAmount.length+1
    let tableRow = { start: 1, end: 20 };
    let keepCellRow = []
    let keepCellCol = []
    let keepLastRowLine = []
    //Brute force แบบ 300%
    for (let i = 0; i < allTeacher.data.length; i++) {
      let tch = allTeacher.data[i];
      for (let j = tableRow.start; j <= tableRow.end; j++) {
        if (j == tableRow.start) {
          const rowAfirst = sheet.getCell(`A${tableRow.start}`);
          const rowEfirst = sheet.getCell(`E${tableRow.start}`);
          rowAfirst.alignment = alignCell("middle", "left")
          rowEfirst.alignment = alignCell("middle", "left")
          rowAfirst.value = `ตารางสอน ${tch.Prefix}${tch.Firstname} ${tch.Lastname}`;
          rowEfirst.value = `ภาคเรียนที่ ${semester}/${academicYear}`;
        } else if (j == tableRow.start + 1) {
          const row = sheet.getRow(tableRow.start + 1);
          row.alignment = alignCell("middle", "center")
          row.values = generateTableHead;
          keepCellRow.push(tableRow.start + 1)
        } else if (j == tableRow.start + 2) {
          const row = sheet.getRow(tableRow.start + 2);
          row.alignment = alignCell("middle", "center")
          row.values = ["วัน / เวลา", ...timeSlotData.SlotAmount.map(item => "")];
          keepCellCol.push(tableRow.start + 2)
        } else if (j == tableRow.start + 3) {
          const row = sheet.getRow(tableRow.start + 3);
          row.alignment = alignCell("middle", "center")
          row.values = ["", ...timeSlotData.SlotAmount.map(item => "")];
          keepCellRow.push(tableRow.start + 3)
        } else if (j == tableRow.start + 4) {
          const row = sheet.getRow(tableRow.start + 4);
          row.alignment = alignCell("middle", "center")
          row.values = ["จันทร์", ...timeSlotData.SlotAmount.map(item => "")];
          keepCellCol.push(tableRow.start + 4)
        } else if (j == tableRow.start + 5) {
          const row = sheet.getRow(tableRow.start + 5);
          row.alignment = alignCell("middle", "center")
          row.values = ["", ...timeSlotData.SlotAmount.map(item => "")];
          keepCellCol.push(tableRow.start + 5)
        } else if (j == tableRow.start + 6) {
          const row = sheet.getRow(tableRow.start + 6);
          row.alignment = alignCell("middle", "center")
          row.values = ["", ...timeSlotData.SlotAmount.map(item => "")];
          keepCellRow.push(tableRow.start + 6)
        } else if (j == tableRow.start + 7) {
          const row = sheet.getRow(tableRow.start + 7);
          row.alignment = alignCell("middle", "center")
          row.values = ["อังคาร", ...timeSlotData.SlotAmount.map(item => "")];
          keepCellCol.push(tableRow.start + 7)
        } else if (j == tableRow.start + 8) {
          const row = sheet.getRow(tableRow.start + 8);
          row.alignment = alignCell("middle", "center")
          row.values = ["", ...timeSlotData.SlotAmount.map(item => "")];
          keepCellCol.push(tableRow.start + 8)
        } else if (j == tableRow.start + 9) {
          const row = sheet.getRow(tableRow.start + 9);
          row.alignment = alignCell("middle", "center")
          row.values = ["", ...timeSlotData.SlotAmount.map(item => "")];
          keepCellRow.push(tableRow.start + 9)
        } else if (j == tableRow.start + 10) {
          const row = sheet.getRow(tableRow.start + 10);
          row.alignment = alignCell("middle", "center")
          row.values = ["พุธ", ...timeSlotData.SlotAmount.map(item => "")];
          keepCellCol.push(tableRow.start + 10)
        } else if (j == tableRow.start + 11) {
          const row = sheet.getRow(tableRow.start + 11);
          row.alignment = alignCell("middle", "center")
          row.values = ["", ...timeSlotData.SlotAmount.map(item => "")];
          keepCellCol.push(tableRow.start + 11)
        } else if (j == tableRow.start + 12) {
          const row = sheet.getRow(tableRow.start + 12);
          row.alignment = alignCell("middle", "center")
          row.values = ["", ...timeSlotData.SlotAmount.map(item => "")];
          keepCellRow.push(tableRow.start + 12)
        } else if (j == tableRow.start + 13) {
          const row = sheet.getRow(tableRow.start + 13);
          row.alignment = alignCell("middle", "center")
          row.values = ["พฤหัสบดี", ...timeSlotData.SlotAmount.map(item => "")];
          keepCellCol.push(tableRow.start + 13)
        } else if (j == tableRow.start + 14) {
          const row = sheet.getRow(tableRow.start + 14);
          row.alignment = alignCell("middle", "center")
          row.values = ["", ...timeSlotData.SlotAmount.map(item => "")];
          keepCellCol.push(tableRow.start + 14)
        } else if (j == tableRow.start + 15) {
          const row = sheet.getRow(tableRow.start + 15);
          row.alignment = alignCell("middle", "center")
          row.values = ["", ...timeSlotData.SlotAmount.map(item => "")];
          keepCellRow.push(tableRow.start + 15)
        } else if (j == tableRow.start + 16) {
          const row = sheet.getRow(tableRow.start + 16);
          row.alignment = alignCell("middle", "center")
          row.values = ["ศุกร์", ...timeSlotData.SlotAmount.map(item => "")];
          keepCellCol.push(tableRow.start + 16)
        } else if (j == tableRow.start + 17) {
          const row = sheet.getRow(tableRow.start + 17);
          row.alignment = alignCell("middle", "center")
          row.values = ["", ...timeSlotData.SlotAmount.map(item => "")];
          keepCellCol.push(tableRow.start + 17)
          keepLastRowLine.push(tableRow.start + 17)
        } else if (j == tableRow.start + 18) {
          const row = sheet.getRow(tableRow.start + 18);
          row.alignment = alignCell("middle", "center")
          row.values = ["", ...timeSlotData.SlotAmount.map(item => "")];
        }else if (j == tableRow.end) {
          const rowlast = sheet.getCell(`B${tableRow.end}`);
          rowlast.alignment = {
            vertical: "middle",
            horizontal: "left",
          };
          rowlast.value = `ลงชื่อ..........................................รองผอ.วิชาการ  ลงชื่อ..........................................ผู้อำนวยการ`;
        }
      }
      tableRow = { start: tableRow.start + 22, end: tableRow.end + 22 };
    }
    // console.log(keepCellRow)
    sheet.eachRow(function (row, rowNumber) {
        if(keepCellRow.includes(rowNumber)){
          row.eachCell(function (cell, colNumber) {
            if(colNumber == 1){
              row.getCell(colNumber).border = {
                top: { style: "thin" },
                right: { style: "thin" },
                left: { style: "thin" },
              };
            }
            else if(colNumber <= slotLength){
              row.getCell(colNumber).border = {
                top: { style: "thin" },
                right: { style: "thin" },
              };
            }
          });
        }
        if(keepCellCol.includes(rowNumber)){
          row.eachCell(function (cell, colNumber) {
            if(colNumber == 1){
              row.getCell(colNumber).border = {
                right: { style: "thin" },
                left: { style: "thin" },
              };
            }
            else if(colNumber <= slotLength){
              row.getCell(colNumber).border = {
                right: { style: "thin" },
              };
            }
          });
        }
        if(keepLastRowLine.includes(rowNumber)){
          row.eachCell(function (cell, colNumber) {
            if(colNumber == 1){
              row.getCell(colNumber).border = {
                bottom: { style: "thin" },
                right: { style: "thin" },
                left: { style: "thin" },
              };
            }
            else if(colNumber <= slotLength){
              row.getCell(colNumber).border = {
                bottom: { style: "thin" },
                right: { style: "thin" },
              };
            }
          });
        }
    });
    sheet.eachRow(function (row, rowNumber) {
      row.font = { name: "TH SarabunPSK", size: 14 };
      row.height = 16.5;
      // row.eachCell(function (cell, colNumber) {
      //   // if (colNumber >= 3 && colNumber <= slotLength + 3)
      //   //   cell.alignment = {
      //   //     vertical: "middle",
      //   //     horizontal: "center",
      //   //   };
      //   if (rowNumber == tableRow.start) {
      //     row.getCell(colNumber).border = {
      //       top: { style: "thin" },
      //       // left: { style: "thin" },
      //       // bottom: { style: "thin" },
      //       // right: { style: "thin" },
      //     };
      //   }
      // });
    });

    workbook.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheet.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      (anchor.href = url), (anchor.download = "ตารางครู.xlsx");
      anchor.click();
      window.URL.revokeObjectURL(url);
    });
  };
  const excelExport = () => {
    const workbook = new ExcelJS.Workbook(); //create workbook
    const sheet = workbook.addWorksheet("รวม", {
      pageSetup:{paperSize: 9, orientation:'landscape'}
    }); //add worksheet to created workbook
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
      { key: "order", width: 3 },
      { key: "teacherName", width: 19 },
      ...timeSlotData.DayOfWeek.flatMap((item) =>
        timeSlotData.SlotAmount.map((num) => ({
          key: `${item.Day}-${num}`,
          width: 2.29,
        })),
      ),
      { key: "result", width: 3 },
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
      row.font = { name: "TH SarabunPSK", size: 12 };
      row.height = 15;
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
      (anchor.href = url), (anchor.download = "รวม.xlsx");
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
        <div className="flex gap-3">
          <PrimaryButton
            handleClick={excelExport}
            title={"นำตารางรวมออก"}
            color={"secondary"}
            Icon={undefined}
            reverseIcon={false}
            isDisabled={false}
          />
          <PrimaryButton
            handleClick={excelTableExport}
            title={"นำตารางสอนออก"}
            color={"secondary"}
            Icon={undefined}
            reverseIcon={false}
            isDisabled={false}
          />
        </div>
        <div className="w-full flex justify-end items-center gap-3 mt-3 cursor-default">
          <div
            onClick={() => console.log(classData)}
            className="w-[75px] h-[35px] border rounded p-2 flex gap-1 items-center justify-start"
          >
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
