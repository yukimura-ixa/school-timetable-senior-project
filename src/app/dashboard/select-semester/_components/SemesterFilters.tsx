"use client";

/**
 * Semester Filters Component
 * Search, status chips, year dropdown, and sort controls
 */

import React from "react";
import {
  Box,
  TextField,
  InputAdornment,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import {
  Search as SearchIcon,
  Sort as SortIcon,
} from "@mui/icons-material";
import type { SemesterFilterSchema } from "@/features/semester/application/schemas/semester.schemas";
import type { InferOutput } from "valibot";

type Props = {
  filters: InferOutput<typeof SemesterFilterSchema>;
  onFiltersChange: (filters: InferOutput<typeof SemesterFilterSchema>) => void;
};

export function SemesterFilters({ filters, onFiltersChange }: Props) {
  const status = filters.status || "ALL";
  const search = filters.search || "";
  const year = filters.year;
  const sortBy = filters.sortBy || "recent";
  const sortOrder = filters.sortOrder || "desc";
  
  const availableYears = [2566, 2567, 2568, 2569, 2570];
  const statusOptions: Array<"ALL" | "DRAFT" | "PUBLISHED" | "LOCKED" | "ARCHIVED"> = [
    "ALL", "DRAFT", "PUBLISHED", "LOCKED", "ARCHIVED"
  ];

  const sortOptions = [
    { value: "recent", label: "ล่าสุด" },
    { value: "name", label: "ชื่อ" },
    { value: "status", label: "สถานะ" },
    { value: "year", label: "ปีการศึกษา" },
    { value: "completeness", label: "ความสมบูรณ์" },
  ];

  return (
    <Box sx={{ mb: 3 }}>
      {/* Search Bar */}
      <TextField
        fullWidth
        placeholder="ค้นหาภาคเรียน (ปีการศึกษา หรือ รหัส)..."
        value={search}
        onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      {/* Status Chips */}
      <Box sx={{ mb: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
        <Chip
          label="ทั้งหมด"
          onClick={() => onFiltersChange({ ...filters, status: undefined })}
          color={status === "ALL" ? "primary" : "default"}
          variant={status === "ALL" ? "filled" : "outlined"}
        />
        {statusOptions.filter(s => s !== "ALL").map((s) => (
          <Chip
            key={s}
            label={s === "DRAFT" ? "แบบร่าง" : s === "PUBLISHED" ? "เผยแพร่" : s === "LOCKED" ? "ล็อก" : "เก็บถาวร"}
            onClick={() => onFiltersChange({ ...filters, status: s as any })}
            color={status === s ? "primary" : "default"}
            variant={status === s ? "filled" : "outlined"}
          />
        ))}
      </Box>

      {/* Filters Row */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {/* Year Filter */}
        <FormControl sx={{ minWidth: 200 }} size="small">
          <InputLabel>ปีการศึกษา</InputLabel>
          <Select
            value={year || ""}
            label="ปีการศึกษา"
            onChange={(e) => onFiltersChange({ ...filters, year: e.target.value ? Number(e.target.value) : undefined })}
          >
            <MenuItem value="">ทั้งหมด</MenuItem>
            {availableYears.map((y) => (
              <MenuItem key={y} value={y}>
                {y}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Sort By */}
        <FormControl sx={{ minWidth: 200 }} size="small">
          <InputLabel>เรียงตาม</InputLabel>
          <Select
            value={sortBy}
            label="เรียงตาม"
            onChange={(e) => onFiltersChange({ ...filters, sortBy: e.target.value as any })}
          >
            {sortOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Sort Order */}
        <ToggleButtonGroup
          value={sortOrder}
          exclusive
          onChange={(_, newOrder) => {
            if (newOrder) onFiltersChange({ ...filters, sortOrder: newOrder });
          }}
          size="small"
        >
          <ToggleButton value="asc">
            น้อย → มาก
          </ToggleButton>
          <ToggleButton value="desc">
            มาก → น้อย
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
    </Box>
  );
}
