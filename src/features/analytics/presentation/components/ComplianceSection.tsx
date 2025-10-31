/**
 * Compliance Section Component
 * Analytics Dashboard - Phase 2
 * 
 * Displays curriculum compliance checking for each program
 * including credit requirements and mandatory subjects
 */

import { Box, Typography, Card, CardContent, Chip, LinearProgress, List, ListItem, ListItemText } from "@mui/material";
import {
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Assignment as AssignmentIcon,
  School as SchoolIcon,
} from "@mui/icons-material";
import type { ProgramCompliance } from "@/features/analytics/domain/types/analytics.types";

interface ComplianceSectionProps {
  programCompliance: ProgramCompliance[];
}

export function ComplianceSection({ programCompliance }: ComplianceSectionProps) {
  // Calculate overall compliance stats
  const totalPrograms = programCompliance.length;
  const fullyCompliant = programCompliance.filter((p) => p.complianceStatus === 'compliant').length;
  const complianceRate = totalPrograms > 0 ? (fullyCompliant / totalPrograms) * 100 : 0;

  // Get compliance status for a program
  const getComplianceStatus = (status: 'non-compliant' | 'partial' | 'near-complete' | 'compliant'): { label: string; color: string } => {
    switch (status) {
      case 'compliant':
        return { label: "ผ่านเกณฑ์", color: "#10b981" };
      case 'near-complete':
        return { label: "ใกล้เสร็จสมบูรณ์", color: "#3b82f6" };
      case 'partial':
        return { label: "บางส่วน", color: "#f59e0b" };
      case 'non-compliant':
        return { label: "ยังไม่ผ่าน", color: "#ef4444" };
    }
  };

  // Get credit status color
  const getCreditStatusColor = (current: number, required: number): string => {
    if (current >= required) return "#10b981"; // Green
    if (current >= required * 0.8) return "#f59e0b"; // Orange
    return "#ef4444"; // Red
  };

  return (
    <Box sx={{ mb: 4 }}>
      {/* Section Header */}
      <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        📋 การตรวจสอบหลักสูตร
      </Typography>

      {/* Overall Compliance Summary */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            ภาพรวมการปฏิบัติตามหลักสูตร
          </Typography>
          
          <Box sx={{ my: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Typography variant="body2">
                อัตราการปฏิบัติตามหลักสูตร
              </Typography>
              <Chip
                label={`${fullyCompliant}/${totalPrograms} แผนการเรียน`}
                color={complianceRate >= 80 ? "success" : complianceRate >= 50 ? "warning" : "error"}
                size="small"
              />
            </Box>
            <LinearProgress
              variant="determinate"
              value={complianceRate}
              sx={{
                height: 12,
                borderRadius: 2,
                bgcolor: "grey.200",
                "& .MuiLinearProgress-bar": {
                  bgcolor: complianceRate >= 80 ? "#10b981" : complianceRate >= 50 ? "#f59e0b" : "#ef4444",
                  borderRadius: 2,
                },
              }}
            />
            <Typography variant="h4" sx={{ mt: 2, fontWeight: 700, color: complianceRate >= 80 ? "#10b981" : "#f59e0b" }}>
              {complianceRate.toFixed(1)}%
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Program Compliance Cards */}
      {programCompliance.length === 0 ? (
        <Card>
          <CardContent>
            <Box sx={{ py: 4, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                ไม่มีข้อมูลแผนการเรียน
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }, gap: 3 }}>
          {programCompliance.map((program) => {
            const status = getComplianceStatus(program.complianceStatus);
            const totalCurrentCredits = program.scheduledCredits.total;
            const totalRequiredCredits = program.requiredCredits.total;
            const creditProgress = totalRequiredCredits > 0 ? (totalCurrentCredits / totalRequiredCredits) * 100 : 0;

            return (
              <Card
                key={program.programId}
                sx={{
                  position: "relative",
                  "&:hover": {
                    boxShadow: 6,
                    transform: "translateY(-2px)",
                    transition: "all 0.3s ease",
                  },
                }}
              >
                <CardContent>
                  {/* Program Header */}
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <SchoolIcon color="primary" />
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {program.programName}
                      </Typography>
                    </Box>
                    <Chip
                      icon={program.complianceStatus === 'compliant' ? <CheckIcon /> : <CancelIcon />}
                      label={status.label}
                      size="small"
                      sx={{
                        bgcolor: status.color,
                        color: "white",
                        fontWeight: 600,
                      }}
                    />
                  </Box>

                  {/* Overall Credit Progress */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        หน่วยกิตรวม
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {totalCurrentCredits}/{totalRequiredCredits} หน่วย
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(creditProgress, 100)}
                      sx={{
                        height: 8,
                        borderRadius: 1,
                        bgcolor: "grey.200",
                        "& .MuiLinearProgress-bar": {
                          bgcolor: getCreditStatusColor(totalCurrentCredits, totalRequiredCredits),
                        },
                      }}
                    />
                  </Box>

                  {/* Credit Breakdown */}
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
                    {/* Core Credits */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography variant="caption" color="text.secondary">
                        • วิชาแกน
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 600,
                          color: getCreditStatusColor(program.scheduledCredits.core, program.requiredCredits.core),
                        }}
                      >
                        {program.scheduledCredits.core}/{program.requiredCredits.core}
                      </Typography>
                    </Box>

                    {/* Additional Credits */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography variant="caption" color="text.secondary">
                        • วิชาเพิ่มเติม
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 600,
                          color: getCreditStatusColor(program.scheduledCredits.additional, program.requiredCredits.additional),
                        }}
                      >
                        {program.scheduledCredits.additional}/{program.requiredCredits.additional}
                      </Typography>
                    </Box>

                    {/* Activity Credits */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography variant="caption" color="text.secondary">
                        • กิจกรรม
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 600,
                          color: getCreditStatusColor(program.scheduledCredits.activity, program.requiredCredits.activity),
                        }}
                      >
                        {program.scheduledCredits.activity}/{program.requiredCredits.activity}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Missing Mandatory Subjects */}
                  {program.missingMandatorySubjects.length > 0 && (
                    <Box sx={{ mt: 2, p: 1.5, bgcolor: "#fff3cd", borderRadius: 1, border: 1, borderColor: "#f59e0b" }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: "#f59e0b", display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
                        <AssignmentIcon fontSize="small" />
                        วิชาบังคับที่ยังขาด ({program.missingMandatorySubjects.length})
                      </Typography>
                      <List dense disablePadding>
                        {program.missingMandatorySubjects.slice(0, 3).map((subject) => (
                          <ListItem key={subject.subjectCode} disablePadding sx={{ pl: 2 }}>
                            <ListItemText
                              primary={
                                <Typography variant="caption">
                                  • {subject.subjectCode} - {subject.subjectName}
                                </Typography>
                              }
                            />
                          </ListItem>
                        ))}
                        {program.missingMandatorySubjects.length > 3 && (
                          <Typography variant="caption" sx={{ pl: 2, color: "text.secondary", fontStyle: "italic" }}>
                            และอีก {program.missingMandatorySubjects.length - 3} รายวิชา...
                          </Typography>
                        )}
                      </List>
                    </Box>
                  )}

                  {/* Success indicator */}
                  {program.complianceStatus === 'compliant' && program.missingMandatorySubjects.length === 0 && (
                    <Box sx={{ mt: 2, p: 1.5, bgcolor: "#d1fae5", borderRadius: 1, display: "flex", alignItems: "center", gap: 1 }}>
                      <CheckIcon sx={{ color: "#10b981", fontSize: 20 }} />
                      <Typography variant="caption" sx={{ color: "#059669", fontWeight: 600 }}>
                        ปฏิบัติตามหลักสูตรครบถ้วน
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
