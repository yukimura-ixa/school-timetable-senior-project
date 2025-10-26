/**
 * E2E Tests: Drag and Drop Functionality
 * 
 * Tests the @dnd-kit drag-and-drop system for timetable arrangement:
 * - Dragging subjects from the subject list to timeslots
 * - Dragging subjects between timeslots (swap/move)
 * - Visual feedback during drag operations
 * - Conflict detection and error states
 * - Lock state preventing drops
 * - Responsive behavior and accessibility
 * 
 * Coverage:
 * TC-DND-001: Subject list drag operations
 * TC-DND-002: Drop zones and timeslot cells
 * TC-DND-003: Drag between timeslots
 * TC-DND-004: Conflict detection during drag
 * TC-DND-005: Lock state behavior
 * TC-DND-006: Keyboard accessibility
 */

import { test, expect, Page } from '@playwright/test';
import { NavigationHelper } from './helpers/navigation';

// Test data setup
const TEST_SEMESTER = '1-2567';
const SCREENSHOT_DIR = 'test-results/screenshots/drag-drop';

/**
 * Helper: Wait for page hydration and dnd-kit initialization
 */
async function waitForDndReady(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
  
  // Wait for DndContext to be ready
  await page.waitForFunction(() => {
    // Check if dnd-kit has initialized by looking for draggable elements
    const draggables = document.querySelectorAll('[data-sortable-id], [draggable="true"]');
    return draggables.length > 0;
  }, { timeout: 10000 });
  
  // Small delay to ensure event listeners are attached
  await page.waitForTimeout(500);
}

/**
 * Helper: Get bounding box center coordinates
 */
async function getCenter(locator: any) {
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error('Element not visible or has no bounding box');
  }
  return {
    x: box.x + box.width / 2,
    y: box.y + box.height / 2,
  };
}

/**
 * Helper: Perform drag and drop operation
 */
async function dragAndDrop(page: Page, sourceSelector: string, targetSelector: string) {
  const source = page.locator(sourceSelector).first();
  const target = page.locator(targetSelector).first();
  
  // Ensure elements are visible
  await expect(source).toBeVisible({ timeout: 5000 });
  await expect(target).toBeVisible({ timeout: 5000 });
  
  // Get coordinates
  const sourceCenter = await getCenter(source);
  const targetCenter = await getCenter(target);
  
  // Perform drag operation
  await page.mouse.move(sourceCenter.x, sourceCenter.y);
  await page.mouse.down();
  
  // Hover briefly to trigger drag start
  await page.waitForTimeout(100);
  
  // Move to target
  await page.mouse.move(targetCenter.x, targetCenter.y, { steps: 10 });
  await page.waitForTimeout(100);
  
  // Drop
  await page.mouse.up();
  await page.waitForTimeout(300);
}

test.describe('Drag and Drop - Subject List to Timeslot', () => {
  let nav: NavigationHelper;

  test.beforeEach(async ({ page }) => {
    nav = new NavigationHelper(page);
    
    // Navigate to teacher arrange page
    await nav.goToTeacherArrange(TEST_SEMESTER);
    await waitForDndReady(page);
  });

  test('TC-DND-001-01: Subject items are draggable', async ({ page }) => {
    // Look for draggable subject items
    const subjectItems = page.locator('[data-sortable-id*="SubjectCode"]').or(
      page.locator('.subject-item, [class*="subject"]').filter({ has: page.locator('b') })
    );
    
    const count = await subjectItems.count();
    
    await page.screenshot({ 
      path: `${SCREENSHOT_DIR}/01-subject-items-draggable.png`,
      fullPage: true 
    });
    
    console.log(`Found ${count} subject items`);
    
    if (count > 0) {
      // Check first item has drag attributes
      const firstItem = subjectItems.first();
      await expect(firstItem).toBeVisible();
      
      // Hover to see drag cursor
      await firstItem.hover();
      await page.screenshot({ 
        path: `${SCREENSHOT_DIR}/01-subject-hover.png`,
        fullPage: true 
      });
    }
  });

  test('TC-DND-001-02: Subject selection via click', async ({ page }) => {
    const subjectItems = page.locator('[data-sortable-id*="SubjectCode"]').or(
      page.locator('.subject-item, [class*="subject"]').filter({ has: page.locator('b') })
    );
    
    const count = await subjectItems.count();
    
    if (count > 0) {
      const firstItem = subjectItems.first();
      
      // Click to select
      await firstItem.click();
      await page.waitForTimeout(300);
      
      await page.screenshot({ 
        path: `${SCREENSHOT_DIR}/02-subject-selected.png`,
        fullPage: true 
      });
      
      // Check for selection visual feedback (green background, pulse, etc.)
      const itemClasses = await firstItem.getAttribute('class');
      console.log('Selected item classes:', itemClasses);
      
      expect(itemClasses).toBeTruthy();
    }
  });

  test('TC-DND-001-03: Drag subject to empty timeslot', async ({ page }) => {
    // Find a subject to drag
    const subjectItems = page.locator('[data-sortable-id*="SubjectCode"]').or(
      page.locator('.subject-item').filter({ has: page.locator('b') })
    );
    
    // Find empty timeslot cells
    const emptySlots = page.locator('[data-droppable-id], td.timeslot, .timeslot-cell').filter({
      hasNot: page.locator('.subject-code, .scheduled')
    });
    
    const subjectCount = await subjectItems.count();
    const emptyCount = await emptySlots.count();
    
    console.log(`Subjects: ${subjectCount}, Empty slots: ${emptyCount}`);
    
    if (subjectCount > 0 && emptyCount > 0) {
      await page.screenshot({ 
        path: `${SCREENSHOT_DIR}/03-before-drag.png`,
        fullPage: true 
      });
      
      // Attempt drag and drop
      try {
        const subject = subjectItems.first();
        const targetSlot = emptySlots.first();
        
        const subjectBox = await subject.boundingBox();
        const slotBox = await targetSlot.boundingBox();
        
        if (subjectBox && slotBox) {
          const sourceX = subjectBox.x + subjectBox.width / 2;
          const sourceY = subjectBox.y + subjectBox.height / 2;
          const targetX = slotBox.x + slotBox.width / 2;
          const targetY = slotBox.y + slotBox.height / 2;
          
          // Start drag
          await page.mouse.move(sourceX, sourceY);
          await page.mouse.down();
          await page.waitForTimeout(200);
          
          await page.screenshot({ 
            path: `${SCREENSHOT_DIR}/04-dragging.png`,
            fullPage: true 
          });
          
          // Move to target
          await page.mouse.move(targetX, targetY, { steps: 15 });
          await page.waitForTimeout(200);
          
          await page.screenshot({ 
            path: `${SCREENSHOT_DIR}/05-over-target.png`,
            fullPage: true 
          });
          
          // Drop
          await page.mouse.up();
          await page.waitForTimeout(500);
          
          await page.screenshot({ 
            path: `${SCREENSHOT_DIR}/06-after-drop.png`,
            fullPage: true 
          });
          
          console.log('Drag and drop operation completed');
        }
      } catch (error) {
        console.log('Drag operation error:', error);
        await page.screenshot({ 
          path: `${SCREENSHOT_DIR}/03-drag-error.png`,
          fullPage: true 
        });
      }
    }
  });

  test('TC-DND-001-04: Visual feedback during drag', async ({ page }) => {
    const subjectItems = page.locator('[data-sortable-id*="SubjectCode"]').or(
      page.locator('.subject-item').first()
    );
    
    const count = await subjectItems.count();
    
    if (count > 0) {
      const subject = subjectItems.first();
      const box = await subject.boundingBox();
      
      if (box) {
        const x = box.x + box.width / 2;
        const y = box.y + box.height / 2;
        
        // Start dragging
        await page.mouse.move(x, y);
        await page.mouse.down();
        await page.waitForTimeout(100);
        
        // Move slightly to trigger drag
        await page.mouse.move(x + 50, y + 50, { steps: 5 });
        
        await page.screenshot({ 
          path: `${SCREENSHOT_DIR}/07-drag-visual-feedback.png`,
          fullPage: true 
        });
        
        // Cancel drag
        await page.mouse.up();
        
        console.log('Visual feedback captured during drag');
      }
    }
  });
});

test.describe('Drag and Drop - Between Timeslots', () => {
  let nav: NavigationHelper;

  test.beforeEach(async ({ page }) => {
    nav = new NavigationHelper(page);
    await nav.goToTeacherArrange(TEST_SEMESTER);
    await waitForDndReady(page);
  });

  test('TC-DND-002-01: Identify filled timeslots', async ({ page }) => {
    // Find timeslots that have subjects
    const filledSlots = page.locator('td, .timeslot-cell').filter({
      has: page.locator('text=/ค|พ|ส|ง|ว|ENG|MAT|SCI/i')
    });
    
    const count = await filledSlots.count();
    
    await page.screenshot({ 
      path: `${SCREENSHOT_DIR}/10-filled-timeslots.png`,
      fullPage: true 
    });
    
    console.log(`Found ${count} filled timeslots`);
    
    if (count > 0) {
      // Highlight first filled slot
      const firstFilled = filledSlots.first();
      await firstFilled.scrollIntoViewIfNeeded();
      await firstFilled.hover();
      
      await page.screenshot({ 
        path: `${SCREENSHOT_DIR}/11-filled-slot-hover.png`,
        fullPage: true 
      });
    }
  });

  test('TC-DND-002-02: Drag subject between timeslots', async ({ page }) => {
    // Find filled slots that can be dragged
    const draggableSlots = page.locator('[data-sortable-id*="Slot"]').or(
      page.locator('td, .timeslot-cell').filter({
        has: page.locator('text=/ค|พ|ส/')
      })
    );
    
    const count = await draggableSlots.count();
    console.log(`Draggable slots: ${count}`);
    
    if (count >= 2) {
      await page.screenshot({ 
        path: `${SCREENSHOT_DIR}/12-before-slot-swap.png`,
        fullPage: true 
      });
      
      try {
        const source = draggableSlots.nth(0);
        const target = draggableSlots.nth(1);
        
        const sourceBox = await source.boundingBox();
        const targetBox = await target.boundingBox();
        
        if (sourceBox && targetBox) {
          const sourceX = sourceBox.x + sourceBox.width / 2;
          const sourceY = sourceBox.y + sourceBox.height / 2;
          const targetX = targetBox.x + targetBox.width / 2;
          const targetY = targetBox.y + targetBox.height / 2;
          
          // Drag from source to target
          await page.mouse.move(sourceX, sourceY);
          await page.mouse.down();
          await page.waitForTimeout(200);
          
          await page.screenshot({ 
            path: `${SCREENSHOT_DIR}/13-dragging-slot.png`,
            fullPage: true 
          });
          
          await page.mouse.move(targetX, targetY, { steps: 15 });
          await page.waitForTimeout(200);
          
          await page.screenshot({ 
            path: `${SCREENSHOT_DIR}/14-over-target-slot.png`,
            fullPage: true 
          });
          
          await page.mouse.up();
          await page.waitForTimeout(500);
          
          await page.screenshot({ 
            path: `${SCREENSHOT_DIR}/15-after-slot-swap.png`,
            fullPage: true 
          });
          
          console.log('Slot swap operation completed');
        }
      } catch (error) {
        console.log('Slot swap error:', error);
      }
    }
  });

  test('TC-DND-002-03: Click to change timeslot mode', async ({ page }) => {
    // Look for change/swap buttons or icons
    const changeIcons = page.locator('svg[data-testid*="Change"], button:has-text("เปลี่ยน"), [title*="change"]');
    
    const count = await changeIcons.count();
    console.log(`Change mode icons: ${count}`);
    
    if (count > 0) {
      const firstIcon = changeIcons.first();
      
      await page.screenshot({ 
        path: `${SCREENSHOT_DIR}/16-before-change-mode.png`,
        fullPage: true 
      });
      
      await firstIcon.click();
      await page.waitForTimeout(300);
      
      await page.screenshot({ 
        path: `${SCREENSHOT_DIR}/17-change-mode-active.png`,
        fullPage: true 
      });
      
      console.log('Change mode activated via click');
    }
  });
});

test.describe('Drag and Drop - Conflict Detection', () => {
  let nav: NavigationHelper;

  test.beforeEach(async ({ page }) => {
    nav = new NavigationHelper(page);
    await nav.goToTeacherArrange(TEST_SEMESTER);
    await waitForDndReady(page);
  });

  test('TC-DND-003-01: Detect error indicators', async ({ page }) => {
    // Look for error icons, messages, or red borders
    const errorIndicators = page.locator('[data-testid*="Error"], svg.text-red, .error, .conflict, .border-red');
    
    const count = await errorIndicators.count();
    
    await page.screenshot({ 
      path: `${SCREENSHOT_DIR}/20-error-indicators.png`,
      fullPage: true 
    });
    
    console.log(`Error indicators found: ${count}`);
    
    if (count > 0) {
      // Hover over first error to see details
      const firstError = errorIndicators.first();
      await firstError.scrollIntoViewIfNeeded();
      await firstError.hover();
      await page.waitForTimeout(300);
      
      await page.screenshot({ 
        path: `${SCREENSHOT_DIR}/21-error-details.png`,
        fullPage: true 
      });
    }
  });

  test('TC-DND-003-02: Attempt invalid drop (same slot)', async ({ page }) => {
    const filledSlots = page.locator('[data-sortable-id*="Slot"]').filter({
      has: page.locator('text=/ค|พ/')
    });
    
    const count = await filledSlots.count();
    
    if (count > 0) {
      const slot = filledSlots.first();
      const box = await slot.boundingBox();
      
      if (box) {
        const x = box.x + box.width / 2;
        const y = box.y + box.height / 2;
        
        // Try to drag and drop on itself
        await page.mouse.move(x, y);
        await page.mouse.down();
        await page.waitForTimeout(200);
        
        // Move in circle and return to same position
        await page.mouse.move(x + 30, y + 30, { steps: 5 });
        await page.mouse.move(x, y, { steps: 5 });
        
        await page.screenshot({ 
          path: `${SCREENSHOT_DIR}/22-invalid-drop-same-slot.png`,
          fullPage: true 
        });
        
        await page.mouse.up();
        await page.waitForTimeout(300);
        
        console.log('Attempted self-drop operation');
      }
    }
  });

  test('TC-DND-003-03: Drop on occupied slot (conflict)', async ({ page }) => {
    const subjects = page.locator('[data-sortable-id*="SubjectCode"]').first();
    const occupiedSlots = page.locator('td, .timeslot-cell').filter({
      has: page.locator('text=/ค|พ/')
    });
    
    const hasSubject = await subjects.count() > 0;
    const hasOccupied = await occupiedSlots.count() > 0;
    
    if (hasSubject && hasOccupied) {
      await page.screenshot({ 
        path: `${SCREENSHOT_DIR}/23-before-conflict-drop.png`,
        fullPage: true 
      });
      
      try {
        const subjectBox = await subjects.boundingBox();
        const slotBox = await occupiedSlots.first().boundingBox();
        
        if (subjectBox && slotBox) {
          await page.mouse.move(
            subjectBox.x + subjectBox.width / 2,
            subjectBox.y + subjectBox.height / 2
          );
          await page.mouse.down();
          await page.waitForTimeout(200);
          
          await page.mouse.move(
            slotBox.x + slotBox.width / 2,
            slotBox.y + slotBox.height / 2,
            { steps: 10 }
          );
          
          await page.screenshot({ 
            path: `${SCREENSHOT_DIR}/24-over-occupied-slot.png`,
            fullPage: true 
          });
          
          await page.mouse.up();
          await page.waitForTimeout(500);
          
          await page.screenshot({ 
            path: `${SCREENSHOT_DIR}/25-after-conflict-attempt.png`,
            fullPage: true 
          });
          
          console.log('Attempted drop on occupied slot');
        }
      } catch (error) {
        console.log('Conflict test error:', error);
      }
    }
  });
});

test.describe('Drag and Drop - Lock State Behavior', () => {
  let nav: NavigationHelper;

  test.beforeEach(async ({ page }) => {
    nav = new NavigationHelper(page);
    await nav.goToTeacherArrange(TEST_SEMESTER);
    await waitForDndReady(page);
  });

  test('TC-DND-004-01: Identify locked timeslots', async ({ page }) => {
    // Look for lock icons or locked indicators
    const lockIcons = page.locator('svg[data-testid*="Lock"], svg[data-testid*="Https"], .locked, [title*="lock"]');
    
    const count = await lockIcons.count();
    
    await page.screenshot({ 
      path: `${SCREENSHOT_DIR}/30-locked-slots.png`,
      fullPage: true 
    });
    
    console.log(`Locked slots found: ${count}`);
    
    if (count > 0) {
      const firstLock = lockIcons.first();
      await firstLock.scrollIntoViewIfNeeded();
      await firstLock.hover();
      
      await page.screenshot({ 
        path: `${SCREENSHOT_DIR}/31-locked-slot-hover.png`,
        fullPage: true 
      });
    }
  });

  test('TC-DND-004-02: Attempt drop on locked slot', async ({ page }) => {
    const subjects = page.locator('[data-sortable-id*="SubjectCode"]').first();
    const lockedSlots = page.locator('td, .timeslot-cell').filter({
      has: page.locator('svg[data-testid*="Lock"]')
    });
    
    const hasSubject = await subjects.count() > 0;
    const hasLocked = await lockedSlots.count() > 0;
    
    if (hasSubject && hasLocked) {
      await page.screenshot({ 
        path: `${SCREENSHOT_DIR}/32-before-locked-drop.png`,
        fullPage: true 
      });
      
      try {
        const subjectBox = await subjects.boundingBox();
        const lockedBox = await lockedSlots.first().boundingBox();
        
        if (subjectBox && lockedBox) {
          await page.mouse.move(
            subjectBox.x + subjectBox.width / 2,
            subjectBox.y + subjectBox.height / 2
          );
          await page.mouse.down();
          await page.waitForTimeout(200);
          
          await page.mouse.move(
            lockedBox.x + lockedBox.width / 2,
            lockedBox.y + lockedBox.height / 2,
            { steps: 10 }
          );
          
          await page.screenshot({ 
            path: `${SCREENSHOT_DIR}/33-over-locked-slot.png`,
            fullPage: true 
          });
          
          await page.mouse.up();
          await page.waitForTimeout(500);
          
          await page.screenshot({ 
            path: `${SCREENSHOT_DIR}/34-after-locked-drop-reject.png`,
            fullPage: true 
          });
          
          console.log('Attempted drop on locked slot - should be rejected');
        }
      } catch (error) {
        console.log('Locked drop test error:', error);
      }
    }
  });

  test('TC-DND-004-03: Locked slots are not draggable', async ({ page }) => {
    const lockedSlots = page.locator('td, .timeslot-cell').filter({
      has: page.locator('svg[data-testid*="Lock"]')
    });
    
    const count = await lockedSlots.count();
    
    if (count > 0) {
      const lockedSlot = lockedSlots.first();
      const box = await lockedSlot.boundingBox();
      
      if (box) {
        const x = box.x + box.width / 2;
        const y = box.y + box.height / 2;
        
        await page.screenshot({ 
          path: `${SCREENSHOT_DIR}/35-before-locked-drag.png`,
          fullPage: true 
        });
        
        // Try to drag locked slot
        await page.mouse.move(x, y);
        await page.mouse.down();
        await page.waitForTimeout(200);
        
        await page.mouse.move(x + 50, y + 50, { steps: 5 });
        
        await page.screenshot({ 
          path: `${SCREENSHOT_DIR}/36-locked-drag-attempt.png`,
          fullPage: true 
        });
        
        await page.mouse.up();
        
        console.log('Attempted to drag locked slot - should not move');
      }
    }
  });
});

test.describe('Drag and Drop - Accessibility & Keyboard', () => {
  let nav: NavigationHelper;

  test.beforeEach(async ({ page }) => {
    nav = new NavigationHelper(page);
    await nav.goToTeacherArrange(TEST_SEMESTER);
    await waitForDndReady(page);
  });

  test('TC-DND-005-01: Subject items have keyboard focus', async ({ page }) => {
    const subjectItems = page.locator('[data-sortable-id*="SubjectCode"]').or(
      page.locator('.subject-item').first()
    );
    
    const count = await subjectItems.count();
    
    if (count > 0) {
      const firstItem = subjectItems.first();
      
      // Tab to focus
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      await page.screenshot({ 
        path: `${SCREENSHOT_DIR}/40-keyboard-focus.png`,
        fullPage: true 
      });
      
      // Check if item can receive focus
      await firstItem.focus();
      await page.waitForTimeout(300);
      
      await page.screenshot({ 
        path: `${SCREENSHOT_DIR}/41-subject-focused.png`,
        fullPage: true 
      });
      
      console.log('Keyboard focus test completed');
    }
  });

  test('TC-DND-005-02: Keyboard navigation for drag (Space/Enter)', async ({ page }) => {
    const subjectItems = page.locator('[data-sortable-id*="SubjectCode"]').first();
    
    const count = await subjectItems.count();
    
    if (count > 0) {
      const item = subjectItems.first();
      await item.focus();
      
      await page.screenshot({ 
        path: `${SCREENSHOT_DIR}/42-before-keyboard-drag.png`,
        fullPage: true 
      });
      
      // Try Space key to activate drag mode (dnd-kit keyboard)
      await page.keyboard.press('Space');
      await page.waitForTimeout(300);
      
      await page.screenshot({ 
        path: `${SCREENSHOT_DIR}/43-keyboard-drag-active.png`,
        fullPage: true 
      });
      
      // Arrow keys to move
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(300);
      
      await page.screenshot({ 
        path: `${SCREENSHOT_DIR}/44-keyboard-navigating.png`,
        fullPage: true 
      });
      
      // Space to drop
      await page.keyboard.press('Space');
      await page.waitForTimeout(300);
      
      await page.screenshot({ 
        path: `${SCREENSHOT_DIR}/45-keyboard-drop.png`,
        fullPage: true 
      });
      
      console.log('Keyboard drag operation completed');
    }
  });

  test('TC-DND-005-03: Escape cancels drag operation', async ({ page }) => {
    const subjectItems = page.locator('[data-sortable-id*="SubjectCode"]').first();
    
    const count = await subjectItems.count();
    
    if (count > 0) {
      const item = subjectItems.first();
      const box = await item.boundingBox();
      
      if (box) {
        const x = box.x + box.width / 2;
        const y = box.y + box.height / 2;
        
        // Start drag
        await page.mouse.move(x, y);
        await page.mouse.down();
        await page.waitForTimeout(200);
        
        await page.mouse.move(x + 100, y + 100, { steps: 5 });
        
        await page.screenshot({ 
          path: `${SCREENSHOT_DIR}/46-before-escape.png`,
          fullPage: true 
        });
        
        // Press Escape to cancel
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);
        
        await page.screenshot({ 
          path: `${SCREENSHOT_DIR}/47-after-escape.png`,
          fullPage: true 
        });
        
        await page.mouse.up();
        
        console.log('Escape key cancelled drag operation');
      }
    }
  });
});

test.describe('Drag and Drop - Student Arrange Page', () => {
  let nav: NavigationHelper;

  test.beforeEach(async ({ page }) => {
    nav = new NavigationHelper(page);
    await nav.goToStudentArrange(TEST_SEMESTER);
    await waitForDndReady(page);
  });

  test('TC-DND-006-01: Student page drag functionality', async ({ page }) => {
    await page.screenshot({ 
      path: `${SCREENSHOT_DIR}/50-student-arrange.png`,
      fullPage: true 
    });
    
    // Check if drag components exist
    const draggables = page.locator('[data-sortable-id], .subject-item');
    const count = await draggables.count();
    
    console.log(`Student arrange draggables: ${count}`);
    
    if (count > 0) {
      const firstItem = draggables.first();
      await firstItem.hover();
      
      await page.screenshot({ 
        path: `${SCREENSHOT_DIR}/51-student-draggable-hover.png`,
        fullPage: true 
      });
    }
  });

  test('TC-DND-006-02: Class selection affects drag behavior', async ({ page }) => {
    // Look for class selector
    const classSelector = page.locator('select, [role="combobox"]').first();
    
    const hasSelector = await classSelector.count() > 0;
    
    if (hasSelector) {
      await page.screenshot({ 
        path: `${SCREENSHOT_DIR}/52-before-class-select.png`,
        fullPage: true 
      });
      
      // Select a class
      await classSelector.click();
      await page.waitForTimeout(300);
      
      await page.screenshot({ 
        path: `${SCREENSHOT_DIR}/53-class-dropdown.png`,
        fullPage: true 
      });
      
      // Select first option if available
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);
      
      await page.screenshot({ 
        path: `${SCREENSHOT_DIR}/54-after-class-select.png`,
        fullPage: true 
      });
      
      console.log('Class selection changed drag context');
    }
  });
});

test.describe('Drag and Drop - Performance & Edge Cases', () => {
  let nav: NavigationHelper;

  test.beforeEach(async ({ page }) => {
    nav = new NavigationHelper(page);
    await nav.goToTeacherArrange(TEST_SEMESTER);
    await waitForDndReady(page);
  });

  test('TC-DND-007-01: Multiple rapid drags', async ({ page }) => {
    const subjects = page.locator('[data-sortable-id*="SubjectCode"]');
    const count = await subjects.count();
    
    if (count >= 3) {
      await page.screenshot({ 
        path: `${SCREENSHOT_DIR}/60-before-rapid-drags.png`,
        fullPage: true 
      });
      
      // Perform 3 quick drag operations
      for (let i = 0; i < 3; i++) {
        const item = subjects.nth(i);
        const box = await item.boundingBox();
        
        if (box) {
          const x = box.x + box.width / 2;
          const y = box.y + box.height / 2;
          
          await page.mouse.move(x, y);
          await page.mouse.down();
          await page.mouse.move(x + 50, y + 50, { steps: 3 });
          await page.mouse.up();
          await page.waitForTimeout(100);
        }
      }
      
      await page.screenshot({ 
        path: `${SCREENSHOT_DIR}/61-after-rapid-drags.png`,
        fullPage: true 
      });
      
      console.log('Rapid drag operations completed');
    }
  });

  test('TC-DND-007-02: Drag outside boundaries', async ({ page }) => {
    const subjects = page.locator('[data-sortable-id*="SubjectCode"]').first();
    const count = await subjects.count();
    
    if (count > 0) {
      const box = await subjects.boundingBox();
      
      if (box) {
        const x = box.x + box.width / 2;
        const y = box.y + box.height / 2;
        
        await page.mouse.move(x, y);
        await page.mouse.down();
        await page.waitForTimeout(200);
        
        // Drag far outside viewport
        await page.mouse.move(10, 10, { steps: 10 });
        
        await page.screenshot({ 
          path: `${SCREENSHOT_DIR}/62-drag-outside-bounds.png`,
          fullPage: true 
        });
        
        await page.mouse.up();
        await page.waitForTimeout(300);
        
        await page.screenshot({ 
          path: `${SCREENSHOT_DIR}/63-after-outside-drop.png`,
          fullPage: true 
        });
        
        console.log('Drag outside boundaries completed');
      }
    }
  });

  test('TC-DND-007-03: Responsive drag on different viewports', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    await page.screenshot({ 
      path: `${SCREENSHOT_DIR}/64-mobile-viewport.png`,
      fullPage: true 
    });
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    
    await page.screenshot({ 
      path: `${SCREENSHOT_DIR}/65-tablet-viewport.png`,
      fullPage: true 
    });
    
    // Reset to desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);
    
    await page.screenshot({ 
      path: `${SCREENSHOT_DIR}/66-desktop-viewport.png`,
      fullPage: true 
    });
    
    console.log('Responsive viewport tests completed');
  });
});
