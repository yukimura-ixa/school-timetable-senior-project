'use client'
import { createTheme, alpha } from "@mui/material"
import { Sarabun } from "next/font/google"

const sarabun = Sarabun({ subsets: ["thai", "latin"], weight: ['300', '400', '500', '700'], })

const theme = createTheme({
    typography: {
        fontFamily: sarabun.style.fontFamily,
        // Improve readability with better font sizes
        h1: { fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.2 },
        h2: { fontSize: '2rem', fontWeight: 600, lineHeight: 1.3 },
        h3: { fontSize: '1.75rem', fontWeight: 600, lineHeight: 1.4 },
        h4: { fontSize: '1.5rem', fontWeight: 500, lineHeight: 1.5 },
        h5: { fontSize: '1.25rem', fontWeight: 500, lineHeight: 1.6 },
        h6: { fontSize: '1rem', fontWeight: 500, lineHeight: 1.6 },
        body1: { fontSize: '1rem', lineHeight: 1.7 },
        body2: { fontSize: '0.875rem', lineHeight: 1.6 },
        button: { textTransform: 'none', fontWeight: 500 }, // Remove uppercase
    },
    palette: {
        primary: {
            main: '#3B82F6', // blue-500
            light: '#DBEAFE', // blue-100
            dark: '#1E3A8A', // blue-900
            contrastText: '#FFFFFF',
        },
        secondary: {
            main: '#A855F7', // purple-500
            light: '#E9D5FF', // purple-100
            dark: '#6B21A8', // purple-900
            contrastText: '#FFFFFF',
        },
        success: {
            main: '#10B981', // green-500
            light: '#D1FAE5', // green-100
            dark: '#065F46', // green-900
        },
        warning: {
            main: '#F59E0B', // amber-500
            light: '#FEF3C7', // amber-100
            dark: '#92400E', // amber-900
        },
        error: {
            main: '#EF4444', // red-500
            light: '#FEE2E2', // red-100
            dark: '#991B1B', // red-900
        },
        info: {
            main: '#06B6D4', // cyan-500
            light: '#CFFAFE', // cyan-100
            dark: '#164E63', // cyan-900
        },
        background: {
            default: '#F9FAFB', // gray-50
            paper: '#FFFFFF',
        },
        text: {
            primary: '#111827', // gray-900
            secondary: '#6B7280', // gray-500
            disabled: '#9CA3AF', // gray-400
        },
    },
    shape: {
        borderRadius: 8, // More modern rounded corners
    },
    shadows: [
        'none',
        '0 1px 2px 0 rgba(0, 0, 0, 0.05)', // sm
        '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)', // base
        '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', // md
        '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', // lg
        '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', // xl
        '0 25px 50px -12px rgba(0, 0, 0, 0.25)', // 2xl
        // Additional shadows for MUI compatibility (need exactly 25 total)
        '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    ] as any,
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 6,
                    padding: '8px 16px',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: 'none',
                    },
                },
                sizeSmall: {
                    padding: '4px 12px',
                    fontSize: '0.8125rem',
                },
                sizeLarge: {
                    padding: '12px 24px',
                    fontSize: '1rem',
                },
            },
        },
        MuiTextField: {
            defaultProps: {
                size: 'small', // Smaller default for better density
            },
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 6,
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                },
                elevation1: {
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                },
                elevation2: {
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                },
                elevation3: {
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 6,
                    fontWeight: 500,
                },
            },
        },
        MuiAlert: {
            styleOverrides: {
                root: {
                    borderRadius: 6,
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: 12, // Slightly more rounded for modals
                },
            },
        },
    },
})

export default theme