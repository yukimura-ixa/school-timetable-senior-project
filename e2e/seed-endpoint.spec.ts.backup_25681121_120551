import { test, expect } from '@playwright/test';

/**
 * Seed Semesters API E2E Tests
 * 
 * Tests the /api/admin/seed-semesters endpoint with authentication and data validation.
 * Converted from integration tests to E2E for proper server environment.
 * 
 * Prerequisites:
 * - SEED_SECRET environment variable must be set
 * - Dev/test database should be clean or idempotent
 * 
 * Related: Issue #55 - Integration tests converted to E2E
 */

const SEED_SECRET = process.env.SEED_SECRET || 'test-secret';
const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

test.describe('Seed Semesters API', () => {
  test.beforeAll(async () => {
    if (!process.env.SEED_SECRET) {
      console.warn('⚠️  SEED_SECRET not set in environment; using default test secret');
    }
  });

  test('should require authentication (401 without secret)', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/admin/seed-semesters?years=2567`);
    const data = await response.json();

    expect(response.status()).toBe(401);
    expect(data.ok).toBe(false);
    expect(data.error).toBe('Unauthorized');
  });

  test('should create semesters when authenticated', async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/api/admin/seed-semesters?secret=${SEED_SECRET}&years=2567`
    );
    const data = await response.json();

    expect(response.status()).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.results).toBeDefined();
    expect(data.results.length).toBe(2); // 2 semesters (1 & 2) for 1 year

    // Validate structure of each result
    for (const result of data.results) {
      expect(result).toHaveProperty('year');
      expect(result).toHaveProperty('semester');
      expect(result).toHaveProperty('created');
      expect(result).toHaveProperty('configId');
      expect(result.year).toBe(2567);
      expect([1, 2]).toContain(result.semester);
      expect(typeof result.created).toBe('boolean');
      expect(typeof result.configId).toBe('string');
    }
  });

  test('should be idempotent (can run multiple times safely)', async ({ request }) => {
    // First run
    const response1 = await request.get(
      `${BASE_URL}/api/admin/seed-semesters?secret=${SEED_SECRET}&years=2567`
    );
    const data1 = await response1.json();

    // Second run - should not error, should return existing records
    const response2 = await request.get(
      `${BASE_URL}/api/admin/seed-semesters?secret=${SEED_SECRET}&years=2567`
    );
    const data2 = await response2.json();

    expect(response1.status()).toBe(200);
    expect(response2.status()).toBe(200);
    expect(data1.ok).toBe(true);
    expect(data2.ok).toBe(true);

    // Second run should show "created: false" for all (already exist)
    const allExist = data2.results.every((r: { created: boolean }) => r.created === false);
    expect(allExist).toBe(true);
  });

  test('should seed multiple years correctly', async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/api/admin/seed-semesters?secret=${SEED_SECRET}&years=2567,2568`
    );
    const data = await response.json();

    expect(response.status()).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.results.length).toBe(4); // 2 years × 2 semesters = 4

    // Verify both years are present
    const years = new Set(data.results.map((r: { year: number }) => r.year));
    expect(years.has(2567)).toBe(true);
    expect(years.has(2568)).toBe(true);
  });

  test('should seed timeslots and config when seedData=true', async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/api/admin/seed-semesters?secret=${SEED_SECRET}&years=2569&seedData=true`
    );
    const data = await response.json();

    expect(response.status()).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.results.length).toBe(2);

    // Verify timeslots and tableConfig were created
    for (const result of data.results) {
      expect(result.timeslots).toBeDefined();
      expect(result.timeslots).toBeGreaterThan(0); // Should have timeslots
      expect(result.tableConfig).toBe(true);
    }
  });

  test('should default to years 2567,2568 when not specified', async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/api/admin/seed-semesters?secret=${SEED_SECRET}`
    );
    const data = await response.json();

    expect(response.status()).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.results.length).toBe(4); // 2 years × 2 semesters

    // Verify default years
    const years = new Set(data.results.map((r: { year: number }) => r.year));
    expect(years.has(2567)).toBe(true);
    expect(years.has(2568)).toBe(true);
  });

  test('should validate ConfigID format (SEMESTER-YEAR)', async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/api/admin/seed-semesters?secret=${SEED_SECRET}&years=2567`
    );
    const data = await response.json();

    expect(response.status()).toBe(200);
    expect(data.ok).toBe(true);

    // Validate ConfigID format: should be "1-2567" or "2-2567"
    for (const result of data.results) {
      expect(result.configId).toMatch(/^\d+-\d{4}$/);
      expect(result.configId).toBe(`${result.semester}-${result.year}`);
    }
  });

  test('should handle GET and POST methods identically', async ({ request }) => {
    // GET request
    const getResponse = await request.get(
      `${BASE_URL}/api/admin/seed-semesters?secret=${SEED_SECRET}&years=2567`
    );
    const getData = await getResponse.json();

    // POST request
    const postResponse = await request.post(
      `${BASE_URL}/api/admin/seed-semesters?secret=${SEED_SECRET}&years=2567`
    );
    const postData = await postResponse.json();

    // Both should succeed with same results
    expect(getResponse.status()).toBe(200);
    expect(postResponse.status()).toBe(200);
    expect(getData.ok).toBe(postData.ok);
    expect(getData.results.length).toBe(postData.results.length);
  });
});
