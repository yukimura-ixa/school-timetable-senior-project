"use client";

/**
 * Semester Card Component
 * Displays semester information with status, progress, and actions
 */

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardActions,
  Chip,
  LinearProgress,
  Box,
  Typography,
  IconButton,
  Button,
  Tooltip,
  Alert,
} from "@mui/material";
import {
  PushPin as PinIcon,
  PushPinOutlined as PinOutlinedIcon,
  FileCopy as CopyIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import type { SemesterDTO } from "@/features/semester/application/schemas/semester.schemas";
import { semesterThai } from "@/models/semester-thai";
import { pinSemesterAction } from "@/features/semester/application/actions/semester.actions";
import { ConfigureTimeslotsDialog } from "./ConfigureTimeslotsDialog";
import { formatThaiDateShortBangkok } from "@/utils/datetime";

type Props = {
  semester: SemesterDTO;
  onSelect: (semester: SemesterDTO) => void;
  onCopy?: (semester: SemesterDTO) => void;
  onUpdate?: () => void;
  isSelected?: boolean;
};

const STATUS_COLORS = {
  DRAFT: "default",
  PUBLISHED: "success",
  LOCKED: "warning",
  ARCHIVED: "error",
} as const;

const STATUS_LABELS = {
  DRAFT: "แบบร่าง",
  PUBLISHED: "เผยแพร่",
  LOCKED: "ล็อก",
  ARCHIVED: "เก็บถาวร",
} as const;

export function SemesterCard({
  semester,
  onSelect,
  onCopy,
  onUpdate,
  isSelected,
}: Props) {
  const [configDialogOpen, setConfigDialogOpen] = useState(false);

  const semesterLabel =
    semesterThai[semester.semester === 1 ? "SEMESTER_1" : "SEMESTER_2"];
  const statusColor = STATUS_COLORS[semester.status];
  const statusLabel = STATUS_LABELS[semester.status];

  // Check if timeslots need to be configured (completeness < 25%)
  const needsTimeslotConfig = semester.configCompleteness < 25;

  const formatDate = (date?: Date | null) => {
    if (!date) return "-";
    return formatThaiDateShortBangkok(date);
  };

  const handlePin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await pinSemesterAction({
      configId: semester.configId,
      isPinned: !semester.isPinned,
    });
    onUpdate?.();
  };

  const handleConfigSuccess = () => {
    setConfigDialogOpen(false);
    onUpdate?.();
  };

  return (
    <Card
      elevation={isSelected ? 8 : 1}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        border: isSelected ? "2px solid" : "1px solid",
        borderColor: isSelected ? "primary.main" : "divider",
        transition: "all 0.2s",
        "&:hover": {
          elevation: 4,
          transform: "translateY(-2px)",
        },
      }}
    >
      {/* Pin Button */}
      <IconButton
        onClick={(e) => void handlePin(e)}
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          zIndex: 1,
        }}
        size="small"
      >
        {semester.isPinned ? (
          <PinIcon color="primary" fontSize="small" />
        ) : (
          <PinOutlinedIcon fontSize="small" />
        )}
      </IconButton>

      <CardContent sx={{ flexGrow: 1, pt: 5 }}>
        {/* Header */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" component="h3" gutterBottom>
            {semesterLabel} / {semester.academicYear}
          </Typography>
          <Chip
            label={statusLabel}
            color={statusColor}
            size="small"
            sx={{ mb: 1 }}
          />
        </Box>

        {/* Warning for missing timeslots */}
        {needsTimeslotConfig && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="caption">
              ยังไม่ได้ตั้งค่าตารางเรียน
            </Typography>
          </Alert>
        )}

        {/* Progress */}
        <Box sx={{ mb: 2 }}>
          <Box
            sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}
          >
            <Typography variant="caption" color="text.secondary">
              ความสมบูรณ์
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {semester.configCompleteness}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={semester.configCompleteness}
            sx={{ height: 6, borderRadius: 1 }}
          />
        </Box>

        {/* Stats Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 1,
            mb: 2,
          }}
        >
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              ห้องเรียน
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {semester.classCount || 0}
            </Typography>
          </Box>
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              ครู
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {semester.teacherCount || 0}
            </Typography>
          </Box>
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              วิชา
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {semester.subjectCount || 0}
            </Typography>
          </Box>
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              ห้อง
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {semester.roomCount || 0}
            </Typography>
          </Box>
        </Box>

        {/* Dates */}
        <Box sx={{ pt: 1, borderTop: 1, borderColor: "divider" }}>
          <Typography variant="caption" color="text.secondary" display="block">
            อัปเดตล่าสุด: {formatDate(semester.updatedAt)}
          </Typography>
          {semester.publishedAt && (
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              เผยแพร่: {formatDate(semester.publishedAt)}
            </Typography>
          )}
        </Box>
      </CardContent>

      {/* Actions */}
      <CardActions
        sx={{
          justifyContent: "space-between",
          px: 2,
          pb: 2,
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Box sx={{ display: "flex", gap: 1 }}>
          {onCopy && (
            <Tooltip title="คัดลอก">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onCopy(semester);
                }}
              >
                <CopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Box sx={{ display: "flex", gap: 1, ml: "auto" }}>
          {needsTimeslotConfig && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<ScheduleIcon />}
              onClick={(e) => {
                e.stopPropagation();
                setConfigDialogOpen(true);
              }}
              color="warning"
            >
              ตั้งค่าตาราง
            </Button>
          )}
          <Button
            variant="contained"
            size="small"
            onClick={() => onSelect(semester)}
          >
            เลือก
          </Button>
        </Box>
      </CardActions>

      {/* Configure Timeslots Dialog */}
      <ConfigureTimeslotsDialog
        open={configDialogOpen}
        onClose={() => setConfigDialogOpen(false)}
        onSuccess={handleConfigSuccess}
        academicYear={semester.academicYear}
        semester={semester.semester as 1 | 2}
        configId={semester.configId}
      />
    </Card>
  );
}
