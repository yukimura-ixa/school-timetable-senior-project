"use client";

/**
 * SelectSemesterPageSkeleton Component
 * Full page loading skeleton for Select Semester Page
 */

import React from "react";
import { Container, Box, Skeleton } from "@mui/material";
import { SemesterSectionSkeleton } from "./SemesterSectionSkeleton";
import { SemesterFiltersSkeleton } from "./SemesterFiltersSkeleton";

export function SelectSemesterPageSkeleton() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Skeleton */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Skeleton variant="text" width={300} height={48} />
        <Box sx={{ display: "flex", gap: 2 }}>
          <Skeleton
            variant="rectangular"
            width={140}
            height={40}
            sx={{ borderRadius: 1 }}
          />
          <Skeleton
            variant="rectangular"
            width={180}
            height={40}
            sx={{ borderRadius: 1 }}
          />
        </Box>
      </Box>

      {/* Recent Semesters Skeleton */}
      <SemesterSectionSkeleton title="ล่าสุด" count={3} />

      {/* Pinned Semesters Skeleton */}
      <SemesterSectionSkeleton title="ปักหมุด" count={2} />

      {/* Filters Skeleton */}
      <Box sx={{ mb: 3 }}>
        <SemesterFiltersSkeleton />
      </Box>

      {/* All Semesters Skeleton */}
      <SemesterSectionSkeleton showTitle={false} count={6} />
    </Container>
  );
}
