/**
 * @file seed-endpoint.integration.test.ts
 * @description Integration test for the seed-semesters API endpoint
 * 
 * Tests:
 * - Semester creation via API
 * - Idempotency (can run multiple times safely)
 * - Timeslot/config seeding with seedData=true
 * 
 * NOTE: Only runs in development (NODE_ENV=test or development)
 * Requires SEED_SECRET to be set in environment
 */

const SEED_SECRET = process.env.SEED_SECRET || 'test-secret';
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

describe('Seed Semesters API (Integration)', () => {
  // Skip if fetch is not available (integration tests require server + fetch)
  const hasFetch = typeof fetch !== 'undefined';
  // Skip if not in test/dev environment
  const shouldRun = hasFetch && (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development');
  
  beforeAll(() => {
    if (!hasFetch) {
      console.warn('⚠️  Skipping seed endpoint tests (fetch not available - integration tests require a running server)');
    } else if (!shouldRun) {
      console.warn('⚠️  Skipping seed endpoint tests (not in test/dev environment)');
    }
    if (shouldRun && !process.env.SEED_SECRET) {
      console.warn('⚠️  SEED_SECRET not set; using default test secret');
    }
  });

  (shouldRun ? it : it.skip)('should require authentication', async () => {
    const response = await fetch(`${BASE_URL}/api/admin/seed-semesters?years=2567`);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.ok).toBe(false);
    expect(data.error).toBe('Unauthorized');
  });

  (shouldRun ? it : it.skip)('should create semesters when authenticated', async () => {
    const response = await fetch(
      `${BASE_URL}/api/admin/seed-semesters?secret=${SEED_SECRET}&years=2567`
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.results).toBeDefined();
    expect(data.results.length).toBe(2); // 2 semesters (1 & 2) for 1 year

    // Check structure of results
    data.results.forEach((result: any) => {
      expect(result).toHaveProperty('year');
      expect(result).toHaveProperty('semester');
      expect(result).toHaveProperty('created');
      expect(result).toHaveProperty('configId');
      expect(result.year).toBe(2567);
      expect([1, 2]).toContain(result.semester);
      expect(typeof result.created).toBe('boolean');
      expect(typeof result.configId).toBe('string');
    });
  });

  (shouldRun ? it : it.skip)('should be idempotent (can run multiple times)', async () => {
    // Run twice
    const response1 = await fetch(
      `${BASE_URL}/api/admin/seed-semesters?secret=${SEED_SECRET}&years=2567`
    );
    const data1 = await response1.json();

    const response2 = await fetch(
      `${BASE_URL}/api/admin/seed-semesters?secret=${SEED_SECRET}&years=2567`
    );
    const data2 = await response2.json();

    expect(response1.status).toBe(200);
    expect(response2.status).toBe(200);
    expect(data1.ok).toBe(true);
    expect(data2.ok).toBe(true);

    // Second run should show "created: false" for all (already exist)
    const allExist = data2.results.every((r: any) => r.created === false);
    expect(allExist).toBe(true);
  });

  (shouldRun ? it : it.skip)('should seed multiple years', async () => {
    const response = await fetch(
      `${BASE_URL}/api/admin/seed-semesters?secret=${SEED_SECRET}&years=2567,2568`
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.results.length).toBe(4); // 2 years × 2 semesters = 4

    const years = new Set(data.results.map((r: any) => r.year));
    expect(years.has(2567)).toBe(true);
    expect(years.has(2568)).toBe(true);
  });

  (shouldRun ? it : it.skip)('should seed timeslots and config when seedData=true', async () => {
    const response = await fetch(
      `${BASE_URL}/api/admin/seed-semesters?secret=${SEED_SECRET}&years=2569&seedData=true`
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.results.length).toBe(2);

    // Check that timeslots and tableConfig were created
    data.results.forEach((result: any) => {
      expect(result.timeslots).toBeDefined();
      expect(result.timeslots).toBeGreaterThan(0); // Should have timeslots
      expect(result.tableConfig).toBe(true);
    });
  });

  (shouldRun ? it : it.skip)('should default to years 2567,2568 if not specified', async () => {
    const response = await fetch(
      `${BASE_URL}/api/admin/seed-semesters?secret=${SEED_SECRET}`
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.results.length).toBe(4); // 2 years × 2 semesters

    const years = new Set(data.results.map((r: any) => r.year));
    expect(years.has(2567)).toBe(true);
    expect(years.has(2568)).toBe(true);
  });

  (shouldRun ? it : it.skip)('should validate ConfigID format (SEMESTER-YEAR)', async () => {
    const response = await fetch(
      `${BASE_URL}/api/admin/seed-semesters?secret=${SEED_SECRET}&years=2567`
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);

    // Check ConfigID format: should be "1-2567" or "2-2567"
    data.results.forEach((result: any) => {
      expect(result.configId).toMatch(/^\d+-\d{4}$/);
      expect(result.configId).toMatch(new RegExp(`^${result.semester}-${result.year}$`));
    });
  });

  (shouldRun ? it : it.skip)('should handle GET and POST methods identically', async () => {
    const getResponse = await fetch(
      `${BASE_URL}/api/admin/seed-semesters?secret=${SEED_SECRET}&years=2567`,
      { method: 'GET' }
    );
    const getData = await getResponse.json();

    const postResponse = await fetch(
      `${BASE_URL}/api/admin/seed-semesters?secret=${SEED_SECRET}&years=2567`,
      { method: 'POST' }
    );
    const postData = await postResponse.json();

    expect(getResponse.status).toBe(200);
    expect(postResponse.status).toBe(200);
    expect(getData.ok).toBe(postData.ok);
    expect(getData.results.length).toBe(postData.results.length);
  });
});
