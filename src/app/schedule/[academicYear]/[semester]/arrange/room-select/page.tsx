/**
 * Room Selection - Full Page Route
 *
 * This is the "real" route that shows when:
 * - User refreshes while modal is open
 * - User navigates directly to this URL
 * - Modal intercept fails
 */

import { Suspense } from "react";
import {
  Container,
  Paper,
  Typography,
  CircularProgress,
  Box,
} from "@mui/material";
import { RoomSelectionContent } from "./_components/RoomSelectionContent";

export default async function RoomSelectPage({
  searchParams,
}: {
  searchParams: Promise<{
    timeslot?: string;
    subject?: string;
    grade?: string;
    teacher?: string;
    resp?: string;
  }>;
}) {
  const params = await searchParams;
  const { timeslot, subject, grade, teacher, resp } = params;

  if (!timeslot || !subject || !grade || !teacher) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography color="error">
            ข้อมูลไม่ครบถ้วน กรุณากลับไปหน้าจัดตารางสอน
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          เลือกห้องเรียน
        </Typography>

        <Suspense
          fallback={
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          }
        >
          <RoomSelectionContent
            timeslot={timeslot}
            subject={subject}
            grade={grade}
            teacher={teacher}
            resp={resp || ""}
          />
        </Suspense>
      </Paper>
    </Container>
  );
}
