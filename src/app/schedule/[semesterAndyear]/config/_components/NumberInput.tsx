"use client";

/**
 * NumberInput Component
 * Improved counter with +/- buttons and direct input
 */

import React from "react";
import { Box, IconButton, TextField, Typography } from "@mui/material";
import { Add as AddIcon, Remove as RemoveIcon } from "@mui/icons-material";

type Props = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  disabled?: boolean;
};

export function NumberInput({
  value,
  onChange,
  min = 1,
  max = 100,
  step = 1,
  unit,
  disabled = false,
}: Props) {
  const handleIncrement = () => {
    const newValue = Math.min(value + step, max);
    onChange(newValue);
  };

  const handleDecrement = () => {
    const newValue = Math.max(value - step, min);
    onChange(newValue);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value) || min;
    if (newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <IconButton
        size="small"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        sx={{ 
          border: 1, 
          borderColor: "divider",
          "&:hover": { borderColor: "primary.main" }
        }}
      >
        <RemoveIcon fontSize="small" />
      </IconButton>

      <TextField
        value={value}
        onChange={handleChange}
        disabled={disabled}
        size="small"
        type="number"
        inputProps={{ min, max, step }}
        sx={{
          width: 80,
          "& input": {
            textAlign: "center",
            fontWeight: "bold",
          },
        }}
      />

      {unit && (
        <Typography variant="body2" color="text.secondary" sx={{ minWidth: 40 }}>
          {unit}
        </Typography>
      )}

      <IconButton
        size="small"
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        sx={{ 
          border: 1, 
          borderColor: "divider",
          "&:hover": { borderColor: "primary.main" }
        }}
      >
        <AddIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}
