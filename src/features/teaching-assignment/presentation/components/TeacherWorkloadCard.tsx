import { Box, Card, LinearProgress, Typography } from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ScheduleIcon from "@mui/icons-material/Schedule";
import SubjectIcon from "@mui/icons-material/Subject";
import ClassIcon from "@mui/icons-material/Class";

export interface TeacherWorkloadCardProps {
  teachHour: number;
  subjectCount: number;
  classCount: number;
  warningThreshold?: number;
}

const DEFAULT_THRESHOLD = 22;

export function TeacherWorkloadCard({
  teachHour,
  subjectCount,
  classCount,
  warningThreshold = DEFAULT_THRESHOLD,
}: TeacherWorkloadCardProps) {
  const isOverloaded = teachHour > warningThreshold;
  const progressValue = Math.min((teachHour / warningThreshold) * 100, 100);

  return (
    <Card sx={{ p: 3 }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
          gap: 2,
        }}
      >
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <ScheduleIcon fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              ชั่วโมงสอน/สัปดาห์
            </Typography>
          </Box>
          <Typography
            variant="h4"
            data-testid="workload-teach-hour"
            color={isOverloaded ? "error.main" : "text.primary"}
          >
            {teachHour}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={progressValue}
            color={isOverloaded ? "error" : "primary"}
            sx={{ mt: 1 }}
          />
          {isOverloaded && (
            <Box
              data-testid="workload-warning"
              sx={{
                mt: 1,
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                color: "error.main",
              }}
            >
              <WarningAmberIcon fontSize="small" />
              <Typography variant="caption">
                เกินเกณฑ์ {warningThreshold} ชั่วโมง
              </Typography>
            </Box>
          )}
        </Box>

        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <SubjectIcon fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              วิชาที่สอน
            </Typography>
          </Box>
          <Typography variant="h4" data-testid="workload-subject-count">
            {subjectCount}
          </Typography>
        </Box>

        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <ClassIcon fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              ชั้นเรียน
            </Typography>
          </Box>
          <Typography variant="h4" data-testid="workload-class-count">
            {classCount}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
}
