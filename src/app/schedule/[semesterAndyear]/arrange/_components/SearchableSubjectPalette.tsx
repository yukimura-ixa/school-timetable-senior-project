/**
 * Presentation Layer: Searchable Subject Palette
 * 
 * Enhanced subject selection component with search and category filters.
 * Phase 2 Part 1 - Interactive Enhancements
 * 
 * @module SearchableSubjectPalette
 */

'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  Stack,
  Chip,
  Typography,
  Paper,
  ToggleButtonGroup,
  ToggleButton,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  School as SchoolIcon,
  Add as AddIcon,
  LocalActivity as ActivityIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import SubjectItem from '../component/SubjectItem';
import type { teacher } from '@/prisma/generated';
import type { SubjectData as SubjectDataType } from '@/types/schedule.types';

interface SearchableSubjectPaletteProps {
  respData: SubjectDataType[];
  dropOutOfZone?: (subject: SubjectDataType) => void;
  clickOrDragToSelectSubject: (subject: SubjectDataType) => void;
  storeSelectedSubject: SubjectDataType | Record<string, never>;
  teacher: teacher;
}

export function SearchableSubjectPalette({
  respData,
  dropOutOfZone,
  storeSelectedSubject,
  clickOrDragToSelectSubject,
  teacher,
}: SearchableSubjectPaletteProps) {
  // ============================================================================
  // STATE
  // ============================================================================
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [yearFilter, setYearFilter] = useState<number[]>([]);

  // ============================================================================
  // FILTERING LOGIC
  // ============================================================================
  
  const filteredSubjects = useMemo(() => {
    // Filter out items without required fields (gradeID, subjectCode, subjectName)
    let filtered = respData.filter(
      (item) => !!item.gradeID && !!item.subjectCode && !!item.subjectName
    );

    // Search filter (subject code or name)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.subjectCode?.toLowerCase().includes(query) ||
          item.subjectName?.toLowerCase().includes(query) ||
          item.gradeID?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (categoryFilter.length > 0) {
      filtered = filtered.filter((item) =>
        categoryFilter.includes(item.category || 'CORE')
      );
    }

    // Year filter
    if (yearFilter.length > 0) {
      filtered = filtered.filter((item) => {
        if (!item.gradeID) return false;
        // Extract year from gradeID format "ม.1/1"
        const match = item.gradeID.match(/ม\.(\d)/);
        if (!match) return false;
        const year = parseInt(match[1]);
        return yearFilter.includes(year);
      });
    }

    // Type assertion: after filtering, we know these fields are non-null
    return filtered as Array<SubjectDataType & { gradeID: string; subjectCode: string; subjectName: string }>;
  }, [respData, searchQuery, categoryFilter, yearFilter]);

  // ============================================================================
  // STATS
  // ============================================================================
  
  const stats = useMemo(() => {
    const total = respData.length;
    const core = respData.filter((item) => item.category === 'CORE').length;
    const additional = respData.filter((item) => item.category === 'ADDITIONAL').length;
    const activity = respData.filter((item) => item.category === 'ACTIVITY').length;
    
    return { total, core, additional, activity };
  }, [respData]);

  // ============================================================================
  // HANDLERS
  // ============================================================================
  
  const handleCategoryToggle = (
    _event: React.MouseEvent<HTMLElement>,
    newCategories: string[]
  ) => {
    setCategoryFilter(newCategories);
  };

  const handleYearToggle = (
    _event: React.MouseEvent<HTMLElement>,
    newYears: number[]
  ) => {
    setYearFilter(newYears);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setCategoryFilter([]);
    setYearFilter([]);
  };

  const hasActiveFilters = searchQuery || categoryFilter.length > 0 || yearFilter.length > 0;

  // Generate IDs for SortableContext
  const itemIds = filteredSubjects.map(
    (item, index) => `${item.subjectCode}-Grade-${item.gradeID}-Index-${index}`
  );

  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <Paper elevation={2} sx={{ p: 2, mt: 2 }}>
      <Stack spacing={2}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1" fontWeight="bold">
            วิชาที่สามารถจัดลงได้
          </Typography>
          
          <Stack direction="row" spacing={1}>
            <Chip 
              label={`ทั้งหมด: ${stats.total}`}
              size="small"
              variant="outlined"
            />
            <Chip 
              label={`กรอง: ${filteredSubjects.length}`}
              size="small"
              color={hasActiveFilters ? 'primary' : 'default'}
              sx={{ fontWeight: hasActiveFilters ? 'bold' : 'normal' }}
            />
          </Stack>
        </Stack>

        {/* Search Bar */}
        <TextField
          fullWidth
          size="small"
          placeholder="ค้นหาด้วยรหัสวิชา, ชื่อวิชา, หรือ ชั้นเรียน (เช่น ม.1/1)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <Tooltip title="ล้างการค้นหา">
                  <ClearIcon
                    fontSize="small"
                    sx={{ cursor: 'pointer', color: 'text.secondary' }}
                    onClick={() => setSearchQuery('')}
                  />
                </Tooltip>
              </InputAdornment>
            ),
          }}
        />

        {/* Filter Section */}
        <Stack spacing={1.5}>
          {/* Category Filter */}
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <FilterIcon fontSize="small" sx={{ color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 60 }}>
              หมวดหมู่:
            </Typography>
            <ToggleButtonGroup
              value={categoryFilter}
              onChange={handleCategoryToggle}
              size="small"
              aria-label="category filter"
            >
              <ToggleButton value="CORE" aria-label="core subjects">
                <Badge badgeContent={stats.core} color="primary" max={99}>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <SchoolIcon fontSize="small" />
                    <Typography variant="caption">พื้นฐาน</Typography>
                  </Stack>
                </Badge>
              </ToggleButton>
              
              <ToggleButton value="ADDITIONAL" aria-label="additional subjects">
                <Badge badgeContent={stats.additional} color="success" max={99}>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <AddIcon fontSize="small" />
                    <Typography variant="caption">เพิ่มเติม</Typography>
                  </Stack>
                </Badge>
              </ToggleButton>
              
              <ToggleButton value="ACTIVITY" aria-label="activity subjects">
                <Badge badgeContent={stats.activity} color="secondary" max={99}>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <ActivityIcon fontSize="small" />
                    <Typography variant="caption">กิจกรรม</Typography>
                  </Stack>
                </Badge>
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>

          {/* Year Filter */}
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <FilterIcon fontSize="small" sx={{ color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 60 }}>
              ระดับชั้น:
            </Typography>
            <ToggleButtonGroup
              value={yearFilter}
              onChange={handleYearToggle}
              size="small"
              aria-label="year filter"
            >
              {[1, 2, 3, 4, 5, 6].map((year) => (
                <ToggleButton key={year} value={year} aria-label={`year ${year}`}>
                  <Typography variant="caption">ม.{year}</Typography>
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Stack>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Box>
              <Chip
                label="ล้างตัวกรองทั้งหมด"
                size="small"
                color="default"
                variant="outlined"
                onDelete={handleClearFilters}
                onClick={handleClearFilters}
                deleteIcon={<ClearIcon />}
                sx={{ cursor: 'pointer' }}
              />
            </Box>
          )}
        </Stack>

        {/* Subject Grid */}
        <Box
          sx={{
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            p: 1,
            minHeight: 140,
            maxHeight: 200,
            overflowY: 'auto',
            bgcolor: 'background.default',
          }}
        >
          {filteredSubjects.length === 0 ? (
            <Stack
              alignItems="center"
              justifyContent="center"
              sx={{ minHeight: 120, color: 'text.secondary' }}
            >
              <SearchIcon sx={{ fontSize: 40, opacity: 0.3, mb: 1 }} />
              <Typography variant="body2">
                {hasActiveFilters
                  ? 'ไม่พบวิชาที่ตรงกับเงื่อนไขการกรอง'
                  : 'ไม่มีวิชาที่สามารถจัดได้'}
              </Typography>
            </Stack>
          ) : (
            <SortableContext items={itemIds} strategy={rectSortingStrategy}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                  gap: 1,
                }}
              >
                {filteredSubjects.map((item, index) => (
                  <SubjectItem
                    key={`${item.subjectCode}-${index}`}
                    item={item}
                    index={index}
                    teacherData={{
                      Firstname: teacher.Firstname,
                    }}
                    storeSelectedSubject={storeSelectedSubject}
                    clickOrDragToSelectSubject={clickOrDragToSelectSubject}
                    dropOutOfZone={dropOutOfZone}
                  />
                ))}
              </Box>
            </SortableContext>
          )}
        </Box>

        {/* Help Text */}
        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          💡 <b>เคล็ดลับ:</b> คลิกหรือลากวิชาที่ต้องการเพื่อจัดลงในตารางสอน
        </Typography>
      </Stack>
    </Paper>
  );
}
