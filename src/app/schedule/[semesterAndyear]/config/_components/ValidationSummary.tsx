/**
 * Presentation Layer: Validation Summary Component
 * 
 * Displays validation errors and warnings for config data
 * with actionable feedback and visual severity indicators.
 * 
 * @module ValidationSummary
 */

import React from 'react';
import {
  Alert,
  AlertTitle,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
} from '@mui/material';
import {
  Error as ErrorIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { ValidationErrors } from '@/features/config/presentation/stores/timetable-config.store';

interface ValidationSummaryProps {
  /** Validation errors object */
  errors: ValidationErrors;
  /** Total timeslots that will be generated */
  totalTimeslots?: number;
  /** Show success state when no errors */
  showSuccess?: boolean;
}

/**
 * Validation summary component showing errors/warnings/success
 */
export function ValidationSummary({
  errors,
  totalTimeslots = 0,
  showSuccess = true,
}: ValidationSummaryProps) {
  const errorEntries = Object.entries(errors);
  const hasErrors = errorEntries.length > 0;
  
  // Separate warnings from errors
  const warnings = errorEntries.filter(([key]) => key.includes('Warning'));
  const actualErrors = errorEntries.filter(([key]) => !key.includes('Warning'));
  
  const hasActualErrors = actualErrors.length > 0;
  const hasWarnings = warnings.length > 0;

  // Success state
  if (!hasErrors && showSuccess) {
    return (
      <Alert severity="success" variant="filled" sx={{ mb: 2 }}>
        <AlertTitle>✅ การตั้งค่าถูกต้องและพร้อมใช้งาน</AlertTitle>
        จะสร้าง <strong>{totalTimeslots} ช่วงเวลา</strong> สำหรับ 5 วัน (จันทร์-ศุกร์)
      </Alert>
    );
  }

  return (
    <Stack spacing={2} sx={{ mb: 2 }}>
      {/* Errors */}
      <Collapse in={hasActualErrors}>
        <Alert severity="error" variant="filled">
          <AlertTitle>
            ❌ พบข้อผิดพลาด {actualErrors.length} รายการ
          </AlertTitle>
          กรุณาแก้ไขก่อนบันทึกการตั้งค่า
          <List dense sx={{ mt: 1 }}>
            {actualErrors.map(([key, message]) => (
              <ListItem key={key} sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <ErrorIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={message}
                  primaryTypographyProps={{
                    variant: 'body2',
                    color: 'inherit',
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Alert>
      </Collapse>

      {/* Warnings */}
      <Collapse in={hasWarnings && !hasActualErrors}>
        <Alert severity="warning" variant="outlined">
          <AlertTitle>
            ⚠️ คำเตือน {warnings.length} รายการ
          </AlertTitle>
          คุณยังสามารถบันทึกได้ แต่ควรตรวจสอบข้อมูลต่อไปนี้
          <List dense sx={{ mt: 1 }}>
            {warnings.map(([key, message]) => (
              <ListItem key={key} sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <WarningIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={message}
                  primaryTypographyProps={{
                    variant: 'body2',
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Alert>
      </Collapse>
    </Stack>
  );
}
