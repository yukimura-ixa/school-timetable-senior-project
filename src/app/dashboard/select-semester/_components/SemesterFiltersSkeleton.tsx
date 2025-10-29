"use client";

/**
 * SemesterFiltersSkeleton Component
 * Loading skeleton for semester filters
 */

import React from "react";
import { Paper, Box, Skeleton, Stack } from "@mui/material";

export function SemesterFiltersSkeleton() {
  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={2}>
        {/* Filter Title */}
        <Skeleton variant="text" width={120} height={28} />

        {/* Filter Controls */}
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
          {/* Academic Year Filter */}
          <Skeleton variant="rectangular" width={200} height={56} sx={{ borderRadius: 1 }} />

          {/* Semester Filter */}
          <Skeleton variant="rectangular" width={150} height={56} sx={{ borderRadius: 1 }} />

          {/* Status Filter */}
          <Skeleton variant="rectangular" width={180} height={56} sx={{ borderRadius: 1 }} />

          {/* Search Input */}
          <Skeleton variant="rectangular" width={250} height={56} sx={{ borderRadius: 1 }} />

          {/* Reset Button */}
          <Skeleton variant="rectangular" width={100} height={40} sx={{ borderRadius: 1 }} />
        </Box>
      </Stack>
    </Paper>
  );
}
