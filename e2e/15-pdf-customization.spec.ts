import { test, expect } from "./fixtures/admin.fixture";
import { PDFCustomizationDialogPO } from './page-objects/PDFCustomizationDialogPO';
import { TeacherTablePO } from './page-objects/TeacherTablePO';
import { StudentTablePO } from './page-objects/StudentTablePO';

/**
 * TC-099: PDF Customization E2E Tests
 * 
 * These tests verify the complete PDF customization workflow:
 * - Teacher table PDF export with custom options
 * - Student table PDF export with custom options
 * - Dialog interactions (open, configure, export, cancel, reset)
 * - All customization options (paper size, orientation, sliders, toggles)
 * 
 * Related: GitHub Issue #100 - PDF Customization Implementation
 */

test.describe('PDF Customization - Teacher Table', () => {
  const SEMESTER = '1-2567';
  let teacherTablePO: TeacherTablePO;
  let pdfDialogPO: PDFCustomizationDialogPO;

  test.beforeEach(async ({ page }) => {
    teacherTablePO = new TeacherTablePO(page);
    pdfDialogPO = new PDFCustomizationDialogPO(page);
    
    // Navigate to teacher table page
    await teacherTablePO.goto(SEMESTER);
    await teacherTablePO.assertPageLoaded();
  });

  test('TC-099-01: Open PDF customization dialog from teacher table', async () => {
    // Select first 2 teachers
    await teacherTablePO.selectTeachers([0, 1]);
    
    // Open custom PDF export dialog
    await teacherTablePO.clickCustomPdfExport();
    
    // Verify dialog opened
    await pdfDialogPO.assertDialogOpen();
    
    // Verify default values
    await pdfDialogPO.assertDefaultValues();
    
    // Take screenshot for documentation
    await pdfDialogPO.takeScreenshot('pdf-dialog-teacher-defaults');
  });

  test('TC-099-02: Export teacher PDFs with A3 landscape, 2 tables/page', async () => {
    // Select teachers
    await teacherTablePO.selectTeachers([0, 1]);
    await teacherTablePO.clickCustomPdfExport();
    
    // Configure PDF options
    await pdfDialogPO.configurePDF({
      paperSize: 'A3',
      orientation: 'landscape',
      tablesPerPage: 2,
      margin: 15,
      quality: 2,
      showPageNumbers: true,
      showSignatures: true
    });
    
    // Verify preview updates
    await pdfDialogPO.assertPreviewContains('A3', 'แนวนอน');
    
    // Take screenshot before export
    await pdfDialogPO.takeScreenshot('pdf-dialog-teacher-a3-landscape');
    
    // Export PDF
    await pdfDialogPO.clickExport();
    
    // Verify dialog closes after export
    await pdfDialogPO.assertDialogClosed();
    
    // Verify success notification (if implemented)
    // await pdfDialogPO.assertSuccessNotification();
  });

  test('TC-099-03: Export teacher PDFs with Letter portrait, 4 tables/page', async () => {
    await teacherTablePO.selectTeachers([0, 1, 2]);
    await teacherTablePO.clickCustomPdfExport();
    
    await pdfDialogPO.configurePDF({
      paperSize: 'Letter',
      orientation: 'portrait',
      tablesPerPage: 4,
      margin: 10,
      quality: 3,
      showPageNumbers: false,
      showSignatures: false
    });
    
    await pdfDialogPO.assertPreviewContains('Letter', 'แนวตั้ง');
    await pdfDialogPO.takeScreenshot('pdf-dialog-teacher-letter-portrait');
    
    await pdfDialogPO.clickExport();
    await pdfDialogPO.assertDialogClosed();
  });

  test('TC-099-04: Test all paper sizes for teacher export', async () => {
    const paperSizes: Array<'A4' | 'A3' | 'Letter' | 'Legal' | 'Tabloid'> = [
      'A4', 'A3', 'Letter', 'Legal', 'Tabloid'
    ];

    for (const size of paperSizes) {
      // Select teachers
      await teacherTablePO.selectTeachers([0]);
      await teacherTablePO.clickCustomPdfExport();
      
      // Set paper size
      await pdfDialogPO.selectPaperSize(size);
      
      // Verify preview shows correct size
      await pdfDialogPO.assertPreviewContains(size, '');
      
      // Take screenshot
      await pdfDialogPO.takeScreenshot(`pdf-dialog-teacher-${size.toLowerCase()}`);
      
      // Cancel to test next size
      await pdfDialogPO.clickCancel();
      await pdfDialogPO.assertDialogClosed();
    }
  });

  test('TC-099-05: Reset teacher PDF options to defaults', async () => {
    await teacherTablePO.selectTeachers([0]);
    await teacherTablePO.clickCustomPdfExport();
    
    // Change all options
    await pdfDialogPO.configurePDF({
      paperSize: 'Tabloid',
      orientation: 'landscape',
      tablesPerPage: 1,
      margin: 20,
      quality: 1,
      showPageNumbers: false,
      showSignatures: false
    });
    
    // Reset to defaults
    await pdfDialogPO.clickReset();
    
    // Verify defaults restored
    await pdfDialogPO.assertDefaultValues();
    
    await pdfDialogPO.takeScreenshot('pdf-dialog-teacher-after-reset');
  });

  test('TC-099-06: Cancel teacher PDF export', async () => {
    await teacherTablePO.selectTeachers([0]);
    await teacherTablePO.clickCustomPdfExport();
    
    // Configure some options
    await pdfDialogPO.configurePDF({
      paperSize: 'A3',
      orientation: 'landscape'
    });
    
    // Cancel without exporting
    await pdfDialogPO.clickCancel();
    
    // Verify dialog closed
    await pdfDialogPO.assertDialogClosed();
    
    // Reopen to verify options weren't saved
    await teacherTablePO.clickCustomPdfExport();
    await pdfDialogPO.assertDefaultValues();
  });

  test('TC-099-07: Test extreme slider values for teachers', async () => {
    await teacherTablePO.selectTeachers([0]);
    await teacherTablePO.clickCustomPdfExport();
    
    // Test minimum values
    await pdfDialogPO.setTablesPerPage(1);
    await pdfDialogPO.setMargin(5);
    await pdfDialogPO.setQuality(1);
    
    await pdfDialogPO.takeScreenshot('pdf-dialog-teacher-min-values');
    
    // Test maximum values
    await pdfDialogPO.setTablesPerPage(10);
    await pdfDialogPO.setMargin(20);
    await pdfDialogPO.setQuality(3);
    
    await pdfDialogPO.takeScreenshot('pdf-dialog-teacher-max-values');
    
    await pdfDialogPO.clickExport();
    await pdfDialogPO.assertDialogClosed();
  });
});

test.describe('PDF Customization - Student Table', () => {
  const SEMESTER = '1-2567';
  let studentTablePO: StudentTablePO;
  let pdfDialogPO: PDFCustomizationDialogPO;

  test.beforeEach(async ({ page }) => {
    studentTablePO = new StudentTablePO(page);
    pdfDialogPO = new PDFCustomizationDialogPO(page);
    
    // Navigate to student table page
    await studentTablePO.goto(SEMESTER);
    await studentTablePO.assertPageLoaded();
  });

  test('TC-099-08: Open PDF customization dialog from student table', async () => {
    // Select first 2 classes
    await studentTablePO.selectClasses([0, 1]);
    
    // Open custom PDF export dialog
    await studentTablePO.clickCustomPdfExport();
    
    // Verify dialog opened
    await pdfDialogPO.assertDialogOpen();
    
    // Verify default values
    await pdfDialogPO.assertDefaultValues();
    
    await pdfDialogPO.takeScreenshot('pdf-dialog-student-defaults');
  });

  test('TC-099-09: Export student PDFs with A4 portrait, 3 tables/page', async () => {
    await studentTablePO.selectClasses([0, 1, 2]);
    await studentTablePO.clickCustomPdfExport();
    
    await pdfDialogPO.configurePDF({
      paperSize: 'A4',
      orientation: 'portrait',
      tablesPerPage: 3,
      margin: 12,
      quality: 2,
      showPageNumbers: true,
      showSignatures: true
    });
    
    await pdfDialogPO.assertPreviewContains('A4', 'แนวตั้ง');
    await pdfDialogPO.takeScreenshot('pdf-dialog-student-a4-portrait');
    
    await pdfDialogPO.clickExport();
    await pdfDialogPO.assertDialogClosed();
  });

  test('TC-099-10: Export student PDFs with Legal landscape, 6 tables/page', async () => {
    await studentTablePO.selectClasses([0, 1, 2, 3]);
    await studentTablePO.clickCustomPdfExport();
    
    await pdfDialogPO.configurePDF({
      paperSize: 'Legal',
      orientation: 'landscape',
      tablesPerPage: 6,
      margin: 8,
      quality: 1,
      showPageNumbers: false,
      showSignatures: true
    });
    
    await pdfDialogPO.assertPreviewContains('Legal', 'แนวนอน');
    await pdfDialogPO.takeScreenshot('pdf-dialog-student-legal-landscape');
    
    await pdfDialogPO.clickExport();
    await pdfDialogPO.assertDialogClosed();
  });

  test('TC-099-11: Test all orientations for student export', async () => {
    const orientations: Array<'portrait' | 'landscape'> = ['portrait', 'landscape'];

    for (const orientation of orientations) {
      await studentTablePO.selectClasses([0]);
      await studentTablePO.clickCustomPdfExport();
      
      await pdfDialogPO.selectOrientation(orientation);
      
      const orientationText = orientation === 'portrait' ? 'แนวตั้ง' : 'แนวนอน';
      await pdfDialogPO.assertPreviewContains('', orientationText);
      
      await pdfDialogPO.takeScreenshot(`pdf-dialog-student-${orientation}`);
      
      await pdfDialogPO.clickCancel();
      await pdfDialogPO.assertDialogClosed();
    }
  });

  test('TC-099-12: Reset student PDF options to defaults', async () => {
    await studentTablePO.selectClasses([0]);
    await studentTablePO.clickCustomPdfExport();
    
    // Change all options
    await pdfDialogPO.configurePDF({
      paperSize: 'Legal',
      orientation: 'landscape',
      tablesPerPage: 6,
      margin: 5,
      quality: 3,
      showPageNumbers: false,
      showSignatures: false
    });
    
    // Reset to defaults
    await pdfDialogPO.clickReset();
    
    // Verify defaults restored
    await pdfDialogPO.assertDefaultValues();
    
    await pdfDialogPO.takeScreenshot('pdf-dialog-student-after-reset');
  });

  test('TC-099-13: Cancel student PDF export', async () => {
    await studentTablePO.selectClasses([0]);
    await studentTablePO.clickCustomPdfExport();
    
    await pdfDialogPO.configurePDF({
      paperSize: 'Tabloid',
      tablesPerPage: 1
    });
    
    await pdfDialogPO.clickCancel();
    await pdfDialogPO.assertDialogClosed();
    
    // Reopen to verify options weren't saved
    await studentTablePO.clickCustomPdfExport();
    await pdfDialogPO.assertDefaultValues();
  });

  test('TC-099-14: Test toggle switches for students', async () => {
    await studentTablePO.selectClasses([0]);
    await studentTablePO.clickCustomPdfExport();
    
    // Disable page numbers
    await pdfDialogPO.togglePageNumbers(false);
    await pdfDialogPO.takeScreenshot('pdf-dialog-student-no-page-numbers');
    
    // Re-enable page numbers, disable signatures
    await pdfDialogPO.togglePageNumbers(true);
    await pdfDialogPO.toggleSignatures(false);
    await pdfDialogPO.takeScreenshot('pdf-dialog-student-no-signatures');
    
    // Disable both
    await pdfDialogPO.togglePageNumbers(false);
    await pdfDialogPO.takeScreenshot('pdf-dialog-student-no-numbers-no-signatures');
    
    await pdfDialogPO.clickExport();
    await pdfDialogPO.assertDialogClosed();
  });
});

test.describe('PDF Customization - Cross-functionality', () => {
  const SEMESTER = '1-2567';

  test('TC-099-15: Dialog state persists between teacher and student pages', async ({ authenticatedAdmin }) => {
    const { page } = authenticatedAdmin;
    const teacherTablePO = new TeacherTablePO(page);
    const studentTablePO = new StudentTablePO(page);
    const pdfDialogPO = new PDFCustomizationDialogPO(page);
    
    // Configure on teacher page
    await teacherTablePO.goto(SEMESTER);
    await teacherTablePO.selectTeachers([0]);
    await teacherTablePO.clickCustomPdfExport();
    
    await pdfDialogPO.configurePDF({
      paperSize: 'A3',
      orientation: 'landscape',
      tablesPerPage: 2
    });
    
    await pdfDialogPO.clickCancel();
    
    // Switch to student page
    await studentTablePO.goto(SEMESTER);
    await studentTablePO.selectClasses([0]);
    await studentTablePO.clickCustomPdfExport();
    
    // Verify defaults (not persisted from teacher page)
    await pdfDialogPO.assertDefaultValues();
  });

  test('TC-099-16: Export with all options enabled', async ({ authenticatedAdmin }) => {
    const { page } = authenticatedAdmin;
    const teacherTablePO = new TeacherTablePO(page);
    const pdfDialogPO = new PDFCustomizationDialogPO(page);
    
    await teacherTablePO.goto(SEMESTER);
    await teacherTablePO.selectTeachers([0]);
    await teacherTablePO.clickCustomPdfExport();
    
    // Set all options to maximum
    await pdfDialogPO.configurePDF({
      paperSize: 'Tabloid',
      orientation: 'landscape',
      tablesPerPage: 10,
      margin: 20,
      quality: 3,
      showPageNumbers: true,
      showSignatures: true
    });
    
    await pdfDialogPO.takeScreenshot('pdf-dialog-all-options-max');
    
    await pdfDialogPO.clickExport();
    await pdfDialogPO.assertDialogClosed();
  });

  test('TC-099-17: Export with all options disabled/minimum', async ({ authenticatedAdmin }) => {
    const { page } = authenticatedAdmin;
    const studentTablePO = new StudentTablePO(page);
    const pdfDialogPO = new PDFCustomizationDialogPO(page);
    
    await studentTablePO.goto(SEMESTER);
    await studentTablePO.selectClasses([0]);
    await studentTablePO.clickCustomPdfExport();
    
    // Set all options to minimum
    await pdfDialogPO.configurePDF({
      paperSize: 'A4',
      orientation: 'portrait',
      tablesPerPage: 1,
      margin: 5,
      quality: 1,
      showPageNumbers: false,
      showSignatures: false
    });
    
    await pdfDialogPO.takeScreenshot('pdf-dialog-all-options-min');
    
    await pdfDialogPO.clickExport();
    await pdfDialogPO.assertDialogClosed();
  });
});

