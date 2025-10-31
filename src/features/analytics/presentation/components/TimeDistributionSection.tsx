/**
 * Time Distribution Section Component
 * Analytics Dashboard - Phase 2
 * 
 * Displays period and day load distribution with charts
 * showing workload across time periods and weekdays
 */

import { Box, Typography, Card, CardContent, Chip } from "@mui/material";
import { Schedule as ScheduleIcon, Event as EventIcon } from "@mui/icons-material";
import type { PeriodDistribution, DayDistribution } from "@/features/analytics/infrastructure/repositories/time.repository";

interface TimeDistributionSectionProps {
  periodDistribution: PeriodDistribution[];
  dayDistribution: DayDistribution[];
}

export function TimeDistributionSection({ periodDistribution, dayDistribution }: TimeDistributionSectionProps) {
  // Find peak and least utilized periods
  const maxPeriodLoad = Math.max(...periodDistribution.map((p) => p.totalSchedules), 0);
  const minPeriodLoad = Math.min(...periodDistribution.map((p) => p.totalSchedules), 0);
  const peakPeriods = periodDistribution.filter((p) => p.totalSchedules === maxPeriodLoad);
  const leastPeriods = periodDistribution.filter((p) => p.totalSchedules === minPeriodLoad);

  // Find busiest and quietest days
  const maxDayLoad = Math.max(...dayDistribution.map((d) => d.totalSchedules), 0);
  const minDayLoad = Math.min(...dayDistribution.map((d) => d.totalSchedules), 0);
  const busiestDays = dayDistribution.filter((d) => d.totalSchedules === maxDayLoad);
  const quietestDays = dayDistribution.filter((d) => d.totalSchedules === minDayLoad);

  // Day name mapping
  const dayNames: Record<string, string> = {
    MON: "จันทร์",
    TUE: "อังคาร",
    WED: "พุธ",
    THU: "พฤหัสบดี",
    FRI: "ศุกร์",
    SAT: "เสาร์",
    SUN: "อาทิตย์",
  };

  // Calculate average loads
  const avgPeriodLoad = periodDistribution.length > 0
    ? periodDistribution.reduce((sum, p) => sum + p.totalSchedules, 0) / periodDistribution.length
    : 0;
  const avgDayLoad = dayDistribution.length > 0
    ? dayDistribution.reduce((sum, d) => sum + d.totalSchedules, 0) / dayDistribution.length
    : 0;

  return (
    <Box sx={{ mb: 4 }}>
      {/* Section Header */}
      <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        ⏰ การกระจายช่วงเวลา
      </Typography>

      {/* Period Distribution Chart */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ScheduleIcon />
            การกระจายภาระตามคาบเรียน
          </Typography>

          {periodDistribution.length === 0 ? (
            <Box sx={{ py: 4, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                ไม่มีข้อมูลการกระจายคาบเรียน
              </Typography>
            </Box>
          ) : (
            <>
              {/* Period Bars */}
              <Box sx={{ mt: 3 }}>
                {periodDistribution.map((period) => {
                  const percentage = maxPeriodLoad > 0 ? (period.totalSchedules / maxPeriodLoad) * 100 : 0;
                  const isHigh = period.totalSchedules > avgPeriodLoad * 1.2;
                  const isLow = period.totalSchedules < avgPeriodLoad * 0.8;

                  return (
                    <Box key={period.period} sx={{ mb: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 80 }}>
                          คาบที่ {period.period}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Chip
                            label={`${period.totalSchedules} คาบ`}
                            size="small"
                            color={isHigh ? "error" : isLow ? "warning" : "success"}
                          />
                          {period.totalSchedules === maxPeriodLoad && (
                            <Chip label="🔥 ยอดนิยม" size="small" color="error" />
                          )}
                          {period.totalSchedules === minPeriodLoad && (
                            <Chip label="💤 น้อยที่สุด" size="small" color="default" />
                          )}
                        </Box>
                      </Box>
                      <Box
                        sx={{
                          position: "relative",
                          height: 32,
                          bgcolor: "grey.100",
                          borderRadius: 1,
                          overflow: "hidden",
                        }}
                      >
                        <Box
                          sx={{
                            position: "absolute",
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: `${percentage}%`,
                            bgcolor: isHigh ? "#ef4444" : isLow ? "#f59e0b" : "#10b981",
                            transition: "width 0.3s ease",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            pr: 1,
                          }}
                        >
                          <Typography variant="caption" sx={{ color: "white", fontWeight: 600 }}>
                            {percentage.toFixed(1)}%
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  );
                })}
              </Box>

              {/* Summary */}
              <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: "divider" }}>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 2 }}>
                  <Box sx={{ p: 2, bgcolor: "#fef3c7", borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      คาบเรียนยอดนิยม
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {peakPeriods.map((p) => `คาบที่ ${p.period}`).join(", ")}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {maxPeriodLoad} คาบ
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2, bgcolor: "#dbeafe", borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      ค่าเฉลี่ยต่อคาบ
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {avgPeriodLoad.toFixed(1)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      คาบ
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2, bgcolor: "#e0e7ff", borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      คาบเรียนน้อยที่สุด
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {leastPeriods.map((p) => `คาบที่ ${p.period}`).join(", ")}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {minPeriodLoad} คาบ
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </>
          )}
        </CardContent>
      </Card>

      {/* Day Distribution Chart */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <EventIcon />
            การกระจายภาระตามวัน
          </Typography>

          {dayDistribution.length === 0 ? (
            <Box sx={{ py: 4, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                ไม่มีข้อมูลการกระจายตามวัน
              </Typography>
            </Box>
          ) : (
            <>
              {/* Day Bars */}
              <Box sx={{ mt: 3 }}>
                {dayDistribution.map((day) => {
                  const percentage = maxDayLoad > 0 ? (day.totalSchedules / maxDayLoad) * 100 : 0;
                  const isHigh = day.totalSchedules > avgDayLoad * 1.1;
                  const isLow = day.totalSchedules < avgDayLoad * 0.9;

                  return (
                    <Box key={day.day} sx={{ mb: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 80 }}>
                          {dayNames[day.day] || day.day}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Chip
                            label={`${day.totalSchedules} คาบ`}
                            size="small"
                            color={isHigh ? "error" : isLow ? "warning" : "success"}
                          />
                          {day.totalSchedules === maxDayLoad && (
                            <Chip label="📅 วันที่ยุ่งที่สุด" size="small" color="error" />
                          )}
                          {day.totalSchedules === minDayLoad && (
                            <Chip label="🌤️ วันที่ว่างที่สุด" size="small" color="default" />
                          )}
                        </Box>
                      </Box>
                      <Box
                        sx={{
                          position: "relative",
                          height: 32,
                          bgcolor: "grey.100",
                          borderRadius: 1,
                          overflow: "hidden",
                        }}
                      >
                        <Box
                          sx={{
                            position: "absolute",
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: `${percentage}%`,
                            bgcolor: isHigh ? "#ef4444" : isLow ? "#f59e0b" : "#3b82f6",
                            transition: "width 0.3s ease",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            pr: 1,
                          }}
                        >
                          <Typography variant="caption" sx={{ color: "white", fontWeight: 600 }}>
                            {percentage.toFixed(1)}%
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  );
                })}
              </Box>

              {/* Summary */}
              <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: "divider" }}>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 2 }}>
                  <Box sx={{ p: 2, bgcolor: "#fecaca", borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      วันที่ยุ่งที่สุด
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {busiestDays.map((d) => dayNames[d.day] || d.day).join(", ")}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {maxDayLoad} คาบ
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2, bgcolor: "#dbeafe", borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      ค่าเฉลี่ยต่อวัน
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {avgDayLoad.toFixed(1)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      คาบ
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2, bgcolor: "#d1fae5", borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      วันที่ว่างที่สุด
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {quietestDays.map((d) => dayNames[d.day] || d.day).join(", ")}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {minDayLoad} คาบ
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
