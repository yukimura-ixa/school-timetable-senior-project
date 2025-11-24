"use client";

/**
 * SemesterAnalyticsDashboardSkeleton Component
 * Loading skeleton for analytics dashboard
 */

import React from "react";
import { Box, Paper, Skeleton, Card, CardContent, Stack } from "@mui/material";
import Grid from "@mui/material/Grid";

export function SemesterAnalyticsDashboardSkeleton() {
  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <Skeleton variant="circular" width={24} height={24} />
        <Skeleton variant="text" width={150} height={32} />
      </Box>

      <Grid container spacing={3}>
        {/* Overview Stats - 4 cards */}
        {[...Array(4)].map((_, i) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={`stat-${i}`}>
            <Card variant="outlined">
              <CardContent>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
                >
                  <Skeleton variant="circular" width={20} height={20} />
                  <Skeleton variant="text" width="60%" height={20} />
                </Box>
                <Skeleton variant="text" width="50%" height={48} />
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Status Distribution */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent>
              <Skeleton variant="text" width={150} height={28} sx={{ mb: 2 }} />
              <Stack spacing={2}>
                {[...Array(4)].map((_, i) => (
                  <Box key={`status-${i}`}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 0.5,
                      }}
                    >
                      <Skeleton variant="rounded" width={100} height={24} />
                      <Skeleton variant="text" width={60} height={20} />
                    </Box>
                    <Skeleton
                      variant="rectangular"
                      height={8}
                      sx={{ borderRadius: 1 }}
                    />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Completeness Distribution */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent>
              <Skeleton variant="text" width={180} height={28} sx={{ mb: 2 }} />
              <Stack spacing={2}>
                {[...Array(3)].map((_, i) => (
                  <Box key={`complete-${i}`}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 0.5,
                      }}
                    >
                      <Skeleton variant="rounded" width={120} height={24} />
                      <Skeleton variant="text" width={60} height={20} />
                    </Box>
                    <Skeleton
                      variant="rectangular"
                      height={8}
                      sx={{ borderRadius: 1 }}
                    />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Resource Totals */}
        <Grid size={{ xs: 12 }}>
          <Card variant="outlined">
            <CardContent>
              <Skeleton variant="text" width={180} height={28} sx={{ mb: 2 }} />
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {[...Array(4)].map((_, i) => (
                  <Grid size={{ xs: 6, sm: 3 }} key={`resource-${i}`}>
                    <Box
                      sx={{
                        textAlign: "center",
                        p: 2,
                        bgcolor: "grey.50",
                        borderRadius: 1,
                      }}
                    >
                      <Skeleton
                        variant="circular"
                        width={40}
                        height={40}
                        sx={{ mx: "auto", mb: 1 }}
                      />
                      <Skeleton
                        variant="text"
                        width="60%"
                        height={32}
                        sx={{ mx: "auto" }}
                      />
                      <Skeleton
                        variant="text"
                        width="50%"
                        height={20}
                        sx={{ mx: "auto" }}
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Academic Years */}
        <Grid size={{ xs: 12 }}>
          <Card variant="outlined">
            <CardContent>
              <Skeleton variant="text" width={200} height={28} sx={{ mb: 2 }} />
              <Stack spacing={2}>
                {[...Array(5)].map((_, i) => (
                  <Box key={`year-${i}`}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 0.5,
                      }}
                    >
                      <Skeleton variant="text" width={80} height={24} />
                      <Skeleton variant="text" width={100} height={20} />
                    </Box>
                    <Skeleton
                      variant="rectangular"
                      height={8}
                      sx={{ borderRadius: 1 }}
                    />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Paper>
  );
}
