import { dayOfWeekThai } from "@/models/dayofweek-thai";
import ExcelJS from "exceljs";
export const ExportTeacherTimeslot = (timeSlotData, allTeacher, classData, semester, academicYear) => {
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