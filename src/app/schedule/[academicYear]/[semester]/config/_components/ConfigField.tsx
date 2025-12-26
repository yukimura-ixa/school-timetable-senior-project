"use client";

/**
 * ConfigField Component
 * Reusable field for config page with icon, label, and editable/readonly states
 */

import React, { ReactNode } from "react";
import { Box, Typography, Paper } from "@mui/material";

type Props = {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  isEditable?: boolean;
  helperText?: string;
};

export function ConfigField({
  icon,
  label,
  value,
  isEditable = true,
  helperText,
}: Props) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        border: 1,
        borderColor: "divider",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        transition: "all 0.2s",
        bgcolor: isEditable ? "background.paper" : "grey.50",
        "&:hover": isEditable
          ? {
              borderColor: "primary.main",
              boxShadow: 1,
            }
          : {},
      }}
    >
      {/* Left: Icon + Label */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box sx={{ color: "text.secondary", display: "flex" }}>{icon}</Box>
        <Box>
          <Typography variant="body1" fontWeight="medium">
            {label}
          </Typography>
          {helperText && (
            <Typography variant="caption" color="text.secondary">
              {helperText}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Right: Value */}
      <Box>{value}</Box>
    </Paper>
  );
}
