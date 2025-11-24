"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Box, Typography, Button, Paper, Stack } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import RefreshIcon from "@mui/icons-material/Refresh";
import HomeIcon from "@mui/icons-material/Home";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary - React error boundary for graceful crash recovery
 *
 * Usage:
 * ```tsx
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 *
 * With custom fallback:
 * ```tsx
 * <ErrorBoundary fallback={<CustomErrorUI />}>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console (in production, send to error tracking service)
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // Update state with error details
    this.setState({
      error,
      errorInfo,
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = (): void => {
    window.location.href = "/";
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            p: 3,
            bgcolor: "grey.50",
          }}
        >
          <Paper
            elevation={3}
            sx={{
              maxWidth: 600,
              width: "100%",
              p: { xs: 3, sm: 4, md: 5 },
              textAlign: "center",
            }}
          >
            <ErrorOutlineIcon
              sx={{
                fontSize: { xs: 64, sm: 80 },
                color: "error.main",
                mb: 2,
              }}
            />

            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 600,
                fontSize: { xs: "1.5rem", sm: "2rem" },
              }}
            >
              เกิดข้อผิดพลาด
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 3, fontSize: { xs: "0.875rem", sm: "1rem" } }}
            >
              ขออภัย เกิดข้อผิดพลาดที่ไม่คาดคิด
              กรุณาลองรีเฟรชหน้านี้หรือกลับไปหน้าแรก
            </Typography>

            {/* Show error details in development */}
            {process.env.NODE_ENV === "development" && this.state.error && (
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  mb: 3,
                  textAlign: "left",
                  bgcolor: "grey.100",
                  maxHeight: 200,
                  overflow: "auto",
                }}
              >
                <Typography
                  variant="caption"
                  component="pre"
                  sx={{
                    fontFamily: "monospace",
                    fontSize: "0.75rem",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {this.state.error.toString()}
                  {this.state.errorInfo &&
                    "\n\n" + this.state.errorInfo.componentStack}
                </Typography>
              </Paper>
            )}

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              justifyContent="center"
            >
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<RefreshIcon />}
                onClick={this.handleReset}
                sx={{ minWidth: { xs: "100%", sm: 140 } }}
              >
                ลองอีกครั้ง
              </Button>
              <Button
                variant="outlined"
                color="primary"
                size="large"
                startIcon={<HomeIcon />}
                onClick={this.handleGoHome}
                sx={{ minWidth: { xs: "100%", sm: 140 } }}
              >
                กลับหน้าแรก
              </Button>
            </Stack>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
