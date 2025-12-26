import { subjectCreditTitles } from "@/models/credit-titles";
import { subjectCreditValues, subject_credit } from "@/models/credit-value";
import ExcelJS from "exceljs";
import { createClientLogger } from "@/lib/client-logger";
import { isUndefined } from "swr/_internal";
import type { ActionResult } from "@/shared/lib/action-wrapper";

type ProgramTeacher = {
  TeacherFullName: string;
};

type ProgramSubject = {
  SubjectCode: string;
  SubjectName: string;
  Credit: subject_credit;
  Category: string;
  teachers?: ProgramTeacher[];
};

type ProgramData = {
  subjects: ProgramSubject[];
};

const getProgramSubjects = (
  programData: ProgramData | ActionResult<ProgramData> | null | undefined,
): ProgramSubject[] => {
  if (!programData) return [];
  if ("subjects" in programData && Array.isArray(programData.subjects)) {
    return programData.subjects;
  }
  if (
    "data" in programData &&
    programData.data &&
    "subjects" in programData.data &&
    Array.isArray(programData.data.subjects)
  ) {
    return programData.data.subjects;
  }
  return [];
};

export default function ExportAllProgram(
  programData: ProgramData | ActionResult<ProgramData> | null | undefined,
  GradeID: string,
  semester: string,
  academicYear: string,
) {
  const log = createClientLogger("ExportAllProgram");
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("หลักสูตร", {
    pageSetup: { paperSize: 9, orientation: "landscape" },
  });
  const generateTableHead = [
    "ลำดับ",
    "ชื่อวิชา",
    "รหัสวิชา",
    "หน่วยกิต",
    "ครูผู้สอน",
    "หมายเหตุ",
  ];

  const row4 = sheet.getRow(4);
  row4.values = generateTableHead;

  const keyColumn = [
    { key: "order", width: 6.5 },
    { key: "subjectcode", width: 9 },
    { key: "subjectname", width: 38 },
    { key: "credit", width: 8.5 },
    { key: "teacher", width: 38 },
    { key: "alt_notes", width: 8.5 },
  ];
  sheet.columns = keyColumn;
  const subjects = getProgramSubjects(programData);
  const primarySubjectData = () => {
    return sortSubjectCategory(
      subjects.filter((item) => item.Category === "พื้นฐาน"),
    );
  };
  const extraSubjectData = () => {
    return sortSubjectCategory(
      subjects.filter((item) => item.Category === "เพิ่มเติม"),
    );
  };
  const activitiesSubjectData = () => {
    return sortSubjectCategory(
      subjects.filter((item) => item.Category === "กิจกรรมพัฒนาผู้เรียน"),
    );
  };
  const CategoryObject = (catName: string) => {
    return {
      order: "",
      subjectcode: "",
      subjectname: catName,
      credit: "",
      teacher: "",
      alt_notes: "",
    };
  };
  const blankObject = () => {
    return {
      order: "",
      subjectcode: "",
      subjectname: "",
      credit: "",
      teacher: "",
      alt_notes: "",
    };
  };
  const SumCredit = (title: string, credit: string | number) => {
    return {
      order: "",
      subjectcode: "",
      subjectname: title,
      credit: credit,
      teacher: "",
      alt_notes: "",
    };
  };
  const getSumCreditValue = (CreditType: string) => {
    if (CreditType === "PRIMARY") {
      return subjects
        .filter((item) => item.Category === "พื้นฐาน")
        .reduce((a, b) => a + (subjectCreditValues[b.Credit] ?? 0), 0)
        .toFixed(1);
    } else if (CreditType === "EXTRA") {
      return subjects
        .filter((item) => item.Category === "เพิ่มเติม")
        .reduce((a, b) => a + (subjectCreditValues[b.Credit] ?? 0), 0)
        .toFixed(1);
    } else if (CreditType === "ALL") {
      return subjects
        .filter((item) => item.Category !== "กิจกรรมพัฒนาผู้เรียน")
        .reduce((a, b) => a + (subjectCreditValues[b.Credit] ?? 0), 0)
        .toFixed(1);
    } else {
      return 0;
    }
  };
  const sortSubjectCategory = (data: ProgramSubject[]) => {
    //ท ค ว ส พ ศ ก อ
    const SubjectCodeVal: Record<string, number> = {
      ท: 1,
      ค: 2,
      ว: 3,
      ส: 4,
      พ: 5,
      ศ: 6,
      ก: 7,
      อ: 8,
    };
    const sortedData = data.sort((a, b) => {
      const getVal = (sCode: string) => {
        return isUndefined(SubjectCodeVal[sCode]) ? 9 : SubjectCodeVal[sCode];
      };
      const aCode = a.SubjectCode?.[0] ?? "";
      const bCode = b.SubjectCode?.[0] ?? "";
      if (getVal(aCode) < getVal(bCode)) {
        return -1;
      }
      if (getVal(aCode) > getVal(bCode)) {
        return 1;
      }
      return 0;
    });
    return sortedData;
  };
  const jsonData = [
    CategoryObject("สาระการเรียนรู้พื้นฐาน"),
    ...primarySubjectData().map((item: ProgramSubject, index: number) => ({
      order: index + 1,
      subjectcode: item.SubjectCode,
      subjectname: item.SubjectName,
      credit: subjectCreditTitles[item.Credit],
      teacher: item.teachers?.[0]?.TeacherFullName ?? "",
      alt_notes: "",
    })),
    SumCredit(
      "รวมหน่วยกิตสาระการเรียนรู้พื้นฐาน",
      getSumCreditValue("PRIMARY"),
    ),
    blankObject(),
    CategoryObject("สาระการเรียนรู้เพิ่มเติม"),
    ...extraSubjectData().map((item: ProgramSubject, index: number) => ({
      order: primarySubjectData().length + (index + 1),
      subjectcode: item.SubjectCode,
      subjectname: item.SubjectName,
      credit: subjectCreditTitles[item.Credit],
      teacher: item.teachers?.[0]?.TeacherFullName ?? "",
      alt_notes: "",
    })),
    SumCredit(
      "รวมหน่วยกิตสาระการเรียนรู้เพิ่มเติม",
      getSumCreditValue("EXTRA"),
    ),
    blankObject(),
    CategoryObject("กิจกรรมพัฒนาผู้เรียน"),
    ...activitiesSubjectData().map((item: ProgramSubject, index: number) => ({
      order:
        primarySubjectData().length + extraSubjectData().length + (index + 1),
      subjectcode: item.SubjectCode,
      subjectname: item.SubjectName,
      credit: "",
      teacher: item.teachers?.[0]?.TeacherFullName ?? "",
      alt_notes: "",
    })),
    SumCredit("รวมหน่วยกิตทั้งหมด", getSumCreditValue("ALL")),
  ];
  sheet.addRows(jsonData, "i");
  const row1 = sheet.getRow(1);
  // const row2 = sheet.getRow(2)
  row1.values = [
    `โครงสร้างหลักสูตร ระดับชั้นมัธยมศึกษาปีที่ ${GradeID[0]}/${parseInt(GradeID.substring(1))} ภาคเรียนที่ ${semester} ปีการศึกษา ${academicYear}`,
  ];
  // row2.values = [`โรงเรียนศึกษาไอทีวิทยา เขตลาดกระบัง กรุงเทพมหานคร`]
  sheet.mergeCells("A1:F1");
  sheet.mergeCells("A2:F2");
  sheet.eachRow(function (row, rowNumber) {
    row.font = {
      name: "TH SarabunPSK",
      size: 16,
      bold: rowNumber < 3 ? true : false,
    };
    row.eachCell(function (cell, colNumber) {
      if (rowNumber < 5) {
        row.alignment = {
          vertical: "middle",
          horizontal: "center",
        };
      }
      if (rowNumber > 3) {
        if (colNumber === 3 || colNumber === 5) {
          row.getCell(colNumber).alignment = {
            vertical: "middle",
            horizontal: "left",
            wrapText: true,
          };
          row.getCell(colNumber).border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        } else {
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
    });
  });
  workbook.xlsx
    .writeBuffer()
    .then((data) => {
      const blob = new Blob([data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheet.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "หลักสูตร.xlsx";
      anchor.click();
      window.URL.revokeObjectURL(url);
    })
    .catch((error) => {
      log.logError(error, { action: "export" });
    });
}
