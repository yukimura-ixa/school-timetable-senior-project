import { subjectCreditTitles } from "@/models/credit-titles";
import ExcelJS from "exceljs";
export default function ExportAllProgram (programData, GradeID, semester, academicYear) {
    const workbook = new ExcelJS.Workbook() ;
    const sheet = workbook.addWorksheet("หลักสูตร", {
        pageSetup: { paperSize: 9, orientation: "landscape" },
    })
    const generateTableHead = [
        "ลำดับ", "ชื่อวิชา", "รหัสวิชา", "หน่วยกิต", "ครูผู้สอน", "หมายเหตุ"
    ];

    const row4 = sheet.getRow(4)
    row4.values = generateTableHead

    const keyColumn = [
        {key : "order", width : 6.5},
        {key : "subjectcode", width : 9},
        {key : "subjectname", width : 38},
        {key : "credit", width : 8.5},
        {key : "teacher", width : 38},
        {key : 'alt_notes', width : 8.5}
    ]
    sheet.columns = keyColumn
    const primarySubjectData = () => {
        return programData.subjects.filter(
            (item) => item.Category == "พื้นฐาน",
          );
      };
      const extraSubjectData = () => {
        return programData.subjects.filter(
            (item) => item.Category == "เพิ่มเติม",
          );
      };
      const activitiesSubjectData = () => {
        return programData.subjects.filter(
            (item) => item.Category == "กิจกรรมพัฒนาผู้เรียน",
          );
      };
      const CategoryObject = (catName) => {
        return {
            order : "",
            subjectcode : "",
            subjectname : catName,
            credit : "",
            teacher : "",
            alt_notes : ""
        }
      }
    const jsonData = [
        CategoryObject("วิชาพื้นฐาน"),
        ...primarySubjectData().map((item, index) => ({
            order : index + 1,
            subjectcode : item.SubjectCode,
            subjectname : item.SubjectName,
            credit : subjectCreditTitles[item.Credit],
            teacher : item.teachers.length !== 0 ? item.teachers[0].TeacherFullName : "",
            alt_notes : ""
        })),
        CategoryObject("วิชาเพิ่มเติม"),
        ...extraSubjectData().map((item, index) => ({
            order : primarySubjectData().length + (index + 1),
            subjectcode : item.SubjectCode,
            subjectname : item.SubjectName,
            credit : subjectCreditTitles[item.Credit],
            teacher : item.teachers.length !== 0 ? item.teachers[0].TeacherFullName : "",
            alt_notes : ""
        })),
        CategoryObject("กิจกรรมพัฒนาผู้เรียน"),
        ...activitiesSubjectData().map((item, index) => ({
            order : primarySubjectData().length + extraSubjectData().length + (index + 1),
            subjectcode : item.SubjectCode,
            subjectname : item.SubjectName,
            credit : subjectCreditTitles[item.Credit],
            teacher : item.teachers.length !== 0 ? item.teachers[0].TeacherFullName : "",
            alt_notes : ""
        })),
    ]
    sheet.addRows(jsonData, "i")
    const row1 = sheet.getRow(1)
    const row2 = sheet.getRow(2)
    row1.values = [`โครงสร้างหลักสูตร ระดับชั้นมัธยมศึกษาปีที่ ${1}/${1} ภาคเรียนที่ ${semester} ปีการศึกษา ${academicYear}`]
    row2.values = [`โรงเรียนศึกษาไอทีวิทยา เขตลาดกระบัง กรุงเทพมหานคร`]
    sheet.mergeCells("A1:F1")
    sheet.mergeCells("A2:F2")
    sheet.eachRow(function (row, rowNumber) {
        row.font = { name: "TH SarabunPSK", size: 16, bold : rowNumber < 3 ? true : false };
        row.eachCell(function (cell, colNumber) {
            if(rowNumber < 5){
                row.alignment = {
                    vertical: "middle",
                    horizontal: "center",
                };
            }
            if(rowNumber > 3){
                if(colNumber == 3 || colNumber == 5) {
                    console.log(colNumber)
                    console.log(cell)
                    row.getCell(colNumber).alignment = {
                        vertical: "middle",
                        horizontal: "left",
                    };
                    row.getCell(colNumber).border = {
                        top: { style: "thin" },
                        left: { style: "thin" },
                        bottom: { style: "thin" },
                        right: { style: "thin" },
                    };
                }
                else {
                    row.getCell(colNumber).alignment = {
                        vertical: "middle",
                        horizontal: "center",
                    };
                    row.getCell(colNumber).border = {
                        top: { style: "thin" },
                        left: { style: "thin" },
                        bottom: { style: "thin" },
                        right: { style: "thin" },
                    };
                }
            }
        })
    })
    workbook.xlsx.writeBuffer().then((data) => {
        const blob = new Blob([data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheet.sheet",
        });
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        (anchor.href = url), (anchor.download = "หลักสูตร.xlsx");
        anchor.click();
        window.URL.revokeObjectURL(url);
      });
}