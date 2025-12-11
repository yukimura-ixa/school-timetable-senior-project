import { Font } from '@react-pdf/renderer';

/**
 * Register Thai fonts for PDF generation
 * 
 * Sarabun font is used for MOE-compliant timetable exports.
 * Fonts must be available in public/fonts/ directory.
 */
Font.register({
  family: 'Sarabun',
  fonts: [
    {
      src: '/fonts/Sarabun-Regular.ttf',
      fontWeight: 'normal',
    },
    {
      src: '/fonts/Sarabun-Bold.ttf',
      fontWeight: 'bold',
    },
  ],
});

/**
 * Export preset styles with Thai font
 */
export const thaiTextStyle = {
  fontFamily: 'Sarabun',
};

export const thaiBoldStyle = {
  fontFamily: 'Sarabun',
  fontWeight: 'bold' as const,
};
