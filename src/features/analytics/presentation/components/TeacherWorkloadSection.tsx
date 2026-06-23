/**
 * TeacherWorkloadSection Component
 * Displays teacher workload analysis with bar chart visualization
 */

import { Box, Card, CardContent, Typography, Chip } from "@mui/material";
import type { TeacherWorkload } from "../../domain/types/analytics.types";

interface TeacherWorkloadSectionProps {
  workloads: TeacherWorkload[];
}

export function TeacherWorkloadSection({
  workloads,
}: TeacherWorkloadSectionProps) {
  // Sort by total hours descending
  const sortedWorkloads = [...workloads].sort(
    (a, b) => b.totalHours - a.totalHours,
  );

  // Get workload status color
  const getStatusColor = (
    status: string,
  ):
    | "default"
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning" => {
    switch (status) {
      case "underutilized":
        return "info";
      case "optimal":
        return "success";
      case "high":
        return "warning";
      case "overloaded":
        return "error";
      default:
        return "default";
    }
  };

  // Get status label
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "underutilized":
        return "ใช้งานต่ำ";
      case "optimal":
        return "เหมาะสม";
      case "high":
        return "สูง";
      case "overloaded":
        return "สูงเกินไป";
      default:
        return status;
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        👥 การกระจายภาระงานสอน
      </Typography>
      <Card elevation={2}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            สรุปภาระงานสอนของครู
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              mb: 3,
            }}
          >
            แสดงจำนวนชั่วโมงสอนของครูแต่ละคน เรียงจากมากไปน้อย
          </Typography>

          {/* Teacher List */}
          <Box sx={{ maxHeight: 600, overflowY: "auto" }}>
            {sortedWorkloads.length === 0 ? (
              <Typography
                variant="body2"
                align="center"
                sx={{
                  color: "text.secondary",
                }}
              >
                ไม่มีข้อมูลภาระงานสอน
              </Typography>
            ) : (
              sortedWorkloads.map((workload) => (
                <Box
                  key={workload.teacherId}
                  sx={{
                    p: 2,
                    mb: 2,
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 1,
                    "&:hover": {
                      bgcolor: "action.hover",
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {workload.teacherName}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.secondary",
                        }}
                      >
                        {workload.department || "ไม่ระบุแผนก"}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: "right" }}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {workload.totalHours} ชม.
                      </Typography>
                      <Chip
                        label={getStatusLabel(workload.workloadStatus)}
                        color={getStatusColor(workload.workloadStatus)}
                        size="small"
                      />
                    </Box>
                  </Box>

                  {/* Visual bar */}
                  <Box
                    sx={{
                      width: "100%",
                      height: 8,
                      bgcolor: "grey.200",
                      borderRadius: 1,
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        width: `${Math.min((workload.totalHours / 40) * 100, 100)}%`,
                        height: "100%",
                        bgcolor:
                          workload.workloadStatus === "overloaded"
                            ? "error.main"
                            : workload.workloadStatus === "high"
                              ? "warning.main"
                              : workload.workloadStatus === "optimal"
                                ? "success.main"
                                : "info.main",
                        transition: "width 0.3s ease",
                      }}
                    />
                  </Box>
                </Box>
              ))
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
