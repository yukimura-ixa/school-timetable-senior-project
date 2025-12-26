"use client";

/**
 * ConfigSection Component
 * Collapsible section for grouping related config fields
 */

import React, { ReactNode, useState } from "react";
import { Box, Typography, Paper, IconButton, Collapse } from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";

type Props = {
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  defaultExpanded?: boolean;
};

export function ConfigSection({
  title,
  description,
  icon,
  children,
  defaultExpanded = true,
}: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <Paper
      elevation={0}
      sx={{ border: 1, borderColor: "divider", overflow: "hidden" }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          bgcolor: expanded ? "primary.50" : "grey.50",
          borderBottom: expanded ? 1 : 0,
          borderColor: "divider",
          transition: "all 0.2s",
          "&:hover": {
            bgcolor: expanded ? "primary.100" : "grey.100",
          },
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {icon && (
            <Box sx={{ color: "primary.main", display: "flex" }}>{icon}</Box>
          )}
          <Box>
            <Typography variant="h6" fontWeight="bold">
              {title}
            </Typography>
            {description && (
              <Typography variant="caption" color="text.secondary">
                {description}
              </Typography>
            )}
          </Box>
        </Box>

        <IconButton size="small">
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      {/* Content */}
      <Collapse in={expanded}>
        <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          {children}
        </Box>
      </Collapse>
    </Paper>
  );
}
