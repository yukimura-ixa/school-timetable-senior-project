/**
 * @file visual-smoke.spec.ts
 * @description Visual smoke tests using screenshot comparison
 * 
 * Tests critical pages for visual regressions by comparing screenshots
 * against baseline images. Run with --update-snapshots to update baselines.
        await page.waitForLoadState('networkidle')

        // Wait for any animations to complete
        await page.waitForTimeout(1000)

        // Take full page screenshot
        await expect(page).toHaveScreenshot('home-page.png', {
            fullPage: true,
            animations: 'disabled',
        })
    })

    test('Management - Teachers page visual check', async ({ page }) => {
        await page.goto('/management/teachers')
        await page.waitForLoadState('networkidle')

        // Wait for table to load
        await page.waitForSelector('table', { timeout: 10000 })
        await page.waitForTimeout(1000)

        // Screenshot the main content area (not full page to avoid scrollbar differences)
        await expect(page.locator('main, [role="main"]')).toHaveScreenshot('teachers-management.png', {
            animations: 'disabled',
        })
    })

    test('Management - Subjects page visual check', async ({ page }) => {
        await page.goto('/management/subject')
        await page.waitForLoadState('networkidle')

        await page.waitForSelector('table', { timeout: 10000 })
        await page.waitForTimeout(1000)

        await expect(page.locator('main, [role="main"]')).toHaveScreenshot('subjects-management.png', {
            animations: 'disabled',
        })
    })

    test('Management - Rooms page visual check', async ({ page }) => {
        await page.goto('/management/rooms')
        await page.waitForLoadState('networkidle')

        await page.waitForSelector('table', { timeout: 10000 })
        await page.waitForTimeout(1000)

        await expect(page.locator('main, [role="main"]')).toHaveScreenshot('rooms-management.png', {
            animations: 'disabled',
        })
    })

    test('Schedule Config page visual check', async ({ page }) => {
        await page.goto(`/schedule/${TEST_SEMESTER}/config`)
        await page.waitForLoadState('networkidle')

        await page.waitForSelector('table', { timeout: 10000 })
        await page.waitForTimeout(1000)

        // Screenshot main content
        await expect(page.locator('main, [role="main"]')).toHaveScreenshot('schedule-config.png', {
            animations: 'disabled',
            maxDiffPixels: 200, // Allow more difference for dynamic content
        })
    })

    test('Teacher Arrange page visual check', async ({ page }) => {
        await page.goto(`/schedule/${TEST_SEMESTER}/arrange/teacher`)
        await page.waitForLoadState('networkidle')

        // Wait for key components
        await page.waitForTimeout(2000)

        // Screenshot the main interface
        await expect(page.locator('main, [role="main"]')).toHaveScreenshot('teacher-arrange.png', {
            animations: 'disabled',
            maxDiffPixels: 300, // Teacher arrange has more dynamic content
        })
    })

    test('Dashboard All-Timeslot page visual check', async ({ page }) => {
        await page.goto(`/dashboard/${TEST_SEMESTER}/all-timeslot`)
        await page.waitForLoadState('networkidle')

        await page.waitForSelector('table', { timeout: 10000 })
        await page.waitForTimeout(1000)

        await expect(page.locator('main, [role="main"]')).toHaveScreenshot('dashboard-timeslot.png', {
            animations: 'disabled',
            maxDiffPixels: 200,
        })
    })

    test('Export page visual check', async ({ page }) => {
        await page.goto(`/schedule/${TEST_SEMESTER}/export`)
        await page.waitForLoadState('networkidle')

        await page.waitForTimeout(1000)

        await expect(page.locator('main, [role="main"]')).toHaveScreenshot('export-page.png', {
            animations: 'disabled',
        })
    })
})

test.describe('Visual Smoke Tests - UI Components', () => {

    test('Navigation bar renders correctly', async ({ page }) => {
        await page.goto('/management/teachers')
        await page.waitForLoadState('networkidle')

        // Screenshot just the navigation area
        const nav = page.locator('nav, header').first()
        if (await nav.isVisible({ timeout: 2000 }).catch(() => false)) {
            await expect(nav).toHaveScreenshot('navigation-bar.png', {
                animations: 'disabled',
            })
        }
    })

    test('Data table with pagination visual check', async ({ page }) => {
        await page.goto('/management/teachers')
        await page.waitForLoadState('networkidle')

        await page.waitForSelector('table', { timeout: 10000 })

        // Screenshot the table component
        const table = page.locator('table').first()
        await expect(table).toHaveScreenshot('data-table-teachers.png', {
            animations: 'disabled',
            maxDiffPixels: 150, // Table content may vary
        })
    })

    test('Empty timeslot grid visual check', async ({ page }) => {
        await page.goto(`/schedule/${TEST_SEMESTER}/arrange/teacher`)
        await page.waitForLoadState('networkidle')

        await page.waitForTimeout(2000)

        // Find and screenshot the timeslot grid
        const grid = page.locator('[data-testid="timeslot-grid"]')
        if (await grid.isVisible({ timeout: 2000 }).catch(() => false)) {
            await expect(grid).toHaveScreenshot('timeslot-grid-empty.png', {
                animations: 'disabled',
                maxDiffPixels: 100,
            })
        }
    })
})

test.describe('Visual Smoke Tests - Responsive Design', () => {

    test('Mobile view - Home page', async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 }) // iPhone SE

        await page.goto('/')
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(1000)

        await expect(page).toHaveScreenshot('home-page-mobile.png', {
            fullPage: true,
            animations: 'disabled',
        })
    })

    test('Tablet view - Schedule Config', async ({ page }) => {
        // Set tablet viewport
        await page.setViewportSize({ width: 768, height: 1024 }) // iPad

        await page.goto(`/schedule/${TEST_SEMESTER}/config`)
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(1000)

        await expect(page.locator('main, [role="main"]')).toHaveScreenshot('schedule-config-tablet.png', {
            animations: 'disabled',
            maxDiffPixels: 200,
        })
    })
})

test.describe('Visual Smoke Tests - Dark Mode (if applicable)', () => {

    test('Teachers page in dark mode', async ({ page }) => {
        // Set dark mode color scheme
        await page.emulateMedia({ colorScheme: 'dark' })

        await page.goto('/management/teachers')
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(1000)

        await expect(page.locator('main, [role="main"]')).toHaveScreenshot('teachers-dark-mode.png', {
            animations: 'disabled',
            maxDiffPixels: 150,
        })
    })
})
