/**
 * Accessible CircularProgress Wrapper
 * Ensures all loading spinners have proper aria-label for screen readers
 */
import { CircularProgress, type CircularProgressProps } from "@mui/material";

interface AccessibleCircularProgressProps extends CircularProgressProps {
  "aria-label"?: string;
}

export function AccessibleCircularProgress({
  "aria-label": ariaLabel = "กำลังโหลด",
  ...props
}: AccessibleCircularProgressProps) {
  return <CircularProgress aria-label={ariaLabel} {...props} />;
}
