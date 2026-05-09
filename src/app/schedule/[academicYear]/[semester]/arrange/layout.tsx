import React from "react";
import Link from "next/link";
import { Container, Box, Grid, Paper, Stack, Typography, Button } from "@mui/material";
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
  modal: React.ReactNode;
  params: Promise<{ academicYear: string; semester: string }>;
};

export default async function ArrangeLayout({
  children,
  header,
  palette,
  grid,
  inspector,
  modal,
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
          <Stack spacing={2} alignItems="center">
            <AssignmentIndIcon
              color="primary"
              sx={{ fontSize: 56, opacity: 0.7 }}
            />
            <Typography variant="h6" fontWeight="bold">
              ยังไม่มีครูที่ได้รับมอบหมายวิชา
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 480 }}>
              ก่อนจะจัดตารางเรียน ต้องมอบหมายวิชาให้ครูในเทอมนี้ก่อน
              เพื่อให้ระบบรู้ว่ามีรายวิชาใดต้องวางลงในตาราง
            </Typography>
            <Button
              component={Link}
              href={`/schedule/${yearStr}/${semStr}/assign`}
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
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Slot: Teacher selector + actions */}
      <Box sx={{ mb: 3 }} data-slot="header">
        {header}
      </Box>

      {/* Timetable spans full width; palette + inspector sit below as
          companion panels. DndContext wraps the whole arrangement so DnD
          flows from palette → grid (and inspector → grid via conflicts). */}
      <ArrangeDndProvider>
        <Stack spacing={2}>
          <Box data-slot="grid" sx={{ width: "100%" }}>
            {grid}
          </Box>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }} data-slot="palette">
              {palette}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }} data-slot="inspector">
              {inspector}
            </Grid>
          </Grid>
        </Stack>
      </ArrangeDndProvider>

      {/* Modal Slot: Intercepting routes */}
      {modal}

      {/* Default children slot (rarely used) */}
      {children}
    </Container>
  );
}
