import React from "react";
import {
  Container,
  Box,
  Paper,
  Stack,
  Typography,
  Button,
} from "@mui/material";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import { prisma } from "@/lib/prisma";
import type { semester } from "@/prisma/generated/client";
import { ArrangeDndProvider } from "./_components/ArrangeDndProvider";

type LayoutProps = {
  children: React.ReactNode;
  header: React.ReactNode;
  palette: React.ReactNode;
  grid: React.ReactNode;
  inspector: React.ReactNode;
  params: Promise<{ academicYear: string; semester: string }>;
};

export default async function ArrangeLayout({
  children,
  header,
  palette,
  grid,
  inspector,
  params,
}: LayoutProps) {
  const { academicYear: yearStr, semester: semStr } = await params;
  const year = parseInt(yearStr, 10);
  const semNum = parseInt(semStr, 10);
  const semesterEnum = `SEMESTER_${semNum}` as semester;

  // Gate: at least one teacher must have a teaching responsibility for this
  // term before scheduling makes sense. Empty state directs to the assign
  // page so users learn the prerequisite instead of seeing a blank palette.
  const responsibilityCount = await prisma.teachers_responsibility.count({
    where: { AcademicYear: year, Semester: semesterEnum },
  });

  if (responsibilityCount === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Paper
          elevation={0}
          sx={{
            p: 5,
            textAlign: "center",
            border: "1px dashed",
            borderColor: "divider",
            borderRadius: 2,
          }}
        >
          <Stack
            spacing={2}
            sx={{
              alignItems: "center",
            }}
          >
            <AssignmentIndIcon
              color="primary"
              sx={{ fontSize: 56, opacity: 0.7 }}
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
              }}
            >
              ยังไม่มีครูที่ได้รับมอบหมายวิชา
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                maxWidth: 480,
              }}
            >
              ก่อนจะจัดตารางเรียน ต้องมอบหมายวิชาให้ครูในเทอมนี้ก่อน
              เพื่อให้ระบบรู้ว่ามีรายวิชาใดต้องวางลงในตาราง
            </Typography>
            <Button
              href={`/management/teacher-assignment?mode=by-grade&year=${yearStr}&semester=${semStr}`}
              variant="contained"
              size="large"
              startIcon={<AssignmentIndIcon />}
              sx={{ mt: 2 }}
            >
              ไปยังหน้ามอบหมายวิชา
            </Button>
          </Stack>
        </Paper>
      </Container>
    );
  }

  return (
    <Container
      maxWidth={false}
      sx={{ py: 4, px: { xs: 2, sm: 3 } }}
    >
      {/* Header Slot: Teacher selector + actions */}
      <Box sx={{ mb: 3 }} data-slot="header">
        {header}
      </Box>

      {/* Side-rail layout: palette left (240px sticky), grid right (flex-1). */}
      <ArrangeDndProvider>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
            alignItems: "flex-start",
          }}
        >
          <Box
            data-slot="palette"
            sx={{
              flex: { md: "0 0 240px" },
              width: { xs: "100%", md: 240 },
              position: "sticky",
              top: 16,
              alignSelf: "stretch",
            }}
          >
            {palette}
          </Box>
          <Box
            data-slot="grid"
            sx={{ flex: 1, minWidth: 0, width: "100%" }}
          >
            {grid}
            <Box data-slot="inspector" sx={{ mt: 2 }}>
              {inspector}
            </Box>
          </Box>
        </Box>
      </ArrangeDndProvider>

      {/* Default children slot (rarely used) */}
      {children}
    </Container>
  );
}
