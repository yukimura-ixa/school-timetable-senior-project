import { StyleSheet } from '@react-pdf/renderer';

/**
 * Base PDF styles for timetable exports
 * 
 * Uses Sarabun font for Thai MOE compliance.
 * Designed for A4 landscape orientation.
 */
export const pdfStyles = StyleSheet.create({
  // Page layout
  page: {
    padding: 30,
    fontFamily: 'Sarabun',
    fontSize: 10,
  },
  
  // Header section
  header: {
    marginBottom: 20,
    borderBottom: '2pt solid #333',
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    color: '#666',
  },
  
  // Timetable grid
  table: {
    width: 'auto',
    marginTop: 10,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '14.28%', // 100% / 7 days
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#f0f0f0',
    padding: 5,
  },
  tableCol: {
    width: '14.28%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    padding: 5,
  },
  tableCellText: {
    fontSize: 8,
    fontFamily: 'Sarabun',
  },
  
  // Footer
  footer: {
    marginTop: 20,
    fontSize: 9,
    color: '#666',
    borderTop: '1pt solid #ccc',
    paddingTop: 10,
  },
  
  // Credit summary
  creditSummary: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
  },
  creditText: {
    fontSize: 10,
    marginBottom: 3,
  },
});
