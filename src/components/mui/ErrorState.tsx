/**
 * MUI ErrorState Component
 *
 * Simple migration from custom ErrorState to MUI Alert
 *
 * Migration from: src/components/elements/static/ErrorState.tsx
 * Date: October 19, 2025
 *
 * @example
 * // Old API
 * <ErrorState message="An error occurred" />
 *
 * // New API (MUI Alert with more features)
 * <ErrorState
 *   message="An error occurred"
 *   severity="error"
 *   onClose={() => handleDismiss()}
 * />
 */

import React from "react";
import { Alert, type AlertProps } from "@mui/material";

interface ErrorStateProps extends Omit<AlertProps, "children"> {
  message: string;
}

/**
 * ErrorState - MUI Alert-based error display
 *
 * Features:
 * - Multiple severity levels (error, warning, info, success)
 * - Optional close button
 * - Icon support
 * - Better accessibility
 */
const ErrorState: React.FC<ErrorStateProps> = ({
  message,
  severity = "error",
  variant = "outlined",
  sx,
  ...rest
}) => {
  return (
    <Alert
      severity={severity}
      variant={variant}
      sx={{
        fontSize: "0.875rem", // text-sm
        ...sx,
      }}
      {...rest}
    >
      {message}
    </Alert>
  );
};

export default ErrorState;

// Re-export MUI Alert for direct usage
export { Alert } from "@mui/material";
