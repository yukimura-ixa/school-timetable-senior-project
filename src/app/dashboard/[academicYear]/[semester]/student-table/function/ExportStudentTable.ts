import type { gradelevel, timeslot } from "@/prisma/generated/client";
import type { Prisma } from "@/prisma/generated/client";
import { formatTimeslotTimeUtc } from "@/utils/datetime";
import ExcelJS from "exceljs";

// Type matching ClassScheduleWithSummary from repository
export type ClassScheduleWithSummary = Prisma.class_scheduleGetPayload<{
  include: {
    teachers_responsibility: {
      include: {
        teacher: true;
      };
    };
    gradelevel: true;
    timeslot: true;
    room: true;
  };
}>;

// Type for timeslot data structure used in dashboard
export interface TimeslotData {
  AllData: (timeslot & {
    subject: ClassScheduleWithSummary | Record<string, never>;
  })[];
  SlotAmount: number[];
}

export const ExportStudentTable = (
  timeSlotData: TimeslotData,
  gradeLevel: gradelevel[],
  classData: ClassScheduleWithSummary[] = [],
  semester: string,
  academicYear: string,
) => {
  const grades = [...gradeLevel];
  const formatTime = formatTimeslotTimeUtc;

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("นักเรียน", {
    pageSetup: { paperSize: 9, orientation: "landscape" },
  }); //add worksheet to created workbook
  const generateTableHead = [
    "ชั่วโมงที่",
    ...timeSlotData.SlotAmount.map((item: number) => item),
  ];
  const alignCell = (v: string, h: string): object => {
    return {
      vertical: v,
      horizontal: h,
    };
  };
  const slotLength = timeSlotData.SlotAmount.length + 1; //เก็บว่ามีกี่คาบพร้อมบวกหนึ่ง จะได้จำนวนคอลัมน์จริง
  let tableRow = { start: 1, end: 31 }; //เริ่ม-จบที่ excel แถวเท่าไหร่
  //เก็บแถวที่จะต้องตีเส้นตาราง
  const keepCellRow: number[] = [];
  const keepCellCol: number[] = [];
  const keepLastRowLine: number[] = [];
  //เก็บแถวที่จะต้องตีเส้นตาราง
  const keepTimeLine: number[] = []; //เก็บแถวที่ต้องแมพเวลาลงตารางเพื่อปรับ font
  //Brute force แบบ 300%
  for (let i = 0; i < grades.length; i++) {
    const grd = grades[i]; //นำข้อมูลของครูมาใช้ในแต่ละรอบ
    if (!grd) continue; // Skip if grade is undefined

    let filterClassDataByGID: ClassScheduleWithSummary[] = [];
    if (grades.length === 1) {
      //ถ้าส่งครูเข้ามาคนเดียว (หมายถึง พิมพ์ตารางรายคน)
      filterClassDataByGID = [...classData]; //นำข้อมูลมาใช้ได้เลย
    } else {
      //ถ้าเป็นตารางรวม ต้อง filter ก่อน
      filterClassDataByGID = classData.filter(
        (item: ClassScheduleWithSummary) => item.GradeID.includes(grd.GradeID),
      );
    }
    timeSlotData = {
      ...timeSlotData,
      AllData: timeSlotData.AllData.map(
        (
          item: timeslot & {
            subject: ClassScheduleWithSummary | Record<string, never>;
          },
        ) => {
          const matchedSubject = filterClassDataByGID.find(
            (id: ClassScheduleWithSummary) => id.TimeslotID === item.TimeslotID,
          );
          return matchedSubject
            ? { ...item, subject: matchedSubject }
            : { ...item, subject: {} };
        },
      ),
    };
    for (let j = tableRow.start; j <= tableRow.end; j++) {
      //loop j คือ loop เขียนข้อมูลลงแถวในแต่ละชุด
      if (j === tableRow.start) {
        const rowAfirst = sheet.getCell(`A${tableRow.start}`);
        const rowEfirst = sheet.getCell(`E${tableRow.start}`);
        rowAfirst.alignment = alignCell("middle", "left");
        rowEfirst.alignment = alignCell("middle", "left");
        rowAfirst.value = `ตารางเรียน ชั้นมัธยมศึกษาปีที่ ${grd.Year}/${grd.Number}`;
        rowEfirst.value = `ภาคเรียนที่ ${semester}/${academicYear}`;
      } else if (j === tableRow.start + 1) {
        const row = sheet.getRow(tableRow.start + 1);
        row.alignment = alignCell("middle", "center");
        row.values = generateTableHead;
        keepCellRow.push(tableRow.start + 1);
      } else if (j === tableRow.start + 2) {
        const row = sheet.getRow(tableRow.start + 2);
        row.alignment = alignCell("middle", "center");
        row.values = [
          "วัน / เวลา",
          ...timeSlotData.AllData.filter(
            (item) => item.DayOfWeek === "MON",
          ).map(
            (item) =>
              `${formatTime(item.StartTime)}-${formatTime(item.EndTime)}`,
          ),
        ];
        keepCellCol.push(tableRow.start + 2);
        keepTimeLine.push(tableRow.start + 2);
      } else if (j === tableRow.start + 3) {
        const row = sheet.getRow(tableRow.start + 3);
        row.alignment = alignCell("middle", "center");
        row.values = [
          "",
          ...timeSlotData.AllData.filter(
            (item) => item.DayOfWeek === "MON",
          ).map((item) =>
            Object.keys(item.subject).length !== 0
              ? item.subject.SubjectCode
              : "",
          ),
        ];
        keepCellRow.push(tableRow.start + 3);
      } else if (j === tableRow.start + 4) {
        const row = sheet.getRow(tableRow.start + 4);
        row.alignment = alignCell("middle", "center");
        row.values = [
          "จันทร์",
          ...timeSlotData.AllData.filter(
            (item) => item.DayOfWeek === "MON",
          ).map((item) =>
            item.Breaktime === "BREAK_BOTH"
              ? "พักกลางวัน"
              : Object.keys(item.subject).length === 0
                ? ""
                : (item.subject as ClassScheduleWithSummary).IsLocked
                  ? ""
                  : `${(item.subject as ClassScheduleWithSummary).teachers_responsibility[0]?.teacher?.Firstname ?? ""}`,
          ),
        ];
        keepCellCol.push(tableRow.start + 4);
      } else if (j === tableRow.start + 5) {
        const row = sheet.getRow(tableRow.start + 5);
        row.alignment = alignCell("middle", "center");
        row.values = [
          "",
          ...timeSlotData.AllData.filter(
            (item) => item.DayOfWeek === "MON",
          ).map((item) =>
            Object.keys(item.subject).length !== 0
              ? (item.subject.room?.RoomName ?? "")
              : "",
          ),
        ];
        keepCellCol.push(tableRow.start + 5);
      } else if (j === tableRow.start + 6) {
        const row = sheet.getRow(tableRow.start + 6);
        row.alignment = alignCell("middle", "center");
        row.values = [
          "",
          ...timeSlotData.AllData.filter(
            (item) => item.DayOfWeek === "TUE",
          ).map((item) =>
            Object.keys(item.subject).length !== 0
              ? item.subject.SubjectCode
              : "",
          ),
        ];
        keepCellRow.push(tableRow.start + 6);
      } else if (j === tableRow.start + 7) {
        const row = sheet.getRow(tableRow.start + 7);
        row.alignment = alignCell("middle", "center");
        row.values = [
          "อังคาร",
          ...timeSlotData.AllData.filter(
            (item) => item.DayOfWeek === "TUE",
          ).map((item) =>
            item.Breaktime === "BREAK_BOTH"
              ? "พักกลางวัน"
              : Object.keys(item.subject).length === 0
                ? ""
                : (item.subject as ClassScheduleWithSummary).IsLocked
                  ? ""
                  : `${(item.subject as ClassScheduleWithSummary).teachers_responsibility[0]?.teacher?.Firstname ?? ""}`,
          ),
        ];
        keepCellCol.push(tableRow.start + 7);
      } else if (j === tableRow.start + 8) {
        const row = sheet.getRow(tableRow.start + 8);
        row.alignment = alignCell("middle", "center");
        row.values = [
          "",
          ...timeSlotData.AllData.filter(
            (item) => item.DayOfWeek === "TUE",
          ).map((item) =>
            Object.keys(item.subject).length !== 0
              ? (item.subject.room?.RoomName ?? "")
              : "",
          ),
        ];
        keepCellCol.push(tableRow.start + 8);
      } else if (j === tableRow.start + 9) {
        const row = sheet.getRow(tableRow.start + 9);
        row.alignment = alignCell("middle", "center");
        row.values = [
          "",
          ...timeSlotData.AllData.filter(
            (item) => item.DayOfWeek === "WED",
          ).map((item) =>
            Object.keys(item.subject).length !== 0
              ? item.subject.SubjectCode
              : "",
          ),
        ];
        keepCellRow.push(tableRow.start + 9);
      } else if (j === tableRow.start + 10) {
        const row = sheet.getRow(tableRow.start + 10);
        row.alignment = alignCell("middle", "center");
        row.values = [
          "พุธ",
          ...timeSlotData.AllData.filter(
            (item) => item.DayOfWeek === "WED",
          ).map((item) =>
            item.Breaktime === "BREAK_BOTH"
              ? "พักกลางวัน"
              : Object.keys(item.subject).length === 0
                ? ""
                : (item.subject as ClassScheduleWithSummary).IsLocked
                  ? ""
                  : `${(item.subject as ClassScheduleWithSummary).teachers_responsibility[0]?.teacher?.Firstname ?? ""}`,
          ),
        ];
        keepCellCol.push(tableRow.start + 10);
      } else if (j === tableRow.start + 11) {
        const row = sheet.getRow(tableRow.start + 11);
        row.alignment = alignCell("middle", "center");
        row.values = [
          "",
          ...timeSlotData.AllData.filter(
            (item) => item.DayOfWeek === "WED",
          ).map((item) =>
            Object.keys(item.subject).length !== 0
              ? (item.subject.room?.RoomName ?? "")
              : "",
          ),
        ];
        keepCellCol.push(tableRow.start + 11);
      } else if (j === tableRow.start + 12) {
        const row = sheet.getRow(tableRow.start + 12);
        row.alignment = alignCell("middle", "center");
        row.values = [
          "",
          ...timeSlotData.AllData.filter(
            (item) => item.DayOfWeek === "THU",
          ).map((item) =>
            Object.keys(item.subject).length !== 0
              ? item.subject.SubjectCode
              : "",
          ),
        ];
        keepCellRow.push(tableRow.start + 12);
      } else if (j === tableRow.start + 13) {
        const row = sheet.getRow(tableRow.start + 13);
        row.alignment = alignCell("middle", "center");
        row.values = [
          "พฤหัสบดี",
          ...timeSlotData.AllData.filter(
            (item) => item.DayOfWeek === "THU",
          ).map((item) =>
            item.Breaktime === "BREAK_BOTH"
              ? "พักกลางวัน"
              : Object.keys(item.subject).length === 0
                ? ""
                : (item.subject as ClassScheduleWithSummary).IsLocked
                  ? ""
                  : `${(item.subject as ClassScheduleWithSummary).teachers_responsibility[0]?.teacher?.Firstname ?? ""}`,
          ),
        ];
        keepCellCol.push(tableRow.start + 13);
      } else if (j === tableRow.start + 14) {
        const row = sheet.getRow(tableRow.start + 14);
        row.alignment = alignCell("middle", "center");
        row.values = [
          "",
          ...timeSlotData.AllData.filter(
            (item) => item.DayOfWeek === "THU",
          ).map((item) =>
            Object.keys(item.subject).length !== 0
              ? (item.subject.room?.RoomName ?? "")
              : "",
          ),
        ];
        keepCellCol.push(tableRow.start + 14);
      } else if (j === tableRow.start + 15) {
        const row = sheet.getRow(tableRow.start + 15);
        row.alignment = alignCell("middle", "center");
        row.values = [
          "",
          ...timeSlotData.AllData.filter(
            (item) => item.DayOfWeek === "FRI",
          ).map((item) =>
            Object.keys(item.subject).length !== 0
              ? item.subject.SubjectCode
              : "",
          ),
        ];
        keepCellRow.push(tableRow.start + 15);
      } else if (j === tableRow.start + 16) {
        const row = sheet.getRow(tableRow.start + 16);
        row.alignment = alignCell("middle", "center");
        row.values = [
          "ศุกร์",
          ...timeSlotData.AllData.filter(
            (item) => item.DayOfWeek === "FRI",
          ).map((item) =>
            item.Breaktime === "BREAK_BOTH"
              ? "พักกลางวัน"
              : Object.keys(item.subject).length === 0
                ? ""
                : (item.subject as ClassScheduleWithSummary).IsLocked
                  ? ""
                  : `${(item.subject as ClassScheduleWithSummary).teachers_responsibility[0]?.teacher?.Firstname ?? ""}`,
          ),
        ];
        keepCellCol.push(tableRow.start + 16);
      } else if (j === tableRow.start + 17) {
        const row = sheet.getRow(tableRow.start + 17);
        row.alignment = alignCell("middle", "center");
        row.values = [
          "",
          ...timeSlotData.AllData.filter(
            (item) => item.DayOfWeek === "FRI",
          ).map((item) =>
            Object.keys(item.subject).length !== 0
              ? (item.subject.room?.RoomName ?? "")
              : "",
          ),
        ];
        keepCellCol.push(tableRow.start + 17);
        keepLastRowLine.push(tableRow.start + 17);
      } else if (j === tableRow.start + 18) {
        const row = sheet.getRow(tableRow.start + 18);
        row.alignment = alignCell("middle", "center");
        row.values = ["", ...timeSlotData.AllData.map(() => "")];
      } else if (j === tableRow.start + 21) {
        const rowlast = sheet.getCell(`B${tableRow.start + 21}`);
        rowlast.alignment = {
          vertical: "middle",
          horizontal: "left",
        };
        rowlast.value = `ลงชื่อ..........................................รองผอ.วิชาการ  ลงชื่อ..........................................ผู้อำนวยการ`;
      }
    }
    tableRow = { start: tableRow.start + 31, end: tableRow.end + 31 };
  }
  // console.log(keepCellRow)
  sheet.eachRow(function (row, rowNumber) {
    if (keepCellRow.includes(rowNumber)) {
      row.eachCell(function (cell, colNumber) {
        if (colNumber === 1) {
          row.getCell(colNumber).border = {
            top: { style: "thin" },
            right: { style: "thin" },
            left: { style: "thin" },
          };
        } else if (colNumber <= slotLength) {
          row.getCell(colNumber).border = {
            top: { style: "thin" },
            right: { style: "thin" },
          };
        }
      });
    }
    if (keepCellCol.includes(rowNumber)) {
      row.eachCell(function (cell, colNumber) {
        if (colNumber === 1) {
          row.getCell(colNumber).border = {
            right: { style: "thin" },
            left: { style: "thin" },
          };
        } else if (colNumber <= slotLength) {
          row.getCell(colNumber).border = {
            right: { style: "thin" },
          };
        }
      });
    }
    if (keepLastRowLine.includes(rowNumber)) {
      row.eachCell(function (cell, colNumber) {
        if (colNumber === 1) {
          row.getCell(colNumber).border = {
            bottom: { style: "thin" },
            right: { style: "thin" },
            left: { style: "thin" },
          };
        } else if (colNumber <= slotLength) {
          row.getCell(colNumber).border = {
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        }
      });
    }
  });
  sheet.eachRow(function (row, rowNumber) {
    row.font = {
      name: "TH SarabunPSK",
      size: keepTimeLine.includes(rowNumber) ? 12 : 14,
    };
    row.height = 16.5;
    row.eachCell(function (col, colNumber) {
      if (colNumber === 1) {
        row.getCell(colNumber).font = { name: "TH SarabunPSK", size: 14 };
      }
    });
  });

  void workbook.xlsx.writeBuffer().then((data) => {
    const blob = new Blob([data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheet.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "ตารางนักเรียน.xlsx";
    anchor.click();
    window.URL.revokeObjectURL(url);
  });
};
