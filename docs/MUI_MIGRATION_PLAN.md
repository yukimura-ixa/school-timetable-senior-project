# MUI Component Migration Plan

> **Status**: Planning Phase  
> **Date**: October 19, 2025  
> **MUI Version**: v7.3.4  
> **Next.js Version**: 15.5.6

---

## Executive Summary

This document outlines the migration strategy for replacing custom UI components with Material-UI (MUI) v7 components. The goal is to leverage MUI's robust, accessible, and well-tested components while maintaining the existing design language and functionality.

## Current Component Inventory

### 1. **PrimaryButton** (`src/components/elements/static/PrimaryButton.tsx`)
**Status**: ✅ **SHOULD MIGRATE**

**Current Implementation:**
- Custom button with color variants: `info`, `secondary`, `warning`, `success`, `danger`, `primary`
- Uses Tailwind CSS classes for styling
- Icon + text support with `reverseIcon` prop
- Disabled state with hardcoded gray colors

**Migration Target:** `@mui/material/Button`

**Reasons to Migrate:**
- MUI Button provides built-in color variants (`primary`, `secondary`, `success`, `error`, `info`, `warning`)
- Better accessibility (ARIA attributes, keyboard navigation)
- Built-in ripple effect and focus states
- Consistent with Material Design guidelines
- Loading state support
- Size variants (`small`, `medium`, `large`)

**Migration Strategy:**
```tsx
// BEFORE (Custom)
<PrimaryButton
  handleClick={handleSubmit}
  title="Submit"
  color="success"
  Icon={<CheckIcon />}
  reverseIcon={false}
  isDisabled={false}
/>

// AFTER (MUI)
<Button
  onClick={handleSubmit}
  variant="contained"
  color="success"
  startIcon={<CheckIcon />}
  disabled={false}
>
  Submit
</Button>
```

**Breaking Changes:**
- `handleClick` → `onClick`
- `title` → children (text content)
- `Icon` + `reverseIcon={false}` → `startIcon`
- `Icon` + `reverseIcon={true}` → `endIcon`
- `isDisabled` → `disabled`
- `color="danger"` → `color="error"`

**Customization Approach:**
Use MUI's `sx` prop or `styled()` for custom styling:
```tsx
<Button
  sx={{
    backgroundColor: 'cyan.100',
    color: 'cyan.500',
    '&:hover': { backgroundColor: 'cyan.200' }
  }}
>
  Custom Style
</Button>
```

---

### 2. **MiniButton** (`src/components/elements/static/MiniButton.tsx`)
**Status**: ⚠️ **PARTIAL MIGRATION**

**Current Implementation:**
- Small button with custom colors
- Border option
- Selected state with remove icon
- Hover effects
- Used for pagination, filters, tags

**Migration Options:**

#### Option A: MUI `IconButton` (for icon-only actions)
```tsx
<IconButton size="small" color="primary">
  <RemoveCircleIcon />
</IconButton>
```

#### Option B: MUI `Chip` (for tags/selections)
```tsx
<Chip
  label="Selected Item"
  onDelete={() => handleRemove()}
  color="primary"
  size="small"
/>
```

#### Option C: MUI `Button` with `size="small"` (for pagination)
```tsx
<Button size="small" variant="outlined">
  Next
</Button>
```

**Recommendation:**
- **Pagination controls**: Use MUI `Pagination` component
- **Selected items/tags**: Use MUI `Chip`
- **Icon actions**: Use MUI `IconButton`
- **Text buttons**: Use MUI `Button` with `size="small"`

**Why Not Migrate Completely:**
Context-dependent usage requires analyzing each use case individually.

---

### 3. **Button** (`src/components/elements/static/Button.tsx`)
**Status**: ✅ **SHOULD MIGRATE**

**Current Implementation:**
- Sophisticated button with hex color support
- Icon positioning (left/right)
- Hover state management
- Forward ref support
- Custom width/height
- Already has comprehensive TypeScript types

**Migration Target:** `@mui/material/Button`

**Reasons to Migrate:**
- The custom `Button` component already follows React best practices
- MUI Button provides all the same features with better accessibility
- Less maintenance burden
- Better integration with MUI ecosystem (theme, sx prop)

**Migration Strategy:**
```tsx
// BEFORE
<Button
  icon={<CheckIcon />}
  title="Save"
  buttonColor="#2F80ED"
  titleColor="#FFF"
  handleClick={handleSave}
  iconPosition="left"
/>

// AFTER
<Button
  startIcon={<CheckIcon />}
  onClick={handleSave}
  sx={{
    bgcolor: '#2F80ED',
    color: '#FFF',
    '&:hover': { bgcolor: '#1E5BB8' }
  }}
>
  Save
</Button>
```

---

### 4. **TextField** (`src/components/elements/input/field/TextField.tsx`)
**Status**: ✅ **SHOULD MIGRATE**

**Current Implementation:**
- Basic text input with label
- Custom width/height
- Border color customization
- Disabled state

**Migration Target:** `@mui/material/TextField`

**Reasons to Migrate:**
- MUI TextField is a complete form control with:
  - Built-in label
  - Helper text
  - Error states
  - Variants (outlined, filled, standard)
  - Input adornments
  - Auto-sizing
  - Accessibility features (ARIA, labels)

**Migration Strategy:**
```tsx
// BEFORE
<TextField
  label="Room Name"
  placeHolder="Enter room name"
  value={roomName}
  handleChange={handleChange}
  disabled={false}
  width={300}
  height={40}
  borderColor="#e5e7eb"
/>

// AFTER
<TextField
  label="Room Name"
  placeholder="Enter room name"
  value={roomName}
  onChange={handleChange}
  disabled={false}
  fullWidth={false}
  sx={{ width: 300 }}
  variant="outlined"
  size="small"
/>
```

**Benefits:**
- Built-in validation states (error, success)
- Helper text support
- Character counter
- Multiline support
- Better mobile experience

---

### 5. **SearchBar** (`src/components/elements/input/field/SearchBar.tsx`)
**Status**: ✅ **SHOULD MIGRATE**

**Current Implementation:**
- Text input with search icon
- Custom styling
- Uses local SVG icon

**Migration Target:** `@mui/material/TextField` + `InputAdornment`

**Migration Strategy:**
```tsx
import SearchIcon from '@mui/icons-material/Search';
import { TextField, InputAdornment } from '@mui/material';

// BEFORE
<SearchBar
  placeHolder="ค้นหา"
  handleChange={handleSearch}
  value={searchTerm}
  width={300}
  fill="#EDEEF3"
/>

// AFTER
<TextField
  placeholder="ค้นหา"
  onChange={handleSearch}
  value={searchTerm}
  size="small"
  sx={{ 
    width: 300,
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#EDEEF3'
    }
  }}
  InputProps={{
    startAdornment: (
      <InputAdornment position="start">
        <SearchIcon />
      </InputAdornment>
    ),
  }}
/>
```

**Benefits:**
- Uses MUI's SearchIcon (no need for custom SVG)
- Better accessibility
- Consistent styling with other form fields
- Built-in clear button option

---

### 6. **Dropdown** (`src/components/elements/input/selected_input/Dropdown.tsx`)
**Status**: ⚠️ **EVALUATE CAREFULLY**

**Current Implementation:**
- Custom dropdown with search
- Render prop pattern for items
- Custom styling
- Search functionality built-in

**Migration Options:**

#### Option A: `@mui/material/Select` (simple dropdowns)
```tsx
<Select
  value={selectedValue}
  onChange={handleChange}
  displayEmpty
>
  <MenuItem value="">Select option</MenuItem>
  {data.map(item => (
    <MenuItem key={item.id} value={item.id}>
      {item.name}
    </MenuItem>
  ))}
</Select>
```

#### Option B: `@mui/material/Autocomplete` (with search)
```tsx
<Autocomplete
  options={data}
  getOptionLabel={(option) => option.name}
  onChange={(event, newValue) => handleChange(newValue)}
  renderInput={(params) => (
    <TextField {...params} placeholder="Search..." />
  )}
/>
```

**Recommendation:**
- If `useSearchBar={false}`: Use `Select`
- If `useSearchBar={true}`: Use `Autocomplete`

**Why Evaluate Carefully:**
- The custom Dropdown has a unique render prop pattern
- Need to verify all usage contexts before migration
- May need wrapper component for backward compatibility

---

### 7. **CheckBox** (`src/components/elements/input/selected_input/CheckBox.tsx`)
**Status**: ✅ **SHOULD MIGRATE**

**Current Implementation:**
- Simple checkbox with label
- Checked state
- Disabled state

**Migration Target:** `@mui/material/Checkbox` + `FormControlLabel`

**Migration Strategy:**
```tsx
// BEFORE
<CheckBox
  label="Enable feature"
  value="feature1"
  name="features"
  handleClick={handleToggle}
  checked={isChecked}
  disabled={false}
/>

// AFTER
<FormControlLabel
  control={
    <Checkbox
      checked={isChecked}
      onChange={handleToggle}
      name="features"
      value="feature1"
      disabled={false}
    />
  }
  label="Enable feature"
/>
```

**Benefits:**
- Better accessibility (proper label association)
- Indeterminate state support
- Built-in ripple effect
- Consistent with Material Design

---

### 8. **ErrorState** (`src/components/elements/static/ErrorState.tsx`)
**Status**: ✅ **SHOULD MIGRATE**

**Current Implementation:**
- Simple error message display
- Red border and background

**Migration Target:** `@mui/material/Alert`

**Migration Strategy:**
```tsx
// BEFORE
<ErrorState message="An error occurred" />

// AFTER
<Alert severity="error">
  An error occurred
</Alert>
```

**Benefits:**
- Multiple severity levels (error, warning, info, success)
- Close button option
- Icon support
- Better accessibility

---

## Components Already Using MUI

✅ **Snackbar** - Already using `@mui/material/Snackbar` and `Alert`  
✅ **Icons** - Extensively using `@mui/icons-material/*`  
✅ **CircularProgress** - Using for loading states  
✅ **Skeleton** - Using for loading placeholders  
✅ **Link** - Using in some places  
✅ **Select/MenuItem** - Already used in `YearSemester.tsx`

---

## Migration Priority

### Phase 1: High Impact, Low Risk ✅
1. **ErrorState** → `Alert` (simple, isolated)
2. **CheckBox** → `Checkbox` + `FormControlLabel` (straightforward)
3. **TextField** → `TextField` (direct replacement)
4. **SearchBar** → `TextField` + `InputAdornment` (simple enhancement)

### Phase 2: Medium Impact, Medium Risk ⚠️
5. **PrimaryButton** → `Button` (widely used, needs careful testing)
6. **Button** → `Button` (complex props, needs migration guide)

### Phase 3: Complex Migration 🔍
7. **MiniButton** → Context-dependent (Chip/IconButton/Button)
8. **Dropdown** → `Select` or `Autocomplete` (complex logic, render props)

---

## Migration Best Practices

### 1. **Backup Strategy**
```tsx
// Create legacy directory
// src/components/elements/legacy/PrimaryButton.tsx
// Comment original code with migration notes

/*
 * LEGACY COMPONENT - Migrated to MUI Button
 * Migration Date: 2025-10-19
 * Reason: Better accessibility, consistency with MUI ecosystem
 * 
 * Original implementation preserved for reference:
 * [original code here]
 */
```

### 2. **Create MUI Wrapper Components**
For gradual migration, create wrapper components:

```tsx
// src/components/mui/PrimaryButton.tsx
import { Button, ButtonProps } from '@mui/material';

interface PrimaryButtonProps {
  handleClick?: () => void;
  title: string;
  color: 'info' | 'secondary' | 'warning' | 'success' | 'danger' | 'primary';
  Icon?: React.ReactNode;
  reverseIcon?: boolean;
  isDisabled?: boolean;
}

export default function PrimaryButton({
  handleClick,
  title,
  color,
  Icon,
  reverseIcon,
  isDisabled
}: PrimaryButtonProps) {
  const muiColor = color === 'danger' ? 'error' : color;
  
  return (
    <Button
      onClick={handleClick}
      color={muiColor as ButtonProps['color']}
      variant="contained"
      disabled={isDisabled}
      startIcon={!reverseIcon ? Icon : undefined}
      endIcon={reverseIcon ? Icon : undefined}
    >
      {title}
    </Button>
  );
}
```

### 3. **Theme Customization**
Update MUI theme to match current design:

```tsx
// src/theme.ts
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3B82F6', // blue-500
      light: '#DBEAFE', // blue-100
      dark: '#1E3A8A', // blue-900
    },
    success: {
      main: '#10B981', // green-500
      light: '#D1FAE5', // green-100
    },
    warning: {
      main: '#F59E0B', // amber-500
      light: '#FEF3C7', // amber-100
    },
    error: {
      main: '#EF4444', // red-500
      light: '#FEE2E2', // red-100
    },
    info: {
      main: '#06B6D4', // cyan-500
      light: '#CFFAFE', // cyan-100
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Remove uppercase
          borderRadius: 6,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'small',
      },
    },
  },
});

export default theme;
```

### 4. **Testing Strategy**
- Keep original components until migration is complete
- Use feature flags for gradual rollout
- Run visual regression tests
- Test accessibility with screen readers
- Verify keyboard navigation

### 5. **Documentation**
- Update component usage docs
- Create migration guide for team
- Document breaking changes
- Provide before/after examples

---

## Components NOT to Migrate

### ❌ **Do Not Migrate:**

1. **StrictModeDroppable** (`src/components/elements/dnd/StrictModeDroppable.tsx`)
   - **Reason**: Custom wrapper for `react-beautiful-dnd`, not a UI component
   - **Keep**: Required for drag-and-drop functionality

2. **Navbar/Menubar/Content** (Template components)
   - **Reason**: Application-specific layouts
   - **Action**: May use MUI components internally (AppBar, Drawer, etc.) but keep structure

3. **Custom Table Components** (TableRow, various table implementations)
   - **Reason**: Complex business logic, custom rendering
   - **Action**: Consider MUI Table/DataGrid for future refactor, but not priority

---

## Implementation Checklist

### Pre-Migration
- [ ] Review current MUI theme configuration
- [ ] Audit all component usage with `grep_search`
- [ ] Create backup/legacy folder structure
- [ ] Set up visual regression testing

### During Migration
- [ ] Phase 1: Migrate simple components (ErrorState, CheckBox, TextField, SearchBar)
- [ ] Phase 2: Migrate button components (PrimaryButton, Button)
- [ ] Phase 3: Evaluate and migrate complex components (MiniButton, Dropdown)
- [ ] Update imports across codebase
- [ ] Update tests

### Post-Migration
- [ ] Remove unused custom components (or move to legacy)
- [ ] Update documentation
- [ ] Run full test suite
- [ ] Visual QA across all pages
- [ ] Performance check

---

## Estimated Impact

### Files Affected: ~50-80 files
- All management pages (teacher, subject, room, gradelevel, program)
- All schedule pages (config, arrange, lock)
- Dashboard pages
- Modal components

### Benefits
✅ **Accessibility**: WCAG 2.1 compliant out of the box  
✅ **Consistency**: Unified design system  
✅ **Maintenance**: Less custom code to maintain  
✅ **Features**: Built-in loading states, validation, etc.  
✅ **Mobile**: Better responsive behavior  
✅ **i18n**: Better RTL support  

### Risks
⚠️ **Breaking Changes**: API differences require updates  
⚠️ **Visual Differences**: May need theme customization  
⚠️ **Bundle Size**: MUI adds ~300KB (tree-shakeable)  
⚠️ **Testing Burden**: Need to verify all use cases  

---

## Alternative Approach: Coexistence Strategy

Instead of full migration, maintain both:
- Keep custom components for unique cases
- Use MUI for new features
- Gradually replace high-impact components
- Document when to use which

**Pros:**
- Less disruption
- Can cherry-pick migrations
- Lower risk

**Cons:**
- Two design systems
- More maintenance
- Inconsistent UX

---

## Conclusion

**Recommendation**: **Proceed with gradual migration**

1. Start with Phase 1 (simple components)
2. Create wrapper components for backward compatibility
3. Migrate page-by-page or feature-by-feature
4. Keep custom components as fallback until confident

**Timeline Estimate:**
- Phase 1: 2-3 days
- Phase 2: 3-5 days
- Phase 3: 5-7 days
- Testing & QA: 3-5 days
- **Total**: 2-3 weeks for full migration

**Next Steps:**
1. Get team approval
2. Set up MUI theme customization
3. Start with ErrorState migration (simplest)
4. Gather feedback and adjust approach

---

**Questions? See `AGENTS.md` for project context or create an issue.**
