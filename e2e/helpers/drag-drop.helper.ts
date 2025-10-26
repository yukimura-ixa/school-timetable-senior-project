/**
 * E2E Drag and Drop Helper Module
 * 
 * Reusable utilities for testing @dnd-kit drag-and-drop functionality
 * Provides robust helpers for mouse-based and keyboard-based drag operations
 */

import { Page, Locator } from '@playwright/test';

/**
 * Configuration for drag operations
 */
export interface DragConfig {
  /** Number of steps for smooth mouse movement (default: 10) */
  steps?: number;
  /** Delay before starting drag in ms (default: 200) */
  dragDelay?: number;
  /** Delay after drop in ms (default: 300) */
  dropDelay?: number;
  /** Take screenshot during drag (default: false) */
  captureScreenshots?: boolean;
  /** Screenshot directory for captured images */
  screenshotDir?: string;
}

/**
 * Result of a drag operation
 */
export interface DragResult {
  success: boolean;
  error?: string;
  screenshots?: string[];
}

/**
 * Get center coordinates of an element
 */
export async function getElementCenter(locator: Locator): Promise<{ x: number; y: number }> {
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
 * Wait for DndContext and draggable elements to be ready
 */
export async function waitForDndReady(page: Page, timeout = 10000): Promise<void> {
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
  
  // Wait for dnd-kit elements
  await page.waitForFunction(
    () => {
      const draggables = document.querySelectorAll(
        '[data-sortable-id], [data-droppable-id], [draggable="true"]'
      );
      return draggables.length > 0;
    },
    { timeout }
  );
  
  // Allow event listeners to attach
  await page.waitForTimeout(500);
}

/**
 * Perform a drag-and-drop operation using mouse events
 */
export async function dragAndDrop(
  page: Page,
  source: Locator,
  target: Locator,
  config: DragConfig = {}
): Promise<DragResult> {
  const {
    steps = 10,
    dragDelay = 200,
    dropDelay = 300,
    captureScreenshots = false,
    screenshotDir = 'test-results/screenshots/drag-drop',
  } = config;

  const screenshots: string[] = [];
  
  try {
    // Ensure elements are visible
    await source.waitFor({ state: 'visible', timeout: 5000 });
    await target.waitFor({ state: 'visible', timeout: 5000 });
    
    // Scroll into view
    await source.scrollIntoViewIfNeeded();
    await target.scrollIntoViewIfNeeded();
    
    // Get coordinates
    const sourceCenter = await getElementCenter(source);
    const targetCenter = await getElementCenter(target);
    
    if (captureScreenshots) {
      const timestamp = Date.now();
      const beforePath = `${screenshotDir}/before-${timestamp}.png`;
      await page.screenshot({ path: beforePath, fullPage: true });
      screenshots.push(beforePath);
    }
    
    // Start drag
    await page.mouse.move(sourceCenter.x, sourceCenter.y);
    await page.mouse.down();
    await page.waitForTimeout(dragDelay);
    
    if (captureScreenshots) {
      const timestamp = Date.now();
      const draggingPath = `${screenshotDir}/dragging-${timestamp}.png`;
      await page.screenshot({ path: draggingPath, fullPage: true });
      screenshots.push(draggingPath);
    }
    
    // Move to target
    await page.mouse.move(targetCenter.x, targetCenter.y, { steps });
    await page.waitForTimeout(100);
    
    if (captureScreenshots) {
      const timestamp = Date.now();
      const overTargetPath = `${screenshotDir}/over-target-${timestamp}.png`;
      await page.screenshot({ path: overTargetPath, fullPage: true });
      screenshots.push(overTargetPath);
    }
    
    // Drop
    await page.mouse.up();
    await page.waitForTimeout(dropDelay);
    
    if (captureScreenshots) {
      const timestamp = Date.now();
      const afterPath = `${screenshotDir}/after-${timestamp}.png`;
      await page.screenshot({ path: afterPath, fullPage: true });
      screenshots.push(afterPath);
    }
    
    return {
      success: true,
      screenshots: captureScreenshots ? screenshots : undefined,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      screenshots: captureScreenshots ? screenshots : undefined,
    };
  }
}

/**
 * Drag an element by selector strings
 */
export async function dragBySelector(
  page: Page,
  sourceSelector: string,
  targetSelector: string,
  config: DragConfig = {}
): Promise<DragResult> {
  const source = page.locator(sourceSelector).first();
  const target = page.locator(targetSelector).first();
  return dragAndDrop(page, source, target, config);
}

/**
 * Perform keyboard-based drag using @dnd-kit keyboard navigation
 * Uses Space to activate, Arrow keys to move, Space to drop
 */
export async function keyboardDrag(
  page: Page,
  source: Locator,
  direction: 'up' | 'down' | 'left' | 'right',
  moves = 1,
  config: DragConfig = {}
): Promise<DragResult> {
  const { dragDelay = 200, dropDelay = 300 } = config;
  
  try {
    await source.waitFor({ state: 'visible', timeout: 5000 });
    await source.focus();
    await page.waitForTimeout(200);
    
    // Activate drag mode with Space
    await page.keyboard.press('Space');
    await page.waitForTimeout(dragDelay);
    
    // Move with arrow keys
    const arrowKey = `Arrow${direction.charAt(0).toUpperCase()}${direction.slice(1)}`;
    for (let i = 0; i < moves; i++) {
      await page.keyboard.press(arrowKey);
      await page.waitForTimeout(100);
    }
    
    // Drop with Space
    await page.keyboard.press('Space');
    await page.waitForTimeout(dropDelay);
    
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Cancel a drag operation with Escape key
 */
export async function cancelDrag(page: Page, source: Locator): Promise<void> {
  const box = await source.boundingBox();
  if (box) {
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.waitForTimeout(200);
    await page.mouse.move(x + 50, y + 50, { steps: 5 });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    await page.mouse.up();
  }
}

/**
 * Find all draggable subject items
 */
export async function findDraggableSubjects(page: Page): Promise<Locator> {
  return page.locator('[data-sortable-id*="SubjectCode"]').or(
    page.locator('.subject-item, [class*="subject"]').filter({
      has: page.locator('b'),
    })
  );
}

/**
 * Find all droppable timeslot cells
 */
export async function findDroppableTimeslots(page: Page): Promise<Locator> {
  return page.locator('[data-droppable-id], td.timeslot, .timeslot-cell, td');
}

/**
 * Find empty timeslot cells
 */
export async function findEmptyTimeslots(page: Page): Promise<Locator> {
  const allSlots = await findDroppableTimeslots(page);
  return allSlots.filter({
    hasNot: page.locator('.subject-code, .scheduled, b'),
  });
}

/**
 * Find filled timeslot cells
 */
export async function findFilledTimeslots(page: Page): Promise<Locator> {
  const allSlots = await findDroppableTimeslots(page);
  return allSlots.filter({
    has: page.locator('text=/ค|พ|ส|ง|ว|ENG|MAT|SCI/i'),
  });
}

/**
 * Find locked timeslot cells
 */
export async function findLockedTimeslots(page: Page): Promise<Locator> {
  const allSlots = await findDroppableTimeslots(page);
  return allSlots.filter({
    has: page.locator('svg[data-testid*="Lock"], svg[data-testid*="Https"]'),
  });
}

/**
 * Find timeslots with errors/conflicts
 */
export async function findErrorTimeslots(page: Page): Promise<Locator> {
  const allSlots = await findDroppableTimeslots(page);
  return allSlots.filter({
    has: page.locator('svg[data-testid*="Error"], .error, .conflict'),
  });
}

/**
 * Check if an element is currently being dragged
 */
export async function isBeingDragged(locator: Locator): Promise<boolean> {
  const opacity = await locator.evaluate((el) => {
    return window.getComputedStyle(el).opacity;
  });
  return parseFloat(opacity) < 1;
}

/**
 * Check if a drop zone is currently highlighted/active
 */
export async function isDropZoneActive(locator: Locator): Promise<boolean> {
  const classes = await locator.getAttribute('class');
  if (!classes) return false;
  
  // Check for common active/hover classes
  return /active|hover|over|highlight|drop-target/.test(classes);
}

/**
 * Get the current position of a draggable element
 */
export async function getDraggablePosition(
  locator: Locator
): Promise<{ x: number; y: number } | null> {
  const box = await locator.boundingBox();
  if (!box) return null;
  
  return {
    x: box.x,
    y: box.y,
  };
}

/**
 * Verify drag operation completed by checking position change
 */
export async function verifyDragCompleted(
  locator: Locator,
  beforePosition: { x: number; y: number }
): Promise<boolean> {
  const afterPosition = await getDraggablePosition(locator);
  if (!afterPosition) return false;
  
  const moved =
    Math.abs(afterPosition.x - beforePosition.x) > 5 ||
    Math.abs(afterPosition.y - beforePosition.y) > 5;
  
  return moved;
}

/**
 * Simulate touch drag for mobile testing
 */
export async function touchDragAndDrop(
  page: Page,
  source: Locator,
  target: Locator,
  config: DragConfig = {}
): Promise<DragResult> {
  const { steps = 10, dragDelay = 200, dropDelay = 300 } = config;
  
  try {
    await source.waitFor({ state: 'visible', timeout: 5000 });
    await target.waitFor({ state: 'visible', timeout: 5000 });
    
    const sourceCenter = await getElementCenter(source);
    const targetCenter = await getElementCenter(target);
    
    // Touch start
    await page.touchscreen.tap(sourceCenter.x, sourceCenter.y);
    await page.waitForTimeout(dragDelay);
    
    // Move touch
    const deltaX = (targetCenter.x - sourceCenter.x) / steps;
    const deltaY = (targetCenter.y - sourceCenter.y) / steps;
    
    for (let i = 0; i <= steps; i++) {
      const x = sourceCenter.x + deltaX * i;
      const y = sourceCenter.y + deltaY * i;
      await page.touchscreen.tap(x, y);
      await page.waitForTimeout(20);
    }
    
    await page.waitForTimeout(dropDelay);
    
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Wait for drag animation to complete
 */
export async function waitForDragAnimation(page: Page, duration = 300): Promise<void> {
  await page.waitForTimeout(duration);
  await page.waitForFunction(() => {
    // Check if any elements have transform or transition active
    const elements = document.querySelectorAll('[style*="transform"], [style*="transition"]');
    return Array.from(elements).every((el) => {
      const style = window.getComputedStyle(el);
      return style.transform === 'none' || !style.transition.includes('transform');
    });
  });
}

/**
 * Get count of subjects in subject box
 */
export async function getSubjectCount(page: Page): Promise<number> {
  const subjects = await findDraggableSubjects(page);
  return subjects.count();
}

/**
 * Get count of filled timeslots
 */
export async function getFilledSlotsCount(page: Page): Promise<number> {
  const filled = await findFilledTimeslots(page);
  return filled.count();
}

/**
 * Get count of empty timeslots
 */
export async function getEmptySlotsCount(page: Page): Promise<number> {
  const empty = await findEmptyTimeslots(page);
  return empty.count();
}

/**
 * Comprehensive drag state snapshot for debugging
 */
export async function getDragStateSnapshot(page: Page) {
  const subjectCount = await getSubjectCount(page);
  const filledCount = await getFilledSlotsCount(page);
  const emptyCount = await getEmptySlotsCount(page);
  
  const lockedSlots = await findLockedTimeslots(page);
  const lockedCount = await lockedSlots.count();
  
  const errorSlots = await findErrorTimeslots(page);
  const errorCount = await errorSlots.count();
  
  return {
    timestamp: new Date().toISOString(),
    subjects: {
      total: subjectCount,
    },
    timeslots: {
      filled: filledCount,
      empty: emptyCount,
      locked: lockedCount,
      errors: errorCount,
    },
  };
}

export const DragDropHelper = {
  // Core operations
  dragAndDrop,
  dragBySelector,
  keyboardDrag,
  cancelDrag,
  touchDragAndDrop,
  
  // Finders
  findDraggableSubjects,
  findDroppableTimeslots,
  findEmptyTimeslots,
  findFilledTimeslots,
  findLockedTimeslots,
  findErrorTimeslots,
  
  // State checkers
  isBeingDragged,
  isDropZoneActive,
  getDraggablePosition,
  verifyDragCompleted,
  
  // Utilities
  waitForDndReady,
  waitForDragAnimation,
  getElementCenter,
  getDragStateSnapshot,
  getSubjectCount,
  getFilledSlotsCount,
  getEmptySlotsCount,
};
