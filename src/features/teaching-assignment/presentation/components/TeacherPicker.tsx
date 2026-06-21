"use client";

import { Autocomplete, TextField } from "@mui/material";

export interface TeacherPickerOption {
  id: number;
  prefix: string;
  firstname: string;
  lastname: string;
  department?: string | null;
}

export interface TeacherPickerProps {
  teachers: TeacherPickerOption[];
  value: TeacherPickerOption | null;
  onChange: (teacher: TeacherPickerOption | null) => void;
  disabled?: boolean;
}

export function TeacherPicker({
  teachers,
  value,
  onChange,
  disabled = false,
}: TeacherPickerProps) {
  return (
    <Autocomplete
      options={teachers}
      value={value}
      onChange={(_event, next) => onChange(next)}
      getOptionLabel={(option) =>
        `${option.prefix}${option.firstname} ${option.lastname}`
      }
      isOptionEqualToValue={(option, val) => option.id === val.id}
      disabled={disabled}
      noOptionsText="ไม่พบครูผู้สอน"
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="ค้นหาครูผู้สอน"
          slotProps={{
            ...params.slotProps,

            htmlInput: {
              ...params.slotProps.htmlInput,
              "aria-label": "ค้นหาครูผู้สอน",
            },
          }}
        />
      )}
    />
  );
}
