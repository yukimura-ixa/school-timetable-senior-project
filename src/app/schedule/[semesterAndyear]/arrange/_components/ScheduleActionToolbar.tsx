/**
 * Presentation Layer: Schedule Action Toolbar
 * 
 * Provides bulk operations and quick actions for schedule arrangement.
 * Phase 2 Part 2 - Interactive Enhancements
 * 
 * @module ScheduleActionToolbar
 */

'use client';

import React, { useState } from 'react';
import {
  Stack,
  Button,
  ButtonGroup,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Chip,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  AutoAwesome as AutoIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

interface ScheduleActionToolbarProps {
  onClearDay?: (day: number) => void;
  onClearAll?: () => void;
  onCopyDay?: (sourceDay: number, targetDay: number) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onAutoArrange?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  hasChanges?: boolean;
  totalSlots?: number;
  filledSlots?: number;
}

export function ScheduleActionToolbar({
  onClearDay,
  onClearAll,
  onCopyDay,
  onUndo,
  onRedo,
  onAutoArrange,
  canUndo = false,
  canRedo = false,
  hasChanges = false,
  totalSlots = 0,
  filledSlots = 0,
}: ScheduleActionToolbarProps) {
  // ============================================================================
  // STATE
  // ============================================================================
  const [clearDayDialog, setClearDayDialog] = useState(false);
  const [clearAllDialog, setClearAllDialog] = useState(false);
  const [copyDayDialog, setCopyDayDialog] = useState(false);
  const [autoArrangeDialog, setAutoArrangeDialog] = useState(false);
  
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [sourceDay, setSourceDay] = useState<number>(1);
  const [targetDay, setTargetDay] = useState<number>(2);

  // ============================================================================
  // CONSTANTS
  // ============================================================================
  const DAYS = [
    { value: 1, label: 'จันทร์' },
    { value: 2, label: 'อังคาร' },
    { value: 3, label: 'พุธ' },
    { value: 4, label: 'พฤหัสบดี' },
    { value: 5, label: 'ศุกร์' },
  ];

  // ============================================================================
  // STATS
  // ============================================================================
  const completionPercentage = totalSlots > 0 
    ? Math.round((filledSlots / totalSlots) * 100) 
    : 0;

  // ============================================================================
  // HANDLERS
  // ============================================================================
  
  const handleClearDay = () => {
    onClearDay?.(selectedDay);
    setClearDayDialog(false);
  };

  const handleClearAll = () => {
    onClearAll?.();
    setClearAllDialog(false);
  };

  const handleCopyDay = () => {
    if (sourceDay === targetDay) {
      alert('กรุณาเลือกวันที่ต่างกัน');
      return;
    }
    onCopyDay?.(sourceDay, targetDay);
    setCopyDayDialog(false);
  };

  const handleAutoArrange = () => {
    onAutoArrange?.();
    setAutoArrangeDialog(false);
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <>
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        sx={{
          p: 2,
          bgcolor: 'background.paper',
          borderRadius: 1,
          border: 1,
          borderColor: 'divider',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        {/* Progress Indicator */}
        <Stack spacing={0.5} sx={{ minWidth: 150 }}>
          <Typography variant="caption" color="text.secondary">
            ความคืบหน้า
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              label={`${filledSlots}/${totalSlots}`}
              size="small"
              color={completionPercentage === 100 ? 'success' : 'default'}
              sx={{ fontWeight: 'bold' }}
            />
            <Typography variant="caption" color="text.secondary">
              ({completionPercentage}%)
            </Typography>
          </Stack>
        </Stack>

        {/* Divider */}
        <Stack sx={{ height: 40, width: 1, bgcolor: 'divider' }} />

        {/* Action Buttons */}
        <ButtonGroup variant="outlined" size="small">
          {/* Undo */}
          <Tooltip title="ย้อนกลับการเปลี่ยนแปลง">
            <span>
              <Button
                startIcon={<UndoIcon />}
                onClick={onUndo}
                disabled={!canUndo}
              >
                ย้อนกลับ
              </Button>
            </span>
          </Tooltip>

          {/* Redo */}
          <Tooltip title="ทำซ้ำการเปลี่ยนแปลง">
            <span>
              <Button
                startIcon={<RedoIcon />}
                onClick={onRedo}
                disabled={!canRedo}
              >
                ทำซ้ำ
              </Button>
            </span>
          </Tooltip>

          {/* Copy Day */}
          <Tooltip title="คัดลอกตารางจากวันหนึ่งไปยังอีกวันหนึ่ง">
            <Button
              startIcon={<CopyIcon />}
              onClick={() => setCopyDayDialog(true)}
            >
              คัดลอกวัน
            </Button>
          </Tooltip>

          {/* Clear Day */}
          <Tooltip title="ล้างตารางของวันที่เลือก">
            <Button
              startIcon={<DeleteIcon />}
              onClick={() => setClearDayDialog(true)}
              color="warning"
            >
              ล้างวัน
            </Button>
          </Tooltip>
        </ButtonGroup>

        {/* Advanced Actions */}
        <ButtonGroup variant="outlined" size="small">
          {/* Auto Arrange */}
          <Tooltip title="จัดตารางอัตโนมัติ (ทดลอง)">
            <Button
              startIcon={<AutoIcon />}
              onClick={() => setAutoArrangeDialog(true)}
              color="secondary"
            >
              จัดอัตโนมัติ
            </Button>
          </Tooltip>

          {/* Clear All */}
          <Tooltip title="ล้างตารางทั้งหมด">
            <Button
              startIcon={<RefreshIcon />}
              onClick={() => setClearAllDialog(true)}
              color="error"
            >
              ล้างทั้งหมด
            </Button>
          </Tooltip>
        </ButtonGroup>

        {/* Changes Indicator */}
        {hasChanges && (
          <Chip
            label="มีการเปลี่ยนแปลงที่ยังไม่บันทึก"
            size="small"
            color="warning"
            icon={<WarningIcon />}
          />
        )}
      </Stack>

      {/* Clear Day Dialog */}
      <Dialog open={clearDayDialog} onClose={() => setClearDayDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>ล้างตารางของวันที่เลือก</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Alert severity="warning">
              การดำเนินการนี้จะลบวิชาทั้งหมดในวันที่เลือก และไม่สามารถยกเลิกได้
            </Alert>
            
            <FormControl fullWidth>
              <InputLabel>เลือกวัน</InputLabel>
              <Select
                value={selectedDay}
                onChange={(e) => setSelectedDay(Number(e.target.value))}
                label="เลือกวัน"
              >
                {DAYS.map((day) => (
                  <MenuItem key={day.value} value={day.value}>
                    {day.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearDayDialog(false)}>ยกเลิก</Button>
          <Button onClick={handleClearDay} color="warning" variant="contained">
            ล้างตาราง
          </Button>
        </DialogActions>
      </Dialog>

      {/* Clear All Dialog */}
      <Dialog open={clearAllDialog} onClose={() => setClearAllDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>ล้างตารางทั้งหมด</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Alert severity="error">
              <Typography variant="body2" fontWeight="bold">
                ⚠️ คำเตือนสำคัญ
              </Typography>
              <Typography variant="body2">
                การดำเนินการนี้จะลบวิชาทั้งหมดในตารางสอน ทั้ง 5 วัน และไม่สามารถยกเลิกได้
              </Typography>
            </Alert>
            
            <Typography variant="body2" color="text.secondary">
              คุณแน่ใจหรือไม่ที่จะล้างตารางทั้งหมด?
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearAllDialog(false)}>ยกเลิก</Button>
          <Button onClick={handleClearAll} color="error" variant="contained">
            ล้างทั้งหมด
          </Button>
        </DialogActions>
      </Dialog>

      {/* Copy Day Dialog */}
      <Dialog open={copyDayDialog} onClose={() => setCopyDayDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>คัดลอกตารางระหว่างวัน</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Alert severity="info">
              คัดลอกวิชาทั้งหมดจากวันต้นทางไปยังวันปลายทาง (จะเขียนทับข้อมูลเดิม)
            </Alert>
            
            <FormControl fullWidth>
              <InputLabel>วันต้นทาง (คัดลอกจาก)</InputLabel>
              <Select
                value={sourceDay}
                onChange={(e) => setSourceDay(Number(e.target.value))}
                label="วันต้นทาง (คัดลอกจาก)"
              >
                {DAYS.map((day) => (
                  <MenuItem key={day.value} value={day.value}>
                    {day.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>วันปลายทาง (คัดลอกไป)</InputLabel>
              <Select
                value={targetDay}
                onChange={(e) => setTargetDay(Number(e.target.value))}
                label="วันปลายทาง (คัดลอกไป)"
              >
                {DAYS.map((day) => (
                  <MenuItem key={day.value} value={day.value} disabled={day.value === sourceDay}>
                    {day.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCopyDayDialog(false)}>ยกเลิก</Button>
          <Button onClick={handleCopyDay} color="primary" variant="contained">
            คัดลอก
          </Button>
        </DialogActions>
      </Dialog>

      {/* Auto Arrange Dialog */}
      <Dialog open={autoArrangeDialog} onClose={() => setAutoArrangeDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>จัดตารางอัตโนมัติ (ทดลอง)</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Alert severity="info">
              <Typography variant="body2" fontWeight="bold">
                🤖 ฟีเจอร์นี้อยู่ในระหว่างการพัฒนา
              </Typography>
              <Typography variant="body2">
                ระบบจะพยายามจัดวิชาที่เหลืออยู่ลงในช่องว่างโดยอัตโนมัติ 
                โดยคำนึงถึงข้อจำกัดต่างๆ เช่น:
              </Typography>
            </Alert>

            <Stack spacing={0.5} sx={{ pl: 2 }}>
              <Typography variant="caption">• ครูไม่สอนซ้ำในเวลาเดียวกัน</Typography>
              <Typography variant="caption">• ห้องเรียนไม่ซ้ำในเวลาเดียวกัน</Typography>
              <Typography variant="caption">• คาบพักและคาบล็อคจะไม่ถูกแก้ไข</Typography>
              <Typography variant="caption">• กระจายภาระงานให้เท่ากันในแต่ละวัน</Typography>
            </Stack>

            <Alert severity="warning">
              แนะนำให้บันทึกข้อมูลก่อนใช้ฟีเจอร์นี้
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAutoArrangeDialog(false)}>ยกเลิก</Button>
          <Button onClick={handleAutoArrange} color="secondary" variant="contained">
            เริ่มจัดอัตโนมัติ
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
