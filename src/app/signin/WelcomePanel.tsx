"use client";

import { Paper, Typography } from "@mui/material";

/**
 * WelcomePanel - Client Component
 *
 * Static welcome panel for the signin page.
 * Displays the system title and description with gradient background.
 * Marked as "use client" because it uses MUI theme context via sx prop function.
 */
export default function WelcomePanel() {
  return (
    <Paper
      sx={{
        flex: 1,
        p: 4,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        background: (theme) =>
          `linear-gradient(180deg, ${theme.palette.primary.light}22 0%, ${theme.palette.primary.main}22 100%)`,
      }}
      elevation={0}
    >
      <Typography variant="h4" fontWeight={700} gutterBottom>
        School Timetable Management System
      </Typography>
      <Typography variant="body1" color="text.secondary">
        ระบบจัดตารางเรียนตารางสอนสำหรับแรกเรียน (มัธยม)
      </Typography>
    </Paper>
  );
}
