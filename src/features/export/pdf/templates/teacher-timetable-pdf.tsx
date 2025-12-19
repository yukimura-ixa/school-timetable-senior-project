import { Document, Page, View, Text } from '@react-pdf/renderer';
import { pdfStyles } from '../styles/pdf-styles';
import { TimetableHeader } from './components/TimetableHeader';
import { TimetableGrid } from './components/TimetableGrid';
import { CreditSummary } from './components/CreditSummary';
import { formatThaiDateNumericBangkok } from '@/utils/datetime';

export interface TeacherTimetableData {
  teacherId: number;
  teacherName: string;
  semester: number;
  academicYear: number;
  timeslots: Array<{
    day: string;
    period: number;
    subject?: string;
    room?: string;
    class?: string;
  }>;
  totalCredits: number;
  totalHours: number;
}

/**
 * Teacher Timetable PDF Document Template
 * 
 * Server-side PDF generation for teacher schedules
 * Admin-only access enforced at API route level
 */
export const TeacherTimetablePDF = ({ data }: { data: TeacherTimetableData }) => (
  <Document>
    <Page size="A4" orientation="landscape" style={pdfStyles.page}>
      <TimetableHeader
        title={`ตารางสอน ${data.teacherName}`}
        semester={data.semester}
        academicYear={data.academicYear}
        subtitle={`รหัสครู: ${data.teacherId}`}
      />
      
      <TimetableGrid
        timeslots={data.timeslots}
        maxPeriods={8}
      />
      
      <CreditSummary
        totalCredits={data.totalCredits}
        totalHours={data.totalHours}
      />
      
      <View style={pdfStyles.footer}>
        <Text>
          สร้างเมื่อ: {formatThaiDateNumericBangkok(new Date())}
        </Text>
      </View>
    </Page>
  </Document>
);
