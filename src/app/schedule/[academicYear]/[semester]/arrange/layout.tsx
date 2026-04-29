"use client";

import React from "react";
import { Container, Box, Grid } from "@mui/material";
import { ArrangeDndProvider } from "./_components/ArrangeDndProvider";

export default function ArrangeLayout({
  children,
  header,
  palette,
  grid,
  inspector,
  modal,
}: {
  children: React.ReactNode;
  header: React.ReactNode;
  palette: React.ReactNode;
  grid: React.ReactNode;
  inspector: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Slot: Teacher selector + tabs + actions */}
      <Box sx={{ mb: 3 }} data-slot="header">
        {header}
      </Box>

      {/* Three-column layout — DndContext wraps palette + grid so DnD works across slots */}
      <ArrangeDndProvider>
        <Grid container spacing={2}>
          {/* Left: Subject Palette */}
          <Grid size={{ xs: 12, md: 3 }} data-slot="palette">
            {palette}
          </Grid>

          {/* Center: Timetable Grid */}
          <Grid size={{ xs: 12, md: 6 }} data-slot="grid">
            {grid}
          </Grid>

          {/* Right: Inspector (conflicts + progress) */}
          <Grid size={{ xs: 12, md: 3 }} data-slot="inspector">
            {inspector}
          </Grid>
        </Grid>
      </ArrangeDndProvider>

      {/* Modal Slot: Intercepting routes */}
      {modal}

      {/* Default children slot (rarely used) */}
      {children}
    </Container>
  );
}
