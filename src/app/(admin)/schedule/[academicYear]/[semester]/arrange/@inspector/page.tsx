/**
 * Inspector Slot - Server Component
 *
 * Fetches conflicts and progress data for the selected teacher.
 */

import { Alert, AlertTitle } from "@mui/material";

export default async function InspectorSlot({
  searchParams,
}: {
  searchParams: Promise<{ teacher?: string }>;
}) {
  const { teacher } = await searchParams;

  // No teacher selected - show empty state
  if (!teacher) {
    return (
      <Alert severity="info">
        <AlertTitle>เลือกครู</AlertTitle>
        เลือกครูเพื่อดูข้อมูลความขัดแย้งและความคืบหน้า
      </Alert>
    );
  }

  // TODO: Fetch conflicts and progress from database
  // For now, show placeholder

  return (
    <div>
      <Alert severity="success" sx={{ mb: 2 }}>
        <AlertTitle>ไม่มีความขัดแย้ง</AlertTitle>
        ตารางสอนไม่มีความขัดแย้ง
      </Alert>

      <Alert severity="info">
        <AlertTitle>ความคืบหน้า</AlertTitle>
        จัดแล้ว 0 คาบ / คาบที่ต้องจัด 0 คาบ
      </Alert>
    </div>
  );
}
