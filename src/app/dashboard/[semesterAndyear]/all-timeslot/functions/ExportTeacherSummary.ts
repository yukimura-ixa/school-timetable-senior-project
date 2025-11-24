import { dayOfWeekThai } from "@/models/dayofweek-thai";
import type { teacher } from "@/prisma/generated/client";
import type { Prisma } from "@/prisma/generated/client";
import ExcelJS from "exceljs";

// Type matching ClassScheduleWithSummary from repository
type ClassScheduleWithSummary = Prisma.class_scheduleGetPayload<{
  include: {
    teachers_responsibility: true;
    gradelevel: true;
    timeslot: true;
    room: true;
  };
}>;

// Type for timeslot data structure used in dashboard
interface TimeslotData {
  SlotAmount: number[];
  DayOfWeek: Array<{ Day: string; TextColor: string; BgColor: string }>;
}

export const ExportTeacherSummary = (
  timeSlotData: TimeslotData,
  teachers: teacher[],
  classData: ClassScheduleWithSummary[],
  semester: string,
  academicYear: string,
) => {
  const workbook = new ExcelJS.Workbook(); //create workbook
  const sheet = workbook.addWorksheet("รวม", {
    pageSetup: { paperSize: 9, orientation: "landscape" },
  }); //add worksheet to created workbook
  // sheet.getCell("A1").font = { bold: true,}; //set font bold to A1
  const row1 = sheet.getCell("A1");
  const rows = sheet.getRow(2); //select row2
  const row3 = sheet.getRow(3); //select row3
  const timeslotCol = [
    "",
    "",
    ...timeSlotData.DayOfWeek.flatMap(() =>
      timeSlotData.SlotAmount.map((num: number) => num),
    ),
  ]; //slot col for mon-fri
  const columns = ["ที่", "ผู้สอน"]; //col for teacher list
  rows.values = columns; //set col for teacher list
  let startMerge = 3; //initial value of day map col
  for (let i = 0; i < 5; i++) {
    //ตรงนี้จะ merge cell ในแถวที่ 2 เข้าด้วยกันโดยการ getColumn ด้วย index เพื่อเอาตัวอักษรมา เช่น sheet.getColumn(3).letter จะ = C
    //ที่นี่เราจะหาระยะห่างตามจำนวนคาบ เช่น มี 8 คาบ ต้อง merge C2 ถึง J2 ก็จะหา letter ปลายทางโดยนำ startMerge + slotLength
    //พอ merge เสร็จแล้วก็จะ getCell ที่อยู่ในระยะนั้นๆเพื่อใส่ค่าของวันลงไป
    const slotLength = timeSlotData.SlotAmount.length - 1; //ที่ -1 เพราะว่าถ้าไม่ลบมันจะไปเกยของวันอื่น
    sheet.mergeCells(
      `${sheet.getColumn(startMerge).letter}2:${
        sheet.getColumn(startMerge + slotLength).letter
      }2`,
    );
    sheet.getCell(`${sheet.getColumn(startMerge).letter}2`).value =
      timeSlotData.DayOfWeek[i]?.Day ?? "";
    startMerge += slotLength + 1;
  }
  const slotLength = timeSlotData.SlotAmount.length * 5; //find last column has value
  sheet.getCell(`${sheet.getColumn(slotLength + 3).letter}2`).value = "รวม"; //add value to last col
  row3.values = timeslotCol; // add slot map to row no. 3
  //merge cell
  sheet.mergeCells(
    `${sheet.getColumn(slotLength + 3).letter}2:${
      sheet.getColumn(slotLength + 3).letter
    }3`,
  );
  sheet.mergeCells(
    `${sheet.getColumn(1).letter}1:${sheet.getColumn(slotLength + 3).letter}1`,
  );
  sheet.mergeCells("A2:A3");
  sheet.mergeCells("B2:B3");

  //สร้าง key ของ column ขึ้นมาพร้อมกับกำหนด width ให้ col
  const keyColumn = [
    { key: "order", width: 3 },
    { key: "teacherName", width: 19 },
    ...timeSlotData.DayOfWeek.flatMap((item) =>
      timeSlotData.SlotAmount.map((num: number) => ({
        key: `${item.Day}-${num}`,
        width: 3,
      })),
    ),
    { key: "result", width: 3 },
  ];
  sheet.columns = keyColumn;
  const unLockObject = (
    obj: Record<string, string>[],
    dataCount: number,
  ): Record<string, string> => {
    //from [{"mon-1" : ""}, {"mon-2" : ""}] to {"mon-1" : "", "mon-2" : ""} จะเอาไป spread ใน jsonData ถ้าไม่คัดแบบนี้จะเป็น object ซ้อน object
    let a: Record<string, string> = {};
    for (let i = 0; i < dataCount; i++) {
      a = { ...a, ...obj[i] };
    }
    return a;
  };
  const findResult = (tID: number): number => {
    const filter1 = classData.filter((item: ClassScheduleWithSummary) =>
      item.teachers_responsibility
        .map((tid: { TeacherID: number }) => tid.TeacherID)
        .includes(tID),
    );
    const filter2 = filter1.filter(
      (cid: ClassScheduleWithSummary, _index: number) =>
        filter1.findIndex(
          (item: ClassScheduleWithSummary) =>
            item.TimeslotID === cid.TimeslotID,
        ) === _index,
    );
    return filter2.length;
  };
  const jsonData: any[] = [
    ...teachers.map((tch: teacher, index: number) => {
      const mapKey = timeSlotData.DayOfWeek.flatMap((day) =>
        timeSlotData.SlotAmount.map((num: number) => {
          const filterClass = classData.filter(
            (item: ClassScheduleWithSummary) =>
              item.teachers_responsibility
                .map((tid: { TeacherID: number }) => tid.TeacherID)
                .includes(tch.TeacherID) &&
              dayOfWeekThai[item.timeslot.DayOfWeek] === day.Day &&
              parseInt(item.timeslot.TimeslotID.substring(10)) === num,
          );
          const obj: Record<string, string> = {};
          const keyname = `${day.Day}-${num}`;
          const convertClass = filterClass
            .map(
              (item: ClassScheduleWithSummary) =>
                `${item.GradeID[0]}/${item.GradeID[2]}`,
            )
            .join(",");
          const firstClass = filterClass[0];
          const res =
            filterClass.length === 0
              ? ""
              : firstClass?.IsLocked
                ? `${firstClass.SubjectCode}`
                : `${convertClass}`;
          obj[keyname] = filterClass.length === 0 ? "" : res;
          return obj;
        }),
      );
      return {
        order: index + 1,
        teacherName: `${tch.Prefix}${tch.Firstname} ${tch.Lastname}`,
        ...unLockObject(mapKey, mapKey.length),
        result: findResult(tch.TeacherID),
      };
    }),
  ];
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
    row.font = {
      name: "TH SarabunPSK",
      size: rowNumber === 1 ? 16 : 12,
      bold: true,
    };
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
  void workbook.xlsx.writeBuffer().then((data) => {
    const blob = new Blob([data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheet.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "รวม.xlsx";
    anchor.click();
    window.URL.revokeObjectURL(url);
  });
};
