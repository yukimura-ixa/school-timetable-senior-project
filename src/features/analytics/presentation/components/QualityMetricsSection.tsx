/**
 * Quality Metrics Section Component
 * Analytics Dashboard - Phase 2
 * 
 * Displays schedule quality metrics including completion rate,
 * lock status, and quality indicators
 */

import { Box, Typography, Card, CardContent, Chip, LinearProgress } from "@mui/material";
import {
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from "@mui/icons-material";

// Import types
import type { QualityMetrics } from "@/features/analytics/infrastructure/repositories/quality.repository";

interface QualityMetricsSectionProps {
  metrics: QualityMetrics;
  qualityCheck: {
    isAcceptable: boolean;
    reasons: string[];
  };
}

export function QualityMetricsSection({ metrics, qualityCheck }: QualityMetricsSectionProps) {
  // Determine completion status and color
  const getCompletionStatus = (rate: number): { status: string; color: string; icon: React.ReactNode } => {
    if (rate >= 95) {
      return { status: "เสร็จสมบูรณ์", color: "#10b981", icon: <CheckIcon /> };
    } else if (rate >= 70) {
      return { status: "ใกล้เสร็จสมบูรณ์", color: "#3b82f6", icon: <InfoIcon /> };
    } else if (rate >= 10) {
      return { status: "กำลังดำเนินการ", color: "#f59e0b", icon: <WarningIcon /> };
    } else {
      return { status: "ยังไม่เริ่ม", color: "#ef4444", icon: <ErrorIcon /> };
    }
  };

  const completion = getCompletionStatus(metrics.completionRate);

  return (
    <Box sx={{ mb: 4 }}>
      {/* Section Header */}
      <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        ✨ คุณภาพตารางเรียน
      </Typography>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" }, gap: 3 }}>
        {/* Completion Card */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {completion.icon}
              ความสมบูรณ์ของตาราง
            </Typography>

            {/* Completion Rate Gauge */}
            <Box sx={{ my: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Chip
                  label={completion.status}
                  sx={{ bgcolor: completion.color, color: "white", fontWeight: 600 }}
                  size="small"
                />
                <Typography variant="h4" sx={{ fontWeight: 700, color: completion.color }}>
                  {metrics.completionRate.toFixed(1)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={metrics.completionRate}
                sx={{
                  height: 12,
                  borderRadius: 2,
                  bgcolor: "grey.200",
                  "& .MuiLinearProgress-bar": {
                    bgcolor: completion.color,
                    borderRadius: 2,
                  },
                }}
              />
            </Box>

            {/* Stats Grid */}
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2, mt: 3 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  ความขัดแย้ง
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: metrics.totalConflicts > 0 ? "#ef4444" : "#10b981" }}>
                  {metrics.totalConflicts}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  ครูที่ใช้งาน
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: "#10b981" }}>
                  {metrics.activeTeachers}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  คะแนนสมดุล
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: "#3b82f6" }}>
                  {metrics.balanceScore}/100
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Additional Metrics Card */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              ตัวชี้วัดเพิ่มเติม
            </Typography>

            {/* Additional Stats */}
            <Box sx={{ mt: 3 }}>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <Typography variant="body2">สัดส่วนการล็อกตาราง</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {metrics.lockedPercentage.toFixed(1)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={metrics.lockedPercentage}
                  sx={{
                    height: 8,
                    borderRadius: 1,
                    bgcolor: "grey.200",
                    "& .MuiLinearProgress-bar": {
                      bgcolor: "#f59e0b",
                    },
                  }}
                />
              </Box>

              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    จำนวนชั้นเรียน
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {metrics.totalGrades}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    ครูทั้งหมด
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {metrics.activeTeachers}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Balance Score */}
            <Box sx={{ mt: 3, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                คะแนนความสมดุลโดยรวม
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: "#3b82f6" }}>
                  {metrics.balanceScore}
                </Typography>
                <Box sx={{ flex: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={metrics.balanceScore}
                    sx={{
                      height: 10,
                      borderRadius: 1,
                      bgcolor: "grey.300",
                      "& .MuiLinearProgress-bar": {
                        bgcolor: metrics.balanceScore >= 70 ? "#10b981" : metrics.balanceScore >= 50 ? "#f59e0b" : "#ef4444",
                      },
                    }}
                  />
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                คะแนนเต็ม 100 (คำนวณจากความสมบูรณ์และการล็อก)
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Quality Check Results */}
      {!qualityCheck.isAcceptable && qualityCheck.reasons.length > 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <WarningIcon color="warning" />
              ประเด็นที่ต้องปรับปรุง
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 2 }}>
              {qualityCheck.reasons.map((reason, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    p: 1.5,
                    bgcolor: "#fff3cd",
                    borderRadius: 1,
                    border: 1,
                    borderColor: "#f59e0b",
                  }}
                >
                  <WarningIcon fontSize="small" sx={{ color: "#f59e0b" }} />
                  <Typography variant="body2">{reason}</Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Success Message when quality is good */}
      {qualityCheck.isAcceptable && metrics.completionRate >= 95 && (
        <Card sx={{ mt: 3, bgcolor: "#d1fae5", borderColor: "#10b981", borderWidth: 1, borderStyle: "solid" }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <CheckIcon sx={{ fontSize: 48, color: "#10b981" }} />
              <Box>
                <Typography variant="h6" sx={{ color: "#10b981", fontWeight: 600 }}>
                  คุณภาพตารางดีมาก!
                </Typography>
                <Typography variant="body2" sx={{ color: "#059669" }}>
                  ตารางเรียนมีความสมบูรณ์และไม่พบประเด็นที่ต้องปรับปรุง
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
