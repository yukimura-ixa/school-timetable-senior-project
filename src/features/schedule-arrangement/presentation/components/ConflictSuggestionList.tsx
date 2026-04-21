"use client";

import {
  Box,
  Button,
  CircularProgress,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import type { ResolutionSuggestion } from "../../domain/models/conflict.model";

export interface ConflictSuggestionListProps {
  suggestions: ResolutionSuggestion[];
  isLoading: boolean;
  onApply: (s: ResolutionSuggestion) => void | Promise<void>;
}

export default function ConflictSuggestionList({
  suggestions,
  isLoading,
  onApply,
}: ConflictSuggestionListProps) {
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={2}>
        <CircularProgress size={24} role="progressbar" />
      </Box>
    );
  }

  if (suggestions.length === 0) {
    return (
      <Typography color="text.secondary" variant="body2" sx={{ py: 2 }}>
        ไม่พบข้อเสนอแนะ
      </Typography>
    );
  }

  return (
    <Stack spacing={1.5}>
      {suggestions.map((s, i) => (
        <Box
          key={`${s.kind}-${i}`}
          data-testid="conflict-suggestion-row"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            p: 1.5,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
          }}
        >
          <Typography
            data-testid="conflict-suggestion-kind"
            variant="caption"
            sx={{ minWidth: 72, fontWeight: 600 }}
          >
            {s.kind}
          </Typography>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2">{s.rationale}</Typography>
            <LinearProgress
              variant="determinate"
              value={Math.round(s.confidence * 100)}
              sx={{ mt: 0.5, height: 6, borderRadius: 3 }}
            />
          </Box>
          <Button
            data-testid="conflict-suggestion-apply"
            variant="contained"
            size="small"
            onClick={() => {
              void onApply(s);
            }}
          >
            นำไปใช้
          </Button>
        </Box>
      ))}
    </Stack>
  );
}
