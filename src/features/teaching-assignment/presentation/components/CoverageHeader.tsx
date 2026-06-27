"use client";

import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";

interface CoverageHeaderProps {
  filled: number;
  required: number;
}

export function CoverageHeader({ filled, required }: CoverageHeaderProps) {
  const pct = required === 0 ? 0 : (filled / required) * 100;
  return (
    <Box sx={{ mb: 1 }}>
      <Typography variant="body2" sx={{ mb: 0.5 }}>
        {filled} / {required}
      </Typography>
      <LinearProgress variant="determinate" value={pct} />
    </Box>
  );
}
