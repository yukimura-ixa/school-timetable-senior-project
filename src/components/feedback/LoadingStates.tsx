/**
 * Loading State Components
 * 
 * Skeleton loaders for better perceived performance.
 * Shows content structure while data loads.
 * 
 * Created: October 22, 2025
 * Priority: P1 - Critical UX
 */

"use client";

import React from "react";
import { Box, Skeleton, Card, Stack } from "@mui/material";

/**
 * Timetable grid skeleton (7 days × 5 periods)
 */
export function TimetableGridSkeleton() {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 2 }}>
      {Array.from({ length: 35 }).map((_, i) => (
        <Card key={i} sx={{ p: 2, minHeight: 100 }}>
          <Skeleton variant="text" width="60%" height={20} />
          <Skeleton variant="text" width="80%" height={16} sx={{ mt: 0.5 }} />
          <Skeleton variant="rectangular" height={40} sx={{ mt: 1, borderRadius: 1 }} />
        </Card>
      ))}
    </Box>
  );
}

/**
 * Subject list skeleton
 */
export function SubjectListSkeleton({ count = 8 }: { count?: number }) {
  return (
    <Stack spacing={1}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Skeleton variant="rectangular" width={40} height={40} sx={{ borderRadius: 1 }} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="40%" height={20} />
              <Skeleton variant="text" width="60%" height={16} />
            </Box>
            <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
          </Box>
        </Card>
      ))}
    </Stack>
  );
}

/**
 * Teacher list skeleton
 */
export function TeacherListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(3, 1fr)",
        },
        gap: 2,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Skeleton variant="circular" width={48} height={48} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="70%" height={20} />
              <Skeleton variant="text" width="50%" height={16} />
            </Box>
          </Box>
          <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 1 }} />
        </Card>
      ))}
    </Box>
  );
}

/**
 * Page loading skeleton (full page)
 */
export function PageLoadingSkeleton() {
  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Skeleton variant="text" width="30%" height={40} sx={{ mb: 2 }} />
      
      {/* Tabs */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
        <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
      </Box>

      {/* Main content */}
      <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Sidebar */}
        <Box sx={{ width: { xs: '100%', md: '300px' } }}>
          <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
        </Box>
        
        {/* Main area */}
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2, mb: 2 }} />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Skeleton variant="rectangular" width="50%" height={200} sx={{ borderRadius: 2 }} />
            <Skeleton variant="rectangular" width="50%" height={200} sx={{ borderRadius: 2 }} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

/**
 * Table skeleton
 */
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <Box>
      {/* Table header */}
      <Box sx={{ display: 'flex', gap: 2, mb: 1, px: 2, py: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} variant="text" width={`${100 / columns}%`} height={20} />
        ))}
      </Box>
      
      {/* Table rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <Box key={rowIndex} sx={{ display: 'flex', gap: 2, mb: 1, px: 2, py: 1.5 }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} variant="text" width={`${100 / columns}%`} height={16} />
          ))}
        </Box>
      ))}
    </Box>
  );
}

/**
 * Form skeleton
 */
export function FormSkeleton({ fields = 5 }: { fields?: number }) {
  return (
    <Stack spacing={3}>
      {Array.from({ length: fields }).map((_, i) => (
        <Box key={i}>
          <Skeleton variant="text" width="30%" height={20} sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
        </Box>
      ))}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Skeleton variant="rectangular" width={100} height={40} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" width={100} height={40} sx={{ borderRadius: 1 }} />
      </Box>
    </Stack>
  );
}

/**
 * Card skeleton
 */
export function CardSkeleton() {
  return (
    <Card sx={{ p: 2 }}>
      <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="80%" height={16} sx={{ mb: 2 }} />
      <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 1, mb: 2 }} />
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
      </Box>
    </Card>
  );
}
