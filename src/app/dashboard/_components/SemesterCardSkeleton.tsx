"use client";

/**
 * SemesterCardSkeleton Component
 * Loading skeleton for SemesterCard
 */

import React from "react";
import {
  Card,
  CardContent,
  CardActions,
  Skeleton,
  Box,
  Stack,
} from "@mui/material";

export function SemesterCardSkeleton() {
  return (
    <Card
      sx={{
        minWidth: 300,
        maxWidth: 400,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardContent sx={{ flex: 1 }}>
        {/* Header with semester and status */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "start",
            mb: 2,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height={32} />
            <Skeleton variant="text" width="40%" height={24} sx={{ mt: 0.5 }} />
          </Box>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Skeleton variant="circular" width={24} height={24} />
            <Skeleton variant="rounded" width={80} height={24} />
          </Box>
        </Box>

        {/* Progress bar */}
        <Box sx={{ mb: 2 }}>
          <Box
            sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}
          >
            <Skeleton variant="text" width="40%" height={20} />
            <Skeleton variant="text" width="30%" height={20} />
          </Box>
          <Skeleton variant="rectangular" height={4} sx={{ borderRadius: 1 }} />
        </Box>

        {/* Statistics */}
        <Stack spacing={1} sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Skeleton variant="text" width="45%" height={20} />
            <Skeleton variant="text" width="20%" height={20} />
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Skeleton variant="text" width="45%" height={20} />
            <Skeleton variant="text" width="20%" height={20} />
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Skeleton variant="text" width="45%" height={20} />
            <Skeleton variant="text" width="20%" height={20} />
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Skeleton variant="text" width="45%" height={20} />
            <Skeleton variant="text" width="20%" height={20} />
          </Box>
        </Stack>

        {/* Last accessed */}
        <Skeleton variant="text" width="70%" height={16} />
      </CardContent>

      <CardActions sx={{ justifyContent: "space-between", px: 2, pb: 2 }}>
        <Skeleton
          variant="rectangular"
          width={80}
          height={36}
          sx={{ borderRadius: 1 }}
        />
        <Skeleton variant="circular" width={36} height={36} />
      </CardActions>
    </Card>
  );
}
