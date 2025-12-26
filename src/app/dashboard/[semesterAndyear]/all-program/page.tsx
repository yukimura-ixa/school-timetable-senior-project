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
import { SubjectCategory } from "@/models/subject-category";
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
  Box,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import DownloadIcon from "@mui/icons-material/Download";
import SchoolIcon from "@mui/icons-material/School";
import { colors } from "@/shared/design-system";

type Props = Record<string, never>;

type CategoryType = "พื้นฐาน" | "เพิ่มเติม" | "กิจกรรมพัฒนาผู้เรียน";
type SubjectRow = {
  SubjectCode: string;
  SubjectName: string;
  Credit: keyof typeof subjectCreditValues;
  Category: CategoryType;
  teachers?: Array<{ TeacherFullName: string }>;
};

type ProgramTeacher = {
  teacher: {
    Prefix: string;
    Firstname: string;
    Lastname: string;
  };
};

type ProgramSubject = {
  SubjectCode: string;
  SubjectName: string;
  Credit: keyof typeof subjectCreditValues;
  Category: SubjectCategory;
  teachers_responsibility?: ProgramTeacher[] | null;
};

// Map Prisma enum to Thai display strings
const categoryMap: Record<SubjectCategory, CategoryType> = {
  CORE: "พื้นฐาน",
  ADDITIONAL: "เพิ่มเติม",
  ACTIVITY: "กิจกรรมพัฒนาผู้เรียน",
};

const Page = (_props: Props) => {
  const theme = useTheme();
  const params = useParams();
  const { semester, academicYear } = useSemesterSync(
    params.semesterAndyear as string,
  );
  const gradeLevelData = useGradeLevels();
  const [currentGradeID, setCurrentGradeID] = useState("");

  const programOfGrade = useSWR(
    currentGradeID !== "" && semester && academicYear
      ? ["program-by-grade", currentGradeID, semester, academicYear]
      : null,
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

  const subjects: SubjectRow[] =
    !programOfGrade.isLoading &&
    programOfGrade.data?.success &&
    programOfGrade.data.data
      ? programOfGrade.data.data.subjects.map((subject: ProgramSubject) => {
          const teachers = Array.isArray(subject.teachers_responsibility)
            ? subject.teachers_responsibility.map((tr: ProgramTeacher) => ({
                TeacherFullName: `${tr.teacher.Prefix} ${tr.teacher.Firstname} ${tr.teacher.Lastname}`,
              }))
            : [];

          return {
            SubjectCode: subject.SubjectCode,
            SubjectName: subject.SubjectName,
            Credit: subject.Credit,
            Category: categoryMap[subject.Category],
            teachers,
          };
        })
      : [];

  const primarySubjectData = (): SubjectRow[] =>
    sortSubjectCategory(subjects.filter((item) => item.Category === "พื้นฐาน"));

  const extraSubjectData = (): SubjectRow[] =>
    sortSubjectCategory(
      subjects.filter((item) => item.Category === "เพิ่มเติม"),
    );

  const activitiesSubjectData = (): SubjectRow[] =>
    sortSubjectCategory(
      subjects.filter((item) => item.Category === "กิจกรรมพัฒนาผู้เรียน"),
    );
  // Render helper functions (not components to avoid re-creation during render)
  const renderTableHead = () => (
    <TableHead>
      <TableRow>
        <TableCell
          colSpan={5}
          align="center"
          sx={{
            bgcolor: alpha(theme.palette.success.main, 0.08),
            fontWeight: "bold",
            py: 2.5,
            borderBottom: `2px solid ${alpha(theme.palette.success.main, 0.1)}`,
            color: "success.dark",
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            โครงสร้างหลักสูตร มัธยมศึกษาปีที่ {currentGradeID} ภาคเรียนที่{" "}
            {semester} ปีการศึกษา {academicYear}
          </Typography>
        </TableCell>
      </TableRow>
      <TableRow sx={{ bgcolor: alpha(theme.palette.background.default, 0.5) }}>
        <TableCell
          align="center"
          sx={{ fontWeight: "bold", color: "text.secondary", py: 1.5 }}
        >
          ลำดับ
        </TableCell>
        <TableCell
          align="center"
          sx={{ fontWeight: "bold", color: "text.secondary", py: 1.5 }}
        >
          รหัสวิชา
        </TableCell>
        <TableCell
          sx={{ fontWeight: "bold", color: "text.secondary", py: 1.5 }}
        >
          ชื่อวิชา
        </TableCell>
        <TableCell
          align="center"
          sx={{ fontWeight: "bold", color: "text.secondary", py: 1.5 }}
        >
          หน่วยกิต
        </TableCell>
        <TableCell
          sx={{ fontWeight: "bold", color: "text.secondary", py: 1.5 }}
        >
          ครูผู้สอน
        </TableCell>
      </TableRow>
    </TableHead>
  );

  const renderCategoryRow = (categoryName: string) => (
    <TableBody key={`category-${categoryName}`}>
      <TableRow>
        <TableCell
          colSpan={5}
          sx={{
            py: 1,
            px: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.04),
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 4,
                height: 18,
                borderRadius: 1,
                bgcolor: "primary.main",
              }}
            />
            <Typography
              variant="subtitle2"
              fontWeight="bold"
              color="primary.main"
            >
              {categoryName}
            </Typography>
          </Stack>
        </TableCell>
      </TableRow>
    </TableBody>
  );

  const renderSubjectRows = (data: SubjectRow[], indexStart: number) => (
    <TableBody key={`subjects-${indexStart}`}>
      {data.map((item, index) => (
        <TableRow
          key={`${currentGradeID || "unknown"}-${item.SubjectCode}`}
          hover
          sx={{
            transition: "all 0.2s",
            "&:hover": { bgcolor: alpha(theme.palette.action.hover, 0.5) },
            "& td": {
              py: 1.5,
              borderColor: alpha(theme.palette.divider, 0.05),
            },
          }}
        >
          <TableCell align="center">
            <Typography variant="body2" color="text.secondary">
              {indexStart + index}
            </Typography>
          </TableCell>
          <TableCell align="center">
            <Typography
              variant="body2"
              fontWeight="bold"
              sx={{ fontFamily: "monospace", letterSpacing: 0.5 }}
            >
              {item.SubjectCode}
            </Typography>
          </TableCell>
          <TableCell>
            <Typography variant="body2">{item.SubjectName}</Typography>
          </TableCell>
          <TableCell align="center">
            <Typography variant="body2" fontWeight="medium">
              {item.Category === "กิจกรรมพัฒนาผู้เรียน"
                ? "-"
                : subjectCreditTitles[item.Credit]}
            </Typography>
          </TableCell>
          <TableCell>
            {item.teachers && item.teachers.length > 0 ? (
              <Stack direction="row" spacing={0.5} flexWrap="wrap">
                {item.teachers.map((t, idx) => (
                  <Chip
                    key={idx}
                    label={t.TeacherFullName}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontSize: "0.7rem",
                      height: 20,
                      bgcolor: alpha(theme.palette.background.paper, 0.5),
                      borderColor: alpha(theme.palette.divider, 0.1),
                    }}
                  />
                ))}
              </Stack>
            ) : (
              <Typography variant="caption" color="text.disabled">
                ไม่ระบุ
              </Typography>
            )}
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );

  const renderSumRow = (title: string, credit: number) => (
    <TableBody key={`sum-${title}`}>
      <TableRow sx={{ bgcolor: alpha(theme.palette.info.main, 0.03) }}>
        <TableCell colSpan={2} />
        <TableCell sx={{ fontWeight: "bold", color: "info.dark" }}>
          <Typography variant="body2" fontWeight="bold">
            {title}
          </Typography>
        </TableCell>
        <TableCell align="center">
          <Typography variant="body2" fontWeight="bold" color="info.main">
            {credit.toFixed(1)}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="caption" fontWeight="bold" color="info.dark">
            หน่วยกิต
          </Typography>
        </TableCell>
      </TableRow>
    </TableBody>
  );

  const getSumCreditValue = () => {
    return subjects
      .filter((item) => item.Category !== "กิจกรรมพัฒนาผู้เรียน")
      .reduce((a, b) => a + (subjectCreditValues[b.Credit] ?? 0), 0);
  };

  const sortSubjectCategory = (data: SubjectRow[]) => {
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
        return isUndefined(SubjectCodeVal[sCode])
          ? 9
          : (SubjectCodeVal[sCode] ?? 9);
      };
      if (getVal(a.SubjectCode[0] ?? "") < getVal(b.SubjectCode[0] ?? "")) {
        return -1;
      }
      if (getVal(a.SubjectCode[0] ?? "") > getVal(b.SubjectCode[0] ?? "")) {
        return 1;
      }
      return 0;
    });
    return sortedData;
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {programOfGrade.isLoading || gradeLevelData.isLoading ? (
        <Stack spacing={2}>
          <Skeleton variant="rectangular" height={56} />
          <Skeleton variant="rectangular" height={400} />
        </Stack>
      ) : (
        <Stack spacing={3}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <FormControl
              sx={{
                minWidth: 300,
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: alpha(colors.slate[400], 0.3),
                  },
                  "&:hover fieldset": {
                    borderColor: colors.emerald.main,
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: colors.emerald.main,
                  },
                },
                "& .MuiInputLabel-root": {
                  color: colors.slate[500],
                  "&.Mui-focused": {
                    color: colors.emerald.main,
                  },
                },
              }}
            >
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
                sx={{
                  bgcolor: colors.emerald.main,
                  "&:hover": {
                    bgcolor: colors.emerald.dark,
                  },
                }}
              >
                นำออกเป็น Excel
              </Button>
            )}
          </Stack>
          {currentGradeID === "" ? (
            <Paper
              sx={{
                p: 8,
                textAlign: "center",
                border: "1px solid",
                borderColor: alpha(colors.slate[300], 0.5),
                borderRadius: 3,
              }}
            >
              <SchoolIcon
                sx={{ fontSize: 64, color: colors.slate[400], mb: 2 }}
              />
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
                {renderSumRow(
                  "รวมหน่วยกิตสาระการเรียนรู้พิ้นฐาน",
                  primarySubjectData().reduce(
                    (a, b) => a + (subjectCreditValues[b.Credit] ?? 0),
                    0,
                  ),
                )}
                {renderCategoryRow("สาระการเรียนรู้เพิ่มเติม")}
                {renderSubjectRows(
                  extraSubjectData(),
                  primarySubjectData().length + 1,
                )}
                {renderSumRow(
                  "รวมหน่วยกิตสาระการเรียนรู้เพิ่มเติม",
                  extraSubjectData().reduce(
                    (a, b) => a + (subjectCreditValues[b.Credit] ?? 0),
                    0,
                  ),
                )}
                {renderCategoryRow("กิจกรรมพัฒนาผู้เรียน")}
                {renderSubjectRows(
                  activitiesSubjectData(),
                  primarySubjectData().length + extraSubjectData().length + 1,
                )}
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
