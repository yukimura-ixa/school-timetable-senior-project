/**
 * MUI-based SearchBar Component
 * 
 * This is a backward-compatible wrapper around MUI TextField with InputAdornment
 * that maintains the original SearchBar API while leveraging MUI's features.
 * 
 * Migration from: src/components/elements/input/field/SearchBar.tsx
 * Date: October 19, 2025
 * 
 * @example
 * // Old API (still works)
 * <SearchBar
 *   placeHolder="Search..."
 *   handleChange={handleSearch}
 *   value={searchTerm}
 *   width={300}
 *   fill="#EDEEF3"
 * />
 * 
 * // Can also use MUI API directly
 * <SearchBar
 *   placeholder="Search..."
 *   onChange={handleSearch}
 *   value={searchTerm}
 *   sx={{ width: 300 }}
 * />
 */

import React from 'react';
import { 
  TextField, 
  InputAdornment,
  IconButton,
  type TextFieldProps 
} from '@mui/material';
import Search from '@mui/icons-material/Search';
import Clear from '@mui/icons-material/Clear';

// Legacy API types (backward compatibility)
interface LegacySearchBarProps {
  width?: string | number | null;
  height?: string | number;
  placeHolder?: string;
  fill?: string; // Background color
  handleChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
}

// Combined type that accepts both old and new APIs
type SearchBarProps = LegacySearchBarProps & TextFieldProps;

/**
 * SearchBar - MUI-based search field with backward compatibility
 * 
 * Features:
 * - Search icon on the left
 * - Optional clear button when text is present
 * - Custom background color support
 * - Backward compatible with legacy API
 */
const SearchBar = React.forwardRef<HTMLDivElement, SearchBarProps>(
  function SearchBar(
    {
      // Legacy props
      width = null,
      height,
      placeHolder = 'ค้นหา',
      fill = '#EDEEF3',
      handleChange,
      
      // MUI props
      placeholder,
      onChange,
      value,
      variant = 'outlined',
      size = 'small',
      sx,
      ...rest
    },
    ref
  ) {
    const [internalValue, setInternalValue] = React.useState('');
    
    // Determine which API is being used
    const useLegacyAPI = handleChange !== undefined || placeHolder !== undefined;
    
    // Map legacy props to MUI props
    const placeholderText = placeHolder || placeholder || 'ค้นหา';
    const handleChangeEvent = handleChange || onChange;
    
    // Manage value (controlled or uncontrolled)
    const currentValue = value ?? internalValue;
    const hasValue = currentValue && currentValue.length > 0;
    
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!value) {
        setInternalValue(event.target.value);
      }
      handleChangeEvent?.(event);
    };
    
    const handleClear = () => {
      const event = {
        target: { value: '' },
      } as React.ChangeEvent<HTMLInputElement>;
      
      if (!value) {
        setInternalValue('');
      }
      handleChangeEvent?.(event);
    };
    
    // Build custom sx prop
    const customSx = {
      width: width === null ? 'fit-content' : width,
      '& .MuiOutlinedInput-root': {
        backgroundColor: fill,
        paddingLeft: '0.75rem', // pl-3
        ...(height && { height }),
      },
      '& .MuiInputBase-input': {
        fontSize: '0.875rem', // text-sm
        paddingLeft: '0.5rem', // Space after icon
      },
      ...sx,
    };
    
    return (
      <TextField
        ref={ref}
        placeholder={placeholderText}
        onChange={handleInputChange}
        value={currentValue}
        variant={variant}
        size={size}
        sx={customSx}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search sx={{ color: 'action.active' }} />
            </InputAdornment>
          ),
          endAdornment: hasValue ? (
            <InputAdornment position="end">
              <IconButton
                aria-label="clear search"
                onClick={handleClear}
                edge="end"
                size="small"
              >
                <Clear fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : null,
        }}
        {...rest}
      />
    );
  }
);

export default SearchBar;

// Re-export MUI components for advanced usage
export { TextField, InputAdornment } from '@mui/material';
export { default as SearchIcon } from '@mui/icons-material/Search';
