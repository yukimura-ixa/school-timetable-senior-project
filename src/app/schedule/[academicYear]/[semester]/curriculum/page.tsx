import { Alert, Box } from "@mui/material";

/**
 * Step 2 — Curriculum & MOE check. Placeholder shell; the per-program MOE
 * compliance panel is implemented separately.
 */
export default function CurriculumStepPage() {
  return (
    <Box sx={{ py: 2 }}>
      <Alert severity="info">
        ตรวจสอบหลักสูตรและความสอดคล้องกับเกณฑ์กระทรวงศึกษาธิการ — กำลังพัฒนา
      </Alert>
    </Box>
  );
}
