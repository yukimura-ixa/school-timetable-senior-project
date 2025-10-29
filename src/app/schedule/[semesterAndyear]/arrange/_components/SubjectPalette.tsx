/**
 * Presentation Layer: Subject Palette Component
 * 
 * MUI v7 drag source for available subjects that can be assigned.
 * Replaces legacy SubjectDragBox with modern design.
 * 
 * @module SubjectPalette
 */

'use client';

import React, { useState, useMemo } from 'react';
import {
  Paper,
  Box,
  Stack,
  Typography,
  TextField,
  Chip,
  InputAdornment,
  Collapse,
  IconButton,
  Badge,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterIcon,
  DragIndicator as DragIcon,
} from '@mui/icons-material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { SubjectData } from '@/types';

interface SubjectPaletteProps {
  /** Available subjects that can be assigned */
  subjects: SubjectData[];
  
  /** Subjects already scheduled */
  scheduledSubjects: SubjectData[];
  
  /** Handler for subject click (alternative to drag) */
  onSubjectClick?: (subject: SubjectData) => void;
  
  /** Currently selected subject */
  selectedSubject?: SubjectData | null;
  
  /** Loading state */
  isLoading?: boolean;
}

/**
 * Draggable Subject Item
 */
function DraggableSubjectItem({
  subject,
  isSelected,
  onClick,
  remainingHours,
}: {
  subject: SubjectData;
  isSelected: boolean;
  onClick: () => void;
  remainingHours: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `subject-${subject.SubjectCode}`,
    data: {
      type: 'subject',
      subject,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isFullyScheduled = remainingHours <= 0;

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      elevation={isDragging ? 4 : isSelected ? 2 : 0}
      variant={isSelected ? 'elevation' : 'outlined'}
      onClick={onClick}
      sx={{
        p: 1.5,
        cursor: isFullyScheduled ? 'not-allowed' : 'grab',
        bgcolor: isSelected ? 'primary.50' : 'background.paper',
        border: isSelected ? '2px solid' : '1px solid',
        borderColor: isSelected ? 'primary.main' : 'divider',
        opacity: isFullyScheduled ? 0.5 : 1,
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: isFullyScheduled ? 'none' : 2,
          borderColor: isFullyScheduled ? 'divider' : 'primary.light',
        },
        position: 'relative',
      }}
      {...attributes}
      {...listeners}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        {/* Drag Handle */}
        <DragIcon
          fontSize="small"
          sx={{
            color: isFullyScheduled ? 'text.disabled' : 'text.secondary',
            cursor: 'grab',
          }}
        />

        {/* Subject Info */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            fontWeight="medium"
            noWrap
            sx={{ color: isFullyScheduled ? 'text.disabled' : 'text.primary' }}
          >
            {subject.SubjectName}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            noWrap
          >
            {subject.SubjectCode} • ม.{subject.GradeLevel - 6}
          </Typography>
        </Box>

        {/* Hours Badge */}
        <Tooltip title={`เหลือ ${remainingHours} ชม. จาก ${subject.TeachHour} ชม.`}>
          <Badge
            badgeContent={remainingHours}
            color={remainingHours > 0 ? 'primary' : 'default'}
            max={99}
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '0.7rem',
                fontWeight: 'bold',
              },
            }}
          >
            <Chip
              label={`${subject.TeachHour}ชม.`}
              size="small"
              variant="outlined"
              sx={{ minWidth: 50 }}
            />
          </Badge>
        </Tooltip>
      </Stack>
    </Paper>
  );
}

/**
 * Subject Palette Component
 */
export function SubjectPalette({
  subjects,
  scheduledSubjects,
  onSubjectClick,
  selectedSubject,
  isLoading = false,
}: SubjectPaletteProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expanded, setExpanded] = useState(true);
  const [filterByGrade, setFilterByGrade] = useState<number | null>(null);

  // Calculate remaining hours for each subject
  const subjectsWithHours = useMemo(() => {
    return subjects.map(subject => {
      const scheduledCount = scheduledSubjects.filter(
        s => s.SubjectCode === subject.SubjectCode
      ).length;
      const remainingHours = (subject.TeachHour || 0) - scheduledCount;
      return {
        ...subject,
        remainingHours,
      };
    });
  }, [subjects, scheduledSubjects]);

  // Filter subjects
  const filteredSubjects = useMemo(() => {
    return subjectsWithHours.filter(subject => {
      // Search filter
      const matchesSearch = searchQuery === '' ||
        subject.SubjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subject.SubjectCode.toLowerCase().includes(searchQuery.toLowerCase());

      // Grade filter
      const matchesGrade = filterByGrade === null ||
        subject.GradeLevel === filterByGrade;

      return matchesSearch && matchesGrade;
    });
  }, [subjectsWithHours, searchQuery, filterByGrade]);

  // Group by grade level
  const subjectsByGrade = useMemo(() => {
    const groups: Record<number, typeof filteredSubjects> = {};
    filteredSubjects.forEach(subject => {
      const grade = subject.GradeLevel;
      if (!groups[grade]) {
        groups[grade] = [];
      }
      groups[grade].push(subject);
    });
    return groups;
  }, [filteredSubjects]);

  const totalSubjects = subjects.length;
  const availableSubjects = subjectsWithHours.filter(s => s.remainingHours > 0).length;

  return (
    <Paper elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6" fontWeight="bold">
              วิชาที่สามารถจัดได้
            </Typography>
            <Typography variant="caption">
              {availableSubjects} วิชาจาก {totalSubjects} วิชา
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={() => setExpanded(!expanded)}
            sx={{ color: 'inherit' }}
          >
            <ExpandMoreIcon
              sx={{
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
              }}
            />
          </IconButton>
        </Stack>
      </Box>

      <Collapse in={expanded} sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Search & Filter */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Stack spacing={1.5}>
            <TextField
              fullWidth
              size="small"
              placeholder="ค้นหาวิชา..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            
            {/* Grade Filter Chips */}
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5}>
              <Chip
                icon={<FilterIcon />}
                label="ทั้งหมด"
                size="small"
                onClick={() => setFilterByGrade(null)}
                color={filterByGrade === null ? 'primary' : 'default'}
                variant={filterByGrade === null ? 'filled' : 'outlined'}
              />
              {[7, 8, 9, 10, 11, 12].map(grade => (
                <Chip
                  key={grade}
                  label={`ม.${grade - 6}`}
                  size="small"
                  onClick={() => setFilterByGrade(grade)}
                  color={filterByGrade === grade ? 'primary' : 'default'}
                  variant={filterByGrade === grade ? 'filled' : 'outlined'}
                />
              ))}
            </Stack>
          </Stack>
        </Box>

        {/* Subject List */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
          {isLoading ? (
            <Typography color="text.secondary" textAlign="center">
              กำลังโหลด...
            </Typography>
          ) : filteredSubjects.length === 0 ? (
            <Typography color="text.secondary" textAlign="center">
              ไม่พบวิชาที่ตรงกับเงื่อนไข
            </Typography>
          ) : (
            <Stack spacing={2}>
              {Object.entries(subjectsByGrade)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([grade, gradeSubjects]) => (
                  <Box key={grade}>
                    <Typography
                      variant="caption"
                      fontWeight="bold"
                      color="text.secondary"
                      sx={{ mb: 1, display: 'block' }}
                    >
                      มัธยมศึกษาปีที่ {Number(grade) - 6}
                    </Typography>
                    <Divider sx={{ mb: 1 }} />
                    <Stack spacing={1}>
                      {gradeSubjects.map(subject => (
                        <DraggableSubjectItem
                          key={subject.SubjectCode}
                          subject={subject}
                          isSelected={
                            selectedSubject?.SubjectCode === subject.SubjectCode
                          }
                          onClick={() => onSubjectClick?.(subject)}
                          remainingHours={subject.remainingHours}
                        />
                      ))}
                    </Stack>
                  </Box>
                ))}
            </Stack>
          )}
        </Box>

        {/* Footer Info */}
        <Box sx={{ p: 1.5, borderTop: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
          <Typography variant="caption" color="text.secondary" textAlign="center" display="block">
            💡 ลากวิชาไปยังคาบว่าง หรือคลิกเพื่อเลือก
          </Typography>
        </Box>
      </Collapse>
    </Paper>
  );
}
