# Form Dialog Design System Specification

> **Version**: 1.0  
> **Status**: Draft  
> **Stack**: MUI v7 + Tailwind CSS v4

---

## 0. Unified Best Practices (MANDATORY)

All form dialogs MUST follow these non-negotiable standards:

### Form Tag Requirement (Next.js)

```tsx
// ✅ CORRECT: Use <form> with Server Action
<form action={createTeacher}>
  <FormDialog open={open} onClose={onClose}>
    <input name="firstname" />
    <button type="submit">Create</button>
  </FormDialog>
</form>

// ❌ WRONG: Button onClick with manual state
<FormDialog>
  <button onClick={() => addData(formState)}>Create</button>
</FormDialog>
```

**Why**: React 19 + Next.js extends `<form>` to invoke Server Actions via `action` prop. This enables progressive enhancement, automatic FormData handling, and proper `useFormStatus` integration.

### Required Standards Checklist

Every form dialog MUST:

- [ ] Wrap content in `<form action={serverAction}>`
- [ ] Use MUI `<Dialog>` primitives (not custom div overlays)
- [ ] Have proper ARIA: `aria-labelledby` + `aria-describedby`
- [ ] Trap focus while open (MUI Dialog does this automatically)
- [ ] Handle Escape key via `onClose(event, "escapeKeyDown")`
- [ ] Handle backdrop click via `onClose(event, "backdropClick")`
- [ ] Protect dirty state (show discard confirmation if unsaved changes)
- [ ] Use consistent button order: Cancel (left) → Primary (right)
- [ ] Show loading state on primary button during submission

---

## A. Anatomy

Every form dialog follows this structure:

```
┌─────────────────────────────────────────────┐
│ Header                                      │
│ ┌─────────────────────────────────────────┐ │
│ │ Title                              [X]  │ │
│ │ Optional description                    │ │
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│ Body (scrollable)                           │
│ ┌─────────────────────────────────────────┐ │
│ │ Form content (1-column default)         │ │
│ │ - Input fields                          │ │
│ │ - Dropdowns                             │ │
│ │ - Validation errors (inline)            │ │
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│ Footer                                      │
│ ┌─────────────────────────────────────────┐ │
│ │ [Cancel]                  [Primary CTA] │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### Header

- **Title**: Required. Uses `<DialogTitle>` with `id` for `aria-labelledby`.
- **Close Button**: Always present. `<IconButton>` with `aria-label="close"`.
- **Description**: Optional. Short helper text under title.

### Body

- Uses `<DialogContent>`.
- **Scroll behavior**: `scroll="paper"` (content scrolls inside dialog, not page).
- **Layout**: 1-column by default. 2-column only for short, related fields.
- **Padding**: Use MUI defaults, customize via `slotProps.paper`.

### Footer

- Uses `<DialogActions>`.
- **Button Order**: Cancel (left/outlined) → Primary (right/contained).
- **No tertiary actions** by default.

---

## B. Standard Sizes

| Size         | Max Width | Use Case                      | Fields |
| ------------ | --------- | ----------------------------- | ------ |
| `sm`         | 400px     | Simple CRUD, confirmations    | ≤6     |
| `md`         | 600px     | Standard forms                | 6-12   |
| `lg`         | 900px     | Complex forms, multi-step     | 12+    |
| `fullScreen` | 100%      | Mobile fallback, very complex | Any    |

### Responsive Behavior

- `fullScreenOnMobile`: When `true` (default), dialog becomes fullscreen on `xs` breakpoint.

---

## C. States

### 1. Loading State

- Disable all inputs and buttons
- Show `<CircularProgress>` on primary button
- Block backdrop/Escape close

```tsx
<Button disabled={loading}>
  {loading ? <CircularProgress size={20} /> : "Save"}
</Button>
```

### 2. Validation Errors

- **Field-level**: Inline error text under each field
- **Summary**: Optional `<Alert severity="error">` at top for form-wide errors
- **Style**: Use MUI TextField's `error` and `helperText` props

### 3. Dirty State Protection

If form has unsaved changes (`dirty=true`):

- **Escape key**: Block close, show `ConfirmDiscardDialog`
- **Backdrop click**: Block close, show `ConfirmDiscardDialog`
- **Close button (X)**: Show `ConfirmDiscardDialog`

```tsx
// In FormDialog onClose handler
const handleClose = (event: unknown, reason?: string) => {
  if (dirty && (reason === "backdropClick" || reason === "escapeKeyDown")) {
    setShowConfirmDiscard(true);
    return;
  }
  onClose();
};
```

---

## D. Copy Rules

### Titles

| Action    | Thai      | English       |
| --------- | --------- | ------------- |
| Create    | เพิ่ม{X}  | Create {X}    |
| Edit      | แก้ไข{X}  | Edit {X}      |
| Delete    | ลบ{X}     | Delete {X}    |
| Duplicate | คัดลอก{X} | Duplicate {X} |

### Primary Button Labels

| Action | Thai          | English      |
| ------ | ------------- | ------------ |
| Create | เพิ่ม / สร้าง | Create       |
| Save   | บันทึก        | Save changes |
| Update | อัปเดต        | Update       |
| Delete | ลบ            | Delete       |

### Cancel Button

- Thai: "ยกเลิก"
- English: "Cancel"

### Destructive Actions

- Require explicit confirmation via separate `ConfirmDialog`
- Use `color="error"` for destructive buttons
- Never combine destructive CTA with form submission

---

## E. Accessibility Requirements

### 1. Dialog Labeling

```tsx
<Dialog
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description" // optional
>
  <DialogTitle id="dialog-title">Title</DialogTitle>
  <DialogContent>
    <Typography id="dialog-description">Optional description</Typography>
    ...
  </DialogContent>
</Dialog>
```

### 2. Focus Management

- **On Open**: Focus moves to first focusable element inside dialog
- **Trap**: Tab/Shift+Tab cycles within dialog only
- **On Close**: Focus returns to the element that triggered the dialog

> MUI Dialog handles focus trap automatically. Do NOT disable `enforceFocus` or `disableRestoreFocus`.

### 3. Keyboard Behavior

| Key       | Behavior                           |
| --------- | ---------------------------------- |
| Escape    | Close (unless dirty or loading)    |
| Tab       | Move to next focusable element     |
| Shift+Tab | Move to previous focusable element |
| Enter     | Submit form (if focused on input)  |

---

## F. MUI v7 Implementation Notes

### onClose Signature

```tsx
onClose: (event: {}, reason: "backdropClick" | "escapeKeyDown") => void
```

### slotProps (replaces deprecated props)

```tsx
<Dialog
  slotProps={{
    paper: { className: "max-h-[80vh]" },
    backdrop: { className: "bg-black/50" },
  }}
>
```

### Deprecated Props (DO NOT USE)

- ❌ `disableBackdropClick` → Use `onClose` reason check
- ❌ `disableEscapeKeyDown` → Use `onClose` reason check
- ❌ `PaperProps` → Use `slotProps.paper`
- ❌ `TransitionProps` → Use `slotProps.transition`

---

## G. Tailwind v4 Integration

### CSS Layer Order

Ensure `globals.css` has:

```css
@layer theme, base, mui, components, utilities;
```

### MUI Theme Configuration

```tsx
// theme.ts
import { createTheme } from "@mui/material";

const theme = createTheme({
  cssVariables: true, // MUI v7
  // enableCssLayer: true, // Future: when MUI supports it
});
```

### Styling with slotProps

```tsx
<Dialog
  slotProps={{
    paper: {
      className: "rounded-xl shadow-2xl", // Tailwind utilities
    },
  }}
>
```

---

## H. Component API

### FormDialog Props

```tsx
interface FormDialogProps {
  // Core
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;

  // Sizing
  size?: "sm" | "md" | "lg";
  fullScreenOnMobile?: boolean; // default: true

  // Form state
  loading?: boolean;
  dirty?: boolean;
  onSubmit?: () => void;

  // Behavior
  disableBackdropCloseWhenDirty?: boolean; // default: true

  // Slots
  slotProps?: {
    paper?: React.ComponentProps<typeof Paper>;
    backdrop?: React.ComponentProps<"div">;
    transition?: { timeout?: number };
  };

  // Content
  children: React.ReactNode;
  actions?: React.ReactNode;
}
```

### ConfirmDiscardDialog Props

```tsx
interface ConfirmDiscardDialogProps {
  open: boolean;
  onDiscard: () => void;
  onCancel: () => void;
}
```

---

## References

- [MUI Dialog API](https://mui.com/material-ui/api/dialog/)
- [MUI v7 Migration](https://mui.com/material-ui/migration/migrating-from-mui-v6/)
- [Tailwind v4 + MUI Integration](https://mui.com/material-ui/integrations/tailwind-css/)
