import { View, Text } from '@react-pdf/renderer';
import { pdfStyles } from '../../styles/pdf-styles';

interface TimeslotData {
  day: string;
  period: number;
  subject?: string;
  room?: string;
  class?: string;
}

interface TimetableGridProps {
  timeslots: TimeslotData[];
  maxPeriods: number;
}

/**
 * PDF Grid Component for Timetable Display
 * 
 * Renders timetable grid with Thai day names and period slots
 */
export const TimetableGrid = ({ timeslots, maxPeriods }: TimetableGridProps) => {
  const days = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์'];
  
  return (
    <View style={pdfStyles.table}>
      {/* Header row */}
      <View style={pdfStyles.tableRow}>
        <View style={pdfStyles.tableColHeader}>
          <Text style={pdfStyles.tableCellText}>คาบ/วัน</Text>
        </View>
        {days.map((day) => (
          <View key={day} style={pdfStyles.tableColHeader}>
            <Text style={pdfStyles.tableCellText}>{day}</Text>
          </View>
        ))}
      </View>
      
      {/* Data rows */}
      {Array.from({ length: maxPeriods }, (_, period) => (
        <View key={period} style={pdfStyles.tableRow}>
          <View style={pdfStyles.tableCol}>
            <Text style={pdfStyles.tableCellText}>{period + 1}</Text>
          </View>
          {days.map((day) => {
            const slot = timeslots.find(
              (t) => t.day === day && t.period === period
            );
            return (
              <View key={`${day}-${period}`} style={pdfStyles.tableCol}>
                {slot ? (
                  <>
                    <Text style={pdfStyles.tableCellText}>
                      {slot.subject}
                    </Text>
                    {slot.room && (
                      <Text style={pdfStyles.tableCellText}>
                        ห้อง {slot.room}
                      </Text>
                    )}
                    {slot.class && (
                      <Text style={pdfStyles.tableCellText}>
                        {slot.class}
                      </Text>
                    )}
                  </>
                ) : null}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
};
