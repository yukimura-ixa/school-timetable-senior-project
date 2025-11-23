"use client";
import { useGradeLevels, useSemesterSync } from "@/hooks";
import { getProgramByGradeAction } from "@/features/program/application/actions/program.actions";
import { subjectCreditTitles } from "@/models/credit-titles";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import useSWR from "swr";
import ExportAllProgram from "./function/ExportAllProgram";
import { subjectCreditValues } from "@/models/credit-value";
import { isUndefined } from "swr/_internal";
import { SubjectCategory } from '@/models/subject-category';
import {
  Container,
  Paper,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Skeleton,
  Stack,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import SchoolIcon from "@mui/icons-material/School";

type Props = Record<string, never>;

type CategoryType = "พื้นฐาน" | "เพิ่มเติม" | "กิจกรรมพัฒนาผู้เรียน";
type SubjectRow = {
  SubjectCode: string;
  SubjectName: string;
  Credit: keyof typeof subjectCreditValues;
  Category: CategoryType;
  teachers?: Array<{ TeacherFullName: string }>;
};

// Map Prisma enum to Thai display strings
const categoryMap: Record<SubjectCategory, CategoryType> = {
  CORE: "พื้นฐาน",
  ADDITIONAL: "เพิ่มเติม",
  ACTIVITY: "กิจกรรมพัฒนาผู้เรียน",
};

const Page = (_props: Props) => {
  const params = useParams();
  const { semester, academicYear } = useSemesterSync(params.semesterAndyear as string);
  const gradeLevelData = useGradeLevels();
  const [currentGradeID, setCurrentGradeID] = useState("");
  
  const programOfGrade = useSWR(
    currentGradeID !== "" && semester && academicYear ? ['program-by-grade', currentGradeID, semester, academicYear] : null,
    async ([, gradeId]) => {
      if (!semester || !academicYear) return null;
      return await getProgramByGradeAction({ 
        GradeID: gradeId,
        Semester: semester,
        AcademicYear: academicYear,
      });
    },
    { revalidateOnFocus: false },
  );

  // Ensure semester and academicYear are defined
  if (!semester || !academicYear) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Stack spacing={2}>
          <Skeleton variant="rectangular" height={56} />
          <Skeleton variant="rectangular" height={400} />
        </Stack>
      </Container>
    );
  }

  const subjects: SubjectRow[] = (!programOfGrade.isLoading && programOfGrade.data?.success && programOfGrade.data.data)
    ? programOfGrade.data.data.subjects.map((subject: any) => {
        const teachers = Array.isArray(subject.teachers_responsibility)
          ? subject.teachers_responsibility.map((tr: any) => ({
              TeacherFullName: `${tr.teacher.Prefix} ${tr.teacher.Firstname} ${tr.teacher.Lastname}`,
            }))
          : [];
        
        return {
          SubjectCode: subject.SubjectCode,
          SubjectName: subject.SubjectName,
          Credit: subject.Credit as keyof typeof subjectCreditValues,
          Category: categoryMap[subject.Category as SubjectCategory],
          teachers,
        };
      })
    : [];

  const primarySubjectData = (): SubjectRow[] =>
    sortSubjectCategory(subjects.filter((item) => item.Category === "พื้นฐาน"));

  const extraSubjectData = (): SubjectRow[] =>
    sortSubjectCategory(subjects.filter((item) => item.Category === "เพิ่มเติม"));

  const activitiesSubjectData = (): SubjectRow[] =>
    sortSubjectCategory(subjects.filter((item) => item.Category === "กิจกรรมพัฒนาผู้เรียน"));
  // Render helper functions (not components to avoid re-creation during render)
  const renderTableHead = () => (
    <TableHead>
      <TableRow>
        <TableCell
          colSpan={5}
          align="center"
          sx={{ bgcolor: "success.light", fontWeight: "bold", py: 1.5 }}
        >
          โครงสร้างหลักสูตร มัธยมศึกษาปีที่ {currentGradeID} ภาคเรียนที่ {semester} ปีการศึกษา {academicYear}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell align="center" sx={{ bgcolor: "success.lighter", fontWeight: "bold" }}>
          ลำดับ
        </TableCell>
        <TableCell align="center" sx={{ bgcolor: "success.lighter", fontWeight: "bold" }}>
          รหัสวิชา
        </TableCell>
        <TableCell sx={{ bgcolor: "success.lighter", fontWeight: "bold" }}>
          ชื่อวิชา
        </TableCell>
        <TableCell align="center" sx={{ bgcolor: "success.lighter", fontWeight: "bold" }}>
          หน่วยกิต
        </TableCell>
        <TableCell sx={{ bgcolor: "success.lighter", fontWeight: "bold" }}>
          ครูผู้สอน
        </TableCell>
      </TableRow>
    </TableHead>
  );

  const renderCategoryRow = (categoryName: string) => (
    <TableBody key={`category-${categoryName}`}>
      <TableRow>
        <TableCell />
        <TableCell />
        <TableCell sx={{ fontWeight: "bold", bgcolor: "primary.lighter" }}>
          <Chip label={categoryName} color="primary" variant="outlined" />
        </TableCell>
        <TableCell sx={{ bgcolor: "primary.lighter" }} />
        <TableCell sx={{ bgcolor: "primary.lighter" }} />
      </TableRow>
    </TableBody>
  );

  const renderSubjectRows = (data: SubjectRow[], indexStart: number) => (
    <TableBody key={`subjects-${indexStart}`}>
      {data.map((item, index) => (
        <TableRow
          key={`${currentGradeID || 'unknown'}-${item.SubjectCode}`}
          hover
          sx={{ '&:nth-of-type(even)': { bgcolor: 'action.hover' } }}
        >
          <TableCell align="center">{indexStart + index}</TableCell>
          <TableCell align="center">{item.SubjectCode}</TableCell>
          <TableCell>{item.SubjectName}</TableCell>
          <TableCell align="center">
            {item.Category === "กิจกรรมพัฒนาผู้เรียน" ? "" : subjectCreditTitles[item.Credit]}
          </TableCell>
          <TableCell>
            {item.teachers && item.teachers.length > 0 
              ? item.teachers.map((t) => t.TeacherFullName).join(", ")
              : "-"}
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );

  const renderSumRow = (title: string, credit: number) => (
    <TableBody key={`sum-${title}`}>
      <TableRow sx={{ bgcolor: "info.lighter" }}>
        <TableCell />
        <TableCell />
        <TableCell sx={{ fontWeight: "bold" }}>{title}</TableCell>
        <TableCell align="center" sx={{ fontWeight: "bold" }}>
          {credit.toFixed(1)}
        </TableCell>
        <TableCell sx={{ fontWeight: "bold" }}>หน่วยกิต</TableCell>
      </TableRow>
    </TableBody>
  )
  const getSumCreditValue = () => {
    return subjects
      .filter((item) => item.Category !== "กิจกรรมพัฒนาผู้เรียน")
      .reduce((a, b) => a + (subjectCreditValues[b.Credit] ?? 0), 0);
  }
  const sortSubjectCategory = (data: SubjectRow[]) => {
    //ท ค ว ส พ ศ ก อ
    const SubjectCodeVal: Record<string, number> = {"ท" : 1, "ค" : 2, "ว" : 3, "ส" : 4, "พ" : 5, "ศ" : 6, "ก" : 7, "อ" : 8}
    const sortedData = data.sort((a, b) => {
      const getVal = (sCode: string) => {
        return isUndefined(SubjectCodeVal[sCode]) ? 9 : (SubjectCodeVal[sCode] ?? 9)
      }
      if(getVal(a.SubjectCode[0] ?? "") < getVal(b.SubjectCode[0] ?? "")){
        return -1;
      }
      if(getVal(a.SubjectCode[0] ?? "") > getVal(b.SubjectCode[0] ?? "")){
        return 1;
      }
      return 0
    })
    return sortedData;
  }
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {programOfGrade.isLoading || gradeLevelData.isLoading ? (
        <Stack spacing={2}>
          <Skeleton variant="rectangular" height={56} />
          <Skeleton variant="rectangular" height={400} />
        </Stack>
      ) : (
        <Stack spacing={3}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <FormControl sx={{ minWidth: 300 }}>
              <InputLabel id="grade-select-label">เลือกชั้นเรียน</InputLabel>
              <Select
                labelId="grade-select-label"
                value={currentGradeID}
                label="เลือกชั้นเรียน"
                onChange={(e) => setCurrentGradeID(e.target.value)}
              >
                <MenuItem value="">
                  <em>เลือกชั้นเรียน</em>
                </MenuItem>
                {gradeLevelData.data.map((item) => (
                  <MenuItem key={item.GradeID} value={item.GradeID}>
                    {item.GradeID}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {currentGradeID !== "" && (
              <Button
                variant="contained"
                color="info"
                startIcon={<DownloadIcon />}
                onClick={() =>
                  ExportAllProgram(
                    programOfGrade.data,
                    currentGradeID,
                    semester,
                    academicYear,
                  )
                }
                disabled={programOfGrade.isLoading}
              >
                นำออกเป็น Excel
              </Button>
            )}
          </Stack>
          {currentGradeID === "" ? (
            <Paper sx={{ p: 8, textAlign: "center" }}>
              <SchoolIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                กรุณาเลือกชั้นเรียน
              </Typography>
              <Typography variant="body2" color="text.secondary">
                เลือกชั้นเรียนจากเมนูด้านบนเพื่อดูหลักสูตรและรายวิชา
              </Typography>
            </Paper>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                {renderTableHead()}
                {renderCategoryRow("สาระการเรียนรู้พิ้นฐาน")}
                {renderSubjectRows(primarySubjectData(), 1)}
                {renderSumRow("รวมหน่วยกิตสาระการเรียนรู้พิ้นฐาน", primarySubjectData().reduce((a, b) => a + (subjectCreditValues[b.Credit] ?? 0), 0))}
                {renderCategoryRow("สาระการเรียนรู้เพิ่มเติม")}
                {renderSubjectRows(extraSubjectData(), primarySubjectData().length + 1)}
                {renderSumRow("รวมหน่วยกิตสาระการเรียนรู้เพิ่มเติม", extraSubjectData().reduce((a, b) => a + (subjectCreditValues[b.Credit] ?? 0), 0))}
                {renderCategoryRow("กิจกรรมพัฒนาผู้เรียน")}
                {renderSubjectRows(activitiesSubjectData(), primarySubjectData().length + extraSubjectData().length + 1)}
                {renderSumRow("รวมหน่วยกิตทั้งหมด", getSumCreditValue())}
              </Table>
            </TableContainer>
          )}
        </Stack>
      )}
    </Container>
  );
};

export default Page;
