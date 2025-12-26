"use client";

/**
 * CompletenessIndicator Component
 * Display config completeness percentage with breakdown
 */

import React from "react";
import {
  Box,
  LinearProgress,
  Typography,
  Paper,
  Tooltip,
  Chip,
} from "@mui/material";
import {
  CheckCircle as CompleteIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from "@mui/icons-material";

type Props = {
  completeness: number;
  counts?: {
    timeslots: number;
    teachers: number;
    subjects: number;
    classes: number;
    rooms: number;
  };
  showBreakdown?: boolean;
};

const WEIGHTS = {
  timeslots: 30,
  teachers: 20,
  subjects: 20,
  classes: 20,
  rooms: 10,
};

export function CompletenessIndicator({
  completeness,
  counts,
  showBreakdown = false,
}: Props) {
  const getColor = () => {
    if (completeness >= 80) return "success";
    if (completeness >= 30) return "warning";
    return "error";
  };

  const getIcon = () => {
    if (completeness >= 80) return <CompleteIcon fontSize="small" />;
    if (completeness >= 30) return <WarningIcon fontSize="small" />;
    return <InfoIcon fontSize="small" />;
  };

  const getMessage = () => {
    if (completeness >= 80) return "ข้อมูลครบถ้วนพร้อมใช้งาน";
    if (completeness >= 30) return "สามารถเผยแพร่ได้ แนะนำให้เพิ่มข้อมูล";
    return "ต้องการอย่างน้อย 30% เพื่อเผยแพร่";
  };

  return (
    <Paper sx={{ p: 2, bgcolor: "background.default" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        {getIcon()}
        <Typography variant="body2" fontWeight="medium">
          ความสมบูรณ์ของข้อมูล
        </Typography>
        <Chip
          label={`${completeness}%`}
          color={getColor()}
          size="small"
          sx={{ ml: "auto" }}
        />
      </Box>

      <LinearProgress
        variant="determinate"
        value={completeness}
        color={getColor()}
        sx={{ height: 8, borderRadius: 1 }}
      />

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", mt: 0.5 }}
      >
        {getMessage()}
      </Typography>

      {showBreakdown && counts && (
        <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
          <BreakdownItem
            label="ช่วงเวลา"
            count={counts.timeslots}
            weight={WEIGHTS.timeslots}
          />
          <BreakdownItem
            label="ครู"
            count={counts.teachers}
            weight={WEIGHTS.teachers}
          />
          <BreakdownItem
            label="วิชา"
            count={counts.subjects}
            weight={WEIGHTS.subjects}
          />
          <BreakdownItem
            label="ห้องเรียน"
            count={counts.classes}
            weight={WEIGHTS.classes}
          />
          <BreakdownItem
            label="ห้อง"
            count={counts.rooms}
            weight={WEIGHTS.rooms}
          />
        </Box>
      )}
    </Paper>
  );
}

function BreakdownItem({
  label,
  count,
  weight,
}: {
  label: string;
  count: number;
  weight: number;
}) {
  const hasData = count > 0;
  return (
    <Tooltip title={`น้ำหนัก ${weight}%`}>
      <Chip
        label={`${label}: ${count}`}
        size="small"
        color={hasData ? "default" : "error"}
        variant={hasData ? "filled" : "outlined"}
      />
    </Tooltip>
  );
}
