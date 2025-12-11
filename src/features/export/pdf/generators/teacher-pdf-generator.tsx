import { pdf } from '@react-pdf/renderer';
import { TeacherTimetablePDF, TeacherTimetableData } from '../templates/teacher-timetable-pdf';

/**
 * Generate Teacher Timetable PDF
 * 
 * Server-side PDF generation function
 * Returns Blob for API route response
 */
export async function generateTeacherTimetablePDF(
  data: TeacherTimetableData
): Promise<Blob> {
  const pdfDocument = <TeacherTimetablePDF data={data} />;
  return await pdf(pdfDocument).toBlob();
}
