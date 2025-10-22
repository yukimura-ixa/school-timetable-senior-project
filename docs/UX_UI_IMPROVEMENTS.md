# 🎨 UX/UI Improvement Recommendations

**Created**: October 22, 2025  
**Status**: Ready for Implementation  
**Target**: Enhanced User Experience & Modern Design

---

## 📊 Current State Assessment

### ✅ **Strengths**
- Clean TypeScript codebase with 85% error reduction
- Modern tech stack (Next.js 15, Tailwind v4, MUI v7)
- Responsive foundation with Tailwind utilities
- Google OAuth authentication
- Export functionality (Excel/PDF)

### ⚠️ **Areas for Improvement**
- **Minimal MUI theme** (only font family configured)
- **Limited visual feedback** for user actions
- **No loading states** for async operations
- **Accessibility issues** (`outline: none` without alternatives)
- **No dark mode** support
- **Limited mobile optimization** for timetable grids
- **No empty states** for data lists
- **Basic error handling UI**

---

## 🎯 **Priority 1: Critical UX Improvements**

### 1. **Enhanced Design System** ✅ COMPLETED

**What**: Expanded MUI theme with comprehensive palette, typography, and component overrides

**Files Modified**:
- ✅ `src/app/theme.ts` - Added palette, typography, shadows, component styles
- ✅ `src/app/globals.css` - Fixed accessibility with focus ring

**Benefits**:
- Consistent visual language across app
- Better readability (improved font sizes & line heights)
- Accessible focus indicators
- Professional polish

---

### 2. **Loading States & Skeletons** 🔄 RECOMMENDED

**Problem**: Users see blank screens during data fetching (bad UX)

**Solution**: Add loading states everywhere

#### Implementation:

```typescript
// Create: src/components/feedback/LoadingStates.tsx
import { Skeleton, Box, Card, Stack } from '@mui/material';

export function TimetableGridSkeleton() {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
      {Array.from({ length: 35 }).map((_, i) => (
        <Card key={i} sx={{ p: 2 }}>
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="rectangular" height={40} sx={{ mt: 1 }} />
        </Card>
      ))}
    </Box>
  );
}

export function SubjectListSkeleton() {
  return (
    <Stack spacing={1}>
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Skeleton variant="rectangular" width={40} height={40} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="text" width="60%" />
            </Box>
          </Box>
        </Card>
      ))}
    </Stack>
  );
}

export function PageLoadingSkeleton() {
  return (
    <Box sx={{ p: 3 }}>
      <Skeleton variant="text" width="30%" height={40} sx={{ mb: 2 }} />
      <Skeleton variant="rectangular" height={300} sx={{ mb: 2 }} />
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Skeleton variant="rectangular" width="30%" height={200} />
        <Skeleton variant="rectangular" width="70%" height={200} />
      </Box>
    </Box>
  );
}
```

**Usage**:
```typescript
// In your page components
import { TimetableGridSkeleton } from '@/components/feedback/LoadingStates';

export default function TimetablePage() {
  const { data, isLoading } = useSWR('/api/timetable');
  
  if (isLoading) return <TimetableGridSkeleton />;
  
  return <TimetableGrid data={data} />;
}
```

---

### 3. **Empty States** 🔄 RECOMMENDED

**Problem**: Blank areas when no data (confusing for users)

**Solution**: Friendly empty state components

#### Implementation:

```typescript
// Create: src/components/feedback/EmptyStates.tsx
import { Box, Typography, Button, Stack } from '@mui/material';
import { 
  CalendarToday, 
  PersonAdd, 
  Class, 
  Assignment 
} from '@mui/icons-material';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  actionLabel, 
  onAction 
}: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 3,
        textAlign: 'center',
      }}
    >
      {icon && (
        <Box
          sx={{
            fontSize: 64,
            color: 'text.disabled',
            mb: 2,
          }}
        >
          {icon}
        </Box>
      )}
      <Typography variant="h6" color="text.primary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
        {description}
      </Typography>
      {actionLabel && onAction && (
        <Button variant="contained" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}

// Preset empty states
export const NoTimetableEmptyState = ({ onCreate }: { onCreate?: () => void }) => (
  <EmptyState
    icon={<CalendarToday />}
    title="ยังไม่มีตารางเรียน"
    description="เริ่มสร้างตารางเรียนใหม่สำหรับภาคเรียนนี้"
    actionLabel="สร้างตารางเรียน"
    onAction={onCreate}
  />
);

export const NoTeachersEmptyState = ({ onAdd }: { onAdd?: () => void }) => (
  <EmptyState
    icon={<PersonAdd />}
    title="ยังไม่มีข้อมูลครู"
    description="เพิ่มข้อมูลครูเพื่อเริ่มจัดตารางสอน"
    actionLabel="เพิ่มครู"
    onAction={onAdd}
  />
);

export const NoSubjectsEmptyState = ({ onAdd }: { onAdd?: () => void }) => (
  <EmptyState
    icon={<Class />}
    title="ยังไม่มีรายวิชา"
    description="เพิ่มรายวิชาที่ต้องการจัดในตารางเรียน"
    actionLabel="เพิ่มรายวิชา"
    onAction={onAdd}
  />
);

export const NoAssignmentsEmptyState = () => (
  <EmptyState
    icon={<Assignment />}
    title="ยังไม่มีการมอบหมายวิชา"
    description="มอบหมายวิชาให้ครูก่อนจัดตารางสอน"
  />
);
```

---

### 4. **Better Error Handling** 🔄 RECOMMENDED

**Problem**: Generic error messages don't help users

**Solution**: Contextual error UI with recovery actions

#### Implementation:

```typescript
// Create: src/components/feedback/ErrorBoundary.tsx
'use client';

import React from 'react';
import { Box, Button, Typography, Alert, AlertTitle, Stack } from '@mui/material';
import { ErrorOutline, Refresh } from '@mui/icons-material';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            p: 3,
          }}
        >
          <Alert
            severity="error"
            icon={<ErrorOutline fontSize="large" />}
            sx={{ maxWidth: 600 }}
          >
            <AlertTitle sx={{ fontSize: '1.25rem', fontWeight: 600 }}>
              เกิดข้อผิดพลาด
            </AlertTitle>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {this.state.error?.message || 'เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง'}
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={this.handleReset}
                size="small"
              >
                โหลดหน้าใหม่
              </Button>
              <Button
                variant="text"
                onClick={() => window.history.back()}
                size="small"
              >
                กลับหน้าก่อนหน้า
              </Button>
            </Stack>
          </Alert>
        </Box>
      );
    }

    return this.props.children;
  }
}

// Functional error display component
export function ErrorDisplay({ 
  error, 
  onRetry 
}: { 
  error: Error | string; 
  onRetry?: () => void;
}) {
  const message = typeof error === 'string' ? error : error.message;
  
  return (
    <Alert severity="error" sx={{ my: 2 }}>
      <AlertTitle>เกิดข้อผิดพลาด</AlertTitle>
      {message}
      {onRetry && (
        <Button
          variant="outlined"
          size="small"
          startIcon={<Refresh />}
          onClick={onRetry}
          sx={{ mt: 1 }}
        >
          ลองอีกครั้ง
        </Button>
      )}
    </Alert>
  );
}
```

---

## 🎯 **Priority 2: Visual Enhancements**

### 5. **Improved Drag & Drop Visual Feedback** 🔄 RECOMMENDED

**Problem**: react-beautiful-dnd is deprecated, visual feedback is basic

**Solution**: Migrate to @dnd-kit with better visual states

#### Already Started:
- ✅ Example components in `src/features/schedule-arrangement/presentation/components/examples/`
  - `DraggableSubjectCard.tsx`
  - `DroppableTimeslot.tsx`

#### Next Steps:

```bash
# 1. Install @dnd-kit (if not already)
pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# 2. Implement enhanced visual feedback
```

**Enhanced Visual States**:
```typescript
// In your timetable components
const dragStyle = {
  // While dragging
  isDragging: {
    opacity: 0.5,
    cursor: 'grabbing',
    transform: 'rotate(2deg)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
  },
  // Valid drop zone
  canDrop: {
    borderColor: 'success.main',
    borderStyle: 'dashed',
    bgcolor: 'success.light',
  },
  // Invalid drop zone
  cannotDrop: {
    borderColor: 'error.main',
    borderStyle: 'dashed',
    bgcolor: 'error.light',
    opacity: 0.6,
  },
};
```

---

### 6. **Animated Transitions** 🔄 RECOMMENDED

**Problem**: Abrupt state changes feel jarring

**Solution**: Add smooth transitions with Framer Motion

#### Implementation:

```bash
pnpm add framer-motion
```

```typescript
// Create: src/components/motion/AnimatedComponents.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Box, type BoxProps } from '@mui/material';

// Fade in animation
export const FadeIn = ({ children, delay = 0, ...props }: BoxProps & { delay?: number }) => (
  <Box
    component={motion.div}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3, delay }}
    {...props}
  >
    {children}
  </Box>
);

// Slide in animation
export const SlideIn = ({ 
  children, 
  direction = 'up',
  ...props 
}: BoxProps & { direction?: 'up' | 'down' | 'left' | 'right' }) => {
  const offsets = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: 20 },
    right: { x: -20 },
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, ...offsets[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, ...offsets[direction] }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      {...props}
    >
      {children}
    </Box>
  );
};

// Scale animation
export const ScaleIn = ({ children, ...props }: BoxProps) => (
  <Box
    component={motion.div}
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ duration: 0.2 }}
    {...props}
  >
    {children}
  </Box>
);

// List item stagger
export const StaggerList = ({ children }: { children: React.ReactNode }) => (
  <Box
    component={motion.div}
    initial="hidden"
    animate="visible"
    variants={{
      visible: {
        transition: {
          staggerChildren: 0.05,
        },
      },
    }}
  >
    {children}
  </Box>
);

export const StaggerItem = ({ children, ...props }: BoxProps) => (
  <Box
    component={motion.div}
    variants={{
      hidden: { opacity: 0, y: 10 },
      visible: { opacity: 1, y: 0 },
    }}
    {...props}
  >
    {children}
  </Box>
);
```

**Usage**:
```typescript
import { FadeIn, SlideIn, StaggerList, StaggerItem } from '@/components/motion/AnimatedComponents';

// Page transition
<FadeIn>
  <TimetableGrid data={data} />
</FadeIn>

// Modal entrance
<SlideIn direction="up">
  <AddSubjectModal />
</SlideIn>

// List with stagger
<StaggerList>
  {subjects.map((subject) => (
    <StaggerItem key={subject.id}>
      <SubjectCard subject={subject} />
    </StaggerItem>
  ))}
</StaggerList>
```

---

### 7. **Toast Notifications System** 🔄 RECOMMENDED

**Problem**: Snackbar position and timing could be better

**Enhancement**: Better notification system with actions

```typescript
// Update: src/components/elements/snackbar/SnackbarProvider.tsx
// Add success, error, warning variants with icons

import { useSnackbar as useNotistackSnackbar, SnackbarProvider as NotistackProvider } from 'notistack';
import { CheckCircle, Error, Warning, Info } from '@mui/icons-material';

// Enhanced hook
export function useToast() {
  const { enqueueSnackbar, closeSnackbar } = useNotistackSnackbar();

  return {
    success: (message: string) =>
      enqueueSnackbar(message, {
        variant: 'success',
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        autoHideDuration: 3000,
      }),
    error: (message: string) =>
      enqueueSnackbar(message, {
        variant: 'error',
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        autoHideDuration: 5000,
      }),
    warning: (message: string) =>
      enqueueSnackbar(message, {
        variant: 'warning',
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        autoHideDuration: 4000,
      }),
    info: (message: string) =>
      enqueueSnackbar(message, {
        variant: 'info',
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        autoHideDuration: 3000,
      }),
  };
}
```

---

## 🎯 **Priority 3: Mobile & Responsive**

### 8. **Mobile-Optimized Timetable View** 🔄 RECOMMENDED

**Problem**: Timetable grids are difficult on mobile

**Solution**: Responsive layouts with mobile-first views

#### Implementation:

```typescript
// Create: src/features/schedule-arrangement/presentation/components/TimetableView.tsx
'use client';

import { useState } from 'react';
import { Box, ToggleButtonGroup, ToggleButton, useMediaQuery, useTheme } from '@mui/material';
import { ViewWeek, ViewDay, CalendarViewMonth } from '@mui/icons-material';

type ViewMode = 'week' | 'day' | 'list';

export function TimetableView({ data }: { data: any }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [view, setView] = useState<ViewMode>(isMobile ? 'day' : 'week');

  return (
    <Box>
      {/* View Mode Selector */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={(_, newView) => newView && setView(newView)}
          size="small"
        >
          <ToggleButton value="week">
            <ViewWeek sx={{ mr: 1 }} />
            {!isMobile && 'สัปดาห์'}
          </ToggleButton>
          <ToggleButton value="day">
            <ViewDay sx={{ mr: 1 }} />
            {!isMobile && 'วัน'}
          </ToggleButton>
          <ToggleButton value="list">
            <CalendarViewMonth sx={{ mr: 1 }} />
            {!isMobile && 'รายการ'}
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Render based on view mode */}
      {view === 'week' && <WeekView data={data} />}
      {view === 'day' && <DayView data={data} />}
      {view === 'list' && <ListView data={data} />}
    </Box>
  );
}

// Day view for mobile - vertical scrolling
function DayView({ data }: { data: any }) {
  const [selectedDay, setSelectedDay] = useState(1);
  
  return (
    <Box>
      {/* Day selector */}
      <Box sx={{ mb: 2, overflowX: 'auto', whiteSpace: 'nowrap' }}>
        {['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์'].map((day, index) => (
          <Button
            key={day}
            variant={selectedDay === index + 1 ? 'contained' : 'outlined'}
            onClick={() => setSelectedDay(index + 1)}
            sx={{ mr: 1, minWidth: 80 }}
          >
            {day}
          </Button>
        ))}
      </Box>

      {/* Time slots for selected day */}
      <Stack spacing={1}>
        {data.filter(slot => slot.dayOfWeek === selectedDay).map((slot) => (
          <Card key={slot.id} sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary">
              {slot.startTime} - {slot.endTime}
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              {slot.subject?.name || 'ว่าง'}
            </Typography>
            {slot.room && (
              <Chip label={slot.room.name} size="small" sx={{ mt: 1 }} />
            )}
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
```

---

### 9. **Responsive Layout Improvements** 🔄 RECOMMENDED

**Update**: `src/app/layout.tsx` for better mobile support

```typescript
<main className="flex justify-center w-full max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8 h-auto">
  <Content>{children}</Content>
  <SpeedInsights />
</main>
```

**Add breakpoint-aware padding**:
- Mobile: `px-4` (16px)
- Tablet: `px-6` (24px)
- Desktop: `px-8` (32px)

---

## 🎯 **Priority 4: Advanced Features**

### 10. **Dark Mode Support** 🔄 RECOMMENDED

**Implementation**:

```typescript
// Update: src/app/theme.ts
import { createTheme, ThemeOptions } from '@mui/material';

function createAppTheme(mode: 'light' | 'dark') {
  const baseTheme: ThemeOptions = {
    palette: {
      mode,
      ...(mode === 'light' ? {
        // Light mode colors (existing)
      } : {
        // Dark mode colors
        primary: {
          main: '#60A5FA', // blue-400
          light: '#1E3A8A', // blue-900
          dark: '#93C5FD', // blue-300
        },
        background: {
          default: '#111827', // gray-900
          paper: '#1F2937', // gray-800
        },
        text: {
          primary: '#F9FAFB', // gray-50
          secondary: '#D1D5DB', // gray-300
        },
      }),
    },
    // ... rest of theme
  };

  return createTheme(baseTheme);
}

export const lightTheme = createAppTheme('light');
export const darkTheme = createAppTheme('dark');
```

**Add theme toggle**:
```typescript
// Create: src/components/elements/ThemeToggle.tsx
'use client';

import { IconButton } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useThemeMode } from '@/hooks/useThemeMode';

export function ThemeToggle() {
  const { mode, toggleTheme } = useThemeMode();

  return (
    <IconButton onClick={toggleTheme} color="inherit">
      {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
    </IconButton>
  );
}
```

---

### 11. **Search & Filtering Improvements** 🔄 RECOMMENDED

**Enhancement**: Add instant search with debouncing

```typescript
// Create: src/hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

**Usage**:
```typescript
const [searchTerm, setSearchTerm] = useState('');
const debouncedSearch = useDebounce(searchTerm, 300);

// Use debouncedSearch for API calls
useEffect(() => {
  if (debouncedSearch) {
    fetchResults(debouncedSearch);
  }
}, [debouncedSearch]);
```

---

### 12. **Keyboard Shortcuts** 🔄 RECOMMENDED

**Enhancement**: Power user features

```typescript
// Create: src/hooks/useKeyboardShortcut.ts
import { useEffect } from 'react';

export function useKeyboardShortcut(
  keys: string[],
  callback: () => void,
  deps: any[] = []
) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isMatch = keys.every((key) => {
        if (key === 'ctrl') return event.ctrlKey || event.metaKey;
        if (key === 'shift') return event.shiftKey;
        if (key === 'alt') return event.altKey;
        return event.key.toLowerCase() === key.toLowerCase();
      });

      if (isMatch) {
        event.preventDefault();
        callback();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, deps);
}
```

**Usage**:
```typescript
// Ctrl+S to save
useKeyboardShortcut(['ctrl', 's'], handleSave, [timetableData]);

// Ctrl+Z to undo
useKeyboardShortcut(['ctrl', 'z'], handleUndo, [history]);

// ESC to close modal
useKeyboardShortcut(['escape'], closeModal, [isModalOpen]);
```

---

## 📊 **Implementation Roadmap**

### Week 1: Critical UX (P1)
- [x] Enhanced MUI theme
- [x] Accessibility fixes
- [ ] Loading skeletons
- [ ] Empty states
- [ ] Error boundaries

### Week 2: Visual Polish (P2)
- [ ] Migrate to @dnd-kit
- [ ] Add animations (Framer Motion)
- [ ] Enhanced toast system
- [ ] Better drag feedback

### Week 3: Mobile & Responsive (P3)
- [ ] Mobile timetable view
- [ ] Responsive layout updates
- [ ] Touch gesture support
- [ ] Progressive Web App setup

### Week 4: Advanced Features (P4)
- [ ] Dark mode
- [ ] Search improvements
- [ ] Keyboard shortcuts
- [ ] Accessibility audit (WCAG 2.1 AA)

---

## 🎨 **Design Inspiration**

Consider these design patterns for your timetable app:

1. **Google Calendar** - Clean grid, drag & drop, color coding
2. **Notion** - Flexible views (table, board, calendar), smooth animations
3. **Linear** - Dark mode, keyboard shortcuts, instant feedback
4. **Todoist** - Quick add, natural language, priority colors
5. **Airtable** - Powerful filtering, multiple views, responsive design

---

## 🧪 **Testing Checklist**

After implementing improvements:

- [ ] Test on Chrome, Firefox, Safari, Edge
- [ ] Test on iOS (iPhone, iPad)
- [ ] Test on Android (phone, tablet)
- [ ] Test with screen readers (NVDA, JAWS, VoiceOver)
- [ ] Test keyboard navigation (Tab, Enter, Esc, Arrow keys)
- [ ] Test with slow network (3G throttling)
- [ ] Test with color blindness simulators
- [ ] Test with 200% zoom

---

## 📚 **Resources**

### Design Systems
- [Material Design 3](https://m3.material.io/)
- [Tailwind UI](https://tailwindui.com/)
- [shadcn/ui](https://ui.shadcn.com/) - Inspiration for component patterns

### Animation Libraries
- [Framer Motion](https://www.framer.com/motion/)
- [React Spring](https://www.react-spring.dev/)
- [Auto Animate](https://auto-animate.formkit.com/)

### Accessibility
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [A11y Project](https://www.a11yproject.com/)
- [WebAIM](https://webaim.org/)

### Performance
- [web.dev Performance](https://web.dev/performance/)
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)

---

## ✅ **Quick Wins (Implement Today)**

1. **Add loading spinners** to all async buttons
2. **Add "Are you sure?" confirmations** for delete actions
3. **Show success messages** after save operations
4. **Add tooltips** to icon buttons
5. **Improve button labels** (be specific: "บันทึกตารางเรียน" not just "บันทึก")
6. **Add breadcrumbs** for navigation
7. **Show unsaved changes warning** before navigating away
8. **Add "Back to top" button** on long pages

---

**Ready to implement? Start with Priority 1 items for immediate impact!** 🚀
