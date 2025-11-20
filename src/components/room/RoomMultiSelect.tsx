"use client";

import React from "react";
import { Autocomplete, TextField, Box, Typography, Chip } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import type { room } from @/prisma/generated/client";
import type { RoomSelectOption } from "@/types/ui-state";

interface RoomMultiSelectProps {
  rooms: room[];
  value: room[];
  onChange: (rooms: room[]) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: "small" | "medium";
  limitTags?: number;
  availabilityMap?: Record<number, 'available' | 'occupied' | 'partial'>;
  showAvailability?: boolean;
}

/**
 * Multi-select room component with building/floor grouping
 * Uses MUI Autocomplete for better UX
 */
export default function RoomMultiSelect({
  rooms,
  value,
  onChange,
  label = "สถานที่เรียน",
  placeholder = "เลือกห้องเรียน (หลายห้อง)",
  required = false,
  error = false,
  helperText,
  disabled = false,
  fullWidth = true,
  size = "small",
  limitTags = 3,
  availabilityMap,
  showAvailability = true,
}: RoomMultiSelectProps) {
  // Convert rooms to select options with building/floor info
  const options: RoomSelectOption[] = rooms.map((room) => ({
    value: room.RoomID,
    label: room.RoomName,
    building: room.Building || "-",
    floor: room.Floor || "-",
  }));

  // Find options matching the current values
  const selectedOptions = value
    .map((v) => options.find((opt) => opt.value === v.RoomID))
    .filter((opt): opt is RoomSelectOption => opt !== undefined);

  // Group rooms by building, then floor
  const groupBy = (option: RoomSelectOption) => {
    if (option.building === "-" && option.floor === "-") {
      return "ไม่ระบุอาคาร";
    }
    if (option.building === "-") {
      return `ชั้น ${option.floor}`;
    }
    if (option.floor === "-") {
      return `อาคาร ${option.building}`;
    }
    return `อาคาร ${option.building} - ชั้น ${option.floor}`;
  };

  return (
    <Autocomplete
      multiple
      options={options}
      value={selectedOptions}
      onChange={(_, newValue) => {
        const selectedRooms = newValue
          .map((opt) => rooms.find((r) => r.RoomID === opt.value))
          .filter((r): r is room => r !== undefined);
        onChange(selectedRooms);
      }}
      groupBy={groupBy}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(option, value) => option.value === value.value}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={selectedOptions.length === 0 ? placeholder : undefined}
          required={required}
          error={error}
          helperText={helperText}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <>
                <MeetingRoomIcon sx={{ mr: 1, color: "action.active" }} />
                {params.InputProps.startAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => {
        const { key, ...restProps } = props as React.HTMLAttributes<HTMLLIElement> & { key: string };
        const status = availabilityMap?.[option.value];
        const dotColor = status === 'occupied' ? 'error.main' : status === 'partial' ? 'warning.main' : 'success.main';
        return (
          <Box component="li" key={key} {...restProps} sx={{ gap: 1, alignItems: "center" }}>
            <MeetingRoomIcon sx={{ color: "action.active" }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {option.label}
                {showAvailability && status && (
                  <Box component="span" sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: dotColor }} />
                )}
              </Typography>
              {(option.building !== "-" || option.floor !== "-") && (
                <Typography variant="caption" color="text.secondary">
                  {option.building !== "-" && `อาคาร ${option.building}`}
                  {option.building !== "-" && option.floor !== "-" && " • "}
                  {option.floor !== "-" && `ชั้น ${option.floor}`}
                </Typography>
              )}
            </Box>
          </Box>
        );
      }}
      renderGroup={(params) => (
        <li key={params.key}>
          <Box
            sx={{
              position: "sticky",
              top: -8,
              padding: "8px 16px",
              backgroundColor: "grey.100",
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <LocationOnIcon sx={{ fontSize: 16, color: "primary.main" }} />
              <Typography variant="caption" fontWeight={600} color="primary">
                {params.group}
              </Typography>
            </Box>
          </Box>
          <ul style={{ padding: 0 }}>{params.children}</ul>
        </li>
      )}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => {
          const { key, ...tagProps } = getTagProps({ index });
          return (
            <Chip
              key={key}
              label={option.label}
              size="small"
              icon={<MeetingRoomIcon />}
              {...tagProps}
            />
          );
        })
      }
      disabled={disabled}
      fullWidth={fullWidth}
      size={size}
      limitTags={limitTags}
      noOptionsText="ไม่พบห้องเรียน"
      loadingText="กำลังโหลด..."
      clearText="ล้างค่า"
      openText="เปิด"
      closeText="ปิด"
    />
  );
}
