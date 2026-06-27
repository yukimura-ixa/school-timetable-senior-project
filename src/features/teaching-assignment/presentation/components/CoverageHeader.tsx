"use client";

import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";

interface CoverageHeaderProps {
  filled: number;
  required: number;
}

// Gap-forward: the page's job is to close empty (class, subject) slots, so the
// headline leads with how many remain rather than a neutral ratio.
export function CoverageHeader({ filled, required }: CoverageHeaderProps) {
  const gaps = Math.max(required - filled, 0);
  const pct = required === 0 ? 100 : (filled / required) * 100;
  const done = required > 0 && gaps === 0;
  return (
    <Box sx={{ mb: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, color: done ? "success.main" : "text.primary" }}
        >
          {done ? "มอบหมายครบทุกช่องแล้ว" : `เหลือ ${gaps} ช่องที่ยังไม่มอบหมาย`}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {filled} / {required}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={pct}
        color={done ? "success" : "primary"}
        sx={{ mt: 0.5, height: 8, borderRadius: 4 }}
      />
    </Box>
  );
}
