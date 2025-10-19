# MUI Component Migration Guide

> **Quick Start Guide for Migrating Custom Components to MUI**  
> **Project**: School Timetable Management System  
> **Date**: October 19, 2025

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [New MUI Components](#new-mui-components)
3. [Migration Steps](#migration-steps)
4. [Usage Examples](#usage-examples)
5. [Breaking Changes](#breaking-changes)
6. [Testing](#testing)
7. [Rollback Plan](#rollback-plan)

---

## Overview

We've created MUI-based versions of custom components in `src/components/mui/` that are **100% backward compatible** with the existing API. This allows for gradual migration without breaking existing code.

### Migration Approach

✅ **Coexistence**: Old and new components can coexist  
✅ **Backward Compatible**: Wrapper components support old API  
✅ **Opt-in**: Migrate page-by-page or component-by-component  
✅ **Zero Breaking Changes**: Existing code continues to work  

---

## New MUI Components

All new components are in `src/components/mui/`:

| Component | Status | File |
|-----------|--------|------|
| `PrimaryButton` | ✅ Ready | `src/components/mui/PrimaryButton.tsx` |
| `TextField` | ✅ Ready | `src/components/mui/TextField.tsx` |
| `SearchBar` | ✅ Ready | `src/components/mui/SearchBar.tsx` |
| `ErrorState` | ✅ Ready | `src/components/mui/ErrorState.tsx` |
| `CheckBox` | ✅ Ready | `src/components/mui/CheckBox.tsx` |

### Features

Each component:
- ✅ Supports **both old and new APIs**
- ✅ Built with **TypeScript** for type safety
- ✅ Uses **forwardRef** for ref support
- ✅ Includes **accessibility features**
- ✅ Matches **original styling** (Tailwind colors)
- ✅ Has **comprehensive JSDoc comments**

---

## Migration Steps

### Step 1: Test New Components (No Code Changes)

Start by importing the new component in a single file:

```tsx
// Option A: Change import path only
// OLD: import PrimaryButton from "@/components/elements/static/PrimaryButton";
import PrimaryButton from "@/components/mui/PrimaryButton";

// Component usage stays the SAME
<PrimaryButton
  handleClick={handleSave}
  title="Save"
  color="success"
  Icon={<CheckIcon />}
  reverseIcon={false}
  isDisabled={false}
/>
```

**No other changes needed!** Test the page thoroughly.

### Step 2: Gradually Adopt MUI API (Optional)

Once comfortable, start using MUI's API for new code:

```tsx
import PrimaryButton from "@/components/mui/PrimaryButton";

// New MUI API (cleaner, more standard)
<PrimaryButton
  onClick={handleSave}
  color="success"
  startIcon={<CheckIcon />}
>
  Save
</PrimaryButton>
```

### Step 3: Update Imports Across Files

Use find-and-replace (or script) to update imports:

```bash
# Find all files using old components
pnpm exec grep -r "from \"@/components/elements/static/PrimaryButton\"" src/

# Replace imports (PowerShell)
Get-ChildItem -Path src -Recurse -Filter *.tsx | ForEach-Object {
  (Get-Content $_.FullName) -replace 
    '@/components/elements/static/PrimaryButton', 
    '@/components/mui/PrimaryButton' | 
  Set-Content $_.FullName
}
```

### Step 4: Test Everything

```bash
# Run all tests
pnpm test

# Run E2E tests
pnpm test:e2e

# Start dev server and manually test
pnpm dev
```

---

## Usage Examples

### PrimaryButton

#### Legacy API (still works)
```tsx
<PrimaryButton
  handleClick={() => console.log('clicked')}
  title="Submit"
  color="success"
  Icon={<CheckIcon />}
  reverseIcon={false}
  isDisabled={false}
/>
```

#### MUI API (recommended for new code)
```tsx
<PrimaryButton
  onClick={() => console.log('clicked')}
  color="success"
  startIcon={<CheckIcon />}
>
  Submit
</PrimaryButton>
```

#### All Color Variants
```tsx
<PrimaryButton color="primary">Primary</PrimaryButton>
<PrimaryButton color="secondary">Secondary</PrimaryButton>
<PrimaryButton color="info">Info</PrimaryButton>
<PrimaryButton color="success">Success</PrimaryButton>
<PrimaryButton color="warning">Warning</PrimaryButton>
<PrimaryButton color="danger">Danger (maps to error)</PrimaryButton>
<PrimaryButton color="error">Error</PrimaryButton>
```

---

### TextField

#### Legacy API
```tsx
<TextField
  label="Room Name"
  placeHolder="Enter room name"
  value={roomName}
  handleChange={(e) => setRoomName(e.target.value)}
  width={300}
  height={40}
  disabled={false}
  borderColor="#e5e7eb"
/>
```

#### MUI API (recommended)
```tsx
<TextField
  label="Room Name"
  placeholder="Enter room name"
  value={roomName}
  onChange={(e) => setRoomName(e.target.value)}
  sx={{ width: 300 }}
  disabled={false}
/>
```

#### With Validation
```tsx
<TextField
  label="Email"
  type="email"
  error={!isValidEmail}
  helperText={!isValidEmail ? "Invalid email" : ""}
  required
/>
```

---

### SearchBar

#### Legacy API
```tsx
<SearchBar
  placeHolder="ค้นหา"
  handleChange={(e) => setSearchTerm(e.target.value)}
  value={searchTerm}
  width={300}
  fill="#EDEEF3"
/>
```

#### MUI API (recommended)
```tsx
<SearchBar
  placeholder="ค้นหา"
  onChange={(e) => setSearchTerm(e.target.value)}
  value={searchTerm}
  sx={{ width: 300 }}
/>
```

**New Features:**
- ✨ Auto-clear button when text is present
- ✨ Better accessibility
- ✨ Consistent with other form fields

---

### ErrorState

#### Legacy API
```tsx
<ErrorState message="An error occurred" />
```

#### MUI API (with more features)
```tsx
<ErrorState 
  message="An error occurred"
  severity="error"
  onClose={() => setShowError(false)}
/>

{/* Success state */}
<ErrorState 
  message="Successfully saved!"
  severity="success"
/>

{/* Warning state */}
<ErrorState 
  message="Please review your input"
  severity="warning"
/>
```

---

### CheckBox

#### Legacy API
```tsx
<CheckBox
  label="Enable notifications"
  value="notifications"
  name="settings"
  handleClick={(e) => setEnabled(e.target.checked)}
  checked={enabled}
  disabled={false}
/>
```

#### MUI API (recommended)
```tsx
<CheckBox
  label="Enable notifications"
  onChange={(e) => setEnabled(e.target.checked)}
  checked={enabled}
/>
```

---

## Breaking Changes

### None! 🎉

All components are **100% backward compatible**. You can:
1. Keep using old API indefinitely
2. Mix old and new APIs in the same codebase
3. Migrate gradually at your own pace

### API Mapping Reference

| Old Prop | New Prop | Notes |
|----------|----------|-------|
| `handleClick` | `onClick` | Both work |
| `title` | `children` | Both work |
| `Icon` + `reverseIcon={false}` | `startIcon` | Both work |
| `Icon` + `reverseIcon={true}` | `endIcon` | Both work |
| `isDisabled` | `disabled` | Both work |
| `handleChange` | `onChange` | Both work |
| `placeHolder` | `placeholder` | Both work |
| `color="danger"` | `color="error"` | Auto-mapped |

---

## Testing

### Unit Tests

Test that both APIs work:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import PrimaryButton from '@/components/mui/PrimaryButton';

describe('PrimaryButton', () => {
  it('works with legacy API', () => {
    const handleClick = jest.fn();
    render(
      <PrimaryButton
        handleClick={handleClick}
        title="Click me"
        color="success"
      />
    );
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalled();
  });
  
  it('works with MUI API', () => {
    const onClick = jest.fn();
    render(
      <PrimaryButton onClick={onClick} color="success">
        Click me
      </PrimaryButton>
    );
    
    fireEvent.click(screen.getByText('Click me'));
    expect(onClick).toHaveBeenCalled();
  });
});
```

### Visual Testing

1. Start dev server: `pnpm dev`
2. Navigate to each page that uses migrated components
3. Verify:
   - ✅ Styling looks the same
   - ✅ Hover states work
   - ✅ Click handlers fire
   - ✅ Disabled state works
   - ✅ Icons appear correctly

### E2E Testing

```bash
pnpm test:e2e
```

Ensure all existing E2E tests pass without modification.

---

## Rollback Plan

If issues arise, rollback is simple:

### Option 1: Change Import Path
```tsx
// Rollback to old component
// import PrimaryButton from "@/components/mui/PrimaryButton";
import PrimaryButton from "@/components/elements/static/PrimaryButton";
```

### Option 2: Use Git
```bash
# Revert specific file
git checkout HEAD -- src/app/management/rooms/component/AddModalForm.tsx

# Revert all changes
git reset --hard HEAD
```

### Option 3: Keep Both
Old components remain in place, so no files are deleted. Both can coexist.

---

## Next Steps

1. ✅ **Phase 1**: Test new components in development environment
2. ⏳ **Phase 2**: Migrate one page at a time (start with less critical pages)
3. ⏳ **Phase 3**: Update all imports once confident
4. ⏳ **Phase 4**: Remove old components (optional, low priority)

---

## FAQ

### Q: Do I need to update all components at once?
**A:** No! Migrate gradually. Old and new components work side-by-side.

### Q: Will this break existing tests?
**A:** No. Component behavior is identical. Tests should pass without changes.

### Q: Can I use both old and new APIs in the same file?
**A:** Yes! Each component instance can use whichever API you prefer.

### Q: What about bundle size?
**A:** MUI is already in use (icons, Snackbar, etc.). Adding these components has minimal impact (~5-10KB with tree-shaking).

### Q: Should I migrate complex components like Dropdown?
**A:** Not yet. Focus on simple components first. Dropdown requires more analysis (see `MUI_MIGRATION_PLAN.md`).

---

## Support

- 📖 **Detailed Plan**: See `docs/MUI_MIGRATION_PLAN.md`
- 🔧 **Component Docs**: Check JSDoc comments in each component file
- 🐛 **Issues**: Create an issue with `[MUI Migration]` prefix
- 💬 **Questions**: Ask in team chat or comments

---

**Happy Migrating! 🚀**
