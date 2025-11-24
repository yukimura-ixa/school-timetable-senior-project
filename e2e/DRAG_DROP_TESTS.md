# Drag-and-Drop E2E Test Documentation

## Overview

Comprehensive end-to-end tests for the @dnd-kit drag-and-drop functionality in the School Timetable System. These tests verify the timetable arrangement features that allow teachers and administrators to drag subjects from the subject list into timeslots, swap subjects between timeslots, and handle various edge cases and error states.

## Architecture

### Technology Stack

- **@dnd-kit/core**: Main drag-and-drop library (pointer & keyboard sensors)
- **@dnd-kit/sortable**: Sortable list functionality for subject items and timeslot cells
- **@dnd-kit/utilities**: CSS transforms and utilities
- **Playwright**: E2E testing framework with mouse & keyboard simulation
- **Zustand**: State management for drag operations

### Component Structure

```
Teacher Arrange Page
├── DndContext (Provider)
│   ├── SubjectDragBox (Draggable List)
│   │   └── SubjectItem[] (Sortable subjects)
│   └── TimeSlot (Grid)
│       └── TimeslotCell[] (Droppable + Sortable)
```

## Test Categories

### TC-DND-001: Subject List to Timeslot

**Purpose**: Verify dragging subjects from the subject list to empty timeslots

**Tests**:

1. **TC-DND-001-01**: Subject items are draggable
   - Verifies `[data-sortable-id]` attributes exist
   - Checks drag cursor on hover
   - Validates @dnd-kit initialization

2. **TC-DND-001-02**: Subject selection via click
   - Click to select subject (alternative to drag)
   - Visual feedback (green background, pulse animation)
   - State stored in Zustand

3. **TC-DND-001-03**: Drag subject to empty timeslot
   - Mouse down → move → drop sequence
   - Captures screenshots at each phase
   - Verifies timeslot accepts drop

4. **TC-DND-001-04**: Visual feedback during drag
   - Opacity change on dragged item
   - Drop zone highlighting
   - Drag overlay rendering

**Expected Behavior**:

- Subjects show drag cursor on hover
- Click selection highlights subject with green border
- Smooth drag animation with 10-step interpolation
- Drop zones highlight when subject hovers over them
- Subject appears in timeslot after successful drop

---

### TC-DND-002: Between Timeslots

**Purpose**: Verify dragging subjects between existing timeslots (swap/move)

**Tests**:

1. **TC-DND-002-01**: Identify filled timeslots
   - Locates timeslots containing subjects
   - Checks for subject code/name text
   - Verifies sortable attributes

2. **TC-DND-002-02**: Drag subject between timeslots
   - Drags from filled slot A to filled slot B
   - Tests swap behavior
   - Validates both slots update correctly

3. **TC-DND-002-03**: Click to change timeslot mode
   - Activates change mode via button/icon click
   - Selects source slot
   - Selects destination slot
   - Confirms swap operation

**Expected Behavior**:

- Filled timeslots are draggable (unless locked)
- Dragging between slots swaps subjects
- Click-to-change mode provides alternative to drag
- Visual indicators show selected source/destination
- Conflicts prevented during swap

---

### TC-DND-003: Conflict Detection

**Purpose**: Verify error detection and prevention of invalid operations

**Tests**:

1. **TC-DND-003-01**: Detect error indicators
   - Finds error icons (ErrorIcon component)
   - Checks red borders/styling
   - Verifies error messages display

2. **TC-DND-003-02**: Attempt invalid drop (same slot)
   - Drag item and drop on itself
   - Verifies operation is rejected
   - Checks no state change occurs

3. **TC-DND-003-03**: Drop on occupied slot (conflict)
   - Attempts to drop subject on filled slot
   - Verifies conflict detection
   - Checks error feedback shown

**Expected Behavior**:

- Conflicts detected before drop completes
- Error icons appear on conflicted timeslots
- Error messages explain conflict (teacher/room/class)
- Drop operation cancelled on conflict
- Original state preserved

**Conflict Types**:

- Teacher already teaching at this time
- Classroom already occupied
- Class already has a subject scheduled
- Locked timeslot (assembly, exam, etc.)

---

### TC-DND-004: Lock State Behavior

**Purpose**: Verify locked timeslots cannot be modified

**Tests**:

1. **TC-DND-004-01**: Identify locked timeslots
   - Finds HttpsIcon (lock indicator)
   - Checks locked styling
   - Verifies lock tooltips

2. **TC-DND-004-02**: Attempt drop on locked slot
   - Drag subject over locked timeslot
   - Verifies drop is rejected
   - Checks feedback message

3. **TC-DND-004-03**: Locked slots are not draggable
   - Attempts to drag locked timeslot
   - Verifies drag is disabled
   - No drag cursor shown

**Expected Behavior**:

- Lock icon displayed prominently
- Locked slots have disabled state
- Drop attempts rejected immediately
- Error message: "Timeslot is locked"
- Locked slots cannot be dragged

**Lock Use Cases**:

- School assemblies
- Exam periods
- Lunch breaks
- Special events
- Admin-locked schedules

---

### TC-DND-005: Keyboard Accessibility

**Purpose**: Verify full keyboard navigation support for accessibility

**Tests**:

1. **TC-DND-005-01**: Subject items have keyboard focus
   - Tab to focus subjects
   - Visual focus indicator
   - Focus follows tab order

2. **TC-DND-005-02**: Keyboard navigation for drag
   - Space to activate drag mode
   - Arrow keys to navigate
   - Space to drop
   - Full keyboard-only operation

3. **TC-DND-005-03**: Escape cancels drag operation
   - Start drag (mouse or keyboard)
   - Press Escape
   - Verifies drag cancelled
   - Item returns to original position

**Expected Behavior**:

- All draggable items keyboard-focusable
- Space bar activates drag mode
- Arrow keys move drag overlay
- Visual indicator shows current drop target
- Space bar drops at current position
- Escape key cancels and restores original state

**Keyboard Commands**:

- `Tab`: Move focus
- `Space`: Activate/drop
- `Arrow Keys`: Navigate during drag
- `Escape`: Cancel drag
- `Enter`: Confirm action (for modals)

---

### TC-DND-006: Student Arrange Page

**Purpose**: Verify drag-and-drop works on student arrangement page

**Tests**:

1. **TC-DND-006-01**: Student page drag functionality
   - Navigates to student arrange page
   - Verifies draggable elements present
   - Tests basic drag operation

2. **TC-DND-006-02**: Class selection affects drag behavior
   - Selects a class from dropdown
   - Verifies subject list updates
   - Tests drag with selected class context

**Expected Behavior**:

- Similar drag behavior to teacher page
- Class selection filters available subjects
- Drag operations scoped to selected class
- Different conflict rules apply

---

### TC-DND-007: Performance & Edge Cases

**Purpose**: Stress test and edge case validation

**Tests**:

1. **TC-DND-007-01**: Multiple rapid drags
   - Performs 3+ consecutive drags quickly
   - Verifies no state corruption
   - Checks UI remains responsive

2. **TC-DND-007-02**: Drag outside boundaries
   - Drags far outside viewport
   - Verifies graceful handling
   - No crashes or errors

3. **TC-DND-007-03**: Responsive drag on different viewports
   - Tests mobile (375x667)
   - Tests tablet (768x1024)
   - Tests desktop (1920x1080)
   - Verifies touch support on mobile

**Expected Behavior**:

- Smooth performance with rapid operations
- No memory leaks or state corruption
- Graceful handling of edge cases
- Responsive design works on all viewports
- Touch events work on mobile devices

---

## Helper Functions

### Core Drag Operations

```typescript
// Basic drag and drop
await dragAndDrop(page, sourceLocator, targetLocator, config);

// Drag by CSS selector
await dragBySelector(page, ".subject-item:first", ".timeslot-cell:nth(5)");

// Keyboard-based drag
await keyboardDrag(page, sourceLocator, "down", 3);

// Cancel drag with Escape
await cancelDrag(page, sourceLocator);
```

### Element Finders

```typescript
// Find all draggable subjects
const subjects = await findDraggableSubjects(page);

// Find empty timeslots
const empty = await findEmptyTimeslots(page);

// Find filled timeslots
const filled = await findFilledTimeslots(page);

// Find locked timeslots
const locked = await findLockedTimeslots(page);

// Find error timeslots
const errors = await findErrorTimeslots(page);
```

### State Validation

```typescript
// Check if element is being dragged
const isDragging = await isBeingDragged(locator);

// Check if drop zone is active
const isActive = await isDropZoneActive(locator);

// Get drag state snapshot
const snapshot = await getDragStateSnapshot(page);
// Returns: { subjects: {total: 10}, timeslots: {filled: 5, empty: 30, locked: 2, errors: 1} }
```

### Utilities

```typescript
// Wait for DndContext initialization
await waitForDndReady(page);

// Wait for drag animations to complete
await waitForDragAnimation(page);

// Get element center coordinates
const center = await getElementCenter(locator);

// Verify drag completed by position change
const moved = await verifyDragCompleted(locator, beforePosition);
```

---

## Configuration Options

```typescript
interface DragConfig {
  steps?: number; // Mouse movement steps (default: 10)
  dragDelay?: number; // Delay before drag starts (default: 200ms)
  dropDelay?: number; // Delay after drop (default: 300ms)
  captureScreenshots?: boolean; // Take screenshots (default: false)
  screenshotDir?: string; // Screenshot directory
}
```

**Usage Example**:

```typescript
await dragAndDrop(page, source, target, {
  steps: 15, // Smoother animation
  dragDelay: 300, // Wait longer before drag
  dropDelay: 500, // Wait longer after drop
  captureScreenshots: true,
  screenshotDir: "test-results/screenshots/custom",
});
```

---

## Screenshot Capture

Tests automatically capture screenshots at key points:

1. **Before drag**: Initial state
2. **During drag**: Item being dragged
3. **Over target**: Hovering over drop zone
4. **After drop**: Final state

**Screenshot locations**: `test-results/screenshots/drag-drop/`

**Naming convention**:

- `01-subject-items-draggable.png`
- `02-subject-selected.png`
- `03-before-drag.png`
- `04-dragging.png`
- `05-over-target.png`
- `06-after-drop.png`

---

## Error Scenarios

### Common Failures

1. **Drag timeout**: Increase `dragDelay` in config
2. **Element not found**: Check selector or wait for page load
3. **Drop rejected**: Verify target is not locked/occupied
4. **Position not changed**: Check if drag actually moved element
5. **Animation incomplete**: Increase `dropDelay` or use `waitForDragAnimation`

### Debugging Tips

```typescript
// Get comprehensive state
const state = await getDragStateSnapshot(page);
console.log("Drag State:", state);

// Check element visibility
await expect(sourceLocator).toBeVisible();
await expect(targetLocator).toBeVisible();

// Verify bounding boxes
const sourceBox = await sourceLocator.boundingBox();
const targetBox = await targetLocator.boundingBox();
console.log("Source:", sourceBox, "Target:", targetBox);

// Take debug screenshot
await page.screenshot({
  path: "debug-screenshot.png",
  fullPage: true,
});
```

---

## Best Practices

### Test Organization

1. Group related tests in describe blocks
2. Use beforeEach for common setup
3. Clean up state after tests if needed
4. Use meaningful test names with TC codes

### Assertions

1. Always verify element visibility before drag
2. Check state snapshots before/after operations
3. Validate error messages appear when expected
4. Confirm drag visual feedback

### Performance

1. Use `waitForDndReady()` only once per page load
2. Reuse locators instead of re-querying
3. Minimize screenshot captures in loops
4. Use targeted selectors (data attributes)

### Accessibility

1. Test keyboard navigation in addition to mouse
2. Verify focus indicators
3. Check ARIA attributes if present
4. Test with screen reader (manual)

---

## Running Tests

### Full Drag-and-Drop Suite

```bash
pnpm playwright test e2e/08-drag-and-drop.spec.ts
```

### Specific Category

```bash
# Subject list tests only
pnpm playwright test e2e/08-drag-and-drop.spec.ts -g "Subject List to Timeslot"

# Conflict detection only
pnpm playwright test e2e/08-drag-and-drop.spec.ts -g "Conflict Detection"
```

### With UI Mode (Interactive)

```bash
pnpm playwright test e2e/08-drag-and-drop.spec.ts --ui
```

### Debug Mode

```bash
pnpm playwright test e2e/08-drag-and-drop.spec.ts --debug
```

### Headed Mode (See Browser)

```bash
pnpm playwright test e2e/08-drag-and-drop.spec.ts --headed
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
- name: Run Drag-and-Drop Tests
  run: pnpm playwright test e2e/08-drag-and-drop.spec.ts --reporter=html

- name: Upload Screenshots
  if: failure()
  uses: actions/upload-artifact@v3
  with:
    name: drag-drop-screenshots
    path: test-results/screenshots/drag-drop/

- name: Upload HTML Report
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

---

## Future Enhancements

### Planned Improvements

- [ ] Touch/mobile drag testing
- [ ] Multi-select drag (drag multiple subjects at once)
- [ ] Drag preview customization tests
- [ ] Performance benchmarking (FPS during drag)
- [ ] Accessibility audit (automated a11y checks)
- [ ] Cross-browser testing (Safari, Firefox)
- [ ] Undo/redo functionality tests

### Known Limitations

- Touch events may require device emulation
- Some visual feedback timing-dependent
- Mobile keyboard navigation differs from desktop
- Screenshot quality varies by viewport size

---

## References

- **@dnd-kit Documentation**: https://docs.dndkit.com/
- **Playwright API**: https://playwright.dev/docs/api/class-page
- **Project Architecture**: `docs/WEEK5_DND_KIT_MIGRATION.md`
- **State Management**: `src/features/schedule-arrangement/presentation/stores/`

## Support

For issues or questions:

1. Check screenshot captures in `test-results/screenshots/drag-drop/`
2. Review Playwright trace: `pnpm playwright show-trace trace.zip`
3. Check helper function logs in console output
4. Review test plan: `e2e/TEST_PLAN.md`
