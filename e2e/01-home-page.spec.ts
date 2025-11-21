import { test, expect } from './fixtures/admin.fixture'

test.describe('Home Page Tests', () => {
  test('TC-HOME-001: Homepage loads successfully', async ({ authenticatedAdmin }) => {
    const { page } = authenticatedAdmin

    // Navigate to homepage
    await page.goto('/')

    // Check for main heading or logo
    const heading = page.locator('h1, h2, [role="banner"]').first()
    await expect(heading).toBeVisible({ timeout: 5000 })

    // Take screenshot
    await page.screenshot({
      path: 'test-results/screenshots/01-homepage.png',
      fullPage: true
    })

    console.log('Homepage loaded successfully')
  })

  test('TC-HOME-002: Navigation menu is visible', async ({ authenticatedAdmin }) => {
    const { page } = authenticatedAdmin
    await page.goto('/')

    // Look for navigation menu
    const nav = page.locator('nav, [role="navigation"]').first()
    await expect(nav).toBeVisible({ timeout: 5000 })

    console.log('Navigation menu found')
  })

  test('TC-HOME-003: Protected routes redirect to signin', async ({ page }) => {
    // Test without authentication
    const protectedRoutes = [
      '/schedule',
      '/teachers',
      '/subjects',
      '/classrooms'
    ]

    for (const route of protectedRoutes) {
      // Navigate to protected route
      await page.goto(route)

      // ✅ IMPROVED: Use web-first assertion instead of waitForTimeout
      // Wait for either redirect to signin or auth error message
      await expect(async () => {
        const url = page.url()
        const isOnSignIn = url.includes('/signin') || url.includes('/api/auth')
        expect(isOnSignIn).toBe(true)
      }).toPass({ timeout: 5000 })

      // Take screenshot
      await page.screenshot({
        path: `test-results/screenshots/03-protected-${route.replace(/\//g, '-')}.png`,
        fullPage: true
      })

      // Document the actual behavior
      console.log(`Route ${route} -> ${page.url()}`)
    }
  })
})
