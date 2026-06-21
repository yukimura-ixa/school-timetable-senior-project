import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import type { SvgIconComponent } from "@mui/icons-material";
import type { semester } from "@/prisma/generated/client";
import { dashboardRepository } from "@/features/dashboard/infrastructure/repositories/dashboard.repository";
import {
  countTeachersWithSchedules,
  countClassCompletion,
  detectConflicts,
} from "@/features/dashboard/domain/services/dashboard-stats.service";
import { getPublishReadiness } from "@/features/config/application/services/publish-readiness-query.service";
import {
  buildActionItems,
  type ActionItem,
  type ActionSeverity,
} from "@/features/dashboard/domain/services/action-items.service";

const severityConfig: Record<
  ActionSeverity,
  { color: "error" | "warning" | "info"; Icon: SvgIconComponent }
> = {
  error: { color: "error", Icon: ReportProblemIcon },
  warning: { color: "warning", Icon: WarningAmberIcon },
  info: { color: "info", Icon: InfoOutlinedIcon },
};

function ActionRow({ item }: { item: ActionItem }) {
  const { color, Icon } = severityConfig[item.severity];
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        p: 1.75,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        borderLeftWidth: 4,
        borderLeftColor: `${color}.main`,
        bgcolor: "background.paper",
        transition: "box-shadow .15s",
        "&:hover": { boxShadow: 2 },
      }}
    >
      <Box
        sx={{
          flex: "0 0 auto",
          width: 38,
          height: 38,
          borderRadius: 1.5,
          display: "grid",
          placeItems: "center",
          bgcolor: `${color}.light`,
          color: `${color}.dark`,
        }}
      >
        <Icon aria-hidden fontSize="small" />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="body2"
          noWrap
          sx={{
            fontWeight: 700,
          }}
        >
          {item.title}
        </Typography>
        <Typography
          variant="caption"
          noWrap
          component="p"
          sx={{
            color: "text.secondary",
          }}
        >
          {item.detail}
        </Typography>
      </Box>
      <Button
        href={item.href}
        variant="contained"
        size="small"
        aria-label={`แก้ไข: ${item.title}`}
      >
        แก้
      </Button>
    </Box>
  );
}

export async function ActionCenter({
  semesterAndyear,
  year,
  semester,
  semesterEnum,
}: {
  semesterAndyear: string;
  year: number;
  semester: number;
  semesterEnum: semester;
}) {
  const [schedules, grades, quickStats, readiness] = await Promise.all([
    dashboardRepository.getScheduleStatsData(year, semesterEnum),
    dashboardRepository.getGradesBasic(),
    dashboardRepository.getQuickStats(semesterAndyear, year, semesterEnum),
    getPublishReadiness(semesterAndyear),
  ]);

  const teachers = countTeachersWithSchedules(
    schedules,
    quickStats.teacherCount,
  );
  const completion = countClassCompletion(
    schedules,
    grades,
    quickStats.timeslotCount,
  );
  const conflicts = detectConflicts(schedules);

  const items = buildActionItems({
    year,
    semester,
    conflicts,
    completion,
    teachers,
    readiness: readiness ?? null,
  });

  return (
    <Paper sx={{ p: 2.75 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <WarningAmberIcon aria-hidden sx={{ color: "warning.main" }} />
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
          }}
        >
          ต้องแก้ก่อน
          {items.length > 0 ? ` · ${items.length} รายการ` : ""}
        </Typography>
      </Box>
      {items.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            p: 2.5,
            borderRadius: 2,
            bgcolor: "rgba(16, 185, 129, 0.12)",
            color: "success.dark",
          }}
        >
          <CheckCircleIcon aria-hidden />
          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
            }}
          >
            ทุกอย่างเรียบร้อย
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1.25}>
          {items.map((item) => (
            <ActionRow key={item.id} item={item} />
          ))}
        </Stack>
      )}
    </Paper>
  );
}
