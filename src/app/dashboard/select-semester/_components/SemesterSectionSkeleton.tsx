"use client";

/**
 * SemesterSectionSkeleton Component
 * Loading skeleton for semester sections (Recent/Pinned/All)
 */

import React from "react";
import { Box, Skeleton, Typography } from "@mui/material";
import { SemesterCardSkeleton } from "./SemesterCardSkeleton";

type Props = {
  title?: string;
  count?: number;
  showTitle?: boolean;
};

export function SemesterSectionSkeleton({ 
  title, 
  count = 3,
  showTitle = true,
}: Props) {
  return (
    <Box sx={{ mb: 4 }}>
      {showTitle && (
        <Box sx={{ mb: 2 }}>
          {title ? (
            <Typography variant="h6" gutterBottom>
              {title}
            </Typography>
          ) : (
            <Skeleton variant="text" width={120} height={36} />
          )}
        </Box>
      )}
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        {[...Array(count)].map((_, i) => (
          <Box key={i} sx={{ flex: "1 1 300px", maxWidth: 400 }}>
            <SemesterCardSkeleton />
          </Box>
        ))}
      </Box>
    </Box>
  );
}
