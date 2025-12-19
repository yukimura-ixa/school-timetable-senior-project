"use client";

/**
 * SubmitButton - Form submit button with loading state from useFormStatus
 *
 * Automatically shows loading spinner when form is submitting.
 * Must be used inside a <form> element.
 *
 * Usage:
 * ```tsx
 * <form action={createAction}>
 *   <input name="name" required />
 *   <SubmitButton>Create</SubmitButton>
 * </form>
 * ```
 */

import React from "react";
import { useFormStatus } from "react-dom";
import { Button, CircularProgress, type ButtonProps } from "@mui/material";

export interface SubmitButtonProps
  extends Omit<ButtonProps, "type" | "disabled"> {
  /** Button label when not loading */
  children: React.ReactNode;
  /** Optional loading text (defaults to children) */
  loadingText?: string;
}

export function SubmitButton({
  children,
  loadingText,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="contained"
      disabled={pending}
      startIcon={
        pending ? <CircularProgress size={16} color="inherit" /> : undefined
      }
      {...props}
    >
      {pending ? (loadingText ?? children) : children}
    </Button>
  );
}

export default SubmitButton;
