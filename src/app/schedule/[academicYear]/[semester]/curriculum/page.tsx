import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import { findFullConfigData } from "@/features/config/infrastructure/repositories/config.repository";
import { buildCurriculumOverview } from "@/features/schedule-wizard/domain/curriculum-overview";

/**
 * Step 2 — Curriculum & MOE check.
 *
 * Read-only, per-program view of MOE credit compliance, surfaced BEFORE any
 * placement so shortfalls are fixed in the program master data early rather
 * than blocking at publish time.
 */
export default async function CurriculumStepPage({
  params,
}: {
  params: Promise<{ academicYear: string; semester: string }>;
}) {
  const { academicYear, semester } = await params;
  const configId = `${semester}-${academicYear}`;

  const configData = await findFullConfigData(configId);

  if (!configData || configData.programs.length === 0) {
    return (
      <Box sx={{ py: 2 }}>
        <Alert severity="warning">
          ยังไม่มีหลักสูตรสำหรับภาคเรียนนี้ กรุณาตั้งค่าหลักสูตรก่อน
        </Alert>
        <Button
          href="/management/program"
          endIcon={<OpenInNewIcon />}
          sx={{ mt: 2 }}
        >
          จัดการหลักสูตร
        </Button>
      </Box>
    );
  }

  const overview = buildCurriculumOverview(configData.programs);

  return (
    <Box sx={{ py: 2 }}>
      <Alert
        severity={overview.allValid ? "success" : "warning"}
        sx={{ mb: 3 }}
      >
        {overview.allValid
          ? "ทุกหลักสูตรผ่านเกณฑ์หน่วยกิตขั้นต่ำของกระทรวงศึกษาธิการ"
          : "มีหลักสูตรที่ยังไม่ผ่านเกณฑ์ ศธ. — แก้ไขก่อนเผยแพร่ตาราง"}
      </Alert>
      <Stack spacing={3}>
        {overview.programs.map((program) => (
          <Paper key={program.programId} variant="outlined" sx={{ p: 2.5 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1.5,
              }}
            >
              <Box>
                <Typography variant="h6">
                  ม.{program.year} · {program.programName}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                  }}
                >
                  {program.trackLabel} · {program.totalCredits}/
                  {program.requiredCredits} หน่วยกิต
                </Typography>
              </Box>
              <Chip
                label={program.isValid ? "ผ่านเกณฑ์" : "ไม่ผ่านเกณฑ์"}
                color={program.isValid ? "success" : "error"}
                size="small"
              />
            </Box>

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>กลุ่มสาระการเรียนรู้</TableCell>
                  <TableCell align="right">มี</TableCell>
                  <TableCell align="right">ขั้นต่ำ</TableCell>
                  <TableCell align="right">ขาด</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {program.learningAreas.map((area) => (
                  <TableRow key={area.label}>
                    <TableCell>{area.label}</TableCell>
                    <TableCell align="right">{area.current}</TableCell>
                    <TableCell align="right">{area.required}</TableCell>
                    <TableCell align="right">
                      {area.isMet ? (
                        "—"
                      ) : (
                        <Typography
                          component="span"
                          color="error"
                          variant="body2"
                        >
                          {area.deficit}
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {program.errors.length > 0 && (
              <Alert severity="error" sx={{ mt: 2 }}>
                <Stack spacing={0.5}>
                  {program.errors.map((err) => (
                    <span key={err}>{err}</span>
                  ))}
                </Stack>
              </Alert>
            )}
            {program.warnings.length > 0 && (
              <Alert severity="info" sx={{ mt: 1 }}>
                <Stack spacing={0.5}>
                  {program.warnings.map((warn) => (
                    <span key={warn}>{warn}</span>
                  ))}
                </Stack>
              </Alert>
            )}
          </Paper>
        ))}
      </Stack>
      <Button
        href="/management/program"
        endIcon={<OpenInNewIcon />}
        sx={{ mt: 3 }}
      >
        แก้ไขหลักสูตร
      </Button>
    </Box>
  );
}
