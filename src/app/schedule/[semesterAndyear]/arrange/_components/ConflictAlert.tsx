/**
 * Presentation Layer: Conflict Alert Component
 * 
 * MUI v7 Alert component for displaying scheduling conflicts
 * with severity levels and actionable messages.
 * 
 * @module ConflictAlert
 */

'use client';

import React from 'react';
import {
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton,
  Stack,
  Chip,
} from '@mui/material';
import {
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Lock as LockIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import {
  CONFLICT_TYPES,
  CONFLICT_MESSAGES,
  type ConflictType,
  type ConflictSeverity,
} from '@/features/schedule-arrangement/domain/constants';

interface Conflict {
  type: ConflictType;
  severity: ConflictSeverity;
  message: string;
  timeslotID?: string;
  details?: {
    teacherName?: string;
    className?: string;
    roomName?: string;
  };
}

interface ConflictAlertProps {
  /** List of conflicts */
  conflicts: Conflict[];
  
  /** Show/hide handler */
  onClose?: () => void;
  
  /** Expandable details */
  expandable?: boolean;
}

/**
 * Alert component for displaying scheduling conflicts
 */
export function ConflictAlert({
  conflicts,
  onClose,
  expandable = false,
}: ConflictAlertProps) {
  const [expanded, setExpanded] = React.useState(true);

  if (conflicts.length === 0) {
    return null;
  }

  // Group by severity
  const errors = conflicts.filter(c => c.severity === 'error');
  const warnings = conflicts.filter(c => c.severity === 'warning');
  const infos = conflicts.filter(c => c.severity === 'info');

  // Primary severity
  const primarySeverity = errors.length > 0 ? 'error' : warnings.length > 0 ? 'warning' : 'info';

  const getIcon = (type: ConflictType) => {
    switch (type) {
      case CONFLICT_TYPES.TEACHER:
        return <ErrorIcon fontSize="small" />;
      case CONFLICT_TYPES.CLASS:
        return <WarningIcon fontSize="small" />;
      case CONFLICT_TYPES.ROOM:
        return <InfoIcon fontSize="small" />;
      case CONFLICT_TYPES.LOCKED:
        return <LockIcon fontSize="small" />;
      default:
        return <ErrorIcon fontSize="small" />;
    }
  };

  const formatDetails = (conflict: Conflict): string => {
    const parts: string[] = [];
    if (conflict.details?.teacherName) {
      parts.push(`ครู: ${conflict.details.teacherName}`);
    }
    if (conflict.details?.className) {
      parts.push(`ห้อง: ${conflict.details.className}`);
    }
    if (conflict.details?.roomName) {
      parts.push(`ห้องเรียน: ${conflict.details.roomName}`);
    }
    if (conflict.timeslotID) {
      parts.push(`คาบ: ${conflict.timeslotID}`);
    }
    return parts.length > 0 ? `(${parts.join(' • ')})` : '';
  };

  return (
    <Alert
      severity={primarySeverity}
      variant="filled"
      sx={{ mb: 2 }}
      action={
        <Stack direction="row" spacing={1}>
          {expandable && conflicts.length > 1 && (
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
          )}
          {onClose && (
            <IconButton
              size="small"
              onClick={onClose}
              sx={{ color: 'inherit' }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>
      }
    >
      <AlertTitle sx={{ fontWeight: 'bold' }}>
        พบข้อขัดแย้งในตารางสอน ({conflicts.length} รายการ)
      </AlertTitle>

      <Collapse in={expanded}>
        {/* Error Conflicts */}
        {errors.length > 0 && (
          <List dense sx={{ mt: 1 }}>
            {errors.map((conflict, index) => (
              <ListItem key={`error-${index}`} sx={{ pl: 0 }}>
                <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}>
                  {getIcon(conflict.type)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      <span>{conflict.message}</span>
                      {conflict.details && (
                        <Chip
                          label={formatDetails(conflict)}
                          size="small"
                          variant="outlined"
                          sx={{
                            borderColor: 'currentColor',
                            color: 'inherit',
                            fontSize: '0.7rem',
                          }}
                        />
                      )}
                    </Stack>
                  }
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            ))}
          </List>
        )}

        {/* Warning Conflicts */}
        {warnings.length > 0 && errors.length === 0 && (
          <List dense sx={{ mt: 1 }}>
            {warnings.map((conflict, index) => (
              <ListItem key={`warning-${index}`} sx={{ pl: 0 }}>
                <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}>
                  {getIcon(conflict.type)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      <span>{conflict.message}</span>
                      {conflict.details && (
                        <Chip
                          label={formatDetails(conflict)}
                          size="small"
                          variant="outlined"
                          sx={{
                            borderColor: 'currentColor',
                            color: 'inherit',
                            fontSize: '0.7rem',
                          }}
                        />
                      )}
                    </Stack>
                  }
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            ))}
          </List>
        )}

        {/* Info Conflicts */}
        {infos.length > 0 && errors.length === 0 && warnings.length === 0 && (
          <List dense sx={{ mt: 1 }}>
            {infos.map((conflict, index) => (
              <ListItem key={`info-${index}`} sx={{ pl: 0 }}>
                <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}>
                  {getIcon(conflict.type)}
                </ListItemIcon>
                <ListItemText
                  primary={conflict.message}
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Collapse>
    </Alert>
  );
}
