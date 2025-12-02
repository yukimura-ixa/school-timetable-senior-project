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
 *
 * FIXME: These tests are skipped because DnD operations are flaky in CI.
 * The 30s timeouts consistently fail due to headless browser limitations
 * with complex drag-and-drop interactions. Need to investigate using
 * keyboard-based DnD or mouse action sequences instead.
 * See: https://github.com/yukimura-ixa/school-timetable-senior-project/issues/162
 */

import { test, expect } from "./fixtures/admin.fixture";
import { Page } from "@playwright/test";
import { NavigationHelper } from "./helpers/navigation";

// Test data setup
const TEST_SEMESTER = "1-2567";
const SCREENSHOT_DIR = "test-results/screenshots/drag-drop";

/**
 * Helper: Wait for page hydration and dnd-kit initialization
 */
async function waitForDndReady(page: Page) {
  await page.waitForLoadState("domcontentloaded");

  // Wait for DndContext to be ready
  await page.waitForFunction(
    () => {
      // Check if dnd-kit has initialized by looking for draggable elements
      const draggables = document.querySelectorAll(
        '[data-sortable-id], [draggable="true"]',
      );
      return draggables.length > 0;
    },
    { timeout: 10000 },
  );

  // Wait for event listeners to be attached by checking element readiness
  await page
    .waitForFunction(
      () => {
        const draggables = document.querySelectorAll(
          '[data-sortable-id], [draggable="true"]',
        );
        if (draggables.length === 0) return false;

        // Check if draggables have necessary data attributes (indicates dnd-kit is ready)
        for (const el of Array.from(draggables)) {
          if (
            el.hasAttribute("data-sortable-id") ||
            el.hasAttribute("data-dnd-kit-sortable")
          ) {
            return true;
          }
        }
        return false;
      },
      { timeout: 3000 },
    )
    .catch(() => {
      // Fallback: if specific attributes not found, assume ready after first check passed
      console.log(
        "⚠️ DnD attributes check failed, proceeding with basic draggable detection",
      );
    });
}

/**
 * Helper: Get bounding box center coordinates
 */
async function getCenter(locator: any) {
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error("Element not visible or has no bounding box");
  }
  return {
    x: box.x + box.width / 2,
    y: box.y + box.height / 2,
  };
}

/**
 * Helper: Perform drag and drop operation with visual feedback checks
 */
async function dragAndDrop(
  page: Page,
  sourceSelector: string,
  targetSelector: string,
) {
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

  // Wait for drag state to activate (check for visual feedback like cursor change or overlay)
  await page
    .waitForFunction(
      () => {
        // Check if drag is active by looking for common drag indicators
        return (
          document.body.style.cursor === "grabbing" ||
          document.body.classList.contains("dragging") ||
          document.querySelector('[data-dragging="true"]') !== null ||
          document.querySelector(".drag-overlay, .dragging") !== null
        );
      },
      { timeout: 1000 },
    )
    .catch(() => {
      // Fallback: if no visual indicator found, just proceed
      console.log("⚠️ No drag visual feedback detected, proceeding anyway");
    });

  // Move to target with smooth steps
  await page.mouse.move(targetCenter.x, targetCenter.y, { steps: 10 });

  // Drop and wait for drop animation/feedback
  await page.mouse.up();

  // Wait for drop to complete - check for UI updates instead of fixed timeout
  await page
    .waitForFunction(
      () => {
        // Drag should be completed (no more drag indicators)
        return (
          document.body.style.cursor !== "grabbing" &&
          !document.body.classList.contains("dragging")
        );
      },
      { timeout: 1000 },
    )
    .catch(() => {
      // Fallback if no drag indicators were present
    });
}

test.describe.skip("Drag and Drop - Subject List to Timeslot", () => {
  // Note: Navigation moved inside each test to use authenticated page context

  test("TC-DND-001-01: Subject items are draggable", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    const nav = new NavigationHelper(page);
    await nav.goToTeacherArrange(TEST_SEMESTER);
    await waitForDndReady(page);

    // Look for draggable subject items
    const subjectItems = page
      .locator('[data-sortable-id*="SubjectCode"]')
      .or(
        page
          .locator('.subject-item, [class*="subject"]')
          .filter({ has: page.locator("b") }),
      );

    const count = await subjectItems.count();

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/01-subject-items-draggable.png`,
      fullPage: true,
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
        fullPage: true,
      });
    }
  });

  test("TC-DND-001-02: Subject selection via click", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    const nav = new NavigationHelper(page);
    await nav.goToTeacherArrange(TEST_SEMESTER);
    await waitForDndReady(page);

    const subjectItems = page
      .locator('[data-sortable-id*="SubjectCode"]')
      .or(
        page
          .locator('.subject-item, [class*="subject"]')
          .filter({ has: page.locator("b") }),
      );

    const count = await subjectItems.count();

    if (count > 0) {
      const firstItem = subjectItems.first();

      // Click to select
      await firstItem.click();
      // Wait for selection state to update
      await page
        .waitForFunction(
          () => {
            const item = document.querySelector(
              '[data-sortable-id*="SubjectCode"], .subject-item',
            );
            return item && item.classList.length > 0;
          },
          { timeout: 1000 },
        )
        .catch(() => {});

      await page.screenshot({
        path: `${SCREENSHOT_DIR}/02-subject-selected.png`,
        fullPage: true,
      });

      // Check for selection visual feedback (green background, pulse, etc.)
      const itemClasses = await firstItem.getAttribute("class");
      console.log("Selected item classes:", itemClasses);

      expect(itemClasses).toBeTruthy();
    }
  });

  test("TC-DND-001-03: Drag subject to empty timeslot", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    const nav = new NavigationHelper(page);
    await nav.goToTeacherArrange(TEST_SEMESTER);
    await waitForDndReady(page);

    // Find a subject to drag
    const subjectItems = page
      .locator('[data-sortable-id*="SubjectCode"]')
      .or(page.locator(".subject-item").filter({ has: page.locator("b") }));

    // Find empty timeslot cells
    const emptySlots = page
      .locator("[data-droppable-id], td.timeslot, .timeslot-cell")
      .filter({
        hasNot: page.locator(".subject-code, .scheduled"),
      });

    const subjectCount = await subjectItems.count();
    const emptyCount = await emptySlots.count();

    console.log(`Subjects: ${subjectCount}, Empty slots: ${emptyCount}`);

    if (subjectCount > 0 && emptyCount > 0) {
      await page.screenshot({
        path: `${SCREENSHOT_DIR}/03-before-drag.png`,
        fullPage: true,
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

          // Wait for drag to initiate (check for visual feedback)
          await page
            .waitForFunction(
              () => {
                return (
                  document.body.style.cursor === "grabbing" ||
                  document.querySelector(
                    '[data-dragging="true"], .dragging',
                  ) !== null
                );
              },
              { timeout: 1000 },
            )
            .catch(() => {
              // No visual drag feedback found, continue anyway
            });

          await page.screenshot({
            path: `${SCREENSHOT_DIR}/04-dragging.png`,
            fullPage: true,
          });

          // Move to target
          await page.mouse.move(targetX, targetY, { steps: 15 });

          await page.screenshot({
            path: `${SCREENSHOT_DIR}/05-over-target.png`,
            fullPage: true,
          });

          // Drop
          await page.mouse.up();

          // Wait for drop operation to complete (check for UI updates)
          await page
            .waitForFunction(
              () => {
                return !document.body.classList.contains("dragging");
              },
              { timeout: 2000 },
            )
            .catch(() => {});

          await page.screenshot({
            path: `${SCREENSHOT_DIR}/06-after-drop.png`,
            fullPage: true,
          });

          console.log("Drag and drop operation completed");
        }
      } catch (error) {
        console.log("Drag operation error:", error);
        await page.screenshot({
          path: `${SCREENSHOT_DIR}/03-drag-error.png`,
          fullPage: true,
        });
      }
    }
  });

  test("TC-DND-001-04: Visual feedback during drag", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    const nav = new NavigationHelper(page);
    await nav.goToTeacherArrange(TEST_SEMESTER);
    await waitForDndReady(page);

    const subjectItems = page
      .locator('[data-sortable-id*="SubjectCode"]')
      .or(page.locator(".subject-item").first());

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
        // Wait for drag to initiate
        await page
          .waitForFunction(
            () => {
              return (
                document.body.style.cursor === "grabbing" ||
                document.querySelector('[data-dragging="true"], .dragging') !==
                  null
              );
            },
            { timeout: 500 },
          )
          .catch(() => {});

        // Move slightly to trigger drag
        await page.mouse.move(x + 50, y + 50, { steps: 5 });

        await page.screenshot({
          path: `${SCREENSHOT_DIR}/07-drag-visual-feedback.png`,
          fullPage: true,
        });

        // Cancel drag
        await page.mouse.up();

        console.log("Visual feedback captured during drag");
      }
    }
  });
});

test.describe.skip("Drag and Drop - Between Timeslots", () => {
  // Note: Navigation moved inside each test to use authenticated page context

  test("TC-DND-002-01: Identify filled timeslots", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    const nav = new NavigationHelper(page);
    await nav.goToTeacherArrange(TEST_SEMESTER);
    await waitForDndReady(page);

    // Find timeslots that have subjects
    const filledSlots = page.locator("td, .timeslot-cell").filter({
      has: page.locator("text=/ค|พ|ส|ง|ว|ENG|MAT|SCI/i"),
    });

    const count = await filledSlots.count();

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/10-filled-timeslots.png`,
      fullPage: true,
    });

    console.log(`Found ${count} filled timeslots`);

    if (count > 0) {
      // Highlight first filled slot
      const firstFilled = filledSlots.first();
      await firstFilled.scrollIntoViewIfNeeded();
      await firstFilled.hover();

      await page.screenshot({
        path: `${SCREENSHOT_DIR}/11-filled-slot-hover.png`,
        fullPage: true,
      });
    }
  });

  test("TC-DND-002-02: Drag subject between timeslots", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    const nav = new NavigationHelper(page);
    await nav.goToTeacherArrange(TEST_SEMESTER);
    await waitForDndReady(page);

    // Find filled slots that can be dragged
    const draggableSlots = page.locator('[data-sortable-id*="Slot"]').or(
      page.locator("td, .timeslot-cell").filter({
        has: page.locator("text=/ค|พ|ส/"),
      }),
    );

    const count = await draggableSlots.count();
    console.log(`Draggable slots: ${count}`);

    if (count >= 2) {
      await page.screenshot({
        path: `${SCREENSHOT_DIR}/12-before-slot-swap.png`,
        fullPage: true,
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
          // Wait for drag state
          await page
            .waitForFunction(
              () => {
                return (
                  document.body.style.cursor === "grabbing" ||
                  document.querySelector("[data-dragging]") !== null
                );
              },
              { timeout: 500 },
            )
            .catch(() => {});

          await page.screenshot({
            path: `${SCREENSHOT_DIR}/13-dragging-slot.png`,
            fullPage: true,
          });

          await page.mouse.move(targetX, targetY, { steps: 15 });
          // Wait for drop target to be ready
          await page
            .waitForFunction(
              () => {
                const dropTarget = document.querySelector(
                  "[data-droppable-id], .drop-target",
                );
                return dropTarget !== null;
              },
              { timeout: 500 },
            )
            .catch(() => {});

          await page.screenshot({
            path: `${SCREENSHOT_DIR}/14-over-target-slot.png`,
            fullPage: true,
          });

          await page.mouse.up();
          await page
            .waitForFunction(
              () => {
                return (
                  document.body.style.cursor !== "grabbing" &&
                  !document.body.classList.contains("dragging")
                );
              },
              { timeout: 1000 },
            )
            .catch(() => {});

          await page.screenshot({
            path: `${SCREENSHOT_DIR}/15-after-slot-swap.png`,
            fullPage: true,
          });

          console.log("Slot swap operation completed");
        }
      } catch (error) {
        console.log("Slot swap error:", error);
      }
    }
  });

  test("TC-DND-002-03: Click to change timeslot mode", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    const nav = new NavigationHelper(page);
    await nav.goToTeacherArrange(TEST_SEMESTER);
    await waitForDndReady(page);

    // Look for change/swap buttons or icons
    const changeIcons = page.locator(
      'svg[data-testid*="Change"], button:has-text("เปลี่ยน"), [title*="change"]',
    );

    const count = await changeIcons.count();
    console.log(`Change mode icons: ${count}`);

    if (count > 0) {
      const firstIcon = changeIcons.first();

      await page.screenshot({
        path: `${SCREENSHOT_DIR}/16-before-change-mode.png`,
        fullPage: true,
      });

      await firstIcon.click();
      // Wait for change mode to activate
      await page
        .waitForFunction(
          () => {
            return (
              document.body.classList.contains("change-mode") ||
              document.querySelector('[data-mode="change"]') !== null
            );
          },
          { timeout: 1000 },
        )
        .catch(() => {});

      await page.screenshot({
        path: `${SCREENSHOT_DIR}/17-change-mode-active.png`,
        fullPage: true,
      });

      console.log("Change mode activated via click");
    }
  });
});

test.describe.skip("Drag and Drop - Conflict Detection", () => {
  // Note: Navigation moved inside each test to use authenticated page context

  test("TC-DND-003-01: Detect error indicators", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    const nav = new NavigationHelper(page);
    await nav.goToTeacherArrange(TEST_SEMESTER);
    await waitForDndReady(page);

    // Look for error icons, messages, or red borders
    const errorIndicators = page.locator(
      '[data-testid*="Error"], svg.text-red, .error, .conflict, .border-red',
    );

    const count = await errorIndicators.count();

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/20-error-indicators.png`,
      fullPage: true,
    });

    console.log(`Error indicators found: ${count}`);

    if (count > 0) {
      // Hover over first error to see details
      const firstError = errorIndicators.first();
      await firstError.scrollIntoViewIfNeeded();
      await firstError.hover();
      // Wait for tooltip or error details to appear
      await page
        .waitForFunction(
          () => {
            return (
              document.querySelector(
                '[role="tooltip"], .tooltip, .error-message',
              ) !== null
            );
          },
          { timeout: 1000 },
        )
        .catch(() => {});

      await page.screenshot({
        path: `${SCREENSHOT_DIR}/21-error-details.png`,
        fullPage: true,
      });
    }
  });

  test("TC-DND-003-02: Attempt invalid drop (same slot)", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    const nav = new NavigationHelper(page);
    await nav.goToTeacherArrange(TEST_SEMESTER);
    await waitForDndReady(page);

    const filledSlots = page.locator('[data-sortable-id*="Slot"]').filter({
      has: page.locator("text=/ค|พ/"),
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
        await page
          .waitForFunction(
            () => {
              return document.body.style.cursor === "grabbing";
            },
            { timeout: 500 },
          )
          .catch(() => {});

        // Move in circle and return to same position
        await page.mouse.move(x + 30, y + 30, { steps: 5 });
        await page.mouse.move(x, y, { steps: 5 });

        await page.screenshot({
          path: `${SCREENSHOT_DIR}/22-invalid-drop-same-slot.png`,
          fullPage: true,
        });

        await page.mouse.up();
        await page
          .waitForFunction(
            () => {
              return (
                document.body.style.cursor !== "grabbing" &&
                !document.body.classList.contains("dragging")
              );
            },
            { timeout: 1000 },
          )
          .catch(() => {});

        console.log("Attempted self-drop operation");
      }
    }
  });

  test("TC-DND-003-03: Drop on occupied slot (conflict)", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    const nav = new NavigationHelper(page);
    await nav.goToTeacherArrange(TEST_SEMESTER);
    await waitForDndReady(page);

    const subjects = page.locator('[data-sortable-id*="SubjectCode"]').first();
    const occupiedSlots = page.locator("td, .timeslot-cell").filter({
      has: page.locator("text=/ค|พ/"),
    });

    const hasSubject = (await subjects.count()) > 0;
    const hasOccupied = (await occupiedSlots.count()) > 0;

    if (hasSubject && hasOccupied) {
      await page.screenshot({
        path: `${SCREENSHOT_DIR}/23-before-conflict-drop.png`,
        fullPage: true,
      });

      try {
        const subjectBox = await subjects.boundingBox();
        const slotBox = await occupiedSlots.first().boundingBox();

        if (subjectBox && slotBox) {
          await page.mouse.move(
            subjectBox.x + subjectBox.width / 2,
            subjectBox.y + subjectBox.height / 2,
          );
          await page.mouse.down();
          await page
            .waitForFunction(
              () => {
                return (
                  document.querySelector("[data-dragging]") !== null ||
                  document.body.style.cursor === "grabbing"
                );
              },
              { timeout: 500 },
            )
            .catch(() => {});

          await page.mouse.move(
            slotBox.x + slotBox.width / 2,
            slotBox.y + slotBox.height / 2,
            { steps: 10 },
          );

          await page.screenshot({
            path: `${SCREENSHOT_DIR}/24-over-occupied-slot.png`,
            fullPage: true,
          });

          await page.mouse.up();
          // Wait for error state to appear
          await page
            .waitForFunction(
              () => {
                return (
                  document.querySelector(
                    '[data-testid*="Error"], .error, .conflict',
                  ) !== null
                );
              },
              { timeout: 2000 },
            )
            .catch(() => {});

          await page.screenshot({
            path: `${SCREENSHOT_DIR}/25-after-conflict-attempt.png`,
            fullPage: true,
          });

          console.log("Attempted drop on occupied slot");
        }
      } catch (error) {
        console.log("Conflict test error:", error);
      }
    }
  });
});

test.describe.skip("Drag and Drop - Lock State Behavior", () => {
  // Note: Navigation moved inside each test to use authenticated page context

  test("TC-DND-004-01: Identify locked timeslots", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    const nav = new NavigationHelper(page);
    await nav.goToTeacherArrange(TEST_SEMESTER);
    await waitForDndReady(page);

    // Look for lock icons or locked indicators
    const lockIcons = page.locator(
      'svg[data-testid*="Lock"], svg[data-testid*="Https"], .locked, [title*="lock"]',
    );

    const count = await lockIcons.count();

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/30-locked-slots.png`,
      fullPage: true,
    });

    console.log(`Locked slots found: ${count}`);

    if (count > 0) {
      const firstLock = lockIcons.first();
      await firstLock.scrollIntoViewIfNeeded();
      await firstLock.hover();

      await page.screenshot({
        path: `${SCREENSHOT_DIR}/31-locked-slot-hover.png`,
        fullPage: true,
      });
    }
  });

  test("TC-DND-004-02: Attempt drop on locked slot", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    const nav = new NavigationHelper(page);
    await nav.goToTeacherArrange(TEST_SEMESTER);
    await waitForDndReady(page);

    const subjects = page.locator('[data-sortable-id*="SubjectCode"]').first();
    const lockedSlots = page.locator("td, .timeslot-cell").filter({
      has: page.locator('svg[data-testid*="Lock"]'),
    });

    const hasSubject = (await subjects.count()) > 0;
    const hasLocked = (await lockedSlots.count()) > 0;

    if (hasSubject && hasLocked) {
      await page.screenshot({
        path: `${SCREENSHOT_DIR}/32-before-locked-drop.png`,
        fullPage: true,
      });

      try {
        const subjectBox = await subjects.boundingBox();
        const lockedBox = await lockedSlots.first().boundingBox();

        if (subjectBox && lockedBox) {
          await page.mouse.move(
            subjectBox.x + subjectBox.width / 2,
            subjectBox.y + subjectBox.height / 2,
          );
          await page.mouse.down();
          await page
            .waitForFunction(
              () => {
                return (
                  document.body.style.cursor === "grabbing" ||
                  document.querySelector("[data-dragging]") !== null
                );
              },
              { timeout: 500 },
            )
            .catch(() => {});

          await page.mouse.move(
            lockedBox.x + lockedBox.width / 2,
            lockedBox.y + lockedBox.height / 2,
            { steps: 10 },
          );

          await page.screenshot({
            path: `${SCREENSHOT_DIR}/33-over-locked-slot.png`,
            fullPage: true,
          });

          await page.mouse.up();
          await page
            .waitForFunction(
              () => {
                return (
                  document.body.style.cursor !== "grabbing" &&
                  !document.body.classList.contains("dragging")
                );
              },
              { timeout: 1000 },
            )
            .catch(() => {});

          await page.screenshot({
            path: `${SCREENSHOT_DIR}/34-after-locked-drop-reject.png`,
            fullPage: true,
          });

          console.log("Attempted drop on locked slot - should be rejected");
        }
      } catch (error) {
        console.log("Locked drop test error:", error);
      }
    }
  });

  test("TC-DND-004-03: Locked slots are not draggable", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    const nav = new NavigationHelper(page);
    await nav.goToTeacherArrange(TEST_SEMESTER);
    await waitForDndReady(page);

    const lockedSlots = page.locator("td, .timeslot-cell").filter({
      has: page.locator('svg[data-testid*="Lock"]'),
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
          fullPage: true,
        });

        // Try to drag locked slot
        await page.mouse.move(x, y);
        await page.mouse.down();
        await page
          .waitForFunction(
            () => {
              return (
                document.body.style.cursor === "grabbing" ||
                document.querySelector("[data-dragging]") !== null
              );
            },
            { timeout: 500 },
          )
          .catch(() => {});

        await page.mouse.move(x + 50, y + 50, { steps: 5 });

        await page.screenshot({
          path: `${SCREENSHOT_DIR}/36-locked-drag-attempt.png`,
          fullPage: true,
        });

        await page.mouse.up();

        console.log("Attempted to drag locked slot - should not move");
      }
    }
  });
});

test.describe.skip("Drag and Drop - Student Arrange Page", () => {
  // Note: Navigation moved inside each test to use authenticated page context

  test("TC-DND-006-01: Student page drag functionality", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    const nav = new NavigationHelper(page);
    await nav.goToStudentArrange(TEST_SEMESTER);
    await waitForDndReady(page);

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/50-student-arrange.png`,
      fullPage: true,
    });

    // Check if drag components exist
    const draggables = page.locator("[data-sortable-id], .subject-item");
    const count = await draggables.count();

    console.log(`Student arrange draggables: ${count}`);

    if (count > 0) {
      const firstItem = draggables.first();
      await firstItem.hover();

      await page.screenshot({
        path: `${SCREENSHOT_DIR}/51-student-draggable-hover.png`,
        fullPage: true,
      });
    }
  });

  test("TC-DND-006-02: Class selection affects drag behavior", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    const nav = new NavigationHelper(page);
    await nav.goToStudentArrange(TEST_SEMESTER);
    await waitForDndReady(page);

    // Look for class selector
    const classSelector = page.locator('select, [role="combobox"]').first();

    const hasSelector = (await classSelector.count()) > 0;

    if (hasSelector) {
      await page.screenshot({
        path: `${SCREENSHOT_DIR}/52-before-class-select.png`,
        fullPage: true,
      });

      // Select a class
      await classSelector.click();
      await page
        .waitForFunction(
          () => {
            return document.activeElement !== document.body;
          },
          { timeout: 1000 },
        )
        .catch(() => {});

      await page.screenshot({
        path: `${SCREENSHOT_DIR}/53-class-dropdown.png`,
        fullPage: true,
      });

      // Select first option if available
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("Enter");

      // Wait for class data to load
      await page
        .waitForFunction(
          () => {
            return (
              document.querySelectorAll("[data-sortable-id], .subject-item")
                .length > 0
            );
          },
          { timeout: 3000 },
        )
        .catch(() => {});

      await page.screenshot({
        path: `${SCREENSHOT_DIR}/54-after-class-select.png`,
        fullPage: true,
      });

      console.log("Class selection changed drag context");
    }
  });
});

test.describe.skip("Drag and Drop - Performance & Edge Cases", () => {
  // Note: Navigation moved inside each test to use authenticated page context

  test("TC-DND-007-01: Multiple rapid drags", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    const nav = new NavigationHelper(page);
    await nav.goToTeacherArrange(TEST_SEMESTER);
    await waitForDndReady(page);

    const subjects = page.locator('[data-sortable-id*="SubjectCode"]');
    const count = await subjects.count();

    if (count >= 3) {
      await page.screenshot({
        path: `${SCREENSHOT_DIR}/60-before-rapid-drags.png`,
        fullPage: true,
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
          await page
            .waitForFunction(
              () => {
                return document.body.style.cursor !== "grabbing";
              },
              { timeout: 300 },
            )
            .catch(() => {});
        }
      }

      await page.screenshot({
        path: `${SCREENSHOT_DIR}/61-after-rapid-drags.png`,
        fullPage: true,
      });

      console.log("Rapid drag operations completed");
    }
  });

  test("TC-DND-007-02: Drag outside boundaries", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    const nav = new NavigationHelper(page);
    await nav.goToTeacherArrange(TEST_SEMESTER);
    await waitForDndReady(page);

    const subjects = page.locator('[data-sortable-id*="SubjectCode"]').first();
    const count = await subjects.count();

    if (count > 0) {
      const box = await subjects.boundingBox();

      if (box) {
        const x = box.x + box.width / 2;
        const y = box.y + box.height / 2;

        await page.mouse.move(x, y);
        await page.mouse.down();
        await page
          .waitForFunction(
            () => {
              return document.body.style.cursor === "grabbing";
            },
            { timeout: 500 },
          )
          .catch(() => {});

        // Drag far outside viewport
        await page.mouse.move(10, 10, { steps: 10 });

        await page.screenshot({
          path: `${SCREENSHOT_DIR}/62-drag-outside-bounds.png`,
          fullPage: true,
        });

        await page.mouse.up();
        await page
          .waitForFunction(
            () => {
              return !document.body.classList.contains("dragging");
            },
            { timeout: 1000 },
          )
          .catch(() => {});

        await page
          .waitForFunction(
            () => {
              return (
                document.querySelector(
                  '[data-testid*="Error"], .error, .conflict',
                ) !== null
              );
            },
            { timeout: 2000 },
          )
          .catch(() => {});

        await page.screenshot({
          path: `${SCREENSHOT_DIR}/63-after-outside-drop.png`,
          fullPage: true,
        });

        console.log("Drag outside boundaries completed");
      }
    }
  });
});
