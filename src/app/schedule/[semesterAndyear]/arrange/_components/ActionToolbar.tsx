/**
 * Presentation Layer: Action Toolbar Component
 * 
 * MUI v7 toolbar for bulk actions on timetable.
 * Provides clear all, undo, and other batch operations.
 * 
 * @module ActionToolbar
 */

'use client';

import React from 'react';
import {
  Paper,
  Stack,
  Button,
  ButtonGroup,
  Divider,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  DeleteSweep as ClearAllIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

interface ActionToolbarProps {
  /** Total scheduled subjects count */
  scheduledCount?: number;
  
  /** Can undo */
  canUndo?: boolean;
  
  /** Can redo */
  canRedo?: boolean;
  
  /** Has any scheduled subjects */
  hasSchedules?: boolean;
  
  /** Handler for clear all */
  onClearAll?: () => void;
  
  /** Handler for undo */
  onUndo?: () => void;
  
  /** Handler for redo */
  onRedo?: () => void;
  
  /** Handler for copy from another day */
  onCopyDay?: () => void;
  
  /** Handler for refresh */
  onRefresh?: () => void;
  
  /** Disabled state */
  disabled?: boolean;
}

/**
 * Action toolbar component
 */
export function ActionToolbar({
  scheduledCount = 0,
  canUndo = false,
  canRedo = false,
  hasSchedules = false,
  onClearAll,
  onUndo,
  onRedo,
  onCopyDay,
  onRefresh,
  disabled = false,
}: ActionToolbarProps) {
  const [confirmClear, setConfirmClear] = React.useState(false);

  const handleClearAll = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      // Reset confirmation after 3 seconds
      setTimeout(() => setConfirmClear(false), 3000);
      return;
    }
    
    onClearAll?.();
    setConfirmClear(false);
  };

  return (
    <Paper
      elevation={1}
      sx={{
        p: 1.5,
        mb: 2,
        bgcolor: 'grey.50',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        justifyContent="space-between"
      >
        {/* Left: Info */}
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            label={`จัดแล้ว ${scheduledCount} รายการ`}
            color={scheduledCount > 0 ? 'primary' : 'default'}
            size="small"
            variant="outlined"
          />
        </Stack>

        {/* Right: Actions */}
        <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
          {/* Undo/Redo */}
          {(onUndo || onRedo) && (
            <>
              <ButtonGroup size="small" disabled={disabled}>
                {onUndo && (
                  <Tooltip title="เลิกทำ (Ctrl+Z)">
                    <span>
                      <Button
                        onClick={onUndo}
                        disabled={!canUndo || disabled}
                        startIcon={<UndoIcon />}
                      >
                        Undo
                      </Button>
                    </span>
                  </Tooltip>
                )}
                {onRedo && (
                  <Tooltip title="ทำซ้ำ (Ctrl+Y)">
                    <span>
                      <Button
                        onClick={onRedo}
                        disabled={!canRedo || disabled}
                        startIcon={<RedoIcon />}
                      >
                        Redo
                      </Button>
                    </span>
                  </Tooltip>
                )}
              </ButtonGroup>
              <Divider orientation="vertical" flexItem />
            </>
          )}

          {/* Batch Actions */}
          {onCopyDay && (
            <Tooltip title="คัดลอกตารางจากวันอื่น">
              <Button
                size="small"
                variant="outlined"
                startIcon={<CopyIcon />}
                onClick={onCopyDay}
                disabled={disabled}
              >
                คัดลอกวัน
              </Button>
            </Tooltip>
          )}

          {onRefresh && (
            <Tooltip title="รีเฟรชข้อมูล">
              <Button
                size="small"
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={onRefresh}
                disabled={disabled}
              >
                รีเฟรช
              </Button>
            </Tooltip>
          )}

          {onClearAll && (
            <Tooltip
              title={
                confirmClear
                  ? 'คลิกอีกครั้งเพื่อยืนยันการลบทั้งหมด'
                  : 'ลบตารางทั้งหมดของครูท่านนี้'
              }
            >
              <Button
                size="small"
                variant={confirmClear ? 'contained' : 'outlined'}
                color={confirmClear ? 'error' : 'inherit'}
                startIcon={<ClearAllIcon />}
                onClick={handleClearAll}
                disabled={!hasSchedules || disabled}
              >
                {confirmClear ? 'ยืนยันลบทั้งหมด' : 'ล้างตาราง'}
              </Button>
            </Tooltip>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
}
