"use client";
import React from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  AddCircleOutlined as AddIcon,
  DeleteOutlined as DeleteIcon,
  MeetingRoom as RoomIcon,
  CalendarMonth as DayIcon,
  Schedule as PeriodIcon,
} from "@mui/icons-material";
import { dayOfWeekThai } from "@/models/dayofweek-thai";
import { formatGradeIdDisplay } from "@/utils/grade-display";
import { extractPeriodFromTimeslotId } from "@/utils/timeslot-id";
import type { GroupedLockedSchedule } from "@/features/lock/domain/services/lock-validation.service";
import { LOCK_TYPE_CONFIG, getLockType, reservedHatch } from "./lockTypeConfig";

type LockListViewProps = {
  lockData: GroupedLockedSchedule[];
  onAddLock: () => void;
  onDeleteLock: (item: GroupedLockedSchedule) => void;
};

const MAX_TEACHER_CHIPS = 3;

function MetaRow({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
      <Box sx={{ display: "flex", color: "text.disabled" }}>{icon}</Box>
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        {children}
      </Typography>
    </Stack>
  );
}

function periodLabel(item: GroupedLockedSchedule): string {
  const periods = Array.from(
    new Set(
      item.timeslots.map((ts) => extractPeriodFromTimeslotId(ts.TimeslotID)),
    ),
  ).sort((a, b) => a - b);
  return periods.length ? periods.join(", ") : "ไม่ระบุ";
}

function LockCard({
  item,
  onDeleteLock,
}: {
  item: GroupedLockedSchedule;
  onDeleteLock: (item: GroupedLockedSchedule) => void;
}) {
  const config = LOCK_TYPE_CONFIG[getLockType(item)];
  const day = item.timeslots[0]?.DayOfWeek;
  const hiddenTeachers = item.teachers.length - MAX_TEACHER_CHIPS;

  return (
    <Card
      sx={{
        position: "relative",
        borderLeft: `4px solid ${config.borderColor}`,
        transition: "box-shadow 0.2s, transform 0.2s",
        "&:hover": { boxShadow: 6, transform: "translateY(-2px)" },
      }}
    >
      {/* Faint reserved hatch echoing the calendar cell signature. */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          backgroundImage: reservedHatch(config.borderColor),
          opacity: 0.5,
        }}
      />
      <CardContent
        sx={{ position: "relative", display: "flex", flexDirection: "column", gap: 1.5 }}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{ justifyContent: "space-between", alignItems: "flex-start" }}
        >
          <Box>
            <Chip
              icon={config.icon}
              label={config.label}
              size="small"
              sx={{
                mb: 0.75,
                bgcolor: config.bgColor,
                color: config.color,
                border: `1px solid ${config.borderColor}`,
                "& .MuiChip-icon": { color: config.color },
              }}
            />
            <Typography variant="h6" sx={{ lineHeight: 1.3 }}>
              {item.SubjectCode} - {item.SubjectName}
            </Typography>
          </Box>
          <Tooltip title="ลบคาบล็อก">
            <IconButton
              size="small"
              onClick={() => onDeleteLock(item)}
              aria-label={`ลบคาบล็อก ${item.SubjectCode}`}
              sx={{ color: "error.main", flexShrink: 0 }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>

        <Stack spacing={0.75}>
          <MetaRow icon={<RoomIcon fontSize="small" />}>
            {item.room?.RoomName || "ไม่ระบุ"}
          </MetaRow>
          <MetaRow icon={<DayIcon fontSize="small" />}>
            {day ? dayOfWeekThai[day] : "ไม่ระบุ"}
          </MetaRow>
          <MetaRow icon={<PeriodIcon fontSize="small" />}>
            คาบที่ {periodLabel(item)}
          </MetaRow>
        </Stack>

        <Box>
          <Typography variant="caption" sx={{ color: "text.disabled", fontWeight: 700 }}>
            ชั้นเรียน ({item.GradeIDs.length})
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mt: 0.5 }}>
            {item.GradeIDs.map((grade) => (
              <Chip
                key={grade}
                label={formatGradeIdDisplay(grade)}
                size="small"
                variant="outlined"
              />
            ))}
          </Box>
        </Box>

        <Box>
          <Typography variant="caption" sx={{ color: "text.disabled", fontWeight: 700 }}>
            ครูผู้สอน ({item.teachers.length})
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mt: 0.5 }}>
            {item.teachers.slice(0, MAX_TEACHER_CHIPS).map((teacher) => (
              <Chip
                key={teacher.TeacherID}
                label={`${teacher.Firstname}${
                  teacher.Department ? ` · ${teacher.Department}` : ""
                }`}
                size="small"
                variant="outlined"
              />
            ))}
            {hiddenTeachers > 0 && (
              <Tooltip
                title={item.teachers
                  .slice(MAX_TEACHER_CHIPS)
                  .map((t) => `${t.Firstname} ${t.Lastname}`)
                  .join(", ")}
              >
                <Chip label={`+${hiddenTeachers}`} size="small" />
              </Tooltip>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

function LockListView({ lockData, onAddLock, onDeleteLock }: LockListViewProps) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
        gap: 2,
        py: 2,
      }}
    >
      {lockData.map((item, index) => (
        <LockCard
          key={`${item.SubjectCode}-${index}`}
          item={item}
          onDeleteLock={onDeleteLock}
        />
      ))}

      <Card
        onClick={onAddLock}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onAddLock();
          }
        }}
        aria-label="เพิ่มคาบล็อก"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
          minHeight: 160,
          cursor: "pointer",
          border: "2px dashed",
          borderColor: "divider",
          boxShadow: "none",
          color: "text.secondary",
          transition: "border-color 0.2s, background-color 0.2s, color 0.2s",
          "&:hover": {
            borderColor: "primary.main",
            bgcolor: "primary.lighter",
            color: "primary.main",
          },
        }}
      >
        <AddIcon />
        <Typography sx={{ fontWeight: 700 }}>เพิ่มคาบล็อก</Typography>
      </Card>
    </Box>
  );
}

export default LockListView;
