/**
 * Presentation Layer: Break Slot Select Component
 *
 * MUI Select dropdown for choosing break timeslot periods.
 * Replaces legacy custom Dropdown component.
 *
 * @module BreakSlotSelect
 */

import React from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  SelectChangeEvent,
} from "@mui/material";
import { LunchDining as LunchIcon } from "@mui/icons-material";

interface BreakSlotSelectProps {
  /** Current selected slot number */
  value: number;
  /** Callback when selection changes */
  onChange: (slot: number) => void;
  /** Label for the select */
  label: string;
  /** Total number of timeslots available */
  maxSlots: number;
  /** Validation error message */
  error?: string;
  /** Helper text */
  helperText?: string;
  /** Disable the select */
  disabled?: boolean;
  /** Full width */
  fullWidth?: boolean;
}

/**
 * Select component for choosing break timeslot period
 */
export function BreakSlotSelect({
  value,
  onChange,
  label,
  maxSlots,
  error,
  helperText,
  disabled = false,
  fullWidth = true,
}: BreakSlotSelectProps) {
  const handleChange = (event: SelectChangeEvent<number>) => {
    onChange(Number(event.target.value));
  };

  return (
    <FormControl fullWidth={fullWidth} error={!!error} disabled={disabled}>
      <InputLabel id={`break-slot-${label}`}>{label}</InputLabel>
      <Select<number>
        labelId={`break-slot-${label}`}
        value={value}
        onChange={handleChange}
        label={label}
        startAdornment={<LunchIcon sx={{ mr: 1, color: "action.active" }} />}
      >
        {Array.from({ length: maxSlots }, (_, i) => i + 1).map((slot) => (
          <MenuItem key={slot} value={slot}>
            คาบที่ {slot}
          </MenuItem>
        ))}
      </Select>
      {(error || helperText) && (
        <FormHelperText>{error || helperText}</FormHelperText>
      )}
    </FormControl>
  );
}
