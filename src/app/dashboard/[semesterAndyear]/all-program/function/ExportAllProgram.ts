import { subjectCreditTitles } from "@/models/credit-titles"
import { subjectCreditValues, subject_credit } from "@/models/credit-value"
import ExcelJS from "exceljs"
import { isUndefined } from "swr/_internal"

export default function ExportAllProgram(
  programData: any,
  GradeID: string,
  semester: string,
  academicYear: string
) {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet("หลักสูตร", {
    pageSetup: { paperSize: 9, orientation: "landscape" },
  })
  const generateTableHead = [
    "ลำดับ", "ชื่อวิชา", "รหัสวิชา", "หน่วยกิต", "ครูผู้สอน", "หมายเหตุ"
  ]

  const row4 = sheet.getRow(4)
  row4.values = generateTableHead

  const keyColumn = [
    { key: "order", width: 6.5 },
    { key: "subjectcode", width: 9 },
    { key: "subjectname", width: 38 },
    { key: "credit", width: 8.5 },
    { key: "teacher", width: 38 },
    { key: 'alt_notes', width: 8.5 }
  ]
  sheet.columns = keyColumn
  const primarySubjectData = () => {
    return sortSubjectCategory(programData.subjects.filter(
      (item: any) => item.Category == "พื้นฐาน",
    ))
  }
  const extraSubjectData = () => {
    return sortSubjectCategory(programData.subjects.filter(
      (item: any) => item.Category == "เพิ่มเติม",
    ))
  }
  const activitiesSubjectData = () => {
    return sortSubjectCategory(programData.subjects.filter(
      (item: any) => item.Category == "กิจกรรมพัฒนาผู้เรียน",
    ))
  }
  const CategoryObject = (catName: string) => {
    return {
      order: "",
      subjectcode: "",
      subjectname: catName,
      credit: "",
      teacher: "",
      alt_notes: ""
    }
  }
  const blankObject = () => {
    return {
      order: "",
      subjectcode: "",
      subjectname: "",
      credit: "",
      teacher: "",
      alt_notes: ""
    }
  }
  const SumCredit = (title: string, credit: any) => {
    return {
      order: "",
      subjectcode: "",
      subjectname: title,
      credit: credit,
      teacher: "",
      alt_notes: ""
    }
  }
  const getSumCreditValue = (CreditType: string) => {
    if (CreditType == "PRIMARY") {
      return programData.subjects.filter(
        (item: any) => item.Category == "พื้นฐาน",
      ).reduce((a: number, b: any) => a + (subjectCreditValues[b.Credit as subject_credit] ?? 0), 0).toFixed(1)
    }
    else if (CreditType == "EXTRA") {
      return programData.subjects.filter(
        (item: any) => item.Category == "เพิ่มเติม",
      ).reduce((a: number, b: any) => a + (subjectCreditValues[b.Credit as subject_credit] ?? 0), 0).toFixed(1)
    }
    else if (CreditType == "ALL") {
      return programData.subjects.filter(
        (item: any) => item.Category !== "กิจกรรมพัฒนาผู้เรียน",
      ).reduce((a: number, b: any) => a + (subjectCreditValues[b.Credit as subject_credit] ?? 0), 0).toFixed(1)
    }
    else {
      return 0
    }
  }
  const sortSubjectCategory = (data: any[]) => {
    //ท ค ว ส พ ศ ก อ
    const SubjectCodeVal: Record<string, number> = { "ท": 1, "ค": 2, "ว": 3, "ส": 4, "พ": 5, "ศ": 6, "ก": 7, "อ": 8 }
    const sortedData = data.sort((a: any, b: any) => {
      const getVal = (sCode: string) => {
        return isUndefined(SubjectCodeVal[sCode]) ? 9 : SubjectCodeVal[sCode]
      }
      if (getVal(a.SubjectCode[0]) < getVal(b.SubjectCode[0])) {
        return -1
      }
      if (getVal(a.SubjectCode[0]) > getVal(b.SubjectCode[0])) {
        return 1
      }
      return 0
    })
    return sortedData
  }
  const jsonData = [
    CategoryObject("สาระการเรียนรู้พื้นฐาน"),
    ...primarySubjectData().map((item: any, index: number) => ({
      order: index + 1,
      subjectcode: item.SubjectCode,
      subjectname: item.SubjectName,
      credit: subjectCreditTitles[item.Credit],
      teacher: item.teachers.length !== 0 ? item.teachers[0].TeacherFullName : "",
      alt_notes: ""
    })),
    SumCredit("รวมหน่วยกิตสาระการเรียนรู้พื้นฐาน", getSumCreditValue("PRIMARY")),
    blankObject(),
    CategoryObject("สาระการเรียนรู้เพิ่มเติม"),
    ...extraSubjectData().map((item: any, index: number) => ({
      order: primarySubjectData().length + (index + 1),
      subjectcode: item.SubjectCode,
      subjectname: item.SubjectName,
      credit: subjectCreditTitles[item.Credit],
      teacher: item.teachers.length !== 0 ? item.teachers[0].TeacherFullName : "",
      alt_notes: ""
    })),
    SumCredit("รวมหน่วยกิตสาระการเรียนรู้เพิ่มเติม", getSumCreditValue("EXTRA")),
    blankObject(),
    CategoryObject("กิจกรรมพัฒนาผู้เรียน"),
    ...activitiesSubjectData().map((item: any, index: number) => ({
      order: primarySubjectData().length + extraSubjectData().length + (index + 1),
      subjectcode: item.SubjectCode,
      subjectname: item.SubjectName,
      credit: "",
      teacher: item.teachers.length !== 0 ? item.teachers[0].TeacherFullName : "",
      alt_notes: ""
    })),
    SumCredit("รวมหน่วยกิตทั้งหมด", getSumCreditValue("ALL")),
  ]
  sheet.addRows(jsonData, "i")
  const row1 = sheet.getRow(1)
  // const row2 = sheet.getRow(2)
  row1.values = [`โครงสร้างหลักสูตร ระดับชั้นมัธยมศึกษาปีที่ ${GradeID[0]}/${parseInt(GradeID.substring(1))} ภาคเรียนที่ ${semester} ปีการศึกษา ${academicYear}`]
  // row2.values = [`โรงเรียนศึกษาไอทีวิทยา เขตลาดกระบัง กรุงเทพมหานคร`]
  sheet.mergeCells("A1:F1")
  sheet.mergeCells("A2:F2")
  sheet.eachRow(function (row, rowNumber) {
    row.font = { name: "TH SarabunPSK", size: 16, bold: rowNumber < 3 ? true : false }
    row.eachCell(function (cell, colNumber) {
      if (rowNumber < 5) {
        row.alignment = {
          vertical: "middle",
          horizontal: "center",
        }
      }
      if (rowNumber > 3) {
        if (colNumber == 3 || colNumber == 5) {
          console.log(colNumber)
          console.log(cell)
          row.getCell(colNumber).alignment = {
            vertical: "middle",
            horizontal: "left",
          }
          row.getCell(colNumber).border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          }
        }
        else {
          row.getCell(colNumber).alignment = {
            vertical: "middle",
            horizontal: "center",
          }
          row.getCell(colNumber).border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          }
        }
      }
    })
  })
  workbook.xlsx.writeBuffer().then((data) => {
    const blob = new Blob([data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheet.sheet",
    })
    const url = window.URL.createObjectURL(blob)
    const anchor = document.createElement("a");
    (anchor.href = url), (anchor.download = "หลักสูตร.xlsx")
    anchor.click()
    window.URL.revokeObjectURL(url)
  })
}