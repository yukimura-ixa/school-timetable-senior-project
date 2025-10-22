# ADR 002: Zustand for UI State Management

**Status**: Accepted
**Date**: 2025-10-21
**Deciders**: Solo Developer
**Supersedes**: useState scattered across components

---

## Context and Problem Statement

Components currently have excessive local state (34+ useState in TeacherArrangePage). This makes components hard to understand, test, and maintain. We need a state management solution that:
- Handles UI-specific state (modals, selections, filters)
- Doesn't add excessive boilerplate
- Works well with TypeScript
- Has good DevTools support
- Small bundle size

**Question**: Which state management library should we use for UI state?

---

## Decision Drivers

- **Simplicity**: Minimal boilerplate (solo dev project)
- **TypeScript**: First-class TypeScript support
- **Bundle Size**: Small footprint
- **DevTools**: Good debugging experience
- **Learning Curve**: Quick to learn and use
- **Server State**: Should NOT handle server data (use SWR for that)

---

## Considered Options

### Option 1: React Context + useReducer
**Bundle Size**: 0 KB (built-in)

**Pros**:
- No additional dependencies
- Built into React
- Team already knows it

**Cons**:
- Lots of boilerplate
- No DevTools
- Performance issues with many consumers
- Verbose action/reducer setup

### Option 2: Redux Toolkit
**Bundle Size**: ~45 KB

**Pros**:
- Industry standard
- Excellent DevTools
- Time-travel debugging
- Mature ecosystem

**Cons**:
- Large bundle size
- Significant boilerplate
- Overkill for UI state
- Learning curve

### Option 3: Jotai
**Bundle Size**: ~3 KB

**Pros**:
- Atomic state management
- Very small bundle
- Minimal boilerplate
- Good TypeScript support

**Cons**:
- Atom-based model different from others
- Less mature than Zustand
- Smaller community

### Option 4: Zustand (CHOSEN)
**Bundle Size**: ~1 KB

**Pros**:
- Extremely small (~1 KB)
- Minimal boilerplate
- Excellent TypeScript support
- Redux DevTools integration
- Intuitive API
- No context provider needed
- Great for UI state

**Cons**:
- Less known than Redux
- Fewer resources/tutorials
- No built-in async handling (but we use Server Actions)

---

## Decision Outcome

**Chosen option**: Zustand

### Rationale

1. **Size**: At 1 KB, it's the smallest option with full features
2. **Simplicity**: Creating a store is just a function call
3. **TypeScript**: Excellent type inference and support
4. **DevTools**: Works with Redux DevTools for debugging
5. **No Provider**: No context provider needed (less boilerplate)
6. **Perfect for UI State**: Not trying to handle server state (we use SWR)

### Usage Pattern

```typescript
// ✅ Zustand for UI state
const useArrangementUIStore = create((set) => ({
  selectedTeacher: null,
  isModalOpen: false,
  setSelectedTeacher: (id) => set({ selectedTeacher: id }),
  openModal: () => set({ isModalOpen: true }),
}));

// ✅ SWR for server state
const { data: teachers } = useSWR('/api/teachers');

// ✅ Server Actions for mutations
const result = await arrangeScheduleAction(data);
```

### Clear Separation

**Zustand handles**:
- Modal open/close state
- Selected items (teacher, subject, room)
- Drag state
- Filter values
- Sort preferences
- UI-only temporary data

**SWR handles**:
- Teacher list from database
- Schedule data from database
- Any data that needs to sync with server

**Server Actions handle**:
- Creating schedules
- Updating records
- Deleting data
- Any mutation operations

---

## Consequences

### Positive

1. ✅ **Small Bundle**: Only 1 KB added to bundle
2. ✅ **Less useState**: Reduce from 34+ to ~5 per component
3. ✅ **Better Organization**: UI state centralized per feature
4. ✅ **Easier Testing**: Can test store logic independently
5. ✅ **TypeScript Safety**: Full type inference
6. ✅ **DevTools**: Can debug state changes easily

### Negative

1. ⚠️ **New Dependency**: Team needs to learn Zustand API
2. ⚠️ **Discipline Needed**: Must not put server data in Zustand

### Mitigation

- Document clear guidelines on what goes in Zustand vs SWR
- Provide examples for each use case
- Code review to catch misuse
- Naming convention: `use[Feature]UIStore` makes it clear it's UI-only

---

## Implementation

### Store Structure

Each feature gets ONE Zustand store for UI state:

```
features/
  └── schedule-arrangement/
      └── presentation/
          └── stores/
              └── arrangement-ui.store.ts  ← UI state only
```

### Best Practices

1. **Naming**: Use `use[Feature]UIStore` naming pattern
2. **Scope**: One store per feature (not one global store)
3. **DevTools**: Enable in development mode
4. **Selectors**: Use selectors to prevent unnecessary re-renders
5. **Reset**: Provide a `reset()` action for cleanup

### Example Store

```typescript
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface ArrangementUIState {
  selectedTeacher: string | null;
  isModalOpen: boolean;
  setSelectedTeacher: (id: string | null) => void;
  openModal: () => void;
  closeModal: () => void;
  reset: () => void;
}

export const useArrangementUIStore = create<ArrangementUIState>()(
  devtools(
    (set) => ({
      selectedTeacher: null,
      isModalOpen: false,
      
      setSelectedTeacher: (id) =>
        set({ selectedTeacher: id }, false, 'setSelectedTeacher'),
      
      openModal: () =>
        set({ isModalOpen: true }, false, 'openModal'),
      
      closeModal: () =>
        set({ isModalOpen: false }, false, 'closeModal'),
      
      reset: () =>
        set(
          { selectedTeacher: null, isModalOpen: false },
          false,
          'reset'
        ),
    }),
    { name: 'ArrangementUI' }
  )
);
```

---

## Links

- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Zustand TypeScript Guide](https://github.com/pmndrs/zustand#typescript)
- [SWR Documentation](https://swr.vercel.app/)

---

## Related ADRs

- ADR 001: Feature-Based Architecture
- ADR 003: Server Actions Over API Routes
- ADR 004: Valibot for Runtime Validation

---

## Notes

Zustand is specifically for UI state. Never put server data that should sync with the database in Zustand stores. Always use SWR for that.
