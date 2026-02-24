/**
 * Inspector Slot - Server Component
 *
 * Shows teacher schedule inspection info.
 * Conflict detection is under development.
 */

import { Alert, Stack, Typography } from "@mui/material";

export default async function InspectorSlot({
  searchParams,
}: {
  searchParams: Promise<{ teacher?: string }>;
}) {
  const params = await searchParams;
  const teacherParam = params.teacher;

  return (
    <Stack spacing={1} sx={{ p: 2, height: "100%" }}>
      <Typography variant="subtitle2" color="text.secondary">
        ตรวจสอบตารางสอน
      </Typography>
      <Alert severity="info" variant="outlined">
        {teacherParam
          ? "กำลังพัฒนาระบบตรวจสอบความขัดแย้ง"
          : "เลือกครูเพื่อดูข้อมูล"}
      </Alert>
    </Stack>
  );
}
