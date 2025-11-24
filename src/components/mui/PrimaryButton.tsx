/**
 * MUI-based PrimaryButton Component
 *
 * This is a backward-compatible wrapper around MUI Button that maintains
 * the original PrimaryButton API while leveraging MUI's features.
 *
 * Migration from: src/components/elements/static/PrimaryButton.tsx
 * Date: October 19, 2025
 *
 * @example
 * // Old API (still works)
 * <PrimaryButton
 *   handleClick={handleSave}
 *   title="Save"
 *   color="success"
 *   Icon={<CheckIcon />}
 *   reverseIcon={false}
 *   isDisabled={false}
 * />
 *
 * // Can also use MUI API directly
 * <PrimaryButton
 *   onClick={handleSave}
 *   color="success"
 *   startIcon={<CheckIcon />}
 * >
 *   Save
 * </PrimaryButton>
 */

import React from "react";
import {
  Button,
  type ButtonProps,
  type SxProps,
  type Theme,
} from "@mui/material";

// Legacy API types (backward compatibility)
interface LegacyPrimaryButtonProps {
  handleClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  title?: string;
  color?: "info" | "secondary" | "warning" | "success" | "danger" | "primary";
  Icon?: React.ReactNode | null;
  reverseIcon?: boolean;
  isDisabled?: boolean;
}

// Combined type that accepts both old and new APIs
type PrimaryButtonProps = LegacyPrimaryButtonProps &
  Omit<ButtonProps, "color"> & {
    color?:
      | "info"
      | "secondary"
      | "warning"
      | "success"
      | "danger"
      | "primary"
      | "error"
      | "inherit";
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
  };

/**
 * PrimaryButton - MUI-based button with backward compatibility
 *
 * Supports both legacy API (handleClick, title, Icon, reverseIcon, isDisabled)
 * and native MUI Button API (onClick, children, startIcon, endIcon, disabled)
 */
const PrimaryButton = React.forwardRef<HTMLButtonElement, PrimaryButtonProps>(
  function PrimaryButton(
    {
      // Legacy props
      handleClick,
      title,
      Icon,
      reverseIcon,
      isDisabled,

      // MUI props
      onClick,
      children,
      color = "primary",
      variant = "contained",
      disabled,
      startIcon,
      endIcon,
      size = "medium",
      sx,
      ...rest
    },
    ref,
  ) {
    // Determine which API is being used
    const useLegacyAPI =
      handleClick !== undefined || title !== undefined || Icon !== undefined;

    // Map legacy color "danger" to MUI "error"
    const muiColor = color === "danger" ? "error" : color;

    // Determine click handler (legacy vs new)
    const handleClickEvent = handleClick || onClick;

    // Determine disabled state (legacy vs new)
    const isButtonDisabled = isDisabled !== undefined ? isDisabled : disabled;

    // Determine icon placement
    const iconStart = Icon && !reverseIcon ? Icon : startIcon;
    const iconEnd = Icon && reverseIcon ? Icon : endIcon;

    // Determine button content
    const buttonContent = title || children;

    // Custom styling to match Tailwind design
    const customSx: SxProps<Theme> = {
      textTransform: "none",
      fontSize: "0.875rem", // text-sm
      paddingX: "1rem", // px-4
      paddingY: "0.75rem", // py-3
      gap: "0.25rem", // gap-1
      borderRadius: "0.375rem", // rounded
      fontWeight: 400,
      boxShadow: "none",
      transition: "all 500ms",
      "&:hover": {
        boxShadow: "none",
      },
      // Match original color scheme
      ...(muiColor === "info" && {
        backgroundColor: "#cffafe", // cyan-100
        color: "#06b6d4", // cyan-500
        "&:hover": {
          backgroundColor: "#a5f3fc", // cyan-200
        },
      }),
      ...(muiColor === "secondary" && {
        backgroundColor: "#e9d5ff", // purple-100
        color: "#a855f7", // purple-500
        "&:hover": {
          backgroundColor: "#d8b4fe", // purple-200
        },
      }),
      ...(muiColor === "warning" && {
        backgroundColor: "#fef3c7", // amber-100
        color: "#f59e0b", // amber-500
        "&:hover": {
          backgroundColor: "#fde68a", // amber-200
        },
      }),
      ...(muiColor === "success" && {
        backgroundColor: "#d1fae5", // green-100
        color: "#10b981", // green-500
        "&:hover": {
          backgroundColor: "#a7f3d0", // green-200
        },
      }),
      ...(muiColor === "error" && {
        backgroundColor: "#fee2e2", // red-100
        color: "#ef4444", // red-500
        "&:hover": {
          backgroundColor: "#fecaca", // red-200
        },
      }),
      ...(muiColor === "primary" && {
        backgroundColor: "#dbeafe", // blue-100
        color: "#3b82f6", // blue-500
        "&:hover": {
          backgroundColor: "#bfdbfe", // blue-200
        },
      }),
      ...sx,
    };

    return (
      <Button
        ref={ref}
        onClick={handleClickEvent}
        color={muiColor as ButtonProps["color"]}
        variant={variant}
        disabled={isButtonDisabled}
        startIcon={iconStart}
        endIcon={iconEnd}
        size={size}
        sx={customSx}
        {...rest}
      >
        {buttonContent}
      </Button>
    );
  },
);

export default PrimaryButton;

// Re-export MUI Button for direct usage
export { Button } from "@mui/material";
