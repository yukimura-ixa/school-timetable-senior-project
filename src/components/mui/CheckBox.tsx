/**
 * MUI-based CheckBox Component
 * 
 * This is a backward-compatible wrapper around MUI Checkbox + FormControlLabel
 * that maintains the original CheckBox API.
 * 
 * Migration from: src/components/elements/input/selected_input/CheckBox.tsx
 * Date: October 19, 2025
 * 
 * @example
 * // Old API (still works)
 * <CheckBox
 *   label="Enable feature"
 *   value="feature1"
 *   name="features"
 *   handleClick={handleToggle}
 *   checked={true}
 *   disabled={false}
 * />
 * 
 * // New MUI API
 * <CheckBox
 *   label="Enable feature"
 *   onChange={handleToggle}
 *   checked={true}
 * />
 */

import React from 'react';
import { 
  Checkbox as MuiCheckbox,
  FormControlLabel,
  type CheckboxProps as MuiCheckboxProps,
  type FormControlLabelProps 
} from '@mui/material';

// Legacy API types (backward compatibility)
interface LegacyCheckBoxProps {
  label?: string;
  value?: string | number;
  name?: string;
  handleClick?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  checked?: boolean;
  disabled?: boolean;
}

// Combined type that accepts both old and new APIs
type CheckBoxProps = LegacyCheckBoxProps & 
  Omit<MuiCheckboxProps, 'onChange'> & {
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
    FormControlLabelProps?: Partial<FormControlLabelProps>;
  };

/**
 * CheckBox - MUI-based checkbox with backward compatibility
 * 
 * Features:
 * - Proper label association for accessibility
 * - Indeterminate state support
 * - Built-in ripple effect
 * - Backward compatible with legacy API
 */
const CheckBox = React.forwardRef<HTMLButtonElement, CheckBoxProps>(
  function CheckBox(
    {
      // Legacy props
      label = 'Checkbox',
      value,
      name,
      handleClick,
      
      // MUI props
      checked = false,
      disabled = false,
      onChange,
      color = 'primary',
      size = 'medium',
      FormControlLabelProps,
      ...rest
    },
    ref
  ) {
    // Determine which API is being used
    const useLegacyAPI = handleClick !== undefined;
    
    // Map legacy props to MUI props
    const handleChangeEvent = handleClick || onChange;
    
    return (
      <FormControlLabel
        control={
          <MuiCheckbox
            ref={ref}
            checked={checked}
            onChange={handleChangeEvent}
            name={name}
            value={value}
            disabled={disabled}
            color={color}
            size={size}
            sx={{
              '&.Mui-focusVisible': {
                outline: 'none', // Match original outline-none
              },
            }}
            {...rest}
          />
        }
        label={label}
        sx={{
          '& .MuiFormControlLabel-label': {
            fontSize: '0.875rem', // text-sm
            color: 'text.secondary', // text-gray-500
            userSelect: 'none', // select-none
          },
          ...FormControlLabelProps?.sx,
        }}
        {...FormControlLabelProps}
      />
    );
  }
);

export default CheckBox;

// Re-export MUI components for advanced usage
export { Checkbox, FormControlLabel } from '@mui/material';
