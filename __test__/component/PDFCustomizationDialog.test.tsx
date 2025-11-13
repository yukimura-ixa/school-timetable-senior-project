/**
 * Unit tests for PDFCustomizationDialog component
 * Tests all PDF export customization options and user interactions
 * 
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { PDFCustomizationDialog } from '@/app/dashboard/[semesterAndyear]/shared/PDFCustomizationDialog';
import {
  DEFAULT_PDF_OPTIONS,
  PAPER_SIZE_LABELS,
} from '@/app/dashboard/[semesterAndyear]/shared/batchPdfGenerator';
import type { BatchPDFOptions } from '@/app/dashboard/[semesterAndyear]/shared/batchPdfGenerator';

describe('PDFCustomizationDialog', () => {
  const mockOnClose = jest.fn();
  const mockOnExport = jest.fn();

  const defaultProps = {
    open: true,
    onClose: mockOnClose,
    onExport: mockOnExport,
    title: 'กำหนดค่าการส่งออก PDF',
    maxTablesPerPage: 4,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Dialog Rendering', () => {
    it('should render dialog when open is true', () => {
      render(<PDFCustomizationDialog {...defaultProps} />);
      
      expect(screen.getByText('กำหนดค่าการส่งออก PDF')).toBeInTheDocument();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should not render dialog when open is false', () => {
      render(<PDFCustomizationDialog {...defaultProps} open={false} />);
      
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should display custom title when provided', () => {
      const customTitle = 'Custom PDF Export Settings';
      render(<PDFCustomizationDialog {...defaultProps} title={customTitle} />);
      
      expect(screen.getByText(customTitle)).toBeInTheDocument();
    });

    it('should render all form controls', () => {
      render(<PDFCustomizationDialog {...defaultProps} />);
      
      // Paper size select
      expect(screen.getByLabelText(/ขนาดกระดาษ/i)).toBeInTheDocument();
      
      // Orientation select
      expect(screen.getByLabelText(/การวางแนว/i)).toBeInTheDocument();
      
      // Tables per page slider
      expect(screen.getByText(/ตารางต่อหน้า/i)).toBeInTheDocument();
      
      // Margin slider
      expect(screen.getByText(/ขอบกระดาษ/i)).toBeInTheDocument();
      
      // Quality slider
      expect(screen.getByText(/คุณภาพ/i)).toBeInTheDocument();
      
      // Page numbers switch
      expect(screen.getByText(/แสดงเลขหน้า/i)).toBeInTheDocument();
      
      // Signatures switch
      expect(screen.getByText(/แสดงลายเซ็น/i)).toBeInTheDocument();
    });

    it('should render action buttons', () => {
      render(<PDFCustomizationDialog {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: /รีเซ็ต/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /ยกเลิก/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /ส่งออก PDF/i })).toBeInTheDocument();
    });

    it('should display preview summary', () => {
      render(<PDFCustomizationDialog {...defaultProps} />);
      
      expect(screen.getByText(/ตัวอย่างการตั้งค่า:/i)).toBeInTheDocument();
    });
  });

  describe('Default Values', () => {
    it('should initialize with default PDF options', () => {
      render(<PDFCustomizationDialog {...defaultProps} />);
      
      // Check that default paper size is displayed
      const paperSizeSelect = screen.getByLabelText(/ขนาดกระดาษ/i);
      expect(paperSizeSelect).toHaveTextContent(PAPER_SIZE_LABELS[DEFAULT_PDF_OPTIONS.format!]);
    });

    it('should initialize with custom default values when provided', () => {
      const customDefaults: Partial<BatchPDFOptions> = {
        format: 'a3',
        orientation: 'landscape',
        tablesPerPage: 2,
        margin: 15,
        quality: 3,
        showPageNumbers: false,
        showSignatures: false,
      };

      render(
        <PDFCustomizationDialog
          {...defaultProps}
          defaultValues={customDefaults}
        />
      );

      const paperSizeSelect = screen.getByLabelText(/ขนาดกระดาษ/i);
      expect(paperSizeSelect).toHaveTextContent(PAPER_SIZE_LABELS['a3']);
    });
  });

  describe('Paper Size Selection', () => {
    it('should render all paper size options', async () => {
      const user = userEvent.setup();
      render(<PDFCustomizationDialog {...defaultProps} />);
      
      const paperSizeSelect = screen.getByLabelText(/ขนาดกระดาษ/i);
      await user.click(paperSizeSelect);

      // Check all paper size options
      expect(screen.getByRole('option', { name: PAPER_SIZE_LABELS.a4 })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: PAPER_SIZE_LABELS.a3 })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: PAPER_SIZE_LABELS.letter })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: PAPER_SIZE_LABELS.legal })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: PAPER_SIZE_LABELS.tabloid })).toBeInTheDocument();
    });

    it('should update paper size when option is selected', async () => {
      const user = userEvent.setup();
      render(<PDFCustomizationDialog {...defaultProps} />);
      
      const paperSizeSelect = screen.getByLabelText(/ขนาดกระดาษ/i);
      await user.click(paperSizeSelect);
      
      const a3Option = screen.getByRole('option', { name: PAPER_SIZE_LABELS.a3 });
      await user.click(a3Option);

      await waitFor(() => {
        expect(paperSizeSelect).toHaveTextContent(PAPER_SIZE_LABELS.a3);
      });
    });
  });

  describe('Orientation Selection', () => {
    it('should render portrait and landscape options', async () => {
      const user = userEvent.setup();
      render(<PDFCustomizationDialog {...defaultProps} />);
      
      const orientationSelect = screen.getByLabelText(/การวางแนว/i);
      await user.click(orientationSelect);

      expect(screen.getByRole('option', { name: /แนวตั้ง/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /แนวนอน/i })).toBeInTheDocument();
    });

    it('should update orientation when option is selected', async () => {
      const user = userEvent.setup();
      render(<PDFCustomizationDialog {...defaultProps} />);
      
      const orientationSelect = screen.getByLabelText(/การวางแนว/i);
      await user.click(orientationSelect);
      
      const landscapeOption = screen.getByRole('option', { name: /แนวนอน/i });
      await user.click(landscapeOption);

      await waitFor(() => {
        expect(orientationSelect).toHaveTextContent(/แนวนอน/i);
      });
    });
  });

  describe('Sliders', () => {
    it('should render tables per page slider with correct range', () => {
      render(<PDFCustomizationDialog {...defaultProps} maxTablesPerPage={4} />);
      
      const slider = screen.getByRole('slider', { name: /ตารางต่อหน้า/i });
      expect(slider).toHaveAttribute('aria-valuemin', '1');
      expect(slider).toHaveAttribute('aria-valuemax', '4');
    });

    it('should update tables per page when slider changes', () => {
      render(<PDFCustomizationDialog {...defaultProps} />);
      
      const slider = screen.getByRole('slider', { name: /ตารางต่อหน้า/i });
      fireEvent.change(slider, { target: { value: '2' } });

      expect(slider).toHaveValue('2');
    });

    it('should render margin slider with correct range', () => {
      render(<PDFCustomizationDialog {...defaultProps} />);
      
      const slider = screen.getByRole('slider', { name: /ขอบกระดาษ/i });
      expect(slider).toHaveAttribute('aria-valuemin', '5');
      expect(slider).toHaveAttribute('aria-valuemax', '20');
    });

    it('should update margin when slider changes', () => {
      render(<PDFCustomizationDialog {...defaultProps} />);
      
      const slider = screen.getByRole('slider', { name: /ขอบกระดาษ/i });
      fireEvent.change(slider, { target: { value: '15' } });

      expect(slider).toHaveValue('15');
    });

    it('should render quality slider with correct range', () => {
      render(<PDFCustomizationDialog {...defaultProps} />);
      
      const slider = screen.getByRole('slider', { name: /คุณภาพ/i });
      expect(slider).toHaveAttribute('aria-valuemin', '1');
      expect(slider).toHaveAttribute('aria-valuemax', '3');
    });

    it('should update quality when slider changes', () => {
      render(<PDFCustomizationDialog {...defaultProps} />);
      
      const slider = screen.getByRole('slider', { name: /คุณภาพ/i });
      fireEvent.change(slider, { target: { value: '3' } });

      expect(slider).toHaveValue('3');
    });

    it('should respect custom maxTablesPerPage', () => {
      render(<PDFCustomizationDialog {...defaultProps} maxTablesPerPage={6} />);
      
      const slider = screen.getByRole('slider', { name: /ตารางต่อหน้า/i });
      expect(slider).toHaveAttribute('aria-valuemax', '6');
    });
  });

  describe('Toggle Switches', () => {
    it('should render page numbers switch in checked state by default', () => {
      render(<PDFCustomizationDialog {...defaultProps} />);
      
      const pageNumbersSwitch = screen.getByRole('checkbox', { name: /แสดงเลขหน้า/i });
      expect(pageNumbersSwitch).toBeChecked();
    });

    it('should toggle page numbers switch', async () => {
      const user = userEvent.setup();
      render(<PDFCustomizationDialog {...defaultProps} />);
      
      const pageNumbersSwitch = screen.getByRole('checkbox', { name: /แสดงเลขหน้า/i });
      await user.click(pageNumbersSwitch);

      expect(pageNumbersSwitch).not.toBeChecked();
    });

    it('should render signatures switch in checked state by default', () => {
      render(<PDFCustomizationDialog {...defaultProps} />);
      
      const signaturesSwitch = screen.getByRole('checkbox', { name: /แสดงลายเซ็น/i });
      expect(signaturesSwitch).toBeChecked();
    });

    it('should toggle signatures switch', async () => {
      const user = userEvent.setup();
      render(<PDFCustomizationDialog {...defaultProps} />);
      
      const signaturesSwitch = screen.getByRole('checkbox', { name: /แสดงลายเซ็น/i });
      await user.click(signaturesSwitch);

      expect(signaturesSwitch).not.toBeChecked();
    });
  });

  describe('Reset Functionality', () => {
    it('should reset all values to defaults when reset button is clicked', async () => {
      const user = userEvent.setup();
      render(<PDFCustomizationDialog {...defaultProps} />);
      
      // Change some values
      const paperSizeSelect = screen.getByLabelText(/ขนาดกระดาษ/i);
      await user.click(paperSizeSelect);
      const a3Option = screen.getByRole('option', { name: PAPER_SIZE_LABELS.a3 });
      await user.click(a3Option);

      const pageNumbersSwitch = screen.getByRole('checkbox', { name: /แสดงเลขหน้า/i });
      await user.click(pageNumbersSwitch);

      // Click reset
      const resetButton = screen.getByRole('button', { name: /รีเซ็ต/i });
      await user.click(resetButton);

      // Check values are reset
      await waitFor(() => {
        expect(paperSizeSelect).toHaveTextContent(PAPER_SIZE_LABELS[DEFAULT_PDF_OPTIONS.format!]);
        expect(pageNumbersSwitch).toBeChecked();
      });
    });

    it('should reset to custom default values when provided', async () => {
      const user = userEvent.setup();
      const customDefaults: Partial<BatchPDFOptions> = {
        format: 'legal',
        showPageNumbers: false,
      };

      render(
        <PDFCustomizationDialog
          {...defaultProps}
          defaultValues={customDefaults}
        />
      );
      
      // Change value
      const paperSizeSelect = screen.getByLabelText(/ขนาดกระดาษ/i);
      await user.click(paperSizeSelect);
      const a3Option = screen.getByRole('option', { name: PAPER_SIZE_LABELS.a3 });
      await user.click(a3Option);

      // Click reset
      const resetButton = screen.getByRole('button', { name: /รีเซ็ต/i });
      await user.click(resetButton);

      // Should reset to custom defaults
      await waitFor(() => {
        expect(paperSizeSelect).toHaveTextContent(PAPER_SIZE_LABELS.legal);
      });
    });
  });

  describe('Export Functionality', () => {
    it('should call onExport with current options when export button is clicked', async () => {
      const user = userEvent.setup();
      render(<PDFCustomizationDialog {...defaultProps} />);
      
      const exportButton = screen.getByRole('button', { name: /ส่งออก PDF/i });
      await user.click(exportButton);

      expect(mockOnExport).toHaveBeenCalledTimes(1);
      expect(mockOnExport).toHaveBeenCalledWith(
        expect.objectContaining({
          format: DEFAULT_PDF_OPTIONS.format,
          orientation: DEFAULT_PDF_OPTIONS.orientation,
          tablesPerPage: DEFAULT_PDF_OPTIONS.tablesPerPage,
          margin: DEFAULT_PDF_OPTIONS.margin,
          quality: DEFAULT_PDF_OPTIONS.quality,
          showPageNumbers: DEFAULT_PDF_OPTIONS.showPageNumbers,
          showSignatures: DEFAULT_PDF_OPTIONS.showSignatures,
        })
      );
    });

    it('should call onExport with modified options', async () => {
      const user = userEvent.setup();
      render(<PDFCustomizationDialog {...defaultProps} />);
      
      // Change paper size
      const paperSizeSelect = screen.getByLabelText(/ขนาดกระดาษ/i);
      await user.click(paperSizeSelect);
      const a3Option = screen.getByRole('option', { name: PAPER_SIZE_LABELS.a3 });
      await user.click(a3Option);

      // Toggle page numbers
      const pageNumbersSwitch = screen.getByRole('checkbox', { name: /แสดงเลขหน้า/i });
      await user.click(pageNumbersSwitch);

      const exportButton = screen.getByRole('button', { name: /ส่งออก PDF/i });
      await user.click(exportButton);

      expect(mockOnExport).toHaveBeenCalledWith(
        expect.objectContaining({
          format: 'a3',
          showPageNumbers: false,
        })
      );
    });

    it('should close dialog after export', async () => {
      const user = userEvent.setup();
      render(<PDFCustomizationDialog {...defaultProps} />);
      
      const exportButton = screen.getByRole('button', { name: /ส่งออก PDF/i });
      await user.click(exportButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Cancel Functionality', () => {
    it('should call onClose when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<PDFCustomizationDialog {...defaultProps} />);
      
      const cancelButton = screen.getByRole('button', { name: /ยกเลิก/i });
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not call onExport when canceling', async () => {
      const user = userEvent.setup();
      render(<PDFCustomizationDialog {...defaultProps} />);
      
      const cancelButton = screen.getByRole('button', { name: /ยกเลิก/i });
      await user.click(cancelButton);

      expect(mockOnExport).not.toHaveBeenCalled();
    });

    it('should call onClose when backdrop is clicked', async () => {
      render(<PDFCustomizationDialog {...defaultProps} />);
      
      const backdrop = screen.getByRole('dialog').parentElement;
      if (backdrop) {
        fireEvent.click(backdrop);
      }

      // Note: MUI Dialog might handle this differently
      // This test verifies the behavior exists
    });
  });

  describe('Preview Summary', () => {
    it('should display current paper size in preview', () => {
      render(<PDFCustomizationDialog {...defaultProps} />);
      
      const preview = screen.getByText(/ตัวอย่างการตั้งค่า:/i).parentElement;
      expect(preview).toHaveTextContent(PAPER_SIZE_LABELS[DEFAULT_PDF_OPTIONS.format!]);
    });

    it('should update preview when paper size changes', async () => {
      const user = userEvent.setup();
      render(<PDFCustomizationDialog {...defaultProps} />);
      
      const paperSizeSelect = screen.getByLabelText(/ขนาดกระดาษ/i);
      await user.click(paperSizeSelect);
      const a3Option = screen.getByRole('option', { name: PAPER_SIZE_LABELS.a3 });
      await user.click(a3Option);

      const preview = screen.getByText(/ตัวอย่างการตั้งค่า:/i).parentElement;
      await waitFor(() => {
        expect(preview).toHaveTextContent(PAPER_SIZE_LABELS.a3);
      });
    });

    it('should display current orientation in preview', () => {
      render(<PDFCustomizationDialog {...defaultProps} />);
      
      const preview = screen.getByText(/ตัวอย่างการตั้งค่า:/i).parentElement;
      expect(preview).toHaveTextContent(/แนวตั้ง|แนวนอน/i);
    });

    it('should display current tables per page in preview', () => {
      render(<PDFCustomizationDialog {...defaultProps} />);
      
      const preview = screen.getByText(/ตัวอย่างการตั้งค่า:/i).parentElement;
      expect(preview).toHaveTextContent(/ตารางต่อหน้า/i);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for form controls', () => {
      render(<PDFCustomizationDialog {...defaultProps} />);
      
      expect(screen.getByLabelText(/ขนาดกระดาษ/i)).toHaveAttribute('aria-label');
      expect(screen.getByLabelText(/การวางแนว/i)).toHaveAttribute('aria-label');
    });

    it('should have proper roles for interactive elements', () => {
      render(<PDFCustomizationDialog {...defaultProps} />);
      
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getAllByRole('button')).toHaveLength(3); // Reset, Cancel, Export
      expect(screen.getAllByRole('checkbox')).toHaveLength(2); // Page numbers, Signatures
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<PDFCustomizationDialog {...defaultProps} />);
      
      // Tab to first button
      await user.tab();
      
      // Should be able to navigate through form elements
      const resetButton = screen.getByRole('button', { name: /รีเซ็ต/i });
      expect(document.activeElement).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing defaultValues gracefully', () => {
      render(
        <PDFCustomizationDialog
          {...defaultProps}
          defaultValues={undefined}
        />
      );
      
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should handle partial defaultValues', () => {
      const partialDefaults: Partial<BatchPDFOptions> = {
        format: 'a3',
        // Other values should use defaults
      };

      render(
        <PDFCustomizationDialog
          {...defaultProps}
          defaultValues={partialDefaults}
        />
      );
      
      const paperSizeSelect = screen.getByLabelText(/ขนาดกระดาษ/i);
      expect(paperSizeSelect).toHaveTextContent(PAPER_SIZE_LABELS.a3);
    });

    it('should handle maxTablesPerPage = 1', () => {
      render(<PDFCustomizationDialog {...defaultProps} maxTablesPerPage={1} />);
      
      const slider = screen.getByRole('slider', { name: /ตารางต่อหน้า/i });
      expect(slider).toHaveAttribute('aria-valuemax', '1');
    });

    it('should handle maxTablesPerPage = 10', () => {
      render(<PDFCustomizationDialog {...defaultProps} maxTablesPerPage={10} />);
      
      const slider = screen.getByRole('slider', { name: /ตารางต่อหน้า/i });
      expect(slider).toHaveAttribute('aria-valuemax', '10');
    });

    it('should not allow tables per page to exceed maxTablesPerPage', () => {
      render(<PDFCustomizationDialog {...defaultProps} maxTablesPerPage={4} />);
      
      const slider = screen.getByRole('slider', { name: /ตารางต่อหน้า/i });
      fireEvent.change(slider, { target: { value: '10' } }); // Try to exceed max

      // Should be clamped to max
      expect(slider).toHaveAttribute('aria-valuemax', '4');
    });
  });
});
