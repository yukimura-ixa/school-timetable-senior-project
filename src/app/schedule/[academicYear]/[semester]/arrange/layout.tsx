"use client";

/**
 * Arrange Editor Layout - Parallel Routes Container
 *
 * This layout orchestrates 4 independent parallel routes (slots):
 * - @header: Teacher selector, tabs, action buttons
 * - @palette: Subject search and draggable palette
 * - @grid: Timetable grid with DnD
 * - @inspector: Conflicts and progress indicators
 * - @modal: Intercepting routes for dialogs
 *
 * Each slot can load independently with its own loading state.
 * DnD context wraps the entire layout for drag-and-drop functionality.
 */

import React from "react";
import { Container, Box, Grid } from "@mui/material";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

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
  // DnD sensors for drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header Slot: Teacher selector + tabs + actions */}
        <Box sx={{ mb: 3 }} data-slot="header">
          {header}
        </Box>

        {/* Three-column layout */}
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

        {/* Modal Slot: Intercepting routes */}
        {modal}

        {/* Default children slot (rarely used) */}
        {children}
      </Container>
    </DndContext>
  );
}
