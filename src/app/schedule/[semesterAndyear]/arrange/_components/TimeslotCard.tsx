/**
 * Presentation Layer: Timeslot Card Component
 * 
 * MUI v7 droppable card for individual timeslot.
 * Supports drag & drop, conflict validation, and locked state.
 * 
 * @module TimeslotCard
 */

'use client';

import React from 'react';
import {
  Card,
  CardContent,
  Stack,
  Typography,
  IconButton,
  Chip,
  Tooltip,
  Badge,
  alpha,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Lock as LockIcon,
  LunchDining as LunchIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { TimeslotData } from '@/types';
import { CONFLICT_COLORS } from '@/features/schedule-arrangement/domain/constants';

// Subject category colors (Phase 1 enhancement)
const SUBJECT_CATEGORY_COLORS = {
  CORE: { 
    bg: alpha('#2196F3', 0.08),  // Blue
    border: '#2196F3',
    chip: 'primary' as const,
  },
  ADDITIONAL: { 
    bg: alpha('#4CAF50', 0.08),  // Green
    border: '#4CAF50',
    chip: 'success' as const,
  },
  ACTIVITY: { 
    bg: alpha('#9C27B0', 0.08),  // Purple
    border: '#9C27B0',
    chip: 'secondary' as const,
  },
} as const;

interface TimeslotCardProps {
  /** Timeslot data */
  timeslot: TimeslotData;
  
  /** Is this slot a break period */
  isBreak?: boolean;
  
  /** Conflict state */
  hasConflict?: boolean;
  conflictMessage?: string;
  
  /** Is this slot locked */
  isLocked?: boolean;
  
  /** Is this slot selected */
  isSelected?: boolean;
  
  /** Handler for remove subject */
  onRemove?: (timeslotID: string) => void;
  
  /** Handler for click */
  onClick?: () => void;
  
  /** Show validation state */
  validationState?: 'valid' | 'error' | 'warning' | null;
}

/**
 * Individual timeslot card (droppable zone)
 */
export function TimeslotCard({
  timeslot,
  isBreak = false,
  hasConflict = false,
  conflictMessage,
  isLocked = false,
  isSelected = false,
  onRemove,
  onClick,
  validationState = null,
}: TimeslotCardProps) {
  const { isOver, setNodeRef: setDroppableRef } = useDroppable({
    id: timeslot.TimeslotID,
    data: {
      type: 'timeslot',
      timeslotID: timeslot.TimeslotID,
      accepts: ['subject'],
    },
  });

  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: timeslot.TimeslotID,
    data: {
      type: 'schedule',
      timeslot,
    },
    disabled: isLocked || isBreak || !timeslot.subject,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Determine card state
  const isEmpty = !timeslot.subject;
  const hasSubject = !!timeslot.subject;

  // Colors based on state
  const getBackgroundColor = () => {
    if (isBreak) return alpha('#FFA726', 0.1); // Orange for break
    if (isLocked) return alpha('#9E9E9E', 0.1); // Gray for locked
    if (hasConflict) return CONFLICT_COLORS.error.bg;
    if (validationState === 'error') return CONFLICT_COLORS.error.bg;
    if (validationState === 'warning') return CONFLICT_COLORS.warning.bg;
    if (validationState === 'valid') return CONFLICT_COLORS.valid.bg;
    if (isOver) return alpha('#2196F3', 0.1); // Blue for hover
    if (isSelected) return alpha('#1976D2', 0.05);
    if (hasSubject) return 'background.paper';
    return alpha('#EEEEEE', 0.3); // Light gray for empty
  };

  const getBorderColor = () => {
    if (hasConflict) return CONFLICT_COLORS.error.border;
    if (validationState === 'error') return CONFLICT_COLORS.error.border;
    if (validationState === 'warning') return CONFLICT_COLORS.warning.border;
    if (validationState === 'valid') return CONFLICT_COLORS.valid.border;
    if (isOver) return '#2196F3';
    if (isSelected) return '#1976D2';
    return 'divider';
  };

  // Render break slot
  if (isBreak) {
    return (
      <Card
        sx={{
          minHeight: 80,
          bgcolor: getBackgroundColor(),
          border: '2px dashed',
          borderColor: '#FFA726',
        }}
      >
        <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
            <LunchIcon sx={{ color: '#F57C00' }} />
            <Typography variant="body2" fontWeight="bold" color="text.secondary">
              พักรับประทานอาหาร
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  // Render empty slot
  if (isEmpty) {
    return (
      <Card
        ref={setDroppableRef}
        onClick={onClick}
        sx={{
          minHeight: 80,
          bgcolor: getBackgroundColor(),
          border: '2px dashed',
          borderColor: getBorderColor(),
          cursor: 'pointer',
          transition: 'all 0.2s',
          '&:hover': {
            borderColor: '#2196F3',
            bgcolor: alpha('#2196F3', 0.05),
          },
        }}
      >
        <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 48 }}>
            <Typography variant="caption" color="text.secondary" textAlign="center">
              {isOver ? '⬇️ วางที่นี่' : 'คาบว่าง'}
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  // Render occupied slot
  const subject = timeslot.subject;
  const subjectName = subject?.SubjectName || 'ไม่มีข้อมูล';
  const roomName = subject?.RoomName || 'ไม่ระบุห้อง';
  
  // Extract class name from GradeID (format: "ม.1/1") or gradelevel object
  const className = subject?.GradeID 
    ? subject.GradeID 
    : subject?.gradelevel 
      ? `ม.${subject.gradelevel.Year}/${subject.gradelevel.Number}`
      : 'ไม่ระบุห้อง';

  // Subject category styling (Phase 1 enhancement)
  const categoryKey = subject?.Category;
  const categoryStyle = 
    categoryKey && (categoryKey === 'CORE' || categoryKey === 'ADDITIONAL' || categoryKey === 'ACTIVITY')
    ? {
        borderLeft: 4,
        borderLeftColor: SUBJECT_CATEGORY_COLORS[categoryKey].border,
        bgcolor: hasConflict 
          ? CONFLICT_COLORS.error.bg
          : isLocked 
            ? 'grey.100' 
            : SUBJECT_CATEGORY_COLORS[categoryKey].bg,
      }
    : {};

  return (
    <Card
      ref={(node) => {
        setSortableRef(node);
        setDroppableRef(node);
      }}
      style={style}
      onClick={onClick}
      sx={{
        minHeight: 80,
        bgcolor: getBackgroundColor(),
        border: '2px solid',
        borderColor: getBorderColor(),
        cursor: isLocked ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s',
        position: 'relative',
        '&:hover': {
          boxShadow: isLocked ? 'none' : 2,
        },
        ...categoryStyle, // Apply category colors
      }}
      {...attributes}
      {...listeners}
    >
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Stack spacing={0.5}>
          {/* Subject Name */}
          <Stack direction="row" justifyContent="space-between" alignItems="start" spacing={1}>
            <Typography
              variant="body2"
              fontWeight="bold"
              sx={{
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {subjectName}
            </Typography>
            
            {/* Actions */}
            <Stack direction="row" spacing={0.5}>
              {isLocked && (
                <Tooltip title="คาบนี้ถูกล็อค">
                  <LockIcon fontSize="small" sx={{ color: 'warning.main' }} />
                </Tooltip>
              )}
              {hasConflict && (
                <Tooltip 
                  title={
                    <Stack spacing={0.5}>
                      <Typography variant="caption" fontWeight="bold">
                        ⚠️ พบข้อขัดแย้ง
                      </Typography>
                      <Typography variant="caption">
                        {conflictMessage || 'มีข้อขัดแย้งในการจัดตาราง'}
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: '0.65rem', opacity: 0.8 }}>
                        คลิกเพื่อดูรายละเอียด
                      </Typography>
                    </Stack>
                  }
                  arrow
                  placement="top"
                >
                  <Badge 
                    badgeContent={1} 
                    color="error"
                    sx={{ 
                      '& .MuiBadge-badge': { 
                        fontSize: '0.6rem',
                        height: 14,
                        minWidth: 14,
                        padding: '0 3px'
                      } 
                    }}
                  >
                    <ErrorIcon fontSize="small" sx={{ color: 'error.main' }} />
                  </Badge>
                </Tooltip>
              )}
              {validationState === 'valid' && (
                <CheckIcon fontSize="small" sx={{ color: 'success.main' }} />
              )}
              {!isLocked && onRemove && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(timeslot.TimeslotID);
                  }}
                  sx={{ padding: 0.5 }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </Stack>
          </Stack>

          {/* Details */}
          <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
            <Chip
              label={className}
              size="small"
              variant="outlined"
              sx={{ height: 20, fontSize: '0.7rem' }}
            />
            <Chip
              label={roomName}
              size="small"
              variant="outlined"
              sx={{ height: 20, fontSize: '0.7rem' }}
            />
            {/* Category badge (Phase 1 enhancement) */}
            {categoryKey && (categoryKey === 'CORE' || categoryKey === 'ADDITIONAL' || categoryKey === 'ACTIVITY') && (
              <Chip
                label={categoryKey === 'CORE' ? 'พื้นฐาน' : categoryKey === 'ADDITIONAL' ? 'เพิ่มเติม' : 'กิจกรรม'}
                size="small"
                color={SUBJECT_CATEGORY_COLORS[categoryKey].chip}
                sx={{ height: 20, fontSize: '0.7rem', fontWeight: 'bold' }}
              />
            )}
          </Stack>

          {/* Conflict Message - Enhanced Alert (Phase 1 Part 3) */}
          {hasConflict && conflictMessage && (
            <Stack 
              direction="row" 
              spacing={0.5} 
              alignItems="center"
              sx={{ 
                mt: 0.5,
                p: 0.75,
                bgcolor: 'error.light',
                borderRadius: 0.5,
                border: '1px solid',
                borderColor: 'error.main',
              }}
            >
              <ErrorIcon sx={{ fontSize: 14, color: 'error.dark' }} />
              <Typography 
                variant="caption" 
                color="error.dark" 
                sx={{ 
                  flex: 1,
                  fontWeight: 500,
                  fontSize: '0.7rem',
                }}
              >
                {conflictMessage}
              </Typography>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
