import { test, expect } from "./fixtures/admin.fixture"

/**
 * TC-018: All Timeslot Page UX
 * 
 * Verifies the UX improvements for the All Timeslot page:
 * - Read-only banner presence
 * - Export controls visibility based on role
 * - Empty state guidance
 */

test.describe('All Timeslot Page UX', () => {
    const testSemester = '1-2567'

    test('TC-018-01: Admin sees export controls and banner', async ({ authenticatedAdmin }) => {
        const { page } = authenticatedAdmin

        await page.goto(`/dashboard/${testSemester}/all-timeslot`)
        await expect(page.locator('main, body')).toBeVisible({ timeout: 10000 })

        // 1. Verify Read-only banner
        await expect(page.getByText('มุมมองอ่านอย่างเดียว')).toBeVisible()
        await expect(page.getByText('ไปยังหน้าตั้งค่าตาราง')).toBeVisible() // Admin link

        // 2. Verify Export buttons (Admin only)
        // Should see "ส่งออก Excel" button enabled
        const exportBtn = page.getByRole('button', { name: 'ส่งออก Excel' })
        await expect(exportBtn).toBeVisible()
        await expect(exportBtn).toBeEnabled()

        // 3. Verify Menu (Admin only)
        const menuBtn = page.getByLabel('ตัวเลือกส่งออกเพิ่มเติม')
        await expect(menuBtn).toBeEnabled()
    })

    test('TC-018-02: Guest/Non-admin sees restricted view', async ({ browser }) => {
        // Create a fresh context without storage state (Guest)
        const context = await browser.newContext({ storageState: { cookies: [], origins: [] } })
        const page = await context.newPage()

        await page.goto(`http://localhost:3000/dashboard/${testSemester}/all-timeslot`)

        await expect(page.locator('main, body')).toBeVisible({ timeout: 10000 })

        // 1. Verify Read-only banner
        await expect(page.getByText('มุมมองอ่านอย่างเดียว')).toBeVisible()
        // Non-admin specific text
        await expect(page.getByText('กรุณาติดต่อผู้ดูแลระบบ')).toBeVisible()
        // Should NOT see the config link
        await expect(page.getByText('ไปยังหน้าตั้งค่าตาราง')).not.toBeVisible()

        // 2. Verify Export buttons (Disabled/Tooltip)
        // Note: The button might be disabled or wrapped in a tooltip which makes it non-interactive
        // We check if it exists first
        const exportBtn = page.locator('button').filter({ hasText: 'ส่งออก Excel' })
        await expect(exportBtn).toBeVisible()
        await expect(exportBtn).toBeDisabled()

        // 3. Verify Menu (Disabled)
        const menuBtn = page.getByLabel('ตัวเลือกส่งออกเพิ่มเติม')
        await expect(menuBtn).toBeDisabled()

        await context.close()
    })
})
