/**
 * Batch PDF Generator Utility
 * 
 * Advanced PDF generation using jsPDF and html2canvas for creating
 * multi-page PDF documents with multiple timetables.
 * 
 * Features:
 * - Multi-page PDF generation with customizable tables per page
 * - Multiple paper size options (A4, Letter, Legal, A3)
 * - Portrait and landscape orientation
 * - Adjustable margins
 * - Automatic page breaks
 * - Custom headers for each timetable
 * - High-quality rendering
 */

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Paper size formats supported by jsPDF
 */
export type PaperSize = 'a4' | 'a3' | 'letter' | 'legal' | 'tabloid';

/**
 * Page orientation options
 */
export type PageOrientation = 'portrait' | 'landscape';

/**
 * Configuration options for batch PDF generation
 */
export interface BatchPDFOptions {
  /** Output filename (default: 'batch-timetables.pdf') */
  filename?: string;
  
  /** Page orientation (default: 'landscape') */
  orientation?: PageOrientation;
  
  /** Paper size format (default: 'a4') */
  format?: PaperSize;
  
  /** Page margins in mm (default: 10) */
  margin?: number;
  
  /** Number of timetables per page (default: 1) */
  tablesPerPage?: number;
  
  /** Show page numbers (default: true) */
  showPageNumbers?: boolean;
  
  /** Show signature section (default: true) */
  showSignatures?: boolean;
  
  /** Custom header text (optional) */
  headerText?: string;
  
  /** Image quality scale (default: 2, higher = better quality but slower) */
  quality?: number;
}

/**
 * Paper size display names for UI
 */
export const PAPER_SIZE_LABELS: Record<PaperSize, string> = {
  'a4': 'A4 (210 × 297 mm)',
  'a3': 'A3 (297 × 420 mm)',
  'letter': 'Letter (8.5 × 11 in)',
  'legal': 'Legal (8.5 × 14 in)',
  'tabloid': 'Tabloid (11 × 17 in)',
};

/**
 * Default PDF generation options
 */
export const DEFAULT_PDF_OPTIONS: Required<BatchPDFOptions> = {
  filename: 'batch-timetables.pdf',
  orientation: 'landscape',
  format: 'a4',
  margin: 10,
  tablesPerPage: 1,
  showPageNumbers: true,
  showSignatures: true,
  headerText: '',
  quality: 2,
};

/**
 * Generate a batch PDF from multiple HTML elements with advanced customization
 * 
 * @param elements - Array of HTML elements to convert to PDF
 * @param titles - Array of titles for each page
 * @param options - PDF generation options
 */
export async function generateBatchPDF(
  elements: HTMLElement[],
  titles: string[],
  options: BatchPDFOptions = {}
): Promise<void> {
  const {
    filename = DEFAULT_PDF_OPTIONS.filename,
    orientation = DEFAULT_PDF_OPTIONS.orientation,
    format = DEFAULT_PDF_OPTIONS.format,
    margin = DEFAULT_PDF_OPTIONS.margin,
    tablesPerPage = DEFAULT_PDF_OPTIONS.tablesPerPage,
    showPageNumbers = DEFAULT_PDF_OPTIONS.showPageNumbers,
    showSignatures = DEFAULT_PDF_OPTIONS.showSignatures,
    headerText = DEFAULT_PDF_OPTIONS.headerText,
    quality = DEFAULT_PDF_OPTIONS.quality,
  } = options;

  // Create new PDF document
  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format,
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const contentWidth = pageWidth - (margin * 2);

  let pageNumber = 1;

  // Process elements based on tablesPerPage setting
  for (let i = 0; i < elements.length; i += tablesPerPage) {
    const pageElements = elements.slice(i, Math.min(i + tablesPerPage, elements.length));
    const pageTitles = titles.slice(i, Math.min(i + tablesPerPage, titles.length));

    // Add new page if not first
    if (i > 0) {
      pdf.addPage(format, orientation);
      pageNumber++;
    }

    // Calculate layout for multiple tables per page
    const tableHeight = (pageHeight - (margin * 2) - 20 - (showSignatures ? 15 : 0)) / tablesPerPage;
    const spacing = 5;

    // Add custom header if provided
    if (headerText && i === 0) {
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text(headerText, pageWidth / 2, margin + 5, { align: 'center' });
    }

    // Process each table on this page
    for (let j = 0; j < pageElements.length; j++) {
      const element = pageElements[j];
      if (!element) continue;

      const title = pageTitles[j] || `ตารางที่ ${i + j + 1}`;
      const yOffset = margin + (headerText && i === 0 ? 15 : 0) + (j * (tableHeight + spacing));

      try {
        // Convert HTML element to canvas
        const canvas = await html2canvas(element, {
          scale: quality,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
        });

        // Calculate dimensions to fit allocated space
        const availableHeight = tableHeight - 15;
        const imgWidth = contentWidth;
        const imgHeight = Math.min(
          (canvas.height * imgWidth) / canvas.width,
          availableHeight
        );

        // Add title
        pdf.setFontSize(tablesPerPage === 1 ? 16 : 12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(title, margin, yOffset + 5);

        // Add timetable image
        const imgData = canvas.toDataURL('image/png');
        const imgYPosition = yOffset + 10;

        pdf.addImage(imgData, 'PNG', margin, imgYPosition, imgWidth, imgHeight);

      } catch (error) {
        console.error(`Error generating PDF for element ${i + j}:`, error);
        // Continue with next element even if one fails
      }
    }

    // Add signature section on each page
    if (showSignatures) {
      const signatureY = pageHeight - margin - 5;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(
        'ลงชื่อ..............................รองผอ.วิชาการ',
        margin,
        signatureY
      );
      pdf.text(
        'ลงชื่อ..............................ผู้อำนวยการ',
        pageWidth / 2,
        signatureY
      );
    }

    // Add page numbers
    if (showPageNumbers) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const totalPages = Math.ceil(elements.length / tablesPerPage);
      pdf.text(
        `หน้า ${pageNumber} / ${totalPages}`,
        pageWidth - margin,
        pageHeight - margin,
        { align: 'right' }
      );
    }
  }

  // Save the PDF
  pdf.save(filename);
}

/**
 * Generate batch PDF for teacher timetables with customization options
 * 
 * @param teacherElements - Array of teacher timetable HTML elements
 * @param teacherNames - Array of teacher names
 * @param semester - Semester number
 * @param academicYear - Academic year
 * @param customOptions - Optional custom PDF generation options
 */
export async function generateTeacherBatchPDF(
  teacherElements: HTMLElement[],
  teacherNames: string[],
  semester: string,
  academicYear: string,
  customOptions?: Partial<BatchPDFOptions>
): Promise<void> {
  const titles = teacherNames.map(
    (name) => `ตารางสอน${name ? `: ${name}` : ''} - ภาคเรียนที่ ${semester}/${academicYear}`
  );

  await generateBatchPDF(teacherElements, titles, {
    filename: `ตารางสอนครู-${semester}-${academicYear}.pdf`,
    orientation: 'landscape',
    headerText: `ตารางสอนครู - ภาคเรียนที่ ${semester}/${academicYear}`,
    ...customOptions,
  });
}

/**
 * Generate batch PDF for student timetables with customization options
 * 
 * @param gradeElements - Array of grade timetable HTML elements
 * @param gradeLabels - Array of grade labels (e.g., "ม.1/1")
 * @param semester - Semester number
 * @param academicYear - Academic year
 * @param customOptions - Optional custom PDF generation options
 */
export async function generateStudentBatchPDF(
  gradeElements: HTMLElement[],
  gradeLabels: string[],
  semester: string,
  academicYear: string,
  customOptions?: Partial<BatchPDFOptions>
): Promise<void> {
  const titles = gradeLabels.map(
    (label) => `ตารางเรียน: ${label} - ภาคเรียนที่ ${semester}/${academicYear}`
  );

  await generateBatchPDF(gradeElements, titles, {
    filename: `ตารางเรียน-${semester}-${academicYear}.pdf`,
    orientation: 'landscape',
    headerText: `ตารางเรียนนักเรียน - ภาคเรียนที่ ${semester}/${academicYear}`,
    ...customOptions,
  });
}
