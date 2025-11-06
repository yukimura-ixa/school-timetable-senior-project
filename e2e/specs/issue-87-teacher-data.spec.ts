/**
 * Issue #87 - Teacher Data Display in Program View
 * 
 * Tests that teacher names are correctly displayed in the program view dashboard
 * after implementing fix for missing teacher data.
 * 
 * Test scenarios:
 * 1. Navigate to program view
 * 2. Select grade level
 * 3. Verify teacher names are displayed (not empty)
 * 4. Verify teacher name format (Thai format: prefix + first + last)
 * 5. Verify data persists across navigation
 * 
 * @see Issue: https://github.com/yukimura-ixa/school-timetable-senior-project/issues/87
 */

import { test, expect } from '../fixtures/test';

test.describe('Issue #87 - Teacher Data in Program View', () => {
  test.beforeEach(async ({ programViewPage }) => {
    // Navigate to test semester (1-2567)
    await programViewPage.navigateTo('1', '2567');
  });

  test('should display teacher names in program table', async ({ programViewPage }) => {
    // Select a grade level
    await programViewPage.selectGrade('ม.1');
    
    // Assert teacher data is visible
    await programViewPage.assertTeacherDataVisible();
    
    // Verify we have at least some subjects with teachers
    const teacherNames = await programViewPage.getTeacherNames();
    expect(teacherNames.length).toBeGreaterThan(0);
    
    // Verify teacher names are not empty strings
    const nonEmptyNames = teacherNames.filter(name => name.length > 0);
    expect(nonEmptyNames.length).toBeGreaterThan(0);
  });

  test('should display teacher names in correct Thai format', async ({ programViewPage }) => {
    // Select a grade level
    await programViewPage.selectGrade('ม.2');
    
    // Assert teacher name format
    await programViewPage.assertTeacherNameFormat();
    
    // Get teacher names and verify format
    const teacherNames = await programViewPage.getTeacherNames();
    const nonEmptyNames = teacherNames.filter(name => name.length > 0);
    
    // Each name should contain Thai characters and space
    for (const name of nonEmptyNames) {
      expect(name).toMatch(/[\u0E00-\u0E7F]/); // Thai characters
      expect(name.includes(' ')).toBeTruthy(); // Space separator
    }
  });

  test('should maintain teacher data across grade changes', async ({ programViewPage }) => {
    // Select first grade
    await programViewPage.selectGrade('ม.1');
    const firstGradeTeachers = await programViewPage.getTeacherNames();
    expect(firstGradeTeachers.length).toBeGreaterThan(0);
    
    // Change to another grade
    await programViewPage.selectGrade('ม.3');
    const secondGradeTeachers = await programViewPage.getTeacherNames();
    expect(secondGradeTeachers.length).toBeGreaterThan(0);
    
    // Teacher data should update (not stay the same)
    expect(firstGradeTeachers).not.toEqual(secondGradeTeachers);
  });

  test('should show export button when teacher data is loaded', async ({ programViewPage }) => {
    // Select a grade level
    await programViewPage.selectGrade('ม.1');
    
    // Wait for data to load
    await programViewPage.assertTeacherDataVisible();
    
    // Export button should be enabled
    await programViewPage.assertExportButtonEnabled();
  });

  test('should display subject count with teacher assignments', async ({ programViewPage }) => {
    // Select a grade level
    await programViewPage.selectGrade('ม.1');
    
    // Get counts
    const subjectCount = await programViewPage.getSubjectCount();
    const teacherNames = await programViewPage.getTeacherNames();
    
    // Subject count should match teacher column count
    expect(teacherNames.length).toBe(subjectCount);
  });
});
