/**
 * OverviewSection Component
 * Displays 4 overview stat cards: total hours, completion rate, active teachers, schedule conflicts
 */

import { Box, Card, CardContent, Typography } from "@mui/material";
import {
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import type { OverviewStats } from "../../domain/types/analytics.types";

interface OverviewSectionProps {
  stats: OverviewStats;
}

export function OverviewSection({ stats }: OverviewSectionProps) {
  const statCards = [
    {
      title: "ชั่วโมงทั้งหมด",
      value: stats.totalScheduledHours.toLocaleString(),
      icon: <ScheduleIcon sx={{ fontSize: 40 }} />,
      color: "#2196f3", // Blue
      bgColor: "#e3f2fd",
    },
    {
      title: "ความสมบูรณ์",
      value: `${stats.completionRate.toFixed(1)}%`,
      icon: <CheckCircleIcon sx={{ fontSize: 40 }} />,
      color: "#4caf50", // Green
      bgColor: "#e8f5e9",
    },
    {
      title: "ครูที่ใช้งาน",
      value: stats.activeTeachers.toLocaleString(),
      icon: <PersonIcon sx={{ fontSize: 40 }} />,
      color: "#9c27b0", // Purple
      bgColor: "#f3e5f5",
    },
    {
      title: "ความขัดแย้ง",
      value: stats.scheduleConflicts.toLocaleString(),
      icon: <WarningIcon sx={{ fontSize: 40 }} />,
      color: stats.scheduleConflicts > 0 ? "#f44336" : "#4caf50", // Red or Green
      bgColor: stats.scheduleConflicts > 0 ? "#ffebee" : "#e8f5e9",
    },
  ];

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        📊 ภาพรวมตารางเรียน
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)",
          },
          gap: 3,
        }}
      >
        {statCards.map((card, index) => (
          <Box key={index}>
            <Card
              elevation={2}
              sx={{
                height: "100%",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 4,
                },
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontWeight: 500 }}
                  >
                    {card.title}
                  </Typography>
                  <Box
                    sx={{
                      bgcolor: card.bgColor,
                      color: card.color,
                      borderRadius: "50%",
                      width: 56,
                      height: 56,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {card.icon}
                  </Box>
                </Box>
                <Typography
                  variant="h4"
                  component="div"
                  sx={{ fontWeight: 700, color: card.color }}
                >
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Additional Stats */}
      <Box
        sx={{
          mt: 3,
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
          },
          gap: 2,
        }}
      >
        <Card elevation={1}>
          <CardContent>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              จำนวนระดับชั้น
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {stats.totalGrades} ระดับชั้น
            </Typography>
          </CardContent>
        </Card>
        <Card elevation={1}>
          <CardContent>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              จำนวนห้องเรียน
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {stats.totalRooms} ห้อง
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
