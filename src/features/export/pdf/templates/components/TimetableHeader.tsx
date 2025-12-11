import { View, Text } from '@react-pdf/renderer';
import { pdfStyles } from '../../styles/pdf-styles';

interface TimetableHeaderProps {
  title: string;
  semester: number;
  academicYear: number;
  subtitle?: string;
}

/**
 * PDF Header Component for Timetable Exports
 * 
 * Displays title, semester, academic year with Thai formatting
 */
export const TimetableHeader = ({
  title,
  semester,
  academicYear,
  subtitle,
}: TimetableHeaderProps) => (
  <View style={pdfStyles.header}>
    <Text style={pdfStyles.headerTitle}>{title}</Text>
    <Text style={pdfStyles.headerSubtitle}>
      ภาคเรียนที่ {semester}/{academicYear}
    </Text>
    {subtitle && (
      <Text style={pdfStyles.headerSubtitle}>{subtitle}</Text>
    )}
  </View>
);
