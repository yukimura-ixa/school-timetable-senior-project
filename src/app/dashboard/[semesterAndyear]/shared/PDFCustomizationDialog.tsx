/**
 * PDF Export Customization Dialog
 * 
 * Provides a user interface for customizing PDF export settings including:
 * - Paper size (A4, Letter, Legal, A3, Tabloid)
 * - Page orientation (Portrait, Landscape)
 * - Tables per page (1-4)
 * - Margins
 * - Page numbers and signatures toggle
 */

'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Box,
  Typography,
  Slider,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import {
  type BatchPDFOptions,
  type PaperSize,
  type PageOrientation,
  PAPER_SIZE_LABELS,
  DEFAULT_PDF_OPTIONS,
} from './batchPdfGenerator';

interface PDFCustomizationDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  
  /** Callback when dialog is closed */
  onClose: () => void;
  
  /** Callback when user confirms export with selected options */
  onExport: (options: Partial<BatchPDFOptions>) => void;
  
  /** Default values for form fields */
  defaultValues?: Partial<BatchPDFOptions>;
  
  /** Maximum number of tables per page allowed */
  maxTablesPerPage?: number;
  
  /** Dialog title */
  title?: string;
}

export function PDFCustomizationDialog({
  open,
  onClose,
  onExport,
  defaultValues = {},
  maxTablesPerPage = 4,
  title = 'ตั้งค่าการส่งออก PDF',
}: PDFCustomizationDialogProps) {
  // Form state
  const [paperSize, setPaperSize] = useState<PaperSize>(
    defaultValues.format || DEFAULT_PDF_OPTIONS.format
  );
  const [orientation, setOrientation] = useState<PageOrientation>(
    defaultValues.orientation || DEFAULT_PDF_OPTIONS.orientation
  );
  const orientationLabel = orientation === 'portrait' ? 'แนวตั้ง (Portrait)' : 'แนวนอน (Landscape)';
  const [tablesPerPage, setTablesPerPage] = useState<number>(
    defaultValues.tablesPerPage || DEFAULT_PDF_OPTIONS.tablesPerPage
  );
  const [margin, setMargin] = useState<number>(
    defaultValues.margin || DEFAULT_PDF_OPTIONS.margin
  );
  const [quality, setQuality] = useState<number>(
    defaultValues.quality || DEFAULT_PDF_OPTIONS.quality
  );
  const [showPageNumbers, setShowPageNumbers] = useState<boolean>(
    defaultValues.showPageNumbers ?? DEFAULT_PDF_OPTIONS.showPageNumbers
  );
  const [showSignatures, setShowSignatures] = useState<boolean>(
    defaultValues.showSignatures ?? DEFAULT_PDF_OPTIONS.showSignatures
  );
  const handleExport = () => {
    const options: Partial<BatchPDFOptions> = {
      format: paperSize,
      orientation,
      tablesPerPage,
      margin,
      quality,
      showPageNumbers,
      showSignatures,
    };
    
    onExport(options);
    onClose();
  };

  // Handle reset to defaults
  const handleReset = () => {
    setPaperSize(DEFAULT_PDF_OPTIONS.format);
    setOrientation(DEFAULT_PDF_OPTIONS.orientation);
    setTablesPerPage(DEFAULT_PDF_OPTIONS.tablesPerPage);
    setMargin(DEFAULT_PDF_OPTIONS.margin);
    setQuality(DEFAULT_PDF_OPTIONS.quality);
    setShowPageNumbers(DEFAULT_PDF_OPTIONS.showPageNumbers);
    setShowSignatures(DEFAULT_PDF_OPTIONS.showSignatures);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: { borderRadius: 2 }
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <SettingsIcon />
        {title}
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, py: 1 }}>
          {/* Paper Size */}
          <FormControl fullWidth>
            <InputLabel id="paper-size-label" htmlFor="paper-size-select">
              ขนาดกระดาษ
            </InputLabel>
            <Select
              labelId="paper-size-label"
              id="paper-size-select"
              value={paperSize}
              label="ขนาดกระดาษ"
              onChange={(e: SelectChangeEvent) => setPaperSize(e.target.value as PaperSize)}
              data-testid="paper-size-select"
            >
              {(Object.entries(PAPER_SIZE_LABELS) as [PaperSize, string][]).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Orientation */}
          <FormControl fullWidth>
            <InputLabel id="orientation-label" htmlFor="orientation-select">
              การวางแนว
            </InputLabel>
            <Select
              labelId="orientation-label"
              id="orientation-select"
              value={orientation}
              label="การวางแนว"
              onChange={(e: SelectChangeEvent) => setOrientation(e.target.value as PageOrientation)}
              data-testid="orientation-select"
            >
              <MenuItem value="portrait">แนวตั้ง (Portrait)</MenuItem>
              <MenuItem value="landscape">แนวนอน (Landscape)</MenuItem>
            </Select>
          </FormControl>

          {/* Tables Per Page */}
          <Box>
            <Typography gutterBottom>
              จำนวนตารางต่อหน้า: {tablesPerPage}
            </Typography>
            <Slider
              value={tablesPerPage}
              onChange={(_, value) => {
                const numValue = Array.isArray(value) ? value[0] : value;
                if (typeof numValue === 'number') {
                  setTablesPerPage(numValue);
                }
              }}
              min={1}
              max={maxTablesPerPage}
              step={1}
              marks
              valueLabelDisplay="auto"
              data-testid="tables-per-page-slider"
            />
            <Typography variant="caption" color="text.secondary">
              กำหนดจำนวนตารางต่อหน้า (1-{maxTablesPerPage})
            </Typography>
          </Box>

          {/* Margin */}
          <Box>
            <Typography gutterBottom>
              ขอบกระดาษ: {margin} mm
            </Typography>
            <Slider
              value={margin}
              onChange={(_, value) => {
                const numValue = Array.isArray(value) ? value[0] : value;
                if (typeof numValue === 'number') {
                  setMargin(numValue);
                }
              }}
              min={5}
              max={20}
              step={1}
              marks={[
                { value: 5, label: '5mm' },
                { value: 10, label: '10mm' },
                { value: 15, label: '15mm' },
                { value: 20, label: '20mm' },
              ]}
              valueLabelDisplay="auto"
              data-testid="margin-slider"
            />
          </Box>

          {/* Quality */}
          <Box>
            <Typography gutterBottom>
              คุณภาพ: {quality === 1 ? 'ต่ำ' : quality === 2 ? 'กลาง' : 'สูง'}
            </Typography>
            <Slider
              value={quality}
              onChange={(_, value) => {
                const numValue = Array.isArray(value) ? value[0] : value;
                if (typeof numValue === 'number') {
                  setQuality(numValue);
                }
              }}
              min={1}
              max={3}
              step={1}
              marks={[
                { value: 1, label: 'ต่ำ' },
                { value: 2, label: 'กลาง' },
                { value: 3, label: 'สูง' },
              ]}
              valueLabelDisplay="auto"
              data-testid="quality-slider"
            />
            <Typography variant="caption" color="text.secondary">
              คุณภาพสูงขึ้น = ไฟล์ใหญ่ขึ้น และใช้เวลานานขึ้น
            </Typography>
          </Box>

          {/* Options */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={showPageNumbers}
                  onChange={(e) => setShowPageNumbers(e.target.checked)}
                  data-testid="page-numbers-switch"
                />
              }
              label="แสดงเลขหน้า"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={showSignatures}
                  onChange={(e) => setShowSignatures(e.target.checked)}
                  data-testid="signatures-switch"
                />
              }
              label="แสดงลายเซ็น"
            />
          </Box>
          <Box
            sx={{
              p: 2,
              bgcolor: 'info.lighter',
              borderRadius: 1,
              border: 1,
              borderColor: 'info.light',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              <strong>สรุปการตั้งค่าปัจจุบัน:</strong> กระดาษ {PAPER_SIZE_LABELS[paperSize]} {orientationLabel},{' '}
              {tablesPerPage} ตารางต่อหน้า, ระยะขอบ {margin}mm
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleReset} color="inherit">
          รีเซ็ต
        </Button>
        <Button onClick={onClose} color="inherit">
          ยกเลิก
        </Button>
        <Button onClick={handleExport} variant="contained" startIcon={<PdfIcon />}>
          ส่งออก PDF
        </Button>
      </DialogActions>
    </Dialog>
  );
}


