"use client";
import { createTheme, alpha, Shadows } from "@mui/material";
import { Sarabun, Inter } from "next/font/google";

const sarabun = Sarabun({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "800", "900"],
});

// Create a theme instance.
const theme = createTheme({
  typography: {
    fontFamily:
      inter.style.fontFamily + ", " + sarabun.style.fontFamily + ", sans-serif",
    h1: {
      fontSize: "2.5rem",
      fontWeight: 800,
      lineHeight: 1.2,
      letterSpacing: "-0.02em",
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 800,
      lineHeight: 1.3,
      letterSpacing: "-0.01em",
    },
    h3: { fontSize: "1.75rem", fontWeight: 700, lineHeight: 1.4 },
    h4: { fontSize: "1.5rem", fontWeight: 700, lineHeight: 1.5 },
    h5: { fontSize: "1.25rem", fontWeight: 600, lineHeight: 1.6 },
    h6: { fontSize: "1rem", fontWeight: 600, lineHeight: 1.6 },
    body1: { fontSize: "1rem", lineHeight: 1.7, fontWeight: 400 },
    body2: { fontSize: "0.875rem", lineHeight: 1.6, fontWeight: 400 },
    subtitle1: { fontWeight: 500 },
    subtitle2: { fontWeight: 500 },
    button: { textTransform: "none", fontWeight: 700, letterSpacing: "0.01em" },
  },
  palette: {
    primary: {
      main: "#3B82F6", // blue-500
      light: "#60A5FA",
      dark: "#1D4ED8",
      contrastText: "#FFFFFF",
      lighter: "#EFF6FF",
    },
    secondary: {
      main: "#A855F7", // purple-500
      light: "#C084FC",
      dark: "#7E22CE",
      contrastText: "#FFFFFF",
    },
    success: {
      main: "#10B981", // emerald-500
      light: "#34D399",
      dark: "#047857",
    },
    warning: {
      main: "#F59E0B", // amber-500
      light: "#FBBF24",
      dark: "#B45309",
    },
    error: {
      main: "#EF4444", // red-500
      light: "#F87171",
      dark: "#B91C1C",
    },
    info: {
      main: "#06B6D4", // cyan-500
      light: "#22D3EE",
      dark: "#0E7490",
    },
    slate: {
      50: "#F8FAF8",
      100: "#F1F5F9",
      200: "#E2E8F0",
      300: "#CBD5E1",
      400: "#94A3B8",
      500: "#64748B",
      600: "#475569",
      700: "#334155",
      800: "#1E293B",
      900: "#0F172A",
    },
    glass: {
      main: "rgba(255, 255, 255, 0.7)",
      light: "rgba(255, 255, 255, 0.4)",
      dark: "rgba(255, 255, 255, 0.9)",
      border: "rgba(255, 255, 255, 0.3)",
      borderLight: "rgba(255, 255, 255, 0.5)",
    },
    background: {
      default: "#F8FAFC", // slate-50
      paper: "#FFFFFF",
    },
    text: {
      primary: "#0F172A", // slate-900
      secondary: "#475569", // slate-600
      disabled: "#94A3B8", // slate-400
    },
  },
  shape: {
    borderRadius: 12, // Softer rounding
  },
  shadows: [
    "none",
    "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    // Layered Soft Shadows
    "0 2px 4px rgba(0,0,0,0.02), 0 1px 0 rgba(0,0,0,0.02)",
    "0 4px 6px rgba(0,0,0,0.02), 0 1px 0 rgba(0,0,0,0.02)",
    "0 10px 15px -3px rgba(0,0,0,0.03), 0 4px 6px -2px rgba(0,0,0,0.03)",
    "0 12px 20px -3px rgba(0,0,0,0.04), 0 4px 6px -2px rgba(0,0,0,0.04)",
    "0 20px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05)",
    "0 25px 35px -5px rgba(0,0,0,0.06), 0 12px 15px -6px rgba(0,0,0,0.06)",
    "0 30px 45px -5px rgba(0,0,0,0.07), 0 15px 20px -6px rgba(0,0,0,0.07)",
    "0 35px 55px -5px rgba(0,0,0,0.08), 0 18px 25px -6px rgba(0,0,0,0.08)",
    "0 40px 65px -5px rgba(0,0,0,0.09), 0 20px 30px -6px rgba(0,0,0,0.09)",
    "0 45px 75px -5px rgba(0,0,0,0.1), 0 22px 35px -6px rgba(0,0,0,0.1)",
    "0 50px 85px -5px rgba(0,0,0,0.11), 0 25px 40px -6px rgba(0,0,0,0.11)",
    "0 55px 95px -5px rgba(0,0,0,0.12), 0 28px 45px -6px rgba(0,0,0,0.12)",
    "0 60px 105px -5px rgba(0,0,0,0.13), 0 30px 50px -6px rgba(0,0,0,0.13)",
    "0 65px 115px -5px rgba(0,0,0,0.14), 0 32px 55px -6px rgba(0,0,0,0.14)",
    "0 70px 125px -5px rgba(0,0,0,0.15), 0 35px 60px -6px rgba(0,0,0,0.15)",
    "0 75px 135px -5px rgba(0,0,0,0.16), 0 38px 65px -6px rgba(0,0,0,0.16)",
    "0 80px 145px -5px rgba(0,0,0,0.17), 0 40px 70px -6px rgba(0,0,0,0.17)",
    "0 85px 155px -5px rgba(0,0,0,0.18), 0 42px 75px -6px rgba(0,0,0,0.18)",
    "0 90px 165px -5px rgba(0,0,0,0.19), 0 45px 80px -6px rgba(0,0,0,0.19)",
  ] as Shadows,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999, // Pill by default
          padding: "8px 20px",
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            transform: "translateY(-1px)",
          },
          "&:active": {
            transform: "translateY(0px)",
          },
        },
        containedPrimary: {
          background: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
          border: "none",
          "&:hover": {
            background: "linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)",
          },
        },
        outlined: {
          borderWidth: "1.5px",
          "&:hover": {
            borderWidth: "1.5px",
            backgroundColor: "rgba(59, 130, 246, 0.04)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow:
            "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        },
        // Custom variant-like behavior for Glassmorphism
        elevation1: {
          backgroundColor: "rgba(255, 255, 255, 0.7)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundColor: "#FFFFFF",
          border: "1px solid #F1F5F9",
          boxShadow: "0 10px 40px rgba(0,0,0,0.04)",
          overflow: "hidden",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          fontSize: "0.75rem",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 24,
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(255, 255, 255, 0.4)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: "#F8FAFC",
          color: "#475569",
          fontWeight: 700,
          fontSize: "0.75rem",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        },
        root: {
          padding: "16px",
          borderColor: "#F1F5F9",
        },
      },
    },
  },
});

export default theme;
