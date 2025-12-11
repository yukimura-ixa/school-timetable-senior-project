import { pdf } from "@react-pdf/renderer";
import { StudentTimetablePDF, type StudentTimetableData } from "../templates/student-timetable-pdf";

/**
 * Generate a PDF blob for a student timetable.
 * Server-side only - uses @react-pdf/renderer.
 * 
 * @param data Student timetable data including grade, semester, timeslots, and schedule entries
 * @returns Promise<Blob> PDF file as a Blob
 */
export async function generateStudentTimetablePDF(
  data: StudentTimetableData
): Promise<Blob> {
  const pdfDocument = <StudentTimetablePDF data={data} />;
  const instance = pdf(pdfDocument);
  return await instance.toBlob();
}
