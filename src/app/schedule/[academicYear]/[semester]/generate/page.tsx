import { Alert, Box } from "@mui/material";

/**
 * Step 4 — Whole-school auto-generate. Placeholder shell; the headline
 * generate action (POST /api/schedule/auto-arrange-all) and results panel
 * are implemented separately.
 */
export default function GenerateStepPage() {
  return (
    <Box sx={{ py: 2 }}>
      <Alert severity="info">
        สร้างตารางสอนอัตโนมัติทั้งโรงเรียน — กำลังพัฒนา
      </Alert>
    </Box>
  );
}
