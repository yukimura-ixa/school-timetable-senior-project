/**
 * MUI-based TextField Component
 * 
 * This is a backward-compatible wrapper around MUI TextField that maintains
 * the original TextField API while leveraging MUI's features.
 * 
 * Migration from: src/components/elements/input/field/TextField.tsx
 * Date: October 19, 2025
 * 
 * @example
 * // Old API (still works)
 * <TextField
 *   label="Room Name"
 *   placeHolder="Enter name"
 *   value={name}
 *   handleChange={handleChange}
 *   disabled={false}
 *   width={300}
 * />
 * 
 * // Can also use MUI API directly
 * <TextField
 *   label="Room Name"
 *   placeholder="Enter name"
 *   value={name}
 *   onChange={handleChange}
 *   sx={{ width: 300 }}
 * />
 */

import React from 'react';
import { TextField as MuiTextField, type TextFieldProps as MuiTextFieldProps } from '@mui/material';

// Legacy API types (backward compatibility)
interface LegacyTextFieldProps {
  width?: string | number;
  height?: string | number;
  placeHolder?: string;
  label?: string;
  handleChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
  borderColor?: string;
}

// Combined type that accepts both old and new APIs
type TextFieldProps = LegacyTextFieldProps & 
  Omit<MuiTextFieldProps, 'placeholder' | 'onChange'>;

/**
 * TextField - MUI-based text field with backward compatibility
 * 
 * Supports both legacy API (handleChange, placeHolder, width, height, borderColor)
 * and native MUI TextField API (onChange, placeholder, sx, variant, etc.)
 */
const TextField = React.forwardRef<HTMLDivElement, TextFieldProps>(
  function TextField(
    {
      // Legacy props
      width = 'auto',
      height = 'auto',
      placeHolder,
      handleChange,
      borderColor,
      
      // MUI props
      placeholder,
      onChange,
      variant = 'outlined',
      size = 'small',
      fullWidth = false,
      disabled = false,
      sx,
      label,
      ...rest
    },
    ref
  ) {
    // Determine which API is being used
    const useLegacyAPI = handleChange !== undefined || placeHolder !== undefined;
    
    // Map legacy props to MUI props
    const placeholderText = placeHolder || placeholder;
    const handleChangeEvent = handleChange || onChange;
    
    // Build custom sx prop
    const customSx = {
      width: width === 'auto' ? undefined : width,
      ...(height !== 'auto' && {
        '& .MuiInputBase-root': {
          height: height,
        },
      }),
      ...(borderColor && {
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            borderColor: borderColor,
          },
        },
      }),
      '& .MuiInputBase-input': {
        fontSize: '0.875rem', // text-sm
      },
      '& .MuiInputLabel-root': {
        fontSize: '0.875rem', // text-sm
        fontWeight: 700, // font-bold
      },
      ...sx,
    };
    
    return (
      <MuiTextField
        ref={ref}
        label={label}
        placeholder={placeholderText}
        onChange={handleChangeEvent}
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        disabled={disabled}
        sx={customSx}
        {...rest}
      />
    );
  }
);

export default TextField;

// Re-export MUI TextField for direct usage
export { TextField as MuiTextField } from '@mui/material';
