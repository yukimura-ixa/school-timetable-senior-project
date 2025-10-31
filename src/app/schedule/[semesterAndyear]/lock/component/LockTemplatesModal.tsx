'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
  Alert,
  AlertTitle,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import {
  ContentPaste as TemplateIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { enqueueSnackbar } from 'notistack';
import { LOCK_TEMPLATES, type LockTemplate } from '@/features/lock/domain/models/lock-template.model';
import { applyLockTemplateAction } from '@/features/lock/application/actions/lock.actions';

interface LockTemplatesModalProps {
  open: boolean;
  onClose: () => void;
  academicYear: number;
  semester: number;
  configId: string;
  onSuccess: () => void;
}

const CATEGORY_LABELS: Record<LockTemplate['category'], string> = {
  lunch: 'พักกลางวัน',
  activity: 'กิจกรรม',
  assembly: 'ประชุม',
  exam: 'สอบ',
  other: 'อื่นๆ',
};

const CATEGORY_COLORS: Record<LockTemplate['category'], 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'> = {
  lunch: 'success',
  activity: 'primary',
  assembly: 'info',
  exam: 'warning',
  other: 'secondary',
};

const DAY_NAMES: Record<string, string> = {
  MON: 'จันทร์',
  TUE: 'อังคาร',
  WED: 'พุธ',
  THU: 'พฤหัสบดี',
  FRI: 'ศุกร์',
  SAT: 'เสาร์',
  SUN: 'อาทิตย์',
};

export default function LockTemplatesModal({
  open,
  onClose,
  academicYear,
  semester,
  configId,
  onSuccess,
}: LockTemplatesModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<LockTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const handleSelectTemplate = (template: LockTemplate) => {
    setSelectedTemplate(template);
    setShowPreview(true);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setSelectedTemplate(null);
  };

  const handleApplyTemplate = async () => {
    if (!selectedTemplate) return;

    setIsApplying(true);

    try {
      const result = await applyLockTemplateAction({
        templateId: selectedTemplate.id,
        AcademicYear: academicYear,
        Semester: `SEMESTER_${semester}`,
        ConfigID: configId,
      });

      if ('success' in result && result.success) {
        const data = result.data;
        enqueueSnackbar(
          `นำเทมเพลต "${data?.templateName}" ไปใช้สำเร็จ (${data?.count || 0} รายการ)`,
          { variant: 'success' }
        );

        if (data?.warnings && data.warnings.length > 0) {
          data.warnings.forEach((warning: string) => {
            enqueueSnackbar(warning, { variant: 'warning' });
          });
        }

        onSuccess();
        handleClosePreview();
        onClose();
      } else {
        const errorMsg = typeof result.error === 'string' ? result.error : result.error?.message || 'เกิดข้อผิดพลาด';
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar(
        `เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { variant: 'error' }
      );
    } finally {
      setIsApplying(false);
    }
  };

  // Group templates by category
  const templatesByCategory = LOCK_TEMPLATES.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<LockTemplate['category'], LockTemplate[]>);

  return (
    <>
      {/* Main Template Selection Dialog */}
      <Dialog open={open && !showPreview} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <TemplateIcon />
            <Typography variant="h6">เลือกเทมเพลตล็อกคาบ</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            เลือกเทมเพลตสำเร็จรูปเพื่อล็อกคาบเรียนอย่างรวดเร็ว
          </Typography>

          {Object.entries(templatesByCategory).map(([category, templates]) => (
            <Box key={category} sx={{ mt: 3 }}>
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <Typography variant="h6">
                  {CATEGORY_LABELS[category as LockTemplate['category']]}
                </Typography>
                <Chip
                  label={templates.length}
                  size="small"
                  color={CATEGORY_COLORS[category as LockTemplate['category']]}
                />
              </Stack>

              <Grid container spacing={2}>
                {templates.map((template) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={template.id}>
                    <Card
                      variant="outlined"
                      sx={{
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          boxShadow: 2,
                          borderColor: 'primary.main',
                        },
                      }}
                      onClick={() => handleSelectTemplate(template)}
                    >
                      <CardContent>
                        <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                          <Typography variant="h4">{template.icon}</Typography>
                          <Box>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {template.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {template.nameEn}
                            </Typography>
                          </Box>
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          {template.description}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Chip
                          label={CATEGORY_LABELS[template.category]}
                          size="small"
                          color={CATEGORY_COLORS[template.category]}
                        />
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>ปิด</Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      {selectedTemplate && (
        <Dialog open={showPreview} onClose={handleClosePreview} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h4">{selectedTemplate.icon}</Typography>
              <Box>
                <Typography variant="h6">{selectedTemplate.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedTemplate.nameEn}
                </Typography>
              </Box>
            </Stack>
          </DialogTitle>
          <DialogContent dividers>
            <Alert severity="info" sx={{ mb: 2 }}>
              <AlertTitle>รายละเอียดเทมเพลต</AlertTitle>
              {selectedTemplate.description}
            </Alert>

            <List dense>
              <ListItem>
                <ListItemText
                  primary="วิชา"
                  secondary={`${selectedTemplate.config.subjectCode} - ${selectedTemplate.config.subjectName}`}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="ห้อง"
                  secondary={selectedTemplate.config.roomName || 'ไม่ระบุ'}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="ชั้นเรียนเป้าหมาย"
                  secondary={
                    selectedTemplate.config.gradeFilter.type === 'junior'
                      ? 'มัธยมศึกษาตอนต้น (ม.1-3)'
                      : selectedTemplate.config.gradeFilter.type === 'senior'
                      ? 'มัธยมศึกษาตอนปลาย (ม.4-6)'
                      : selectedTemplate.config.gradeFilter.type === 'all'
                      ? 'ทุกชั้น (ม.1-6)'
                      : 'ชั้นที่เลือก'
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="วัน"
                  secondary={selectedTemplate.config.timeslotFilter.days
                    .map((day) => DAY_NAMES[day])
                    .join(', ')}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="คาบ"
                  secondary={
                    selectedTemplate.config.timeslotFilter.allDay
                      ? 'ทั้งวัน'
                      : `คาบ ${selectedTemplate.config.timeslotFilter.periods.join(', ')}`
                  }
                />
              </ListItem>
            </List>

            <Alert severity="warning" icon={<WarningIcon />} sx={{ mt: 2 }}>
              <Typography variant="body2">
                เทมเพลตนี้จะสร้างคาบล็อกตามเกณฑ์ที่กำหนด
                <br />
                หากข้อมูลบางอย่างไม่พบในระบบ จะใช้ค่าเริ่มต้นแทน
              </Typography>
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePreview} disabled={isApplying}>
              ยกเลิก
            </Button>
            <Button
              onClick={() => void handleApplyTemplate()}
              variant="contained"
              color="primary"
              disabled={isApplying}
              startIcon={isApplying ? <CircularProgress size={20} /> : <CheckCircleIcon />}
            >
              {isApplying ? 'กำลังนำไปใช้...' : 'นำเทมเพลตไปใช้'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
}
