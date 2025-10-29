/**
 * Presentation Layer: Conflict Summary Panel
 * 
 * Displays a summary of all conflicts in the current timetable arrangement.
 * Phase 1 Part 3 enhancement for improved conflict visibility.
 * 
 * @module ConflictSummaryPanel
 */

'use client';

import React from 'react';
import {
  Alert,
  AlertTitle,
  Stack,
  Typography,
  Chip,
  IconButton,
  Collapse,
  Divider,
  Box,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Error as ErrorIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';

interface ConflictItem {
  timeslotId: string;
  message: string;
  day: string;
  period: string;
  subjectName?: string;
}

interface ConflictSummaryPanelProps {
  conflicts: ConflictItem[];
  onJumpToConflict?: (timeslotId: string) => void;
}

export function ConflictSummaryPanel({ 
  conflicts, 
  onJumpToConflict 
}: ConflictSummaryPanelProps) {
  const [expanded, setExpanded] = React.useState(true);
  
  const conflictCount = conflicts.length;
  const hasConflicts = conflictCount > 0;

  if (!hasConflicts) {
    return (
      <Alert 
        severity="success" 
        icon={<CheckIcon />}
        sx={{ mb: 2 }}
      >
        <AlertTitle>ไม่พบข้อขัดแย้ง</AlertTitle>
        ตารางสอนไม่มีข้อขัดแย้ง สามารถบันทึกได้
      </Alert>
    );
  }

  return (
    <Alert 
      severity="error"
      icon={<ErrorIcon />}
      sx={{ mb: 2 }}
      action={
        <IconButton
          aria-label="toggle details"
          color="inherit"
          size="small"
          onClick={() => setExpanded(!expanded)}
          sx={{
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s',
          }}
        >
          <ExpandMoreIcon />
        </IconButton>
      }
    >
      <AlertTitle>
        <Stack direction="row" spacing={1} alignItems="center">
          <span>พบข้อขัดแย้งในตารางสอน</span>
          <Chip 
            label={`${conflictCount} รายการ`}
            size="small"
            color="error"
            sx={{ height: 20, fontSize: '0.7rem', fontWeight: 'bold' }}
          />
        </Stack>
      </AlertTitle>
      
      <Collapse in={expanded}>
        <Typography variant="body2" sx={{ mb: 1, mt: 1 }}>
          กรุณาแก้ไขข้อขัดแย้งต่อไปนี้ก่อนบันทึกตารางสอน:
        </Typography>
        
        <Stack spacing={1} divider={<Divider />}>
          {conflicts.map((conflict, index) => (
            <Box 
              key={`${conflict.timeslotId}-${index}`}
              sx={{ 
                p: 1,
                bgcolor: 'background.paper',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'error.light',
                '&:hover': {
                  bgcolor: 'error.lighter',
                  cursor: onJumpToConflict ? 'pointer' : 'default',
                },
              }}
              onClick={() => onJumpToConflict?.(conflict.timeslotId)}
            >
              <Stack spacing={0.5}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip 
                    label={`${conflict.day} - คาบ ${conflict.period}`}
                    size="small"
                    variant="outlined"
                    color="error"
                    sx={{ height: 18, fontSize: '0.65rem' }}
                  />
                  {conflict.subjectName && (
                    <Typography variant="caption" fontWeight="bold">
                      {conflict.subjectName}
                    </Typography>
                  )}
                </Stack>
                
                <Typography 
                  variant="caption" 
                  color="error.dark"
                  sx={{ fontSize: '0.7rem' }}
                >
                  {conflict.message}
                </Typography>
                
                {onJumpToConflict && (
                  <Typography 
                    variant="caption" 
                    color="primary"
                    sx={{ 
                      fontSize: '0.65rem',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                    }}
                  >
                    → คลิกเพื่อไปยังคาบนี้
                  </Typography>
                )}
              </Stack>
            </Box>
          ))}
        </Stack>
      </Collapse>
    </Alert>
  );
}
