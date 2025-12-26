"use client";

/**
 * ConfigContentSkeleton Component
 * Loading skeleton for config page sections
 */

import React from "react";
import { Box, Skeleton, Paper } from "@mui/material";

export function ConfigContentSkeleton() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header skeleton */}
      <Box>
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <Skeleton variant="rectangular" width={300} height={48} />
          <Skeleton variant="circular" width={32} height={32} />
        </Box>
        <Skeleton variant="text" width={200} />
      </Box>

      {/* Alert skeleton */}
      <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 1 }} />

      {/* Completeness indicator skeleton */}
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <Skeleton variant="circular" width={20} height={20} />
          <Skeleton variant="text" width={150} />
          <Skeleton
            variant="rectangular"
            width={60}
            height={24}
            sx={{ ml: "auto", borderRadius: 3 }}
          />
        </Box>
        <Skeleton
          variant="rectangular"
          height={8}
          sx={{ borderRadius: 1, mb: 1 }}
        />
        <Skeleton variant="text" width={250} />
        <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              width={80}
              height={24}
              sx={{ borderRadius: 3 }}
            />
          ))}
        </Box>
      </Paper>

      {/* Config sections skeleton */}
      {[1, 2, 3].map((i) => (
        <Paper key={i} sx={{ p: 3 }}>
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <Skeleton variant="circular" width={24} height={24} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width={200} />
              <Skeleton variant="text" width={300} />
            </Box>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {[1, 2, 3].map((j) => (
              <Box key={j} sx={{ display: "flex", gap: 2 }}>
                <Skeleton variant="circular" width={20} height={20} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="100%" />
                  <Skeleton variant="text" width="60%" />
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>
      ))}

      {/* Action buttons skeleton */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
        <Skeleton
          variant="rectangular"
          width={100}
          height={40}
          sx={{ borderRadius: 1 }}
        />
        <Skeleton
          variant="rectangular"
          width={100}
          height={40}
          sx={{ borderRadius: 1 }}
        />
        <Skeleton
          variant="rectangular"
          width={100}
          height={40}
          sx={{ borderRadius: 1 }}
        />
      </Box>
    </Box>
  );
}
