import { View, Text } from '@react-pdf/renderer';
import { pdfStyles } from '../../styles/pdf-styles';

interface CreditSummaryProps {
  totalCredits: number;
  totalHours: number;
}

/**
 * PDF Credit Summary Component
 * 
 * Displays total credits (หน่วยกิต) and hours (ชั่วโมงเรียน) for MOE compliance
 */
export const CreditSummary = ({
  totalCredits,
  totalHours,
}: CreditSummaryProps) => (
  <View style={pdfStyles.creditSummary}>
    <Text style={pdfStyles.creditText}>
      รวมหน่วยกิต: {totalCredits} หน่วยกิต
    </Text>
    <Text style={pdfStyles.creditText}>
      รวมชั่วโมงเรียน: {totalHours} ชั่วโมง
    </Text>
  </View>
);
